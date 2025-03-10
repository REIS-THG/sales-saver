
import { supabase } from "@/integrations/supabase/client";
import { CustomField, CustomFieldOption, CustomFieldType } from "@/types/custom-field";

export const fetchCustomFields = async () => {
  return await supabase
    .from('custom_fields')
    .select('*')
    .order('created_at', { ascending: false });
};

export const createCustomField = async (fieldData: {
  field_name: string;
  field_type: CustomFieldType;
  is_required: boolean;
  options?: CustomFieldOption[];
  default_value?: any;
  placeholder?: string;
  help_text?: string;
}) => {
  const processedOptions = fieldData.options?.map(opt => ({
    label: opt.label || "",
    value: opt.value || ""
  }));

  return await supabase
    .from('custom_fields')
    .insert([{
      ...fieldData,
      options: processedOptions
    }])
    .select()
    .single();
};

export const updateCustomField = async (id: string, updates: {
  field_name?: string;
  field_type?: CustomFieldType;
  is_required?: boolean;
  options?: CustomFieldOption[];
  default_value?: any;
  placeholder?: string;
  help_text?: string;
  is_active?: boolean;
}) => {
  const processedOptions = updates.options?.map(opt => ({
    label: opt.label || "",
    value: opt.value || ""
  }));

  return await supabase
    .from('custom_fields')
    .update({
      ...updates,
      options: processedOptions,
    })
    .eq('id', id)
    .select()
    .single();
};

export const deleteCustomField = async (id: string) => {
  return await supabase
    .from('custom_fields')
    .delete()
    .eq('id', id);
};

export const mapDbFieldToCustomField = (field: any): CustomField => {
  return {
    id: field.id,
    user_id: field.user_id,
    field_name: field.field_name,
    field_type: field.field_type as CustomFieldType,
    is_required: field.is_required || false,
    allow_multiple: field.allow_multiple || false,
    options: Array.isArray(field.options) 
      ? field.options.map((opt: any) => ({
          label: String(opt.label || ''),
          value: String(opt.value || '')
        }))
      : [],
    validation_rules: field.validation_rules || {},
    default_value: field.default_value,
    placeholder: field.placeholder || '',
    help_text: field.help_text || '',
    created_at: field.created_at,
    updated_at: field.updated_at,
    is_active: field.is_active !== undefined ? field.is_active : true,
    custom_fields: field.custom_fields || {},
    health_score: field.health_score || 0
  };
};
