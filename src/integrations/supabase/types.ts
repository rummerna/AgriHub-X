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
      posts: {
        Row: {
          comments: number | null
          content: string
          created_at: string
          id: string
          likes: number | null
          user_id: string
        }
        Insert: {
          comments?: number | null
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          user_id: string
        }
        Update: {
          comments?: number | null
          content?: string
          created_at?: string
          id?: string
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
        }
        Relationships: []
      }
      questions: {
        Row: {
          answers: number | null
          body: string | null
          created_at: string
          id: string
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
          tags?: string[] | null
          title?: string
          user_id?: string
          votes?: number | null
        }
        Relationships: []
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
