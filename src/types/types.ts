export type FieldType = "text" | "number" | "boolean" | "date" | "product";
export type DealStatus = "open" | "won" | "lost" | "stalled";
export type UserRole = "sales_rep" | "manager";
export type SubscriptionStatus = "free" | "pro" | "enterprise";

export interface StandardField {
  field_name: string;
  field: string;
  field_type: "text" | "number" | "boolean" | "date" | "product";
}

export interface CustomField {
  id: string;
  field_name: string;
  field_type: FieldType;
  is_required: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
  theme?: string;
  default_deal_view?: string;
  custom_views: Record<string, any>[];
  email?: string;
  subscription_status: SubscriptionStatus;
  subscription_end_date?: string;
  successful_deals_count: number;
  billing_address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export interface Deal {
  id: string;
  deal_name: string;
  company_name: string;
  amount: number;
  status: DealStatus;
  health_score: number;
  user_id: string;
  team_id?: string;
  created_at?: string;
  updated_at?: string;
  start_date?: string;
  expected_close_date?: string;
  last_contacted?: string;
  next_action?: string;
  contact_email?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  company_url?: string;
  notes: string;
  custom_fields: Record<string, any>;
  last_note_at?: string;
  notes_count?: number;
}

export interface DealInsight {
  id: string;
  deal_id: string;
  insight_type: 'risk' | 'opportunity' | 'action_item';
  content: string;
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
  is_processed?: boolean;
  tone_analysis?: Record<string, any>;
  purpose_notes?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'open' | 'acknowledged' | 'resolved';
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
  ai_analysis?: {
    next_actions?: string[] | string;
    key_points?: string[] | string;
    sentiment_score?: number;
    health_score?: number;
  };
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

export interface Insight extends DealInsight {
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'acknowledged' | 'resolved';
}

export interface DripCampaign {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  deal_id?: string;
  status: 'active' | 'paused' | 'completed';
  created_at?: string;
  updated_at?: string;
  trigger_type: 'manual' | 'scheduled' | 'deal_stage_change';
  trigger_delay?: string;
}

export interface DripCampaignStep {
  id: string;
  campaign_id: string;
  step_order: number;
  message_type: 'email' | 'task' | 'notification';
  content: string;
  delay_after?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at?: string;
  updated_at?: string;
}

export interface DripCampaignExecution {
  id: string;
  campaign_id: string;
  step_id: string;
  deal_id?: string;
  status: 'pending' | 'completed' | 'failed';
  scheduled_for?: string;
  executed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}
