import { OpenRouter } from "@openrouter/sdk";
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function test() {
  const openrouter = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
  try {
    const response = await openrouter.chat.send({
      chatRequest: {
        model: "nvidia/nemotron-3-nano-30b-a3b:free",
        messages: [{ role: "user", content: "hello" }]
      }
    });
    console.log(response);
  } catch (e) {
    console.error(e.message);
  }
}
test();
