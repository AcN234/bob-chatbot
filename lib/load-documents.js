import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function loadDocuments() {

  const pdfFiles = [
    "./documents/course_outline_2026.pdf",
    "./documents/buyer_system_presentation.pdf",
    "./documents/residential_condominium_contract.pdf",
    "./documents/seller_system_presentation.pdf",
    "./documents/shanae_job_description_2025.pdf"
  ];

  const docxFiles = [
    "./documents/first_draft_emails.docx"
  ];

  let text = "";

  for (const file of pdfFiles) {
    const data = await pdf(fs.readFileSync(file));
    text += data.text + "\n\n";
  }

  for (const file of docxFiles) {
    const result = await mammoth.extractRawText({ path: file });
    text += result.value + "\n\n";
  }

  return text;
}
