
import React, { useState } from "react";
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

interface CreateDealFormProps {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onBeforeCreate?: () => Promise<boolean>;
  trigger?: React.ReactElement;
  customFields: CustomField[];
}

export function CreateDealForm({ 
  open: controlledOpen,
  onClose: controlledOnClose,
  onSuccess,
  onBeforeCreate,
  trigger,
  customFields 
}: CreateDealFormProps) {
  const [open, setOpen] = useState(false);
  const [dealName, setDealName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const { toast } = useToast();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const onClose = controlledOnClose || (() => setOpen(false));

  const createDeal = async (dealData: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from("deals")
        .insert([
          {
            ...dealData,
            user_id: authData.user.id,
          },
        ]);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Error creating deal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create deal. Please try again.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dealName || !companyName || !amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }

    if (onBeforeCreate) {
      const canProceed = await onBeforeCreate();
      if (!canProceed) {
        return;
      }
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Not authenticated",
      });
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
    onSuccess?.();
    handleClose();
    toast({
      title: "Success",
      description: "Deal created successfully",
    });
  };

  const handleClose = () => {
    setDealName("");
    setCompanyName("");
    setAmount(undefined);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={isControlled ? onClose : setOpen}>
      {trigger && React.cloneElement(trigger, { onClick: () => setOpen(true) })}
      <AlertDialogContent>
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
            />
          </div>
        </form>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction type="submit" onClick={handleSubmit}>
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
