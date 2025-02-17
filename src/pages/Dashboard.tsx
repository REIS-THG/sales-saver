import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Deal, CustomField, User } from "@/types/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Settings as SettingsIcon, BarChart2, Sparkles } from "lucide-react";
import CreateDealForm from "@/components/deals/CreateDealForm";
import { DealsTable } from "@/components/deals/DealsTable";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FREE_DEAL_LIMIT = 5;

const Dashboard = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserData = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", authData.user.id)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      return;
    }

    setUserData(data as User);
  };

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
      
      const typedCustomFields: CustomField[] = (fieldsData || []).map(field => ({
        ...field,
        field_type: field.field_type as "text" | "number" | "boolean" | "date"
      }));
      
      setCustomFields(typedCustomFields);
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

      const typedDeals: Deal[] = (dealsData || []).map((deal) => ({
        id: deal.id,
        deal_name: deal.deal_name,
        company_name: deal.company_name,
        amount: deal.amount,
        status: (deal.status || 'open') as Deal['status'],
        health_score: deal.health_score || 50,
        user_id: deal.user_id,
        created_at: deal.created_at || undefined,
        updated_at: deal.updated_at || undefined,
        start_date: deal.start_date || undefined,
        expected_close_date: deal.expected_close_date || undefined,
        last_contacted: deal.last_contacted || undefined,
        next_action: deal.next_action || undefined,
        contact_email: deal.contact_email || undefined,
        contact_first_name: deal.contact_first_name || undefined,
        contact_last_name: deal.contact_last_name || undefined,
        company_url: deal.company_url || undefined,
        notes: Array.isArray(deal.notes) ? deal.notes : [],
        custom_fields: deal.custom_fields ? (typeof deal.custom_fields === 'string' ? JSON.parse(deal.custom_fields) : deal.custom_fields) : {},
        last_note_at: deal.last_note_at || undefined,
        notes_count: deal.notes_count || 0
      }));

      setDeals(typedDeals);

      // Check if free user has reached deal limit
      if (userData?.subscription_status === 'free' && typedDeals.length >= FREE_DEAL_LIMIT) {
        setShowUpgradeDialog(true);
      }
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

  const handleCreateDeal = async () => {
    if (userData?.subscription_status === 'free' && deals.length >= FREE_DEAL_LIMIT) {
      setShowUpgradeDialog(true);
      return false; // Prevent deal creation
    }
    return true; // Allow deal creation
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      fetchDeals();
      fetchCustomFields();
    }
  }, [userData]);

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
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <div className="flex items-center gap-4">
            <CreateDealForm 
              onDealCreated={fetchDeals} 
              customFields={customFields}
              onBeforeCreate={handleCreateDeal}
            />
            <Button variant="outline" onClick={() => navigate("/deal-genius")}>
              <Sparkles className="h-5 w-5 mr-2" />
              AI Analysis
            </Button>
            <Button variant="ghost" onClick={() => navigate("/reports")}>
              <BarChart2 className="h-5 w-5 mr-2" />
              Reports
            </Button>
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
        {userData?.subscription_status === 'free' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">
              Free plan: {deals.length}/{FREE_DEAL_LIMIT} deals used
            </p>
          </div>
        )}
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
