import axios from 'axios';

const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';

export interface OllamaGenerateOptions {
  temperature?: number;
  max_tokens?: number;
}

export async function ollamaGenerate(prompt: string, options: OllamaGenerateOptions = {}): Promise<string> {
  try {
    const response = await axios.post(`${apiUrl}/api/generate`, {
      model: 'llama3.3:latest',
      prompt,
      options: {
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 100,
      },
    });
    return response.data.response || '';
  } catch (error: any) {
    console.error('OllamaLlamaProvider error:', error.message);
    return '';
  }
}

export default {
  generate: ollamaGenerate,
};
