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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      auction_integrity: {
        Row: {
          id: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      auction_watchers: {
        Row: {
          auction_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          auction_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          auction_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_watchers_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auctions: {
        Row: {
          bids_count: number
          category: string
          country: string | null
          county: string | null
          created_at: string
          currency: string | null
          current_bid: number | null
          current_winner_id: string | null
          description: string | null
          end_time: string
          id: string
          image_url: string | null
          product_name: string
          quantity: number
          reserve_price: number | null
          seller_id: string
          start_time: string
          starting_bid: number
          status: string
          unit: string
          updated_at: string
        }
        Insert: {
          bids_count?: number
          category: string
          country?: string | null
          county?: string | null
          created_at?: string
          currency?: string | null
          current_bid?: number | null
          current_winner_id?: string | null
          description?: string | null
          end_time: string
          id?: string
          image_url?: string | null
          product_name: string
          quantity?: number
          reserve_price?: number | null
          seller_id: string
          start_time?: string
          starting_bid: number
          status?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          bids_count?: number
          category?: string
          country?: string | null
          county?: string | null
          created_at?: string
          currency?: string | null
          current_bid?: number | null
          current_winner_id?: string | null
          description?: string | null
          end_time?: string
          id?: string
          image_url?: string | null
          product_name?: string
          quantity?: number
          reserve_price?: number | null
          seller_id?: string
          start_time?: string
          starting_bid?: number
          status?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      bids: {
        Row: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at: string
          id: string
          is_auto_bid: boolean
        }
        Insert: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at?: string
          id?: string
          is_auto_bid?: boolean
        }
        Update: {
          amount?: number
          auction_id?: string
          bidder_id?: string
          created_at?: string
          id?: string
          is_auto_bid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_archived_by_1: boolean
          is_archived_by_2: boolean
          last_message_at: string | null
          last_message_text: string | null
          last_sender_id: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived_by_1?: boolean
          is_archived_by_2?: boolean
          last_message_at?: string | null
          last_message_text?: string | null
          last_sender_id?: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived_by_1?: boolean
          is_archived_by_2?: boolean
          last_message_at?: string | null
          last_message_text?: string | null
          last_sender_id?: string | null
          participant_1_id?: string
          participant_2_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      crop_thresholds: {
        Row: {
          base_yield_per_acre: number
          crop_name: string
          id: string
          optimal_rainfall_max: number
          optimal_rainfall_min: number
          optimal_temp_max: number
          optimal_temp_min: number
          pest_susceptibility_index: number
          water_requirement_per_acre: number
          yield_unit: string
        }
        Insert: {
          base_yield_per_acre?: number
          crop_name: string
          id?: string
          optimal_rainfall_max?: number
          optimal_rainfall_min?: number
          optimal_temp_max?: number
          optimal_temp_min?: number
          pest_susceptibility_index?: number
          water_requirement_per_acre?: number
          yield_unit?: string
        }
        Update: {
          base_yield_per_acre?: number
          crop_name?: string
          id?: string
          optimal_rainfall_max?: number
          optimal_rainfall_min?: number
          optimal_temp_max?: number
          optimal_temp_min?: number
          pest_susceptibility_index?: number
          water_requirement_per_acre?: number
          yield_unit?: string
        }
        Relationships: []
      }
      currency_rates: {
        Row: {
          code: string
          name: string
          rate_to_usd: number
          symbol: string
          updated_at: string
        }
        Insert: {
          code: string
          name: string
          rate_to_usd?: number
          symbol: string
          updated_at?: string
        }
        Update: {
          code?: string
          name?: string
          rate_to_usd?: number
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      farms: {
        Row: {
          country: string
          created_at: string
          crop_type: string
          farm_size: number
          farm_size_unit: string
          id: string
          irrigation_type: string
          name: string
          planting_date: string | null
          region: string
          soil_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          country?: string
          created_at?: string
          crop_type?: string
          farm_size?: number
          farm_size_unit?: string
          id?: string
          irrigation_type?: string
          name?: string
          planting_date?: string | null
          region: string
          soil_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string
          created_at?: string
          crop_type?: string
          farm_size?: number
          farm_size_unit?: string
          id?: string
          irrigation_type?: string
          name?: string
          planting_date?: string | null
          region?: string
          soil_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          image_urls: string[] | null
          is_read: boolean
          message_text: string | null
          message_type: string
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          is_read?: boolean
          message_text?: string | null
          message_type?: string
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          is_read?: boolean
          message_text?: string | null
          message_type?: string
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          currency: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          currency?: string
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          currency?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_address: string | null
          delivery_fee: number
          id: string
          payment_method: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_fee?: number
          id?: string
          payment_method?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_fee?: number
          id?: string
          payment_method?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          comments: number | null
          content: string
          created_at: string
          id: string
          image_urls: string[] | null
          likes: number | null
          user_id: string
        }
        Insert: {
          comments?: number | null
          content: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          likes?: number | null
          user_id: string
        }
        Update: {
          comments?: number | null
          content?: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          likes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          country: string | null
          county: string | null
          created_at: string
          currency: string | null
          description: string | null
          has_transport: boolean | null
          id: string
          image_url: string | null
          min_order: number | null
          price: number
          quality_grade: string | null
          quantity: number | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          country?: string | null
          county?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          has_transport?: boolean | null
          id?: string
          image_url?: string | null
          min_order?: number | null
          price: number
          quality_grade?: string | null
          quantity?: number | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          country?: string | null
          county?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          has_transport?: boolean | null
          id?: string
          image_url?: string | null
          min_order?: number | null
          price?: number
          quality_grade?: string | null
          quantity?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          county: string | null
          created_at: string
          currency: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          weather_location_country: string | null
          weather_location_county: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          weather_location_country?: string | null
          weather_location_county?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          weather_location_country?: string | null
          weather_location_county?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          answers: number | null
          body: string | null
          created_at: string
          id: string
          image_urls: string[] | null
          tags: string[] | null
          title: string
          user_id: string
          votes: number | null
        }
        Insert: {
          answers?: number | null
          body?: string | null
          created_at?: string
          id?: string
          image_urls?: string[] | null
          tags?: string[] | null
          title: string
          user_id: string
          votes?: number | null
        }
        Update: {
          answers?: number | null
          body?: string | null
          created_at?: string
          id?: string
          image_urls?: string[] | null
          tags?: string[] | null
          title?: string
          user_id?: string
          votes?: number | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      region_climate: {
        Row: {
          country: string
          drought_risk_index: number
          flood_risk_index: number
          historical_rainfall_avg: number
          historical_temp_avg: number
          id: string
          last_updated: string
          region: string
          seasonal_projection_rainfall: number | null
          seasonal_projection_temp: number | null
        }
        Insert: {
          country?: string
          drought_risk_index?: number
          flood_risk_index?: number
          historical_rainfall_avg?: number
          historical_temp_avg?: number
          id?: string
          last_updated?: string
          region: string
          seasonal_projection_rainfall?: number | null
          seasonal_projection_temp?: number | null
        }
        Update: {
          country?: string
          drought_risk_index?: number
          flood_risk_index?: number
          historical_rainfall_avg?: number
          historical_temp_avg?: number
          id?: string
          last_updated?: string
          region?: string
          seasonal_projection_rainfall?: number | null
          seasonal_projection_temp?: number | null
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      score_events: {
        Row: {
          change: number
          created_at: string
          id: string
          reason: string
          related_entity_id: string | null
          score_type: string
          user_id: string
        }
        Insert: {
          change: number
          created_at?: string
          id?: string
          reason: string
          related_entity_id?: string | null
          score_type: string
          user_id: string
        }
        Update: {
          change?: number
          created_at?: string
          id?: string
          reason?: string
          related_entity_id?: string | null
          score_type?: string
          user_id?: string
        }
        Relationships: []
      }
      simulation_results: {
        Row: {
          farm_id: string
          id: string
          insights: string[]
          irrigation_recommendation: string
          last_updated: string
          pest_risk_pct: number
          profit_projection: number
          projected_yield: number
          risk_score: number
          water_usage_estimate: number
          yield_change_pct: number
        }
        Insert: {
          farm_id: string
          id?: string
          insights?: string[]
          irrigation_recommendation?: string
          last_updated?: string
          pest_risk_pct?: number
          profit_projection?: number
          projected_yield?: number
          risk_score?: number
          water_usage_estimate?: number
          yield_change_pct?: number
        }
        Update: {
          farm_id?: string
          id?: string
          insights?: string[]
          irrigation_recommendation?: string
          last_updated?: string
          pest_risk_pct?: number
          profit_projection?: number
          projected_yield?: number
          risk_score?: number
          water_usage_estimate?: number
          yield_change_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "simulation_results_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_scores: {
        Row: {
          auction_score: number
          community_score: number
          delivery_score: number
          marketplace_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auction_score?: number
          community_score?: number
          delivery_score?: number
          marketplace_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auction_score?: number
          community_score?: number
          delivery_score?: number
          marketplace_score?: number
          updated_at?: string
          user_id?: string
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
      app_role:
        | "farmer"
        | "buyer"
        | "supplier"
        | "transporter"
        | "vet"
        | "agronomist"
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
    Enums: {
      app_role: [
        "farmer",
        "buyer",
        "supplier",
        "transporter",
        "vet",
        "agronomist",
      ],
    },
  },
} as const
