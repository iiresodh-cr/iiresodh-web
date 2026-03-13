// functions/index.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generarResumenGemini = onCall({ 
    secrets: ["GEMINI_API_KEY"],
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
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Actúa como un periodista experto. Genera un resumen atractivo de exactamente 15 a 20 palabras en texto plano del siguiente contenido: ${contenido}`;

    const result = await model.generateContent(prompt);
    return { resumen: result.response.text().trim() };
  } catch (error) {
    console.error("IA Error:", error);
    throw new HttpsError("internal", "Error procesando con Gemini.");
  }
});