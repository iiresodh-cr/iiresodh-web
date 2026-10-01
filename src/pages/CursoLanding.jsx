// src/pages/CursoLanding.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { CircularProgress, Alert, Snackbar } from "@mui/material";
import { useTranslation } from "react-i18next";

// Assets locales predeterminados
import falconeDefaultImg from "../assets/cursos/falcone_borsellino.jpg";
import palermoDefaultImg from "../assets/cursos/palermo_catedral.jpg";
import logoIiresodh from "../assets/logo.webp";
import FormularioPagoCurso from "../components/cursos/FormularioPagoCurso";

export const normalizarPrecio = (precioStr) => {
  if (!precioStr) return "3,350.00 USD";
  let s = String(precioStr).replace("3.350", "3,350");
  if (s.includes("3,350") && !s.includes("3,350.")) {
    s = s.replace("3,350", "3,350.00");
  }
  return s;
};

// Datos por defecto para el Curso Internacional 2027 en Palermo (Fallback y Semilla visual)
export const DATOS_PALERMO_2027 = {
  id: "palermo-2027",
  slug: "curso-internacional-palermo-2027",
  titulo: "Curso Internacional 2027 - Palermo, Sicilia, Italia. Del 17 al 23 de mayo de 2027",
  resumen: "Programa de alta especialización judicial sobre la aplicación de las Convenciones de Palermo contra el Crimen Organizado Transnacional.",
  estadoInscripcion: "proximamente",
  imagenPrincipalUrl: falconeDefaultImg,
  landingPage: {
    habilitada: true,
    publicada: false, // Por defecto no pública como solicitó el usuario
    lema: "APLICACIÓN DE LAS CONVENCIONES DE PALERMO CONTRA EL CRIMEN ORGANIZADO",
    ubicacionFechas: "Palermo, Sicilia, Italia | Del 17 al 23 de mayo de 2027",
    precioInversion: "3,350.00 USD",
    inversionDetalle: "Por persona. Incluye sesiones magistrales, visitas de campo, materiales exclusivos y certificación internacional.",
    cuposTexto: "Cupos Estrictamente Limitados",
    fechaLimitePago: "2027-04-30",
    fechaLimiteTexto: "30 de abril de 2027",
    enlaceStripe: "",
    heroImagenUrl: falconeDefaultImg,
    heroCita: "«La mafia è un fenomeno umano e come tutti i fenomeni umani ha un principio, una sua evoluzione e avrà quindi anche una fine.»",
    heroCitaAutor: "Giovanni Falcone (1939 – 1992)",
    
    // Sección Legado y Visión
    legadoTitulo: "Nuestro Legado y Visión",
    legadoTexto: "El legado histórico de los magistrados Giovanni Falcone y Paolo Borsellino sentó las bases de la lucha contemporánea contra el crimen organizado y la macrocriminalidad financiera. En el año 2000, Palermo fue la sede donde la comunidad internacional aprobó la histórica Convención de las Naciones Unidas contra la Delincuencia Organizada Transnacional. Este curso internacional conecta ese precedente histórico con los desafíos judiciales de vanguardia, el decomiso de activos ilícitos y la cooperación penal transfronteriza.",
    pilares: [
      {
        titulo: "Instrumentos Internacionales y Jurisprudencia",
        descripcion: "Análisis dogmático y procesal de la Convención de Palermo y protocolos complementarios.",
        icono: "balanza"
      },
      {
        titulo: "Investigaciones Financieras y Recuperación de Activos",
        descripcion: "Técnicas probatorias de seguimiento patrimonial ('Follow the Money') y extinción de dominio.",
        icono: "dinero"
      },
      {
        titulo: "Protección Integral a Testigos y Operadores",
        descripcion: "Protocolos de seguridad, reserva de identidad y garantías procesales para fiscales y jueces.",
        icono: "escudo"
      },
      {
        titulo: "Cooperación Judicial y Extradición",
        descripcion: "Mecanismos de asistencia mutua, equipos conjuntos de investigación y tratados multilaterales.",
        icono: "mundo"
      }
    ],

    // Estructura del Programa
    programa: [
      {
        dia: "DÍA 1",
        fecha: "Lunes 17 de mayo",
        titulo: "Instrumentos Internacionales y Evolución Dogmática",
        horario: "09:00 - 13:00 / 15:00 - 18:00",
        descripcion: "Apertura institucional y análisis exegético de la Convención de Palermo (UNTOC). Tipologías penales transnacionales, estándar probatorio internacional y armonización de legislaciones internas.",
        temas: [
          "Génesis y alcance de la Convención de las Naciones Unidas de 2000",
          "Delito de asociación ilícita y crimen corporativo",
          "Obligaciones de tipificación penal en los Estados parte"
        ]
      },
      {
        dia: "DÍA 2",
        fecha: "Martes 18 de mayo",
        titulo: "Investigaciones Financieras y Lavado de Dinero",
        horario: "09:00 - 13:00 / 15:00 - 18:00",
        descripcion: "El método Falcone: 'Seguir el rastro del dinero'. Investigaciones patrimoniales complejas, rastreo de activos en paraísos fiscales, decomiso sin condena y extinción de dominio.",
        temas: [
          "El método Falcone: de la contabilidad forense a la imputación penal",
          "Criptoactivos, lavado transfronterizo y estructuras corporativas fiduciarias",
          "Taller práctico: Análisis de balances bancarios sospechosos"
        ]
      },
      {
        dia: "DÍA 3",
        fecha: "Miércoles 19 de mayo",
        titulo: "Protección de Testigos y Técnicas Especiales de Investigación",
        horario: "09:00 - 13:00 / 15:00 - 18:00",
        descripcion: "Mecanismos de inmunidad y delación premiada ('collaboratori di giustizia'). Protección integral de testigos amenazados, agentes encubiertos e interceptaciones telemáticas conforme al estándar de DDHH.",
        temas: [
          "El estatuto de los colaboradores de justicia y valoración de credibilidad",
          "Agentes encubiertos y entregas vigiladas internacionales",
          "Límites éticos y de DDHH en la recolección de evidencia digital"
        ]
      },
      {
        dia: "DÍA 4",
        fecha: "Jueves 20 de mayo",
        titulo: "Cooperación Judicial Internacional y Extradición",
        horario: "09:00 - 13:00 / 15:00 - 18:00",
        descripcion: "Exhortos consulares, comisiones rogatorias, órdenes europeas de investigación y equipos conjuntos de investigación (ECI) entre Europa e Iberoamérica.",
        temas: [
          "Equipos Conjuntos de Investigación (ECI): marco operativo y buenas prácticas",
          "Procedimientos de extradición y garantías del debido proceso",
          "Simulación de un requerimiento urgente de cooperación transfronteriza"
        ]
      },
      {
        dia: "DÍA 5 Y CLAUSURA",
        fecha: "Viernes 21 al 23 de mayo",
        titulo: "Visita Institucional al Aula Búnker y Ceremonia de Graduación",
        horario: "10:00 - 14:00",
        descripcion: "Recorrido conmemorativo en el Palacio de Justicia de Palermo (Aula Búnker del Maxi-Proceso), conferencia magistral de cierre por magistrados de la Corte de Casación de Italia y entrega de diplomas.",
        temas: [
          "Visita al Aula Búnker de Palermo: lecciones históricas del Maxi-Proceso",
          "Conferencia magistral de clausura: el futuro de la justicia global",
          "Solemne entrega de diplomas y cóctel de clausura"
        ]
      }
    ],

    // Destacados del Curso
    destacados: [
      {
        titulo: "Ponentes de Élite Mundial",
        descripcion: "Magistrados del Tribunal Supremo de Italia, fiscales antimafia y relatores de organismos internacionales.",
        icono: "juez"
      },
      {
        titulo: "Acceso a Casos Prácticos Reales",
        descripcion: "Estudio de expedientes desclasificados, pruebas periciales forenses y resolución de casos en talleres de simulación.",
        icono: "carpeta"
      },
      {
        titulo: "Networking Judicial Internacional",
        descripcion: "Intercambio directo y estrecha vinculación con jueces, fiscales y defensores de más de 12 países.",
        icono: "red"
      },
      {
        titulo: "Acreditación Internacional Oficial",
        descripcion: "Diploma oficial de alta especialización emitido por IIRESODH con validez curricular internacional.",
        icono: "certificado"
      },
      {
        titulo: "Grupo Exclusivo con Cupos Limitados",
        descripcion: "Aforo estrictamente restringido para garantizar el intercambio directo con magistrados y el acceso seguro a sedes judiciales históricas.",
        icono: "candado"
      }
    ],

    // Sede Palermo
    sedeNombre: "Palermo, Sicilia (Italia)",
    sedeLugar: "Catedral de Palermo & Sede Judicial Histórica",
    sedeImagenUrl: palermoDefaultImg,
    sedeTexto: "Palermo no es solo una joya arquitectónica del Mediterráneo donde confluyen las culturas normanda, árabe y barroca; es el epicentro mundial de la legislación contra el crimen organizado. En sus tribunales se forjó la doctrina más avanzada del derecho penal moderno y en su suelo se rubricó la Convención de la ONU en el año 2000. Los participantes disfrutarán de una experiencia académica inmersiva en un entorno de incalculable riqueza histórica y cultural.",
    sedeLogistica: [
      "Traducción simultánea disponible en español e italiano en todas las sesiones.",
      "Sede céntrica con acceso preferente a hoteles concertados con tarifa especial.",
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
  const [seccionActiva, setSeccionActiva] = useState("legado"); // 'legado' | 'programa' | 'destacados' | 'sede' | 'inscripcion'
  const [metodoInscripcion, setMetodoInscripcion] = useState("tarjeta"); // 'tarjeta' | 'transferencia'

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

  const PESTANAS = [
    { id: "legado", label: "Sobre el Curso", icono: "🏛️" },
    { id: "programa", label: "Programa (5 Días)", icono: "📅" },
    { id: "destacados", label: "Ponentes & Valor", icono: "⭐" },
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

      {/* HERO INSTITUCIONAL COMPACTO */}
      <section className="relative bg-[#0f1d30] text-white py-10 md:py-14 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(69,123,157,0.2),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(185,47,50,0.15),transparent_50%)] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* RETRATO FALCONE & BORSELLINO */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="relative group w-full max-w-sm">
                <div className="relative bg-[#162740] p-1.5 rounded-2xl border border-white/15 shadow-xl overflow-hidden">
                  <img
                    src={landing.heroImagenUrl || falconeDefaultImg}
                    alt="Magistrados Giovanni Falcone y Paolo Borsellino"
                    className="w-full h-56 sm:h-64 object-cover rounded-xl filter contrast-105"
                  />
                  <div className="p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent rounded-b-xl -mt-12 relative z-10 text-center">
                    <p className="text-[11px] italic text-gray-200 font-light leading-snug line-clamp-2">
                      {landing.heroCita || "«La mafia è un fenomeno umano...»"}
                    </p>
                    <p className="text-[10px] font-bold text-amber-400 mt-0.5 uppercase tracking-wider">
                      {landing.heroCitaAutor || "Giovanni Falcone"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[11px] uppercase tracking-widest text-amber-300 font-semibold backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Alta Especialización Internacional
                </div>
                <div className="inline-flex items-center gap-1.5 bg-rose-500/20 border border-rose-400/30 px-3 py-1 rounded-full text-[11px] uppercase tracking-widest text-rose-200 font-bold backdrop-blur-xs shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  {landing.cuposTexto || "Cupos Estrictamente Limitados"}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight uppercase font-sans text-white">
                {curso?.titulo || "CURSO INTERNACIONAL 2027"}
              </h1>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs md:text-sm font-medium text-pale-blue">
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                  <svg className="w-4 h-4 text-main-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {landing.ubicacionFechas || "Palermo, Sicilia, Italia | Del 17 al 23 de mayo de 2027"}
                </span>
              </div>

              <p className="text-sm md:text-base font-semibold text-gray-200 border-l-2 border-main-red pl-3">
                {landing.lema || "APLICACIÓN DE LAS CONVENCIONES DE PALERMO CONTRA EL CRIMEN ORGANIZADO"}
              </p>

              {/* TARJETA COMPACTA DE INVERSIÓN Y ACCIÓN RÁPIDA */}
              <div className="bg-white/10 border border-white/15 p-4 sm:p-5 rounded-2xl backdrop-blur-sm shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0 text-left">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                      {normalizarPrecio(landing.precioInversion)}
                    </span>
                    <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-amber-200/90 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      Inversión Académica
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                      Cupos Limitados
                    </span>
                  </div>
                  <p className="text-xs text-gray-200/90 font-light leading-relaxed">
                    {landing.inversionDetalle || "Inversión por persona con certificación internacional."}
                  </p>
                  <p className="text-[11px] text-amber-300/95 font-medium flex items-center gap-1.5 pt-0.5">
                    <span>⚡</span>
                    <span>Plazas asignadas por riguroso orden de inscripción y verificación de expediente.</span>
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full xl:w-auto shrink-0 pt-1 xl:pt-0">
                  <button
                    onClick={() => irASeccion("inscripcion")}
                    className="flex-1 sm:flex-initial bg-main-red hover:bg-red-800 text-white font-bold text-xs uppercase tracking-widest py-3 px-5 rounded-xl shadow-md hover:shadow-red-900/30 transition-all active:scale-95 text-center cursor-pointer whitespace-nowrap"
                  >
                    Inscríbete Ahora
                  </button>
                  <button
                    onClick={() => irASeccion("programa")}
                    className="flex-1 sm:flex-initial bg-white/15 hover:bg-white/25 text-white font-semibold text-xs uppercase tracking-wider py-3 px-4 rounded-xl border border-white/25 transition-all text-center cursor-pointer whitespace-nowrap"
                  >
                    Ver Programa
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* HUB INTERACTIVO DEL CURSO (REDUCCIÓN VERTICAL DRÁSTICA) */}
      <div id="hub-interactivo" className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* BARRA DE PESTAÑAS PRINCIPAL */}
        <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200 mb-8 flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
          {PESTANAS.map((tab) => {
            const esActivo = seccionActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSeccionActiva(tab.id)}
                className={`flex items-center gap-2 py-2.5 px-4 md:px-5 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all cursor-pointer ${
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
              PESTAÑA 1: SOBRE EL CURSO / LEGADO
             ========================================== */}
          {seccionActiva === "legado" && (
            <div className="space-y-8 animate-fade-in">
              <div className="max-w-3xl">
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

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => irASeccion("programa")}
                  className="bg-main-blue hover:bg-light-blue text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Explorar Programa Académico (5 Días)</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              PESTAÑA 2: PROGRAMA ACADÉMICO (COMPACTO TIMELINE)
             ========================================== */}
          {seccionActiva === "programa" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-main-red block">
                    Plan de Estudios
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-main-blue tracking-tight">
                    Estructura del Programa Día a Día
                  </h2>
                </div>
                <span className="text-xs text-gray-500 font-light">
                  Selecciona una jornada para consultar su contenido detallado
                </span>
              </div>

              {/* LAYOUT EN 2 COLUMNAS: SELECTOR VERTICAL DE DÍAS A LA IZQUIERDA + DETALLE A LA DERECHA */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* SELECTOR VERTICAL DE DÍAS */}
                <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
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
                            {item.dia}
                          </span>
                          <span className="text-[10px] opacity-75">
                            {item.horario?.split('/')[0] || "Intensivo"}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs line-clamp-1 mt-1">
                          {item.titulo}
                        </h4>
                      </button>
                    );
                  })}
                </div>

                {/* DETALLE DEL DÍA SELECCIONADO */}
                <div className="lg:col-span-8 bg-slate-50/80 p-6 md:p-8 rounded-2xl border border-gray-200 shadow-inner">
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
                  onClick={() => irASeccion("destacados")}
                  className="bg-main-blue hover:bg-light-blue text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Ver Ponentes y Destacados</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              PESTAÑA 3: DESTACADOS Y PONENTES
             ========================================== */}
          {seccionActiva === "destacados" && (
            <div className="space-y-6 animate-fade-in">
              <div className="max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-main-red block mb-1">
                  Excelencia Académica
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-main-blue tracking-tight">
                  Destacados del Curso
                </h2>
                <div className="w-12 h-1 bg-main-red my-3 rounded-full" />
                <p className="text-gray-600 font-light text-sm">
                  Metodología de vanguardia basada en casos desclasificados y vinculación con la judicatura europea.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destacados.map((item, index) => {
                  const esUltimoImpar = destacados.length % 2 !== 0 && index === destacados.length - 1;
                  const esCupos = item.titulo?.toLowerCase().includes("cupo") || item.descripcion?.toLowerCase().includes("cupo");
                  return (
                    <div 
                      key={index}
                      className={`p-5 rounded-2xl border transition flex items-start gap-4 ${
                        esUltimoImpar || esCupos
                          ? "md:col-span-2 bg-gradient-to-r from-amber-500/10 via-slate-50 to-rose-500/10 border-amber-300/80 shadow-xs"
                          : "p-5 rounded-2xl border border-gray-100 bg-slate-50/70 hover:bg-white hover:border-main-blue/30 hover:shadow-md"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl shadow-xs ${
                        esCupos || esUltimoImpar ? "bg-amber-500/20 text-amber-900" : "bg-main-blue/10 text-main-blue"
                      }`}>
                        {item.icono === "candado" || esCupos ? "⏳" : index === 0 ? "🎓" : index === 1 ? "📁" : index === 2 ? "🤝" : "📜"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="text-base font-bold text-main-blue">
                            {item.titulo}
                          </h4>
                          {esCupos && (
                            <span className="text-[10px] uppercase font-black tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                              Exclusividad
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 font-light leading-relaxed">
                          {item.descripcion}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => irASeccion("programa")}
                  className="text-gray-500 hover:text-main-blue text-xs font-bold transition cursor-pointer"
                >
                  ← Ver Programa
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
              PESTAÑA 4: SEDE PALERMO
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

                <div className="lg:col-span-6">
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative group">
                    <img
                      src={landing.sedeImagenUrl || palermoDefaultImg}
                      alt="Catedral de Palermo, Sicilia"
                      className="w-full h-64 md:h-80 object-cover group-hover:scale-103 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                      <div>
                        <span className="text-[9px] uppercase font-black tracking-widest text-amber-400 bg-black/50 px-2 py-0.5 rounded">
                          Patrimonio Histórico
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">
                          Catedral de Palermo & Palacio de Justicia
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => irASeccion("destacados")}
                  className="text-gray-500 hover:text-main-blue text-xs font-bold transition cursor-pointer"
                >
                  ← Ver Destacados
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

              {/* CARD DESTACADA DE ESCASEZ Y CUPOS LIMITADOS */}
              <div className="max-w-2xl mx-auto mb-6 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-amber-500/10 border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs text-left flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 text-xl font-bold shadow-xs">
                  ⏳
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950">
                      Cupos Estrictamente Limitados
                    </span>
                    <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                      Convocatoria Reducida
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-700 font-light mt-1 leading-relaxed">
                    Por requerimientos de seguridad institucional y protocolos de acreditación para el ingreso exclusivo al <strong>Palacio de Justicia y Aula Búnker de Palermo</strong>, el cupo de admisión es estrictamente restringido. Las plazas se confirman por riguroso orden de recepción de pagos en línea o solicitudes de transferencia.
                  </p>
                </div>
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

                    {/* FINANCIACIÓN EN CUOTAS */}
                    <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 text-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-sky-950 font-bold">
                          <span>💳</span>
                          <span>Financiación en Cuotas Sin Intereses</span>
                        </div>
                        <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                          0% Recargo
                        </span>
                      </div>
                      <p className="text-sky-900 font-light text-[11px] leading-relaxed">
                        Difiere tu matrícula sin recargo financiero. Por estricto control institucional, <strong>todas las cuotas deben quedar concluidas a más tardar el último día del mes anterior al evento ({landing.fechaLimiteTexto || "30 de abril de 2027"})</strong>. Los planes disponibles se calculan y limitan automáticamente en el formulario según tu fecha de registro.
                      </p>
                    </div>

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

                          {/* CLÁUSULA INFORMATIVA DE PROTECCIÓN DE DATOS - LEY N° 8968 (COSTA RICA) */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-gray-600 leading-relaxed text-left space-y-2">
                            <p className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
                              <span>🛡️</span> Protección de Datos Personales (Ley N° 8968 / Costa Rica)
                            </p>
                            <p className="text-[11px] leading-relaxed">
                              De conformidad con la Ley N° 8968 (Protección de la Persona frente al Tratamiento de sus Datos Personales), se le informa que sus datos personales y de perfil académico serán incorporados a las bases de datos de la <strong>Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)</strong>, Cédula de Persona Jurídica 3-002-671392, con la finalidad exclusiva de remitirle la información bancaria para la reserva de cupo, emitir el expediente del curso y coordinar su participación académica.
                            </p>
                            <p className="text-[11px] leading-relaxed text-gray-500">
                              La entrega de datos es voluntaria, con la consecuencia de que no facilitarlos imposibilita remitirle el expediente bancario e inscribirle. Sus datos no serán cedidos a terceros con fines comerciales o publicitarios. Puede ejercer en cualquier momento sus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) escribiendo a <a href="mailto:contacto@iiresodh.org" className="text-main-blue font-bold hover:underline">contacto@iiresodh.org</a>.
                            </p>
                          </div>

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
