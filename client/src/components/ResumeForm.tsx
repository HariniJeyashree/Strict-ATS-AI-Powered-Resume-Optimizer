import { useState } from "react";

interface Props {
  onSubmit: (resume: string, job: string) => void;
}

export default function ResumeForm({ onSubmit }: Props) {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="border p-4 h-40 rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Paste your Resume here..."
        onChange={(e) => setResume(e.target.value)}
        value={resume}
      />
      <textarea
        className="border p-4 h-40 rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Paste the Job Description here..."
        onChange={(e) => setJob(e.target.value)}
        value={job}
      />
      <button 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors"
        onClick={() => onSubmit(resume, job)}
      >
        Analyze Resume
      </button>
    </div>
  );
}