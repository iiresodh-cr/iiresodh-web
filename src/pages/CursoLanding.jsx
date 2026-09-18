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
    precioInversion: "5.000 €",
    inversionDetalle: "Por persona. Incluye sesiones magistrales, visitas de campo, materiales exclusivos y certificación internacional.",
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
      moneda: "Euros (€) y Dólares (USD)",
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

  // Estados del formulario interactivo de registro / solicitud bancaria
  const [formData, setFormData] = useState({
    nombre: "",
    institucion: "",
    email: "",
    telefono: "",
    pais: "Costa Rica",
    comentarios: ""
  });
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [solicitudExitosa, setSolicitudExitosa] = useState(false);
  const [alerta, setAlerta] = useState({ open: false, mensaje: "", tipo: "success" });

  // Tab activo principal del Hub Interactivo del Curso
  const [seccionActiva, setSeccionActiva] = useState("legado"); // 'legado' | 'programa' | 'destacados' | 'sede' | 'inscripcion'

  // Tab activo en la estructura del programa (Días)
  const [diaActivo, setDiaActivo] = useState(0);

  // Escuchar estado de autenticación para administradores
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setEsAdmin(!!user);
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

    setEnviandoSolicitud(true);
    try {
      await addDoc(collection(db, "solicitudesCursos"), {
        cursoId: curso?.id || "palermo-2027",
        cursoTitulo: curso?.titulo || "Curso Internacional 2027 - Palermo",
        ...formData,
        fechaSolicitud: serverTimestamp(),
        estado: "pendiente"
      });

      setSolicitudExitosa(true);
      setAlerta({
        open: true,
        mensaje: "¡Solicitud recibida con éxito! Nuestro departamento académico te contactará a la brevedad con la información solicitada.",
        tipo: "success"
      });
      setFormData({
        nombre: "",
        institucion: "",
        email: "",
        telefono: "",
        pais: "Costa Rica",
        comentarios: ""
      });
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setSolicitudExitosa(true);
      setAlerta({
        open: true,
        mensaje: "Tu solicitud ha sido pre-registrada con éxito. Nuestro equipo te enviará los datos a tu correo.",
        tipo: "success"
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

  if (loading) {
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
  const tieneAccesoVistaPrevia = esPublica || isPreviewParam || esAdmin;

  if (!tieneAccesoVistaPrevia) {
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
          <p className="text-gray-600 font-light leading-relaxed">
            La página oficial y el programa detallado de este curso se encuentran en proceso de configuración editorial y estarán disponibles próximamente.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/cursos"
              className="bg-main-blue hover:bg-light-blue text-white text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
            >
              Volver a Cursos
            </Link>
            <button
              onClick={() => {
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set("preview", "true");
                window.location.href = newUrl.toString();
              }}
              className="border border-gray-300 hover:border-main-blue text-gray-700 hover:text-main-blue text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all cursor-pointer"
            >
              Ver en Modo Vista Previa
            </button>
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
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[11px] uppercase tracking-widest text-amber-300 font-semibold backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Alta Especialización Internacional
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
              <div className="bg-white/10 border border-white/15 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xs">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl md:text-3xl font-black text-amber-400">
                    {landing.precioInversion || "5.000 €"}
                  </span>
                  <span className="text-xs text-gray-300 font-light">
                    {landing.inversionDetalle || "Inversión por persona con certificación internacional."}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => irASeccion("inscripcion")}
                    className="bg-main-red hover:bg-red-800 text-white font-bold text-xs uppercase tracking-widest py-2.5 px-5 rounded-lg shadow-md transition-all active:scale-95 text-center cursor-pointer shrink-0"
                  >
                    Inscríbete Ahora
                  </button>
                  <button
                    onClick={() => irASeccion("programa")}
                    className="bg-white/15 hover:bg-white/25 text-white font-semibold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg border border-white/20 transition-all text-center cursor-pointer shrink-0"
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
                {destacados.map((item, index) => (
                  <div 
                    key={index}
                    className="p-5 rounded-2xl border border-gray-100 bg-slate-50/70 hover:bg-white hover:border-main-blue/30 hover:shadow-md transition flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-main-blue/10 text-main-blue flex items-center justify-center shrink-0 text-xl shadow-xs">
                      {index === 0 ? "🎓" : index === 1 ? "📁" : index === 2 ? "🤝" : "📜"}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-main-blue mb-1">
                        {item.titulo}
                      </h4>
                      <p className="text-xs text-gray-600 font-light leading-relaxed">
                        {item.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
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
              <div className="text-center max-w-2xl mx-auto mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-main-red block mb-1">
                  Reserva Oficial
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-main-blue tracking-tight">
                  Opciones de Inscripción y Pago
                </h2>
                <div className="w-12 h-1 bg-main-red mx-auto my-2 rounded-full" />
                <p className="text-xs text-gray-500 font-light">
                  Cupo limitado a 35 participantes. Admisión mediante acreditación profesional o institucional.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* COLUMNA PAGOS */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 border border-gray-200 p-5 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-main-blue text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded">
                        Inscripción Directa
                      </span>
                      <span className="text-xl font-black text-main-blue">
                        {landing.precioInversion || "5.000 €"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      Pago con Tarjeta (Stripe)
                    </h4>
                    <p className="text-xs text-gray-500 font-light mb-4">
                      Confirmación instantánea con cifrado SSL bancario.
                    </p>

                    <div className="flex items-center gap-2 mb-4 bg-white p-2 rounded-lg border border-gray-200 text-[10px] font-bold">
                      <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded">VISA</span>
                      <span className="bg-red-600 text-white px-1.5 py-0.5 rounded">Mastercard</span>
                      <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded">AMEX</span>
                      <span className="bg-purple-700 text-white px-1.5 py-0.5 rounded">Stripe</span>
                    </div>

                    {landing.enlaceStripe ? (
                      <a
                        href={landing.enlaceStripe}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-xl shadow-xs transition active:scale-95"
                      >
                        Inscribirse vía Stripe
                      </a>
                    ) : (
                      <div className="bg-gray-100 text-gray-500 text-center py-2.5 px-3 rounded-lg text-[11px] font-medium">
                        Pasarela en línea disponible próximamente
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <span>🏛️</span>
                      <span>Transferencia Bancaria Institucional</span>
                    </div>
                    <p className="text-gray-600 font-light text-[11px] leading-relaxed">
                      Para tramitar pagos a través de Poder Judicial, Fiscalía, Universidades o Despachos, emitimos factura proforma oficial y certificado bancario SWIFT/IBAN.
                    </p>
                  </div>
                </div>

                {/* COLUMNA FORMULARIO DE SOLICITUD */}
                <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-md">
                  <h4 className="text-lg font-black text-main-blue tracking-tight mb-1">
                    Solicitud de Datos de Transferencia y Reserva
                  </h4>
                  <p className="text-xs text-gray-500 font-light mb-5">
                    Recibe en tu correo la orden bancaria y expediente académico completo.
                  </p>

                  {solicitudExitosa ? (
                    <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center space-y-3">
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
                        className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-lg transition"
                      >
                        Enviar otra solicitud
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitSolicitud} className="space-y-3">
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
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-main-blue focus:border-main-blue"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                            Institución u Organización
                          </label>
                          <input
                            type="text"
                            value={formData.institucion}
                            onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                            placeholder="Poder Judicial / Fiscalía"
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-main-blue focus:border-main-blue"
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
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-main-blue focus:border-main-blue"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                            Teléfono o WhatsApp
                          </label>
                          <input
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            placeholder="+506 8888-8888"
                            className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-main-blue focus:border-main-blue"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                          País de Residencia
                        </label>
                        <select
                          value={formData.pais}
                          onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                          className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-main-blue bg-white"
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

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Comentarios o Requerimientos Especiales
                        </label>
                        <textarea
                          rows={2}
                          value={formData.comentarios}
                          onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                          placeholder="Requerimientos de facturación institucional, consulta de hospedaje, etc."
                          className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-main-blue resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={enviandoSolicitud}
                        className="w-full bg-main-blue hover:bg-light-blue text-white font-bold text-xs uppercase tracking-widest py-3 px-5 rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {enviandoSolicitud ? (
                          <>
                            <CircularProgress size={14} sx={{ color: "white" }} />
                            <span>Procesando...</span>
                          </>
                        ) : (
                          <span>Enviar Solicitud de Datos Bancarios</span>
                        )}
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* FOOTER INSTITUCIONAL COMPACTO */}
      <footer className="py-8 bg-gray-100 border-t border-gray-200 text-xs text-gray-600">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-bold text-main-blue">IIRESODH</span>
            <span>•</span>
            <span>UNODC Framework</span>
            <span>•</span>
            <span>Palermo 2027</span>
          </div>
          <div>
            <span>Admisiones: formacion@iiresodh.org • Derechos Reservados 2024 – 2027</span>
          </div>
        </div>
      </footer>

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
