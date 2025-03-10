
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomField, CustomFieldType } from "@/types/custom-field";
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
      
      // Cast the field_type as CustomFieldType to satisfy TypeScript
      const typedFields = fields?.map(field => ({
        ...field,
        field_type: field.field_type as CustomFieldType,
        allow_multiple: field.allow_multiple || false,
        custom_fields: field.custom_fields || {},
        options: field.options || [],
        validation_rules: field.validation_rules || {},
        health_score: field.health_score || 0
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
      const { data, error } = await supabase
        .from('custom_fields')
        .insert([field])
        .select()
        .single();

      if (error) throw error;

      // Cast the returned field_type to CustomFieldType
      const typedField = {
        ...data,
        field_type: data.field_type as CustomFieldType,
        allow_multiple: data.allow_multiple || false,
        custom_fields: data.custom_fields || {},
        options: data.options || [],
        validation_rules: data.validation_rules || {},
        health_score: data.health_score || 0
      } as CustomField;

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
      const { data, error } = await supabase
        .from('custom_fields')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Cast the returned field_type to CustomFieldType
      const typedField = {
        ...data,
        field_type: data.field_type as CustomFieldType,
        allow_multiple: data.allow_multiple || false,
        custom_fields: data.custom_fields || {},
        options: data.options || [],
        validation_rules: data.validation_rules || {},
        health_score: data.health_score || 0
      } as CustomField;

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

  const handleUpdateStatus = (field: Partial<CustomField> & { id: string }) => {
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
