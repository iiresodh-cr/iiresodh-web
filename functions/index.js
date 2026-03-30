const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const Stripe = require("stripe"); 
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib"); // LIBRERÍA DE SOCIAL DRM

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
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY"); 
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET"); 
const PIDA_SERVICE_ACCOUNT = defineSecret("PIDA_SERVICE_ACCOUNT"); 

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
    
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `Eres PIDA, el asistente virtual oficial del Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH).
        Tu personalidad es amable, profesional, empática y sumamente respetuosa. Eres un experto en la labor de la institución.

        INFORMACIÓN CLAVE QUE DEBES SABER SOBRE IIRESODH:
        - Misión: Somos una institución dedicada a la defensa, promoción y educación en Derechos Humanos y Responsabilidad Social a nivel internacional.
        - Áreas de trabajo principales: Litigio Estratégico, Cooperación Internacional, Cursos y Capacitaciones, Publicación de Artículos Académicos y Tienda Editorial.
        - Presencia: Trabajamos a nivel internacional, con sedes y proyectos en Costa Rica (Sede Principal), México, Colombia, Guatemala y Canadá.
        - Tienda Editorial: Vendemos libros y manuales especializados en formato digital (PDF). El envío es automático por correo electrónico tras confirmar el pago.

        TUS REGLAS ESTRICTAS DE COMPORTAMIENTO:
        1. SÉ CONCISO: Los usuarios leen en una pequeña ventana de chat. Usa párrafos muy cortos (máximo 3-4 líneas) y viñetas si es necesario.
        2. NO ERES ABOGADO: Tienes PROHIBIDO dar asesoría legal específica o prometer resultados judiciales.
        3. QUÉ HACER CON CASOS LEGALES: Ante solicitudes de ayuda legal, responde con empatía e invita al usuario a usar el Formulario de Contacto o escribir a contacto@iiresodh.org.
        4. TIENDA Y PRECIOS: Si preguntan por libros, guíalos a la "Tienda Editorial". Informa que son archivos PDF. Importante: Aclara que para usuarios en México los precios se muestran y cobran en Pesos Mexicanos (MXN) de acuerdo con la legislación local, mientras que para el resto del mundo se manejan en USD.
        5. CÓDIGOS DE DESCUENTO: Si preguntan por descuentos, menciona que ocasionalmente ofrecemos códigos promocionales para la tienda. Invítalos a suscribirse a nuestro boletín para recibir noticias y ofertas exclusivas. Aclara que las personas suscritas a PIDA tienen descuento automáticos (https://pida-ai.com).
        6. GUÍA DE NAVEGACIÓN: Orienta a los usuarios sobre dónde encontrar Noticias, Artículos Académicos, Cursos o la Tienda en el menú superior.
        7. DONACIONES: Si preguntan cómo apoyar, agradéceles y guíalos a la sección de "Donaciones".
        8. IDIOMA Y HONESTIDAD: Responde siempre en el idioma del usuario. Si no sabes algo, admítelo con cortesía y sugiere contactar vía formulario o email.`
    });

    const historialFormateado = historial.map(msg => ({
      role: msg.isBot ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: historialFormateado,
    });

    const result = await chat.sendMessage(mensaje);
    const respuestaTexto = result.response.text();

    return { respuesta: respuestaTexto };

  } catch (error) {
    console.error("Error en el cerebro de PIDA:", error);
    throw new HttpsError("internal", "Error procesando la respuesta con PIDA.");
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

        // Límite fijado en 40MB para no romper el servidor de Firebase
        // ========================================================
        // 🔒 INICIO DE MAGIA ANTI-PIRATERÍA (DOS LÍNEAS)
        // ========================================================
        if (fileSizeInMB > 40) {
            console.log(`⚠️ ARCHIVO DEMASIADO PESADO (>40MB). Saltando Social DRM...`);
            
            [urlTemporal] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 1000 * 60 * 60 * 48, 
            });

            // ... (El mensaje HTML se queda igual) ...
            mensajeExitoHTML = `...`; 

        } else {
            console.log(`✅ Tamaño óptimo. Iniciando estampado de marca de agua anti-piratería...`);
            
            const [fileBuffer] = await file.download();
            const pdfDoc = await PDFDocument.load(fileBuffer, { updateMetadata: false });
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            // 🚀 CAMBIO AQUÍ: Dividimos el texto en dos líneas
            const linea1 = `LICENCIA PERSONAL DE: ${emailCliente.toUpperCase()}`;
            const linea2 = `REF: ${paymentIntent.id} | IIRESODH`;

            pages.forEach((page) => {
              // Dibujamos la primera línea un poquito más arriba (y: 32)
              page.drawText(linea1, {
                x: 20, 
                y: 32, 
                size: 9,
                font: font,
                color: rgb(0.725, 0.184, 0.196), 
                opacity: 0.65, 
              });
              // Dibujamos la segunda línea justo debajo (y: 20)
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