
import { Bot } from "lucide-react";

interface NoteAnalysisProps {
  analysis: any;
}

export const NoteAnalysis = ({ analysis }: NoteAnalysisProps) => {
  if (!analysis) return null;

  return (
    <div className="mt-2 space-y-2 bg-slate-50 p-3 rounded-md">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Bot className="h-4 w-4" />
        <span className="font-medium">AI Analysis</span>
      </div>
      {analysis.next_actions && (
        <div className="pl-6">
          <p className="text-sm font-medium text-slate-700">Recommended Next Actions:</p>
          <ul className="list-disc pl-4 text-sm text-slate-600">
            {typeof analysis.next_actions === 'string' 
              ? <li>{analysis.next_actions}</li>
              : analysis.next_actions.map((action: string, i: number) => (
                  <li key={i}>{action}</li>
                ))
            }
          </ul>
        </div>
      )}
      {analysis.key_points && (
        <div className="pl-6">
          <p className="text-sm font-medium text-slate-700">Key Points:</p>
          <ul className="list-disc pl-4 text-sm text-slate-600">
            {typeof analysis.key_points === 'string'
              ? <li>{analysis.key_points}</li>
              : analysis.key_points.map((point: string, i: number) => (
                  <li key={i}>{point}</li>
                ))
            }
          </ul>
        </div>
      )}
    </div>
  );
};
