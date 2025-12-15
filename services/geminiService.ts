import { GoogleGenAI } from "@google/genai";
import { Ticket } from "../types";

// --- 1. ROBUST API KEY LOADER ---
// Tente de trouver la clé peu importe le système de build (Vite, CRA, Next, ou direct)
const getApiKey = () => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {}

  if (typeof process !== 'undefined' && process.env) {
    if (process.env.API_KEY) return process.env.API_KEY;
    if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    if (process.env.NEXT_PUBLIC_API_KEY) return process.env.NEXT_PUBLIC_API_KEY;
  }
  
  return null;
};

const apiKey = getApiKey();
// Initialisation sécurisée pour ne pas faire planter l'app si la clé manque
const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_KEY" });

// --- 2. THE LOCAL FALLBACK BRAIN (Plan B) ---
// Si l'IA échoue, ce cerveau prend le relais. C'est infaillible.
const getLocalFallbackResponse = (message: string): string => {
  const lowerMsg = message.toLowerCase();

  // Créateur / Dev
  if (lowerMsg.includes('créateur') || lowerMsg.includes('createur') || lowerMsg.includes('fait le site') || lowerMsg.includes('dev') || lowerMsg.includes('conçu')) {
    return "Le site a été conçu par Achbel SODJINOU, un Hacker Étique et expert en sécurité numérique reconnu pour ses solutions innovantes.";
  }
  
  // Prix / Coût
  if (lowerMsg.includes('prix') || lowerMsg.includes('coût') || lowerMsg.includes('combien') || lowerMsg.includes('payer')) {
    return "Le ticket coûte 100 FCFA. Le paiement se fait par Mobile Money (MTN ou Celtiis) sur les numéros indiqués après avoir cliqué sur un ticket.";
  }

  // Règles / Comment jouer
  if (lowerMsg.includes('règle') || lowerMsg.includes('comment') || lowerMsg.includes('marche') || lowerMsg.includes('jouer')) {
    return "C'est simple : 1. Cliquez sur un ticket vert (Libre). 2. Payez 100 FCFA aux numéros affichés. 3. Validez avec votre ID de transaction. Un tirage au sort désignera le gagnant.";
  }

  // Lots / Gains
  if (lowerMsg.includes('lot') || lowerMsg.includes('gagner') || lowerMsg.includes('gain')) {
    return "Vous pouvez gagner des lots de valeur : Formations complètes, Ebooks premium, et Abonnements divers. Consultez la page d'accueil pour le lot en cours.";
  }

  // Arnaque / Fiabilité
  if (lowerMsg.includes('arnaque') || lowerMsg.includes('vrai') || lowerMsg.includes('faux') || lowerMsg.includes('sur')) {
    return "Bénin Luck est une plateforme transparente. Chaque tirage est aléatoire et les gagnants sont affichés publiquement. Le créateur, Achbel SODJINOU, garantit la sécurité du système.";
  }

  // Bonjour / Salutations
  if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut') || lowerMsg.includes('hello') || lowerMsg.includes('ça va')) {
    return "Bonjour ! Je suis l'assistant Bénin Luck. Je suis là pour vous aider en mode 'Secours' (Connexion IA instable). Posez votre question !";
  }

  // Default Fallback
  return "Je suis actuellement en mode maintenance IA, mais je peux vous dire que le ticket coûte 100F et que le site est sécurisé par le Bureau de Développement Technique. Pour d'autres questions, contactez le support.";
};

// Chat capability
export const getChatResponse = async (message: string): Promise<string> => {
  // Debug pour vous dans la console du navigateur (F12)
  console.log("API Key Status:", apiKey ? "Present (Ends with ..."+apiKey.slice(-4)+")" : "MISSING");

  // Si pas de clé, on passe direct au cerveau local sans attendre l'erreur Google
  if (!apiKey || apiKey === "MISSING_KEY") {
    console.warn("Using Local Fallback (No Key)");
    return getLocalFallbackResponse(message);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: `Tu es l'assistant virtuel de "Bénin Luck".
        Info Créateur : Achbel SODJINOU, Hacker Étique et expert sécurité.
        Prix ticket : 100 FCFA.
        Réponds de manière courte et serviable.`,
      }
    });
    return response.text || getLocalFallbackResponse(message);
  } catch (error: any) {
    console.error("Chat API Error (Switching to Fallback):", error);
    // C'EST ICI QUE LA MAGIE OPÈRE : Si Google plante, on répond quand même.
    return getLocalFallbackResponse(message);
  }
};

export const generateWinnerAnnouncement = async (ticket: Ticket, prizeName: string): Promise<string> => {
  // Même logique de fallback pour l'annonce
  if (!apiKey || apiKey === "MISSING_KEY") {
     return `Félicitations à ${ticket.purchaser_name || "notre gagnant"} ! 🎉`;
  }

  try {
    const winnerName = ticket.purchaser_name || "Gagnant";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Félicite ${winnerName} pour avoir gagné ${prizeName}. Court et festif.`,
    });
    return response.text || `Bravo ${winnerName} ! 🎉`;
  } catch (error) {
    return `Félicitations à ${ticket.purchaser_name || "Gagnant"} qui remporte ${prizeName} ! 🎉`;
  }
};

export const generateMarketingCopy = async (prizeName: string): Promise<string> => {
  return "La chance d'une vie.";
}