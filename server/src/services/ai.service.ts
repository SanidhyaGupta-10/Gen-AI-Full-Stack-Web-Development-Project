import { GoogleGenAI } from "@google/genai";

const api_key = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
    apiKey: api_key
});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro-preview-tts",
    contents: `Hello, How AI worksss`,
  });
  console.log(response.text);
}

export default main;
