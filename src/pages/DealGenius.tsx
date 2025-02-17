import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, FileText, Mail, Mic } from "lucide-react";
import { AnalysisForm } from "@/components/deal-genius/AnalysisForm";
import { InsightsList } from "@/components/deal-genius/InsightsList";
import { useDealGenius } from "@/hooks/use-deal-genius";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUploader } from "@/components/deal-genius/FileUploader";
import { ToneAnalysis } from "@/components/deal-genius/ToneAnalysis";
import { CommunicationChannel } from "@/components/deal-genius/CommunicationChannel";

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
    error,
    analysisCount,
    subscriptionTier,
    fetchDeals,
    fetchInsights,
    analyzeDeal,
    handleFileUpload,
  } = useDealGenius();

  const [activeTab, setActiveTab] = useState<string>("analysis");
  const [formality, setFormality] = useState(50);
  const [persuasiveness, setPersuasiveness] = useState(50);
  const [urgency, setUrgency] = useState(50);
  const [selectedChannel, setSelectedChannel] = useState<'f2f' | 'email' | 'social_media'>('email');

  useEffect(() => {
    fetchDeals();
    const dealId = searchParams.get('dealId');
    if (dealId) {
      setSelectedDeal(dealId);
      fetchInsights(dealId);
    }
  }, [searchParams]);

  const isAnalysisLimited = subscriptionTier === 'free' && analysisCount >= 1;

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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Analysis</h1>
              <p className="text-sm text-gray-500">
                Analyze your deals with advanced AI insights
              </p>
            </div>
          </div>
          
          {subscriptionTier === 'free' && (
            <Button
              variant="outline"
              onClick={() => navigate("/settings/subscription")}
              className="gap-2"
            >
              Upgrade to Pro
              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                Get Unlimited Analysis
              </span>
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isAnalysisLimited && (
          <Alert className="mb-6">
            <AlertTitle>Analysis Limit Reached</AlertTitle>
            <AlertDescription>
              You've reached your free analysis limit. Upgrade to Pro for unlimited analysis and additional features.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-lg shadow">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="p-6">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="analysis">Deal Analysis</TabsTrigger>
                <TabsTrigger value="output">Analysis Output</TabsTrigger>
                <TabsTrigger value="history">Analysis History</TabsTrigger>
              </TabsList>
            </div>
            
            <Separator />

            <TabsContent value="analysis" className="p-6">
              <div className="space-y-6">
                <AnalysisForm
                  deals={deals}
                  selectedDeal={selectedDeal}
                  onDealChange={(dealId) => {
                    setSelectedDeal(dealId);
                    fetchInsights(dealId);
                  }}
                  isAnalyzing={isAnalyzing}
                  isLoading={isLoading}
                  isLimited={isAnalysisLimited}
                  onAnalyze={(params) => {
                    if (selectedDeal) {
                      analyzeDeal(selectedDeal, {
                        ...params,
                        toneAnalysis: {
                          formality,
                          persuasiveness,
                          urgency,
                        },
                        communicationChannel: selectedChannel,
                      });
                    }
                  }}
                />

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Supporting Documents</CardTitle>
                    <CardDescription>
                      Upload supporting materials for better analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FileUploader
                        icon={<FileText className="h-6 w-6" />}
                        title="Call Transcripts"
                        description="Upload call recordings or transcripts"
                        accept=".txt,.doc,.docx,.pdf"
                        onUpload={(file) => handleFileUpload(file, 'transcript')}
                        isDisabled={isAnalysisLimited}
                      />
                      <FileUploader
                        icon={<Mail className="h-6 w-6" />}
                        title="Email Threads"
                        description="Upload email correspondence"
                        accept=".eml,.msg,.txt"
                        onUpload={(file) => handleFileUpload(file, 'email')}
                        isDisabled={isAnalysisLimited}
                      />
                      <FileUploader
                        icon={<Mic className="h-6 w-6" />}
                        title="Voice Recordings"
                        description="Upload voice notes or calls"
                        accept=".mp3,.wav,.m4a"
                        onUpload={(file) => handleFileUpload(file, 'voice')}
                        isDisabled={isAnalysisLimited}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="output" className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Settings</CardTitle>
                  <CardDescription>
                    Customize how you want to communicate the next steps
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ToneAnalysis
                    formality={formality}
                    setFormality={setFormality}
                    persuasiveness={persuasiveness}
                    setPersuasiveness={setPersuasiveness}
                    urgency={urgency}
                    setUrgency={setUrgency}
                  />
                  <div className="mt-6">
                    <label className="text-sm font-medium mb-2 block">
                      Communication Channel
                    </label>
                    <CommunicationChannel
                      selectedChannel={selectedChannel}
                      setSelectedChannel={setSelectedChannel}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6">
                <InsightsList 
                  insights={insights} 
                  isLoading={isLoading}
                  showConfidence={false}
                />
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-6">
              <InsightsList 
                insights={insights} 
                isLoading={isLoading}
                showConfidence={false}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DealGenius;
