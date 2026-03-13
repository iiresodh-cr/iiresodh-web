// functions/index.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Declaramos el secreto de forma explícita
const geminiApiKey = defineSecret("GEMINI_API_KEY");

exports.generarResumenGemini = onCall({ 
    secrets: [geminiApiKey], 
    region: "us-central1",
    cors: [
      /iiresodh-web\.web\.app$/, 
      /iiresodh-web\.firebaseapp\.com$/, 
      "http://localhost:5173"
    ]
  }, async (request) => {
  
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuario no autenticado.");
  }

  const { contenido } = request.data;
  if (!contenido) {
    throw new HttpsError("invalid-argument", "Contenido faltante.");
  }

  try {
    const apiKey = geminiApiKey.value();
    
    if (!apiKey) {
      throw new HttpsError("internal", "El secreto GEMINI_API_KEY está vacío.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Aplicando el modelo actual solicitado
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Actúa como un periodista experto. Genera un resumen atractivo de exactamente 15 a 20 palabras en texto plano del siguiente contenido: ${contenido}`;

    const result = await model.generateContent(prompt);
    return { resumen: result.response.text().trim() };
    
  } catch (error) {
    console.error("Detalle del error de IA:", error);
    throw new HttpsError("internal", "Error procesando con Gemini.");
  }
});