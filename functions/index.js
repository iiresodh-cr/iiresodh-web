// functions/index.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generarResumenGemini = onCall({ 
    secrets: ["GEMINI_API_KEY"],
    region: "us-central1",
    // Esta configuración de CORS es obligatoria para evitar el error net::ERR_FAILED
    cors: [
      /iiresodh-web\.web\.app$/, 
      /iiresodh-web\.firebaseapp\.com$/, 
      "http://localhost:5173"
    ]
  }, async (request) => {
  
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "No autorizado.");
  }

  const { contenido } = request.data;
  if (!contenido) throw new HttpsError("invalid-argument", "Falta contenido.");

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Genera un resumen de 15 a 20 palabras en texto plano: ${contenido}`;

    const result = await model.generateContent(prompt);
    return { resumen: result.response.text().trim() };
  } catch (error) {
    throw new HttpsError("internal", "Error en IA.");
  }
});