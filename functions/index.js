const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generarResumenGemini = onCall({ 
    secrets: ["GEMINI_API_KEY"],
    region: "us-central1" 
  }, async (request) => {
  
  // 1. Verificación de Seguridad: Solo usuarios autenticados
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "El servicio requiere autenticación de administrador."
    );
  }

  const { contenido } = request.data;

  // 2. Validación de entrada
  if (!contenido || typeof contenido !== "string") {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere el contenido de la noticia para generar un resumen."
    );
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError("internal", "Error de configuración: API Key faltante.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Actúa como un periodista experto. Lee el siguiente texto y genera un resumen atractivo de exactamente 15 a 20 palabras. 
    Instrucciones estrictas: Solo texto plano, sin negritas, sin comillas y sin saltos de línea.
    
    Texto: ${contenido}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return { 
      resumen: response.text().trim() 
    };

  } catch (error) {
    console.error("Error en Gemini:", error);
    throw new HttpsError("internal", "Error al procesar la Inteligencia Artificial.");
  }
});