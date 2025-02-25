
export type CustomFieldValidation = {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string;
};

export type CustomFieldOption = {
  label: string;
  value: string;
};

export interface CustomField {
  id: string;
  field_name: string;
  field_type: "text" | "number" | "boolean" | "date" | "product" | "multi-select";
  is_required: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  default_value?: any;
  allow_multiple?: boolean;
  options?: CustomFieldOption[];
  validation_rules?: CustomFieldValidation;
  placeholder?: string;
  help_text?: string;
  is_active?: boolean;
}
