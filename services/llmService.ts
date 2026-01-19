import { GoogleGenAI } from "@google/genai";
import { AppConfig } from '../types';

export interface LLMSession {
  provider: 'gemini' | 'openai';
  geminiChat?: any;
  openaiHistory?: any[];
}

export const initializeSession = (config: AppConfig): LLMSession => {
  if (!config.apiKey) {
    throw new Error("API Key is missing");
  }

  if (config.provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    // Initialize chat with system instruction
    return {
      provider: 'gemini',
      geminiChat: ai.chats.create({
        model: config.model,
        config: {
          systemInstruction: config.systemPrompt,
          temperature: config.temperature,
        }
      })
    };
  } else {
    // OpenAI / Compatible
    const history: any[] = [];
    if (config.systemPrompt) {
      history.push({ role: 'system', content: config.systemPrompt });
    }
    return {
      provider: 'openai',
      openaiHistory: history
    };
  }
};

export const processChunkWithLLM = async (
  text: string,
  config: AppConfig,
  session?: LLMSession
): Promise<string> => {
  if (!config.apiKey) {
    throw new Error("API Key is missing");
  }

  // --- Contextual / Session Mode ---
  if (session) {
    if (session.provider === 'gemini') {
      if (!session.geminiChat) throw new Error("Gemini Session not initialized");
      try {
        const response = await session.geminiChat.sendMessage({ message: text });
        return response.text || "";
      } catch (error: any) {
        console.error("Gemini Session Request Failed", error);
        throw new Error(error.message || "Gemini API Error");
      }
    } else {
      // OpenAI Session
      if (!session.openaiHistory) throw new Error("OpenAI Session not initialized");
      
      // Optimistically add User Message
      session.openaiHistory.push({ role: 'user', content: text });

      const baseUrl = config.baseUrl.replace(/\/$/, '');
      const endpoint = `${baseUrl}/chat/completions`;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            temperature: config.temperature,
            messages: session.openaiHistory,
            stream: false,
          }),
        });

        if (!response.ok) {
          // Remove the failed user message so we can retry without dupes
          session.openaiHistory.pop();
          const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
          throw new Error(errorData.error?.message || `HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        const result = data.choices?.[0]?.message?.content;

        if (typeof result !== 'string') {
           session.openaiHistory.pop();
           throw new Error("Invalid response format from provider");
        }
        
        // Add Assistant Message to history
        session.openaiHistory.push({ role: 'assistant', content: result });

        return result;
      } catch (error: any) {
         // If network failed, check if we need to cleanup the user message
         const lastMsg = session.openaiHistory[session.openaiHistory.length - 1];
         if (lastMsg && lastMsg.role === 'user' && lastMsg.content === text) {
             session.openaiHistory.pop();
         }
         console.error("LLM Request Failed", error);
         throw new Error(error.message || "Unknown error occurred");
      }
    }
  }

  // --- Stateless Mode (Original Logic) ---

  // Construct System Message Content
  // Filter out empty parts to avoid leading newlines or sending empty system messages
  const systemContent = config.systemPrompt?.trim() || '';

  // --- Gemini Provider ---
  if (config.provider === 'gemini') {
    try {
      const ai = new GoogleGenAI({ apiKey: config.apiKey });
      
      const requestConfig: any = {
        temperature: config.temperature,
      };

      // Only add systemInstruction if content exists
      if (systemContent) {
        requestConfig.systemInstruction = systemContent;
      }

      const response = await ai.models.generateContent({
        model: config.model,
        contents: text,
        config: requestConfig,
      });
      return response.text || "";
    } catch (error: any) {
      console.error("Gemini Request Failed", error);
      throw new Error(error.message || "Gemini API Error");
    }
  }

  // --- OpenAI Provider (Default) ---
  
  const messages = [];
  
  // Only add system role if there is content
  if (systemContent) {
    messages.push({ role: 'system', content: systemContent });
  }
  
  messages.push({ role: 'user', content: text });

  // Remove trailing slash from baseUrl if present
  const baseUrl = config.baseUrl.replace(/\/$/, '');
  const endpoint = `${baseUrl}/chat/completions`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: config.temperature,
        messages: messages,
        stream: false, // Not handling streaming for simplicity in this version
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(errorData.error?.message || `HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
      throw new Error("Invalid response format from provider");
    }

    return content;
  } catch (error: any) {
    console.error("LLM Request Failed", error);
    throw new Error(error.message || "Unknown error occurred");
  }
};
