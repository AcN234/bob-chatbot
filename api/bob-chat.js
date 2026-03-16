import OpenAI from "openai";
import { loadDocuments } from "../lib/load-documents.js";
import { chunkDocuments } from "../lib/chunk-documents.js";
import { searchContext } from "../lib/search-context.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let cachedChunks = null;

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  try {

    if (!cachedChunks) {

      const docs = await loadDocuments();
      cachedChunks = chunkDocuments(docs);

    }

    const context = searchContext(message, cachedChunks);

    const systemPrompt = `
You are BOB, the assistant for United DFW Properties / United Insight Realty.

You help agents understand internal documents, procedures, and systems.

Rules:
• Only answer using the company documents provided.
• If information is missing say: "I cannot find that information in the provided documents."
• Use clear headings, bullet points, and structured explanations when possible.
• If the user asks a legal question, tell them to contact Brenda Cole.

Contact:
Brenda Cole – 817-360-8499
`;

    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      temperature: 0.2,

      messages: [

        {
          role: "system",
          content: systemPrompt
        },

        {
          role: "system",
          content: "Relevant document excerpts:\n" + context
        },

        {
          role: "user",
          content: message
        }

      ]

    });

    res.status(200).json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Server error"
    });

  }
}
