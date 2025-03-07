
import { IconCard } from "@/components/ui/icon-card";

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
    <IconCard
      title={title}
      description={description}
      icon={icon}
      actionText={`Generate ${title}`}
      onAction={onGenerate}
      isLoading={isGenerating}
      isDisabled={isDisabled}
      className="bg-white p-0 shadow-sm border border-gray-200"
    />
  );
}
