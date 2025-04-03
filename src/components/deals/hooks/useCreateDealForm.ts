
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Deal } from "@/types/types";

interface UseCreateDealFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  onBeforeCreate?: () => Promise<boolean>;
}

export function useCreateDealForm({ onClose, onSuccess, onBeforeCreate }: UseCreateDealFormProps) {
  const [dealName, setDealName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleClose = useCallback(() => {
    console.log('[CreateDealForm] Handling close');
    setDealName("");
    setCompanyName("");
    setAmount(undefined);
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  const createDeal = async (dealData: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('[CreateDealForm] Creating deal with data:', dealData);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('[CreateDealForm] Auth error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }

      if (!authData.user) {
        console.error('[CreateDealForm] No authenticated user found');
        throw new Error("Not authenticated");
      }

      const { error: insertError } = await supabase
        .from("deals")
        .insert([
          {
            ...dealData,
            user_id: authData.user.id,
          },
        ]);

      if (insertError) {
        console.error('[CreateDealForm] Insert error:', insertError);
        throw new Error(insertError.message);
      }

      console.log('[CreateDealForm] Deal created successfully');
      return true;
    } catch (error) {
      console.error("[CreateDealForm] Error creating deal:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[CreateDealForm] Form submission started');
    setIsSubmitting(true);

    try {
      if (!dealName || !companyName || !amount) {
        console.warn('[CreateDealForm] Missing required fields');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields.",
        });
        setIsSubmitting(false);
        return;
      }

      if (onBeforeCreate) {
        console.log('[CreateDealForm] Executing onBeforeCreate hook');
        const canProceed = await onBeforeCreate();
        if (!canProceed) {
          console.log('[CreateDealForm] onBeforeCreate prevented submission');
          setIsSubmitting(false);
          return;
        }
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error('[CreateDealForm] Authentication error:', authError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Not authenticated",
        });
        setIsSubmitting(false);
        return;
      }

      const dealData = {
        deal_name: dealName,
        company_name: companyName,
        amount: amount,
        status: "open" as const,
        health_score: 50,
        notes: '',
        custom_fields: {},
        user_id: authData.user.id,
      };

      await createDeal(dealData);
      
      if (onSuccess) {
        console.log('[CreateDealForm] Triggering onSuccess callback');
        onSuccess();
      }
      
      handleClose();
      toast({
        title: "Success",
        description: "Deal created successfully",
      });
    } catch (error) {
      console.error('[CreateDealForm] Form submission error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    dealName,
    setDealName,
    companyName,
    setCompanyName,
    amount,
    setAmount,
    isSubmitting,
    handleSubmit,
    handleClose
  };
}
