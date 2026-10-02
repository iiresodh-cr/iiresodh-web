// src/pages/CursoLanding.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { CircularProgress, Alert, Snackbar } from "@mui/material";
import { useTranslation } from "react-i18next";

// // Assets locales predeterminados
import falconeDefaultImg from "../assets/cursos/falcone_borsellino.jpg";
import palermoDefaultImg from "../assets/cursos/palermo_catedral.jpg";
import palermoJusticiaBw from "../assets/cursos/palermo_justicia_bw.jpg";
import palermoAulaBunkerBw from "../assets/cursos/palermo_aula_bunker_bw.jpg";
import palermoCollageHeroBw from "../assets/cursos/palermo_collage_hero_bw.jpg";
import logoUnlp from "../assets/cursos/logo_unlp_ddhh.png";
import brochureP1 from "../assets/cursos/brochure_palermo_p2.jpg";
import brochureP2 from "../assets/cursos/brochure_palermo_p1.jpg";
import logoIiresodh from "../assets/logo.webp";
import logoIiresodhColor from "../assets/logo-color.png";
import FormularioPagoCurso from "../components/cursos/FormularioPagoCurso";

export const normalizarPrecio = (precioStr) => {
  if (!precioStr) return "3,350 USD";
  let s = String(precioStr).trim();
  s = s.replace(/\.00/g, "").replace(/,00/g, "");
  s = s.replace("3.350", "3,350");
  if (!s.toUpperCase().includes("USD") && !s.includes("$")) {
    s = `${s} USD`;
  }
  return s;
};

// Datos por defecto para el Curso Internacional 2027 en Palermo (Brochure Oficial & Co-organización UNLP)
export const DATOS_PALERMO_2027 = {
  id: "palermo-2027",
  slug: "curso-internacional-palermo-2027",
  titulo: "Curso Internacional: Aplicación de las Convenciones de Palermo contra el Crimen Organizado",
  subtitulo: "Investigación Criminal, Cooperación Internacional y Derechos Humanos en la Lucha contra la Criminalidad Organizada y la Trata de Personas",
  coorganizacion: "Curso Internacional organizado conjuntamente por el Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH) y el Instituto de Derechos Humanos de la Universidad Nacional de La Plata (Argentina).",
  resumen: "Programa de alta especialización judicial sobre la aplicación de las Convenciones de Palermo contra el Crimen Organizado Transnacional.",
  estadoInscripcion: "proximamente",
  fechaInicio: "2027-05-17",
  fechaFin: "2027-05-23",
  imagenPrincipalUrl: falconeDefaultImg,
  landingPage: {
    habilitada: true,
    publicada: false, // Por defecto no pública como solicitó el usuario
    lema: "APLICACIÓN DE LAS CONVENCIONES DE PALERMO CONTRA EL CRIMEN ORGANIZADO",
    subtitulo: "Investigación Criminal, Cooperación Internacional y Derechos Humanos en la Lucha contra la Criminalidad Organizada y la Trata de Personas",
    ubicacionFechas: "Palermo, Sicilia, Italia | 17 – 23 de mayo de 2027",
    precioInversion: "3,350 USD",
    inversionDetalle: "Por participante. Incluye clases magistrales, simulación de caso transnacional, visitas guiadas a lugares emblemáticos, compendio digital, certificado oficial, alojamiento en hotel 4 estrellas, traslados internos y coffee breaks.",
    cuposTexto: "Cupos Estrictamente Limitados",
    fechaLimitePago: "2027-04-30",
    fechaLimiteTexto: "30 de abril de 2027",
    enlaceStripe: "",
    heroImagenUrl: falconeDefaultImg,
    heroCita: "«La mafia è un fenomeno umano e como tutti i fenomeni umani ha un principio, una sua evoluzione e avrà quindi anche una fine.»",
    heroCitaAutor: "Giovanni Falcone (1939 – 1992)",
    
    // Co-organización institucional
    coorganizadores: [
      {
        nombre: "IIRESODH",
        detalle: "Instituto Internacional de Responsabilidad Social y Derechos Humanos",
        pais: "Costa Rica / Internacional",
        logo: logoIiresodh
      },
      {
        nombre: "Instituto de Derechos Humanos - UNLP",
        detalle: "Facultad de Ciencias Jurídicas y Sociales • Universidad Nacional de La Plata",
        pais: "Argentina",
        logo: logoUnlp
      }
    ],

    // Contacto Directo
    contacto: {
      whatsapp: "+506 4081 6188",
      whatsappUrl: "https://wa.me/50640816188?text=Hola,%20solicito%20informaci%C3%B3n%20sobre%20el%20Curso%20Internacional%20Palermo%202027",
      email: "cursos@iiresodh.org",
      emailAlternativo: "contacto@iiresodh.org"
    },

    // Docentes Destacados
    docentesDestacados: [
      {
        nombre: "Víctor Rodríguez Rescia",
        cargo: "Presidente de IIRESODH",
        rol: "Director Académico",
        descripcion: "Experto Independiente de varios Comités, Subcomité y Mecanismos de Derechos Humanos de la Organización de las Naciones Unidas (ONU).",
        origen: "Costa Rica / Internacional"
      },
      {
        nombre: "Fabián Salvioli",
        cargo: "Director del Instituto de Derechos Humanos - UNLP",
        rol: "Director Académico Coorganizador",
        descripcion: "Expresidente del Comité de Derechos Humanos de la ONU y Ex Relator Especial de Naciones Unidas. Catedrático de la Universidad Nacional de La Plata.",
        origen: "Argentina / ONU"
      },
      {
        nombre: "Ottavio Sferlazza",
        cargo: "Ex Procurador Antimafia de Italia",
        rol: "Docente Principal",
        descripcion: "Magistrado histórico italiano de la lucha judicial antimafia en Sicilia. Coordinador de investigaciones de máxima complejidad sobre Cosa Nostra.",
        origen: "Italia"
      },
      {
        nombre: "+ Más de 20 Expertos Italianos e Internacionales",
        cargo: "Cuerpo Docente de Élite",
        rol: "Magistrados, Fiscales y Catedráticos",
        descripcion: "Fiscales jefe, catedráticos universitarios especializados en derecho antimafia, e investigadores de la UNODC (Oficina contra la Droga y el Delito) y la OIM.",
        origen: "Italia / Europa / ONU"
      }
    ],

    // ¿A quién está dirigido?
    aQuienDirigido: [
      {
        perfil: "Jueces, juezas, fiscales y operadores de justicia.",
        icono: "⚖️"
      },
      {
        perfil: "Abogados, abogadas y defensores de derechos humanos.",
        icono: "🛡️"
      },
      {
        perfil: "Integrantes de las fuerzas de seguridad, unidades de inteligencia financiera y otras áreas de la gestión pública.",
        icono: "🔍"
      },
      {
        perfil: "Personas de la academia e investigadoras especializadas en derecho penal y criminología.",
        icono: "🎓"
      },
      {
        perfil: "Diplomáticas, diplomáticos, funcionarias y funcionarios de organismos internacionales.",
        icono: "🌐"
      }
    ],

    // ¿Qué está incluido?
    queEstaIncluido: [
      {
        titulo: "Clases magistrales con expertos internacionales",
        descripcion: "Sesiones presenciales intensivas de análisis normativo y procesal con magistrados y fiscales en activo.",
        icono: "👨‍🏫"
      },
      {
        titulo: "Simulación de caso transnacional",
        descripcion: "Talleres prácticos con expedientes reales, técnicas de litigio y audiencia simulada final.",
        icono: "📁"
      },
      {
        titulo: "Visitas guiadas a lugares emblemáticos",
        descripcion: "Acceso con acreditación al Palacio de Justicia de Palermo, Aula Búnker, Palazzo Steri, Teatro Massimo y Bien Confiscado.",
        icono: "🏛️"
      },
      {
        titulo: "Compendio digital de material didáctico",
        descripcion: "Biblioteca documental exhaustiva con jurisprudencia internacional, convenios y guías prácticas.",
        icono: "📚"
      },
      {
        titulo: "Certificado de participación internacional",
        descripcion: "Acreditación académica de alta especialización emitida conjuntamente por IIRESODH y el Instituto de Derechos Humanos de la UNLP (Argentina).",
        icono: "📜"
      },
      {
        titulo: "Alojamiento en hotel 4 estrellas",
        descripcion: "Estancia completa de calidad superior en Palermo durante los días del programa.",
        icono: "🏨"
      },
      {
        titulo: "Logística y traslados internos",
        descripcion: "Transporte para las visitas oficiales del itinerario en Palermo (no incluye aéreos hasta y desde Palermo).",
        icono: "🚌"
      },
      {
        titulo: "Desayunos y coffee breaks",
        descripcion: "Espacios diarios de refrigerio y networking para intercambio entre los participantes y docentes.",
        icono: "☕"
      }
    ],

    // ¿Qué aprenderás?
    queAprenderas: [
      "Aplicar los principios del debido proceso y las garantías procesales en la investigación de delitos complejos y criminalidad organizada.",
      "Interpretar el marco normativo de la Convención de Palermo y su Protocolo para su correcta aplicación jurisdiccional.",
      "Integrar los estándares internacionales del control de convencionalidad en la argumentación y resolución de casos penales.",
      "Evaluar modelos comparados de protección de testigos y mecanismos estratégicos de recuperación de activos en la lucha contra la delincuencia transnacional."
    ],

    // Sección Legado y Visión
    legadoTitulo: "Nuestro Legado y Visión",
    legadoTexto: "El legado histórico de los magistrados Giovanni Falcone y Paolo Borsellino sentó las bases de la lucha contemporánea contra el crimen organizado y la macrocriminalidad financiera. En el año 2000, Palermo fue la sede donde la comunidad internacional aprobó la histórica Convención de las Naciones Unidas contra la Delincuencia Organizada Transnacional. Este curso internacional conecta ese precedente histórico con los desafíos judiciales de vanguardia, el decomiso de activos ilícitos y la cooperación penal transfronteriza, organizado en conjunto por IIRESODH y el Instituto de Derechos Humanos de la Universidad Nacional de La Plata.",
    pilares: [
      {
        titulo: "Marco Jurídico Internacional y DDHH",
        descripcion: "Análisis dogmático y procesal de la Convención de Palermo, sus protocolos y control de convencionalidad.",
        icono: "balanza"
      },
      {
        titulo: "'Follow the Money' y Recuperación de Activos",
        descripcion: "Técnicas probatorias de seguimiento financiero, extinción de dominio y decomiso de bienes a las mafias.",
        icono: "dinero"
      },
      {
        titulo: "Protección a Actores Judiciales y Testigos",
        descripcion: "Protocolos de seguridad, reserva probatoria y garantías para jueces, fiscales y declarantes amenazados.",
        icono: "escudo"
      },
      {
        titulo: "Cooperación Judicial y Casos Transnacionales",
        descripcion: "Equipos conjuntos de investigación, trata de personas y modelos comparados Europa–Latinoamérica.",
        icono: "mundo"
      }
    ],

    // Estructura del Programa (7 Días en Palermo - Mayo 2027)
    programa: [
      {
        dia: "DÍA 1",
        fecha: "Lunes 17 de mayo de 2027",
        titulo: "Marco jurídico internacional del crimen organizado",
        horario: "09:00–13:00 y 15:00–18:00",
        descripcion: "Apertura institucional del curso y análisis exegético de la Convención de Palermo. Apertura de actividades y visita a lugar emblemático (Ejemplo: Aula Búnker del Maxi-Proceso).",
        lugarEmblematico: "Aula Búnker del Palacio de Justicia de Palermo",
        temas: [
          "Génesis y alcance de la Convención de las Naciones Unidas de 2000 (UNTOC)",
          "Delito de asociación mafiosa y estándares penales internacionales",
          "Apertura solemne en sede judicial y visita histórica guiada al Aula Búnker"
        ]
      },
      {
        dia: "DÍA 2",
        fecha: "Martes 18 de mayo de 2027",
        titulo: "Investigación y protección de actores judiciales",
        horario: "09:00–13:00 y 15:00–18:00",
        descripcion: "Seguridad y garantías procesales para magistrados, fiscales y defensores en investigaciones de alta peligrosidad. Taller práctico exhaustivo sobre un expediente real de mafia.",
        lugarEmblematico: "Centro de Formación Judicial",
        temas: [
          "Sistemas y protocolos de seguridad integral para operadores de justicia",
          "Metodología investigativa en estructuras criminales cerradas",
          "Taller sobre expediente de mafia: análisis documental y valoración de riesgo procesal"
        ]
      },
      {
        dia: "DÍA 3",
        fecha: "Miércoles 19 de mayo de 2027",
        titulo: "«Follow the money»: lavado de activos y recuperación de bienes",
        horario: "09:00–13:00 y 15:00–18:00",
        descripcion: "El principio fundamental de Giovanni Falcone: seguir la ruta del dinero ilícito. Técnicas forenses de decomiso y visita a un lugar emblemático (Ejemplo: Bien Confiscado a la mafia).",
        lugarEmblematico: "Sede de Bien Confiscado gestionado para uso social",
        temas: [
          "Doctrina Falcone: de la contabilidad forense a la imputación patrimonial",
          "Extinción de dominio, decomiso sin condena y reutilización social de bienes",
          "Visita técnica a un Bien Confiscado administrado por el Estado italiano"
        ]
      },
      {
        dia: "DÍA 4",
        fecha: "Jueves 20 de mayo de 2027",
        titulo: "Protocolo de Palermo: trata de personas",
        horario: "09:00–13:00 y 15:00–18:00",
        descripcion: "Dogmática y aplicación judicial del Protocolo de Palermo contra la trata de personas. Inicio de la simulación de caso transnacional (Parte I).",
        lugarEmblematico: "Sede Académica Internacional",
        temas: [
          "Diferenciación típica entre trata de personas y tráfico ilícito de personas migrantes",
          "Enfoque de derechos humanos y protección judicial integral a víctimas",
          "Simulación de caso transnacional (Parte I): apertura de expediente y medidas cautelares"
        ]
      },
      {
        dia: "DÍA 5",
        fecha: "Viernes 21 de mayo de 2027",
        titulo: "Niñez y estrategias comparadas Latam–Italia",
        horario: "09:00–13:00 y 15:00–18:00",
        descripcion: "Protección reforzada de la niñez frente a la criminalidad organizada. Análisis procesal comparado entre América Latina e Italia. Audiencia simulada final y solemne acto de entrega de certificados.",
        lugarEmblematico: "Aula Magna Universitaria",
        temas: [
          "Niñez y adolescencia: mecanismos de prevención y tutela judicial efectiva",
          "Modelos comparados de persecución y garantías penales Latam–Italia",
          "Audiencia simulada final con tribunal de expertos y entrega de certificados conjuntos"
        ]
      },
      {
        dia: "DÍA 6",
        fecha: "Sábado 22 de mayo de 2027",
        titulo: "Palazzo Steri y centro histórico de Palermo",
        horario: "09:00–13:00 y 15:00–18:00",
        descripcion: "Jornada cultural y académica en el emblemático Palazzo Steri y los sitios más trascendentes del centro histórico de Palermo (incluyendo el Teatro Massimo).",
        lugarEmblematico: "Palazzo Steri & Teatro Massimo",
        temas: [
          "Palazzo Steri: memoria histórica, justicia y derechos humanos en Sicilia",
          "Visita guiada al Teatro Massimo y centro neurálgico de Palermo",
          "Espacio de networking y cofradía jurídica internacional"
        ]
      },
      {
        dia: "DÍA 7",
        fecha: "Domingo 23 de mayo de 2027",
        titulo: "Cierre simbólico: conmemoración del atentado de Capaci",
        horario: "Jornada Conmemorativa Especial",
        descripcion: "Cierre solemne conmemorando el aniversario del atentado de Capaci, en homenaje imperecedero a Giovanni Falcone, Francesca Morvillo y sus escoltas, reafirmando el compromiso por la justicia y el Estado de Derecho.",
        lugarEmblematico: "Memorial de Capaci & Sede Falcone-Morvillo",
        temas: [
          "Acto de memoria y homenaje cívico en el lugar del atentado de Capaci",
          "El valor ético de los jueces y fiscales frente a la criminalidad organizada",
          "Clausura oficial del curso internacional y clausura del contingente"
        ]
      }
    ],

    // Destacados del Curso
    destacados: [
      {
        titulo: "Doble Respaldo Académico Internacional",
        descripcion: "Co-organizado y certificado conjuntamente por IIRESODH y el Instituto de Derechos Humanos de la Universidad Nacional de La Plata (Argentina).",
        icono: "certificado"
      },
      {
        titulo: "Ponentes de Élite Mundial",
        descripcion: "Víctor Rodríguez Rescia, Fabián Salvioli, Ottavio Sferlazza y más de 20 fiscales jefe y catedráticos antimafia italianos.",
        icono: "juez"
      },
      {
        titulo: "Acceso a Lugares Emblemáticos Reales",
        descripcion: "Visitas con credencial oficial al Palacio de Justicia, Aula Búnker del Maxi-Proceso, Palazzo Steri y Bien Confiscado.",
        icono: "carpeta"
      },
      {
        titulo: "Servicio Integral: Alojamiento 4★ y Traslados",
        descripcion: "Incluye hospedaje en hotel 4 estrellas en Palermo, traslados internos de logística académica y coffee breaks.",
        icono: "red"
      },
      {
        titulo: "Grupo Exclusivo con Cupos Limitados",
        descripcion: "Aforo estrictamente restringido por normativas de seguridad institucional en las sedes judiciales italianas.",
        icono: "candado"
      }
    ],

    // Sede Palermo
    sedeNombre: "Palermo, Sicilia (Italia)",
    sedeLugar: "Palacio de Justicia, Aula Búnker, Teatro Massimo & Palazzo Steri",
    sedeImagenUrl: palermoDefaultImg,
    sedeTexto: "Palermo es la cuna histórica de la Convención de las Naciones Unidas contra el Crimen Organizado del año 2000 y el epicentro de la resistencia judicial encarnada por Giovanni Falcone y Paolo Borsellino. Durante 7 intensos días, los participantes recorrerán sus sedes judiciales más veneradas, el Aula Búnker del Maxi-Proceso, bienes decomisados a la mafia y monumentos icónicos como el Teatro Massimo y el Palazzo Steri.",
    sedeLogistica: [
      "Traducción y facilitación en español e italiano durante todas las sesiones académicas.",
      "Alojamiento incluido en hotel de 4 estrellas con ubicación estratégica en Palermo.",
      "Traslados internos garantizados para todas las visitas institucionales del itinerario.",
      "Clima primaveral idóneo en mayo (22°C - 26°C) en la costa siciliana."
    ],

    // Información de pago bancario
    bancoInfo: {
      beneficiario: "Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)",
      banco: "Banco Internacional / IBAN / SWIFT",
      pais: "Costa Rica / Internacional",
      moneda: "Dólares Americanos (USD)",
      nota: "Una vez solicitado el cupo, el departamento académico emitirá una factura proforma oficial con los códigos bancarios y número de reserva para su trámite institucional o personal."
    }
  }
};

export default function CursoLanding() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreviewParam = searchParams.get("preview") === "true" || searchParams.get("preview") === "admin";
  const { t } = useTranslation();

  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Estados del formulario interactivo de registro / solicitud bancaria
  const [formData, setFormData] = useState({
    nombre: "",
    institucion: "",
    email: "",
    telefono: "",
    pais: "Costa Rica",
    comentarios: "",
    profesion: "",
    experienciaTemas: [],
    experienciaOtro: "",
    motivoParticipacion: "",
    cursosPrevios: "no",
    detalleCursosPrevios: "",
    alumnoIiresodh: "no"
  });
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [solicitudExitosa, setSolicitudExitosa] = useState(false);
  const [aceptarPrivacidadTransferencia, setAceptarPrivacidadTransferencia] = useState(false);
  const [alerta, setAlerta] = useState({ open: false, mensaje: "", tipo: "success" });

  // Tab activo principal del Hub Interactivo del Curso
  const [seccionActiva, setSeccionActiva] = useState("legado"); // 'legado' | 'programa' | 'docentes' | 'incluido' | 'brochure' | 'sede' | 'inscripcion'
  const [metodoInscripcion, setMetodoInscripcion] = useState("tarjeta"); // 'tarjeta' | 'transferencia'
  const [modalBrochure, setModalBrochure] = useState(null); // null | 1 | 2

  // Tab activo en la estructura del programa (Días)
  const [diaActivo, setDiaActivo] = useState(0);

  // Escuchar estado de autenticación para administradores
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setEsAdmin(!!user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Cargar datos del curso
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCurso = async () => {
      try {
        let cursoEncontrado = null;

        if (slug === "palermo-2027" || slug === "curso-internacional-palermo-2027") {
          const q = query(collection(db, "cursos"), where("slug", "==", slug));
          const snap = await getDocs(q);
          if (!snap.empty) {
            cursoEncontrado = { id: snap.docs[0].id, ...snap.docs[0].data() };
          } else {
            cursoEncontrado = DATOS_PALERMO_2027;
          }
        } else {
          let q = query(collection(db, "cursos"), where("slug", "==", slug));
          let snap = await getDocs(q);

          if (snap.empty) {
            const docRef = doc(db, "cursos", slug);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              cursoEncontrado = { id: docSnap.id, ...docSnap.data() };
            }
          } else {
            cursoEncontrado = { id: snap.docs[0].id, ...snap.docs[0].data() };
          }
        }

        if (!cursoEncontrado) {
          cursoEncontrado = DATOS_PALERMO_2027;
        }

        if (!cursoEncontrado.landingPage) {
          cursoEncontrado.landingPage = {
            ...DATOS_PALERMO_2027.landingPage,
            habilitada: true,
            publicada: false
          };
        }

        setCurso(cursoEncontrado);
      } catch (err) {
        console.error("Error al cargar la información del curso:", err);
        setCurso(DATOS_PALERMO_2027);
      } finally {
        setLoading(false);
      }
    };

    fetchCurso();
  }, [slug]);

  const handleSubmitSolicitud = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.email.trim()) {
      setAlerta({ open: true, mensaje: "Por favor completa tu nombre y correo electrónico.", tipo: "warning" });
      return;
    }

    if (!formData.profesion.trim()) {
      setAlerta({ open: true, mensaje: "Por favor indica tu profesión u ocupación profesional.", tipo: "warning" });
      return;
    }

    if (!formData.motivoParticipacion.trim()) {
      setAlerta({ open: true, mensaje: "Por favor indícanos brevemente por qué deseas participar en el curso.", tipo: "warning" });
      return;
    }

    if (!aceptarPrivacidadTransferencia) {
      setAlerta({
        open: true,
        mensaje: "Debes aceptar la Política de Privacidad y autorizar el tratamiento de datos para enviar la solicitud.",
        tipo: "warning"
      });
      return;
    }

    setEnviandoSolicitud(true);
    try {
      const temasFinales = formData.experienciaTemas.includes("Otro") && formData.experienciaOtro.trim()
        ? [...formData.experienciaTemas.filter(t => t !== "Otro"), `Otro: ${formData.experienciaOtro.trim()}`]
        : formData.experienciaTemas;

      const cursosPreviosFinal = formData.cursosPrevios === "si"
        ? (formData.detalleCursosPrevios.trim() ? `Sí (${formData.detalleCursosPrevios.trim()})` : "Sí")
        : "No";

      await addDoc(collection(db, "solicitudesCursos"), {
        cursoId: curso?.id || "palermo-2027",
        cursoTitulo: curso?.titulo || "Curso Internacional 2027 - Palermo",
        nombre: formData.nombre.trim(),
        institucion: formData.institucion.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        pais: formData.pais,
        profesion: formData.profesion.trim(),
        experienciaTemas: temasFinales,
        motivoParticipacion: formData.motivoParticipacion.trim(),
        cursosPrevios: cursosPreviosFinal,
        alumnoIiresodh: formData.alumnoIiresodh,
        comentarios: formData.comentarios.trim(),
        metodoPago: "transferencia",
        montoTotalInversion: 3350,
        moneda: "USD",
        aceptaPoliticaPrivacidad: true,
        fechaAceptacionPrivacidad: serverTimestamp(),
        versionPoliticaPrivacidad: "2026-09-12",
        constanciaPrivacidad: "Consentimiento informado otorgado conforme a la Ley N° 8968 de Costa Rica.",
        fechaSolicitud: serverTimestamp(),
        estado: "pendiente"
      });

      setSolicitudExitosa(true);
      setAceptarPrivacidadTransferencia(false);
      setAlerta({
        open: true,
        mensaje: "¡Solicitud recibida con éxito! Nuestro departamento académico te contactará a la brevedad con la información bancaria y el expediente oficial.",
        tipo: "success"
      });
      setFormData({
        nombre: "",
        institucion: "",
        email: "",
        telefono: "",
        pais: "Costa Rica",
        comentarios: "",
        profesion: "",
        experienciaTemas: [],
        experienciaOtro: "",
        motivoParticipacion: "",
        cursosPrevios: "no",
        detalleCursosPrevios: "",
        alumnoIiresodh: "no"
      });
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setAlerta({
        open: true,
        mensaje: "No se pudo procesar tu solicitud en este momento. Por favor intenta de nuevo o escríbenos directamente a formacion@iiresodh.org.",
        tipo: "error"
      });
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  const irASeccion = (seccion) => {
    setSeccionActiva(seccion);
    const elem = document.getElementById("hub-interactivo");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <CircularProgress size={50} thickness={4} sx={{ color: "#1D3557" }} />
        <span className="text-main-blue font-bold text-xs uppercase tracking-widest animate-pulse">
          Cargando detalles del curso...
        </span>
      </div>
    );
  }

  const landing = curso?.landingPage || DATOS_PALERMO_2027.landingPage;
  const esPublica = landing.publicada === true;
  // Acceso permitido únicamente si la página está publicada o si el usuario es administrador autenticado
  const tieneAcceso = esPublica || esAdmin;

  if (!tieneAcceso) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-6 bg-basic-beige/50 font-sans">
        <div className="max-w-xl bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 text-center space-y-6">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-main-blue tracking-tight">
            Programa Académico en Preparación
          </h1>
          <p className="text-gray-600 font-light leading-relaxed text-sm">
            La página oficial y el programa detallado de este curso se encuentran en proceso de configuración editorial y estarán disponibles próximamente.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/cursos"
              className="bg-main-blue hover:bg-light-blue text-white text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
            >
              Volver a Cursos
            </Link>
            <Link
              to="/login"
              className="border border-gray-300 hover:border-main-blue text-gray-700 hover:text-main-blue text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all"
            >
              Acceso Administrativo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const programa = landing.programa && landing.programa.length > 0 ? landing.programa : DATOS_PALERMO_2027.landingPage.programa;
  const pilares = landing.pilares && landing.pilares.length > 0 ? landing.pilares : DATOS_PALERMO_2027.landingPage.pilares;
  const destacados = landing.destacados && landing.destacados.length > 0 ? landing.destacados : DATOS_PALERMO_2027.landingPage.destacados;
  const docentes = landing.docentesDestacados || DATOS_PALERMO_2027.landingPage.docentesDestacados;
  const aQuienDirigido = landing.aQuienDirigido || DATOS_PALERMO_2027.landingPage.aQuienDirigido;
  const queEstaIncluido = landing.queEstaIncluido || DATOS_PALERMO_2027.landingPage.queEstaIncluido;
  const queAprenderas = landing.queAprenderas || DATOS_PALERMO_2027.landingPage.queAprenderas;
  const contacto = landing.contacto || DATOS_PALERMO_2027.landingPage.contacto;

  const PESTANAS = [
    { id: "legado", label: "Sobre el Curso", icono: "🏛️" },
    { id: "programa", label: `Programa (${programa.length} Días)`, icono: "📅" },
    { id: "docentes", label: "Docentes Destacados", icono: "👨‍⚖️" },
    { id: "brochure", label: "Brochure Oficial", icono: "📄" },
    { id: "sede", label: "Sede Palermo", icono: "📍" },
    { id: "inscripcion", label: "Inscripción & Pago", icono: "💳" }
  ];

  return (
    <main className="min-h-screen bg-slate-50/60 font-sans text-gray-800 antialiased selection:bg-main-blue selection:text-white">
      
      {/* BANNER DE VISTA PREVIA (BORRADOR NO PÚBLICO) */}
      {!esPublica && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs font-bold tracking-wider flex items-center justify-between shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
              <span className="bg-black/30 px-2.5 py-0.5 rounded text-[10px] uppercase font-black tracking-widest animate-pulse">
                Modo Borrador / No Público
              </span>
              <span>
                Página en preparación editorial. Los visitantes regulares aún no tienen acceso público.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {esAdmin && (
                <Link 
                  to="/admin" 
                  className="bg-white text-orange-900 px-3 py-0.5 rounded text-[11px] font-bold hover:bg-orange-50 transition shadow-xs"
                >
                  ⚙️ Admin
                </Link>
              )}
              <Link 
                to="/cursos" 
                className="bg-black/20 hover:bg-black/40 text-white px-2.5 py-0.5 rounded text-[11px] transition"
              >
                ← Salir a Cursos
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* HERO INSTITUCIONAL CON COLLAGE FOTOGRÁFICO EN BLANCO Y NEGRO (NÍTIDO, CINEMATOGRÁFICO Y SOLEMNE) */}
      <section className="relative text-white pt-8 pb-12 md:pt-12 md:pb-16 overflow-hidden border-b border-slate-800 bg-[#0a1526]">
            {/* COLLAGE FOTOGRÁFICO DE FONDO EN BLANCO Y NEGRO (NÍTIDO, CLARO Y TOTALMENTE VISIBLE) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={palermoCollageHeroBw}
            alt="Collage Conmemorativo Palermo: Falcone, Borsellino, Palacio de Justicia y Aula Búnker"
            className="w-full h-full object-cover object-center filter contrast-105 brightness-95 opacity-85 sm:opacity-90"
          />
          {/* Overlay mínimo: transparente en el centro para que las fotos se vean con total claridad */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-transparent to-slate-950/70" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 space-y-7">
          
          {/* CONVOCATORIA OFICIAL CONJUNTA IIRESODH & INSTITUTO DE DDHH UNLP */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-white/15">
            <div className="inline-flex items-center gap-4 sm:gap-5 bg-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-xl border border-white/20">
              {/* Logo IIRESODH en Color Oficial */}
              <img
                src={logoIiresodhColor}
                alt="IIRESODH - Instituto Internacional de Responsabilidad Social y Derechos Humanos"
                className="h-8 sm:h-9 w-auto object-contain"
              />

              <div className="h-8 w-px bg-slate-200" />

              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                En conjunto con
              </span>

              <div className="h-8 w-px bg-slate-200" />

              {/* Logo Instituto de Derechos Humanos UNLP en Color (Tamaño proporcional optimizado) */}
              <img
                src={logoUnlp}
                alt="Instituto de Derechos Humanos - Universidad Nacional de La Plata"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>

            <span className="text-xs uppercase tracking-widest text-slate-200 font-semibold bg-slate-950/50 px-3.5 py-1.5 rounded-lg border border-white/15 backdrop-blur-xs drop-shadow-sm">
              Convocatoria Académica Internacional
            </span>
          </div>

          {/* CONTENIDO PRINCIPAL: TÍTULOS Y DETALLES DEL CURSO */}
          <div className="space-y-4 text-center lg:text-left">
            
            {/* BADGES SUPERIORES (SOBRIOS, UNIFICADOS Y ELEGANTES) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-medium text-slate-200">
              <span className="bg-slate-950/70 border border-white/20 px-3 py-1 rounded-md text-slate-100 backdrop-blur-md shadow-xs">
                Alta Especialización Judicial
              </span>
              <span className="bg-slate-950/70 border border-white/20 px-3 py-1 rounded-md text-slate-100 backdrop-blur-md shadow-xs">
                Cupos Limitados
              </span>
              <span className="bg-slate-950/70 border border-white/20 px-3 py-1 rounded-md text-slate-100 backdrop-blur-md shadow-xs">
                17 – 23 de Mayo de 2027
              </span>
            </div>

            {/* TÍTULO PRINCIPAL OFICIAL CON SOMBRA SUAVE PARA CONTRASTE PERFECTO */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-red-500 block drop-shadow-sm">
                Curso Internacional
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase font-sans text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Aplicación de las Convenciones de Palermo contra el Crimen Organizado
              </h1>
            </div>

            {/* UBICACIÓN DE LA SEDE */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs md:text-sm font-medium text-slate-200">
              <span className="flex items-center gap-2 bg-slate-950/70 px-3.5 py-1.5 rounded-lg border border-white/20 backdrop-blur-md drop-shadow-xs">
                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {(landing.ubicacionFechas ? landing.ubicacionFechas.split('|')[0].trim() : "Palermo, Sicilia, Italia")}
              </span>
            </div>

            {/* SUBTÍTULO BROCHURE CON GLASMORFISMO ELEGANTE PARA MÁXIMA LEGIBILIDAD */}
            <div className="bg-slate-950/75 border border-white/15 border-l-4 border-l-main-red p-3.5 sm:p-4 rounded-xl backdrop-blur-md shadow-xl max-w-4xl text-left">
              <p className="text-sm md:text-base font-normal text-slate-100 leading-relaxed drop-shadow-sm">
                {landing.subtitulo || "Investigación Criminal, Cooperación Internacional y Derechos Humanos en la Lucha contra la Criminalidad Organizada y la Trata de Personas"}
              </p>
            </div>

            {/* CITA SOLEMNE DE FALCONE INTEGRADA CON ESTILO */}
            <div className="inline-flex items-center gap-2 bg-slate-950/70 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md text-xs text-slate-200 italic shadow-xs">
              <span>«La mafia è un fenomeno umano e come tutti i fenomeni umani ha un principio, una sua evoluzione e avrà quindi anche una fine.»</span>
              <span className="not-italic text-white font-semibold whitespace-nowrap">— Giovanni Falcone</span>
            </div>

          </div>

          {/* TARJETA DE ADMISIÓN E INVERSIÓN ACADÉMICA (SOBRIA, ELEGANTE Y PROPORCIONADA) */}
          <div className="bg-slate-900/90 border border-white/15 p-6 md:p-8 rounded-2xl backdrop-blur-md shadow-2xl space-y-6">
            
            {/* FILA SUPERIOR: PRECIO, DETALLE Y BENEFICIOS INCLUIDOS DISTRIBUIDOS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* COLUMNA IZQUIERDA: PRECIO Y ESPECIFICACIÓN GENERAL (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-3 text-left">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                    {normalizarPrecio(landing.precioInversion)}
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-300 bg-white/10 px-3 py-1 rounded-md border border-white/15">
                    Inversión Académica Total
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-300 bg-white/10 px-3 py-1 rounded-md border border-white/15">
                    Cupos Limitados
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                  {landing.inversionDetalle || "Por participante. Incluye alojamiento en hotel 4★ en Palermo, traslados internos de logística académica, clases magistrales con expertos internacionales y doble certificación oficial."}
                </p>
              </div>

              {/* COLUMNA DERECHA: CAJA DE BENEFICIOS INCLUIDOS EN FORMATO TARJETA (lg:col-span-5) */}
              <div className="lg:col-span-5 bg-white/5 border border-white/10 p-4 sm:p-5 rounded-xl space-y-2.5">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300 block">
                  El programa incluye:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>Hotel 4★ en Palermo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>Traslados internos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>Magistrados antimafia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>Doble aval IIRESODH & UNLP</span>
                  </div>
                </div>
              </div>

            </div>

            {/* SEPARADOR HORIZONTAL SUTIL */}
            <div className="border-t border-white/10" />

            {/* FILA INFERIOR: BOTONES DE ACCIÓN Y FACILIDADES DE PAGO */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => irASeccion("inscripcion")}
                  className="flex-1 sm:flex-initial bg-main-red hover:bg-[#8b1515] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-7 rounded-xl shadow-lg transition-all active:scale-95 text-center cursor-pointer whitespace-nowrap"
                >
                  Inscríbete Ahora
                </button>
                <button
                  onClick={() => irASeccion("programa")}
                  className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider py-3.5 px-5 rounded-xl border border-white/20 transition-colors text-center cursor-pointer whitespace-nowrap"
                >
                  Ver Programa ({programa.length} Días)
                </button>
                <button
                  onClick={() => setModalBrochure(1)}
                  className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl border border-white/20 transition-colors text-center cursor-pointer whitespace-nowrap"
                >
                  Brochure 📄
                </button>
                <a
                  href={contacto?.whatsappUrl || "https://wa.me/50640816188"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl border border-white/20 transition-colors text-center cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                >
                  WhatsApp
                </a>
              </div>

              <div className="text-[11px] text-slate-400 font-normal text-center md:text-right shrink-0">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Facilidades de pago en cuotas disponibles
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* HUB INTERACTIVO DEL CURSO */}
      <div id="hub-interactivo" className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* BARRA DE PESTAÑAS PRINCIPAL */}
        <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200 mb-8 flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
          {PESTANAS.map((tab) => {
            const esActivo = seccionActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSeccionActiva(tab.id)}
                className={`flex items-center gap-2 py-2.5 px-3.5 md:px-4 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all cursor-pointer ${
                  esActivo
                    ? "bg-main-blue text-white shadow-md shadow-main-blue/25 scale-102"
                    : "text-gray-600 hover:text-main-blue hover:bg-gray-100/80"
                }`}
              >
                <span>{tab.icono}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENEDOR DE CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 md:p-10 min-h-[500px]">
          
          {/* ==========================================
              PESTAÑA 1: SOBRE EL CURSO / LEGADO / OBJETIVOS
             ========================================== */}
          {seccionActiva === "legado" && (
            <div className="space-y-10 animate-fade-in">
              
              {/* BLOQUE INSTITUCIONAL CO-ORGANIZADORES */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  <div className="flex items-center gap-4 sm:gap-5 bg-white px-5 sm:px-6 py-3 rounded-2xl border border-slate-200 shadow-xs shrink-0">
                    <img src={logoIiresodhColor} alt="IIRESODH" className="h-8 sm:h-9 w-auto object-contain" />
                    <div className="h-8 w-px bg-slate-200" />
                    <img src={logoUnlp} alt="Instituto de Derechos Humanos UNLP" className="h-12 sm:h-14 w-auto object-contain" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-main-red block">
                      Organización Conjunta Oficial
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-main-blue">
                      IIRESODH & Instituto de Derechos Humanos (UNLP - Argentina)
                    </h3>
                    <p className="text-xs text-slate-600 font-light mt-0.5 max-w-xl">
                      Programa académico diseñado y certificado conjuntamente por ambas instituciones de referencia internacional.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => irASeccion("brochure")}
                  className="shrink-0 bg-white hover:bg-slate-100 text-main-blue border border-slate-300 font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-xs transition"
                >
                  Consultar Brochure Oficial 📄
                </button>
              </div>

              {/* PERSPECTIVA HISTÓRICA */}
              <div className="max-w-4xl">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-main-red block mb-1">
                  Perspectiva Histórica y Jurídica
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-main-blue tracking-tight">
                  {landing.legadoTitulo || "Nuestro Legado y Visión"}
                </h2>
                <div className="w-12 h-1 bg-main-red my-3 rounded-full" />
                <p className="text-gray-700 font-light text-base leading-relaxed text-justify">
                  {landing.legadoTexto || DATOS_PALERMO_2027.landingPage.legadoTexto}
                </p>
              </div>

              {/* ¿A QUIÉN ESTÁ DIRIGIDO? (DEL BROCHURE) */}
              <div className="pt-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-main-red block mb-1">
                  Perfil de Convocatoria
                </span>
                <h3 className="text-xl md:text-2xl font-black text-main-blue tracking-tight mb-4">
                  ¿A quién está dirigido?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {aQuienDirigido.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3 hover:bg-white hover:border-main-blue/30 transition shadow-xs"
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{item.icono || "⚖️"}</span>
                      <p className="text-xs text-gray-700 font-medium leading-relaxed">
                        {item.perfil}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ¿QUÉ ESTÁ INCLUIDO? (DEL BROCHURE) */}
              <div className="pt-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-main-red block mb-1">
                  Logística y Servicios Integrales
                </span>
                <h3 className="text-xl md:text-2xl font-black text-main-blue tracking-tight mb-4">
                  ¿Qué está incluido en la matrícula?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {queEstaIncluido.map((item, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-2xl border border-gray-200 bg-slate-50/70 hover:bg-white hover:border-main-blue/30 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-main-blue/10 text-main-blue flex items-center justify-center text-xl mb-3 shadow-xs">
                          {item.icono || "✓"}
                        </div>
                        <h4 className="text-sm font-bold text-main-blue mb-1.5 leading-snug">
                          {item.titulo}
                        </h4>
                        <p className="text-xs text-gray-600 font-light leading-relaxed">
                          {item.descripcion}
                        </p>
                      </div>
                      <div className="w-6 h-0.5 bg-main-red/30 rounded-full mt-4" />
                    </div>
                  ))}
                </div>
              </div>

              {/* ¿QUÉ APRENDERÁS? (DEL BROCHURE) */}
              <div className="pt-2 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 block mb-1">
                    Resultados de Formación
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-4">
                    ¿Qué aprenderás en este curso internacional?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {queAprenderas.map((resultado, idx) => (
                      <div
                        key={idx}
                        className="bg-white/10 border border-white/15 p-4 rounded-xl flex items-start gap-3 backdrop-blur-xs"
                      >
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-neutral-200 font-light leading-relaxed">
                          {resultado}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CUATRO PILARES DOGMÁTICOS */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
                  Cuatro Pilares Dogmáticos del Programa
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pilares.map((pilar, idx) => (
                    <div 
                      key={idx}
                      className="bg-slate-50 p-5 rounded-2xl border border-gray-100 hover:border-main-blue/30 hover:bg-white hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-xl mb-3 block">
                          {idx === 0 ? "⚖️" : idx === 1 ? "🔍" : idx === 2 ? "🛡️" : "🌐"}
                        </span>
                        <h4 className="text-sm font-bold text-main-blue mb-2 leading-snug">
                          {pilar.titulo}
                        </h4>
                        <p className="text-xs text-gray-600 font-light leading-relaxed">
                          {pilar.descripcion}
                        </p>
                      </div>
                      <div className="w-6 h-0.5 bg-main-red/40 rounded-full mt-4" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center flex-wrap gap-3">
                <a
                  href={contacto?.whatsappUrl || "https://wa.me/50640816188"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>💬 Contactar Coordinación por WhatsApp</span>
                </a>
                <button
                  onClick={() => irASeccion("programa")}
                  className="bg-main-blue hover:bg-light-blue text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Explorar Programa Académico ({programa.length} Días)</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              PESTAÑA 2: PROGRAMA ACADÉMICO (7 DÍAS EN PALERMO)
             ========================================== */}
          {seccionActiva === "programa" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-main-red block">
                    7 Días en Palermo • Mayo 2027
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-main-blue tracking-tight">
                    Estructura del Programa Día a Día
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-bold border border-slate-200">
                    ⏱️ Sesiones: 9:00–13:00 y 15:00–18:00
                  </span>
                </div>
              </div>

              {/* LAYOUT EN 2 COLUMNAS: SELECTOR VERTICAL DE DÍAS A LA IZQUIERDA + DETALLE A LA DERECHA */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* SELECTOR VERTICAL DE DÍAS */}
                <div className="lg:col-span-5 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  {programa.map((item, index) => {
                    const activo = diaActivo === index;
                    return (
                      <button
                        key={index}
                        onClick={() => setDiaActivo(index)}
                        className={`text-left p-3.5 rounded-xl border transition cursor-pointer shrink-0 lg:shrink w-auto lg:w-full ${
                          activo
                            ? "bg-main-blue text-white border-main-blue shadow-md"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${activo ? "text-amber-300" : "text-main-red"}`}>
                            {item.dia} • {item.fecha?.split("de")[0] || ""}
                          </span>
                          <span className="text-[10px] opacity-75">
                            {index === 6 ? "Conmemoración" : "Intensivo"}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs line-clamp-1 mt-1">
                          {item.titulo}
                        </h4>
                        {item.lugarEmblematico && (
                          <span className={`text-[10px] block mt-0.5 line-clamp-1 ${activo ? "text-blue-100" : "text-gray-500"}`}>
                            📍 {item.lugarEmblematico}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* DETALLE DEL DÍA SELECCIONADO */}
                <div className="lg:col-span-7 bg-slate-50/80 p-6 md:p-8 rounded-2xl border border-gray-200 shadow-inner">
                  {programa[diaActivo] && (
                    <div className="space-y-5 animate-fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
                        <div>
                          <span className="bg-main-red/10 text-main-red font-black text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded">
                            {programa[diaActivo].dia} • {programa[diaActivo].fecha}
                          </span>
                          <h3 className="text-xl md:text-2xl font-black text-main-blue mt-2">
                            {programa[diaActivo].titulo}
                          </h3>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                          ⏱️ {programa[diaActivo].horario}
                        </span>
                      </div>

                      {programa[diaActivo].lugarEmblematico && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 font-medium">
                          <span className="text-base">🏛️</span>
                          <span><strong>Lugar Emblemático:</strong> {programa[diaActivo].lugarEmblematico}</span>
                        </div>
                      )}

                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                          Enfoque Metodológico
                        </h4>
                        <p className="text-sm text-gray-700 font-light leading-relaxed">
                          {programa[diaActivo].descripcion}
                        </p>
                      </div>

                      {programa[diaActivo].temas && (
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
                            Ejes Temáticos y Casos Forenses
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {programa[diaActivo].temas.map((tema, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-gray-700 font-light bg-white p-2.5 rounded-lg border border-gray-100">
                                <span className="text-light-blue font-bold">✓</span>
                                <span>{tema}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => irASeccion("legado")}
                  className="text-gray-500 hover:text-main-blue text-xs font-bold transition cursor-pointer"
                >
                  ← Volver a Visión
                </button>
                <button
                  onClick={() => irASeccion("docentes")}
                  className="bg-main-blue hover:bg-light-blue text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Ver Docentes Destacados</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              PESTAÑA 3: DOCENTES DESTACADOS
             ========================================== */}
          {seccionActiva === "docentes" && (
            <div className="space-y-6 animate-fade-in">
              <div className="max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-main-red block mb-1">
                  Cuerpo Docente Internacional
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-main-blue tracking-tight">
                  Docentes Destacados
                </h2>
                <div className="w-12 h-1 bg-main-red my-3 rounded-full" />
                <p className="text-gray-600 font-light text-sm">
                  Magistrados antimafia, relatores internacionales de derechos humanos y catedráticos especializados de Europa e Iberoamérica.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {docentes.map((docente, index) => (
                  <div 
                    key={index}
                    className="p-6 rounded-2xl border border-gray-200 bg-slate-50/70 hover:bg-white hover:border-main-blue/30 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-main-blue/10 text-main-blue px-2.5 py-0.5 rounded-full">
                          {docente.origen || "Internacional"}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {docente.rol || "Docente"}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-main-blue">
                        {docente.nombre}
                      </h4>
                      <p className="text-xs font-bold text-main-red mt-0.5 mb-2">
                        {docente.cargo}
                      </p>
                      <p className="text-xs text-gray-600 font-light leading-relaxed">
                        {docente.descripcion}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                      <span>✓ Sesiones Magistrales & Talleres</span>
                      <span className="font-bold text-main-blue">Palermo 2027</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CO-ORGANIZACIÓN NOTA */}
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl text-xs text-amber-950 flex items-center gap-3">
                <span className="text-xl">🤝</span>
                <span>
                  <strong>+ Más de 20 expertos italianos e internacionales:</strong> Fiscales jefe de tribunales de Italia, catedráticos antimafia, e investigadores especializados de la UNODC y la OIM participarán activamente en las mesas redondas y simulaciones.
                </span>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => irASeccion("programa")}
                  className="text-gray-500 hover:text-main-blue text-xs font-bold transition cursor-pointer"
                >
                  ← Ver Programa
                </button>
                <button
                  onClick={() => irASeccion("brochure")}
                  className="bg-main-blue hover:bg-light-blue text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Ver Brochure Oficial</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              PESTAÑA 5: BROCHURE OFICIAL (VISUALIZADOR)
             ========================================== */}
          {seccionActiva === "brochure" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-main-red block">
                    Material Informativo
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-main-blue tracking-tight">
                    Brochure Oficial del Evento
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={contacto?.whatsappUrl || "https://wa.me/50640816188"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    <span>💬 WhatsApp</span>
                    <span>+506 4081 6188</span>
                  </a>
                </div>
              </div>

              <p className="text-xs text-gray-600 font-light">
                Haz clic en cualquiera de las páginas para ampliarla en alta definición o descárgala para compartirla con tu institución académica o judicial.
              </p>

              {/* GRID CON LAS 2 PÁGINAS DEL BROCHURE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* PÁGINA 1 */}
                <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <div 
                    onClick={() => setModalBrochure(1)}
                    className="cursor-pointer group relative overflow-hidden rounded-xl border border-gray-300 shadow-md bg-neutral-900"
                  >
                    <img 
                      src={brochureP1} 
                      alt="Brochure Oficial Palermo 2027 - Página 1" 
                      className="w-full h-auto object-cover group-hover:scale-102 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="bg-white text-main-blue font-black text-xs uppercase tracking-wider py-2 px-4 rounded-xl shadow-lg">
                        🔍 Clic para Ampliar
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700">Página 1: Convocatoria & Ejes</span>
                    <a 
                      href={brochureP1} 
                      download="Brochure_Palermo_2027_P1.jpg"
                      className="text-main-blue hover:underline font-bold text-[11px]"
                    >
                      Descargar JPG ↓
                    </a>
                  </div>
                </div>

                {/* PÁGINA 2 */}
                <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <div 
                    onClick={() => setModalBrochure(2)}
                    className="cursor-pointer group relative overflow-hidden rounded-xl border border-gray-300 shadow-md bg-neutral-900"
                  >
                    <img 
                      src={brochureP2} 
                      alt="Brochure Oficial Palermo 2027 - Página 2" 
                      className="w-full h-auto object-cover group-hover:scale-102 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="bg-white text-main-blue font-black text-xs uppercase tracking-wider py-2 px-4 rounded-xl shadow-lg">
                        🔍 Clic para Ampliar
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700">Página 2: Itinerario 7 Días & Docentes</span>
                    <a 
                      href={brochureP2} 
                      download="Brochure_Palermo_2027_P2.jpg"
                      className="text-main-blue hover:underline font-bold text-[11px]"
                    >
                      Descargar JPG ↓
                    </a>
                  </div>
                </div>

              </div>

              {/* CARD DE CONTACTO OFICIAL */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
                    Atención Directa de Admisiones
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    ¿Tienes dudas o necesitas orden de facturación institucional?
                  </h4>
                  <p className="text-xs text-neutral-300 font-light mt-0.5">
                    Escríbenos a <a href="mailto:cursos@iiresodh.org" className="underline text-amber-300">cursos@iiresodh.org</a> o <a href="mailto:contacto@iiresodh.org" className="underline text-amber-300">contacto@iiresodh.org</a>
                  </p>
                </div>
                <button
                  onClick={() => irASeccion("inscripcion")}
                  className="bg-main-red hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl shadow-md transition whitespace-nowrap"
                >
                  Reservar Cupo Ahora
                </button>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => irASeccion("incluido")}
                  className="text-gray-500 hover:text-main-blue text-xs font-bold transition cursor-pointer"
                >
                  ← Ver Qué Incluye
                </button>
                <button
                  onClick={() => irASeccion("sede")}
                  className="bg-main-blue hover:bg-light-blue text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Conocer la Sede en Palermo</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              PESTAÑA 6: SEDE PALERMO
             ========================================== */}
          {seccionActiva === "sede" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <div className="lg:col-span-6 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 block">
                    Cuna de la Convención de la ONU
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-main-blue tracking-tight">
                    Conoce {landing.sedeNombre || "Palermo, Sicilia"}
                  </h2>
                  <div className="w-12 h-1 bg-main-red rounded-full" />
                  
                  <p className="text-gray-700 font-light text-sm leading-relaxed text-justify">
                    {landing.sedeTexto || DATOS_PALERMO_2027.landingPage.sedeTexto}
                  </p>

                  <div className="space-y-2 pt-1">
                    {(landing.sedeLogistica || DATOS_PALERMO_2027.landingPage.sedeLogistica).map((log, i) => (
                      <div key={i} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-gray-200 text-xs text-gray-700 font-light">
                        <span className="text-main-blue font-bold">✦</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative group">
                    <img
                      src={landing.sedeImagenUrl || palermoDefaultImg}
                      alt="Catedral de Palermo, Sicilia"
                      className="w-full h-64 md:h-72 object-cover group-hover:scale-103 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                      <div>
                        <span className="text-[9px] uppercase font-black tracking-widest text-amber-400 bg-black/50 px-2 py-0.5 rounded">
                          Patrimonio Histórico y Cultural
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">
                          Catedral de Palermo & Palacio de Justicia
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl overflow-hidden border border-gray-200 relative group h-28 bg-neutral-900">
                      <img 
                        src={palermoJusticiaBw} 
                        alt="Palacio de Justicia de Palermo" 
                        className="w-full h-full object-cover filter grayscale contrast-110 group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/50 p-2 flex items-end">
                        <span className="text-[10px] text-white font-bold">Palacio de Justicia</span>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-200 relative group h-28 bg-neutral-900">
                      <img 
                        src={palermoAulaBunkerBw} 
                        alt="Aula Búnker de Palermo" 
                        className="w-full h-full object-cover filter grayscale contrast-110 group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/50 p-2 flex items-end">
                        <span className="text-[10px] text-white font-bold">Aula Búnker del Maxi-Proceso</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => irASeccion("brochure")}
                  className="text-gray-500 hover:text-main-blue text-xs font-bold transition cursor-pointer"
                >
                  ← Ver Brochure
                </button>
                <button
                  onClick={() => irASeccion("inscripcion")}
                  className="bg-main-red hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Ir a Opciones de Inscripción y Pago</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              PESTAÑA 5: INSCRIPCIÓN Y PAGO (FORMULARIO)
             ========================================== */}
          {seccionActiva === "inscripcion" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center max-w-2xl mx-auto mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-main-red block mb-1">
                  Reserva Oficial
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-main-blue tracking-tight">
                  Opciones de Inscripción y Pago
                </h2>
                <div className="w-12 h-1 bg-main-red mx-auto my-2 rounded-full" />
              </div>


              {/* SELECTOR DE MÉTODO DE INSCRIPCIÓN Y PAGO */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-gray-200 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setMetodoInscripcion("tarjeta")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      metodoInscripcion === "tarjeta"
                        ? "bg-white text-main-blue shadow-md border border-gray-100 scale-100"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <span>💳 Pago en Línea (Cuotas Sin Intereses)</span>
                    <span className="hidden sm:inline-block text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded border border-sky-200">
                      0% Interés
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoInscripcion("transferencia")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      metodoInscripcion === "transferencia"
                        ? "bg-white text-main-blue shadow-md border border-gray-100 scale-100"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <span>🏛️ Transferencia Institucional</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* COLUMNA IZQUIERDA: RESUMEN Y BENEFICIOS DE MATRÍCULA */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 border border-gray-200 p-6 rounded-3xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-main-red block">
                          Matrícula Oficial
                        </span>
                        <h3 className="text-base font-extrabold text-main-blue">
                          Inversión Académica
                        </h3>
                      </div>
                      <span className="text-2xl font-black text-main-blue">
                        {normalizarPrecio(landing.precioInversion)}
                      </span>
                    </div>

                    {/* BADGE DE DISPONIBILIDAD DE CUPOS */}
                    <div className="bg-rose-50 border border-rose-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-bold text-rose-800 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                        Disponibilidad: Cupos Limitados
                      </span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-md border border-rose-200/60">
                        Plazas reducidas
                      </span>
                    </div>

                    {/* FINANCIACIÓN EN CUOTAS (COLAPSABLE, CERRADO POR DEFECTO) */}
                    <details className="group bg-sky-50/70 border border-sky-200 rounded-2xl p-3.5 text-xs">
                      <summary className="flex items-center justify-between gap-2 cursor-pointer select-none list-none">
                        <div className="flex items-center gap-2 text-sky-950 font-bold">
                          <span>💳</span>
                          <span>Financiación en Cuotas Sin Intereses</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                            0% Recargo
                          </span>
                          <span className="text-sky-600 group-open:rotate-180 transition-transform text-xs">▼</span>
                        </div>
                      </summary>
                      <p className="text-sky-900 font-light text-[11px] leading-relaxed pt-2.5 mt-2 border-t border-sky-200/60">
                        Difiere tu matrícula sin recargo financiero. Por estricto control institucional, <strong>todas las cuotas deben quedar concluidas a más tardar el último día del mes anterior al evento ({landing.fechaLimiteTexto || "30 de abril de 2027"})</strong>. Los planes disponibles se calculan y limitan automáticamente en el formulario según tu fecha de registro.
                      </p>
                    </details>

                    {/* QUÉ INCLUYE */}
                    <div className="space-y-2 pt-1 text-xs text-gray-600">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Beneficios Incluidos:
                      </span>
                      <ul className="space-y-2 text-[11px]">
                        <li className="flex items-start gap-2">
                          <span className="text-sky-700 font-bold">✓</span>
                          <span>Sesiones magistrales y talleres de litigio con fiscales y jueces antimafia.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-sky-700 font-bold">✓</span>
                          <span>Visitas institucionales en Palermo y tribunales de justicia histórica.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-sky-700 font-bold">✓</span>
                          <span>Certificación académica internacional de alta especialización emitida por IIRESODH.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-sky-700 font-bold">✓</span>
                          <span>Expediente documental, lecturas y materiales exclusivos de investigación.</span>
                        </li>
                      </ul>
                    </div>

                    {/* SEGURIDAD */}
                    <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-[10px] font-bold text-gray-500">
                      <span>🔒 Cifrado Bancario SSL 256-bit</span>
                      <span>🛡️ Cumplimiento PCI-DSS</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl text-xs space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <span>🏛️</span>
                      <span>Facturación para Instituciones y Despachos</span>
                    </div>
                    <p className="text-slate-600 font-light text-[11px] leading-relaxed">
                      Para tramitar pagos a través de Poder Judicial, Fiscalía, Ministerios o Universidades, emitimos factura proforma oficial y certificado bancario SWIFT/IBAN.
                    </p>
                  </div>
                </div>

                {/* COLUMNA DERECHA: FORMULARIO DINÁMICO */}
                <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-md">
                  {metodoInscripcion === "tarjeta" ? (
                    <div>
                      <div className="mb-5 pb-3 border-b border-gray-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-main-red block mb-0.5">
                          Inscripción Inmediata
                        </span>
                        <h4 className="text-xl font-black text-main-blue tracking-tight">
                          Pago Directo con Tarjeta en Línea
                        </h4>
                        <p className="text-xs text-gray-500 font-light mt-0.5">
                          Selecciona si deseas pagar en 1 sola exhibición o en 2, 3 o 4 cuotas mensuales sin intereses.
                        </p>
                      </div>

                      <FormularioPagoCurso
                        curso={curso}
                        landing={landing}
                        onSwitchToTransferencia={() => setMetodoInscripcion("transferencia")}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="mb-5 pb-3 border-b border-gray-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block mb-0.5">
                          Vía Bancaria Oficial
                        </span>
                        <h4 className="text-xl font-black text-main-blue tracking-tight">
                          Solicitud de Datos de Transferencia y Reserva de Cupo
                        </h4>
                        <p className="text-xs text-gray-500 font-light mt-0.5">
                          Recibe en tu correo la orden bancaria SWIFT/IBAN para tramitar y asegurar tu lugar dentro del cupo limitado.
                        </p>
                      </div>

                      {solicitudExitosa ? (
                        <div className="p-6 bg-green-50 rounded-2xl border border-green-200 text-center space-y-3">
                          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl">
                            ✓
                          </div>
                          <h4 className="text-base font-bold text-green-900">
                            ¡Solicitud Registrada con Éxito!
                          </h4>
                          <p className="text-xs text-green-800 font-light max-w-sm mx-auto">
                            En menos de 24 horas hábiles recibirás en tu correo los datos bancarios y el expediente del curso.
                          </p>
                          <button
                            onClick={() => setSolicitudExitosa(false)}
                            className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-lg transition cursor-pointer"
                          >
                            Enviar otra solicitud
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitSolicitud} className="space-y-4 text-left">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Nombre Completo *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Lic. Carlos Mendoza"
                                className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Profesión / Cargo Actual *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.profesion}
                                onChange={(e) => setFormData({ ...formData, profesion: e.target.value })}
                                placeholder="Ej: Juez Penal / Fiscal / Abogado Litigante"
                                className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Correo Electrónico *
                              </label>
                              <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="tu.correo@institucion.org"
                                className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Teléfono / WhatsApp *
                              </label>
                              <input
                                type="tel"
                                required
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                placeholder="+506 8888-8888"
                                className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Institución / Despacho
                              </label>
                              <input
                                type="text"
                                value={formData.institucion}
                                onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                                placeholder="Poder Judicial / Fiscalía / Bufete"
                                className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                                País de Residencia *
                              </label>
                              <select
                                value={formData.pais}
                                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                                className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
                              >
                                <option value="Costa Rica">Costa Rica</option>
                                <option value="Colombia">Colombia</option>
                                <option value="México">México</option>
                                <option value="Guatemala">Guatemala</option>
                                <option value="Canadá">Canadá</option>
                                <option value="España">España</option>
                                <option value="Italia">Italia</option>
                                <option value="Argentina">Argentina</option>
                                <option value="Chile">Chile</option>
                                <option value="Perú">Perú</option>
                                <option value="Ecuador">Ecuador</option>
                                <option value="Panamá">Panamá</option>
                                <option value="Estados Unidos">Estados Unidos</option>
                                <option value="Otro">Otro país</option>
                              </select>
                            </div>
                          </div>

                          {/* EXPERIENCIA EN TEMAS */}
                          <div className="pt-2">
                            <span className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                              Experiencia o vinculación en estos temas:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {["Crimen organizado", "Trata de personas", "Lavado de activos", "Litigio estratégico", "Otro"].map((tema) => {
                                const checked = formData.experienciaTemas.includes(tema);
                                return (
                                  <label
                                    key={tema}
                                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                                      checked
                                        ? "bg-blue-50/70 border-main-blue text-main-blue font-bold shadow-xs"
                                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        const existe = formData.experienciaTemas.includes(tema);
                                        setFormData({
                                          ...formData,
                                          experienciaTemas: existe
                                            ? formData.experienciaTemas.filter((t) => t !== tema)
                                            : [...formData.experienciaTemas, tema]
                                        });
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-main-blue focus:ring-main-blue cursor-pointer"
                                    />
                                    <span>{tema}</span>
                                  </label>
                                );
                              })}
                            </div>

                            {formData.experienciaTemas.includes("Otro") && (
                              <div className="mt-2 animate-fade-in">
                                <input
                                  type="text"
                                  value={formData.experienciaOtro}
                                  onChange={(e) => setFormData({ ...formData, experienciaOtro: e.target.value })}
                                  placeholder="Especifica el área..."
                                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/30 focus:outline-none focus:ring-1 focus:ring-main-blue"
                                />
                              </div>
                            )}
                          </div>

                          {/* MOTIVACIÓN */}
                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                              ¿Por qué deseas participar en el curso? *
                            </label>
                            <textarea
                              rows={3}
                              required
                              value={formData.motivoParticipacion}
                              onChange={(e) => setFormData({ ...formData, motivoParticipacion: e.target.value })}
                              placeholder="Describe tus expectativas, objetivos profesionales o aplicación práctica en tus labores..."
                              className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue resize-none bg-white"
                            />
                          </div>

                          {/* PREGUNTAS ACADÉMICAS CONDICIONALES */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-gray-200 text-xs">
                            <div className="space-y-1.5">
                              <span className="block font-bold text-gray-800 leading-tight">
                                ¿Cursos internacionales previos en estos temas?
                              </span>
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1 cursor-pointer font-medium text-gray-700">
                                  <input
                                    type="radio"
                                    name="cursosPreviosTrans"
                                    value="si"
                                    checked={formData.cursosPrevios === "si"}
                                    onChange={() => setFormData({ ...formData, cursosPrevios: "si" })}
                                  />
                                  <span>Sí</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer font-medium text-gray-700">
                                  <input
                                    type="radio"
                                    name="cursosPreviosTrans"
                                    value="no"
                                    checked={formData.cursosPrevios === "no"}
                                    onChange={() => setFormData({ ...formData, cursosPrevios: "no", detalleCursosPrevios: "" })}
                                  />
                                  <span>No</span>
                                </label>
                              </div>
                              {formData.cursosPrevios === "si" && (
                                <input
                                  type="text"
                                  value={formData.detalleCursosPrevios}
                                  onChange={(e) => setFormData({ ...formData, detalleCursosPrevios: e.target.value })}
                                  placeholder="¿Cuáles cursos?"
                                  className="w-full text-xs px-2.5 py-1 rounded border border-gray-300 bg-white"
                                />
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <span className="block font-bold text-gray-800 leading-tight">
                                ¿Has sido alumno(a) de IIRESODH?
                              </span>
                              <div className="flex items-center gap-3 pt-1">
                                <label className="flex items-center gap-1 cursor-pointer font-bold text-emerald-700">
                                  <input
                                    type="radio"
                                    name="alumnoIiresodhTrans"
                                    value="si"
                                    checked={formData.alumnoIiresodh === "si"}
                                    onChange={() => setFormData({ ...formData, alumnoIiresodh: "si" })}
                                  />
                                  <span>Sí (Comunidad)</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer font-medium text-gray-700">
                                  <input
                                    type="radio"
                                    name="alumnoIiresodhTrans"
                                    value="no"
                                    checked={formData.alumnoIiresodh === "no"}
                                    onChange={() => setFormData({ ...formData, alumnoIiresodh: "no" })}
                                  />
                                  <span>No</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                              Comentarios o Requerimientos de Facturación Institucional
                            </label>
                            <textarea
                              rows={2}
                              value={formData.comentarios}
                              onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                              placeholder="Requerimientos de orden de compra, certificado SWIFT/IBAN o consulta de hospedaje..."
                              className="w-full text-base sm:text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-main-blue resize-none bg-white"
                            />
                          </div>

                          {/* CLÁUSULA INFORMATIVA DE PROTECCIÓN DE DATOS - LEY N° 8968 (COSTA RICA) (COLAPSABLE, CERRADA POR DEFECTO) */}
                          <details className="group bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-gray-600 leading-relaxed text-left">
                            <summary className="font-bold text-gray-800 flex items-center justify-between cursor-pointer select-none text-xs list-none">
                              <span className="flex items-center gap-1.5">
                                <span>🛡️</span> Protección de Datos Personales (Ley N° 8968 / Costa Rica)
                              </span>
                              <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                            </summary>
                            <div className="pt-2.5 space-y-2 border-t border-slate-200/60 mt-2">
                              <p className="text-[11px] leading-relaxed">
                                De conformidad con la Ley N° 8968 (Protección de la Persona frente al Tratamiento de sus Datos Personales), se le informa que sus datos personales y de perfil académico serán incorporados a las bases de datos de la <strong>Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)</strong>, Cédula de Persona Jurídica 3-002-671392, con la finalidad exclusiva de remitirle la información bancaria para la reserva de cupo, emitir el expediente del curso y coordinar su participación académica.
                              </p>
                              <p className="text-[11px] leading-relaxed text-gray-500">
                                La entrega de datos es voluntaria, con la consecuencia de que no facilitarlos imposibilita remitirle el expediente bancario e inscribirle. Sus datos no serán cedidos a terceros con fines comerciales o publicitarios. Puede ejercer en cualquier momento sus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) escribiendo a <a href="mailto:contacto@iiresodh.org" className="text-main-blue font-bold hover:underline">contacto@iiresodh.org</a>.
                              </p>
                            </div>
                          </details>

                          <label className="flex items-start gap-2.5 text-xs text-gray-700 font-medium cursor-pointer select-none text-left">
                            <input
                              type="checkbox"
                              checked={aceptarPrivacidadTransferencia}
                              onChange={(e) => setAceptarPrivacidadTransferencia(e.target.checked)}
                              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-main-blue focus:ring-main-blue cursor-pointer"
                            />
                            <span className="leading-snug">
                              He leído y acepto la{" "}
                              <a
                                href="/privacidad"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-main-blue font-bold underline hover:text-light-blue"
                              >
                                Política de Privacidad y Protección de Datos Personales
                              </a>{" "}
                              de IIRESODH y autorizo expresamente el tratamiento de mis datos para los fines de este curso.
                            </span>
                          </label>

                          <button
                            type="submit"
                            disabled={enviandoSolicitud}
                            className="w-full bg-main-blue hover:bg-light-blue text-white font-bold text-xs uppercase tracking-widest py-3.5 px-5 rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
                          >
                            {enviandoSolicitud ? (
                              <>
                                <CircularProgress size={14} sx={{ color: "white" }} />
                                <span>Procesando solicitud oficial...</span>
                              </>
                            ) : (
                              <span>Enviar Solicitud de Datos Bancarios</span>
                            )}
                          </button>

                          <div className="pt-2 text-center">
                            <button
                              type="button"
                              onClick={() => setMetodoInscripcion("tarjeta")}
                              className="text-xs text-main-blue hover:underline font-semibold cursor-pointer"
                            >
                              ← O pagar directamente en línea con tarjeta (1, 2, 3 o 4 cuotas)
                            </button>
                          </div>
                        </form>
                      )}

                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

      </div>



      {/* MODAL VISOR DE BROCHURE EN ALTA DEFINICIÓN */}
      {modalBrochure !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setModalBrochure(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[95vh] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ENCABEZADO DEL MODAL */}
            <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Brochure Oficial Palermo 2027 • Página {modalBrochure} de 2
                </span>
                <div className="hidden sm:inline-flex items-center gap-1.5 bg-neutral-800 px-2 py-0.5 rounded text-[11px] text-neutral-300 font-medium">
                  <span>IIRESODH & Instituto DDHH UNLP</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalBrochure(modalBrochure === 1 ? 2 : 1)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-neutral-700 transition"
                >
                  {modalBrochure === 1 ? "Ver Página 2 →" : "← Ver Página 1"}
                </button>
                <a
                  href={modalBrochure === 1 ? brochureP1 : brochureP2}
                  download={`Brochure_Palermo_2027_P${modalBrochure}.jpg`}
                  className="bg-main-blue hover:bg-light-blue text-white text-xs font-bold px-3 py-1.5 rounded-lg transition hidden sm:inline-block"
                >
                  Descargar ↓
                </a>
                <button
                  onClick={() => setModalBrochure(null)}
                  className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center font-bold text-sm transition"
                  title="Cerrar visor"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* CONTENEDOR DE IMAGEN CON SCROLL */}
            <div className="overflow-auto max-h-[82vh] p-2 sm:p-4 bg-neutral-950 flex items-center justify-center">
              <img
                src={modalBrochure === 1 ? brochureP1 : brochureP2}
                alt={`Brochure Oficial Página ${modalBrochure}`}
                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-lg border border-neutral-800"
              />
            </div>

            {/* PIE DEL MODAL CON ACCIÓN RÁPIDA */}
            <div className="bg-neutral-950 px-4 py-2.5 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <span className="hidden sm:inline">
                Haz clic fuera o en el botón ✕ para cerrar
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <a
                  href={contacto?.whatsappUrl || "https://wa.me/50640816188"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5"
                >
                  <span>💬 Consultar dudas por WhatsApp</span>
                </a>
                <button
                  onClick={() => {
                    setModalBrochure(null);
                    irASeccion("inscripcion");
                  }}
                  className="bg-main-red hover:bg-red-800 text-white font-bold text-xs uppercase px-3.5 py-1.5 rounded-lg transition"
                >
                  Inscribirme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SNACKBAR DE NOTIFICACIONES */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={6000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlerta({ ...alerta, open: false })}
          severity={alerta.tipo}
          sx={{ width: "100%", borderRadius: "16px" }}
        >
          {alerta.mensaje}
        </Alert>
      </Snackbar>
    </main>
  );
}
