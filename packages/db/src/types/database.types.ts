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
      _card_labels: {
        Row: {
          cardId: number
          labelId: number
        }
        Insert: {
          cardId: number
          labelId: number
        }
        Update: {
          cardId?: number
          labelId?: number
        }
        Relationships: [
          {
            foreignKeyName: "_card_labels_cardId_card_id_fk"
            columns: ["cardId"]
            isOneToOne: false
            referencedRelation: "card"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_card_labels_labelId_label_id_fk"
            columns: ["labelId"]
            isOneToOne: false
            referencedRelation: "label"
            referencedColumns: ["id"]
          },
        ]
      }
      _card_workspace_members: {
        Row: {
          cardId: number
          workspaceMemberId: number
        }
        Insert: {
          cardId: number
          workspaceMemberId: number
        }
        Update: {
          cardId?: number
          workspaceMemberId?: number
        }
        Relationships: [
          {
            foreignKeyName: "_card_workspace_members_cardId_card_id_fk"
            columns: ["cardId"]
            isOneToOne: false
            referencedRelation: "card"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_card_workspace_members_workspaceMemberId_workspace_members_id_"
            columns: ["workspaceMemberId"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["id"]
          },
        ]
      }
      board: {
        Row: {
          createdAt: string
          createdBy: string
          deletedAt: string | null
          deletedBy: string | null
          description: string | null
          id: number
          importId: number | null
          name: string
          publicId: string
          slug: string
          updatedAt: string | null
          visibility: Database["public"]["Enums"]["board_visibility"]
          workspaceId: number
        }
        Insert: {
          createdAt?: string
          createdBy: string
          deletedAt?: string | null
          deletedBy?: string | null
          description?: string | null
          id?: number
          importId?: number | null
          name: string
          publicId: string
          slug: string
          updatedAt?: string | null
          visibility?: Database["public"]["Enums"]["board_visibility"]
          workspaceId: number
        }
        Update: {
          createdAt?: string
          createdBy?: string
          deletedAt?: string | null
          deletedBy?: string | null
          description?: string | null
          id?: number
          importId?: number | null
          name?: string
          publicId?: string
          slug?: string
          updatedAt?: string | null
          visibility?: Database["public"]["Enums"]["board_visibility"]
          workspaceId?: number
        }
        Relationships: [
          {
            foreignKeyName: "board_createdBy_user_id_fk"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_deletedBy_user_id_fk"
            columns: ["deletedBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_importId_import_id_fk"
            columns: ["importId"]
            isOneToOne: false
            referencedRelation: "import"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_workspaceId_workspace_id_fk"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      card: {
        Row: {
          createdAt: string
          createdBy: string
          deletedAt: string | null
          deletedBy: string | null
          description: string | null
          id: number
          importId: number | null
          index: number
          listId: number
          publicId: string
          title: string
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string
          createdBy: string
          deletedAt?: string | null
          deletedBy?: string | null
          description?: string | null
          id?: number
          importId?: number | null
          index: number
          listId: number
          publicId: string
          title: string
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string
          createdBy?: string
          deletedAt?: string | null
          deletedBy?: string | null
          description?: string | null
          id?: number
          importId?: number | null
          index?: number
          listId?: number
          publicId?: string
          title?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_createdBy_user_id_fk"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_deletedBy_user_id_fk"
            columns: ["deletedBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_importId_import_id_fk"
            columns: ["importId"]
            isOneToOne: false
            referencedRelation: "import"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_listId_list_id_fk"
            columns: ["listId"]
            isOneToOne: false
            referencedRelation: "list"
            referencedColumns: ["id"]
          },
        ]
      }
      card_activity: {
        Row: {
          cardId: number
          commentId: number | null
          createdAt: string
          createdBy: string
          fromComment: string | null
          fromDescription: string | null
          fromIndex: number | null
          fromListId: number | null
          fromTitle: string | null
          id: number
          labelId: number | null
          publicId: string
          toComment: string | null
          toDescription: string | null
          toIndex: number | null
          toListId: number | null
          toTitle: string | null
          type: Database["public"]["Enums"]["card_activity_type"]
          workspaceMemberId: number | null
        }
        Insert: {
          cardId: number
          commentId?: number | null
          createdAt?: string
          createdBy: string
          fromComment?: string | null
          fromDescription?: string | null
          fromIndex?: number | null
          fromListId?: number | null
          fromTitle?: string | null
          id?: number
          labelId?: number | null
          publicId: string
          toComment?: string | null
          toDescription?: string | null
          toIndex?: number | null
          toListId?: number | null
          toTitle?: string | null
          type: Database["public"]["Enums"]["card_activity_type"]
          workspaceMemberId?: number | null
        }
        Update: {
          cardId?: number
          commentId?: number | null
          createdAt?: string
          createdBy?: string
          fromComment?: string | null
          fromDescription?: string | null
          fromIndex?: number | null
          fromListId?: number | null
          fromTitle?: string | null
          id?: number
          labelId?: number | null
          publicId?: string
          toComment?: string | null
          toDescription?: string | null
          toIndex?: number | null
          toListId?: number | null
          toTitle?: string | null
          type?: Database["public"]["Enums"]["card_activity_type"]
          workspaceMemberId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "card_activity_cardId_card_id_fk"
            columns: ["cardId"]
            isOneToOne: false
            referencedRelation: "card"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_activity_commentId_card_comments_id_fk"
            columns: ["commentId"]
            isOneToOne: false
            referencedRelation: "card_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_activity_createdBy_user_id_fk"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_activity_fromListId_list_id_fk"
            columns: ["fromListId"]
            isOneToOne: false
            referencedRelation: "list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_activity_labelId_label_id_fk"
            columns: ["labelId"]
            isOneToOne: false
            referencedRelation: "label"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_activity_toListId_list_id_fk"
            columns: ["toListId"]
            isOneToOne: false
            referencedRelation: "list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_activity_workspaceMemberId_workspace_members_id_fk"
            columns: ["workspaceMemberId"]
            isOneToOne: false
            referencedRelation: "workspace_members"
            referencedColumns: ["id"]
          },
        ]
      }
      card_comments: {
        Row: {
          cardId: number
          comment: string
          createdAt: string
          createdBy: string
          deletedAt: string | null
          deletedBy: string | null
          id: number
          publicId: string
          updatedAt: string | null
        }
        Insert: {
          cardId: number
          comment: string
          createdAt?: string
          createdBy: string
          deletedAt?: string | null
          deletedBy?: string | null
          id?: number
          publicId: string
          updatedAt?: string | null
        }
        Update: {
          cardId?: number
          comment?: string
          createdAt?: string
          createdBy?: string
          deletedAt?: string | null
          deletedBy?: string | null
          id?: number
          publicId?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_comments_cardId_card_id_fk"
            columns: ["cardId"]
            isOneToOne: false
            referencedRelation: "card"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_comments_createdBy_user_id_fk"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_comments_deletedBy_user_id_fk"
            columns: ["deletedBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          createdAt: string
          createdBy: string
          feedback: string
          id: number
          reviewed: boolean
          updatedAt: string | null
          url: string
        }
        Insert: {
          createdAt?: string
          createdBy: string
          feedback: string
          id?: number
          reviewed?: boolean
          updatedAt?: string | null
          url: string
        }
        Update: {
          createdAt?: string
          createdBy?: string
          feedback?: string
          id?: number
          reviewed?: boolean
          updatedAt?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_createdBy_user_id_fk"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      import: {
        Row: {
          createdAt: string
          createdBy: string
          id: number
          publicId: string
          source: Database["public"]["Enums"]["source"]
          status: Database["public"]["Enums"]["status"]
        }
        Insert: {
          createdAt?: string
          createdBy: string
          id?: number
          publicId: string
          source: Database["public"]["Enums"]["source"]
          status: Database["public"]["Enums"]["status"]
        }
        Update: {
          createdAt?: string
          createdBy?: string
          id?: number
          publicId?: string
          source?: Database["public"]["Enums"]["source"]
          status?: Database["public"]["Enums"]["status"]
        }
        Relationships: [
          {
            foreignKeyName: "import_createdBy_user_id_fk"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      label: {
        Row: {
          boardId: number
          colourCode: string | null
          createdAt: string
          createdBy: string
          id: number
          importId: number | null
          name: string
          publicId: string
          updatedAt: string | null
        }
        Insert: {
          boardId: number
          colourCode?: string | null
          createdAt?: string
          createdBy: string
          id?: number
          importId?: number | null
          name: string
          publicId: string
          updatedAt?: string | null
        }
        Update: {
          boardId?: number
          colourCode?: string | null
          createdAt?: string
          createdBy?: string
          id?: number
          importId?: number | null
          name?: string
          publicId?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "label_boardId_board_id_fk"
            columns: ["boardId"]
            isOneToOne: false
            referencedRelation: "board"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "label_createdBy_user_id_fk"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "label_importId_import_id_fk"
            columns: ["importId"]
            isOneToOne: false
            referencedRelation: "import"
            referencedColumns: ["id"]
          },
        ]
      }
      list: {
        Row: {
          boardId: number
          createdAt: string
          createdBy: string
          deletedAt: string | null
          deletedBy: string | null
          id: number
          importId: number | null
          index: number
          name: string
          publicId: string
          updatedAt: string | null
        }
        Insert: {
          boardId: number
          createdAt?: string
          createdBy: string
          deletedAt?: string | null
          deletedBy?: string | null
          id?: number
          importId?: number | null
          index: number
          name: string
          publicId: string
          updatedAt?: string | null
        }
        Update: {
          boardId?: number
          createdAt?: string
          createdBy?: string
          deletedAt?: string | null
          deletedBy?: string | null
          id?: number
          importId?: number | null
          index?: number
          name?: string
          publicId?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_boardId_board_id_fk"
            columns: ["boardId"]
            isOneToOne: false
            referencedRelation: "board"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_createdBy_user_id_fk"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_deletedBy_user_id_fk"
            columns: ["deletedBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_importId_import_id_fk"
            columns: ["importId"]
            isOneToOne: false
            referencedRelation: "import"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          email: string
          emailVerified: string | null
          id: string
          image: string | null
          name: string | null
          stripeCustomerId: string | null
        }
        Insert: {
          email: string
          emailVerified?: string | null
          id: string
          image?: string | null
          name?: string | null
          stripeCustomerId?: string | null
        }
        Update: {
          email?: string
          emailVerified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          stripeCustomerId?: string | null
        }
        Relationships: []
      }
      workspace: {
        Row: {
          createdAt: string
          createdBy: string
          deletedAt: string | null
          deletedBy: string | null
          description: string | null
          id: number
          name: string
          plan: Database["public"]["Enums"]["workspace_plan"]
          publicId: string
          slug: string
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string
          createdBy: string
          deletedAt?: string | null
          deletedBy?: string | null
          description?: string | null
          id?: number
          name: string
          plan?: Database["public"]["Enums"]["workspace_plan"]
          publicId: string
          slug: string
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string
          createdBy?: string
          deletedAt?: string | null
          deletedBy?: string | null
          description?: string | null
          id?: number
          name?: string
          plan?: Database["public"]["Enums"]["workspace_plan"]
          publicId?: string
          slug?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_createdBy_user_id_fk"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_deletedBy_user_id_fk"
            columns: ["deletedBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          createdAt: string
          createdBy: string
          deletedAt: string | null
          deletedBy: string | null
          id: number
          publicId: string
          role: Database["public"]["Enums"]["role"]
          status: Database["public"]["Enums"]["member_status"]
          updatedAt: string | null
          userId: string
          workspaceId: number
        }
        Insert: {
          createdAt?: string
          createdBy: string
          deletedAt?: string | null
          deletedBy?: string | null
          id?: number
          publicId: string
          role: Database["public"]["Enums"]["role"]
          status?: Database["public"]["Enums"]["member_status"]
          updatedAt?: string | null
          userId: string
          workspaceId: number
        }
        Update: {
          createdAt?: string
          createdBy?: string
          deletedAt?: string | null
          deletedBy?: string | null
          id?: number
          publicId?: string
          role?: Database["public"]["Enums"]["role"]
          status?: Database["public"]["Enums"]["member_status"]
          updatedAt?: string | null
          userId?: string
          workspaceId?: number
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_deletedBy_user_id_fk"
            columns: ["deletedBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_userId_user_id_fk"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspaceId_workspace_id_fk"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_slugs: {
        Row: {
          slug: string
          type: Database["public"]["Enums"]["slug_type"]
        }
        Insert: {
          slug: string
          type: Database["public"]["Enums"]["slug_type"]
        }
        Update: {
          slug?: string
          type?: Database["public"]["Enums"]["slug_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_workspace_admin: {
        Args: {
          user_id: string
          workspace_id: number
        }
        Returns: boolean
      }
      push_card_index: {
        Args: {
          list_id: number
          card_index: number
        }
        Returns: undefined
      }
      reorder_cards: {
        Args: {
          card_id: number
          current_list_id: number
          new_list_id: number
          current_index: number
          new_index: number
        }
        Returns: boolean
      }
      reorder_lists: {
        Args: {
          board_id: number
          list_id: number
          current_index: number
          new_index: number
        }
        Returns: boolean
      }
      shift_card_index: {
        Args: {
          list_id: number
          card_index: number
        }
        Returns: undefined
      }
      shift_list_index: {
        Args: {
          board_id: number
          list_index: number
        }
        Returns: undefined
      }
    }
    Enums: {
      board_visibility: "private" | "public"
      card_activity_type:
        | "card.created"
        | "card.updated.title"
        | "card.updated.description"
        | "card.updated.index"
        | "card.updated.list"
        | "card.updated.label.added"
        | "card.updated.label.removed"
        | "card.updated.member.added"
        | "card.updated.member.removed"
        | "card.archived"
        | "card.updated.comment.added"
        | "card.updated.comment.updated"
        | "card.updated.comment.deleted"
      member_status: "invited" | "active" | "removed"
      role: "admin" | "member" | "guest"
      slug_type: "reserved" | "premium"
      source: "trello"
      status: "started" | "success" | "failed"
      workspace_invite_status: "pending" | "accepted" | "cancelled"
      workspace_plan: "free" | "pro" | "enterprise"
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
