
import { IconCard } from "@/components/ui/icon-card";
import { InfoIcon } from "lucide-react";

interface InfoCardProps {
  title: string;
  content: string;
  onLearnMore?: () => void;
}

export function InfoCard({ title, content, onLearnMore }: InfoCardProps) {
  return (
    <IconCard
      title={title}
      icon={<InfoIcon className="h-5 w-5 text-blue-500" />}
      actionText={onLearnMore ? "Learn More" : undefined}
      onAction={onLearnMore}
      className="bg-white shadow-sm border border-gray-200"
    >
      <p className="text-gray-600 text-sm">{content}</p>
    </IconCard>
  );
}
