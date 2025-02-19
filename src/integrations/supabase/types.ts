export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bulk_imports: {
        Row: {
          created_at: string | null
          error_count: number | null
          errors: Json | null
          filename: string
          id: string
          processed_records: number | null
          status: string
          success_count: number | null
          total_records: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_count?: number | null
          errors?: Json | null
          filename: string
          id?: string
          processed_records?: number | null
          status?: string
          success_count?: number | null
          total_records?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_count?: number | null
          errors?: Json | null
          filename?: string
          id?: string
          processed_records?: number | null
          status?: string
          success_count?: number | null
          total_records?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      custom_fields: {
        Row: {
          created_at: string | null
          field_name: string
          field_type: string
          id: string
          is_required: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          field_name: string
          field_type: string
          id?: string
          is_required?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          field_name?: string
          field_type?: string
          id?: string
          is_required?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      deal_insights: {
        Row: {
          coaching_suggestion: string | null
          communication_channel:
            | Database["public"]["Enums"]["communication_channel_type"]
            | null
          communication_template: string | null
          confidence_score: number | null
          content: string
          created_at: string | null
          deal_id: string | null
          id: string
          industry: string | null
          insight_type: string
          is_processed: boolean | null
          purpose_notes: string | null
          sales_approach:
            | Database["public"]["Enums"]["sales_approach_type"]
            | null
          source_data: Json | null
          tone_analysis: Json | null
          updated_at: string | null
          word_choice_analysis: Json | null
        }
        Insert: {
          coaching_suggestion?: string | null
          communication_channel?:
            | Database["public"]["Enums"]["communication_channel_type"]
            | null
          communication_template?: string | null
          confidence_score?: number | null
          content: string
          created_at?: string | null
          deal_id?: string | null
          id?: string
          industry?: string | null
          insight_type: string
          is_processed?: boolean | null
          purpose_notes?: string | null
          sales_approach?:
            | Database["public"]["Enums"]["sales_approach_type"]
            | null
          source_data?: Json | null
          tone_analysis?: Json | null
          updated_at?: string | null
          word_choice_analysis?: Json | null
        }
        Update: {
          coaching_suggestion?: string | null
          communication_channel?:
            | Database["public"]["Enums"]["communication_channel_type"]
            | null
          communication_template?: string | null
          confidence_score?: number | null
          content?: string
          created_at?: string | null
          deal_id?: string | null
          id?: string
          industry?: string | null
          insight_type?: string
          is_processed?: boolean | null
          purpose_notes?: string | null
          sales_approach?:
            | Database["public"]["Enums"]["sales_approach_type"]
            | null
          source_data?: Json | null
          tone_analysis?: Json | null
          updated_at?: string | null
          word_choice_analysis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_insights_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_notes: {
        Row: {
          ai_analysis: Json | null
          content: string
          created_at: string | null
          deal_id: string
          id: string
          sentiment_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          content: string
          created_at?: string | null
          deal_id: string
          id?: string
          sentiment_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          content?: string
          created_at?: string | null
          deal_id?: string
          id?: string
          sentiment_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_notes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_source_configurations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          source_filters: Json | null
          source_keywords: string[] | null
          source_type: string
          source_urls: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          source_filters?: Json | null
          source_keywords?: string[] | null
          source_type: string
          source_urls?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          source_filters?: Json | null
          source_keywords?: string[] | null
          source_type?: string
          source_urls?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deal_source_results: {
        Row: {
          confidence_score: number | null
          config_id: string | null
          created_at: string | null
          deal_id: string | null
          id: string
          matched_keywords: string[] | null
          source_data: Json | null
          source_type: string
          source_url: string | null
        }
        Insert: {
          confidence_score?: number | null
          config_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          matched_keywords?: string[] | null
          source_data?: Json | null
          source_type: string
          source_url?: string | null
        }
        Update: {
          confidence_score?: number | null
          config_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          matched_keywords?: string[] | null
          source_data?: Json | null
          source_type?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_source_results_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "deal_source_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_source_results_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          amount: number
          company_name: string
          company_url: string | null
          contact_email: string | null
          contact_first_name: string | null
          contact_last_name: string | null
          created_at: string | null
          custom_fields: Json | null
          deal_name: string
          expected_close_date: string | null
          health_score: number | null
          id: string
          last_contacted: string | null
          last_note_at: string | null
          next_action: string | null
          notes: string | null
          notes_count: number | null
          start_date: string | null
          status: string | null
          team_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          company_name: string
          company_url?: string | null
          contact_email?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deal_name: string
          expected_close_date?: string | null
          health_score?: number | null
          id?: string
          last_contacted?: string | null
          last_note_at?: string | null
          next_action?: string | null
          notes?: string | null
          notes_count?: number | null
          start_date?: string | null
          status?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          company_name?: string
          company_url?: string | null
          contact_email?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deal_name?: string
          expected_close_date?: string | null
          health_score?: number | null
          id?: string
          last_contacted?: string | null
          last_note_at?: string | null
          next_action?: string | null
          notes?: string | null
          notes_count?: number | null
          start_date?: string | null
          status?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      drip_campaign_executions: {
        Row: {
          campaign_id: string
          created_at: string | null
          deal_id: string | null
          executed_at: string | null
          id: string
          scheduled_for: string | null
          status: string
          step_id: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          deal_id?: string | null
          executed_at?: string | null
          id?: string
          scheduled_for?: string | null
          status?: string
          step_id: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          deal_id?: string | null
          executed_at?: string | null
          id?: string
          scheduled_for?: string | null
          status?: string
          step_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drip_campaign_executions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "drip_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drip_campaign_executions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drip_campaign_executions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "drip_campaign_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      drip_campaign_steps: {
        Row: {
          campaign_id: string
          content: string
          created_at: string | null
          delay_after: unknown | null
          id: string
          message_type: string
          status: string | null
          step_order: number
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          content: string
          created_at?: string | null
          delay_after?: unknown | null
          id?: string
          message_type: string
          status?: string | null
          step_order: number
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          content?: string
          created_at?: string | null
          delay_after?: unknown | null
          id?: string
          message_type?: string
          status?: string | null
          step_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drip_campaign_steps_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "drip_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      drip_campaigns: {
        Row: {
          created_at: string | null
          deal_id: string | null
          description: string | null
          id: string
          name: string
          status: string
          trigger_delay: unknown | null
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          trigger_delay?: unknown | null
          trigger_type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          trigger_delay?: unknown | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_deal"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement: {
        Row: {
          created_at: string | null
          deal_id: string | null
          engagement_type: string | null
          id: string
          sentiment: string | null
        }
        Insert: {
          created_at?: string | null
          deal_id?: string | null
          engagement_type?: string | null
          id?: string
          sentiment?: string | null
        }
        Update: {
          created_at?: string | null
          deal_id?: string | null
          engagement_type?: string | null
          id?: string
          sentiment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engagement_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          ai_suggested: boolean | null
          created_at: string | null
          deal_id: string | null
          id: string
          message_content: string
          message_type: string | null
          sent: boolean | null
          updated_at: string | null
        }
        Insert: {
          ai_suggested?: boolean | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          message_content: string
          message_type?: string | null
          sent?: boolean | null
          updated_at?: string | null
        }
        Update: {
          ai_suggested?: boolean | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          message_content?: string
          message_type?: string | null
          sent?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followups_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      report_configurations: {
        Row: {
          config: Json
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          name: string
          team_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          name: string
          team_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          team_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_configurations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["team_member_role"]
          team_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["team_member_role"]
          team_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["team_member_role"]
          team_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          custom_views: Json | null
          default_deal_view: string | null
          email: string | null
          full_name: string
          id: string
          role: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_status: boolean | null
          successful_deals_count: number | null
          theme: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          custom_views?: Json | null
          default_deal_view?: string | null
          email?: string | null
          full_name: string
          id?: string
          role?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: boolean | null
          successful_deals_count?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          custom_views?: Json | null
          default_deal_view?: string | null
          email?: string | null
          full_name?: string
          id?: string
          role?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: boolean | null
          successful_deals_count?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_report: {
        Args: {
          report_id: string
          checking_user_id: string
        }
        Returns: boolean
      }
      can_access_team: {
        Args: {
          team_id: string
          checking_user_id: string
        }
        Returns: boolean
      }
      can_access_team_member_row: {
        Args: {
          checking_user_id: string
          checking_team_id: string
        }
        Returns: boolean
      }
      get_team_member_role: {
        Args: {
          team_id: string
          user_id: string
        }
        Returns: Database["public"]["Enums"]["team_member_role"]
      }
      get_user_teams: {
        Args: {
          user_id: string
        }
        Returns: string[]
      }
      is_team_member: {
        Args: {
          team_id: string
          user_id: string
        }
        Returns: boolean
      }
      is_team_owner: {
        Args: {
          team_id: string
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      communication_channel_type: "f2f" | "email" | "social_media"
      custom_field_type: "text" | "number" | "boolean" | "date" | "product"
      sales_approach_type:
        | "consultative_selling"
        | "solution_selling"
        | "transactional_selling"
        | "value_based_selling"
      team_member_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
