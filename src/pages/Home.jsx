// src/pages/Home.jsx
// Página Principal (Home)
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs, where, doc, getDoc } from "firebase/firestore";
import { db, functions } from "../firebase/config";
import { httpsCallable } from "firebase/functions";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules'; 
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

// Iconos Lucide React (Consistentes y elegantes)
import { 
  Scale, 
  Earth, 
  GraduationCap, 
  ArrowRight, 
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  ExternalLink
} from "lucide-react";

// Recursos
import isotipoFondo from "../assets/Isotipo-color-512.webp"; 

// UI Propia
import AdminTextField from "../components/ui/AdminTextField";
import ToastAlert from "../components/ui/ToastAlert";
import AnuncioEmergenteModal from "../components/AnuncioEmergenteModal";

// UI Externa
import { Button, CircularProgress, FormControlLabel, Checkbox, TextField } from "@mui/material";

// IMPORTACIONES PARA i18n Y TRADUCCIÓN DINÁMICA
import { useTranslation } from 'react-i18next';
import { obtenerTextoTraducido } from "../utils/traductorDinamico";

export const formatearTextoConLinksYHashtags = (texto, idiomaActual = 'es') => {
  if (!texto) return "";

  const lang = (idiomaActual || 'es').substring(0, 2).toLowerCase();
  const labelClic = lang === 'en' ? 'Click here' : (lang === 'fr' ? 'Cliquez ici' : 'Clic aquí');

  // Decodificar entidades de comillas y apóstrofes generadas por traductores automáticos o editores
  let procesado = String(texto)
    .replace(/&(?:#39|#039|#x27|apos);/gi, "'")
    .replace(/&(?:quot|#34|#034);/gi, '"')
    .replace(/&amp;#39;/gi, "'")
    .replace(/&amp;apos;/gi, "'")
    .replace(/&amp;quot;/gi, '"');

  const esHtml = /<\/?(p|div|h[1-6]|strong|b|em|i|blockquote|ul|ol|li|br|span|a|iframe|video|img|font)[^>]*>/i.test(procesado);

  if (!esHtml) {
    procesado = procesado.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  } else {
    procesado = procesado
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, "")
      .replace(/\bon\w+\s*=\s*[^>\s]+/gi, "")
      .replace(/javascript:/gi, "");
  }

  const tokens = [];

  // 1. Procesar y proteger enlaces <a> existentes completos
  procesado = procesado.replace(/<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi, (match, attrs, innerText) => {
    const textOnly = innerText.replace(/<[^>]+>/g, '').trim().toLowerCase();
    const isUrl = /^https?:\/\//i.test(textOnly);
    const isClicGeneric = ['clic aquí', 'clic aqui', 'click here', 'cliquez ici'].includes(textOnly);

    let newInner = innerText;
    if (isUrl || isClicGeneric) {
      newInner = labelClic;
    }

    const hrefMatch = attrs.match(/href=(["'])(.*?)\1/i);
    const href = hrefMatch ? hrefMatch[2] : '#';

    const formatted = `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline wrap-break-words">${newInner}</a>`;
    tokens.push(formatted);
    return `\uE000${tokens.length - 1}\uE001`;
  });

  // 2. Proteger todas las demás etiquetas HTML (img, div, b, span, etc.)
  procesado = procesado.replace(/<[^>]+>/g, (match) => {
    tokens.push(match);
    return `\uE000${tokens.length - 1}\uE001`;
  });

  // 3. Procesar Markdown: [Texto visible](URL)
  procesado = procesado.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, url) => {
    const link = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline wrap-break-words">${label}</a>`;
    tokens.push(link);
    return `\uE000${tokens.length - 1}\uE001`;
  });

  // 4. Procesar URLs crudas pegadas en el texto
  procesado = procesado.replace(/(https?:\/\/[^\s<>"'`\uE000\uE001]+)/g, (match, url) => {
    let cleanUrl = url;
    let suffix = '';
    const trailingPunct = /[.,;:)!]+$/;
    const punctMatch = cleanUrl.match(trailingPunct);
    if (punctMatch) {
      suffix = punctMatch[0];
      cleanUrl = cleanUrl.slice(0, -punctMatch[0].length);
    }
    const link = `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline wrap-break-words">${labelClic}</a>${suffix}`;
    tokens.push(link);
    return `\uE000${tokens.length - 1}\uE001`;
  });

  // 5. Procesar Hashtags (debe comenzar con letra y nunca estar precedido por & ni letras/números)
  procesado = procesado.replace(/(^|[^\w&])#([a-zA-ZáéíóúÁÉÍÓÚñÑ][a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]*)/g, (match, prefix, term) => {
    const link = `<a href="/buscar?q=${term}" class="text-light-blue hover:text-main-red font-bold">#${term}</a>`;
    tokens.push(link);
    return `${prefix}\uE000${tokens.length - 1}\uE001`;
  });

  // 6. Restaurar todos los tokens protegidos
  procesado = procesado.replace(/\uE000(\d+)\uE001/g, (_, index) => tokens[Number(index)]);

  // 7. Si no era HTML originalmente, convertir saltos de línea a párrafos
  if (!esHtml) {
    const parrafos = procesado.split(/\n\s*\n/);
    return parrafos.map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`).join('');
  }

  return procesado;
};

// Funciones de caché local (Patrón Stale-While-Revalidate)
// Permite renderizado instantáneo a 0 ms con los datos locales mientras se revalida siempre con Firestore
const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Mantener los datos locales disponibles (hasta 7 días de respaldo) para inicio instantáneo
      if (parsed && parsed.data && (Date.now() - (parsed.timestamp || 0) < 7 * 24 * 60 * 60 * 1000)) {
        return parsed.data;
      }
    }
  } catch (e) { console.error('Cache read error', e); }
  return null;
};
const setCachedData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch (e) { console.error('Cache write error', e); }
};

// Precargar de inmediato en el navegador la imagen destacada guardada en caché para despliegue instantáneo
if (typeof document !== "undefined") {
  const cached = getCachedData('home_noticias');
  if (cached && cached[0] && cached[0].imagenPrincipalUrl) {
    let existingPreload = document.querySelector('link[rel="preload"][as="image"]#hero-preload');
    if (!existingPreload) {
      existingPreload = document.createElement("link");
      existingPreload.id = "hero-preload";
      existingPreload.rel = "preload";
      existingPreload.as = "image";
      existingPreload.fetchPriority = "high";
      existingPreload.href = cached[0].imagenPrincipalUrl;
      document.head.appendChild(existingPreload);
    }
  }
}

const formatearFecha = (fecha, idioma = 'es') => {
  if (!fecha) return "";
  try {
    const dateObj = fecha.toDate ? fecha.toDate() : new Date(fecha);
    if (isNaN(dateObj.getTime())) return "";
    return dateObj.toLocaleDateString(idioma || 'es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return "";
  }
};

export default function Home() {
  const { t, i18n } = useTranslation(); 
  const navigate = useNavigate();
  const location = useLocation();

  const cachedNoticias = getCachedData('home_noticias');
  const [noticias, setNoticias] = useState(cachedNoticias || []);
  const [loading, setLoading] = useState(!cachedNoticias);
  
  const [contacto, setContacto] = useState({ nombre: "", correo: "", mensaje: "" });
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [estadoEnvio, setEstadoEnvio] = useState("idle");

  const [tituloHome, setTituloHome] = useState(() => {
    return getCachedData('home_titulo') || {
      tituloPrincipal: "",
      tituloPrincipal_en: "",
      tituloPrincipal_fr: ""
    };
  });

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, [location]);

  useEffect(() => {
    const fetchConfiguracionVisual = async () => {
      try {
        const docRef = doc(db, "configuracion", "home_visual");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTituloHome(data);
          setCachedData('home_titulo', data);
        }
      } catch (e) {
        console.error("Error fetching configuracion", e);
      }
    };

    const fetchNoticias = async () => {
      try {
        const qPersistentes = query(collection(db, "noticias"), where("persistente", "==", true));
        const qRecientes = query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"), limit(12));

        // Ejecución en paralelo: evita esperar dos viajes de ida y vuelta a Firestore
        const [snapPersistentes, snapRecientes] = await Promise.all([
          getDocs(qPersistentes),
          getDocs(qRecientes)
        ]);

        const noticiasFijas = snapPersistentes.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 3);
        const idsFijas = new Set(noticiasFijas.map(n => n.id));
        const faltantes = Math.max(0, 8 - noticiasFijas.length);
        const noticiasRecientes = snapRecientes.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(n => !idsFijas.has(n.id))
          .slice(0, faltantes);
        
        const finalNoticias = [...noticiasFijas, ...noticiasRecientes];
        setNoticias(finalNoticias);
        setCachedData('home_noticias', finalNoticias);

        // Preload para la imagen principal de la lista actualizada
        const firstNews = finalNoticias[0];
        if (firstNews && firstNews.imagenPrincipalUrl) {
          let preloadLink = document.querySelector('link[rel="preload"][as="image"]#hero-preload');
          if (!preloadLink) {
            preloadLink = document.createElement("link");
            preloadLink.id = "hero-preload";
            preloadLink.rel = "preload";
            preloadLink.as = "image";
            preloadLink.fetchPriority = "high";
            document.head.appendChild(preloadLink);
          }
          preloadLink.href = firstNews.imagenPrincipalUrl;
        }
      } catch (e) { 
        console.error("Error al obtener noticias:", e); 
      } finally { 
        setLoading(false); 
      }
    };

    fetchNoticias();
    fetchConfiguracionVisual();
  }, []);

  const handleEnviarContacto = async (e) => {
    e.preventDefault();
    if (!aceptaPrivacidad) return;

    setEstadoEnvio("enviando");
    try {
      const enviarCorreo = httpsCallable(functions, 'enviarFormularioContacto');
      await enviarCorreo({
        ...contacto,
        consentimientoPrivacidad: true,
        fechaConsentimiento: new Date().toISOString(),
        marcoLegal: "Ley N° 8968 - Costa Rica"
      });
      setEstadoEnvio("exito");
      setContacto({ nombre: "", correo: "", mensaje: "" });
      setAceptaPrivacidad(false);
      setTimeout(() => setEstadoEnvio("idle"), 5000);
    } catch (error) {
      console.error("Error sending email:", error);
      setEstadoEnvio("error");
      setTimeout(() => setEstadoEnvio("idle"), 5000);
    }
  };

  // Noticia 0 se muestra como portada en el Hero principal
  const noticiaDestacada = noticias.length > 0 ? noticias[0] : null;
  const tituloDestacado = noticiaDestacada ? obtenerTextoTraducido(noticiaDestacada, 'titulo', i18n.language) : "";

  // Excluimos la noticia 0 del carrusel y de la lista lateral para no repetir contenido
  const noticiasSinHero = noticias.slice(1);
  const noticiasCarrusel = noticiasSinHero.length > 2 
    ? noticiasSinHero.slice(0, 2) 
    : (noticiasSinHero.length > 0 ? noticiasSinHero : (noticiaDestacada ? [noticiaDestacada] : []));
  const noticiasLista = noticiasSinHero.length > 2 
    ? noticiasSinHero.slice(2, 6) 
    : (noticiasSinHero.length > 0 ? noticiasSinHero : []);

  return (
    <main className="bg-gradient-to-b from-white via-[#FAFBFD] to-[#FAFBFD] flex flex-col min-h-screen font-sans overflow-x-hidden selection:bg-red-500 selection:text-white">
      
      <div className="relative grow">
        
        {/* Iluminación ambiental y sutil de fondo (sin texturas recargadas) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-40 [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_100%)]">
          <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-red-100/40 rounded-full blur-[120px]"></div>
          <div className="absolute top-20 right-10 w-[450px] h-[450px] bg-blue-100/40 rounded-full blur-[140px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-4 md:pt-8 pb-14 flex flex-col gap-10 md:gap-12">
          
          {/* ==============================================================
              SECCIÓN 1: HERO INSTITUCIONAL ELEGANTE
          ============================================================== */}
          <section className="relative pt-2 pb-2">
            
            {/* Isotipo institucional sutil como sello de fondo */}
            <div className="absolute top-0 right-10 -mt-12 opacity-[0.035] pointer-events-none hidden lg:block select-none">
              <img src={isotipoFondo} alt="" fetchPriority="high" className="w-[520px] object-contain" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Columna Izquierda: Mensaje Central */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                
                {/* Kicker institucional refinado */}
                <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-xs mb-4">
                  <span className="w-2 h-2 rounded-full bg-main-red"></span>
                  <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-700">
                    {t('home.hero_badge', 'Instituto Internacional de Responsabilidad Social y Derechos Humanos')}
                  </span>
                </div>

                {/* Titular Principal de Alto Impacto Editorial */}
                <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-[3.75rem] font-black text-[#0B1E40] leading-[1.08] mb-4 tracking-tight">
                  {obtenerTextoTraducido(tituloHome, 'tituloPrincipal', i18n.language) || (
                    <>
                      <span>{t('home.hero_titulo_1', 'Defendiendo la')}</span>{' '}
                      <span>{t('home.hero_titulo_2', 'dignidad y los')}</span>{' '}
                      <span className="relative inline-block text-main-blue">
                        {t('home.hero_titulo_3', 'Derechos Humanos')}
                        <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-main-red rounded-full opacity-80"></span>
                      </span>
                    </>
                  )}
                </h1>
                
                {/* Subtítulo con respiración y peso visual equilibrado */}
                <p className="text-base md:text-lg text-slate-600 font-normal mb-6 leading-relaxed max-w-2xl">
                  {t('home.hero_subtitulo', 'Fomentamos el cumplimiento de estándares internacionales mediante la participación ciudadana y gubernamental.')}
                </p>
                
                {/* Botones de Acción Primarios */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link 
                    to="/incidencia-internacional" 
                    className="inline-flex items-center justify-center gap-2.5 bg-main-red hover:bg-[#9E2427] text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 text-center uppercase tracking-widest text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>{t('home.btn_incidencia', 'Incidencia Internacional')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link 
                    to="/noticias" 
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-main-blue hover:text-main-red border border-slate-200 hover:border-slate-300 font-bold py-4 px-8 rounded-xl transition-all duration-200 text-center uppercase tracking-widest text-xs shadow-xs hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>{t('home.btn_noticias', 'Noticias y Análisis')}</span>
                  </Link>
                </div>
              </div>

              {/* Columna Derecha: Tarjeta Editorial de Noticia Destacada */}
              <div className="lg:col-span-5 relative">
                {noticiaDestacada ? (
                  <Link 
                    to={`/noticias/${noticiaDestacada.slug || noticiaDestacada.id}`} 
                    state={{ noticiaPreCargada: noticiaDestacada }}
                    className="group relative block w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white transition-all duration-500 hover:shadow-2xl hover:border-slate-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                      {noticiaDestacada.imagenPrincipalUrl ? (
                        <img 
                          src={noticiaDestacada.imagenPrincipalUrl} 
                          alt={tituloDestacado || "Noticia destacada"}
                          fetchPriority="high"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200" />
                      )}
                      
                      {/* Viñeta degradada para legibilidad perfecta */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E40] via-[#0B1E40]/40 to-transparent opacity-95 pointer-events-none"></div>

                      {/* Badge Superior */}
                      <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                        <span className="bg-white/90 backdrop-blur-md text-[#0B1E40] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                          {t('home.publicacion_reciente', 'Publicación Reciente')}
                        </span>
                      </div>

                      {/* Información en la parte inferior */}
                      <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 z-10 text-white flex flex-col justify-end">
                        {noticiaDestacada.tags && noticiaDestacada.tags.length > 0 && (
                          <span className="text-red-300 text-xs font-bold uppercase tracking-wider mb-2 block">
                            {noticiaDestacada.tags[0]}
                          </span>
                        )}
                        <h2 className="text-xl md:text-2xl font-bold leading-snug line-clamp-3 mb-4 group-hover:text-red-200 transition-colors">
                          {tituloDestacado}
                        </h2>
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                          <span>{t('home.leer_articulo', 'Leer análisis completo')}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-main-red" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="w-full max-w-md mx-auto aspect-[4/5] bg-slate-200/80 rounded-3xl animate-pulse shadow-xl border border-slate-200"></div>
                )}
              </div>

            </div>
          </section>

          {/* ==============================================================
              SECCIÓN 2: ACTUALIDAD Y COMUNICADOS (CARRUSEL CINEMATOGRÁFICO)
          ============================================================== */}
          <section id="noticias-recientes" className="scroll-mt-20 relative pt-2 border-t border-slate-200/60">
            
            {/* Cabecera de la Sección */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 pt-6">
              <div>
                <span className="text-main-red font-bold text-xs tracking-[0.25em] uppercase mb-1.5 block">
                  {t('home.comunicados_oficiales', 'Comunicados Oficiales')}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-main-blue tracking-tight">
                  {t('home.seccion_actualidad', 'Actualidad Institucional')}
                </h2>
              </div>
              
              <Link 
                to="/noticias" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-main-red uppercase tracking-wider py-1.5 px-3.5 rounded-lg border border-slate-200 hover:border-main-red transition-all self-start sm:self-auto bg-white shadow-2xs"
              >
                <span>{t('home.archivo_noticias', 'Archivo de Noticias')}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 h-[400px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
                <div className="lg:col-span-5 h-[400px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
              </div>
            ) : noticias.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* COLUMNA IZQUIERDA: CARRUSEL DESTACADO */}
                <div className="lg:col-span-7 relative group flex flex-col">
                  <Swiper 
                    modules={[Autoplay, EffectFade, Navigation, Pagination]} 
                    effect="fade"
                    fadeEffect={{ crossFade: true }}
                    autoplay={{ delay: 7500, disableOnInteraction: false, pauseOnMouseEnter: true }} 
                    loop={noticiasCarrusel.length > 1}
                    speed={1000}
                    navigation={{
                      prevEl: '.swiper-btn-prev-home2',
                      nextEl: '.swiper-btn-next-home2',
                    }}
                    pagination={{
                      clickable: true,
                      bulletClass: 'swiper-custom-bullet',
                      bulletActiveClass: 'swiper-custom-bullet-active',
                    }}
                    className="w-full h-full min-h-[380px] md:min-h-[420px] rounded-2xl overflow-hidden shadow-md border border-slate-200/90"
                  >
                    {noticiasCarrusel.map((noticia) => {
                      const tituloTraducido = obtenerTextoTraducido(noticia, 'titulo', i18n.language);
                      const resumenTraducido = obtenerTextoTraducido(noticia, 'resumen', i18n.language);
                      const fechaStr = formatearFecha(noticia.fechaPublicacion, i18n.language);

                      return (
                        <SwiperSlide key={noticia.id}>
                          <article 
                            className="group/slide relative w-full h-full min-h-[380px] md:min-h-[420px] overflow-hidden bg-[#0B1E40] cursor-pointer flex flex-col justify-end"
                            onClick={() => navigate(`/noticias/${noticia.slug || noticia.id}`, { state: { noticiaPreCargada: noticia } })}
                          >
                            {/* Fotografía de Fondo con Zoom Suave */}
                            {noticia.imagenPrincipalUrl ? (
                              <img 
                                src={noticia.imagenPrincipalUrl}
                                alt={tituloTraducido || "Imagen de la noticia"}
                                decoding="async"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-3000 ease-out group-hover/slide:scale-105"
                              />
                            ) : (
                              <div className="absolute inset-0 w-full h-full bg-[#0B1E40]" />
                            )}
                            
                            {/* Doble Degradado Cinematográfico */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E40] via-[#0B1E40]/75 to-transparent pointer-events-none"></div>

                            {/* Contenido Editorial con Tipografía Impecable */}
                            <div className="relative p-6 md:p-8 z-10 text-white flex flex-col justify-end max-w-2xl">
                              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                                {noticia.tags && noticia.tags[0] && (
                                  <span className="bg-main-red/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    {noticia.tags[0]}
                                  </span>
                                )}
                                {fechaStr && (
                                  <span className="text-slate-300 text-xs font-medium">
                                    {fechaStr}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-2 leading-snug tracking-tight group-hover/slide:text-red-200 transition-colors line-clamp-3">
                                {tituloTraducido}
                              </h3>

                              <p className="text-slate-200 line-clamp-2 mb-3.5 text-xs sm:text-sm font-light leading-relaxed">
                                {resumenTraducido}
                              </p>
                              
                              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 text-xs font-bold text-white bg-main-red hover:bg-[#9E2427] rounded-lg uppercase tracking-widest transition-all shadow-md group-hover/slide:translate-x-1">
                                <span>{t('home.leer_articulo', 'Leer comunicado')}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </article>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>

                  {/* Botones de Navegación del Carrusel */}
                  {noticiasCarrusel.length > 1 && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
                      <button 
                        className="swiper-btn-prev-home2 w-8 h-8 bg-white/90 hover:bg-white text-main-blue hover:text-main-red backdrop-blur-md rounded-full shadow-md border border-slate-200/80 transition-all flex items-center justify-center cursor-pointer active:scale-95" 
                        aria-label="Ver noticia anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        className="swiper-btn-next-home2 w-8 h-8 bg-white/90 hover:bg-white text-main-blue hover:text-main-red backdrop-blur-md rounded-full shadow-lg border border-slate-200/80 transition-all flex items-center justify-center cursor-pointer active:scale-95" 
                        aria-label="Ver siguiente noticia"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* COLUMNA DERECHA: LISTADO DE NOTICIAS RECIENTES */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-main-red"></span>
                        <h4 className="text-xs font-black tracking-widest uppercase text-slate-700">
                          Otras Publicaciones Recientes
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        {noticiasLista.length} notas
                      </span>
                    </div>

                    <div className="flex flex-col divide-y divide-slate-100">
                      {noticiasLista.map((item) => {
                        const tituloItem = obtenerTextoTraducido(item, 'titulo', i18n.language);
                        const fechaItem = formatearFecha(item.fechaPublicacion, i18n.language);

                        return (
                          <Link 
                            key={item.id}
                            to={`/noticias/${item.slug || item.id}`}
                            state={{ noticiaPreCargada: item }}
                            className="group py-2.5 first:pt-1 last:pb-0 flex items-start gap-3 transition-colors"
                          >
                            <div className="grow min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {item.tags && item.tags[0] && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-main-red">
                                    {item.tags[0]}
                                  </span>
                                )}
                                {fechaItem && (
                                  <span className="text-[11px] text-slate-400">
                                    • {fechaItem}
                                  </span>
                                )}
                              </div>
                              <h5 className="text-xs sm:text-sm font-bold text-main-blue group-hover:text-main-red leading-snug line-clamp-2 transition-colors">
                                {tituloItem}
                              </h5>
                            </div>

                            {item.imagenPrincipalUrl && (
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 mt-0.5">
                                <img 
                                  src={item.imagenPrincipalUrl} 
                                  alt="" 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  decoding="async"
                                />
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <Link 
                      to="/noticias" 
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-main-red border border-slate-200/80 hover:border-red-200 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <span>{t('home.ver_todas_publicaciones', 'Ver todas las publicaciones')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            ) : null}
          </section>

          {/* ==============================================================
              SECCIÓN 3: NUESTRA LABOR (3 PILARES INSTITUCIONALES DEDICADOS)
          ============================================================== */}
          <section id="nuestra-labor" className="relative pt-2 border-t border-slate-200/60">
            
            {/* Encabezado Centrado de Alto Nivel */}
            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10 pt-6">
              <span className="text-main-red font-bold text-xs tracking-[0.28em] uppercase mb-2 block">
                {t('home.nuestra_labor', 'Áreas de Acción')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-main-blue tracking-tight mb-3">
                {t('home.que_hacemos_titulo', '¿Qué hacemos en IIRESODH?')}
              </h2>
              <p className="text-slate-600 text-sm md:text-base font-light leading-relaxed">
                {t('home.que_hacemos_subtitulo', 'Combinamos acción jurídica, cooperación técnica y formación académica para generar un impacto real en la sociedad.')}
              </p>
            </div>

            {/* Grid Equilibrado de 3 Columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              
              {/* Tarjeta 1: Litigio Estratégico */}
              <Link to="/litigio-estrategico" className="group flex">
                <article className="w-full bg-white p-6 md:p-8 pl-7 md:pl-9 rounded-r-2xl rounded-l-none border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                  {/* Borde izquierdo que se colorea */}
                  <div className="absolute left-0 inset-y-0 w-1.5 bg-slate-200/70"></div>
                  <div className="absolute left-0 inset-y-0 w-1.5 bg-main-red transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100/80 text-main-red flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                      <Scale className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 block mb-1.5">
                      {t('home.accion_juridica', 'Acción Jurídica')}
                    </span>
                    
                    <h3 className="text-xl font-bold text-main-blue mb-2.5 group-hover:text-main-red transition-colors">
                      {t('home.litigio_titulo', 'Litigio Estratégico')}
                    </h3>
                    
                    <p className="text-slate-600 font-normal text-sm leading-relaxed mb-6">
                      {t('home.litigio_desc', 'Defensa jurídica ante tribunales internacionales para sentar precedentes en la protección de derechos.')}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-main-red uppercase tracking-wider group-hover:translate-x-1 transition-transform pt-3 border-t border-slate-100">
                    <span>{t('home.mas_informacion', 'Más Información')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </article>
              </Link>

              {/* Tarjeta 2: Incidencia Internacional */}
              <Link to="/incidencia-internacional" className="group flex">
                <article className="w-full bg-white p-6 md:p-8 pl-7 md:pl-9 rounded-r-2xl rounded-l-none border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                  {/* Borde izquierdo que se colorea */}
                  <div className="absolute left-0 inset-y-0 w-1.5 bg-slate-200/70"></div>
                  <div className="absolute left-0 inset-y-0 w-1.5 bg-main-blue transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100/80 text-main-blue flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                      <Earth className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 block mb-1.5">
                      {t('home.cooperacion_derechos', 'Cooperación y Derechos')}
                    </span>

                    <h3 className="text-xl font-bold text-main-blue mb-2.5 group-hover:text-main-blue transition-colors">
                      {t('home.incidencia_titulo', 'Incidencia Internacional')}
                    </h3>
                    
                    <p className="text-slate-600 font-normal text-sm leading-relaxed mb-6">
                      {t('home.incidencia_desc', 'Investigaciones, informes de impacto y documentos de litigio estratégico.')}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-main-blue uppercase tracking-wider group-hover:translate-x-1 transition-transform pt-3 border-t border-slate-100">
                    <span>{t('home.explorar_pais', 'Explorar trabajo por país')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </article>
              </Link>

              {/* Tarjeta 3: Formación Especializada */}
              <Link to="/cursos" className="group flex">
                <article className="w-full bg-white p-6 md:p-8 pl-7 md:pl-9 rounded-r-2xl rounded-l-none border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                  {/* Borde izquierdo que se colorea */}
                  <div className="absolute left-0 inset-y-0 w-1.5 bg-slate-200/70"></div>
                  <div className="absolute left-0 inset-y-0 w-1.5 bg-slate-700 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                      <GraduationCap className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 block mb-1.5">
                      {t('home.excelencia_academica', 'Excelencia Académica')}
                    </span>

                    <h3 className="text-xl font-bold text-main-blue mb-2.5 group-hover:text-slate-800 transition-colors">
                      {t('home.formacion_titulo', 'Formación Especializada')}
                    </h3>
                    
                    <p className="text-slate-600 font-normal text-sm leading-relaxed mb-6">
                      {t('home.formacion_desc', 'Certificaciones y programas académicos diseñados para los líderes del cambio social.')}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider group-hover:translate-x-1 transition-transform pt-3 border-t border-slate-100">
                    <span>{t('home.ver_catalogo', 'Ver catálogo de formación')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </article>
              </Link>

            </div>
          </section>

          {/* ==============================================================
              SECCIÓN 4: CONTACTO INSTITUCIONAL Y CONSULTAS
          ============================================================== */}
          <section id="contacto" className="relative pt-2 border-t border-slate-200/60">
            <div className="bg-gradient-to-br from-white via-slate-50/70 to-slate-100/80 rounded-r-3xl rounded-l-none border border-slate-200/80 p-6 sm:p-10 lg:p-12 pl-8 sm:pl-12 lg:pl-14 shadow-md mt-6 relative overflow-hidden">
              {/* Franja izquierda roja institucional */}
              <div className="absolute left-0 inset-y-0 w-2 bg-main-red"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                
                {/* Columna Izquierda: Información de Contacto y Confidencialidad */}
                <div className="lg:col-span-5 flex flex-col">
                  <span className="text-main-red font-bold text-xs tracking-[0.25em] uppercase mb-2 block">
                    {t('home.canal_oficial', 'Canal Oficial de Enlace')}
                  </span>
                  
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-main-blue tracking-tight mb-3">
                    {t('home.contacto_titulo', '¿Hablamos?')}
                  </h2>
                  
                  <p className="text-slate-600 font-light text-sm md:text-base leading-relaxed mb-6">
                    {t('home.contacto_subtitulo', 'Estamos aquí para colaborar y responder tus dudas. Nuestro equipo atenderá su consulta a la brevedad posible.')}
                  </p>

                  {/* Datos Institucionales Directos */}
                  <div className="flex flex-col gap-4 pt-5 border-t border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-main-blue flex items-center justify-center shrink-0 shadow-2xs">
                        <MapPin className="w-4 h-4 text-main-red" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                          {t('home.sede_label', 'Sede Internacional')}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-main-blue">
                          {t('home.sede_valor', 'San José, Costa Rica')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-main-blue flex items-center justify-center shrink-0 shadow-2xs">
                        <Mail className="w-4 h-4 text-main-blue" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                          {t('home.correo_label', 'Correo Electrónico')}
                        </span>
                        <a href="mailto:contacto@iiresodh.org" className="text-xs sm:text-sm font-semibold text-main-blue hover:text-main-red transition-colors">
                          contacto@iiresodh.org
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-main-blue flex items-center justify-center shrink-0 shadow-2xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                          {t('home.proteccion_datos_label', 'Protección de Datos')}
                        </span>
                        <span className="text-xs text-slate-500 leading-snug">
                          {t('home.proteccion_datos_desc', 'Tratamiento estrictamente confidencial bajo la Ley N° 8968.')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Formulario Limpio y Pulido con Fondo Azul */}
                <div className="lg:col-span-7">
                  <div className="bg-main-blue p-6 sm:p-8 rounded-2xl border border-slate-800/30 shadow-lg">
                    
                    <ToastAlert 
                      open={estadoEnvio === "exito"} 
                      message={t('home.msg_exito', '¡Mensaje enviado con éxito!')} 
                      isError={false} 
                      onClose={() => setEstadoEnvio("idle")} 
                    />
                    <ToastAlert 
                      open={estadoEnvio === "error"} 
                      message={t('home.msg_error', 'Ocurrió un error al enviar el mensaje.')} 
                      isError={true} 
                      onClose={() => setEstadoEnvio("idle")} 
                    />
                    
                    <form onSubmit={handleEnviarContacto} className="flex flex-col gap-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TextField 
                          label={t('home.form_nombre', 'Nombre completo')} 
                          required 
                          fullWidth
                          variant="outlined"
                          value={contacto.nombre} 
                          onChange={(e) => setContacto({...contacto, nombre: e.target.value})} 
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#FFFFFF',
                              borderRadius: '12px',
                              '& fieldset': { borderColor: '#E2E8F0' },
                              '&:hover fieldset': { borderColor: '#CBD5E1' },
                              '&.Mui-focused fieldset': { borderColor: '#B92F32' },
                            },
                            '& .MuiInputLabel-root': { color: '#64748B' },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#B92F32' },
                          }}
                        />
                        <TextField 
                          label={t('home.form_email', 'Correo institucional o personal')} 
                          type="email" 
                          required 
                          fullWidth
                          variant="outlined"
                          value={contacto.correo} 
                          onChange={(e) => setContacto({...contacto, correo: e.target.value})} 
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#FFFFFF',
                              borderRadius: '12px',
                              '& fieldset': { borderColor: '#E2E8F0' },
                              '&:hover fieldset': { borderColor: '#CBD5E1' },
                              '&.Mui-focused fieldset': { borderColor: '#B92F32' },
                            },
                            '& .MuiInputLabel-root': { color: '#64748B' },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#B92F32' },
                          }}
                        />
                      </div>
                      
                      <TextField 
                        label={t('home.form_mensaje', 'Mensaje o consulta')} 
                        required 
                        multiline 
                        rows={4} 
                        fullWidth
                        variant="outlined"
                        value={contacto.mensaje} 
                        onChange={(e) => setContacto({...contacto, mensaje: e.target.value})} 
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            '& fieldset': { borderColor: '#E2E8F0' },
                            '&:hover fieldset': { borderColor: '#CBD5E1' },
                            '&.Mui-focused fieldset': { borderColor: '#B92F32' },
                          },
                          '& .MuiInputLabel-root': { color: '#64748B' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#B92F32' },
                        }}
                      />
                      
                      {/* Consentimiento Legal */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={aceptaPrivacidad}
                              onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                              sx={{
                                color: '#94A3B8',
                                '&.Mui-checked': { color: '#1D3557' },
                              }}
                            />
                          }
                          label={
                            <span className="text-xs font-medium text-slate-700 leading-snug">
                              {t('home.acepto_privacidad_1', 'He leído y autorizo el tratamiento de mis datos de conformidad con la')}{' '}
                              <a 
                                href="/privacidad" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-main-blue font-bold hover:underline"
                              >
                                {t('home.acepto_privacidad_link', 'Política de Privacidad')}
                              </a>.
                            </span>
                          }
                          sx={{ m: 0, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { mt: '2px' } }}
                        />
                      </div>

                      {/* Botón de Envío */}
                      <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={estadoEnvio === "enviando" || !aceptaPrivacidad} 
                        sx={{ 
                          py: 1.75, 
                          width: '100%', 
                          borderRadius: '12px', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.12em', 
                          fontSize: '0.8rem',
                          backgroundColor: '#B92F32',
                          color: '#FFFFFF',
                          '&:hover': {
                            backgroundColor: '#9E2427',
                          },
                          '&.Mui-disabled': {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            color: 'rgba(255, 255, 255, 0.4)',
                          },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1.5
                        }}
                      >
                        {estadoEnvio === "enviando" ? (
                          <>
                            <CircularProgress size={18} thickness={5} sx={{ color: 'inherit' }} />
                            {t('home.btn_enviando', 'Enviando...')}
                          </>
                        ) : (
                          t('home.btn_enviar', 'Enviar Mensaje Institucional')
                        )}
                      </Button>
                    </form>
                  </div>
                </div>

              </div>

            </div>
          </section>

        </div>
      </div>

      {/* Ventana Emergente oficial idéntica al Home */}
      <AnuncioEmergenteModal />
    </main>
  );
}
