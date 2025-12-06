import { GoogleGenerativeAI, GenerateContentResult, ChatSession } from "@google/generative-ai";
import { AgentResponse, GroundingSource } from "../types";

// Helper to extract grounding sources
export const extractSources = (response: GenerateContentResult): GroundingSource[] => {
  const sources: GroundingSource[] = [];
  // Note: Grounding metadata structure may vary based on API version
  const metadata = response.response?.candidates?.[0]?.groundingMetadata;
  const chunks = metadata?.groundingChunks || metadata?.webSearchQueries;

  if (chunks && Array.isArray(chunks)) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || 'Web Source',
          uri: chunk.web.uri || '#',
        });
      }
    });
  }
  return sources;
};

// Get API instance
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing. Please set GEMINI_API_KEY in your .env file");
  return new GoogleGenerativeAI(apiKey);
};

// 1. FOMC Research Agent
// Uses Gemini Flash + Google Search to get macro context
export const runFOMCAgent = async (): Promise<AgentResponse> => {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{ googleSearchRetrieval: {} }]
    });

    const prompt = `
      Act as a Senior Macroeconomic Researcher modeled after a Federal Reserve analyst.
      Use Google Search to find the latest FOMC meeting minutes, recent Fed interest rate decisions, and Jerome Powell's latest press conference summaries.

      Identify:
      1. Current Interest Rate stance (Hawkish/Dovish/Neutral).
      2. Inflation trends (CPI/PCE data).
      3. Recession probability indicators.

      Summarize these findings concisely for an investment committee.
    `;

    const response = await model.generateContent(prompt);
    const text = response.response?.text();

    return {
      rawText: text || "No analysis generated.",
      sources: extractSources(response),
    };
  } catch (error) {
    console.error("FOMC Agent Error:", error);
    throw error;
  }
};

// 2. Financial Advisor (Ticker) Agent
// Uses Gemini Flash + Google Search to get specific stock data
export const runTickerAgent = async (ticker: string): Promise<AgentResponse> => {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{ googleSearchRetrieval: {} }]
    });

    const prompt = `
      Act as a Wall Street Financial Analyst.
      Analyze the stock ticker: ${ticker}.

      Use Google Search to find:
      1. Latest stock price and recent performance (1 month, YTD).
      2. Recent earnings report summary (Beat/Miss?).
      3. Major news headlines affecting the company in the last 30 days.
      4. Current P/E ratio compared to sector average.

      Provide a factual summary of the company's current health.
    `;

    const response = await model.generateContent(prompt);
    const text = response.response?.text();

    return {
      rawText: text || "No analysis generated.",
      sources: extractSources(response),
    };
  } catch (error) {
    console.error("Ticker Agent Error:", error);
    throw error;
  }
};

// 3. Synthesis Agent
// Uses Gemini Pro to combine data and make a recommendation
export const runSynthesisAgent = async (
  ticker: string,
  fomcData: string,
  tickerData: string
): Promise<string> => {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
      You are the Chief Investment Officer (CIO) of a major fund.

      I will provide you with two reports:
      1. **Macroeconomic Report (FOMC):**
      ${fomcData}

      2. **Security Analysis Report for ${ticker}:**
      ${tickerData}

      **Your Task:**
      Synthesize these two reports to generate a final investment recommendation for ${ticker}.

      **Requirements:**
      - Use your reasoning capabilities to connect macro trends (e.g., high rates) to the specific company's business model (e.g., debt heavy vs cash rich).
      - Provide specific advice for three time horizons:
        - **Short Term (0-6 months):** Buy/Hold/Sell rationale.
        - **Medium Term (6-18 months):** Buy/Hold/Sell rationale.
        - **Long Term (3+ years):** Buy/Hold/Sell rationale.
      - Conclude with a clear Risk/Reward Profile (Low/Medium/High).

      Structure the response in valid Markdown.
    `;

    const response = await model.generateContent(prompt);
    return response.response?.text() || "Unable to synthesize recommendation.";
  } catch (error) {
    console.error("Synthesis Agent Error:", error);
    throw error;
  }
};

// 4. Chat Advisor
// Creates a chat session for the "Advisor Chat" tab
export const createAdvisorChat = (): ChatSession => {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `
        You are a Senior Financial Advisor part of the "Gemini Financial Syndicate".

        Your Role:
        1. Listen to the user's financial situation (age, capital, risk tolerance, goals).
        2. Recommend specific stocks, ETFs, or bonds that fit their profile.
        3. Provide current market analysis and trends based on your knowledge.
        4. Be cautious and professional. Always clarify that you are an AI assistant.

        Tone: Professional, Insightful, and Data-Driven.

        Important: Always remind users that this is not personalized financial advice and they should consult with a licensed financial advisor for investment decisions.
      `
    });

    return model.startChat({
      history: [],
    });
  } catch (error) {
    console.error("Chat creation error:", error);
    throw error;
  }
};