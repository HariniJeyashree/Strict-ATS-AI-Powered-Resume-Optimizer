import { useChecks } from "../hooks/use-checks.js";
import { Link } from "react-router-dom";

export default function History() {
  const { data: checks, isLoading } = useChecks();

  if (isLoading) return <p className="p-8">Loading history...</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Previous Scans</h1>
      <div className="grid gap-4">
        {checks?.map((check) => (
          <Link 
            key={check.id} 
            to={`/check/${check.id}`}
            className="block p-4 border rounded hover:bg-gray-50 transition"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-600">View Result #{check.id}</span>
              <span className="text-gray-400 text-sm">
                {new Date(check.createdAt!).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
        {checks?.length === 0 && <p>No history found yet. Try analyzing a resume!</p>}
      </div>
    </div>
  );
}