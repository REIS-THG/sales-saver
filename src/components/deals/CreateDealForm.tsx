import React, { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Deal, CustomField } from "@/types/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreateDealFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onBeforeCreate?: () => Promise<boolean>;
  trigger?: React.ReactElement;
  customFields: CustomField[];
  className?: string;
}

export function CreateDealForm({ 
  open: controlledOpen = false,
  onClose: controlledOnClose,
  onSuccess,
  onBeforeCreate,
  trigger,
  customFields,
  className
}: CreateDealFormProps) {
  const [open, setOpen] = useState(controlledOpen);
  const [dealName, setDealName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  
  const onCloseWrapper = useCallback(() => {
    console.log('[CreateDealForm] Close handler triggered');
    if (controlledOnClose) {
      try {
        controlledOnClose();
      } catch (error) {
        console.error('[CreateDealForm] Error in onClose handler:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to close form properly"
        });
      }
    }
    setOpen(false);
  }, [controlledOnClose, toast]);

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

  const handleClose = () => {
    console.log('[CreateDealForm] Handling close');
    setDealName("");
    setCompanyName("");
    setAmount(undefined);
    setIsSubmitting(false);
    onCloseWrapper();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={isControlled ? onCloseWrapper : setOpen}>
      {trigger && React.cloneElement(trigger, { onClick: () => setOpen(true) })}
      <AlertDialogContent className={`${className || ''} ${isMobile ? "w-[95%] max-w-md p-4" : ""}`}>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Deal</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the details for the new deal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="dealName">Deal Name</Label>
            <Input
              type="text"
              id="dealName"
              placeholder="Enter deal name"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              type="text"
              id="companyName"
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              type="number"
              id="amount"
              placeholder="Enter amount"
              value={amount !== undefined ? amount.toString() : ""}
              onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : undefined)}
              required
            />
          </div>
        </form>
        <AlertDialogFooter className={isMobile ? "flex-col gap-2" : ""}>
          <AlertDialogCancel 
            onClick={handleClose}
            className={isMobile ? "w-full mt-0" : ""}
            disabled={isSubmitting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSubmit}
            className={isMobile ? "w-full" : ""}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
