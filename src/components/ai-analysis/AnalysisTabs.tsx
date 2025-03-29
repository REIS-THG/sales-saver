
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DealAnalysisTab } from "./DealAnalysisTab";
import { NextStepsTab } from "./NextStepsTab";
import { AnalysisHistoryTab } from "./AnalysisHistoryTab";
import { Deal, Insight } from "@/types/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { TabHeader } from "./components/TabHeader";

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
  const isMobile = useIsMobile();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full analysis-tabs">
      <div className={`${isMobile ? 'p-2' : 'p-6'}`}>
        <TabsList className="w-full grid grid-cols-3 h-auto min-h-14">
          <TabHeader 
            value="analysis" 
            icon="chart" 
            label="Deal Analysis" 
            mobileLabel="Analysis"
          />
          <TabHeader 
            value="next-steps" 
            icon="arrow" 
            label="Next Step Assistant" 
            mobileLabel="Next Steps"
          />
          <TabHeader 
            value="history" 
            icon="history" 
            label="History"
          />
        </TabsList>
      </div>
      
      <Separator />

      <TabsContent value="analysis" className={`${isMobile ? 'p-3' : 'p-6'}`}>
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

      <TabsContent value="next-steps" className={`${isMobile ? 'p-3' : 'p-6'}`}>
        <NextStepsTab
          deals={deals}
          selectedDeal={selectedDeal}
          onDealSelect={onDealSelect}
          insights={insights}
        />
      </TabsContent>

      <TabsContent value="history" className={`${isMobile ? 'p-3' : 'p-6'}`}>
        <AnalysisHistoryTab
          insights={insights}
          deals={deals}
        />
      </TabsContent>
    </Tabs>
  );
}
