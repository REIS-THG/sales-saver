
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usageLimits } from "./plans-data";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface UsageStats {
  totalDeals: number;
  aiAnalysesThisMonth: number;
  savedReports: number;
  documentsGenerated: number;
}

interface SubscriptionUsageStatsProps {
  currentPlan: "free" | "pro" | "enterprise";
  userId?: string;
}

export function SubscriptionUsageStats({ currentPlan, userId }: SubscriptionUsageStatsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UsageStats>({
    totalDeals: 0,
    aiAnalysesThisMonth: 0,
    savedReports: 0,
    documentsGenerated: 0,
  });
  const navigate = useNavigate();

  const limits = usageLimits[currentPlan];

  useEffect(() => {
    async function fetchUsageStats() {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Fetch total deals count
        const { data: deals, error: dealsError } = await supabase
          .from("deals")
          .select("id", { count: "exact" })
          .eq("user_id", userId);
          
        if (dealsError) throw dealsError;
        
        // Fetch AI analyses from the current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { data: analyses, error: analysesError } = await supabase
          .from("deal_insights")
          .select("id", { count: "exact" })
          .gte("created_at", startOfMonth.toISOString());
          
        if (analysesError) throw analysesError;
        
        // Fetch saved reports
        const { data: reports, error: reportsError } = await supabase
          .from("report_configurations")
          .select("id", { count: "exact" })
          .eq("user_id", userId);
          
        if (reportsError) throw reportsError;
        
        // Fetch documents generated
        const { data: documents, error: documentsError } = await supabase
          .from("generated_documents")
          .select("id", { count: "exact" })
          .eq("user_id", userId);
          
        if (documentsError) throw documentsError;
        
        setStats({
          totalDeals: deals?.length || 0,
          aiAnalysesThisMonth: analyses?.length || 0,
          savedReports: reports?.length || 0,
          documentsGenerated: documents?.length || 0
        });
        
      } catch (err) {
        console.error("Error fetching usage stats:", err);
        setError("Failed to fetch your usage statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsageStats();
  }, [userId]);

  const calculatePercentage = (used: number, limit: number) => {
    if (limit < 0) return 0; // For unlimited
    return Math.min(Math.round((used / limit) * 100), 100);
  };
  
  const formatLimit = (limit: number) => {
    return limit < 0 ? "Unlimited" : limit.toString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Usage</CardTitle>
          <CardDescription>Loading your current usage statistics...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Usage Statistics</CardTitle>
        <CardDescription>
          {currentPlan === "free" 
            ? "You're on the Free Plan. Upgrade to Pro for unlimited usage." 
            : "You're on the Pro Plan with unlimited features."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Deals</span>
            <span className="text-sm text-muted-foreground">
              {stats.totalDeals} / {formatLimit(limits.deals)}
            </span>
          </div>
          {limits.deals > 0 && (
            <Progress value={calculatePercentage(stats.totalDeals, limits.deals)} className="h-2" />
          )}
          {currentPlan === "free" && stats.totalDeals >= limits.deals && (
            <p className="text-xs text-red-500 mt-1">
              You've reached your deals limit. Upgrade to add more deals.
            </p>
          )}
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-sm font-medium">AI Analyses This Month</span>
            <span className="text-sm text-muted-foreground">
              {stats.aiAnalysesThisMonth} / {formatLimit(limits.aiAnalyses)}
            </span>
          </div>
          {limits.aiAnalyses > 0 && (
            <Progress value={calculatePercentage(stats.aiAnalysesThisMonth, limits.aiAnalyses)} className="h-2" />
          )}
          {currentPlan === "free" && stats.aiAnalysesThisMonth >= limits.aiAnalyses && (
            <p className="text-xs text-red-500 mt-1">
              You've reached your monthly AI analyses limit. Upgrade for unlimited analyses.
            </p>
          )}
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Saved Reports</span>
            <span className="text-sm text-muted-foreground">
              {stats.savedReports} / {formatLimit(limits.savedReports)}
            </span>
          </div>
          {limits.savedReports > 0 && (
            <Progress value={calculatePercentage(stats.savedReports, limits.savedReports)} className="h-2" />
          )}
          {currentPlan === "free" && stats.savedReports >= limits.savedReports && (
            <p className="text-xs text-red-500 mt-1">
              You've reached your saved reports limit. Upgrade to save more reports.
            </p>
          )}
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Documents Generated</span>
            <span className="text-sm text-muted-foreground">
              {stats.documentsGenerated} / {formatLimit(limits.documentGeneration)}
            </span>
          </div>
          {limits.documentGeneration > 0 && (
            <Progress value={calculatePercentage(stats.documentsGenerated, limits.documentGeneration)} className="h-2" />
          )}
          {currentPlan === "free" && (
            <p className="text-xs text-muted-foreground mt-1">
              Document generation is only available on Pro plans and above.
            </p>
          )}
        </div>
        
        {currentPlan === "free" && (
          <Button 
            className="w-full mt-6" 
            onClick={() => window.open("https://buy.stripe.com/28o3eSbhd6W40z63cc", "_blank")}
          >
            Upgrade to Pro for Unlimited Usage
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
