import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function loadDocuments() {

  const basePath = path.join(process.cwd(), "documents");

  const pdfFiles = [
    "course_outline_2026.pdf",
    "buyer_system_presentation.pdf",
    "residential_condominium_contract.pdf",
    "seller_system_presentation.pdf",
    "shanae_job_description_2025.pdf"
  ];

  const docxFiles = [
    "first_draft_emails.docx"
  ];

  let text = "";

  for (const file of pdfFiles) {

    const filePath = path.join(basePath, file);

    const data = await pdf(fs.readFileSync(filePath));

    text += data.text + "\n\n";

  }

  for (const file of docxFiles) {

    const filePath = path.join(basePath, file);

    const result = await mammoth.extractRawText({ path: filePath });

    text += result.value + "\n\n";

  }

  return text;
}
