
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft } from "lucide-react";
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
  sales_approach: 'consultative_selling' | 'solution_selling' | 'transactional_selling' | 'value_based_selling';
  industry: string;
  purpose_notes: string;
  tone_analysis: Record<string, number>;
  word_choice_analysis: Record<string, any>;
  coaching_suggestion?: string;
  communication_template?: string;
  communication_channel?: 'f2f' | 'email' | 'social_media';
}

const DealGenius = () => {
  const [searchParams] = useSearchParams();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // New state for analysis parameters
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

    const typedDeals = data.map(deal => ({
      ...deal,
      status: (deal.status || 'open') as Deal['status'],
      custom_fields: deal.custom_fields as Record<string, string | number | boolean> || {},
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
      setInsights(data as Insight[]);
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
              <Select value={selectedDeal || ''} onValueChange={handleDealChange}>
                <SelectTrigger className="w-full">
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
            </div>

            <div>
              <Select value={salesApproach} onValueChange={(value: Insight['sales_approach']) => setSalesApproach(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sales approach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultative_selling">Consultative Selling</SelectItem>
                  <SelectItem value="solution_selling">Solution Selling</SelectItem>
                  <SelectItem value="transactional_selling">Transactional Selling</SelectItem>
                  <SelectItem value="value_based_selling">Value-based Selling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                placeholder="Industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Textarea
                placeholder="Purpose and Notes"
                value={purposeNotes}
                onChange={(e) => setPurposeNotes(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-4">Tone Analysis</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Formality</label>
                  <Slider
                    value={[formality]}
                    onValueChange={(value) => setFormality(value[0])}
                    max={100}
                    step={1}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Persuasiveness</label>
                  <Slider
                    value={[persuasiveness]}
                    onValueChange={(value) => setPersuasiveness(value[0])}
                    max={100}
                    step={1}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Urgency</label>
                  <Slider
                    value={[urgency]}
                    onValueChange={(value) => setUrgency(value[0])}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>

            <div>
              <Select value={selectedChannel} onValueChange={(value: 'f2f' | 'email' | 'social_media') => setSelectedChannel(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select communication channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="f2f">Face to Face</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                </SelectContent>
              </Select>
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
                  <p className="text-gray-700 mb-4">{insight.content}</p>
                  {insight.coaching_suggestion && insight.confidence_score >= 70 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <h4 className="font-medium text-blue-700">Next Steps:</h4>
                      <p className="text-blue-600">{insight.coaching_suggestion}</p>
                    </div>
                  )}
                  {insight.communication_template && (
                    <div className="mt-2 p-2 bg-green-50 rounded">
                      <h4 className="font-medium text-green-700">Communication Template:</h4>
                      <p className="text-green-600">{insight.communication_template}</p>
                    </div>
                  )}
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
