import OpenAI from "openai";
import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message } = req.body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    let documents = "";

    // ---------- READ PDF FILES ----------

    const pdfFiles = [
      "./documents/2024_Course_Outline.pdf",
      "./documents/CMA_Buildings.pdf",
      "./documents/Revised_Residential_Condominium.pdf"
    ];

    for (const file of pdfFiles) {
      if (fs.existsSync(file)) {
        const buffer = fs.readFileSync(file);
        const data = await pdf(buffer);
        documents += data.text + "\n\n";
      }
    }

    // ---------- READ DOCX FILES ----------

    const docxFiles = [
      "./documents/First_Draft_of_emails.docx",
      "./documents/Shanae_Job_Description_2025.docx",
      "./documents/2025_Buyers_systems_v2.docx",
      "./documents/2025_Seller_Systems.docx"
    ];

    for (const file of docxFiles) {
      if (fs.existsSync(file)) {
        const result = await mammoth.extractRawText({ path: file });
        documents += result.value + "\n\n";
      }
    }

    // ---------- OPENAI REQUEST ----------

    const response = await openai.responses.create({
      model: "gpt-5.2",
      instructions: `
You are BOB, the assistant for United DFW Properties / United Insight Realty.

You answer questions from agents using ONLY the provided company documents.

If someone asks a legal question, instruct them to contact Brenda and provide her phone number.

Be helpful, concise, and professional.
`,
      input: `
Company Documents:
${documents}

User Question:
${message}
`
    });

    res.status(200).json({
      reply: response.output_text
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Server error"
    });

  }
}
