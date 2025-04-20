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
      appointments: {
        Row: {
          appointmentid: string
          date: string
          patientid: string | null
          providerid: string | null
          status: string | null
          time: string
        }
        Insert: {
          appointmentid?: string
          date: string
          patientid?: string | null
          providerid?: string | null
          status?: string | null
          time: string
        }
        Update: {
          appointmentid?: string
          date?: string
          patientid?: string | null
          providerid?: string | null
          status?: string | null
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patientid_fkey"
            columns: ["patientid"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patientid"]
          },
          {
            foreignKeyName: "appointments_providerid_fkey"
            columns: ["providerid"]
            isOneToOne: false
            referencedRelation: "healthcareproviders"
            referencedColumns: ["providerid"]
          },
        ]
      }
      baselinehealthmetrics: {
        Row: {
          bloodpressure: string | null
          heartrate: number | null
          mentalhealthindex: number | null
          metricid: string
          othermetrics: string | null
          patientid: string | null
        }
        Insert: {
          bloodpressure?: string | null
          heartrate?: number | null
          mentalhealthindex?: number | null
          metricid?: string
          othermetrics?: string | null
          patientid?: string | null
        }
        Update: {
          bloodpressure?: string | null
          heartrate?: number | null
          mentalhealthindex?: number | null
          metricid?: string
          othermetrics?: string | null
          patientid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "baselinehealthmetrics_patientid_fkey"
            columns: ["patientid"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patientid"]
          },
        ]
      }
      familymembers: {
        Row: {
          contact: string
          name: string
          patientid: string | null
          relationid: string
          relationship: string
        }
        Insert: {
          contact: string
          name: string
          patientid?: string | null
          relationid?: string
          relationship: string
        }
        Update: {
          contact?: string
          name?: string
          patientid?: string | null
          relationid?: string
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "familymembers_patientid_fkey"
            columns: ["patientid"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patientid"]
          },
        ]
      }
      healthcareproviders: {
        Row: {
          contact: string
          credentials: string | null
          name: string
          patientid: string | null
          providerid: string
          schedule: string | null
          specialization: string
        }
        Insert: {
          contact: string
          credentials?: string | null
          name: string
          patientid?: string | null
          providerid?: string
          schedule?: string | null
          specialization: string
        }
        Update: {
          contact?: string
          credentials?: string | null
          name?: string
          patientid?: string | null
          providerid?: string
          schedule?: string | null
          specialization?: string
        }
        Relationships: [
          {
            foreignKeyName: "healthcareproviders_patientid_fkey"
            columns: ["patientid"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patientid"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          contact: string
          dob: string
          gender: string | null
          lifestylefactors: string | null
          medicalhistory: string | null
          name: string
          patientid: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          contact: string
          dob: string
          gender?: string | null
          lifestylefactors?: string | null
          medicalhistory?: string | null
          name: string
          patientid?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          contact?: string
          dob?: string
          gender?: string | null
          lifestylefactors?: string | null
          medicalhistory?: string | null
          name?: string
          patientid?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      recoverylogs: {
        Row: {
          adherence: string | null
          date: string
          logid: string
          mobilitystatus: string | null
          notes: string | null
          painlevels: string | null
          patientid: string | null
          vitalsigns: string | null
        }
        Insert: {
          adherence?: string | null
          date: string
          logid?: string
          mobilitystatus?: string | null
          notes?: string | null
          painlevels?: string | null
          patientid?: string | null
          vitalsigns?: string | null
        }
        Update: {
          adherence?: string | null
          date?: string
          logid?: string
          mobilitystatus?: string | null
          notes?: string | null
          painlevels?: string | null
          patientid?: string | null
          vitalsigns?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recoverylogs_patientid_fkey"
            columns: ["patientid"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patientid"]
          },
        ]
      }
      treatments: {
        Row: {
          duration: number | null
          enddate: string | null
          medication: string | null
          patientid: string | null
          startdate: string | null
          therapy: string | null
          treatmentid: string
          treatmenttype: string
        }
        Insert: {
          duration?: number | null
          enddate?: string | null
          medication?: string | null
          patientid?: string | null
          startdate?: string | null
          therapy?: string | null
          treatmentid?: string
          treatmenttype: string
        }
        Update: {
          duration?: number | null
          enddate?: string | null
          medication?: string | null
          patientid?: string | null
          startdate?: string | null
          therapy?: string | null
          treatmentid?: string
          treatmenttype?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatments_patientid_fkey"
            columns: ["patientid"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patientid"]
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
