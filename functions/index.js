// functions/index.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // PROMPT BLINDADO: Instrucciones negativas estrictas
    const prompt = `Actúa como un periodista experto. Genera un resumen atractivo de entre 15 y 20 palabras basado en el siguiente contenido.
    
    REGLAS ESTRICTAS E INQUEBRANTABLES:
    1. Devuelve ÚNICA y EXCLUSIVAMENTE el texto del resumen.
    2. ESTÁ PROHIBIDO incluir el conteo de palabras al final. NUNCA escribas "(15 palabras)" ni nada similar.
    3. NO uses comillas, ni negritas, ni saltos de línea.
    
    Contenido: 
    ${contenido}`;

    const result = await model.generateContent(prompt);
    
    // Como medida de seguridad extra, limpiamos cualquier paréntesis residual que intente colarse al final
    let textoLimpio = result.response.text().trim();
    textoLimpio = textoLimpio.replace(/\s*\(\d+\s*palabras?\)$/i, '');

    return { resumen: textoLimpio };
    
  } catch (error) {
    console.error("Detalle del error de IA:", error);
    throw new HttpsError("internal", "Error procesando con Gemini.");
  }
});