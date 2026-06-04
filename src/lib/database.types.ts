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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      entregas: {
        Row: {
          data_entrega: string
          entregue_por: string | null
          id: string
          material_descricao: string
          observacao: string | null
          ordem_servico_id: string
          quantidade: number
          retirado_por_matricula: string | null
          retirado_por_nome: string
        }
        Insert: {
          data_entrega?: string
          entregue_por?: string | null
          id?: string
          material_descricao: string
          observacao?: string | null
          ordem_servico_id: string
          quantidade?: number
          retirado_por_matricula?: string | null
          retirado_por_nome: string
        }
        Update: {
          data_entrega?: string
          entregue_por?: string | null
          id?: string
          material_descricao?: string
          observacao?: string | null
          ordem_servico_id?: string
          quantidade?: number
          retirado_por_matricula?: string | null
          retirado_por_nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "entregas_entregue_por_fkey"
            columns: ["entregue_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          contato_fornecedor: string | null
          criado_em: string
          data_contato: string
          id: string
          observacao: string | null
          pedido_id: string
          previsao_entrega: string | null
          registrado_por: string | null
          situacao: Database["public"]["Enums"]["situacao_followup"]
        }
        Insert: {
          contato_fornecedor?: string | null
          criado_em?: string
          data_contato?: string
          id?: string
          observacao?: string | null
          pedido_id: string
          previsao_entrega?: string | null
          registrado_por?: string | null
          situacao?: Database["public"]["Enums"]["situacao_followup"]
        }
        Update: {
          contato_fornecedor?: string | null
          criado_em?: string
          data_contato?: string
          id?: string
          observacao?: string | null
          pedido_id?: string
          previsao_entrega?: string | null
          registrado_por?: string | null
          situacao?: Database["public"]["Enums"]["situacao_followup"]
        }
        Relationships: [
          {
            foreignKeyName: "followups_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_pedido: {
        Row: {
          codigo_sap: string | null
          descricao: string
          id: string
          pedido_id: string
          quantidade: number
          status_item: Database["public"]["Enums"]["status_item"]
          unidade: string
        }
        Insert: {
          codigo_sap?: string | null
          descricao: string
          id?: string
          pedido_id: string
          quantidade?: number
          status_item?: Database["public"]["Enums"]["status_item"]
          unidade?: string
        }
        Update: {
          codigo_sap?: string | null
          descricao?: string
          id?: string
          pedido_id?: string
          quantidade?: number
          status_item?: Database["public"]["Enums"]["status_item"]
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_compra"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais_os: {
        Row: {
          codigo_sap: string | null
          criado_em: string
          descricao: string
          id: string
          ordem_servico_id: string
          quantidade: number
          unidade: string
        }
        Insert: {
          codigo_sap?: string | null
          criado_em?: string
          descricao: string
          id?: string
          ordem_servico_id: string
          quantidade?: number
          unidade?: string
        }
        Update: {
          codigo_sap?: string | null
          criado_em?: string
          descricao?: string
          id?: string
          ordem_servico_id?: string
          quantidade?: number
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiais_os_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          atualizado_em: string
          criado_em: string
          criado_por: string | null
          descricao: string
          equipamento: string | null
          frota: string
          id: string
          numero_os: string
          prioridade: Database["public"]["Enums"]["prioridade_os"]
          solicitante: string | null
          status: Database["public"]["Enums"]["status_os"]
          tem_estoque: boolean | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          descricao: string
          equipamento?: string | null
          frota: string
          id?: string
          numero_os: string
          prioridade?: Database["public"]["Enums"]["prioridade_os"]
          solicitante?: string | null
          status?: Database["public"]["Enums"]["status_os"]
          tem_estoque?: boolean | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          descricao?: string
          equipamento?: string | null
          frota?: string
          id?: string
          numero_os?: string
          prioridade?: Database["public"]["Enums"]["prioridade_os"]
          solicitante?: string | null
          status?: Database["public"]["Enums"]["status_os"]
          tem_estoque?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_compra: {
        Row: {
          comprador: string | null
          criado_em: string
          data_pedido: string
          fornecedor: string
          id: string
          numero_pedido: string
          previsao_entrega: string | null
          requisicao_id: string
          status: Database["public"]["Enums"]["status_pedido"]
          valor_total: number | null
        }
        Insert: {
          comprador?: string | null
          criado_em?: string
          data_pedido?: string
          fornecedor: string
          id?: string
          numero_pedido: string
          previsao_entrega?: string | null
          requisicao_id: string
          status?: Database["public"]["Enums"]["status_pedido"]
          valor_total?: number | null
        }
        Update: {
          comprador?: string | null
          criado_em?: string
          data_pedido?: string
          fornecedor?: string
          id?: string
          numero_pedido?: string
          previsao_entrega?: string | null
          requisicao_id?: string
          status?: Database["public"]["Enums"]["status_pedido"]
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_compra_requisicao_id_fkey"
            columns: ["requisicao_id"]
            isOneToOne: false
            referencedRelation: "requisicoes_compra"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          criado_em: string
          id: string
          matricula: string | null
          nome: string
          papel: Database["public"]["Enums"]["papel_usuario"]
        }
        Insert: {
          criado_em?: string
          id: string
          matricula?: string | null
          nome?: string
          papel?: Database["public"]["Enums"]["papel_usuario"]
        }
        Update: {
          criado_em?: string
          id?: string
          matricula?: string | null
          nome?: string
          papel?: Database["public"]["Enums"]["papel_usuario"]
        }
        Relationships: []
      }
      recebimentos: {
        Row: {
          data_recebimento: string
          id: string
          observacao: string | null
          pedido_id: string
          ponto_material: string | null
          recebido_por: string | null
        }
        Insert: {
          data_recebimento?: string
          id?: string
          observacao?: string | null
          pedido_id: string
          ponto_material?: string | null
          recebido_por?: string | null
        }
        Update: {
          data_recebimento?: string
          id?: string
          observacao?: string | null
          pedido_id?: string
          ponto_material?: string | null
          recebido_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recebimentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_compra"
            referencedColumns: ["id"]
          },
        ]
      }
      requisicoes_compra: {
        Row: {
          criado_em: string
          id: string
          numero_rc: string
          observacao: string | null
          ordem_servico_id: string
          status: Database["public"]["Enums"]["status_rc"]
          valor_estimado: number | null
        }
        Insert: {
          criado_em?: string
          id?: string
          numero_rc: string
          observacao?: string | null
          ordem_servico_id: string
          status?: Database["public"]["Enums"]["status_rc"]
          valor_estimado?: number | null
        }
        Update: {
          criado_em?: string
          id?: string
          numero_rc?: string
          observacao?: string | null
          ordem_servico_id?: string
          status?: Database["public"]["Enums"]["status_rc"]
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "requisicoes_compra_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      papel_usuario: "admin" | "manutencao" | "compras" | "almoxarifado"
      prioridade_os: "baixa" | "media" | "alta"
      situacao_followup:
        | "aguardando"
        | "em_transporte"
        | "atrasado"
        | "entregue"
      status_item: "pendente" | "recebido"
      status_os:
        | "aberta"
        | "verificando_estoque"
        | "disponivel_estoque"
        | "aguardando_compra"
        | "em_aprovacao"
        | "em_cotacao"
        | "pedido_gerado"
        | "aguardando_entrega"
        | "material_recebido"
        | "liberada_para_manutencao"
        | "programada"
        | "material_entregue"
        | "concluida"
        | "cancelada"
      status_pedido:
        | "gerado"
        | "aprovado"
        | "recebido_parcial"
        | "recebido"
        | "cancelado"
      status_rc: "em_aprovacao" | "aprovada" | "reprovada" | "em_cotacao"
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
      papel_usuario: ["admin", "manutencao", "compras", "almoxarifado"],
      prioridade_os: ["baixa", "media", "alta"],
      situacao_followup: [
        "aguardando",
        "em_transporte",
        "atrasado",
        "entregue",
      ],
      status_item: ["pendente", "recebido"],
      status_os: [
        "aberta",
        "verificando_estoque",
        "disponivel_estoque",
        "aguardando_compra",
        "em_aprovacao",
        "em_cotacao",
        "pedido_gerado",
        "aguardando_entrega",
        "material_recebido",
        "liberada_para_manutencao",
        "programada",
        "material_entregue",
        "concluida",
        "cancelada",
      ],
      status_pedido: [
        "gerado",
        "aprovado",
        "recebido_parcial",
        "recebido",
        "cancelado",
      ],
      status_rc: ["em_aprovacao", "aprovada", "reprovada", "em_cotacao"],
    },
  },
} as const
