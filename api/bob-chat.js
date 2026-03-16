import OpenAI from "openai";
import { loadDocuments } from "../lib/load-documents.js";
import { chunkDocuments } from "../lib/chunk-documents.js";
import { searchContext } from "../lib/search-context.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let cachedChunks = null;

export default async function handler(req, res) {

  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    // Load and chunk documents once
    if (!cachedChunks) {

      console.log("Loading documents...");

      const docs = await loadDocuments();
      cachedChunks = chunkDocuments(docs);

      console.log("Documents loaded:", cachedChunks.length);
    }

    // Find relevant context
    const context = searchContext(message, cachedChunks);

    const systemPrompt = `
You are BOB, the assistant for United DFW Properties / United Insight Realty.

Your role is to help agents understand internal company documents, systems, and procedures.

You must ONLY answer using the information from the provided documents.

Formatting style:
• Use clear headings
• Use bullet points when helpful
• Provide structured explanations
• Be professional and helpful

Rules:
• If the answer is not found in the documents say:
"I cannot find that information in the provided documents."

• Do NOT invent policies or procedures.

Legal Questions:
If the user asks a legal question, advise them to contact Brenda Cole.

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
          content: "Relevant document excerpts:\n\n" + context
        },

        {
          role: "user",
          content: message
        }

      ]

    });

    const reply = completion.choices[0].message.content;

    return res.status(200).json({
      reply
    });

  } catch (error) {

    console.error("CHATBOT ERROR:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
