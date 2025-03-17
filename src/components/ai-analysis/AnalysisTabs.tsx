
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DealAnalysisTab } from "./DealAnalysisTab";
import { NextStepsTab } from "./NextStepsTab";
import { AnalysisHistoryTab } from "./AnalysisHistoryTab";
import { Deal, Insight } from "@/types/types";
import { BarChart3, ArrowRight, History } from "lucide-react";

interface AnalysisTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  deals: Deal[];
  selectedDeal: string | null;
  isAnalyzing: boolean;
  isAnalysisLimited: boolean;
  insights: Insight[];
  onDealSelect: (dealId: string) => void;
  onAnalyze: (dealId: string) => void;
  onFileUpload: (file: File, type: 'transcript' | 'email' | 'voice' | 'audio') => void;
  isLoading: boolean;
}

export function AnalysisTabs({
  activeTab,
  setActiveTab,
  deals,
  selectedDeal,
  isAnalyzing,
  isAnalysisLimited,
  insights,
  onDealSelect,
  onAnalyze,
  onFileUpload,
  isLoading
}: AnalysisTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="p-6">
        <TabsList className="w-full grid grid-cols-3 h-14">
          <TabsTrigger value="analysis" className="flex items-center gap-2 h-full">
            <BarChart3 className="h-4 w-4" />
            <span>Deal Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="next-steps" className="flex items-center gap-2 h-full">
            <ArrowRight className="h-4 w-4" />
            <span>Next Step Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 h-full">
            <History className="h-4 w-4" />
            <span>Analysis History</span>
          </TabsTrigger>
        </TabsList>
      </div>
      
      <Separator />

      <TabsContent value="analysis" className="p-6">
        <DealAnalysisTab
          deals={deals}
          selectedDeal={selectedDeal}
          isAnalyzing={isAnalyzing}
          isAnalysisLimited={isAnalysisLimited}
          onDealSelect={onDealSelect}
          onAnalyze={onAnalyze}
          onFileUpload={onFileUpload}
          insights={insights}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="next-steps" className="p-6">
        <NextStepsTab
          deals={deals}
          selectedDeal={selectedDeal}
          onDealSelect={onDealSelect}
          insights={insights}
        />
      </TabsContent>

      <TabsContent value="history" className="p-6">
        <AnalysisHistoryTab
          insights={insights}
          deals={deals}
        />
      </TabsContent>
    </Tabs>
  );
}
