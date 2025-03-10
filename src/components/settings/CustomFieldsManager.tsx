
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomField, CustomFieldType, CustomFieldOption } from "@/types/custom-field";
import { supabase } from "@/integrations/supabase/client";
import { CustomFieldsTable } from "./custom-fields/CustomFieldsTable";
import { CustomFieldForm } from "./custom-fields/CustomFieldForm";

export function CustomFieldsManager() {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    setIsLoading(true);
    try {
      const { data: fields, error } = await supabase
        .from('custom_fields')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the database response to match our CustomField type
      const typedFields: CustomField[] = fields?.map(field => ({
        id: field.id,
        field_name: field.field_name,
        field_type: field.field_type as CustomFieldType,
        is_required: field.is_required || false,
        created_at: field.created_at,
        updated_at: field.updated_at,
        user_id: field.user_id,
        allow_multiple: field.allow_multiple || false,
        custom_fields: field.custom_fields || {},
        options: Array.isArray(field.options) 
          ? field.options.map((opt: any) => ({
              label: opt.label || "",
              value: opt.value || ""
            })) as CustomFieldOption[]
          : [],
        validation_rules: field.validation_rules || {},
        health_score: field.health_score || 0,
        default_value: field.default_value,
        placeholder: field.placeholder || "",
        help_text: field.help_text || "",
        is_active: field.is_active !== undefined ? field.is_active : true
      })) || [];
      
      setCustomFields(typedFields);
    } catch (error: any) {
      toast({
        title: "Error fetching custom fields",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateField = async (field: Omit<CustomField, 'id'>) => {
    try {
      // Ensure options are properly formatted before sending to DB
      const processedOptions = field.options?.map(opt => ({
        label: opt.label || "",
        value: opt.value || ""
      }));

      const { data, error } = await supabase
        .from('custom_fields')
        .insert([{
          field_name: field.field_name,
          field_type: field.field_type,
          is_required: field.is_required || false,
          // Only include these if they're actually present in the database schema
          options: processedOptions,
          default_value: field.default_value,
          placeholder: field.placeholder,
          help_text: field.help_text
        }])
        .select()
        .single();

      if (error) throw error;

      // Transform the returned data to match CustomField type
      const typedField: CustomField = {
        id: data.id,
        field_name: data.field_name,
        field_type: data.field_type as CustomFieldType,
        is_required: data.is_required || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id,
        allow_multiple: data.allow_multiple || false,
        custom_fields: data.custom_fields || {},
        options: Array.isArray(data.options) 
          ? data.options.map((opt: any) => ({
              label: opt.label || "",
              value: opt.value || ""
            })) as CustomFieldOption[]
          : [],
        validation_rules: data.validation_rules || {},
        health_score: data.health_score || 0,
        default_value: data.default_value,
        placeholder: data.placeholder || "",
        help_text: data.help_text || "",
        is_active: data.is_active !== undefined ? data.is_active : true
      };

      setCustomFields(prev => [typedField, ...prev]);
      setShowForm(false);
      toast({
        title: "Custom field created",
        description: `${field.field_name} has been created successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error creating custom field",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateField = async (id: string, updates: Partial<CustomField>) => {
    try {
      // Ensure options are properly formatted
      const processedOptions = updates.options?.map(opt => ({
        label: opt.label || "",
        value: opt.value || ""
      }));

      // Only send fields that the database expects
      const dbUpdates = {
        field_name: updates.field_name,
        field_type: updates.field_type,
        is_required: updates.is_required,
        options: processedOptions,
        default_value: updates.default_value,
        placeholder: updates.placeholder,
        help_text: updates.help_text,
        is_active: updates.is_active
      };
      
      const { data, error } = await supabase
        .from('custom_fields')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Transform the returned data to match CustomField type
      const typedField: CustomField = {
        id: data.id,
        field_name: data.field_name,
        field_type: data.field_type as CustomFieldType,
        is_required: data.is_required || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id,
        allow_multiple: data.allow_multiple || false,
        custom_fields: data.custom_fields || {},
        options: Array.isArray(data.options) 
          ? data.options.map((opt: any) => ({
              label: opt.label || "",
              value: opt.value || ""
            })) as CustomFieldOption[]
          : [],
        validation_rules: data.validation_rules || {},
        health_score: data.health_score || 0,
        default_value: data.default_value,
        placeholder: data.placeholder || "",
        help_text: data.help_text || "",
        is_active: data.is_active !== undefined ? data.is_active : true
      };

      setCustomFields(prev => prev.map(field => field.id === id ? typedField : field));
      setEditingField(null);
      setShowForm(false);
      toast({
        title: "Custom field updated",
        description: `${updates.field_name || 'Field'} has been updated successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating custom field",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_fields')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomFields(prev => prev.filter(field => field.id !== id));
      toast({
        title: "Custom field deleted",
        description: "The field has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting custom field",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setShowForm(true);
  };

  const handleUpdateStatus = (field: CustomField) => {
    handleUpdateField(field.id, field);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
        <CardDescription>Manage custom fields for your deals</CardDescription>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <CustomFieldForm
            initialData={editingField || undefined}
            onSubmit={editingField ? 
              (updates) => handleUpdateField(editingField.id, updates) : 
              handleCreateField}
          />
        ) : (
          <CustomFieldsTable
            fields={customFields}
            isLoading={isLoading}
            onEdit={handleEditField}
            onDelete={handleDeleteField}
            onUpdate={handleUpdateStatus}
          />
        )}
      </CardContent>
      {!showForm && (
        <CardFooter>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Custom Field
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default CustomFieldsManager;
