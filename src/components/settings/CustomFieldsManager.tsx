
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CustomFieldsManagerUI } from "./custom-fields/CustomFieldsManagerUI";

export function CustomFieldsManager() {
  const { toast } = useToast();

  const handleError = (error: Error) => {
    console.error("Custom field error:", error);
    toast({
      variant: "destructive",
      title: "Error with custom fields",
      description: error.message || "An unexpected error occurred"
    });
  };

  return (
    <CustomFieldsManagerUI />
  );
}

export default CustomFieldsManager;
