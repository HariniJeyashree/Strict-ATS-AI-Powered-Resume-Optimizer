import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient.js";
import { jsPDF } from "jspdf";
import { 
  History, Send, Loader2, Plus, Download, Zap, Award, Target, FileText, Cpu, ChevronRight
} from "lucide-react";

export default function Home() {
  const [content, setContent] = useState("");
  const [jd, setJd] = useState("");
  const [filename, setFilename] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [status, setStatus] = useState("ANALYZE RESUME");

  // Fetch history with a safety catch to prevent UI vanishing on server error
  const { data: history = [] } = useQuery({
    queryKey: ["/api/history"],
    queryFn: () => fetch("/api/history").then(res => res.json()).catch(() => []),
    retry: false
  });

  const mutation = useMutation({
    mutationFn: async (vars: any) => {
      setStatus("INITIALIZING SCAN...");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vars)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "System Failure");
      }
      setStatus("AI ANALYZING GAPS...");
      return res.json();
    },
    onSuccess: (data) => {
      setStatus("SUCCESS: DATA CAPTURED");
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/history"] });
        setSelected(data);
        setStatus("ANALYSE RESUME");
      }, 800);
    },
    onError: (error: any) => {
      setStatus(`ERROR: ${error.message}`);
      setTimeout(() => setStatus("ANALYSE RESUME"), 3000);
    }
  });

  // Critical Logic: Safely splits the AI text so the UI doesn't crash
  const splitResult = (raw: string) => {
  if (!raw) return { score: "0", feedback: "Analyzing...", resume: "" };

  // 1. Look for the standard [ATS SCORE: 85]
  let scoreMatch = raw.match(/score[:\s-]*(\d+)/i);
  
  // 2. If that fails, just grab the very first number found in the text
  if (!scoreMatch) {
    scoreMatch = raw.match(/(\d+)/);
  }

  // 3. Clean the result: ensure it's just the number, default to 0
  const score = scoreMatch ? scoreMatch[1] : "0";

  const parts = raw.split("---RESUME_START---");
  
  return { 
    score,
    feedback: parts[0].replace(/\[ATS SCORE: \d+\]/i, "").trim(), 
    resume: parts[1] || "" 
  };
};

// Developed by [HARINI JEYASHREE A] — 2026

  const downloadPDF = (name: string, text: string) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("ATS OPTIMIZED RESUME", 10, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 10, 30);
      doc.save(`${name.replace(/\s+/g, '_')}_Optimized.pdf`);
    } catch (err) {
      alert("PDF Generation Failed. Ensure jspdf is installed.");
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans">
      {/* Interactive Loading Overlay */}
      {mutation.isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617]/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-2 border-blue-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
            <Cpu className="absolute inset-0 m-auto text-blue-400 animate-pulse" size={32} />
          </div>
          <h2 className="text-sm font-black tracking-[0.6em] text-white uppercase animate-pulse">{status}</h2>
          <p className="text-slate-500 font-mono text-[9px] mt-4 uppercase tracking-widest">Cross-referencing JD Keywords...</p>
        </div>
      )}

      {/* Sidebar */}
      {/* Sidebar */}
      <aside className="w-64 bg-[#0b1120] border-r border-blue-500/10 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-blue-500/10 flex justify-between items-center">
          <span className="text-blue-400 font-black text-[10px] tracking-[0.2em] flex items-center gap-2">
            <Cpu size={14}/> SYSTEM LOGS
          </span>
          {/* This is the button you mentioned */}
          <button 
            onClick={() => setSelected(null)} 
            className="p-1 hover:bg-blue-500/10 border border-blue-500/20 rounded-md transition-all"
            aria-label="create new scan"
          >
            <Plus size={16}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {history && history.length > 0 ? (
            history.map((h: any) => (
              <button 
                key={h.id} 
                onClick={() => setSelected(h)} 
                className={`w-full text-left p-3 rounded-lg text-xs transition-all ${
                  selected?.id === h.id 
                    ? 'bg-blue-600/20 border border-blue-500/50 text-white shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
                    : 'text-slate-500 hover:bg-slate-800/50'
                }`}
              >
                <div className="font-bold truncate uppercase tracking-tighter">
                  {h.filename || "Untitled Scan"}
                </div>
                <div className="opacity-40 text-[9px] mt-1">
                  {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : 'Recent'}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-[10px] text-slate-600 font-mono italic text-center mt-10">
              No recent scans detected...
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 bg-[radial-gradient(circle_at_top_right,_#1e1b4b_0%,_#020617_60%)]">
        <div className="max-w-6xl mx-auto">
          {selected ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <button onClick={() => setSelected(null)} className="text-cyan-400 font-bold text-[10px] tracking-[0.3em] hover:text-cyan-300 mb-4 flex items-center gap-1">← HOME</button>
                  <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">{selected.filename}</h1>
                </div>
                <div className="text-right">
                   <div className="text-[10px] text-slate-500 font-black tracking-widest uppercase mb-1">ATS MATCH RATING</div>
                   <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                     {splitResult(selected.analysis).score}%
                   </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Feedback Panel */}
                <div className="bg-[#0b1120]/60 backdrop-blur-xl p-8 rounded-[2rem] border border-blue-500/20 shadow-2xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4 opacity-5"><Award size={100}/></div>
                  <h3 className="text-blue-400 font-black text-[10px] tracking-widest mb-6 uppercase flex items-center gap-2"><Award size={14}/> Resume Analysis</h3>
                  <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono italic">
                    {splitResult(selected.analysis).feedback}
                  </div>
                </div>

                {/* Optimized Resume Panel */}
                <div className="bg-[#0b1120]/60 backdrop-blur-xl p-8 rounded-[2rem] border border-cyan-500/20 shadow-2xl relative">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-cyan-400 font-black text-[10px] tracking-widest uppercase flex items-center gap-2"><Zap size={14} className="fill-cyan-400"/> Optimized Resume</h3>
                    <button 
                      onClick={() => downloadPDF(selected.filename, splitResult(selected.analysis).resume)}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(8,145,178,0.3)] active:scale-95"
                    >
                      <Download size={14}/> PDF
                    </button>
                  </div>
                  <div className="bg-black/40 p-6 rounded-2xl h-[500px] overflow-y-auto border border-white/5 text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all">
                    {splitResult(selected.analysis).resume}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Input Section */
            <div className="space-y-12 max-w-4xl mx-auto">
              <header className="text-center space-y-4">
                <h1 className="text-8xl font-black text-white tracking-tighter italic">STRICT <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">ATS</span></h1>
                <p className="text-slate-500 font-mono text-[10px] tracking-[0.6em] uppercase">Recruiter Logic v4.2 // Neural Analysis Active</p>
              </header>

              <div className="bg-[#0b1120] p-10 rounded-[3rem] border border-blue-500/10 shadow-2xl space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase ml-4">Target Application</label>
                  <input placeholder="E.G. SENIOR GOOGLE ENGINEER" className="w-full bg-[#020617] border border-blue-500/20 p-5 rounded-2xl text-white font-bold outline-none focus:border-cyan-500/50 transition-all uppercase placeholder:opacity-20" value={filename} onChange={e => setFilename(e.target.value)} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-blue-500 tracking-[0.3em] uppercase ml-2 flex items-center gap-2"><FileText size={12}/> Source Resume</label>
                    <textarea placeholder="Paste plain text resume content..." className="w-full bg-[#020617] border border-blue-500/10 p-6 rounded-[2rem] h-80 outline-none text-slate-400 text-sm focus:border-blue-500/50 transition-all resize-none" value={content} onChange={e => setContent(e.target.value)} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-cyan-500 tracking-[0.3em] uppercase ml-2 flex items-center gap-2"><Target size={12}/> Job Description</label>
                    <textarea placeholder="Paste target requirements and responsibilities..." className="w-full bg-[#020617] border border-cyan-500/10 p-6 rounded-[2rem] h-80 outline-none text-slate-400 text-sm focus:border-cyan-500/50 transition-all resize-none" value={jd} onChange={e => setJd(e.target.value)} />
                  </div>
                </div>

                <button 
                  disabled={mutation.isPending || !content || !jd}
                  onClick={() => {
                    console.log("Initializing AI Request...");
                    mutation.mutate({ content, filename, jd });
                  }}
                  className={`w-full py-6 rounded-3xl font-black text-white tracking-[0.4em] transition-all transform active:scale-95 flex items-center justify-center gap-3
                    ${mutation.isPending 
                      ? "bg-slate-800 opacity-50 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 shadow-[0_0_40px_rgba(37,99,235,0.2)] hover:shadow-[0_0_60px_rgba(34,211,238,0.4)]"
                    }`}
                >
                  {mutation.isPending ? <Loader2 className="animate-spin" /> : <Zap size={18}/>}
                  {status}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}