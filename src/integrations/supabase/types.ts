export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      call_history: {
        Row: {
          call_type: string
          caller_id: string
          created_at: string
          duration_seconds: number | null
          end_reason: string | null
          ended_at: string | null
          id: string
          pair_id: string
          quality_score: number | null
          receiver_id: string
          started_at: string
        }
        Insert: {
          call_type: string
          caller_id: string
          created_at?: string
          duration_seconds?: number | null
          end_reason?: string | null
          ended_at?: string | null
          id?: string
          pair_id: string
          quality_score?: number | null
          receiver_id: string
          started_at: string
        }
        Update: {
          call_type?: string
          caller_id?: string
          created_at?: string
          duration_seconds?: number | null
          end_reason?: string | null
          ended_at?: string | null
          id?: string
          pair_id?: string
          quality_score?: number | null
          receiver_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_call_history_pair"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      call_quality_logs: {
        Row: {
          audio_quality: number | null
          call_session_id: string
          connection_state: string | null
          ice_connection_state: string | null
          id: string
          latency_ms: number | null
          packet_loss_rate: number | null
          timestamp: string
          video_quality: number | null
        }
        Insert: {
          audio_quality?: number | null
          call_session_id: string
          connection_state?: string | null
          ice_connection_state?: string | null
          id?: string
          latency_ms?: number | null
          packet_loss_rate?: number | null
          timestamp?: string
          video_quality?: number | null
        }
        Update: {
          audio_quality?: number | null
          call_session_id?: string
          connection_state?: string | null
          ice_connection_state?: string | null
          id?: string
          latency_ms?: number | null
          packet_loss_rate?: number | null
          timestamp?: string
          video_quality?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_call_quality_call_session"
            columns: ["call_session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      call_sessions: {
        Row: {
          call_type: string
          caller_id: string
          created_at: string
          ended_at: string | null
          ice_config: Json | null
          id: string
          pair_id: string
          receiver_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          call_type: string
          caller_id: string
          created_at?: string
          ended_at?: string | null
          ice_config?: Json | null
          id?: string
          pair_id: string
          receiver_id: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          call_type?: string
          caller_id?: string
          created_at?: string
          ended_at?: string | null
          ice_config?: Json | null
          id?: string
          pair_id?: string
          receiver_id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_call_sessions_pair"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          assignee: string | null
          checklist_id: string
          done: boolean | null
          due_at: string | null
          id: string
          title: string
        }
        Insert: {
          assignee?: string | null
          checklist_id: string
          done?: boolean | null
          due_at?: string | null
          id?: string
          title: string
        }
        Update: {
          assignee?: string | null
          checklist_id?: string
          done?: boolean | null
          due_at?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_assignee_fkey"
            columns: ["assignee"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          created_at: string | null
          id: string
          pair_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pair_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pair_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_questions: {
        Row: {
          answered_at: string | null
          answered_by: string | null
          created_at: string
          id: string
          pair_id: string
          question_date: string
          question_text: string
        }
        Insert: {
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string
          id?: string
          pair_id: string
          question_date?: string
          question_text: string
        }
        Update: {
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string
          id?: string
          pair_id?: string
          question_date?: string
          question_text?: string
        }
        Relationships: []
      }
      embeddings: {
        Row: {
          content: string
          created_by: string | null
          embedding: string | null
          id: string
          pair_id: string
          source_id: string | null
          source_type: string
        }
        Insert: {
          content: string
          created_by?: string | null
          embedding?: string | null
          id?: string
          pair_id: string
          source_id?: string | null
          source_type: string
        }
        Update: {
          content?: string
          created_by?: string | null
          embedding?: string | null
          id?: string
          pair_id?: string
          source_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "embeddings_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          all_day: boolean | null
          ends_at: string | null
          id: string
          kind: string
          meta: Json | null
          pair_id: string
          starts_at: string | null
          title: string
        }
        Insert: {
          all_day?: boolean | null
          ends_at?: string | null
          id?: string
          kind: string
          meta?: Json | null
          pair_id: string
          starts_at?: string | null
          title: string
        }
        Update: {
          all_day?: boolean | null
          ends_at?: string | null
          id?: string
          kind?: string
          meta?: Json | null
          pair_id?: string
          starts_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_tasks: {
        Row: {
          archived_at: string | null
          assigned_to: string | null
          completed_at: string | null
          due_at: string | null
          goal_id: string | null
          id: string
          is_archived: boolean | null
          notes: string | null
          pair_id: string
          status_column: string
          title: string
        }
        Insert: {
          archived_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          due_at?: string | null
          goal_id?: string | null
          id?: string
          is_archived?: boolean | null
          notes?: string | null
          pair_id: string
          status_column?: string
          title: string
        }
        Update: {
          archived_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          due_at?: string | null
          goal_id?: string | null
          id?: string
          is_archived?: boolean | null
          notes?: string | null
          pair_id?: string
          status_column?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goalboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_tasks_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      goalboard: {
        Row: {
          color: string | null
          description: string | null
          icon: string | null
          id: string
          pair_id: string
          target_date: string | null
        }
        Insert: {
          color?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          pair_id: string
          target_date?: string | null
        }
        Update: {
          color?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          pair_id?: string
          target_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goalboard_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      message_favorites: {
        Row: {
          created_at: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: []
      }
      message_summaries: {
        Row: {
          created_at: string | null
          id: string
          pair_id: string
          summary_text: string | null
          window_end: string
          window_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pair_id: string
          summary_text?: string | null
          window_end: string
          window_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pair_id?: string
          summary_text?: string | null
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_summaries_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: Json | null
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          media_url: string | null
          pair_id: string
          sender_id: string
          type: string
        }
        Insert: {
          body?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          media_url?: string | null
          pair_id: string
          sender_id: string
          type: string
        }
        Update: {
          body?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          media_url?: string | null
          pair_id?: string
          sender_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          created_at: string | null
          flagged: boolean | null
          id: string
          item_id: string | null
          item_type: string
          pair_id: string
          result: Json | null
        }
        Insert: {
          created_at?: string | null
          flagged?: boolean | null
          id?: string
          item_id?: string | null
          item_type: string
          pair_id: string
          result?: Json | null
        }
        Update: {
          created_at?: string | null
          flagged?: boolean | null
          id?: string
          item_id?: string | null
          item_type?: string
          pair_id?: string
          result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_analytics: {
        Row: {
          created_at: string | null
          dominant_mood: string | null
          id: string
          insights: Json | null
          mood_counts: Json
          mood_score: number | null
          pair_id: string | null
          period_end: string
          period_start: string
          period_type: string
          streak_days: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dominant_mood?: string | null
          id?: string
          insights?: Json | null
          mood_counts: Json
          mood_score?: number | null
          pair_id?: string | null
          period_end: string
          period_start: string
          period_type: string
          streak_days?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dominant_mood?: string | null
          id?: string
          insights?: Json | null
          mood_counts?: Json
          mood_score?: number | null
          pair_id?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          streak_days?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          created_at: string
          date: string
          emoji: string
          id: string
          notes: string | null
          pair_id: string | null
          shared_with_partner: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          emoji: string
          id?: string
          notes?: string | null
          pair_id?: string | null
          shared_with_partner?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          emoji?: string
          id?: string
          notes?: string | null
          pair_id?: string | null
          shared_with_partner?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      mood_notifications: {
        Row: {
          action_type: string | null
          created_at: string | null
          id: string
          message: string | null
          mood_log_id: string | null
          notification_type: string
          pair_id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          action_type?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          mood_log_id?: string | null
          notification_type: string
          pair_id: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          action_type?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          mood_log_id?: string | null
          notification_type?: string
          pair_id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notification_history: {
        Row: {
          clicked_at: string | null
          data: Json | null
          delivery_method: string
          id: string
          message: string
          notification_type: string
          pair_id: string | null
          read_at: string | null
          sent_at: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          data?: Json | null
          delivery_method: string
          id?: string
          message: string
          notification_type: string
          pair_id?: string | null
          read_at?: string | null
          sent_at?: string
          status: string
          title: string
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          data?: Json | null
          delivery_method?: string
          id?: string
          message?: string
          notification_type?: string
          pair_id?: string | null
          read_at?: string | null
          sent_at?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          daily_questions: boolean
          email_notifications: boolean
          event_reminders: boolean
          id: string
          mood_alerts: boolean
          push_notifications: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          task_reminders: boolean
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_questions?: boolean
          email_notifications?: boolean
          event_reminders?: boolean
          id?: string
          mood_alerts?: boolean
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          task_reminders?: boolean
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_questions?: boolean
          email_notifications?: boolean
          event_reminders?: boolean
          id?: string
          mood_alerts?: boolean
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          task_reminders?: boolean
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          attempts: number | null
          created_at: string
          data: Json | null
          delivery_method: string[]
          error_message: string | null
          id: string
          max_attempts: number | null
          message: string
          notification_type: string
          pair_id: string | null
          scheduled_for: string
          sent_at: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          data?: Json | null
          delivery_method?: string[]
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          message: string
          notification_type: string
          pair_id?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          created_at?: string
          data?: Json | null
          delivery_method?: string[]
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          message?: string
          notification_type?: string
          pair_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      pair_invites: {
        Row: {
          code: string
          created_by: string
          expires_at: string
          pair_id: string
        }
        Insert: {
          code: string
          created_by: string
          expires_at: string
          pair_id: string
        }
        Update: {
          code?: string
          created_by?: string
          expires_at?: string
          pair_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pair_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pair_invites_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      pairs: {
        Row: {
          created_at: string | null
          disconnected_at: string | null
          disconnected_by: string | null
          id: string
          status: string | null
          user_a: string
          user_b: string | null
        }
        Insert: {
          created_at?: string | null
          disconnected_at?: string | null
          disconnected_by?: string | null
          id?: string
          status?: string | null
          user_a: string
          user_b?: string | null
        }
        Update: {
          created_at?: string | null
          disconnected_at?: string | null
          disconnected_by?: string | null
          id?: string
          status?: string | null
          user_a?: string
          user_b?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pairs_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pairs_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      presence: {
        Row: {
          device: string | null
          last_seen: string | null
          pair_id: string
          state: string | null
          user_id: string
        }
        Insert: {
          device?: string | null
          last_seen?: string | null
          pair_id: string
          state?: string | null
          user_id: string
        }
        Update: {
          device?: string | null
          last_seen?: string | null
          pair_id?: string
          state?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presence_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          interests: string[] | null
          last_name: string | null
          phone_number: string | null
          pronouns: string | null
          relationship_start_date: string | null
          relationship_status: string | null
          tz: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          interests?: string[] | null
          last_name?: string | null
          phone_number?: string | null
          pronouns?: string | null
          relationship_start_date?: string | null
          relationship_status?: string | null
          tz?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          interests?: string[] | null
          last_name?: string | null
          phone_number?: string | null
          pronouns?: string | null
          relationship_start_date?: string | null
          relationship_status?: string | null
          tz?: string | null
        }
        Relationships: []
      }
      rate_limit_tracking: {
        Row: {
          endpoint: string
          id: string
          last_request_at: string | null
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          endpoint: string
          id?: string
          last_request_at?: string | null
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          endpoint?: string
          id?: string
          last_request_at?: string | null
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      rituals: {
        Row: {
          created_at: string | null
          due_at: string
          id: string
          pack: string
          pair_id: string
          responses: Json | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          due_at: string
          id?: string
          pack: string
          pair_id: string
          responses?: Json | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          due_at?: string
          id?: string
          pack?: string
          pair_id?: string
          responses?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rituals_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      streaks: {
        Row: {
          count: number | null
          id: string
          pair_id: string
          streak_type: string
          updated_at: string | null
        }
        Insert: {
          count?: number | null
          id?: string
          pair_id: string
          streak_type: string
          updated_at?: string | null
        }
        Update: {
          count?: number | null
          id?: string
          pair_id?: string
          streak_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streaks_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          pair_id: string
          plan: string
          receipt_json: Json | null
          renews_on: string | null
          store: string | null
        }
        Insert: {
          pair_id: string
          plan?: string
          receipt_json?: Json | null
          renews_on?: string | null
          store?: string | null
        }
        Update: {
          pair_id?: string
          plan?: string
          receipt_json?: Json | null
          renews_on?: string | null
          store?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: true
            referencedRelation: "pairs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_old_completed_tasks: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_pair_streak: {
        Args: { target_pair_id: string }
        Returns: number
      }
      get_or_create_daily_question: {
        Args: { target_pair_id: string }
        Returns: {
          answered_at: string
          answered_by: string
          id: string
          question_date: string
          question_text: string
        }[]
      }
      get_user_notification_preferences: {
        Args: { target_user_id: string }
        Returns: {
          created_at: string
          daily_questions: boolean
          email_notifications: boolean
          event_reminders: boolean
          id: string
          mood_alerts: boolean
          push_notifications: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          task_reminders: boolean
          timezone: string | null
          updated_at: string
          user_id: string
        }
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
