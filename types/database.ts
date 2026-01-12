export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      check_ins: {
        Row: {
          challenges_faced: string
          created_at: string | null
          date: string
          habits_summary: Json | null
          id: string
          user_id: string
        }
        Insert: {
          challenges_faced: string
          created_at?: string | null
          date: string
          habits_summary?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          challenges_faced?: string
          created_at?: string | null
          date?: string
          habits_summary?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_habits: {
        Row: {
          created_at: string | null
          date: string
          id: string
          meal_adherence: boolean | null
          meal_logged_at: string | null
          steps: number | null
          steps_logged_at: string | null
          updated_at: string | null
          user_id: string
          water_logged_at: string | null
          water_ml: number | null
          weight_kg: number | null
          weight_logged_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          meal_adherence?: boolean | null
          meal_logged_at?: string | null
          steps?: number | null
          steps_logged_at?: string | null
          updated_at?: string | null
          user_id: string
          water_logged_at?: string | null
          water_ml?: number | null
          weight_kg?: number | null
          weight_logged_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          meal_adherence?: boolean | null
          meal_logged_at?: string | null
          steps?: number | null
          steps_logged_at?: string | null
          updated_at?: string | null
          user_id?: string
          water_logged_at?: string | null
          water_ml?: number | null
          weight_kg?: number | null
          weight_logged_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_options: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          meal_type: string
          option_a_description: string | null
          option_a_name: string
          option_b_description: string | null
          option_b_name: string
          updated_at: string | null
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          meal_type: string
          option_a_description?: string | null
          option_a_name: string
          option_b_description?: string | null
          option_b_name: string
          updated_at?: string | null
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          meal_type?: string
          option_a_description?: string | null
          option_a_name?: string
          option_b_description?: string | null
          option_b_name?: string
          updated_at?: string | null
          week_start_date?: string
        }
        Relationships: []
      }
      meal_selections: {
        Row: {
          created_at: string | null
          id: string
          locked: boolean | null
          locked_at: string | null
          selections: Json | null
          updated_at: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          locked?: boolean | null
          locked_at?: string | null
          selections?: Json | null
          updated_at?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          locked?: boolean | null
          locked_at?: string | null
          selections?: Json | null
          updated_at?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_selections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          body: string
          id: string
          notification_type: string
          sent_at: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cohort_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          push_token: string | null
          updated_at: string | null
        }
        Insert: {
          cohort_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          push_token?: string | null
          updated_at?: string | null
        }
        Update: {
          cohort_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          push_token?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_check_in_date: string | null
          longest_streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_check_in_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_check_in_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_exercise: {
        Row: {
          completed_3x: boolean | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          completed_3x?: boolean | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          completed_3x?: boolean | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_exercise_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_user_check_in: {
        Args: { p_date?: string; p_user_id: string }
        Returns: boolean
      }
      get_week_start: { Args: { input_date?: string }; Returns: string }
      invoke_edge_function: {
        Args: { function_name: string; payload?: Json }
        Returns: undefined
      }
      lock_meal_selections: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
