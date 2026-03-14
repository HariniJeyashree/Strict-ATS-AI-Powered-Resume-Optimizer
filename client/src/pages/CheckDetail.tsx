import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer, CheckCircle2 } from "lucide-react";

export default function CheckDetail() {
  const { id } = useParams();

  const { data: check, isLoading } = useQuery({
    queryKey: [`/api/checks/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/checks/${id}`);
      return res.json();
    }
  });

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="text-center animate-pulse">
        <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-blue-400 font-black tracking-widest text-xs uppercase">AI Processing</h2>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <div className="max-w-6xl mx-auto p-6 animate-fade-in">
        
        {/* Interactive Header */}
        <div className="flex justify-between items-center mb-12 print:hidden">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all">
            <ArrowLeft size={18} /> BACK
          </Link>
          <button 
            onClick={() => window.print()} 
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2"
          >
            <Printer size={18} /> SAVE AS PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Analysis Results */}
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="text-green-500" size={20} />
                <h2 className="font-black text-xs uppercase tracking-tighter text-slate-400">Missing Skills</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {check?.missingSkills?.map((skill: string) => (
                  <span key={skill} className="bg-orange-50 text-orange-600 border border-orange-100 px-4 py-1.5 rounded-full text-xs font-bold transition-transform hover:scale-105">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* The Paper Resume */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow-[0_30px_100px_rgba(0,0,0,0.05)] rounded-sm p-16 md:p-24 min-h-[1100px] border border-slate-100 relative">
              {/* Paper Texture Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
              
              <div className="max-w-3xl mx-auto relative z-10">
                <pre className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed text-[17px]">
                  {check?.generatedResume}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}