
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DealAnalysisTab } from "./DealAnalysisTab";
import { NextStepsTab } from "./NextStepsTab";
import { AnalysisHistoryTab } from "./AnalysisHistoryTab";
import { Deal, Insight } from "@/types/types";

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
  onFileUpload
}: AnalysisTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="p-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="analysis">Deal Analysis</TabsTrigger>
          <TabsTrigger value="next-steps">Next Step Assistant</TabsTrigger>
          <TabsTrigger value="history">Analysis History</TabsTrigger>
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
