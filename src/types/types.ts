export interface StandardField {
  field_name: string;
  field: string;
  field_type: "text" | "number" | "boolean" | "date";
}

export interface CustomField {
  id: string;
  field_name: string;
  field_type: "text" | "number" | "boolean" | "date";
  is_required: boolean;
  user_id?: string;
}

export interface User {
  id: string;
  user_id: string;
  full_name: string;
  role: 'sales_rep' | 'manager';
  created_at?: string;
  updated_at?: string;
  theme?: string;
  default_deal_view?: string;
  custom_views: Record<string, any>[];
  email?: string;
  subscription_status?: 'free' | 'pro' | 'enterprise';
  subscription_end_date?: string;
  successful_deals_count: number;
  billing_address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
}

export interface Deal {
  id: string;
  deal_name: string;
  company_name: string;
  amount: number;
  status: 'open' | 'won' | 'lost' | 'stalled';
  health_score: number;
  close_date?: string;
  start_date?: string;
  expected_close_date?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  last_contacted?: string;
  next_action?: string;
  customer_name?: string;
  customer_email?: string;
  contact_email?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  company_url?: string;
  probability?: number;
  notes?: string[];
  custom_fields?: Record<string, any>;
  name?: string;
  value?: number;
}

export interface BulkImport {
  id: string;
  user_id: string;
  file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_rows?: number;
  processed_rows?: number;
  failed_rows?: number;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DealAnalysis {
  id: string;
  deal_id: string;
  analysis_type: 'sentiment' | 'risk' | 'opportunity';
  result: Record<string, any>;
  created_at?: string;
  confidence_score?: number;
  recommendations?: string[];
}

export interface DealNote {
  id: string;
  deal_id: string;
  user_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  sentiment_score?: number;
  key_points?: string[];
}

export interface DealInsight {
  id: string;
  deal_id: string;
  insight_type: 'risk' | 'opportunity' | 'action_item';
  content: string;
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
  status: 'open' | 'acknowledged' | 'resolved';
}

export interface Insight {
  id: string;
  deal_id: string;
  insight_type: 'risk' | 'opportunity' | 'action_item';
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'acknowledged' | 'resolved';
  created_at?: string;
  updated_at?: string;
  confidence_score?: number;
  coaching_suggestion?: string;
  communication_template?: string;
  sales_approach?: 'consultative_selling' | 'solution_selling' | 'transactional_selling' | 'value_based_selling';
  communication_channel?: 'f2f' | 'email' | 'social_media';
  industry?: string;
  word_choice_analysis?: Record<string, any>;
  source_data?: Record<string, any>;
}
