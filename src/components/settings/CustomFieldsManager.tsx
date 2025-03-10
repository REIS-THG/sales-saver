
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CustomFieldForm, CustomFieldFormData } from "./custom-fields/CustomFieldForm";
import { CustomFieldsTable } from "./custom-fields/CustomFieldsTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CustomField, CustomFieldType } from "@/types/custom-field";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { Alert, AlertDescription } from "@/components/ui/alert";

type DatabaseCustomField = {
  id: string;
  field_name: string;
  field_type: string;
  is_required: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  default_value?: any;
  allow_multiple?: boolean;
  options?: any[];
  validation_rules?: any;
  placeholder?: string;
  help_text?: string;
  is_active?: boolean;
};

export function CustomFieldsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customFields = [], isLoading: isLoadingFields, error } = useQuery({
    queryKey: ['customFields'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data || []).map((field: DatabaseCustomField): CustomField => ({
        id: field.id,
        field_name: field.field_name,
        field_type: field.field_type as CustomFieldType,
        is_required: field.is_required,
        user_id: field.user_id,
        created_at: field.created_at,
        updated_at: field.updated_at,
        default_value: field.default_value,
        allow_multiple: field.allow_multiple || false,
        options: field.options || [],
        validation_rules: field.validation_rules || {},
        placeholder: field.placeholder,
        help_text: field.help_text,
        is_active: field.is_active || true
      }));
    },
  });

  const createCustomFieldMutation = useMutation({
    mutationFn: async (values: CustomFieldFormData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("custom_fields")
        .insert({
          field_name: values.field_name,
          field_type: values.field_type,
          is_required: values.is_required,
          user_id: userData.user.id,
          default_value: values.default_value,
          allow_multiple: values.allow_multiple,
          options: values.options,
          validation_rules: values.validation_rules,
          help_text: values.help_text,
          placeholder: values.placeholder,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
      toast({
        title: "Success",
        description: "Custom field created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create custom field: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCustomFieldMutation = useMutation({
    mutationFn: async (fieldId: string) => {
      const { error } = await supabase
        .from("custom_fields")
        .delete()
        .eq("id", fieldId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
      toast({
        title: "Success",
        description: "Custom field deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete custom field: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateCustomFieldMutation = useMutation({
    mutationFn: async ({ id, ...values }: Partial<CustomField> & { id: string }) => {
      const { error } = await supabase
        .from("custom_fields")
        .update(values)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
      toast({
        title: "Success",
        description: "Custom field updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update custom field: " + error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoadingFields) {
    return <ReportsLoadingState />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load custom fields: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
        <CardDescription>Add and manage custom fields for your deals</CardDescription>
      </CardHeader>
      <CardContent>
        <CustomFieldForm 
          onSubmit={(values) => createCustomFieldMutation.mutateAsync(values)}
        />
        <div className="mt-6">
          <CustomFieldsTable 
            fields={customFields}
            onDelete={(id) => deleteCustomFieldMutation.mutateAsync(id)}
            onUpdate={(field) => updateCustomFieldMutation.mutateAsync(field)}
            isLoading={createCustomFieldMutation.isPending || deleteCustomFieldMutation.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomFieldsManager;
