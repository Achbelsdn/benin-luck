import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { Ticket, TicketStatus, RaffleConfig } from '../types';
import { TICKET_PRICE } from '../constants';
import { supabase } from '../services/supabaseClient';

interface LotteryContextType {
  tickets: Ticket[];
  config: RaffleConfig | null;
  loading: boolean;
  reserveTicket: (id: number, name: string, phone: string, transactionId: string) => Promise<boolean>;
  confirmTicket: (id: number) => Promise<void>;
  rejectTicket: (id: number) => Promise<void>;
  deleteParticipant: (id: number) => Promise<void>;
  resetLottery: () => Promise<void>;
  drawWinner: () => Promise<void>;
  updateConfig: (newConfig: Partial<RaffleConfig>) => Promise<boolean>;
  stats: { sold: number; pending: number; available: number; revenue: number };
  isAdmin: boolean;
  toggleAdmin: () => void;
  winner: Ticket | null;
  refreshData: (isManual?: boolean) => Promise<void>;
}

const LotteryContext = createContext<LotteryContextType | undefined>(undefined);

export const LotteryProvider = ({ children }: PropsWithChildren) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [config, setConfig] = useState<RaffleConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchData = async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .order('id', { ascending: true });
      
      if (ticketsError) throw ticketsError;
      
      const { data: configData, error: configError } = await supabase
        .from('raffle_config')
        .select('*')
        .single();
      
      setTickets(ticketsData || []);
      setConfig(configData || null);
    } catch (error: any) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('public_db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raffle_config' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const reserveTicket = async (id: number, name: string, phone: string, transactionId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status: TicketStatus.PENDING,
          purchaser_name: name,
          purchaser_phone: phone,
          transaction_id: transactionId,
          purchase_date: new Date().toISOString()
        })
        .eq('id', id)
        .eq('status', TicketStatus.AVAILABLE);

      if (error) throw error;
      await fetchData();
      return true;
    } catch (error) {
      console.error("Error reserving ticket:", error);
      alert("Ce ticket n'est plus disponible.");
      return false;
    }
  };

  const confirmTicket = async (id: number) => {
    try {
      const { error } = await supabase.from('tickets').update({ status: TicketStatus.SOLD }).eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (error) { alert("Erreur Admin."); }
  };

  const rejectTicket = async (id: number) => {
    try {
      const { error } = await supabase.from('tickets').update({
          status: TicketStatus.AVAILABLE,
          purchaser_name: null,
          purchaser_phone: null,
          transaction_id: null,
          purchase_date: null
        }).eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (error) { alert("Erreur Admin."); }
  };

  const deleteParticipant = async (id: number) => {
      const ticket = tickets.find(t => t.id === id);
      if(!ticket) return;

      if(!window.confirm(`⚠️ SUPPRESSION DÉFINITIVE\n\nÊtes-vous sûr de vouloir supprimer le participant du ticket #${id} ?\n\nNom: ${ticket.purchaser_name || 'Inconnu'}\nStatut: ${ticket.status}\n\nCette action est irréversible.`)) {
          return;
      }

      try {
          const { error } = await supabase.rpc('delete_participant', { ticket_id: id });
          // If RPC fails (e.g. not exists), fallback to direct update
          if (error) {
             console.warn("RPC failed, using fallback delete", error);
             await rejectTicket(id); // Using reject logic which clears the ticket
             return;
          }
          alert("✅ Participant supprimé et ticket remis à zéro.");
          await fetchData();
      } catch (error: any) {
          console.error("Delete error:", error);
          alert("Erreur lors de la suppression : " + error.message);
      }
  };

  const updateConfig = async (newConfig: Partial<RaffleConfig>) => {
      try {
          const { error } = await supabase.from('raffle_config').update(newConfig).eq('id', 1);
          if(error) {
             throw error;
          }
          await fetchData();
          return true;
      } catch (e: any) { 
          console.error(e);
          // Check for specific column error to give helpful advice
          if (e.message?.includes("column") && e.message?.includes("does not exist")) {
             alert(`⚠️ ERREUR BASE DE DONNÉES\n\nUne colonne manque dans votre base Supabase.\n\nMessage technique: ${e.message}\n\n👉 Solution : Veuillez exécuter le script SQL fourni pour ajouter les colonnes 'developer_profiles', 'prize_title', etc.`);
          } else {
             alert("Erreur update: " + e.message); 
          }
          return false;
      }
  };

  // NEW ROBUST RESET FUNCTION WITH FALLBACK
  const resetLottery = async () => {
    if(!window.confirm("🚨 ATTENTION : ZONE DE DANGER !\n\nVous êtes sur le point de :\n1. Supprimer TOUS les participants\n2. Annuler le gagnant actuel\n3. Remettre tous les stats à zéro\n\nÊtes-vous ABSOLUMENT sûr de vouloir tout effacer ?")) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Vous devez être connecté en tant qu'administrateur.");
      return;
    }

    setLoading(true);
    try {
      // 1. Try RPC first (Fastest/Atomic)
      const { error: rpcError } = await supabase.rpc('reset_all_data');

      if (rpcError) {
        console.warn("RPC 'reset_all_data' failed or missing. Using client-side fallback...", rpcError);
        
        // 2. Fallback: Update Tickets
        // We update all tickets that are not available back to available
        const { error: ticketsError } = await supabase
          .from('tickets')
          .update({
            status: TicketStatus.AVAILABLE,
            purchaser_name: null,
            purchaser_phone: null,
            transaction_id: null,
            purchase_date: null
          })
          .gt('id', 0); // Safety clause to target all rows
        
        if (ticketsError) throw ticketsError;

        // 3. Fallback: Reset Config
        const { error: configError } = await supabase
          .from('raffle_config')
          .update({ current_winner_id: null })
          .eq('id', 1);

        if (configError) throw configError;
      }

      alert("✅ Système intégralement réinitialisé !");
      await fetchData(); // Refresh local state
      
    } catch (error: any) {
      console.error("Reset Error:", error);
      alert("Erreur lors du Reset : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const drawWinner = async () => {
    const soldTickets = tickets.filter(t => t.status === TicketStatus.SOLD);
    if (soldTickets.length === 0) {
      alert("Aucun ticket vendu !");
      return;
    }
    const randomIndex = Math.floor(Math.random() * soldTickets.length);
    const winningTicket = soldTickets[randomIndex];

    try {
      const { error } = await supabase.from('raffle_config').update({ current_winner_id: winningTicket.id }).eq('id', 1);
      if (error) throw error;
      await fetchData();
    } catch (error) { alert("Erreur tirage."); }
  };

  const winner = config?.current_winner_id 
    ? tickets.find(t => t.id === config.current_winner_id) || null 
    : null;

  const stats = {
    sold: tickets.filter(t => t.status === TicketStatus.SOLD).length,
    pending: tickets.filter(t => t.status === TicketStatus.PENDING).length,
    available: tickets.filter(t => t.status === TicketStatus.AVAILABLE).length,
    revenue: tickets.filter(t => t.status === TicketStatus.SOLD).length * TICKET_PRICE
  };

  const toggleAdmin = () => setIsAdmin(!isAdmin);

  return (
    <LotteryContext.Provider value={{ tickets, config, loading, reserveTicket, confirmTicket, rejectTicket, deleteParticipant, resetLottery, drawWinner, updateConfig, stats, isAdmin, toggleAdmin, winner, refreshData: fetchData }}>
      {children}
    </LotteryContext.Provider>
  );
};

export const useLottery = () => {
  const context = useContext(LotteryContext);
  if (!context) throw new Error("useLottery must be used within a LotteryProvider");
  return context;
};