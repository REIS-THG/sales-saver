
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisTabs } from "@/components/ai-analysis/AnalysisTabs";
import { Deal, Insight } from "@/types/types";
import { AnalysisSettingsPanel } from "@/components/ai-analysis/AnalysisSettingsPanel";

interface AnalysisContentProps {
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
  piiFilter: boolean;
  setPiiFilter: (value: boolean) => void;
  retainAnalysis: boolean;
  setRetainAnalysis: (value: boolean) => void;
  subscriptionTier: string;
}

export function AnalysisContent({
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
  isLoading,
  piiFilter,
  setPiiFilter,
  retainAnalysis,
  setRetainAnalysis,
  subscriptionTier
}: AnalysisContentProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <h2 className="text-xl font-semibold tracking-tight">AI-Powered Deal Intelligence</h2>
          <p className="text-muted-foreground mt-1">
            Analyze your deals, get next step recommendations, and track progress over time
          </p>
        </div>
        
        <AnalysisSettingsPanel
          piiFilter={piiFilter}
          setPiiFilter={setPiiFilter}
          retainAnalysis={retainAnalysis}
          setRetainAnalysis={setRetainAnalysis}
          subscriptionTier={subscriptionTier}
        />

        <AnalysisTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          deals={deals}
          selectedDeal={selectedDeal}
          isAnalyzing={isAnalyzing}
          isAnalysisLimited={isAnalysisLimited}
          insights={insights}
          onDealSelect={onDealSelect}
          onAnalyze={onAnalyze}
          onFileUpload={onFileUpload}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
