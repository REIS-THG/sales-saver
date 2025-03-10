
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CustomField } from "@/types/custom-field";
import { 
  fetchCustomFields, 
  createCustomField, 
  updateCustomField, 
  deleteCustomField,
  mapDbFieldToCustomField
} from "./api";

export function useCustomFields() {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const { toast } = useToast();

  const loadCustomFields = async () => {
    setIsLoading(true);
    try {
      const { data: fields, error } = await fetchCustomFields();

      if (error) throw error;
      
      const typedFields: CustomField[] = fields?.map(mapDbFieldToCustomField) || [];
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

  useEffect(() => {
    loadCustomFields();
  }, []);

  const handleCreateField = async (field: Omit<CustomField, 'id'>) => {
    try {
      const { data, error } = await createCustomField({
        field_name: field.field_name,
        field_type: field.field_type,
        is_required: field.is_required || false,
        options: field.options,
        default_value: field.default_value,
        placeholder: field.placeholder,
        help_text: field.help_text
      });

      if (error) throw error;

      const typedField = mapDbFieldToCustomField(data);
      setCustomFields(prev => [typedField, ...prev]);
      
      toast({
        title: "Custom field created",
        description: `${field.field_name} has been created successfully`,
      });
      
      return typedField;
    } catch (error: any) {
      toast({
        title: "Error creating custom field",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateField = async (id: string, updates: Partial<CustomField>) => {
    try {
      const { data, error } = await updateCustomField(id, {
        field_name: updates.field_name,
        field_type: updates.field_type,
        is_required: updates.is_required,
        options: updates.options,
        default_value: updates.default_value,
        placeholder: updates.placeholder,
        help_text: updates.help_text,
        is_active: updates.is_active
      });

      if (error) throw error;

      const typedField = mapDbFieldToCustomField(data);
      setCustomFields(prev => prev.map(field => field.id === id ? typedField : field));
      
      toast({
        title: "Custom field updated",
        description: `${updates.field_name || 'Field'} has been updated successfully`,
      });
      
      return typedField;
    } catch (error: any) {
      toast({
        title: "Error updating custom field",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteField = async (id: string) => {
    try {
      const { error } = await deleteCustomField(id);

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

  const handleToggleFieldStatus = (field: CustomField) => {
    handleUpdateField(field.id, field);
  };

  return {
    customFields,
    isLoading,
    editingField,
    setEditingField,
    createField: handleCreateField,
    updateField: handleUpdateField,
    deleteField: handleDeleteField,
    toggleFieldStatus: handleToggleFieldStatus,
  };
}
