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
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
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
      report_configurations: {
        Row: {
          config: Json
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          name: string
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
          updated_at?: string | null
          user_id?: string
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
          subscription_end_date: string | null
          subscription_status: string | null
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
          subscription_end_date?: string | null
          subscription_status?: string | null
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
          subscription_end_date?: string | null
          subscription_status?: string | null
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
      [_ in never]: never
    }
    Enums: {
      communication_channel_type: "f2f" | "email" | "social_media"
      sales_approach_type:
        | "consultative_selling"
        | "solution_selling"
        | "transactional_selling"
        | "value_based_selling"
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
