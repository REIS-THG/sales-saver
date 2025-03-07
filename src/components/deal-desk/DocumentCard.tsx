
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DocumentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onGenerate: () => void;
  isGenerating: boolean;
  isDisabled: boolean;
}

export function DocumentCard({
  title,
  description,
  icon,
  onGenerate,
  isGenerating,
  isDisabled
}: DocumentCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-4">
        {description}
      </p>
      <Button 
        className="w-full" 
        onClick={onGenerate}
        disabled={isDisabled || isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Generating...
          </>
        ) : (
          `Generate ${title}`
        )}
      </Button>
    </div>
  );
}
