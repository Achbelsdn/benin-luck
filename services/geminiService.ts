import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ticket } from "../types"; 

// --- 1. CONFIGURATION ---
const API_KEY = import.meta.env.VITE_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Liste de tous les modèles à tester, du plus récent au plus vieux
// Si le premier échoue, il tente le suivant automatiquement.
const MODELS_TO_TRY = [
  "gemini-2.0-flash",        // Ton choix (Beta)
  "gemini-2.0-flash-exp",    // Variante expérimentale souvent requise
  "gemini-1.5-flash",        // Le standard rapide
  "gemini-1.5-flash-latest", // Variante
  "gemini-pro"               // Le classique (marche toujours)
];

const CONTEXTE = `
INSTRUCTION : Tu es l'assistant de "Bénin Luck".
Créateur : Achbel SODJINOU.
Règle : Ticket à 100 FCFA.
Ton : Sympa, court.
`;

export const getChatResponse = async (message: string): Promise<string> => {
  if (!API_KEY) return "❌ Erreur : Clé API manquante.";

  // On boucle sur la liste des modèles jusqu'à ce qu'un fonctionne
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Tentative avec le modèle : ${modelName}...`);
      
      const model = genAI!.getGenerativeModel({ model: modelName });
      const prompt = CONTEXTE + "\nQuestion: " + message;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Si on arrive ici, c'est que ça a marché !
      return response.text();

    } catch (error: any) {
      console.warn(`Échec avec ${modelName} :`, error.message);
      
      // Si c'est le dernier modèle et qu'il a échoué aussi...
      if (modelName === MODELS_TO_TRY[MODELS_TO_TRY.length - 1]) {
        // Analyse spécifique de l'erreur "Failed to fetch"
        if (error.message.includes("Failed to fetch")) {
            return "⚠️ Erreur de connexion (Failed to fetch). Désactivez votre bloqueur de pub (AdBlock) ou vérifiez votre connexion internet.";
        }
        return `❌ Tous les modèles ont échoué. Erreur : ${error.message}`;
      }
      // Sinon, on continue la boucle vers le modèle suivant...
    }
  }
  
  return "❌ Erreur inconnue.";
};

// --- Helpers ---
export const generateWinnerAnnouncement = async (ticket: any, prizeName: string) => {
    return `Bravo à ${ticket.purchaser_name || "l'utilisateur"} !`;
};

export const generateMarketingCopy = async (prizeName: string) => {
  return "Tentez votre chance !";
};
