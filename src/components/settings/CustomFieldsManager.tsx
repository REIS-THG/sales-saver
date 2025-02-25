
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CustomFieldForm, CustomFieldFormData } from "./custom-fields/CustomFieldForm";
import { CustomFieldsTable } from "./custom-fields/CustomFieldsTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CustomField } from "@/types/custom-field";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CustomFieldsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customFields = [], isLoading, error } = useQuery({
    queryKey: ['customFields'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });

  const createCustomFieldMutation = useMutation({
    mutationFn: async (values: CustomFieldFormData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("custom_fields")
        .insert({
          ...values,
          user_id: userData.user.id,
          is_active: true,
          default_value: values.default_value || null,
          validation_rules: values.validation_rules || {},
          options: values.options || [],
          help_text: values.help_text || null,
          placeholder: values.placeholder || null
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

  if (isLoading) {
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
            isLoading={createCustomFieldMutation.isLoading || deleteCustomFieldMutation.isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
