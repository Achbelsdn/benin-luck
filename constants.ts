import { Prize } from './types';

export const TICKET_PRICE = 100;
export const TOTAL_TICKETS = 100;
export const CURRENCY = "FCFA";

// Updated Numbers (01 Prefix) as requested
export const PAYMENT_NUMBERS = [
  { provider: 'MTN Bénin', number: '01 42 32 32 26', color: 'bg-yellow-400 text-black' },
  { provider: 'Celtiis', number: '01 40 54 11 44', color: 'bg-indigo-600 text-white' }
];

export const INITIAL_PRIZE: Prize = {
  id: 'prize-1',
  title: "Formation Complète en Marketing Digital",
  description: "Une formation de 3 mois avec certification pour lancer votre business en ligne.",
  type: 'FORMATION'
};