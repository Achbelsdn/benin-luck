import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ticket } from "../types"; 

// --- 1. RÉCUPÉRATION DE LA CLÉ ---
const API_KEY = import.meta.env.VITE_API_KEY;

// --- 2. CONFIGURATION DE L'IA ---
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const getChatResponse = async (message: string): Promise<string> => {
  // DIAGNOSTIC
  if (!API_KEY) {
    console.error("ERREUR FATALE: Aucune clé API trouvée.");
    return "❌ ERREUR CONFIG : La clé API est manquante.";
  }

  try {
    // TENTATIVE 1 : On essaie le modèle rapide (Flash)
    // J'ai ajouté "-latest" qui règle souvent le problème de version
    const model = genAI!.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      systemInstruction: "Tu es l'assistant de Bénin Luck. Tu es cool, serviable et tu parles français. Tes réponses sont courtes."
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.warn("Erreur modèle Flash, tentative avec Gemini Pro...", error.message);

    // TENTATIVE 2 (SAUVETAGE) : Si Flash plante (404), on prend le modèle standard
    if (error.message.includes("404") || error.message.includes("not found")) {
      try {
        const fallbackModel = genAI!.getGenerativeModel({ model: "gemini-pro" });
        const result = await fallbackModel.generateContent(message);
        return (await result.response).text();
      } catch (e) {
        return "Je suis là, mais mes serveurs sont surchargés pour le moment. Réessayez dans une minute !";
      }
    }

    return `❌ ERREUR GOOGLE : ${error.message}`;
  }
};

// --- Fonctions annexes ---
export const generateWinnerAnnouncement = async (ticket: any, prizeName: string) => {
    return `Bravo à ${ticket.purchaser_name || "l'utilisateur"} pour ce lot !`;
};

export const generateMarketingCopy = async (prizeName: string) => {
  return "Tentez votre chance !";
};
