
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Deal, CustomField } from "@/types/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Settings as SettingsIcon } from "lucide-react";
import CreateDealForm from "@/components/deals/CreateDealForm";
import { DealsTable } from "@/components/deals/DealsTable";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchCustomFields = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        navigate("/auth");
        return;
      }

      const { data: fieldsData, error: fieldsError } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("user_id", userId);

      if (fieldsError) throw fieldsError;
      setCustomFields(fieldsData || []);
    } catch (err) {
      console.error("Error fetching custom fields:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch custom fields",
      });
    }
  };

  const fetchDeals = async () => {
    try {
      setError(null);
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        navigate("/auth");
        return;
      }

      const { data: dealsData, error: fetchError } = await supabase
        .from("deals")
        .select("*")
        .eq("user_id", userId)
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
    fetchCustomFields();
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
            <CreateDealForm onDealCreated={fetchDeals} customFields={customFields} />
            <Button variant="ghost" onClick={() => navigate("/settings")}>
              <SettingsIcon className="h-5 w-5 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex items-center gap-2">
          <Switch
            id="custom-fields"
            checked={showCustomFields}
            onCheckedChange={setShowCustomFields}
          />
          <Label htmlFor="custom-fields">Show Custom Fields</Label>
        </div>
        <DealsTable 
          initialDeals={deals} 
          customFields={customFields}
          showCustomFields={showCustomFields}
        />
      </main>
    </div>
  );
};

export default Dashboard;
