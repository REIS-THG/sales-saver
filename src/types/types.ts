
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
  custom_views?: Record<string, any>[];
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
  name: string;
  value: number;
  status: 'open' | 'won' | 'lost';
  close_date?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  customer_name?: string;
  customer_email?: string;
  probability?: number;
  notes?: string[];
  custom_fields?: Record<string, any>;
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
