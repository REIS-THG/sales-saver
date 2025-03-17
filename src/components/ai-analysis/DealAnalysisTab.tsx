
import * as React from "react";
import { Sparkles, Activity, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Deal, Insight } from "@/types/types";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { DealCard } from "./components/DealCard";
import { AnalysisResultsCard } from "./components/AnalysisResultsCard";
import { SupportingDocumentsSection } from "./components/SupportingDocumentsSection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DealAnalysisTabProps {
  deals: Deal[];
  selectedDeal: string | null;
  isAnalyzing: boolean;
  isAnalysisLimited: boolean;
  onDealSelect: (dealId: string) => void;
  onAnalyze: (dealId: string) => void;
  onFileUpload: (file: File, type: 'transcript' | 'email' | 'voice' | 'audio') => void;
  insights?: Insight[];
  isLoading: boolean;
}

export function DealAnalysisTab({
  deals,
  selectedDeal,
  isAnalyzing,
  isAnalysisLimited,
  onDealSelect,
  onAnalyze,
  onFileUpload,
  insights = [],
  isLoading
}: DealAnalysisTabProps) {
  const selectedDealData = deals.find(deal => deal.id === selectedDeal);

  if (isLoading) {
    return <ReportsLoadingState />;
  }

  const dealInsights = insights.filter(insight => insight.deal_id === selectedDeal);

  // Calculate health score summary
  const getHealthStatus = (score: number) => {
    if (score >= 70) return { status: 'Healthy', color: 'bg-green-100 text-green-800 border-green-300' };
    if (score >= 40) return { status: 'At Risk', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { status: 'Critical', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  const healthStatus = selectedDealData ? getHealthStatus(selectedDealData.health_score) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Deal Selection
          </CardTitle>
          <CardDescription>
            Select a deal to analyze and get AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedDeal || ''} onValueChange={onDealSelect}>
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
        </CardContent>
      </Card>

      {selectedDealData && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Deal Information
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Health Score:</span>
                <Badge variant="outline" className={`${healthStatus?.color} font-medium`}>
                  {selectedDealData.health_score}% - {healthStatus?.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DealCard deal={selectedDealData} />
          </CardContent>
        </Card>
      )}
      
      {dealInsights.length > 0 && (
        <AnalysisResultsCard insights={dealInsights} />
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            Supporting Documents
          </CardTitle>
          <CardDescription>
            Upload additional materials to improve analysis accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupportingDocumentsSection 
            onFileUpload={onFileUpload} 
            isAnalysisLimited={isAnalysisLimited} 
          />
        </CardContent>
      </Card>

      <Button 
        className="w-full h-12 text-base"
        onClick={() => selectedDeal && onAnalyze(selectedDeal)}
        disabled={isAnalyzing || isAnalysisLimited || !selectedDeal}
      >
        <Sparkles className="h-5 w-5 mr-2" />
        {isAnalyzing ? 'Analyzing Deal...' : 'Analyze Deal with AI'}
      </Button>
    </div>
  );
}
