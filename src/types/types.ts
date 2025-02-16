
export interface User {
  id: string;
  full_name: string;
  role: 'sales_rep' | 'manager';
}

export interface Deal {
  id: string;
  deal_name: string;
  company_name: string;
  amount: number;
  status: 'open' | 'stalled' | 'won' | 'lost';
  health_score: number;
  last_contacted: string;
  next_action: string;
}

export interface FollowUp {
  id: string;
  deal_id: string;
  message_type: 'email' | 'linkedin' | 'voice' | 'video';
  message_content: string;
  ai_suggested: boolean;
  sent: boolean;
}

export interface Engagement {
  id: string;
  deal_id: string;
  engagement_type: 'email_open' | 'email_reply' | 'linkedin_message_seen' | 'call';
  sentiment: 'positive' | 'neutral' | 'negative';
}
