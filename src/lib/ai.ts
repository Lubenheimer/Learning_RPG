import { GoogleGenerativeAI } from '@google/generative-ai';

// Uses a free CORS proxy to fetch the raw text of a URL.
export const fetchUrlContent = async (url: string): Promise<string> => {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error('Netzwerkfehler beim Abrufen des Links.');
    }
    
    const data = await response.json();
    
    // Create a temporary DOM element to extract pure text from HTML to save tokens
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    // Basic cleanup
    const scripts = doc.getElementsByTagName('script');
    const styles = doc.getElementsByTagName('style');
    for (let i = scripts.length - 1; i >= 0; i--) scripts[i].remove();
    for (let i = styles.length - 1; i >= 0; i--) styles[i].remove();

    // Limit length to avoid massive token usage on huge sites
    let text = doc.body.textContent || data.contents;
    text = text.replace(/\s+/g, ' ').trim();
    
    return text.substring(0, 15000); 
  } catch (error) {
    console.error('Fehler beim Abrufen der URL:', error);
    throw new Error('Der Link konnte nicht gelesen werden. Möglicherweise blockiert die Seite den Zugriff.');
  }
};

export interface AIGeneratedPlan {
  topicTitle: string;
  topicDescription: string;
  quests: {
    title: string;
    xpValue: number;
    description?: string;
  }[];
}

export const generateLearningPlan = async (apiKey: string, urlContent: string): Promise<AIGeneratedPlan> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Du bist ein Gamification- und Lern-Experte.
Erstelle aus dem folgenden Text-Inhalt eines Links einen strukturierten, motivierenden Lernplan im RPG-Stil.

Ziele:
1. Erkenne das Hauptthema und gib ihm einen präzisen, heldenhaften Titel (z.B. "Meister der C# Grundlagen").
2. Erstelle eine kurze motivierende Beschreibung für das Thema.
3. Leite 3 bis 8 kleinere, gut machbare Quests (Aufgaben) ab, die der Benutzer erledigen sollte, um das Gelesene zu meistern.
4. Jede Quest sollte einen XP-Wert (Erfahrungspunkte) haben, abhängig vom geschätzten Aufwand. (Leicht: 50 XP, Mittel: 100 XP, Schwer: 250 XP).

WICHTIG: Gib das Ergebnis AUSSCHLIESSLICH als korrektes JSON in folgendem Format zurück. Keine Markdown-Umrandung (\`\`\`json), nur das rohe JSON:

{
  "topicTitle": "Name",
  "topicDescription": "Beschreibung",
  "quests": [
    {
      "title": "Quest Titel",
      "xpValue": 100,
      "description": "Kurze Quest-Aufgabe"
    }
  ]
}

Hier ist der Textinhalt:
---
${urlContent}
`;

  try {
    const result = await model.generateContent(prompt);
    let outputText = result.response.text().trim();
    
    // Clean markdown if the model insists on adding it
    if (outputText.startsWith('```json')) {
      outputText = outputText.replace(/^```json/, '').replace(/```$/, '').trim();
    }
    if (outputText.startsWith('```')) {
        outputText = outputText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    return JSON.parse(outputText) as AIGeneratedPlan;
  } catch (error) {
    console.error('Fehler bei der KI-Generierung:', error);
    throw new Error('KI konnte keinen Plan generieren. Bitte überprüfe den API-Key oder die URL.');
  }
};
