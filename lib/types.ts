// Tipus TypeScript que reflecteixen l'esquema de Supabase

export type Database = {
  public: {
    Tables: {
      jornada: {
        Row: Jornada
        Insert: Omit<Jornada, 'id' | 'created_at'>
        Update: Partial<Omit<Jornada, 'id'>>
      }
      poma: {
        Row: Poma
        Insert: Omit<Poma, 'id'>
        Update: Partial<Omit<Poma, 'id'>>
      }
      triturada: {
        Row: Triturada
        Insert: Omit<Triturada, 'id'>
        Update: Partial<Omit<Triturada, 'id'>>
      }
      triturada_origen: {
        Row: TritaradaOrigen
        Insert: Omit<TritaradaOrigen, 'id'>
        Update: Partial<Omit<TritaradaOrigen, 'id'>>
      }
      premsa: {
        Row: Premsa
        Insert: Omit<Premsa, 'id'>
        Update: Partial<Omit<Premsa, 'id'>>
      }
      premsa_origen: {
        Row: PremsaOrigen
        Insert: Omit<PremsaOrigen, 'id'>
        Update: Partial<Omit<PremsaOrigen, 'id'>>
      }
      ebullidor: {
        Row: Ebullidor
        Insert: Omit<Ebullidor, 'id'>
        Update: Partial<Omit<Ebullidor, 'id'>>
      }
      ebullidor_origen: {
        Row: EbullidorOrigen
        Insert: Omit<EbullidorOrigen, 'id'>
        Update: Partial<Omit<EbullidorOrigen, 'id'>>
      }
      suc_directe: {
        Row: SucDirecte
        Insert: Omit<SucDirecte, 'id'>
        Update: Partial<Omit<SucDirecte, 'id'>>
      }
      suc_directe_origen: {
        Row: SucDirecteOrigen
        Insert: Omit<SucDirecteOrigen, 'id'>
        Update: Partial<Omit<SucDirecteOrigen, 'id'>>
      }
      fermentador: {
        Row: Fermentador
        Insert: Omit<Fermentador, 'id'>
        Update: Partial<Omit<Fermentador, 'id'>>
      }
      fermentador_origen: {
        Row: FermentadorOrigen
        Insert: Omit<FermentadorOrigen, 'id'>
        Update: Partial<Omit<FermentadorOrigen, 'id'>>
      }
      embotellat: {
        Row: Embotellat
        Insert: Omit<Embotellat, 'id'>
        Update: Partial<Omit<Embotellat, 'id'>>
      }
      embotellat_bloc: {
        Row: EmbotellAtBloc
        Insert: Omit<EmbotellAtBloc, 'id'>
        Update: Partial<Omit<EmbotellAtBloc, 'id'>>
      }
      tipus_ampolla: {
        Row: TipusAmpolla
        Insert: Omit<TipusAmpolla, 'id'>
        Update: Partial<Omit<TipusAmpolla, 'id'>>
      }
      tipus_tap: {
        Row: TipusTap
        Insert: Omit<TipusTap, 'id'>
        Update: Partial<Omit<TipusTap, 'id'>>
      }
      tipus_sucre: {
        Row: TipusSucre
        Insert: Omit<TipusSucre, 'id'>
        Update: Partial<Omit<TipusSucre, 'id'>>
      }
    }
    Views: {
      v_ampolles: {
        Row: VAmpolla
      }
    }
  }
}

export interface Jornada {
  id: number
  data: string
  notes: string | null
  created_at: string
}

export interface Poma {
  id: number
  jornada_id: number
  codi: string
  varietat: string
  origen: string | null
  maduracio: 'Verd' | 'Punt' | 'Passat' | null
  camera_mesos: number | null
  pes_total_kg: number | null
  pes_usat_kg: number | null
  notes: string | null
}

export interface Triturada {
  id: number
  jornada_id: number
  codi: string
  passades: number
  pes_kg: number | null
  notes: string | null
}

export interface TritaradaOrigen {
  id: number
  triturada_id: number
  poma_id: number
  pes_kg: number
}

export interface Premsa {
  id: number
  jornada_id: number
  codi: string
  pes_kg: number | null
  vol_prod_l: number | null
  vol_usat_l: number | null
  notes: string | null
}

export interface PremsaOrigen {
  id: number
  premsa_id: number
  triturada_id: number
  pes_kg: number
}

export interface Ebullidor {
  id: number
  jornada_id: number
  codi: string
  vol_inicial_l: number | null
  vol_final_l: number | null
  vol_usat_l: number | null
  t_inicial_c: number | null
  t_max_c: number | null
  t_final_c: number | null
  pot_w: number | null
  hora_inici: string | null
  hora_final: string | null
  temps_calor_min: number | null
  temps_fred_min: number | null
  notes: string | null
}

export interface EbullidorOrigen {
  id: number
  ebullidor_id: number
  premsa_id: number
  vol_l: number
}

export interface SucDirecte {
  id: number
  jornada_id:
