
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CustomFieldForm, CustomFieldFormData } from "./custom-fields/CustomFieldForm";
import { CustomFieldsTable } from "./custom-fields/CustomFieldsTable";

type CustomField = {
  id: string;
  field_name: string;
  field_type: string;
  is_required: boolean;
  created_at: string;
};

export function CustomFieldsManager() {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const { toast } = useToast();

  const fetchCustomFields = async () => {
    const { data, error } = await supabase
      .from("custom_fields")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch custom fields",
        variant: "destructive",
      });
    } else {
      setCustomFields(data || []);
    }
  };

  const handleSubmit = async (values: CustomFieldFormData) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("custom_fields")
      .insert({
        field_name: values.field_name,
        field_type: values.field_type,
        is_required: values.is_required,
        user_id: userId
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create custom field",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Custom field created successfully",
      });
      fetchCustomFields();
    }
  };

  const handleDeleteCustomField = async (fieldId: string) => {
    const { error } = await supabase
      .from("custom_fields")
      .delete()
      .eq("id", fieldId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete custom field",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Custom field deleted successfully",
      });
      fetchCustomFields();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
        <CardDescription>Add custom fields to your deals</CardDescription>
      </CardHeader>
      <CardContent>
        <CustomFieldForm onSubmit={handleSubmit} />
        <div className="mt-6">
          <CustomFieldsTable 
            fields={customFields}
            onDelete={handleDeleteCustomField}
          />
        </div>
      </CardContent>
    </Card>
  );
}
