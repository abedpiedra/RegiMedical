import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === CONFIGURACIÓN DE MULTER ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// === LIMPIADOR DE TEXTO ===
function cleanSummary(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/\s+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .replace(/([^\S\r\n]*\.[^\S\r\n]*)+/g, ". ")
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
    .trim();
}

// === LLAMADA A HUGGINGFACE ===
async function callHuggingFaceSummarize(model, input, token) {
  const url = `https://api-inference.huggingface.co/models/${model}`;

  // 💬 Prompt claro y corto (sin etiquetas ni repeticiones)
  const prompt = `
Si existen, extrae los siguientes puntos:
1. Número de serie del equipo
2. Estado del equipo
3. Problemas encontrados
4. Recomendaciones

Informe:
${input}
`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.3,
        top_p: 0.9,
        repetition_penalty: 1.1,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`HuggingFace API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();

  // === Manejo flexible del formato de respuesta
  let summary = "";
  if (Array.isArray(data) && data[0]?.generated_text) summary = data[0].generated_text;
  else if (Array.isArray(data) && data[0]?.summary_text) summary = data[0].summary_text;
  else if (typeof data === "string") summary = data;
  else summary = JSON.stringify(data);

  return cleanSummary(summary);
}

// === RUTA PRINCIPAL ===
router.post("/resumirPDF", upload.single("archivo"), async (req, res) => {
  try {
    console.log("📨 POST /api/resumirPDF recibido...");
    if (!req.file) return res.status(400).json({ message: "No se recibió ningún archivo" });

    const filePath = path.join(__dirname, "../uploads", req.file.filename);
    const dataBuffer = fs.readFileSync(filePath);

    const pdfParse = (await import("pdf-parse")).default;
    const pdfData = await pdfParse(dataBuffer);

    if (!pdfData?.text?.trim()) {
      fs.unlink(filePath, () => {});
      return res.status(400).json({ message: "El PDF no contiene texto legible" });
    }

    const texto = pdfData.text.slice(0, 10000);
    console.log("✂️ Texto preparado para análisis IA.");

    if (!process.env.HUGGINGFACE_TOKEN) {
      // fs.unlink(filePath, () => {});
      return res.status(400).json({ message: "No hay token de Hugging Face configurado" });
    }

    console.log("🤖 Procesando resumen con Hugging Face...");
    const model = process.env.HF_MODEL || "google/flan-t5-large";
    const resumen = await callHuggingFaceSummarize(model, texto, process.env.HUGGINGFACE_TOKEN);

   // fs.unlink(filePath, () => {});
    return res.json({ resumen });
  } catch (error) {
    console.error("💥 Error general:", error);
    res.status(500).json({ message: "Error procesando PDF", error: error.message });
  }
});

export default router;
