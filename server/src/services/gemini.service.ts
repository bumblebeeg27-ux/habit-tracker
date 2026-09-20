import { ApiError, FunctionCallingConfigMode, GoogleGenAI } from '@google/genai';

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

// Gemini occasionally returns a transient 503 ("model overloaded") or 429
// (rate limited) under load; these clear up within a second or two, so a
// short retry avoids surfacing a one-off blip as a hard failure to the user.
const RETRYABLE_STATUSES = new Set([429, 503]);
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err instanceof ApiError ? err.status : undefined;
      if (!status || !RETRYABLE_STATUSES.has(status) || attempt === MAX_RETRIES) {
        throw err;
      }
      console.warn(`Gemini call failed with status ${status}, retrying (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
  throw lastError;
}

export async function callGeminiTool(params: {
  system: string;
  userMessage: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Record<string, unknown>;
  maxOutputTokens?: number;
}): Promise<unknown> {
  const response = await withRetry(() =>
    getClient().models.generateContent({
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
    }),
  );

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
  const response = await withRetry(() =>
    getClient().models.generateContent({
      model: MODEL,
      contents: params.messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      config: {
        systemInstruction: params.system,
        maxOutputTokens: params.maxOutputTokens ?? 1024,
      },
    }),
  );

  const text = response.text;
  if (!text) {
    throw new Error('Gemini did not return a text response');
  }
  return text;
}
