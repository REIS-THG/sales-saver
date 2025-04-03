
import React from "react";
import { AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface DealFormFooterProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.MouseEvent) => void;
  isMobile: boolean;
}

export function DealFormFooter({
  isSubmitting,
  onCancel,
  onSubmit,
  isMobile,
}: DealFormFooterProps) {
  return (
    <>
      <AlertDialogCancel 
        onClick={onCancel}
        className={isMobile ? "w-full mt-0" : ""}
        disabled={isSubmitting}
      >
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction 
        onClick={onSubmit}
        className={isMobile ? "w-full" : ""}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create'}
      </AlertDialogAction>
    </>
  );
}
