// functions/index.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");

// Inicializamos Firebase Admin para poder leer Firestore desde el servidor
if (!admin.apps.length) {
  admin.initializeApp();
}

const geminiApiKey = defineSecret("GEMINI_API_KEY");

// ============================================================================
// 1. FUNCIÓN DE INTELIGENCIA ARTIFICIAL (GEMINI) - Intacta y Segura
// ============================================================================
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

// ============================================================================
// 2. FUNCIÓN SSR PARA REDES SOCIALES (OPEN GRAPH META TAGS)
// ============================================================================
exports.noticiaMeta = onRequest({ region: "us-central1" }, async (req, res) => {
  // Extraemos el slug o ID de la URL (Ejemplo: de /noticias/mi-gran-noticia saca "mi-gran-noticia")
  const pathSegments = req.path.split("/").filter(Boolean);
  const slugId = pathSegments[1];

  // Si no hay slug en la URL, redirigimos limpiamente a la sección general de noticias
  if (!slugId) {
    return res.redirect(302, "/noticias");
  }

  try {
    const db = admin.firestore();
    let noticiaData = null;

    // Buscamos primero por el campo "slug"
    const snapshot = await db.collection("noticias").where("slug", "==", slugId).limit(1).get();
    if (!snapshot.empty) {
      noticiaData = snapshot.docs[0].data();
    } else {
      // Si no tiene slug, intentamos buscar por ID directo
      const docRef = await db.collection("noticias").doc(slugId).get();
      if (docRef.exists) {
        noticiaData = docRef.data();
      }
    }

    // Si la noticia no existe o fue eliminada, redirigimos
    if (!noticiaData) {
      return res.redirect(302, "/noticias");
    }

    // Preparamos los datos limpios para la tarjeta social
    const titulo = noticiaData.titulo || "Noticia en IIRESODH";
    // Extraemos las primeras 150 letras del resumen para la descripción
    let descripcion = "Lee la noticia completa en nuestro portal institucional.";
    if (noticiaData.resumen) {
      descripcion = noticiaData.resumen.substring(0, 150) + "...";
    }
    
    // La imagen principal de la noticia. Fallback: imagen genérica de la ONG
    const imagen = noticiaData.imagenPrincipalUrl || `https://${req.hostname}/logo.png`; 
    const urlCompleta = `https://${req.hostname}${req.originalUrl}`;

    // Descargamos el index.html original estático que sirve Firebase Hosting
    const appUrl = `https://${req.hostname}`;
    const response = await fetch(`${appUrl}/index.html`);
    let html = await response.text();

    // Fabricamos el bloque de meta tags para Redes Sociales
    const metaTags = `
      <title>${titulo} | IIRESODH</title>
      <meta property="og:title" content="${titulo}" />
      <meta property="og:description" content="${descripcion}" />
      <meta property="og:image" content="${imagen}" />
      <meta property="og:url" content="${urlCompleta}" />
      <meta property="og:type" content="article" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${titulo}" />
      <meta name="twitter:description" content="${descripcion}" />
      <meta name="twitter:image" content="${imagen}" />
    </head>`;

    // Inyectamos nuestro bloque de meta tags justo antes de cerrar el </head>
    html = html.replace("</head>", metaTags);

    // Servimos el HTML al bot de la red social.
    // Cacheamos por 5 minutos para ahorrar consultas a la base de datos si se vuelve muy viral
    res.set("Cache-Control", "public, max-age=300, s-maxage=600");
    res.status(200).send(html);

  } catch (error) {
    console.error("Error crítico inyectando meta tags:", error);
    // Si algo falla, redirigimos a la portada principal para que la web no se caiga
    res.redirect(302, "/");
  }
});