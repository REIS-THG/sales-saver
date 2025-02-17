
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

export interface DealNote {
  id: string;
  deal_id: string;
  user_id: string;
  content: string;
  sentiment_score?: number;
  ai_analysis?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  deal_name: string;
  company_name: string;
  amount: number;
  status: 'open' | 'stalled' | 'won' | 'lost';
  health_score: number;
  last_contacted: string | null;
  next_action: string | null;
  created_at?: string;
  updated_at?: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  start_date: string;
  expected_close_date: string;
  custom_fields?: Record<string, string | number | boolean> | null;
  notes_count?: number;
  last_note_at?: string;
  notes?: string;
  onHealthScoreClick?: (dealId: string) => void;
}

export interface FollowUp {
  id: string;
  deal_id: string;
  message_type: 'email' | 'linkedin' | 'voice' | 'video';
  message_content: string;
  ai_suggested: boolean;
  sent: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Engagement {
  id: string;
  deal_id: string;
  engagement_type: 'email_open' | 'email_reply' | 'linkedin_message_seen' | 'call';
  sentiment: 'positive' | 'neutral' | 'negative';
  created_at?: string;
}

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

export interface ReportConfiguration {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  config: ReportConfig;
  created_at?: string;
  updated_at?: string;
  is_favorite?: boolean;
}

export interface ReportConfig {
  dimensions: ReportDimension[];
  metrics: ReportMetric[];
  filters: ReportFilter[];
  timeRange?: TimeRange;
  visualization: VisualizationType;
}

export interface ReportDimension {
  field: string;
  type: 'standard' | 'custom';
  label: string;
}

export interface ReportMetric {
  field: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  label: string;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
}

export interface TimeRange {
  start: string;
  end: string;
  preset?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'this_quarter' | 'this_year';
}

export type VisualizationType = 'bar' | 'line' | 'pie' | 'table' | 'number' | 'area';

export interface Insight {
  id: string;
  deal_id: string;
  insight_type: 'opportunity' | 'risk' | 'action' | 'trend';
  content: string;
  confidence_score: number;
  created_at: string;
  sales_approach: 'consultative_selling' | 'solution_selling' | 'transactional_selling' | 'value_based_selling';
  industry: string;
  purpose_notes: string;
  tone_analysis: Record<string, number>;
  word_choice_analysis: Record<string, any>;
  coaching_suggestion?: string;
  communication_template?: string;
  communication_channel?: 'f2f' | 'email' | 'social_media';
}
