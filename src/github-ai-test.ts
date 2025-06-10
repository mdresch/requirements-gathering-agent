// Add this as the first line if using ts-node
// @ts-ignore
import 'ts-node/register';

import OpenAI from "openai";

process.env.OPENAI_API_KEY = process.env.GITHUB_TOKEN;
const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "deepseek/DeepSeek-R1-0528";



export async function main() {
  const client = new OpenAI({ baseURL: endpoint, apiKey: token });

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "What is the capital of France?" }
    ],
    temperature: 1.0,
    top_p: 1.0,
    model: model
  });

  console.log(response.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});