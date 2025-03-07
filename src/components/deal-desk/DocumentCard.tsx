
import { IconCard } from "@/components/ui/icon-card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface DocumentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onGenerate: (format: 'text' | 'docx' | 'pdf') => void;
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
  const [selectedFormat, setSelectedFormat] = useState<'text' | 'docx' | 'pdf'>('docx');
  
  const formatLabels = {
    'text': 'Text',
    'docx': 'Word Document',
    'pdf': 'PDF Document'
  };
  
  const handleFormatSelect = (format: 'text' | 'docx' | 'pdf') => {
    setSelectedFormat(format);
  };
  
  const handleGenerate = () => {
    onGenerate(selectedFormat);
  };
  
  const actionContent = (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Format: {formatLabels[selectedFormat]}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2">
              <FileText className="h-3.5 w-3.5 mr-1" />
              Format
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleFormatSelect('docx')}>
              Word Document (.docx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFormatSelect('text')}>
              Plain Text (.txt)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button 
        className="w-full" 
        onClick={handleGenerate}
        disabled={isDisabled || isGenerating}
      >
        Generate {title}
      </Button>
    </div>
  );

  return (
    <IconCard
      title={title}
      description={description}
      icon={icon}
      isLoading={isGenerating}
      isDisabled={isDisabled}
      className="bg-white p-0 shadow-sm border border-gray-200"
    >
      {actionContent}
    </IconCard>
  );
}
