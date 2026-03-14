import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Download, ArrowRight, CheckCircle, Award, FileText, ArrowLeft } from 'lucide-react';

interface AnalysisData {
  score: number;
  missingSkills: string[];
  optimizedContent: string;
}

export default function ResultView({ data }: { data: AnalysisData }) {
  const [view, setView] = useState<'analysis' | 'resume'>('analysis');
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const element = resumeRef.current;
    
    if (!element) {
      console.error("Resume element not found");
      return;
    }

    const opt = {
      margin: 10,
      filename: 'Optimized_Resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // This specific syntax bypasses the legacy library's TypeScript errors
    try {
      (html2pdf() as any).set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Generation Error:", err);
      // Fallback for some environments
      (html2pdf as any)(element, opt);
    }
  };

  if (view === 'analysis') {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-fade-in">
        {/* Score Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl mb-8">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-6xl font-black text-white mb-2">{data.score}%</h2>
          <p className="text-slate-400 text-sm uppercase tracking-[0.2em] font-semibold">Match Score</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Missing Skills Card */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
            <h3 className="text-orange-400 font-bold flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5" /> MISSING KEYWORDS
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.missingSkills.length > 0 ? (
                data.missingSkills.map((skill, i) => (
                  <span key={i} className="bg-orange-500/10 text-orange-300 border border-orange-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-slate-500 italic">No missing skills detected!</p>
              )}
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-indigo-600 p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-xl">
            <FileText className="w-12 h-12 text-white/80 mb-4" />
            <h3 className="text-white font-bold text-2xl mb-2">Build Final Draft</h3>
            <p className="text-indigo-100 mb-6 text-sm">We've integrated the keywords into a professional layout.</p>
            <button 
              onClick={() => setView('resume')}
              className="w-full bg-white text-indigo-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-lg active:scale-95"
            >
              Show My Resume <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 animate-slide-up">
      {/* Resume Navigation Header */}
      <div className="flex justify-between items-center mb-8 no-print">
        <button 
          onClick={() => setView('analysis')} 
          className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Analysis
        </button>
        <button 
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold shadow-xl transition-all active:scale-95"
        >
          <Download className="w-5 h-5" /> Save as PDF
        </button>
      </div>

      {/* The Actual Resume Document */}
      <div className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.3)] mx-auto mb-20 overflow-hidden rounded-sm" style={{ width: '210mm' }}>
        <div 
          ref={resumeRef} 
          id="resume-content" 
          className="p-[25mm] text-black bg-white min-h-[297mm] leading-relaxed"
        >
          <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-800">
            <ReactMarkdown>{data.optimizedContent}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}