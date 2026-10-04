const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenAI } = require("@google/genai");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const Stripe = require("stripe"); 
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib"); // LIBRERÍA DE SOCIAL DRM
const path = require("path");
const fs = require("fs");

// Inicializamos Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// ============================================================================
// DECLARACIÓN DE SECRETOS GLOBALES
// ============================================================================
const GMAIL_CLIENT_ID = defineSecret("GMAIL_CLIENT_ID");
const GMAIL_CLIENT_SECRET = defineSecret("GMAIL_CLIENT_SECRET");
const GMAIL_REFRESH_TOKEN = defineSecret("GMAIL_REFRESH_TOKEN");
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY"); 
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET"); 
const STRIPE_CURSOS_SECRET_KEY = defineSecret("STRIPE_CURSOS_SECRET_KEY");
const STRIPE_CURSOS_WEBHOOK_SECRET = defineSecret("STRIPE_CURSOS_WEBHOOK_SECRET");
const PIDA_SERVICE_ACCOUNT = defineSecret("PIDA_SERVICE_ACCOUNT"); 

function getStripeCursosKey() {
  try {
    const val = STRIPE_CURSOS_SECRET_KEY.value();
    if (val) return String(val).trim();
  } catch (_) {}
  return String(process.env.STRIPE_CURSOS_SECRET_KEY || "").trim();
}

function getStripeCursosWebhookSecret() {
  try {
    const val = STRIPE_CURSOS_WEBHOOK_SECRET.value();
    if (val) return String(val).trim();
  } catch (_) {}
  return String(process.env.STRIPE_CURSOS_WEBHOOK_SECRET || "").trim();
}

// ============================================================================
// CONEXIÓN A BASE DE DATOS DE PIDA (SOLO LECTURA)
// ============================================================================
let pidaDbInstance = null;

function getPidaFirestore() {
  if (!pidaDbInstance) {
    const serviceAccount = JSON.parse(PIDA_SERVICE_ACCOUNT.value());
    const pidaApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    }, 'PidaApp');
    pidaDbInstance = pidaApp.firestore();
  }
  return pidaDbInstance;
}

// ============================================================================
// 1. FUNCIÓN DE INTELIGENCIA ARTIFICIAL (GEMINI) - AHORA CON SOPORTE PDF
// ============================================================================
exports.generarResumenGemini = onCall({ 
  region: "us-central1",
  cors: true
}, async (request) => {
  
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuario no autenticado.");
  }

  const { contenido, archivoBase64, mimeType, tipo } = request.data;
  
  // Validamos que venga al menos un texto o un archivo
  if (!contenido && !archivoBase64) {
    throw new HttpsError("invalid-argument", "Contenido o archivo faltante.");
  }

  try {
    const ai = new GoogleGenAI({
      vertexai: true,
      project: 'iiresodh-web',
      location: 'us-central1'
    });

    let prompt;
    if (tipo === "titulo_noticia") {
      prompt = `Actúa como un editor periodístico de alto nivel. Lee el siguiente contenido y redacta un TÍTULO conciso, directo y atractivo de máximo entre 6 y 9 palabras.
    
    REGLAS ESTRICTAS E INQUEBRANTABLES:
    1. Devuelve ÚNICA y EXCLUSIVAMENTE el texto del título.
    2. NO uses comillas, ni negritas, ni punto final, ni saltos de línea.
    3. ESTÁ PROHIBIDO incluir conteo de palabras o etiquetas como "Título:".
    ${contenido ? `\nContenido de la noticia:\n${contenido}` : ""}`;
    } else {
      prompt = `Actúa como un periodista experto. Genera un resumen atractivo y conciso de entre 10 y 14 palabras basado en el contenido proporcionado.
    
    REGLAS ESTRICTAS E INQUEBRANTABLES:
    1. Devuelve ÚNICA y EXCLUSIVAMENTE el texto del resumen.
    2. ESTÁ PROHIBIDO incluir el conteo de palabras al final. NUNCA escribas "(12 palabras)" ni nada similar.
    3. NO uses comillas, ni negritas, ni saltos de línea.
    ${contenido ? `\nContenido del texto a resumir:\n${contenido}` : ""}`;
    }

    let result;

    // Si viene un archivo (PDF), se lo pasamos a Gemini junto con las instrucciones
    if (archivoBase64) {
      const documentPart = {
        inlineData: {
          data: archivoBase64,
          mimeType: mimeType || "application/pdf"
        }
      };
      result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              documentPart
            ]
          }
        ]
      });
    } else {
      // Flujo normal (solo texto)
      result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
    }
    
    let textoLimpio = result.text.trim();
    textoLimpio = textoLimpio.replace(/\s*\(\d+\s*palabras?\)$/i, '');
    textoLimpio = textoLimpio.replace(/^["'«»“”]+|["'«»“”]+$/g, '').trim();

    return { resumen: textoLimpio, titulo: textoLimpio };
    
  } catch (error) {
    console.error("Detalle del error de IA:", error);
    throw new HttpsError("internal", "Error procesando con Gemini en Vertex AI.");
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

    const host = req.headers['x-forwarded-host'] || req.hostname;
    const appUrl = `https://${host}`;

    const titulo = (noticiaData.titulo || "Noticia en IIRESODH").replace(/"/g, '&quot;');
    let descripcion = "Lee la noticia completa en nuestro portal institucional.";
    if (noticiaData.resumen) {
      descripcion = noticiaData.resumen.substring(0, 150) + "...";
    }
    descripcion = descripcion.replace(/"/g, '&quot;');
    
    const imagen = noticiaData.imagenPrincipalUrl || `${appUrl}/logo.png`; 
    const urlCompleta = `${appUrl}${req.originalUrl}`;

    const response = await fetch(`${appUrl}/index.html`);
    let html = await response.text();

    html = html.replace(/<title>.*?<\/title>/gi, '');
    html = html.replace(/<meta[^>]*property="og:[^>]*>/gi, '');
    html = html.replace(/<meta[^>]*name="twitter:[^>]*>/gi, '');
    html = html.replace(/<meta[^>]*name="description"[^>]*>/gi, '');

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
      to: 'contacto@iiresodh.org',
      replyTo: correo, 
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
// 4. CHATBOT IRENE (GEMINI ENTERPRISE AGENT PLATFORM - VERTEX AI / IAM)
// ============================================================================

exports.chatPidaStream = onRequest({ 
  region: "us-central1",
  cors: true
}, async (req, res) => {

  // Configuración manual de CORS para asegurar que el preflight (OPTIONS) y el streaming no fallen
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).send("Método no permitido");
  }

  // Soportar tanto fetch directo (req.body) como httpsCallable (req.body.data)
  const bodyData = req.body.data || req.body;
  const { mensaje, sessionId, idioma = 'es' } = bodyData;

  if (!mensaje || !sessionId) {
    return res.status(400).send("Faltan parámetros requeridos (mensaje o sessionId).");
  }

  try {
    const systemInstruction = `Eres IRENE, el asistente virtual oficial del Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH).
        Tu personalidad es amable, profesional, empática y sumamente respetuosa. Eres una experta en la labor de la institución.

        INFORMACIÓN CLAVE QUE DEBES SABER SOBRE IIRESODH:
        - Misión: Somos una institución dedicada a la defensa, promoción y educación en Derechos Humanos y Responsabilidad Social a nivel internacional.
        - Áreas de trabajo principales: Litigio Estratégico, Cooperación Internacional, Cursos y Capacitaciones, Publicación de Artículos Académicos y Tienda Editorial.
        - Presencia: Trabajamos a nivel internacional, con sedes y proyectos en Costa Rica (Sede Principal), México, Colombia, Guatemala y Canadá.
        - Tienda Editorial: Vendemos libros y manuales especializados en formato digital (PDF). El envío es automático por correo electrónico tras confirmar el pago.

        TUS REGLAS ESTRICTAS DE COMPORTAMIENTO:
        1. SÉ CONCISA: Los usuarios leen en una pequeña ventana de chat. Usa párrafos muy cortos (máximo 3-4 líneas) y viñetas si es necesario.
        2. NO ERES ABOGADA: Tienes PROHIBIDO dar asesoría legal específica o prometer resultados judiciales.
        3. QUÉ HACER CON CASOS LEGALES: Ante solicitudes de ayuda legal, responde con empatía e invita al usuario a usar el Formulario de Contacto o escribir a contacto@iiresodh.org.
        4. TIENDA Y PRECIOS: Si preguntan por libros, guíalos a la "Tienda Editorial". Informa que son archivos PDF. Importante: Aclara que para usuarios en México los precios se muestran y cobran en Pesos Mexicanos (MXN) de acuerdo con la legislación local, mientras que para el resto del mundo se manejan en USD.
        5. CÓDIGOS DE DESCUENTO: Si preguntan por descuentos, menciona que ocasionalmente ofrecemos códigos promocionales para la tienda y que los publicaremos en nuestrar redes sociales.
        6. GUÍA DE NAVEGACIÓN: Orienta a los usuarios sobre dónde encontrar Noticias, Artículos Académicos, Cursos o la Tienda en el menú superior.
        7. DONACIONES: Si preguntan cómo apoyar, agradéceles, explícales que pronto estará disponible la sección de "Donaciones" pero para mientras puenen apoyarnos comprando libros y guíalos a la sección de "Tienda".
        8. IDIOMA ESTRICTO: El usuario está navegando el sitio web en el idioma con código '${idioma}'. Debes comunicarte y responder SIEMPRE en ese idioma, a menos que el usuario te hable explícitamente en otro.
        9. TEMAS DESCONOCIDOS O MUY ESPECÍFICOS: Si te preguntan sobre un tema técnico, un país específico, conceptos complejos (como neurotecnología) o algo que no sabes, aclara amablemente que tu conocimiento se enfoca en la misión general del IIRESODH. Acto seguido, RECOMIENDA EXPLÍCITAMENTE al usuario que utilice el buscador del sitio web (la lupa en el menú principal) para encontrar noticias, artículos académicos o informes exactos sobre ese tema.`;

    // Instanciar Vertex AI usando el nuevo SDK de Gen AI
    const ai = new GoogleGenAI({ 
      vertexai: true, 
      project: 'iiresodh-web', 
      location: 'us-central1' 
    });

    const db = admin.firestore();
    const sessionRef = db.collection('chat_sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();
    
    let history = [];
    if (sessionDoc.exists) {
      history = sessionDoc.data().history || [];
    }

    // Prevención de error por roles consecutivos ('user' seguido de 'user')
    // por si hubo un error de red previo y la IA no alcanzó a responder
    if (history.length > 0 && history[history.length - 1].role === 'user') {
      history.pop();
    }

    // Agregar el nuevo mensaje del usuario al historial
    history.push({ role: 'user', parts: [{ text: mensaje }] });
    
    // Ejecutar Streaming con la nueva API nativa de Vertex, pasando el historial completo
    const streamingResp = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: history,
      config: {
        systemInstruction: systemInstruction
      }
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    let fullResponse = "";

    // Leer los fragmentos y enviarlos en vivo al frontend
    for await (const chunk of streamingResp) {
      if (chunk.text) {
        fullResponse += chunk.text;
        res.write(chunk.text);
      }
    }

    // Guardar el historial actualizado en Firestore antes de cerrar la conexión
    history.push({ role: 'model', parts: [{ text: fullResponse }] });
    
    // Mantener un límite de memoria (ej. últimos 20 mensajes = 10 interacciones)
    if (history.length > 20) {
      history = history.slice(history.length - 20);
    }

    await sessionRef.set({
      history: history,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.end();

  } catch (error) {
    console.error("Error crítico en streaming de Vertex AI:", error);
    if (!res.headersSent) {
      res.status(500).send(`Error: ${error.message}`);
    } else {
      res.end();
    }
  }
});

// ============================================================================
// 5. FUNCIÓN PARA VALIDAR CUPONES DE STRIPE (DOCUMENTACIÓN OFICIAL BLINDADA)
// ============================================================================
exports.validarCuponStripe = onCall({
  secrets: [STRIPE_SECRET_KEY, PIDA_SERVICE_ACCOUNT],
  region: "us-central1"
}, async (request) => {
  const { codigo, emailUsuario } = request.data;
  if (!codigo) {
    throw new HttpsError("invalid-argument", "Código requerido.");
  }

  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    const codigoLimpio = codigo.trim();

    if (codigoLimpio.toUpperCase().startsWith("PIDA")) {
      if (!emailUsuario) {
        return { valido: false, mensaje: "Por favor, ingresa tu correo electrónico para validar este cupón." };
      }

      const pidaDb = getPidaFirestore();
      const pidaClientSnapshot = await pidaDb.collection('customers')
        .where('email', '==', emailUsuario.toLowerCase())
        .where('status', 'in', ['active', 'trialing']) 
        .limit(1)
        .get();

      if (pidaClientSnapshot.empty) {
        return { 
          valido: false, 
          mensaje: "Este cupón es exclusivo para suscriptores activos de PIDA. Verifica tu correo o tu suscripción." 
        };
      }
    }

    const promoCodes = await stripe.promotionCodes.list({
      code: codigoLimpio,
      active: true,
      limit: 1,
      expand: ['data.coupon', 'data.promotion.coupon']
    });

    if (!promoCodes.data || promoCodes.data.length === 0) {
      return { valido: false, mensaje: "El código de descuento no es válido o ha expirado." };
    }

    const promotionCode = promoCodes.data[0];
    let coupon = promotionCode.coupon || (promotionCode.promotion && promotionCode.promotion.coupon);

    if (typeof coupon === 'string') {
      coupon = await stripe.coupons.retrieve(coupon);
    }

    if (!coupon || coupon.valid === false) {
      return { valido: false, mensaje: "El cupón asociado a este código ha expirado." };
    }

    return {
      valido: true,
      porcentaje: coupon.percent_off || null, 
      montoFijo: coupon.amount_off || null,   
      moneda: coupon.currency || null         
    };

  } catch (error) {
    console.error("Error consultando API de Stripe:", error);
    throw new HttpsError("internal", "Error al comunicarse con el servidor de pagos.");
  }
});

// ============================================================================
// 6. FUNCIÓN PARA CREAR INTENTO DE PAGO (STRIPE ELEMENTS - DINÁMICO)
// ============================================================================
exports.crearIntentoPago = onCall({ 
  secrets: [STRIPE_SECRET_KEY, PIDA_SERVICE_ACCOUNT], 
  region: "us-central1"
}, async (request) => {
  const { libroId, emailUsuario, moneda, codigoDescuento, terminosAceptados } = request.data; 

  if (!terminosAceptados) {
    throw new HttpsError("failed-precondition", "Es obligatorio aceptar los términos de uso y política de privacidad.");
  }

  try {
    const db = admin.firestore();
    const libroDoc = await db.collection("libros").doc(libroId).get();
    
    if (!libroDoc.exists) {
      throw new HttpsError("not-found", "El libro no existe.");
    }

    const libroData = libroDoc.data();
    
    let montoFinal = 0;
    let currencyStripe = "usd";
    let precioBase = 0;

    if (moneda === "MXN" && libroData.precioMXN) {
      precioBase = libroData.precioMXN;
      currencyStripe = "mxn";
    } else {
      precioBase = libroData.precio;
      currencyStripe = "usd";
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY.value());

    if (codigoDescuento) {
      const codigoLimpio = codigoDescuento.trim();

      if (codigoLimpio.toUpperCase().startsWith("PIDA")) {
        const pidaDb = getPidaFirestore();
        const pidaClientSnapshot = await pidaDb.collection('customers')
        .where('email', '==', emailUsuario.toLowerCase())
        .where('status', 'in', ['active', 'trialing'])
        .limit(1)
        .get();

        if (pidaClientSnapshot.empty) {
          throw new HttpsError("permission-denied", "Intento de pago rechazado. El correo no pertenece a un suscriptor activo de PIDA.");
        }
      }

      const promoCodes = await stripe.promotionCodes.list({ 
        code: codigoLimpio, 
        active: true, 
        limit: 1,
        expand: ['data.coupon', 'data.promotion.coupon']
      });
      
      if (promoCodes.data && promoCodes.data.length > 0) {
        const promotionCode = promoCodes.data[0];
        let coupon = promotionCode.coupon || (promotionCode.promotion && promotionCode.promotion.coupon);

        if (typeof coupon === 'string') {
          coupon = await stripe.coupons.retrieve(coupon);
        }

        if (coupon && coupon.valid !== false) {
          if (coupon.percent_off) {
            precioBase = precioBase * (1 - coupon.percent_off / 100);
          } else if (coupon.amount_off && coupon.currency === currencyStripe) {
            precioBase = precioBase - (coupon.amount_off / 100); 
          }
        }
      }
    }

    if (precioBase < 0) precioBase = 0;
    montoFinal = Math.round(precioBase * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: montoFinal,
      currency: currencyStripe,
      receipt_email: emailUsuario || undefined,
      metadata: {
        libroId: libroId,
        titulo: libroData.titulo,
        emailCliente: emailUsuario || "cliente@anonimo.com",
        terminosAceptados: terminosAceptados ? "true" : "false",
        codigoDescuento: codigoDescuento || "Ninguno"
      },
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("Error creando PaymentIntent:", error);
    throw new HttpsError("internal", "No se pudo iniciar el pago.");
  }
});

// ============================================================================
// 7. WEBHOOK DE STRIPE: SOCIAL DRM ANTI-PIRATERÍA (OPTIMIZADO Y PROTEGIDO)
// ============================================================================
exports.stripeWebhook = onRequest({ 
  secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN], 
  region: "us-central1",
  memory: "2GiB",        // 🚀 Suficiente músculo para PDFs
  timeoutSeconds: 180    // 🚀 Tiempo extra para operaciones pesadas
}, async (req, res) => {
  
  const stripe = new Stripe(STRIPE_SECRET_KEY.value());
  const endpointSecret = STRIPE_WEBHOOK_SECRET.value(); 
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Error de firma del Webhook: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const libroId = paymentIntent.metadata.libroId;
    const emailCliente = paymentIntent.receipt_email || paymentIntent.metadata.emailCliente || "cliente@anonimo.com";
    
    const terminosAceptados = paymentIntent.metadata.terminosAceptados === "true";
    const codigoDescuento = paymentIntent.metadata.codigoDescuento || "Ninguno";

    try {
      const db = admin.firestore();

      const comprasRef = db.collection("compras");
      const compraExistente = await comprasRef.where("paymentIntentId", "==", paymentIntent.id).get();
      
      if (!compraExistente.empty) {
        console.log(`El pago ${paymentIntent.id} ya fue procesado. Ignorando.`);
        res.json({ received: true });
        return; 
      }
      
      const libroDoc = await db.collection("libros").doc(libroId).get();
      if (!libroDoc.exists) {
        console.error(`Error: Se pagó el libro ${libroId} pero no existe en BD.`);
        res.status(404).send("Libro no encontrado");
        return;
      }
      const libroData = libroDoc.data();

      // Registro Legal
      await db.collection("compras").add({
        libroId: libroId,
        titulo: libroData.titulo,
        email: emailCliente,
        paymentIntentId: paymentIntent.id,
        fecha: admin.firestore.FieldValue.serverTimestamp(),
        estado: 'pagado',
        terminosAceptados: terminosAceptados,
        codigoDescuento: codigoDescuento
      });

      await db.collection("libros").doc(libroId).update({
        stock: admin.firestore.FieldValue.increment(-1)
      });

      if (emailCliente !== "cliente@anonimo.com") {
        if (!libroData.rutaStorage) {
          console.error(`CRÍTICO: El libro ${libroId} no tiene 'rutaStorage'.`);
          return res.json({ received: true, error: "Missing rutaStorage" });
        }

        const bucket = admin.storage().bucket();
        const file = bucket.file(libroData.rutaStorage);
        
        let urlTemporal = "";
        let mensajeExitoHTML = "";

        // 🛡️ SEGURO DE VIDA: VERIFICAR TAMAÑO DEL ARCHIVO
        const [metadata] = await file.getMetadata();
        const fileSizeInMB = metadata.size / (1024 * 1024);
        
        console.log(`El archivo ${libroData.rutaStorage} pesa ${fileSizeInMB.toFixed(2)} MB.`);

        // Límite fijado en 40MB
        if (fileSizeInMB > 40) {
            console.log(`⚠️ ARCHIVO DEMASIADO PESADO (>40MB). Saltando Social DRM...`);
            
            [urlTemporal] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 1000 * 60 * 60 * 48, 
            });

            mensajeExitoHTML = `
              <h2 style="color: #1D3557;">¡Pago procesado con éxito!</h2>
              <p>Hola,</p>
              <p>Hemos recibido tu pago por la publicación académica: <strong>${libroData.titulo}</strong>.</p>
              <p>Puedes descargar tu copia en el siguiente enlace. <strong>Nota importante: Este enlace de alta velocidad es único y caducará en 48 horas por motivos de seguridad anti-piratería.</strong> Por favor, descarga y guarda el archivo PDF en tu dispositivo personal.</p>
              <br>
              <a href="${urlTemporal}" style="background-color: #B92F32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                ⬇ Descargar Publicación (PDF)
              </a>
              <br><br>
              <p>Gracias por apoyar la labor del Instituto Internacional de Responsabilidad Social y Derechos Humanos.</p>
            `;

        } else {
            console.log(`✅ Tamaño óptimo. Iniciando estampado de marca de agua anti-piratería...`);
            
            const [fileBuffer] = await file.download();
            // Permite inyectar metadatos
            const pdfDoc = await PDFDocument.load(fileBuffer, { updateMetadata: true }); 
            
            // =================================================================
            // 🕵️‍♂️ NUEVO: HUELLA DIGITAL INVISIBLE (METADATOS FORENSES)
            // =================================================================
            pdfDoc.setTitle(libroData.titulo);
            pdfDoc.setAuthor(`Licencia rastreable: ${emailCliente}`);
            pdfDoc.setSubject(`ID de Transacción Segura: ${paymentIntent.id}`);
            pdfDoc.setKeywords(['IIRESODH', 'Propiedad Intelectual', emailCliente, paymentIntent.id]);
            pdfDoc.setCreator('Sistema de Seguridad IIRESODH');
            pdfDoc.setProducer('IIRESODH - Departamento Legal');

            // =================================================================
            // 🔴 MARCA DE AGUA VISUAL DISUASORIA
            // =================================================================
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            const linea1 = `LICENCIA PERSONAL DE: ${emailCliente.toUpperCase()}`;
            const linea2 = `REF: ${paymentIntent.id} | IIRESODH`;

            pages.forEach((page) => {
              page.drawText(linea1, {
                x: 20, 
                y: 32, 
                size: 9,
                font: font,
                color: rgb(0.725, 0.184, 0.196), 
                opacity: 0.65, 
              });
              page.drawText(linea2, {
                x: 20, 
                y: 20, 
                size: 9,
                font: font,
                color: rgb(0.725, 0.184, 0.196), 
                opacity: 0.65, 
              });
            });

            const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
            pdfDoc.catalog = null; 

            const rutaEntrega = `entregas_seguras/${paymentIntent.id}.pdf`;
            const archivoEntrega = bucket.file(rutaEntrega);
            await archivoEntrega.save(pdfBytes, {
              contentType: 'application/pdf',
              metadata: { cacheControl: 'private, max-age=0' }
            });

            [urlTemporal] = await archivoEntrega.getSignedUrl({
              action: 'read',
              expires: Date.now() + 1000 * 60 * 60 * 48,
            });

            mensajeExitoHTML = `
              <h2 style="color: #1D3557;">¡Pago procesado con éxito!</h2>
              <p>Hola,</p>
              <p>Hemos recibido tu pago por el libro: <strong>${libroData.titulo}</strong>.</p>
              <p>Tu copia ha sido personalizada con una marca de agua de seguridad y trazabilidad. Puedes descargarla en el siguiente enlace. <strong>Nota importante: Este enlace es único y caducará en 48 horas.</strong> Por favor, descarga y guarda el archivo PDF en tu dispositivo personal.</p>
              <br>
              <a href="${urlTemporal}" style="background-color: #B92F32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                ⬇ Descargar Libro (PDF)
              </a>
              <br><br>
              <p>Gracias por apoyar la labor del Instituto Internacional de Responsabilidad Social y Derechos Humanos.</p>
            `;
        }

        // Enviar Correo
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
          from: `"Tienda IIRESODH" <contacto@iiresodh.org>`,
          to: emailCliente,
          subject: `¡Gracias por tu compra! Aquí tienes tu libro`,
          html: mensajeExitoHTML
        };

        await transporter.sendMail(mailOptions);
        console.log(`Correo enviado exitosamente a ${emailCliente}.`);
      }
    } catch (error) {
      console.error("Error crítico en el proceso post-pago:", error);
    }
  }

  res.json({ received: true });
});

// ============================================================================
// 8. TRADUCTOR AUTOMÁTICO (FIREBASE FUNCTIONS V2)
// ============================================================================
const { onDocumentWritten } = require("firebase-functions/v2/firestore");

const IDIOMAS_DESTINO = ['en', 'fr'];
const CAMPOS_A_TRADUCIR = ['titulo', 'resumen', 'contenido', 'bio', 'cargo', 'texto1', 'texto2', 'texto3'];
const COLECCIONES_PERMITIDAS = ['noticias', 'articulos_academicos', 'cursos', 'libros', 'incidencia', 'equipo', 'configuracion'];

exports.traductorAutomatico = onDocumentWritten(
  {
    document: "{coleccion}/{documentoId}",
    region: "us-central1"
  }, 
  async (event) => {
    const coleccionActual = event.params.coleccion;

    if (!COLECCIONES_PERMITIDAS.includes(coleccionActual)) return null;

    // Carga diferida del SDK para evitar timeouts en el análisis
    const { Translate } = require('@google-cloud/translate').v2;
    const translate = new Translate();

    const datosNuevos = event.data.after.exists ? event.data.after.data() : null;
    const datosAnteriores = event.data.before.exists ? event.data.before.data() : null;

    if (!datosNuevos) return null;

    let actualizaciones = {};
    let necesitaActualizar = false;

    for (const campo of CAMPOS_A_TRADUCIR) {
      if (datosNuevos[campo]) {
        const textoCambio = !datosAnteriores || datosNuevos[campo] !== datosAnteriores[campo];

        if (textoCambio) {
          for (const idioma of IDIOMAS_DESTINO) {
            try {
              const [traduccion] = await translate.translate(datosNuevos[campo], idioma);
              // Decodificar entidades HTML generadas por Google Translate (apóstrofes, comillas)
              const traduccionLimpia = (traduccion || '')
                .replace(/&(?:#39|#039|#x27|apos);/gi, "'")
                .replace(/&(?:quot|#34|#034);/gi, '"')
                .replace(/&amp;#39;/gi, "'")
                .replace(/&amp;apos;/gi, "'")
                .replace(/&amp;quot;/gi, '"');
              actualizaciones[`${campo}_${idioma}`] = traduccionLimpia;
              necesitaActualizar = true;
            } catch (error) {
              console.error(`Error traduciendo ${campo} al ${idioma}:`, error);
            }
          }
        }
      }
    }

    if (necesitaActualizar) {
      return event.data.after.ref.update(actualizaciones);
    }

    return null;
  }
);

// ============================================================================
// 10. PROXY CDN PARA DESCARGA DE DOCUMENTOS CON DOMINIO INSTITUCIONAL (iiresodh.org)
// ============================================================================
exports.descargarDocumento = onRequest({ region: "us-central1" }, async (req, res) => {
  // Rutas esperadas:
  // /documentos/:coleccion/:id
  // /documentos/:coleccion/:id/:nombreArchivo.pdf
  const pathSegments = req.path.split("/").filter(Boolean);
  // pathSegments[0] === 'documentos'
  const coleccion = pathSegments[1]; // 'incidencia' | 'informes' | 'anuncios' | 'comunicados'
  const docId = pathSegments[2];

  if (!coleccion) {
    return res.status(400).send("Parámetros de documento insuficientes.");
  }

  // Validamos colecciones permitidas
  const coleccionesPermitidas = ["incidencia", "informes", "anuncios", "comunicados", "noticias"];
  if (!coleccionesPermitidas.includes(coleccion)) {
    return res.status(404).send("Categoría de documento no válida.");
  }

  try {
    const db = admin.firestore();
    let docSnap = null;
    let data = null;
    let fileUrl = null;
    let tituloDocumento = "";

    if (coleccion === "anuncios" || coleccion === "comunicados") {
      // Para anuncios emergentes, podemos recibir docId como ID del historial o "activo"
      if (!docId || docId === "activo" || docId.toLowerCase().endsWith(".pdf")) {
        docSnap = await db.collection("configuracion").doc("anuncio_emergente").get();
      } else {
        // Buscar primero en el historial
        docSnap = await db.collection("configuracion").doc("anuncio_emergente").collection("historial").doc(docId).get();
        if (!docSnap.exists) {
          docSnap = await db.collection("configuracion").doc("anuncio_emergente").get();
        }
      }

      if (!docSnap || !docSnap.exists) {
        return res.status(404).send("Comunicado o anuncio no encontrado.");
      }

      data = docSnap.data();
      fileUrl = data.archivoPdfUrl;
      tituloDocumento = data.archivoPdfNombre || data.titulo || "Comunicado_IIRESODH";
    } else if (coleccion === "noticias") {
      if (!docId) {
        return res.status(400).send("Parámetros de documento insuficientes.");
      }

      docSnap = await db.collection("noticias").doc(docId).get();
      if (!docSnap.exists) {
        const qSnap = await db.collection("noticias").where("slug", "==", docId).limit(1).get();
        if (!qSnap.empty) {
          docSnap = qSnap.docs[0];
        }
      }

      if (!docSnap || !docSnap.exists) {
        return res.status(404).send("Noticia no encontrada.");
      }

      data = docSnap.data();
      const slugSegment = pathSegments[3] || "";

      if (data.archivosAdjuntos && Array.isArray(data.archivosAdjuntos) && data.archivosAdjuntos.length > 0) {
        const indexMatch = slugSegment.match(/^doc-(\d+)/);
        if (indexMatch && data.archivosAdjuntos[parseInt(indexMatch[1], 10)]) {
          const anexo = data.archivosAdjuntos[parseInt(indexMatch[1], 10)];
          fileUrl = anexo.url;
          tituloDocumento = anexo.nombre || data.titulo;
        } else if (slugSegment) {
          const matchClean = slugSegment.replace(/\.pdf$/i, '').toLowerCase();
          const found = data.archivosAdjuntos.find(a => 
            a.nombre && a.nombre.toLowerCase().replace(/[^a-z0-9]/g, '').includes(matchClean.replace(/[^a-z0-9]/g, ''))
          );
          if (found) {
            fileUrl = found.url;
            tituloDocumento = found.nombre || data.titulo;
          } else {
            fileUrl = data.archivosAdjuntos[0].url;
            tituloDocumento = data.archivosAdjuntos[0].nombre || data.titulo;
          }
        } else {
          fileUrl = data.archivosAdjuntos[0].url;
          tituloDocumento = data.archivosAdjuntos[0].nombre || data.titulo;
        }
      } else {
        fileUrl = data.archivoPdfUrl || data.archivoUrl || null;
        tituloDocumento = data.archivoPdfNombre || data.titulo || "Documento_Noticia_IIRESODH";
      }
    } else {
      if (!docId) {
        return res.status(400).send("Parámetros de documento insuficientes.");
      }

      docSnap = await db.collection(coleccion).doc(docId).get();
      if (!docSnap.exists) {
        return res.status(404).send("Documento no encontrado.");
      }

      data = docSnap.data();
      if (coleccion === "incidencia") {
        fileUrl = data.archivoIncidenciaUrl;
        tituloDocumento = data.titulo || "Documento_Incidencia_IIRESODH";
      } else if (coleccion === "informes") {
        fileUrl = data.archivoInformeUrl;
        tituloDocumento = data.titulo || `Informe_Anual_${data.año || ""}_IIRESODH`;
      }
    }

    if (!fileUrl) {
      return res.status(404).send("El archivo solicitado no está disponible.");
    }

    // Nombre limpio para descarga/visualización
    const nombreLimpio = tituloDocumento
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // eliminar acentos
      .replace(/[^a-zA-Z0-9_\-\.]+/g, "_")
      .substring(0, 120);
    const nombreDescarga = nombreLimpio.toLowerCase().endsWith(".pdf")
      ? nombreLimpio
      : `${nombreLimpio}.pdf`;

    // Intentamos servir directamente desde el bucket de Storage usando el path relativo
    const bucket = admin.storage().bucket();
    const match = fileUrl.match(/\/o\/([^?]+)/);

    if (match && match[1]) {
      const storagePath = decodeURIComponent(match[1]);
      const file = bucket.file(storagePath);
      const [exists] = await file.exists();

      if (exists) {
        const [metadata] = await file.getMetadata();
        const contentType = metadata.contentType || "application/pdf";

        res.set({
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${nombreDescarga}"`,
          "Cache-Control": "public, max-age=86400, s-maxage=604800"
        });

        return file.createReadStream().pipe(res);
      }
    }

    // Fallback: Si no pudimos resolver el file del bucket directamente, hacemos streaming vía fetch
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return res.status(response.status).send("Error al obtener el archivo desde el almacenamiento.");
    }

    const contentType = response.headers.get("content-type") || "application/pdf";
    res.set({
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${nombreDescarga}"`,
      "Cache-Control": "public, max-age=86400, s-maxage=604800"
    });

    const arrayBuffer = await response.arrayBuffer();
    return res.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Error al servir documento:", error);
    return res.status(500).send("Error interno al procesar la descarga.");
  }
});

// ============================================================================
// 12. CREAR INTENTO DE PAGO PARA CURSOS PRESENCIALES (STRIPE DEDICADO)
// ============================================================================
exports.crearIntentoPagoCurso = onCall({ 
  secrets: [STRIPE_CURSOS_SECRET_KEY],
  region: "us-central1",
  cors: true
}, async (request) => {
  const { 
    cursoId, 
    cursoTitulo, 
    email, 
    nombre, 
    telefono, 
    institucion, 
    pais, 
    monto, 
    montoTotal, 
    moneda, 
    planCuotas, 
    numCuota,
    profesion,
    experienciaTemas,
    motivoParticipacion,
    cursosPrevios,
    alumnoIiresodh
  } = request.data || {};

  if (!email) {
    throw new HttpsError("invalid-argument", "El correo electrónico es obligatorio.");
  }

  try {
    const stripeKey = getStripeCursosKey();
    const stripe = new Stripe(stripeKey);

    const currencyLower = (moneda || "usd").toLowerCase();
    const numPlan = Number(planCuotas) || 1;
    let cuotaMonto = Number(monto) || 3350;
    let totalInversion = Number(montoTotal) || cuotaMonto;

    // Salvaguarda de integridad: si por error de cliente llegara un valor multiplicado por 100 (ej. 335000 en vez de 3350)
    if (totalInversion > 50000 && totalInversion < 1000000) {
      const candidato = totalInversion / 100;
      if (candidato >= 1000 && candidato <= 10000) {
        totalInversion = candidato;
        cuotaMonto = cuotaMonto / 100;
      }
    }

    const amountInCents = Math.round(cuotaMonto * 100);

    // ========================================================================
    // CONTROL INSTITUCIONAL DE FECHA LÍMITE DE CUOTAS
    // Todos los pagos deben quedar liquidados a más tardar el último día del mes
    // anterior al evento (ej. para Palermo 2027: 30 de abril de 2027).
    // ========================================================================
    let fechaLimitePagoDate = new Date("2027-04-30T23:59:59Z"); // Default para Palermo 2027

    try {
      if (cursoId) {
        const cursoSnap = await admin.firestore().collection("cursos").doc(cursoId).get();
        if (cursoSnap.exists) {
          const cData = cursoSnap.data();
          const lp = cData.landingPage || {};
          if (lp.fechaLimitePago) {
            fechaLimitePagoDate = new Date(lp.fechaLimitePago + "T23:59:59Z");
          } else if (lp.ubicacionFechas || cData.fecha) {
            const txt = (lp.ubicacionFechas || cData.fecha || "").toLowerCase();
            const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
            const matchAño = txt.match(/202[0-9]/);
            const año = matchAño ? parseInt(matchAño[0], 10) : 2027;
            const idxMes = meses.findIndex(m => txt.includes(m));
            if (idxMes !== -1) {
              fechaLimitePagoDate = new Date(Date.UTC(año, idxMes, 0, 23, 59, 59));
            }
          }
        }
      }
    } catch (errDb) {
      console.warn("Advertencia consultando fecha límite de curso en Firestore:", errDb.message);
    }

    if (numPlan > 1) {
      const hoy = new Date();
      const fechaUltimaCuota = new Date(hoy);
      fechaUltimaCuota.setMonth(fechaUltimaCuota.getMonth() + (numPlan - 1));

      if (fechaUltimaCuota > fechaLimitePagoDate) {
        const fechaLimiteStr = fechaLimitePagoDate.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC"
        });
        throw new HttpsError(
          "failed-precondition",
          `El plan de ${numPlan} cuotas no está disponible porque la última cuota superaría la fecha límite institucional del ${fechaLimiteStr} (último día del mes anterior al evento). Por favor selecciona un plan con menos cuotas o pago único.`
        );
      }
    }

    // Buscar o crear cliente en Stripe para asociar su método de pago a futuro
    let customerId = undefined;
    try {
      const existingCustomers = await stripe.customers.list({ 
        email: email.toLowerCase().trim(), 
        limit: 1 
      });
      if (existingCustomers.data && existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: email.toLowerCase().trim(),
          name: nombre || "Participante Curso",
          phone: telefono || undefined,
          metadata: {
            cursoId: cursoId || "palermo-2027",
            cursoTitulo: cursoTitulo || "Curso Internacional - Palermo",
            profesion: String(profesion || "").slice(0, 200)
          }
        });
        customerId = newCustomer.id;
      }
    } catch (errCust) {
      console.warn("Advertencia gestionando Customer en Stripe:", errCust.message);
    }

    const expTemasStr = Array.isArray(experienciaTemas) 
      ? experienciaTemas.join(", ") 
      : String(experienciaTemas || "");

    const paymentIntentData = {
      amount: amountInCents,
      currency: currencyLower,
      receipt_email: email,
      metadata: {
        cursoId: cursoId || "palermo-2027",
        cursoTitulo: cursoTitulo || "Curso Internacional - Palermo",
        email: email,
        nombre: nombre || "",
        telefono: telefono || "",
        institucion: institucion || "",
        pais: pais || "",
        profesion: String(profesion || "").slice(0, 200),
        experienciaTemas: expTemasStr.slice(0, 450),
        motivoParticipacion: String(motivoParticipacion || "").slice(0, 450),
        cursosPrevios: String(cursosPrevios || "").slice(0, 200),
        alumnoIiresodh: String(alumnoIiresodh || "no").slice(0, 50),
        planCuotas: String(numPlan),
        numCuotaActual: String(numCuota || 1),
        montoCuota: String(cuotaMonto),
        montoTotal: String(totalInversion),
        saldoPendiente: String(Math.max(0, totalInversion - cuotaMonto)),
        fechaLimitePago: fechaLimitePagoDate.toISOString().split("T")[0],
        politicaLiquidacion: "Totalmente pagado antes del último día del mes previo al evento",
        aceptaPoliticaPrivacidad: "si",
        versionPoliticaPrivacidad: "2026-09-12",
        constanciaPrivacidad: "Consentimiento informado otorgado conforme a la Ley N 8968"
      },
      payment_method_types: ['card'],
    };

    if (customerId) {
      paymentIntentData.customer = customerId;
      if (numPlan > 1) {
        // Guarda la tarjeta para poder procesar las cuotas restantes de forma segura
        paymentIntentData.setup_future_usage = 'off_session';
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    return { 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: customerId || null
    };
  } catch (error) {
    console.error("Error creando PaymentIntent para curso:", error);
    throw new HttpsError("internal", error.message || "No se pudo iniciar el pago del curso.");
  }
});


// ============================================================================
// CONFIGURACIÓN DE NOTIFICACIONES Y CORREOS PARA CURSOS INTERNACIONALES
// ============================================================================
const EMAILS_ADMIN_CURSOS = ["cursos@iiresodh.org", "contacto@iiresodh.org"];

function formatMontoEmail(num) {
  const n = Number(num) || 0;
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getMailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'contacto@iiresodh.org',
      clientId: GMAIL_CLIENT_ID.value(),
      clientSecret: GMAIL_CLIENT_SECRET.value(),
      refreshToken: GMAIL_REFRESH_TOKEN.value()
    }
  });
}

function getLogoAttachment() {
  const logoPath = path.join(__dirname, 'assets', 'logo.png');
  if (fs.existsSync(logoPath)) {
    return [{
      filename: 'logo.png',
      path: logoPath,
      cid: 'logo_iiresodh'
    }];
  }
  return [];
}

// ============================================================================
// HELPER: ALERTA ADMINISTRATIVA A cursos@ Y contacto@ POR CADA TRANSACCIÓN
// ============================================================================
async function enviarAlertaAdminTransaccion({ tipo, datos }) {
  try {
    const transporter = getMailTransporter();
    const esExitosa = tipo === 'exitosa';
    const esCuotas = Number(datos.planCuotas) > 1;

    const asunto = esExitosa
      ? `[IIRESODH - Pago Confirmado] ${datos.nombre || 'Participante'} - ${datos.cursoTitulo || 'Curso'} (${datos.moneda || 'USD'} ${formatMontoEmail(datos.monto)})`
      : `[IIRESODH - ALERTA: Transacción No Realizada] ${datos.nombre || 'Participante'} - ${datos.cursoTitulo || 'Curso'}`;

    const encabezadoColor = esExitosa ? '#065f46' : '#991b1b';
    const bannerBg = esExitosa ? '#ecfdf5' : '#fef2f2';
    const bannerBorder = esExitosa ? '#a7f3d0' : '#fecaca';
    const bannerTexto = esExitosa
      ? (Number(datos.saldoPendiente) <= 0 && esCuotas
          ? '✓ ¡TRANSACCIÓN EXITOSA - MATRÍCULA 100% LIQUIDADA!'
          : '✓ TRANSACCIÓN EXITOSA PROCESADA')
      : '⚠️ ALERTA: TRANSACCIÓN NO COMPLETADA / FALLIDA';

    const detallePlan = esCuotas
      ? `Plan ${datos.planCuotas} cuotas (Cuota ${datos.numCuotaActual || 1} de ${datos.planCuotas})`
      : 'Pago único completo';

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
        <div style="background-color: #1D3557; padding: 20px; text-align: center;">
          <img src="cid:logo_iiresodh" alt="IIRESODH" style="max-height: 48px; width: auto; max-width: 240px; margin: 0 auto; display: block; border: 0;" />
        </div>

        <div style="padding: 26px 22px;">
          <div style="background-color: ${bannerBg}; border: 1px solid ${bannerBorder}; border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; text-align: center;">
            <p style="color: ${encabezadoColor}; font-size: 14px; font-weight: 800; margin: 0; letter-spacing: 0.3px;">
              ${bannerTexto}
            </p>
          </div>

          <h3 style="color: #1D3557; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
            Información de la Transacción
          </h3>

          <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
            <tr>
              <td style="padding: 7px 0; color: #64748b; width: 38%;">Programa Académico:</td>
              <td style="padding: 7px 0; font-weight: 600; text-align: right;">${datos.cursoTitulo || 'Curso Internacional'}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; color: #64748b;">Participante:</td>
              <td style="padding: 7px 0; font-weight: 600; text-align: right;">${datos.nombre || 'No registrado'}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; color: #64748b;">Correo electrónico:</td>
              <td style="padding: 7px 0; font-weight: 600; text-align: right;"><a href="mailto:${datos.email}" style="color: #1D3557;">${datos.email || 'N/A'}</a></td>
            </tr>
            ${datos.telefono ? `<tr><td style="padding: 7px 0; color: #64748b;">Teléfono / WhatsApp:</td><td style="padding: 7px 0; text-align: right;">${datos.telefono}</td></tr>` : ''}
            ${datos.pais ? `<tr><td style="padding: 7px 0; color: #64748b;">País:</td><td style="padding: 7px 0; text-align: right;">${datos.pais}</td></tr>` : ''}
            <tr>
              <td style="padding: 7px 0; color: #64748b;">Modalidad de Pago:</td>
              <td style="padding: 7px 0; font-weight: 600; text-align: right; color: #1D3557;">${detallePlan}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; color: #64748b;">Monto de la Transacción:</td>
              <td style="padding: 7px 0; font-weight: 800; font-size: 15px; color: ${esExitosa ? '#047857' : '#b91c1c'}; text-align: right;">
                ${datos.moneda || 'USD'} ${formatMontoEmail(datos.monto)}
              </td>
            </tr>
            ${esExitosa ? `
              <tr>
                <td style="padding: 7px 0; color: #64748b;">Saldo Pendiente:</td>
                <td style="padding: 7px 0; font-weight: 700; text-align: right; color: ${Number(datos.saldoPendiente) <= 0 ? '#047857' : '#b45309'};">
                  ${Number(datos.saldoPendiente) <= 0 ? '✓ 0.00 (Liquidado al 100%)' : `${datos.moneda || 'USD'} ${formatMontoEmail(datos.saldoPendiente)}`}
                </td>
              </tr>
            ` : `
              <tr>
                <td style="padding: 7px 0; color: #b91c1c; font-weight: 700;">Motivo del Rechazo / Error:</td>
                <td style="padding: 7px 0; font-weight: 700; color: #b91c1c; text-align: right;">
                  ${datos.errorMensaje || 'Tarjeta rechazada o declinada'} (${datos.errorCode || 'error'})
                </td>
              </tr>
            `}
            <tr>
              <td style="padding: 7px 0; color: #64748b;">Tipo de Cobro:</td>
              <td style="padding: 7px 0; text-align: right;">${datos.esCobroAutomatico ? 'Automático programado (Off-session)' : 'Inscripción directa'}</td>
            </tr>
            ${datos.paymentIntentId ? `
              <tr>
                <td style="padding: 7px 0; color: #64748b;">ID Stripe PaymentIntent:</td>
                <td style="padding: 7px 0; text-align: right; font-family: monospace; font-size: 11px;">${datos.paymentIntentId}</td>
              </tr>
            ` : ''}
            ${datos.customerId ? `
              <tr>
                <td style="padding: 7px 0; color: #64748b;">ID Stripe Customer:</td>
                <td style="padding: 7px 0; text-align: right; font-family: monospace; font-size: 11px;">${datos.customerId}</td>
              </tr>
            ` : ''}
          </table>

          ${!esExitosa ? `
            <div style="margin-top: 20px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #92400e;">
              <strong>Acción sugerida para coordinación:</strong> Comunicarse con el/la participante al correo <a href="mailto:${datos.email}" style="color: #92400e; font-weight: bold;">${datos.email}</a> ${datos.telefono ? `o al teléfono ${datos.telefono}` : ''} para solicitar la actualización de su tarjeta o emitir un enlace directo de pago y preservar su cupo académico.
            </div>
          ` : ''}
        </div>

        <div style="background-color: #f8fafc; padding: 12px 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Notificación automática del Sistema de Cursos IIRESODH enviada a ${EMAILS_ADMIN_CURSOS.join(' y ')}.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Sistema IIRESODH Cursos" <contacto@iiresodh.org>`,
      to: EMAILS_ADMIN_CURSOS.join(', '),
      subject: asunto,
      html: htmlContent,
      attachments: getLogoAttachment()
    });
    console.log(`Alerta admin enviada (${tipo}) a ${EMAILS_ADMIN_CURSOS.join(', ')}.`);
  } catch (error) {
    console.error("Error enviando alerta administrativa de transacción:", error);
  }
}

// ============================================================================
// HELPER: RECORDATORIO 1 SEMANA (7 DÍAS) ANTES DEL COBRO DE LA CUOTA
// ============================================================================
async function enviarCorreoRecordatorioCuota({
  email,
  nombre,
  cursoTitulo,
  numCuotaSiguiente,
  planCuotas,
  montoCuota,
  moneda,
  fechaCobroStr,
  saldoPendienteDespues
}) {
  try {
    const transporter = getMailTransporter();

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #1D3557; padding: 24px; text-align: center;">
          <img src="cid:logo_iiresodh" alt="IIRESODH" style="max-height: 52px; width: auto; max-width: 250px; margin: 0 auto; display: block; border: 0;" />
        </div>

        <div style="padding: 32px 24px;">
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="color: #1e40af; font-size: 14px; font-weight: bold; margin: 0;">
              ℹ️ Recordatorio de pago: Próxima cuota en 7 días
            </p>
          </div>

          <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin-top: 0;">
            Estimado/a <strong>${nombre}</strong>,
          </p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Te escribimos del Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH) para recordarte que en exactamente <strong>7 días (el próximo ${fechaCobroStr})</strong> se procesará automáticamente la <strong>cuota ${numCuotaSiguiente} de ${planCuotas}</strong> de tu matrícula para el programa <strong>${cursoTitulo}</strong>.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 24px 0;">
            <h3 style="color: #1D3557; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
              Detalles del Cargo Programado
            </h3>
            <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Programa:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right;">${cursoTitulo}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Cuota por cobrar:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #1D3557;">Cuota ${numCuotaSiguiente} de ${planCuotas}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Fecha programada de cargo:</td>
                <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #1e293b;">${fechaCobroStr}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Monto de la cuota:</td>
                <td style="padding: 6px 0; font-weight: 800; font-size: 16px; color: #B92F32; text-align: right;">${moneda} ${formatMontoEmail(montoCuota)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Saldo restante tras este pago:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right; color: ${Number(saldoPendienteDespues) <= 0 ? '#047857' : '#b45309'};">
                  ${Number(saldoPendienteDespues) <= 0 ? '✓ Inversión quedará 100% liquidada' : `${moneda} ${formatMontoEmail(saldoPendienteDespues)}`}
                </td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            <strong>¿Debo hacer algo?</strong><br>
            No requieres realizar ninguna acción manual. El cargo se efectuará con la misma tarjeta que registraste al inscribirte. Solo te sugerimos verificar que tu tarjeta cuente con saldo disponible y permisos activos para transacciones internacionales.
          </p>

          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            Si necesitas actualizar tu tarjeta bancaria, solicitar factura institucional anticipada o consultar cualquier aspecto logístico del curso, puedes responder directamente a este correo o escribir a <a href="mailto:cursos@iiresodh.org" style="color: #1D3557; font-weight: bold;">cursos@iiresodh.org</a>.
          </p>

          <p style="font-size: 13px; color: #1e293b; margin-top: 28px;">
            Cordialmente,<br>
            <strong>Coordinación Académica y Financiera</strong><br>
            Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)<br>
            <a href="https://iiresodh.org" style="color: #B92F32; text-decoration: none; font-size: 12px;">www.iiresodh.org</a>
          </p>
        </div>

        <div style="background-color: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b;">
          Recordatorio de gestión de cobro generado automáticamente por IIRESODH.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"IIRESODH - Cursos Internacionales" <contacto@iiresodh.org>`,
      to: email,
      bcc: EMAILS_ADMIN_CURSOS,
      subject: `Recordatorio de Próxima Cuota (${numCuotaSiguiente}/${planCuotas}): ${cursoTitulo}`,
      html: htmlContent,
      attachments: getLogoAttachment()
    });
    console.log(`Recordatorio de cuota ${numCuotaSiguiente} enviado a ${email} (BCC: ${EMAILS_ADMIN_CURSOS.join(', ')})`);
  } catch (error) {
    console.error(`Error enviando recordatorio de cuota a ${email}:`, error);
  }
}

// ============================================================================
// HELPER: AVISO AL CLIENTE EN CASO DE COBRO FALLIDO
// ============================================================================
async function enviarCorreoFalloCobroCliente({
  email,
  nombre,
  cursoTitulo,
  numCuota,
  planCuotas,
  montoCuota,
  moneda,
  motivoError
}) {
  try {
    const transporter = getMailTransporter();

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #1D3557; padding: 24px; text-align: center;">
          <img src="cid:logo_iiresodh" alt="IIRESODH" style="max-height: 52px; width: auto; max-width: 250px; margin: 0 auto; display: block; border: 0;" />
        </div>

        <div style="padding: 32px 24px;">
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="color: #991b1b; font-size: 14px; font-weight: bold; margin: 0;">
              ⚠️ Aviso: No se pudo procesar el cobro de tu cuota
            </p>
          </div>

          <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin-top: 0;">
            Estimado/a <strong>${nombre}</strong>,
          </p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Te informamos que al intentar procesar la <strong>cuota ${numCuota} de ${planCuotas}</strong> (${moneda} ${formatMontoEmail(montoCuota)}) para el programa académico internacional <strong>${cursoTitulo}</strong>, la pasarela de pagos recibió una notificación de rechazo por parte de tu entidad bancaria.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 24px 0;">
            <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;">Detalle informado:</p>
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #b91c1c;">${motivoError || 'Tarjeta declinada por la entidad emisora'}</p>
          </div>

          <h3 style="color: #1D3557; font-size: 14px; font-weight: 700; margin: 20px 0 8px 0;">
            ¿Cómo asegurar que tu cupo permanezca activo?
          </h3>
          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            Te solicitamos comunicarte con nosotros respondiendo directamente a este correo o escribiendo a <a href="mailto:cursos@iiresodh.org" style="color: #1D3557; font-weight: bold;">cursos@iiresodh.org</a> y <a href="mailto:contacto@iiresodh.org" style="color: #1D3557; font-weight: bold;">contacto@iiresodh.org</a>. Nuestro equipo te asistirá para renovar el registro de tu tarjeta o proporcionarte una vía de pago alternativa sin ningún recargo.
          </p>

          <p style="font-size: 13px; color: #1e293b; margin-top: 28px;">
            Atentamente,<br>
            <strong>Coordinación Administrativa</strong><br>
            Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"IIRESODH - Cursos Internacionales" <contacto@iiresodh.org>`,
      to: email,
      bcc: EMAILS_ADMIN_CURSOS,
      subject: `Aviso Importante: No se pudo procesar tu cuota (${numCuota}/${planCuotas}) - ${cursoTitulo}`,
      html: htmlContent,
      attachments: getLogoAttachment()
    });
    console.log(`Aviso de cobro fallido enviado a ${email} (BCC: ${EMAILS_ADMIN_CURSOS.join(', ')})`);
  } catch (error) {
    console.error(`Error enviando aviso de cobro fallido a ${email}:`, error);
  }
}

// ============================================================================
// HELPER: ENVÍO DE CORREO DE CONFIRMACIÓN DE INSCRIPCIÓN / CUOTA A CURSO
// ============================================================================
async function enviarCorreoConfirmacionCurso({
  email,
  nombre,
  cursoTitulo,
  montoTotal,
  moneda,
  planCuotas,
  numCuotaActual,
  saldoPendiente,
  paymentIntentId,
  profesion,
  institucion,
  pais
}) {
  try {
    const transporter = getMailTransporter();
    const esCuotas = Number(planCuotas) > 1;
    const estaLiquidadoTotal = Number(saldoPendiente) <= 0;

    const cuotaTexto = esCuotas
      ? `Plan en ${planCuotas} cuotas (Pago de cuota ${numCuotaActual} de ${planCuotas})`
      : 'Pago único de inversión completa';

    const saldoTexto = (esCuotas && !estaLiquidadoTotal)
      ? `<p style="margin: 8px 0 0 0; color: #b45309; font-weight: bold; font-size: 13px;">Saldo restante por liquidar: ${moneda} ${formatMontoEmail(saldoPendiente)} (${planCuotas - numCuotaActual} cuotas mensuales sin interés restantes)</p>`
      : '<p style="margin: 8px 0 0 0; color: #047857; font-weight: bold; font-size: 13px;">✓ Inversión del curso liquidada al 100%</p>';

    const celebrationHtml = (esCuotas && estaLiquidadoTotal) ? `
      <div style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
        <h2 style="color: #047857; font-size: 17px; font-weight: 800; margin: 0 0 6px 0;">
          🎉 ¡FELICITACIONES! MATRÍCULA 100% LIQUIDADA
        </h2>
        <p style="color: #065f46; font-size: 13px; margin: 0; line-height: 1.5;">
          Has completado exitosamente la totalidad de tus cuotas académicas para <strong>${cursoTitulo}</strong>. No tienes ningún saldo pendiente y tu plaza se encuentra formal y definitivamente asegurada.
        </p>
      </div>
    ` : `
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
        <p style="color: #065f46; font-size: 14px; font-weight: bold; margin: 0;">
          ✓ ¡Pago de cuota confirmado exitosamente!
        </p>
      </div>
    `;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #1D3557; padding: 24px; text-align: center;">
          <img src="cid:logo_iiresodh" alt="IIRESODH" style="max-height: 54px; width: auto; max-width: 260px; margin: 0 auto; display: block; border: 0;" />
        </div>

        <div style="padding: 32px 24px;">
          ${celebrationHtml}

          <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin-top: 0;">
            Estimado/a <strong>${nombre}</strong>,
          </p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Hemos recibido con éxito el pago para el programa académico internacional <strong>${cursoTitulo}</strong>. Tu plaza se encuentra formalmente registrada en el expediente oficial del curso.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 24px 0;">
            <h3 style="color: #1D3557; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
              Detalles del Registro y Pago
            </h3>
            <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Programa:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right;">${cursoTitulo}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Participante:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right;">${nombre}</td>
              </tr>
              ${profesion && profesion.trim() ? `<tr><td style="padding: 6px 0; color: #64748b;">Profesión:</td><td style="padding: 6px 0; font-weight: 600; text-align: right;">${profesion}</td></tr>` : ''}
              ${institucion && institucion.trim() && !institucion.toLowerCase().includes('pago directo') && !institucion.toLowerCase().includes('stripe') && !institucion.toLowerCase().includes('inscripción en línea') ? `<tr><td style="padding: 6px 0; color: #64748b;">Institución:</td><td style="padding: 6px 0; font-weight: 600; text-align: right;">${institucion}</td></tr>` : ''}
              ${pais ? `<tr><td style="padding: 6px 0; color: #64748b;">País:</td><td style="padding: 6px 0; text-align: right;">${pais}</td></tr>` : ''}
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Modalidad de Pago:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #1D3557; text-align: right;">${cuotaTexto}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Monto abonado:</td>
                <td style="padding: 6px 0; font-weight: 800; font-size: 15px; color: #B92F32; text-align: right;">${moneda} ${formatMontoEmail(montoTotal)}</td>
              </tr>
            </table>
            ${saldoTexto}
            ${paymentIntentId ? `
              <p style="font-size: 11px; color: #94a3b8; margin: 12px 0 0 0; border-top: 1px dashed #e2e8f0; padding-top: 8px;">
                Referencia de Transacción Stripe: <code style="background-color: #ffffff; padding: 2px 4px; border: 1px solid #e2e8f0; border-radius: 4px;">${paymentIntentId}</code>
              </p>
            ` : ''}
          </div>

          <h3 style="color: #1D3557; font-size: 14px; font-weight: 700; margin: 20px 0 8px 0;">
            Próximos Pasos Académicos
          </h3>
          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            Nuestro equipo de coordinación académica se pondrá en contacto contigo para remitirte el expediente oficial de admisión, el cronograma detallado de ponencias y las orientaciones logísticas para tu estancia académica en Palermo.
          </p>

          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            Si requieres factura institucional, orden de compra o certificado de admisión para trámites oficiales de tu despacho u organización, puedes responder directamente a este correo o contactarnos a <a href="mailto:cursos@iiresodh.org" style="color: #1D3557; font-weight: bold;">cursos@iiresodh.org</a> o <a href="mailto:contacto@iiresodh.org" style="color: #1D3557; font-weight: bold;">contacto@iiresodh.org</a>.
          </p>

          <p style="font-size: 13px; color: #1e293b; margin-top: 28px;">
            Atentamente,<br>
            <strong>Coordinación Académica Internacional</strong><br>
            Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)<br>
            <a href="https://iiresodh.org" style="color: #B92F32; text-decoration: none; font-size: 12px;">www.iiresodh.org</a>
          </p>
        </div>

        <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b;">
          Este es un comprobante automático de confirmación generado por IIRESODH. Por favor, conserva este correo para tu expediente.
        </div>
      </div>
    `;

    const subject = (esCuotas && estaLiquidadoTotal)
      ? `¡Matrícula 100% Liquidada! Confirmación Final: ${cursoTitulo}`
      : `Confirmación de Pago: ${cursoTitulo}`;

    await transporter.sendMail({
      from: `"IIRESODH - Cursos Internacionales" <contacto@iiresodh.org>`,
      to: email,
      bcc: EMAILS_ADMIN_CURSOS,
      subject: subject,
      html: htmlContent,
      attachments: getLogoAttachment()
    });
    console.log(`Correo de confirmación enviado exitosamente a ${email} (BCC: ${EMAILS_ADMIN_CURSOS.join(', ')}).`);
  } catch (error) {
    console.error(`Error enviando correo de confirmación a ${email}:`, error);
  }
}

// ============================================================================
// 13. WEBHOOK DE STRIPE PARA CURSOS PRESENCIALES (CUENTA DEDICADA)
// ============================================================================
exports.stripeWebhookCursos = onRequest({ 
  secrets: [
    STRIPE_CURSOS_SECRET_KEY, 
    STRIPE_CURSOS_WEBHOOK_SECRET,
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN
  ],
  region: "us-central1",
  memory: "512MiB",
  timeoutSeconds: 60
}, async (req, res) => {
  const stripeKey = getStripeCursosKey();
  const endpointSecret = getStripeCursosWebhookSecret();
  const stripe = new Stripe(stripeKey);

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Error de firma del Webhook Cursos: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const db = admin.firestore();

  try {
    // -------------------------------------------------------------
    // EVENTO 1: checkout.session.completed (Payment Links / Checkout)
    // -------------------------------------------------------------
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Idempotencia: evitar duplicados
      const existing = await db.collection("solicitudesCursos")
        .where("stripeSessionId", "==", session.id)
        .limit(1)
        .get();

      if (!existing.empty) {
        console.log(`Sesión de checkout ${session.id} ya fue procesada anteriormente.`);
        return res.json({ received: true });
      }

      const email = session.customer_details?.email || session.customer_email || "cliente@anonimo.com";
      const nombre = session.customer_details?.name || "Participante Confirmado";
      const telefono = session.customer_details?.phone || "";
      const pais = session.customer_details?.address?.country || "No especificado";
      const montoTotal = (session.amount_total || 0) / 100;
      const moneda = (session.currency || "usd").toUpperCase();
      const metadata = session.metadata || {};
      const cursoId = metadata.cursoId || "palermo-2027";
      const cursoTitulo = metadata.cursoTitulo || metadata.cursoNombre || "Curso Internacional - Palermo";

      // Si existía una solicitud previa con ese correo y curso, actualizarla
      const solicitudesPrevias = await db.collection("solicitudesCursos")
        .where("email", "==", email.toLowerCase().trim())
        .where("cursoId", "==", cursoId)
        .limit(1)
        .get();

      if (!solicitudesPrevias.empty) {
        const docId = solicitudesPrevias.docs[0].id;
        await db.collection("solicitudesCursos").doc(docId).update({
          estado: "confirmado",
          metodoPago: "stripe",
          montoPagado: montoTotal,
          moneda: moneda,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent || null,
          fechaPago: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Solicitud de curso previa ${docId} actualizada a 'confirmado' exitosamente.`);
      } else {
        await db.collection("solicitudesCursos").add({
          cursoId: cursoId,
          cursoTitulo: cursoTitulo,
          nombre: nombre,
          email: email.toLowerCase().trim(),
          telefono: telefono,
          institucion: metadata.institucion || "",
          pais: pais,
          comentarios: `Pago de inscripción completado en Stripe Checkout (${moneda} ${montoTotal}).`,
          estado: "confirmado",
          metodoPago: "stripe",
          montoPagado: montoTotal,
          moneda: moneda,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent || null,
          fechaSolicitud: admin.firestore.FieldValue.serverTimestamp(),
          fechaPago: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Nueva inscripción creada en solicitudesCursos para ${email}.`);
      }

      // Enviar correo de confirmación de inscripción al participante
      await enviarCorreoConfirmacionCurso({
        email,
        nombre,
        cursoTitulo,
        montoTotal,
        moneda,
        planCuotas: 1,
        numCuotaActual: 1,
        saldoPendiente: 0,
        paymentIntentId: session.payment_intent || session.id,
        profesion: metadata.profesion || "",
        institucion: metadata.institucion || "",
        pais: pais
      });

      // Notificar a administradores (cursos@ y contacto@)
      await enviarAlertaAdminTransaccion({
        tipo: 'exitosa',
        datos: {
          nombre,
          email,
          telefono,
          pais,
          cursoTitulo,
          planCuotas: 1,
          numCuotaActual: 1,
          monto: montoTotal,
          moneda,
          saldoPendiente: 0,
          paymentIntentId: session.payment_intent || session.id,
          customerId: session.customer || null,
          esCobroAutomatico: false
        }
      });

      return res.json({ received: true });
    }

    // -------------------------------------------------------------
    // EVENTO 2: payment_intent.succeeded (Stripe Elements / Directo)
    // -------------------------------------------------------------
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      // Idempotencia
      const existing = await db.collection("solicitudesCursos")
        .where("stripePaymentIntentId", "==", paymentIntent.id)
        .limit(1)
        .get();

      if (!existing.empty) {
        console.log(`PaymentIntent ${paymentIntent.id} ya fue procesado anteriormente.`);
        return res.json({ received: true });
      }

      const metadata = paymentIntent.metadata || {};
      const email = paymentIntent.receipt_email || metadata.email || metadata.emailCliente || "cliente@anonimo.com";
      const nombre = metadata.nombre || "Participante Confirmado";
      const montoTotal = (paymentIntent.amount || 0) / 100;
      const moneda = (paymentIntent.currency || "usd").toUpperCase();
      const cursoId = metadata.cursoId || "palermo-2027";
      const cursoTitulo = metadata.cursoTitulo || metadata.cursoNombre || "Curso Internacional - Palermo";

      const planCuotas = Number(metadata.planCuotas) || 1;
      const numCuotaActual = Number(metadata.numCuotaActual) || 1;
      const totalInversion = Number(metadata.montoTotal) || montoTotal;
      const saldoPendiente = Number(metadata.saldoPendiente) || 0;

      // Verificar si ya existía una solicitud con este email y curso
      const checkPrev = await db.collection("solicitudesCursos")
        .where("email", "==", email.toLowerCase().trim())
        .where("cursoId", "==", cursoId)
        .limit(1)
        .get();

      if (!checkPrev.empty) {
        const docId = checkPrev.docs[0].id;
        const current = checkPrev.docs[0].data();
        const nuevaCuota = (current.cuotasPagadas || 0) + 1;
        const totalAbonado = (current.montoPagado || 0) + montoTotal;
        const saldoRestante = Math.max(0, (current.montoTotalInversion || totalInversion) - totalAbonado);

        let proximaFechaCobro = null;
        if (saldoRestante > 0 && nuevaCuota < planCuotas) {
          const nextDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const fechaLimStr = metadata.fechaLimitePago || current.fechaLimitePago || "2027-04-30";
          const fechaLim = new Date(fechaLimStr + "T23:59:59Z");
          if (nextDate > fechaLim) nextDate.setTime(fechaLim.getTime());
          proximaFechaCobro = admin.firestore.Timestamp.fromDate(nextDate);
        }

        await db.collection("solicitudesCursos").doc(docId).update({
          estado: "confirmado",
          metodoPago: "stripe",
          planCuotas: planCuotas,
          cuotasPagadas: nuevaCuota,
          montoPagado: totalAbonado,
          montoTotalInversion: totalInversion,
          saldoPendiente: saldoRestante,
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: paymentIntent.customer || current.stripeCustomerId || null,
          fechaPago: admin.firestore.FieldValue.serverTimestamp(),
          fechaProximoCobro: proximaFechaCobro,
          fechaLimitePago: metadata.fechaLimitePago || current.fechaLimitePago || "2027-04-30",
          ultimoRecordatorioCuota: null,
          profesion: metadata.profesion || current.profesion || "",
          experienciaTemas: metadata.experienciaTemas || current.experienciaTemas || "",
          motivoParticipacion: metadata.motivoParticipacion || current.motivoParticipacion || "",
          cursosPrevios: metadata.cursosPrevios || current.cursosPrevios || "",
          alumnoIiresodh: metadata.alumnoIiresodh || current.alumnoIiresodh || "no",
          aceptaPoliticaPrivacidad: true,
          fechaAceptacionPrivacidad: current.fechaAceptacionPrivacidad || admin.firestore.FieldValue.serverTimestamp(),
          versionPoliticaPrivacidad: metadata.versionPoliticaPrivacidad || current.versionPoliticaPrivacidad || "2026-09-12",
          constanciaPrivacidad: "Consentimiento informado otorgado conforme a la Ley N° 8968 de Costa Rica.",
          comentarios: `Pago procesado con Stripe (${moneda} ${montoTotal}). Cuota ${nuevaCuota}/${planCuotas}. Saldo pendiente: ${saldoRestante}.`
        });
        console.log(`Solicitud ${docId} actualizada con pago Stripe para ${email}.`);

        // Enviar correo de confirmación de cuota/inscripción
        await enviarCorreoConfirmacionCurso({
          email,
          nombre,
          cursoTitulo,
          montoTotal,
          moneda,
          planCuotas,
          numCuotaActual: nuevaCuota,
          saldoPendiente: saldoRestante,
          paymentIntentId: paymentIntent.id,
          profesion: metadata.profesion || current.profesion || "",
          institucion: metadata.institucion || current.institucion || "",
          pais: metadata.pais || current.pais || ""
        });

        // Notificar a administradores
        await enviarAlertaAdminTransaccion({
          tipo: 'exitosa',
          datos: {
            nombre,
            email,
            telefono: metadata.telefono || current.telefono || "",
            pais: metadata.pais || current.pais || "",
            cursoTitulo,
            planCuotas,
            numCuotaActual: nuevaCuota,
            monto: montoTotal,
            montoTotal: totalInversion,
            moneda,
            saldoPendiente: saldoRestante,
            paymentIntentId: paymentIntent.id,
            customerId: paymentIntent.customer || current.stripeCustomerId || null,
            esCobroAutomatico: metadata.esCobroAutomatico === "true"
          }
        });
      } else {
        let proximaFechaCobro = null;
        if (saldoPendiente > 0 && numCuotaActual < planCuotas) {
          const nextDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const fechaLimStr = metadata.fechaLimitePago || "2027-04-30";
          const fechaLim = new Date(fechaLimStr + "T23:59:59Z");
          if (nextDate > fechaLim) nextDate.setTime(fechaLim.getTime());
          proximaFechaCobro = admin.firestore.Timestamp.fromDate(nextDate);
        }

        await db.collection("solicitudesCursos").add({
          cursoId: cursoId,
          cursoTitulo: cursoTitulo,
          nombre: nombre,
          email: email.toLowerCase().trim(),
          telefono: metadata.telefono || "",
          institucion: metadata.institucion || "",
          pais: metadata.pais || "No especificado",
          comentarios: planCuotas > 1
            ? `Pago Cuota ${numCuotaActual} de ${planCuotas} (${moneda} ${montoTotal}). Saldo restante: ${moneda} ${saldoPendiente}.`
            : `Pago completo completado con tarjeta vía Stripe (${moneda} ${montoTotal}).`,
          profesion: metadata.profesion || "",
          experienciaTemas: metadata.experienciaTemas || "",
          motivoParticipacion: metadata.motivoParticipacion || "",
          cursosPrevios: metadata.cursosPrevios || "",
          alumnoIiresodh: metadata.alumnoIiresodh || "no",
          aceptaPoliticaPrivacidad: true,
          fechaAceptacionPrivacidad: admin.firestore.FieldValue.serverTimestamp(),
          versionPoliticaPrivacidad: metadata.versionPoliticaPrivacidad || "2026-09-12",
          constanciaPrivacidad: "Consentimiento informado otorgado conforme a la Ley N° 8968 de Costa Rica.",
          estado: "confirmado",
          metodoPago: "stripe",
          planCuotas: planCuotas,
          cuotasPagadas: numCuotaActual,
          montoPagado: montoTotal,
          montoTotalInversion: totalInversion,
          saldoPendiente: saldoPendiente,
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: paymentIntent.customer || null,
          fechaSolicitud: admin.firestore.FieldValue.serverTimestamp(),
          fechaPago: admin.firestore.FieldValue.serverTimestamp(),
          fechaProximoCobro: proximaFechaCobro,
          fechaLimitePago: metadata.fechaLimitePago || "2027-04-30",
          ultimoRecordatorioCuota: null
        });
        console.log(`Inscripción registrada por payment_intent.succeeded para ${email}. Plan: ${planCuotas} pagos.`);

        // Enviar correo de confirmación de inscripción
        await enviarCorreoConfirmacionCurso({
          email,
          nombre,
          cursoTitulo,
          montoTotal,
          moneda,
          planCuotas,
          numCuotaActual,
          saldoPendiente,
          paymentIntentId: paymentIntent.id,
          profesion: metadata.profesion || "",
          institucion: metadata.institucion || "",
          pais: metadata.pais || ""
        });

        // Notificar a administradores
        await enviarAlertaAdminTransaccion({
          tipo: 'exitosa',
          datos: {
            nombre,
            email,
            telefono: metadata.telefono || "",
            pais: metadata.pais || "",
            cursoTitulo,
            planCuotas,
            numCuotaActual,
            monto: montoTotal,
            montoTotal: totalInversion,
            moneda,
            saldoPendiente: saldoPendiente,
            paymentIntentId: paymentIntent.id,
            customerId: paymentIntent.customer || null,
            esCobroAutomatico: metadata.esCobroAutomatico === "true"
          }
        });
      }

      return res.json({ received: true });
    }

    // -------------------------------------------------------------
    // EVENTO 3: payment_intent.payment_failed (Cobros fallidos o rechazados)
    // -------------------------------------------------------------
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata || {};
      const email = paymentIntent.receipt_email || metadata.email || metadata.emailCliente || "";
      const nombre = metadata.nombre || "Participante";
      const montoTotal = (paymentIntent.amount || 0) / 100;
      const moneda = (paymentIntent.currency || "usd").toUpperCase();
      const cursoTitulo = metadata.cursoTitulo || metadata.cursoNombre || "Curso Internacional";
      const lastError = paymentIntent.last_payment_error;
      const errorMensaje = lastError?.message || "Tarjeta rechazada por la entidad bancaria emisora.";
      const errorCode = lastError?.code || "payment_failed";

      console.warn(`Cobro fallido detectado en Stripe: ${paymentIntent.id} para ${email}. Motivo: ${errorMensaje}`);

      await enviarAlertaAdminTransaccion({
        tipo: 'fallida',
        datos: {
          nombre,
          email,
          telefono: metadata.telefono || "",
          pais: metadata.pais || "",
          cursoTitulo,
          planCuotas: Number(metadata.planCuotas) || 1,
          numCuotaActual: Number(metadata.numCuotaActual) || 1,
          monto: montoTotal,
          moneda,
          errorMensaje,
          errorCode,
          paymentIntentId: paymentIntent.id,
          customerId: paymentIntent.customer || null,
          esCobroAutomatico: metadata.esCobroAutomatico === "true"
        }
      });

      if (email) {
        await enviarCorreoFalloCobroCliente({
          email,
          nombre,
          cursoTitulo,
          numCuota: Number(metadata.numCuotaActual) || 1,
          planCuotas: Number(metadata.planCuotas) || 1,
          montoCuota: montoTotal,
          moneda,
          motivoError: errorMensaje
        });
      }

      return res.json({ received: true });
    }

    // -------------------------------------------------------------
    // EVENTO 4: charge.refunded (Reembolsos)
    // -------------------------------------------------------------
    if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      const paymentIntentId = charge.payment_intent;

      if (paymentIntentId) {
        const snapshot = await db.collection("solicitudesCursos")
          .where("stripePaymentIntentId", "==", paymentIntentId)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            estado: "cancelado",
            reembolsado: true,
            fechaReembolso: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`Inscripción vinculada a ${paymentIntentId} marcada como cancelada por reembolso.`);
        }
      }

      return res.json({ received: true });
    }

    // Para cualquier otro evento de Stripe no explícito
    return res.json({ received: true });
  } catch (error) {
    console.error("Error en procesamiento de stripeWebhookCursos:", error);
    return res.status(500).json({ error: "Error interno procesando evento de cursos." });
  }
});

// ============================================================================
// 14. TAREA PROGRAMADA: COBROS AUTOMÁTICOS OFF-SESSION Y RECORDATORIOS (7 DÍAS)
// ============================================================================
exports.procesarCobrosYRecordatoriosCuotasCursos = onSchedule({
  schedule: "every day 08:00",
  timeZone: "America/Costa_Rica",
  secrets: [
    STRIPE_CURSOS_SECRET_KEY,
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN
  ],
  region: "us-central1",
  memory: "512MiB",
  timeoutSeconds: 300
}, async (event) => {
  console.log("Iniciando tarea programada: Cobros automáticos y recordatorios de cuotas...");
  const db = admin.firestore();
  const stripeKey = getStripeCursosKey();
  if (!stripeKey) {
    console.error("No se encontró STRIPE_CURSOS_SECRET_KEY. Omitiendo proceso.");
    return;
  }
  const stripe = new Stripe(stripeKey);
  const ahora = new Date();

  try {
    const snapshot = await db.collection("solicitudesCursos")
      .where("estado", "==", "confirmado")
      .where("planCuotas", ">", 1)
      .get();

    if (snapshot.empty) {
      console.log("No hay inscripciones en cuotas activas para evaluar.");
      return;
    }

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const cuotasPagadas = Number(data.cuotasPagadas) || 1;
      const planCuotas = Number(data.planCuotas) || 1;
      const saldoPendiente = Number(data.saldoPendiente) || 0;

      if (cuotasPagadas >= planCuotas || saldoPendiente <= 0) {
        continue;
      }

      if (!data.fechaProximoCobro) {
        continue;
      }

      const fechaProx = data.fechaProximoCobro.toDate();
      const msDiferencia = fechaProx.getTime() - ahora.getTime();
      const diasFaltantes = Math.ceil(msDiferencia / (1000 * 60 * 60 * 24));
      const siguienteCuota = cuotasPagadas + 1;
      const cuotasRestantes = Math.max(1, planCuotas - cuotasPagadas);
      const montoCuota = Number((saldoPendiente / cuotasRestantes).toFixed(2));
      const moneda = (data.moneda || "USD").toUpperCase();
      const cursoTitulo = data.cursoTitulo || "Curso Internacional - Palermo";
      const nombre = data.nombre || "Participante";
      const email = data.email;

      // 1. RECORDATORIO: Si faltan entre 0 y 7 días para el cobro programado
      if (diasFaltantes <= 7 && diasFaltantes >= 0) {
        if (data.ultimoRecordatorioCuota !== siguienteCuota) {
          console.log(`Enviando recordatorio de cuota ${siguienteCuota}/${planCuotas} a ${email} (Faltan ${diasFaltantes} días)`);
          const fechaCobroStr = fechaProx.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
          });
          const saldoDespues = Math.max(0, Number((saldoPendiente - montoCuota).toFixed(2)));

          await enviarCorreoRecordatorioCuota({
            email,
            nombre,
            cursoTitulo,
            numCuotaSiguiente: siguienteCuota,
            planCuotas,
            montoCuota,
            moneda,
            fechaCobroStr,
            saldoPendienteDespues: saldoDespues
          });

          await docSnap.ref.update({
            ultimoRecordatorioCuota: siguienteCuota,
            fechaUltimoRecordatorio: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }

      // 2. EJECUCIÓN DE COBRO AUTOMÁTICO: Si hoy es igual o posterior a la fecha programada
      if (ahora >= fechaProx) {
        console.log(`Procesando cobro automático de cuota ${siguienteCuota}/${planCuotas} para ${email} (${moneda} ${montoCuota})`);

        // Regla institucional estricta: todos los plazos deben terminar antes del último día del mes anterior al evento (2027-04-30 para Palermo)
        const fechaLimiteStr = data.fechaLimitePago || "2027-04-30";
        const fechaLimite = new Date(fechaLimiteStr + "T23:59:59Z");

        if (ahora > fechaLimite) {
          console.warn(`Cobro detenido: La fecha actual supera la fecha límite del curso (${fechaLimiteStr}) para ${email}.`);
          await enviarAlertaAdminTransaccion({
            tipo: 'fallida',
            datos: {
              nombre,
              email,
              telefono: data.telefono,
              pais: data.pais,
              cursoTitulo,
              planCuotas,
              numCuotaActual: siguienteCuota,
              monto: montoCuota,
              moneda,
              errorMensaje: `Cobro automático detenido: Se superó la fecha límite institucional (${fechaLimiteStr}). Requiere contacto manual con el participante.`
            }
          });
          continue;
        }

        if (!data.stripeCustomerId) {
          console.warn(`Inscripción ${docSnap.id} (${email}) no tiene stripeCustomerId registrado.`);
          continue;
        }

        try {
          const paymentMethods = await stripe.paymentMethods.list({
            customer: data.stripeCustomerId,
            type: 'card',
            limit: 1
          });

          if (!paymentMethods.data || paymentMethods.data.length === 0) {
            throw new Error("No se encontró tarjeta guardada en Stripe para este cliente.");
          }

          const paymentMethodId = paymentMethods.data[0].id;
          const amountInCents = Math.round(montoCuota * 100);
          const nuevoSaldo = Math.max(0, Number((saldoPendiente - montoCuota).toFixed(2)));

          const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: moneda.toLowerCase(),
            customer: data.stripeCustomerId,
            payment_method: paymentMethodId,
            off_session: true,
            confirm: true,
            receipt_email: email,
            metadata: {
              cursoId: data.cursoId || "palermo-2027",
              cursoTitulo: cursoTitulo,
              email: email,
              nombre: nombre,
              telefono: data.telefono || "",
              institucion: data.institucion || "",
              pais: data.pais || "",
              planCuotas: String(planCuotas),
              numCuotaActual: String(siguienteCuota),
              montoCuota: String(montoCuota),
              montoTotal: String(data.montoTotalInversion || (data.montoPagado + saldoPendiente)),
              saldoPendiente: String(nuevoSaldo),
              fechaLimitePago: fechaLimiteStr,
              esCobroAutomatico: "true"
            }
          });

          if (paymentIntent.status === "succeeded") {
            console.log(`Cobro automático de cuota ${siguienteCuota} exitoso para ${email}: ${paymentIntent.id}`);

            let proximaFechaCobro = null;
            if (nuevoSaldo > 0 && siguienteCuota < planCuotas) {
              const nextDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              if (nextDate > fechaLimite) nextDate.setTime(fechaLimite.getTime());
              proximaFechaCobro = admin.firestore.Timestamp.fromDate(nextDate);
            }

            const nuevoTotalPagado = (data.montoPagado || 0) + montoCuota;

            await docSnap.ref.update({
              cuotasPagadas: siguienteCuota,
              montoPagado: nuevoTotalPagado,
              saldoPendiente: nuevoSaldo,
              stripePaymentIntentId: paymentIntent.id,
              fechaPago: admin.firestore.FieldValue.serverTimestamp(),
              fechaUltimoCobro: admin.firestore.FieldValue.serverTimestamp(),
              fechaProximoCobro: proximaFechaCobro,
              intentosCobroFallidos: 0,
              ultimoErrorCobro: null,
              comentarios: `Cuota ${siguienteCuota}/${planCuotas} cobrada automáticamente con éxito. Saldo restante: ${moneda} ${nuevoSaldo}.`
            });

            // Enviar confirmación al participante (incluirá felicitación de 100% liquidado si nuevoSaldo <= 0)
            await enviarCorreoConfirmacionCurso({
              email,
              nombre,
              cursoTitulo,
              montoTotal: montoCuota,
              moneda,
              planCuotas,
              numCuotaActual: siguienteCuota,
              saldoPendiente: nuevoSaldo,
              paymentIntentId: paymentIntent.id,
              profesion: data.profesion || "",
              institucion: data.institucion || "",
              pais: data.pais || ""
            });

            // Notificar a administradores (cursos@ y contacto@)
            await enviarAlertaAdminTransaccion({
              tipo: 'exitosa',
              datos: {
                nombre,
                email,
                telefono: data.telefono,
                pais: data.pais,
                cursoTitulo,
                planCuotas,
                numCuotaActual: siguienteCuota,
                monto: montoCuota,
                moneda,
                saldoPendiente: nuevoSaldo,
                paymentIntentId: paymentIntent.id,
                customerId: data.stripeCustomerId,
                esCobroAutomatico: true
              }
            });
          }
        } catch (errCobro) {
          const errorMensaje = errCobro.raw?.message || errCobro.message || "Error procesando el cobro en Stripe.";
          const errorCode = errCobro.code || errCobro.raw?.code || "payment_failed";
          console.error(`Error en cobro automático de ${email}:`, errorMensaje);

          await docSnap.ref.update({
            ultimoErrorCobro: errorMensaje,
            intentosCobroFallidos: admin.firestore.FieldValue.increment(1),
            fechaUltimoIntentoCobro: admin.firestore.FieldValue.serverTimestamp()
          });

          // Notificar a los administradores
          await enviarAlertaAdminTransaccion({
            tipo: 'fallida',
            datos: {
              nombre,
              email,
              telefono: data.telefono,
              pais: data.pais,
              cursoTitulo,
              planCuotas,
              numCuotaActual: siguienteCuota,
              monto: montoCuota,
              moneda,
              errorMensaje,
              errorCode,
              customerId: data.stripeCustomerId,
              esCobroAutomatico: true
            }
          });

          // Notificar al cliente
          await enviarCorreoFalloCobroCliente({
            email,
            nombre,
            cursoTitulo,
            numCuota: siguienteCuota,
            planCuotas,
            montoCuota,
            moneda,
            motivoError: errorMensaje
          });
        }
      }
    }
  } catch (errJob) {
    console.error("Error en ejecución de procesarCobrosYRecordatoriosCuotasCursos:", errJob);
  }
});

// ============================================================================
// 14. ENDPOINT ADMINISTRATIVO / REENVIAR CONFIRMACIÓN DE CURSO
// ============================================================================
exports.reenviarConfirmacionCurso = onRequest({
  secrets: [
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN
  ],
  region: "us-central1",
  memory: "512MiB",
  timeoutSeconds: 60
}, async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  const emailParam = req.query.email || req.body?.email;
  const docIdParam = req.query.id || req.body?.id;

  if (!emailParam && !docIdParam) {
    return res.status(400).json({ error: "Debe proporcionar un email o id de documento." });
  }

  const db = admin.firestore();
  try {
    let docData = null;
    if (docIdParam) {
      const snap = await db.collection("solicitudesCursos").doc(docIdParam).get();
      if (snap.exists) docData = snap.data();
    } else {
      const snap = await db.collection("solicitudesCursos")
        .where("email", "==", String(emailParam).toLowerCase().trim())
        .limit(5)
        .get();
      if (!snap.empty) {
        docData = snap.docs[0].data();
      }
    }

    if (!docData) {
      return res.status(404).json({ error: "No se encontró registro para el email o ID indicado." });
    }

    await enviarCorreoConfirmacionCurso({
      email: docData.email,
      nombre: docData.nombre || "Participante",
      cursoTitulo: docData.cursoTitulo || "Curso Internacional - Palermo",
      montoTotal: docData.montoPagado || 0,
      moneda: docData.moneda || "USD",
      planCuotas: docData.planCuotas || 1,
      numCuotaActual: docData.cuotasPagadas || 1,
      saldoPendiente: docData.saldoPendiente || 0,
      paymentIntentId: docData.stripePaymentIntentId || "",
      profesion: docData.profesion || "",
      institucion: (docData.institucion && !docData.institucion.toLowerCase().includes('pago directo') && !docData.institucion.toLowerCase().includes('stripe') && !docData.institucion.toLowerCase().includes('inscripción en línea')) ? docData.institucion : "",
      pais: docData.pais || ""
    });

    return res.json({ 
      success: true, 
      message: `Correo de confirmación enviado exitosamente a ${docData.email}`,
      destinatario: docData.email,
      nombre: docData.nombre,
      curso: docData.cursoTitulo
    });
  } catch (err) {
    console.error("Error reenviando confirmación de curso:", err);
    return res.status(500).json({ error: err.message });
  }
});