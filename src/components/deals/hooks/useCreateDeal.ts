
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Deal, Team } from "@/types/types";
import { validateEmail, validateDates } from "../utils/form-validation";
import { useToast } from "@/components/ui/use-toast";

export const useCreateDeal = (onDealCreated: () => void, onBeforeCreate?: () => Promise<boolean>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newDeal, setNewDeal] = useState({
    deal_name: "",
    company_name: "",
    company_url: "",
    amount: "",
    status: "open" as Deal["status"],
    contact_first_name: "",
    contact_last_name: "",
    contact_email: "",
    notes: "",
    start_date: new Date().toISOString().split('T')[0],
    expected_close_date: "",
    custom_fields: {} as Record<string, string | number | boolean>,
    team_id: null as string | null,
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data: teamData, error: teamsError } = await supabase
        .from("teams")
        .select("*, team_members!inner(user_id)")
        .eq("team_members.user_id", (await supabase.auth.getUser()).data.user?.id);

      if (teamsError) throw teamsError;
      
      setTeams(teamData || []);
    } catch (err) {
      console.error("Error fetching teams:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch teams",
      });
    }
  };

  const handleSubmit = async () => {
    if (onBeforeCreate) {
      const canProceed = await onBeforeCreate();
      if (!canProceed) {
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (!validateEmail(newDeal.contact_email)) {
        throw new Error("Please enter a valid email address");
      }

      const dateError = validateDates(newDeal.start_date, newDeal.expected_close_date);
      if (dateError) {
        throw new Error(dateError);
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const amountAsNumber = parseFloat(newDeal.amount.replace(/,/g, ''));
      if (isNaN(amountAsNumber)) {
        throw new Error("Please enter a valid amount");
      }

      const { error: insertError } = await supabase.from("deals").insert([
        {
          ...newDeal,
          amount: amountAsNumber,
          health_score: 50,
          user_id: user.id,
          team_id: newDeal.team_id,
        },
      ]);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Deal created successfully",
      });

      setNewDeal({
        deal_name: "",
        company_name: "",
        company_url: "",
        amount: "",
        status: "open",
        contact_first_name: "",
        contact_last_name: "",
        contact_email: "",
        notes: "",
        start_date: new Date().toISOString().split('T')[0],
        expected_close_date: "",
        custom_fields: {},
        team_id: null,
      });
      
      onDealCreated();
    } catch (err) {
      console.error("Error creating deal:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create deal";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    teams,
    newDeal,
    setNewDeal,
    handleSubmit
  };
};
