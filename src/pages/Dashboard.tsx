
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Deal } from "@/types/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LogOut } from "lucide-react";
import CreateDealForm from "@/components/deals/CreateDealForm";
import { DealsTable } from "@/components/deals/DealsTable";

const Dashboard = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchDeals = async () => {
    try {
      setError(null);
      const { data: dealsData, error: fetchError } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const typedDeals = (dealsData || []).map((deal) => ({
        id: deal.id,
        user_id: deal.user_id,
        deal_name: deal.deal_name,
        company_name: deal.company_name,
        amount: deal.amount,
        status: deal.status as Deal["status"],
        health_score: deal.health_score || 50,
        last_contacted: deal.last_contacted || null,
        next_action: deal.next_action || null,
        created_at: deal.created_at,
        updated_at: deal.updated_at,
        contact_first_name: deal.contact_first_name || "",
        contact_last_name: deal.contact_last_name || "",
        contact_email: deal.contact_email || "",
        source: deal.source || "",
        start_date: deal.start_date || new Date().toISOString(),
        expected_close_date: deal.expected_close_date || "",
        custom_fields: deal.custom_fields as Record<string, string | number | boolean> | null,
      }));

      setDeals(typedDeals);
    } catch (err) {
      console.error("Error fetching deals:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch deals");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch deals. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error && !deals.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDeals}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <div className="flex items-center gap-4">
            <CreateDealForm onDealCreated={fetchDeals} />
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DealsTable initialDeals={deals} />
      </main>
    </div>
  );
};

export default Dashboard;
