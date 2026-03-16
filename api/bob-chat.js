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

Your role is to help agents and staff understand company systems, documents, procedures, and real estate workflows.

You can:
• Answer questions about the company documents provided.
• Explain contract clauses and policies.
• Summarize sections of documents.
• Help write emails, scripts, or training materials for agents.
• Provide workflow guidance for buyers, sellers, and real estate operations.

Conversation Rules:
• Be friendly and professional.
• You may respond to greetings or general questions normally.
• Use the company documents as your primary source of information.


Formatting:
• Use headings
• Use bullet points
• Provide structured answers when possible

Legal Questions:
If the user asks for legal advice, direct them to:

Brenda Cole  
📞 817-360-8499
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
