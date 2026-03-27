// functions/index.js
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Inicializamos Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// ============================================================================
// DECLARACIÓN DE SECRETOS GLOBALES
// ============================================================================
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const GMAIL_CLIENT_ID = defineSecret("GMAIL_CLIENT_ID");
const GMAIL_CLIENT_SECRET = defineSecret("GMAIL_CLIENT_SECRET");
const GMAIL_REFRESH_TOKEN = defineSecret("GMAIL_REFRESH_TOKEN");

// ============================================================================
// 1. FUNCIÓN DE INTELIGENCIA ARTIFICIAL (GEMINI)
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

    const prompt = `Actúa como un periodista experto. Genera un resumen atractivo de entre 15 y 20 palabras basado en el siguiente contenido.
    
    REGLAS ESTRICTAS E INQUEBRANTABLES:
    1. Devuelve ÚNICA y EXCLUSIVAMENTE el texto del resumen.
    2. ESTÁ PROHIBIDO incluir el conteo de palabras al final. NUNCA escribas "(15 palabras)" ni nada similar.
    3. NO uses comillas, ni negritas, ni saltos de línea.
    
    Contenido: 
    ${contenido}`;

    const result = await model.generateContent(prompt);
    
    let textoLimpio = result.response.text().trim();
    textoLimpio = textoLimpio.replace(/\s*\(\d+\s*palabras?\)$/i, '');

    return { resumen: textoLimpio };
    
  } catch (error) {
    console.error("Detalle del error de IA:", error);
    throw new HttpsError("internal", "Error procesando con Gemini.");
  }
});

// ============================================================================
// 2. FUNCIÓN SSR PARA REDES SOCIALES (FACEBOOK, LINKEDIN, X, WHATSAPP)
// ============================================================================
exports.noticiaMeta = onRequest({ region: "us-central1" }, async (req, res) => {
  const pathSegments = req.path.split("/").filter(Boolean);
  const slugId = pathSegments[1];

  if (!slugId) {
    return res.redirect(302, "/noticias");
  }

  try {
    const db = admin.firestore();
    let noticiaData = null;

    const snapshot = await db.collection("noticias").where("slug", "==", slugId).limit(1).get();
    if (!snapshot.empty) {
      noticiaData = snapshot.docs[0].data();
    } else {
      const docRef = await db.collection("noticias").doc(slugId).get();
      if (docRef.exists) {
        noticiaData = docRef.data();
      }
    }

    if (!noticiaData) {
      return res.redirect(302, "/noticias");
    }

    // Detectamos el dominio real (para que funcione en producción)
    const host = req.headers['x-forwarded-host'] || req.hostname;
    const appUrl = `https://${host}`;

    // SANITIZACIÓN: Reemplazamos comillas dobles para que no rompan las etiquetas de Facebook
    const titulo = (noticiaData.titulo || "Noticia en IIRESODH").replace(/"/g, '&quot;');
    let descripcion = "Lee la noticia completa en nuestro portal institucional.";
    if (noticiaData.resumen) {
      descripcion = noticiaData.resumen.substring(0, 150) + "...";
    }
    descripcion = descripcion.replace(/"/g, '&quot;');
    
    const imagen = noticiaData.imagenPrincipalUrl || `${appUrl}/logo.png`; 
    const urlCompleta = `${appUrl}${req.originalUrl}`;

    // Descargamos el index.html original
    const response = await fetch(`${appUrl}/index.html`);
    let html = await response.text();

    // 🚨 EL TRUCO PARA FACEBOOK: ELIMINAR LOS META TAGS ORIGINALES 🚨
    html = html.replace(/<title>.*?<\/title>/gi, '');
    html = html.replace(/<meta[^>]*property="og:[^>]*>/gi, '');
    html = html.replace(/<meta[^>]*name="twitter:[^>]*>/gi, '');
    html = html.replace(/<meta[^>]*name="description"[^>]*>/gi, '');

    // Fabricamos las etiquetas exclusivas de la noticia
    const metaTags = `
      <title>${titulo} | IIRESODH</title>
      <meta name="description" content="${descripcion}" />
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

    // Inyectamos todo limpio antes del cierre del head
    html = html.replace("</head>", metaTags);

    res.set("Cache-Control", "public, max-age=300, s-maxage=600");
    res.status(200).send(html);

  } catch (error) {
    console.error("Error crítico inyectando meta tags:", error);
    res.redirect(302, "/");
  }
});


// ============================================================================
// 3. FUNCIÓN PARA ENVIAR FORMULARIO DE CONTACTO (VÍA OAUTH2)
// ============================================================================
exports.enviarFormularioContacto = onCall({ 
  secrets: [GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN], 
  region: "us-central1"
}, async (request) => {
  
  const { nombre, correo, mensaje } = request.data;

  if (!nombre || !correo || !mensaje) {
    throw new HttpsError("invalid-argument", "Faltan campos obligatorios.");
  }

  try {
    // Configuración de Nodemailer usando OAuth2
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'contacto@iiresodh.org',
        clientId: GMAIL_CLIENT_ID.value(),
        clientSecret: GMAIL_CLIENT_SECRET.value(),
        refreshToken: GMAIL_REFRESH_TOKEN.value()
      }
    });

    const mailOptions = {
      from: `"Web IIRESODH" <contacto@iiresodh.org>`,
      to: 'contacto@iiresodh.org', // Correo destino
      replyTo: correo, // Para poder darle "Responder" al usuario
      subject: `Nuevo mensaje web de: ${nombre}`,
      text: `Nombre: ${nombre}\nCorreo: ${correo}\n\nMensaje:\n${mensaje}`,
      html: `
        <h2 style="color: #1D3557;">Nuevo contacto desde la web</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <p><strong>Mensaje:</strong></p>
        <blockquote style="border-left: 4px solid #B92F32; padding-left: 10px; color: #555;">
          ${mensaje.replace(/\n/g, '<br>')}
        </blockquote>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Correo enviado" };

  } catch (error) {
    console.error("Error enviando correo con OAuth2:", error);
    throw new HttpsError("internal", "No se pudo enviar el correo electrónico.");
  }
});

// ============================================================================
// 4. FUNCIÓN CHATBOT PIDA (GEMINI)
// ============================================================================
exports.chatPida = onCall({ 
  secrets: [geminiApiKey], 
  region: "us-central1",
  cors: [
    /iiresodh-web\.web\.app$/, 
    /iiresodh-web\.firebaseapp\.com$/, 
    "http://localhost:5173"
  ]
}, async (request) => {
  
  const { mensaje, historial = [] } = request.data;
  
  if (!mensaje) {
    throw new HttpsError("invalid-argument", "El mensaje está vacío.");
  }

  try {
    const apiKey = geminiApiKey.value();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Aquí le damos su "alma" básica a PIDA (La mejoraremos en la Fase 3)
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: "Eres PIDA, el asistente virtual amable, profesional y experto del Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH). Tus respuestas deben ser cortas, claras y siempre en español, a menos que te hablen en otro idioma."
    });

    // Traducimos el historial del frontend al formato que entiende Gemini
    const historialFormateado = historial.map(msg => ({
      role: msg.isBot ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    // Iniciamos el chat con memoria
    const chat = model.startChat({
      history: historialFormateado,
    });

    // Enviamos el nuevo mensaje
    const result = await chat.sendMessage(mensaje);
    const respuestaTexto = result.response.text();

    return { respuesta: respuestaTexto };

  } catch (error) {
    console.error("Error en el cerebro de PIDA:", error);
    throw new HttpsError("internal", "Error procesando la respuesta con PIDA.");
  }
});