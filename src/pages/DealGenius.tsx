
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AnalysisForm } from "@/components/deal-genius/AnalysisForm";
import { InsightsList } from "@/components/deal-genius/InsightsList";
import { useDealGenius } from "@/hooks/use-deal-genius";
import { useNavigate } from "react-router-dom";

const DealGenius = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    deals,
    selectedDeal,
    setSelectedDeal,
    insights,
    isLoading,
    isAnalyzing,
    fetchDeals,
    fetchInsights,
    analyzeDeal,
  } = useDealGenius();

  useEffect(() => {
    fetchDeals();
    const dealId = searchParams.get('dealId');
    if (dealId) {
      setSelectedDeal(dealId);
      fetchInsights(dealId);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Deal Genius</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <AnalysisForm
            deals={deals}
            selectedDeal={selectedDeal}
            onDealChange={(dealId) => {
              setSelectedDeal(dealId);
              fetchInsights(dealId);
            }}
            isAnalyzing={isAnalyzing}
            onAnalyze={(params) => {
              if (selectedDeal) {
                analyzeDeal(selectedDeal, params);
              }
            }}
          />

          <InsightsList insights={insights} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default DealGenius;
