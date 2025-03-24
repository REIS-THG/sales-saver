
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  FileSearch,
  MessageSquare,
  PieChart,
  Mail,
  Lightbulb,
  Shield,
  Mic,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CapabilityCard = ({
  icon,
  title,
  description,
  toolTip
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  toolTip: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center p-4 border rounded-lg bg-white hover:bg-blue-50 transition-colors duration-200 cursor-help">
          <div className="mb-2 text-blue-600">{icon}</div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-gray-500 text-center mt-1">{description}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-[250px]">
        <p className="text-sm">{toolTip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function AICapabilitiesExplainer() {
  const capabilities = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Deal Intelligence",
      description: "Analyzes deal health and potential",
      toolTip: "AI evaluates your deal data to identify risks, opportunities, and recommended actions, providing a health score."
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Note Analysis",
      description: "Extracts insights from your notes",
      toolTip: "Automatically analyzes the content of your notes to identify key points, sentiment, and next steps."
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Message Generation",
      description: "Creates follow-up messages",
      toolTip: "Generate personalized email, message, or call scripts based on deal context and analysis."
    },
    {
      icon: <PieChart className="h-6 w-6" />,
      title: "Performance Insights",
      description: "Identifies sales trends",
      toolTip: "Analyzes your performance data to highlight patterns and suggest improvements to your sales approach."
    },
    {
      icon: <FileSearch className="h-6 w-6" />,
      title: "Document Analysis",
      description: "Extracts data from documents",
      toolTip: "Upload documents for AI to extract and analyze information relevant to your deals."
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Coaching Suggestions",
      description: "Provides improvement tips",
      toolTip: "Personalized coaching suggestions to help improve your sales approach based on analysis."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Risk Detection",
      description: "Identifies potential issues",
      toolTip: "Proactively detects potential risks in your deals based on patterns and data analysis."
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Call Analysis",
      description: "Analyzes conversation content",
      toolTip: "Upload call recordings for AI to analyze conversation flow, topics discussed, and sentiment."
    },
  ];

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle>AI Capabilities</CardTitle>
        <CardDescription>
          Discover how our AI can help you analyze deals and improve your sales process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {capabilities.map((capability, index) => (
            <CapabilityCard
              key={index}
              icon={capability.icon}
              title={capability.title}
              description={capability.description}
              toolTip={capability.toolTip}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
