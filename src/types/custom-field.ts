
export type CustomFieldType = 'text' | 'number' | 'boolean' | 'date' | 'product' | 'multi-select';

export interface CustomFieldOption {
  label: string;
  value: string;
}

export interface ProductOption {
  product_id: string;
  include_in_documents: boolean;
  display_price: boolean;
}

export interface CustomFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string;
}

export interface CustomField {
  id: string;
  user_id: string;
  field_name: string;
  field_type: CustomFieldType;
  is_required: boolean;
  allow_multiple?: boolean;
  options?: CustomFieldOption[];
  product_options?: ProductOption[];
  validation_rules?: CustomFieldValidation;
  default_value?: any;
  placeholder?: string;
  help_text?: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  custom_fields?: Record<string, any>;
  health_score?: number;
  include_in_documents?: boolean;
}
