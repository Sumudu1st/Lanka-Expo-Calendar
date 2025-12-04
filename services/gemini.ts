import { GoogleGenAI, Type } from "@google/genai";
import { Exhibition } from "../types";
import { format, addMonths } from "date-fns";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: Search for exhibitions using the Google Search Tool.
 * Note: We cannot use responseSchema with Google Search tool.
 */
async function searchExhibitionsRaw(): Promise<string> {
  const ai = getClient();
  const now = new Date();
  const currentMonth = format(now, "MMMM yyyy");
  const nextMonth = format(addMonths(now, 1), "MMMM yyyy");

  // Precise prompt to get the best search results
  const searchPrompt = `
    Find a comprehensive list of upcoming public exhibitions, trade fairs, book fairs, and art shows scheduled in Sri Lanka 
    for ${currentMonth} and ${nextMonth}. 
    For each event, find the exact Name, Venue, Start Date, End Date, and a very brief description.
    If specific times are available, include them.
    Focus on Colombo (BMICH, SLECC) and other major cities.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // We just need the text summary which contains the grounded information
    return response.text || "No information found.";
  } catch (error) {
    console.error("Search Step Failed:", error);
    throw error;
  }
}

/**
 * Step 2: Parse the raw text into structured JSON using a strict schema.
 */
async function parseExhibitionsFromText(rawText: string): Promise<Exhibition[]> {
  const ai = getClient();

  const extractionPrompt = `
    Analyze the following text which contains information about exhibitions in Sri Lanka.
    Extract the events into a structured JSON array.
    
    Rules:
    1. Dates MUST be in YYYY-MM-DD format.
    2. If an end date is not specified, assume it is the same as the start date.
    3. If exact times are missing, omit them.
    4. Generate a unique ID for each event based on name and date.
    5. Only include events that clearly have a name and date.
    
    Text to analyze:
    ---
    ${rawText}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: extractionPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              venue: { type: Type.STRING },
              startDate: { type: Type.STRING, description: "YYYY-MM-DD" },
              endDate: { type: Type.STRING, description: "YYYY-MM-DD" },
              startTime: { type: Type.STRING, nullable: true },
              endTime: { type: Type.STRING, nullable: true },
            },
            required: ["id", "name", "description", "venue", "startDate", "endDate"],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    return JSON.parse(jsonText) as Exhibition[];
  } catch (error) {
    console.error("Parsing Step Failed:", error);
    throw error;
  }
}

export const fetchExhibitions = async (): Promise<Exhibition[]> => {
  // 2-Step Process: Search then Structure
  const rawData = await searchExhibitionsRaw();
  const structuredData = await parseExhibitionsFromText(rawData);
  return structuredData;
};
