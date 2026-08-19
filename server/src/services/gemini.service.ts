import { FunctionCallingConfigMode, GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const MODEL = 'gemini-3.6-flash';

export async function callGeminiTool(params: {
  system: string;
  userMessage: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Record<string, unknown>;
  maxOutputTokens?: number;
}): Promise<unknown> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: params.userMessage,
    config: {
      systemInstruction: params.system,
      maxOutputTokens: params.maxOutputTokens ?? 4096,
      tools: [
        {
          functionDeclarations: [
            {
              name: params.toolName,
              description: params.toolDescription,
              parametersJsonSchema: params.inputSchema,
            },
          ],
        },
      ],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: [params.toolName],
        },
      },
    },
  });

  const call = response.functionCalls?.[0];
  if (!call || !call.args) {
    throw new Error('Gemini did not return a function call response');
  }
  return call.args;
}

export async function callGeminiText(params: {
  system: string;
  messages: { role: 'user' | 'model'; text: string }[];
  maxOutputTokens?: number;
}): Promise<string> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: params.messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    config: {
      systemInstruction: params.system,
      maxOutputTokens: params.maxOutputTokens ?? 1024,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini did not return a text response');
  }
  return text;
}
