
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";
import { Deal, Insight } from "@/types/types";
import { DealSelector } from "@/components/deal-genius/DealSelector";
import { AnalysisParameters } from "@/components/deal-genius/AnalysisParameters";
import { ToneAnalysis } from "@/components/deal-genius/ToneAnalysis";
import { CommunicationChannel } from "@/components/deal-genius/CommunicationChannel";
import { InsightCard } from "@/components/deal-genius/InsightCard";

const DealGenius = () => {
  const [searchParams] = useSearchParams();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Analysis parameters state
  const [salesApproach, setSalesApproach] = useState<Insight['sales_approach']>('consultative_selling');
  const [industry, setIndustry] = useState('');
  const [purposeNotes, setPurposeNotes] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'f2f' | 'email' | 'social_media'>('email');

  // Tone analysis parameters
  const [formality, setFormality] = useState(50);
  const [persuasiveness, setPersuasiveness] = useState(50);
  const [urgency, setUrgency] = useState(50);

  useEffect(() => {
    fetchDeals();
    const dealId = searchParams.get('dealId');
    if (dealId) {
      setSelectedDeal(dealId);
      fetchInsights(dealId);
    }
  }, [searchParams]);

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

    setDeals(data.map(deal => ({
      ...deal,
      name: deal.deal_name,
      value: deal.amount,
      custom_fields: deal.custom_fields as Record<string, any> || {},
    })));
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
      setInsights(data.map(insight => ({
        ...insight,
        priority: insight.priority || 'medium',
        status: insight.status || 'open'
      } as Insight)));
    }
    setIsLoading(false);
  };

  const analyzeDeal = async () => {
    if (!selectedDeal) return;

    setIsAnalyzing(true);
    try {
      const response = await supabase.functions.invoke("analyze-deals", {
        body: {
          dealId: selectedDeal,
          analysisParams: {
            salesApproach,
            industry,
            purposeNotes,
            toneAnalysis: {
              formality,
              persuasiveness,
              urgency,
            },
            communicationChannel: selectedChannel,
          },
        },
      });

      if (response.error) throw new Error("Analysis failed");

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <DealSelector
                deals={deals}
                selectedDeal={selectedDeal}
                onDealChange={(dealId) => {
                  setSelectedDeal(dealId);
                  fetchInsights(dealId);
                }}
              />
            </div>

            <AnalysisParameters
              salesApproach={salesApproach}
              setSalesApproach={setSalesApproach}
              industry={industry}
              setIndustry={setIndustry}
              purposeNotes={purposeNotes}
              setPurposeNotes={setPurposeNotes}
            />

            <ToneAnalysis
              formality={formality}
              setFormality={setFormality}
              persuasiveness={persuasiveness}
              setPersuasiveness={setPersuasiveness}
              urgency={urgency}
              setUrgency={setUrgency}
            />

            <div>
              <CommunicationChannel
                selectedChannel={selectedChannel}
                setSelectedChannel={setSelectedChannel}
              />
            </div>

            <div className="md:col-span-2">
              <Button 
                onClick={analyzeDeal} 
                disabled={!selectedDeal || isAnalyzing}
                className="w-full flex items-center justify-center gap-2"
              >
                {isAnalyzing && <Spinner size="sm" />}
                Analyze Deal
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealGenius;
