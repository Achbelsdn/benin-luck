
export enum TicketStatus {
  AVAILABLE = 'AVAILABLE',
  PENDING = 'PENDING',
  SOLD = 'SOLD',
}

export interface Ticket {
  id: number;
  status: TicketStatus;
  purchaser_name?: string;     // Matches SQL: purchaser_name
  purchaser_phone?: string;    // Matches SQL: purchaser_phone
  transaction_id?: string;     // Matches SQL: transaction_id
  purchase_date?: string;      // Matches SQL: purchase_date
}

export interface Prize {
  id: string;
  title: string;
  description: string;
  type: string;
}

export interface DeveloperProfile {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  socialLink?: string; // New field for social media URL
}

export interface RaffleConfig {
  id: number;
  prize_title: string;
  prize_description: string;
  prize_value: string;
  prize_end_date?: string; // Date de fin du prix actuel
  next_prize_start_date?: string; // Date de début du prochain prix
  draw_date: string | null;
  current_winner_id: number | null;
  developer_info?: string; 
  developer_profiles?: DeveloperProfile[]; 
}

export interface Stats {
  totalTickets: number;
  soldTickets: number;
  pendingTickets: number;
  revenue: number;
}
