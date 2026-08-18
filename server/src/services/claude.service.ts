import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');
    client = new Anthropic({ apiKey });
  }
  return client;
}

const MODEL = 'claude-sonnet-4-5';

export async function callClaudeTool<T>(params: {
  system: string;
  userMessage: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Record<string, unknown>;
  maxTokens?: number;
}): Promise<unknown> {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: [{ role: 'user', content: params.userMessage }],
    tools: [
      {
        name: params.toolName,
        description: params.toolDescription,
        input_schema: params.inputSchema as Anthropic.Tool['input_schema'],
      },
    ],
    tool_choice: { type: 'tool', name: params.toolName },
  });

  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return a tool_use response');
  }
  return toolUse.input;
}

export async function callClaudeText(params: {
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxTokens?: number;
}): Promise<string> {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 1024,
    system: params.system,
    messages: params.messages,
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude did not return a text response');
  }
  return textBlock.text;
}
