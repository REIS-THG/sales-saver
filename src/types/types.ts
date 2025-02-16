
export interface User {
  id: string;
  user_id: string;
  full_name: string;
  role: 'sales_rep' | 'manager';
  created_at?: string;
  updated_at?: string;
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
  source: string;
  start_date: string;
  expected_close_date: string;
  custom_fields?: Record<string, string | number | boolean>;
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

