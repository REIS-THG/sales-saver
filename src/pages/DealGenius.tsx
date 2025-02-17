
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Deal } from "@/types/types";

interface Insight {
  id: string;
  deal_id: string;
  insight_type: 'opportunity' | 'risk' | 'action' | 'trend';
  content: string;
  confidence_score: number;
  created_at: string;
}

const DealGenius = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch deals",
      });
      return;
    }

    // Type cast the status to ensure it matches the Deal interface
    const typedDeals = data.map(deal => ({
      ...deal,
      status: (deal.status || 'open') as 'open' | 'stalled' | 'won' | 'lost'
    }));

    setDeals(typedDeals);
  };

  const fetchInsights = async (dealId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("deal_insights")
      .select("*")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch insights",
      });
    } else if (data) {
      // Type cast the insight_type to ensure it matches the Insight interface
      const typedInsights = data.map(insight => ({
        ...insight,
        insight_type: insight.insight_type as 'opportunity' | 'risk' | 'action' | 'trend'
      }));
      setInsights(typedInsights);
    }
    setIsLoading(false);
  };

  const analyzeDeal = async () => {
    if (!selectedDeal) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: selectedDeal }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      await fetchInsights(selectedDeal);
      toast({
        title: "Success",
        description: "Deal analysis completed",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze deal",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDealChange = (dealId: string) => {
    setSelectedDeal(dealId);
    fetchInsights(dealId);
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-50 border-green-200';
      case 'risk':
        return 'bg-red-50 border-red-200';
      case 'action':
        return 'bg-blue-50 border-blue-200';
      case 'trend':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Deal Genius</h1>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4 mb-6">
            <Select value={selectedDeal || ''} onValueChange={handleDealChange}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a deal to analyze" />
              </SelectTrigger>
              <SelectContent>
                {deals.map((deal) => (
                  <SelectItem key={deal.id} value={deal.id}>
                    {deal.deal_name} - {deal.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={analyzeDeal} 
              disabled={!selectedDeal || isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing && <Spinner size="sm" />}
              Analyze Deal
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <Card 
                  key={insight.id}
                  className={`p-4 border-2 ${getInsightColor(insight.insight_type)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium capitalize">{insight.insight_type}</h3>
                    <span className="text-sm text-gray-500">
                      Confidence: {insight.confidence_score}%
                    </span>
                  </div>
                  <p className="text-gray-700">{insight.content}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealGenius;
