
import React, { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { CustomField } from "@/types/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateDealForm } from "./hooks/useCreateDealForm";
import { DealFormFields } from "./components/DealFormFields";
import { DealFormFooter } from "./components/DealFormFooter";

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
  const isMobile = useIsMobile();
  const { toast } = useToast();

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

  const {
    dealName,
    setDealName,
    companyName,
    setCompanyName,
    amount,
    setAmount,
    isSubmitting,
    handleSubmit,
    handleClose
  } = useCreateDealForm({
    onClose: onCloseWrapper,
    onSuccess,
    onBeforeCreate
  });

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
          <DealFormFields
            dealName={dealName}
            companyName={companyName}
            amount={amount}
            onDealNameChange={setDealName}
            onCompanyNameChange={setCompanyName}
            onAmountChange={setAmount}
          />
        </form>
        <AlertDialogFooter className={isMobile ? "flex-col gap-2" : ""}>
          <DealFormFooter
            isSubmitting={isSubmitting}
            onCancel={handleClose}
            onSubmit={handleSubmit}
            isMobile={isMobile}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
