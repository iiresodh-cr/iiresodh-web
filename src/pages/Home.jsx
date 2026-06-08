// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs, where, doc, getDoc } from "firebase/firestore";
import { db, functions } from "../firebase/config";
import { httpsCallable } from "firebase/functions";
import { Link, useNavigate } from "react-router-dom";

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules'; 
import 'swiper/css';
import 'swiper/css/effect-fade';

// Iconos Lucide React (Grosor de línea unificado para coherencia)
import { Scale, Earth, GraduationCap } from "lucide-react";

// Imágenes y Recursos
import isotipoFondo from "../assets/Isotipo-color-512.webp"; 

// UI Propia
import AdminTextField from "../components/ui/AdminTextField";
import ToastAlert from "../components/ui/ToastAlert";

// UI Externa
import { Button, Paper, CircularProgress } from "@mui/material";

// IMPORTACIONES PARA i18n Y TRADUCCIÓN DINÁMICA
import { useTranslation } from 'react-i18next';
import { obtenerTextoTraducido } from "../utils/traductorDinamico";

export const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  let procesado = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const linksGuardados = []; 
  processed = procesado.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, url) => {
    linksGuardados.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline wrap-break-words">${label}</a>`);
    return `__LINK_${linksGuardados.length - 1}__`; 
  });
  procesado = procesado.replace(/(https?:\/\/[^\s]+)/g, (match, url) => {
    if (url.includes("__LINK_")) return match; 
    const textoFijo = "clic aquí";
    linksGuardados.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline wrap-break-words">${textoFijo}</a>`);
    return `__LINK_${linksGuardados.length - 1}__`; 
  });
  procesado = procesado.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (match) => {
    const term = match.substring(1);
    return `<a href="/buscar?q=${term}" class="text-light-blue hover:text-main-red font-bold">${match}</a>`;
  });
  procesado = procesado.replace(/__LINK_(\d+)__/g, (match, i) => linksGuardados[i]);
  const parrafos = procesado.split(/\n\s*\n/);
  return parrafos.map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`).join('');
};

export default function Home() {
  const { t, i18n } = useTranslation(); 
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contacto, setContacto] = useState({ nombre: "", correo: "", mensaje: "" });
  const [estadoEnvio, setEstadoEnvio] = useState("idle");
  const [cifrasImpacto, setCifrasImpacto] = useState({
    cifra1: "", texto1: "",
    cifra2: "", texto2: "",
    cifra3: "", texto3: ""
  });

  useEffect(() => {
    const fetchCifras = async () => {
      try {
        const docRef = doc(db, "configuracion", "home_impacto");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCifrasImpacto(docSnap.data());
        }
      } catch (e) {
        console.error("Error fetching cifras", e);
      }
    };

    const fetchNoticias = async () => {
      try {
        const qPersistentes = query(collection(db, "noticias"), where("persistente", "==", true));
        const snapPersistentes = await getDocs(qPersistentes);
        let noticiasFijas = snapPersistentes.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 3);
        
        let noticiasRecientes = [];
        const faltantes = 3 - noticiasFijas.length;
        if (faltantes > 0) {
          const qRecientes = query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"), limit(10));
          const snapRecientes = await getDocs(qRecientes);
          const idsFijas = noticiasFijas.map(n => n.id);
          noticiasRecientes = snapRecientes.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(n => !idsFijas.includes(n.id))
            .slice(0, faltantes);
        }
        setNoticias([...noticiasFijas, ...noticiasRecientes]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchNoticias();
    fetchCifras();
  }, []);

  const handleEnviarContacto = async (e) => {
    e.preventDefault();
    setEstadoEnvio("enviando");
    try {
      const enviarCorreo = httpsCallable(functions, 'enviarFormularioContacto');
      await enviarCorreo(contacto);
      setEstadoEnvio("exito");
      setContacto({ nombre: "", correo: "", mensaje: "" });
      setTimeout(() => setEstadoEnvio("idle"), 5000);
    } catch (error) {
      console.error("Error sending email:", error);
      setEstadoEnvio("error");
      setTimeout(() => setEstadoEnvio("idle"), 5000);
    }
  };

  return (
    <main className="bg-white flex flex-col min-h-screen font-sans overflow-x-hidden">
      <div className="relative grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <div className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-4 md:pt-12 pb-16 flex flex-col gap-16 md:gap-20">
          
          {/* =========================================
              BLOQUE 1: HERO SECTION
          ========================================= */}
          <section className="relative pt-2 pb-4 lg:pt-6 lg:pb-8 overflow-visible animate-fade-in-up">
            <div className="absolute top-0 right-0 -mr-24 -mt-16 opacity-10 pointer-events-none hidden md:block">
              <img src={isotipoFondo} alt="" fetchPriority="high" className="w-160 object-cover" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center text-left">
              <div className="lg:col-span-8 max-w-4xl">
                {/* SOLUCIÓN: El problema de las palabras unidas (como "ladignidad")
                    se debe a que i18next concatena las partes y React no añade
                    espacios automáticamente. La solución más robusta es insertar un
                    fragmento de espacio vacío ({' '}) entre cada parte. Esto garantiza
                    un espacio correcto independientemente de si los archivos de
                    traducción (.json) lo tienen o no. He usado un max-w-3xl para
                    controlar el diseño de forma fluida sin romper la semántica de i18n. */}
                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-[#0B1E40] leading-[1.05] mb-6 tracking-tighter max-w-3xl">
                  {t('home.hero_titulo_1', 'Defendiendo la')}
                  {' '}
                  {t('home.hero_titulo_2', 'dignidad y los')}
                  {' '}
                  {t('home.hero_titulo_3', 'Derechos Humanos')}
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 font-light mb-10 leading-relaxed max-w-2xl">
                  {t('home.hero_subtitulo', 'Fomentamos el cumplimiento de estándares internacionales mediante la participación ciudadana y gubernamental.')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/incidencia-internacional" className="bg-[#B91C1C] text-white font-bold py-3.5 px-8 rounded-lg hover:bg-red-800 transition-all text-center uppercase tracking-widest text-xs shadow-md">
                    {t('home.btn_incidencia', 'Incidencia Internacional')}
                  </Link>
                  <Link to="/noticias" className="bg-white text-main-blue border border-gray-200 font-bold py-3.5 px-8 rounded-lg hover:border-main-red hover:text-main-red transition-all text-center uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-sm">
                    {t('home.btn_noticias', 'Noticias')} &rarr;
                  </Link>
                </div>
              </div>

              {/* Cifras de Impacto */}
              <div className="lg:col-span-4 lg:flex justify-end relative z-20 mt-8 lg:mt-0">
                <Paper elevation={0} className="w-full bg-white/60 backdrop-blur-md border border-white/50 p-8 md:p-10 flex flex-col gap-8 shadow-lg text-right" sx={{ borderRadius: '24px' }}>
                  <div>
                    <span className="block text-4xl font-black text-[#B91C1C] mb-1">{cifrasImpacto.cifra1}</span>
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-500">{obtenerTextoTraducido(cifrasImpacto, 'texto1', i18n.language)}</span>
                  </div>
                  {/* MEJORA UI: Líneas de separación estilizadas con el color institucional secundario */}
                  <div className="w-12 h-px bg-light-blue/30 ml-auto"></div>
                  <div>
                    <span className="block text-4xl font-black text-[#B91C1C] mb-1">{cifrasImpacto.cifra2}</span>
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-500">{obtenerTextoTraducido(cifrasImpacto, 'texto2', i18n.language)}</span>
                  </div>
                  <div className="w-12 h-px bg-light-blue/30 ml-auto"></div>
                  <div>
                    <span className="block text-4xl font-black text-[#B91C1C] mb-1">{cifrasImpacto.cifra3}</span>
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-500">{obtenerTextoTraducido(cifrasImpacto, 'texto3', i18n.language)}</span>
                  </div>
                </Paper>
              </div>
            </div>
          </section>

          <div className="w-16 h-1 bg-main-red mx-auto rounded-full"></div>

          {/* =========================================
              BLOQUE 2: CARRUSEL DE NOTICIAS
          ========================================= */}
          <section id="noticias-recientes" className="scroll-mt-24 relative">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-main-blue tracking-tight">
                  {t('home.seccion_actualidad', 'Actualidad')}
                </h2>
                <div className="w-16 h-1 bg-main-red mt-4 rounded-full"></div>
              </div>
              <Link to="/noticias" className="hidden md:flex text-xs font-black text-gray-400 hover:text-main-red transition-colors uppercase tracking-[0.2em] items-center gap-2">
                {t('home.archivo_noticias', 'Archivo de Noticias')} <span aria-hidden="true" className="text-lg">&rarr;</span>
              </Link>
            </div>
            
            {loading ? (
              <div className="w-full h-125 md:h-150 lg:h-160 rounded-[2.5rem] bg-gray-100 animate-pulse flex flex-col justify-end p-6 md:p-10 lg:p-12 shadow-inner">
                <div className="w-1/4 h-4 bg-gray-300 rounded mb-4"></div>
                <div className="w-3/4 h-10 bg-gray-300 rounded mb-4"></div>
                <div className="w-full h-6 bg-gray-200 rounded mb-2"></div>
                <div className="w-5/6 h-6 bg-gray-200 rounded"></div>
              </div>
            ) : noticias.length > 0 ? (
              <div className="relative group">
                <Swiper 
                  modules={[Autoplay, EffectFade, Navigation]} 
                  effect="fade"
                  fadeEffect={{ crossFade: true }}
                  autoplay={{ delay: 7000, disableOnInteraction: false, pauseOnMouseEnter: true }} 
                  loop={true}
                  speed={1200}
                  navigation={{
                    prevEl: '.swiper-btn-prev',
                    nextEl: '.swiper-btn-next',
                  }}
                  className="w-full rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100"
                >
                  {noticias.map((noticia) => {
                    const tituloTraducido = obtenerTextoTraducido(noticia, 'titulo', i18n.language);
                    const resumenTraducido = obtenerTextoTraducido(noticia, 'resumen', i18n.language);

                    return (
                      <SwiperSlide key={noticia.id}>
                        <article className="group/slide relative w-full h-125 md:h-150 lg:h-160 overflow-hidden bg-main-blue cursor-pointer" onClick={() => navigate(`/noticias/${noticia.slug || noticia.id}`, { state: { noticiaPreCargada: noticia } })}>
                          <div 
                            className="absolute inset-0 w-full h-full bg-cover bg-top bg-no-repeat transition-transform duration-4000 group-hover/slide:scale-105 bg-gray-200"
                            style={{ backgroundImage: `url(${noticia.imagenPrincipalUrl})` }}
                            role="img"
                            aria-label={tituloTraducido || "Imagen de la noticia"}
                          />
                          {/* MEJORA UI: Filtro de contraste oscuro sutil en el fondo de la imagen para garantizar legibilidad */}
                          <div className="absolute inset-0 bg-black/20 group-hover/slide:bg-black/10 transition-colors duration-1000"></div>
                          
                          {/* MEJORA UX/UI: Opacidad elevada (bg-white/90) para cumplir estrictamente con el contraste accesible WCAG */}
                          <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-auto w-[90%] md:w-[75%] lg:w-[65%] h-auto min-h-80 md:min-h-96 lg:min-h-112 p-6 md:p-10 lg:p-12 bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border border-white/80 z-10 flex flex-col justify-end transform transition-all duration-500 group-hover/slide:-translate-y-2 group-hover/slide:shadow-main-blue/10">
                            <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                              {noticia.tags?.map(tag => (
                                <span key={tag} className="bg-main-blue/5 border border-main-blue/10 text-main-blue text-[10px] md:text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest">{tag}</span>
                              ))}
                            </div>
                            <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-main-blue mb-4 pb-1 leading-tight tracking-tight group-hover/slide:text-main-red transition-colors line-clamp-4">
                              {tituloTraducido}
                            </h3>
                            <p className="text-gray-700 line-clamp-2 md:line-clamp-3 mb-6 md:mb-8 text-sm md:text-lg font-medium leading-relaxed drop-shadow-sm">
                              {resumenTraducido}
                            </p>
                            
                            {/* MEJORA UX: Estilizado como Botón Fantasma interactivo unificado con la sección de Incidencia */}
                            <div className="inline-flex items-center justify-center gap-2 self-start px-5 py-2.5 text-xs font-bold text-main-red uppercase tracking-widest border-2 border-main-red/20 rounded-lg group-hover/slide:bg-main-red group-hover/slide:text-white group-hover/slide:border-main-red transition-all duration-300">
                              {t('home.leer_articulo', 'Leer artículo')} <span aria-hidden="true" className="text-sm leading-none">&rarr;</span>
                            </div>
                          </div>
                        </article>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>

                <button className="swiper-btn-prev absolute top-1/2 left-4 md:left-8 z-20 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm shadow-md border border-gray-100 rounded-full text-main-blue hover:bg-main-red hover:text-white hover:border-main-red transition-colors duration-300 outline-none flex items-center justify-center cursor-pointer" aria-label="Ver noticia anterior">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button className="swiper-btn-next absolute top-1/2 right-4 md:right-8 z-20 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm shadow-md border border-gray-100 rounded-full text-main-blue hover:bg-main-red hover:text-white hover:border-main-red transition-colors duration-300 outline-none flex items-center justify-center cursor-pointer" aria-label="Ver siguiente noticia">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            ) : null}
          </section>

          <div className="w-16 h-1 bg-main-red mx-auto rounded-full"></div>

          {/* =========================================
              BLOQUE 3: NUESTRA LABOR Y CONTACTO
          ========================================= */}
          <section className="bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              
              {/* COLUMNA IZQUIERDA: SERVICIOS (7 columnas) */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="mb-8">
                  <span className="text-main-red font-black tracking-[0.3em] uppercase text-xs mb-3 block">{t('home.nuestra_labor', 'Nuestra Labor')}</span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-main-blue tracking-tighter mb-4 leading-tight">
                    {t('home.que_hacemos_titulo', '¿Qué hacemos en IIRESODH?')}
                  </h2>
                  <p className="text-gray-500 text-base md:text-lg font-light leading-relaxed">
                    {t('home.que_hacemos_subtitulo', 'Combinamos acción jurídica, cooperación técnica y formación académica para generar un impacto real en la sociedad.')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 grow">
                  {/* Tarjeta 1: Litigio con Lucide */}
                  <Link to="/litigio-estrategico" className="group">
                    <article className="flex flex-col h-full bg-white p-8 border border-gray-100 rounded-3xl hover:border-main-red/30 hover:shadow-lg transition-all duration-300">
                      <div className="w-14 h-14 bg-main-red text-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                        <Scale className="w-7 h-7" strokeWidth={1.75} />
                      </div>
                      <h3 className="text-xl font-bold text-main-blue mb-3">{t('home.litigio_titulo', 'Litigio Estratégico')}</h3>
                      <p className="text-gray-500 font-light text-sm leading-relaxed grow">{t('home.litigio_desc', 'Defensa jurídica ante tribunales internacionales para sentar precedentes en la protección de derechos.')}</p>
                    </article>
                  </Link>

                  {/* Tarjeta 2: Incidencia con Lucide */}
                  <Link to="/incidencia-internacional" className="group">
                    <article className="flex flex-col h-full bg-white p-8 border border-gray-100 rounded-3xl hover:border-main-red/30 hover:shadow-lg transition-all duration-300">
                      <div className="w-14 h-14 bg-[#3B82F6] text-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                        <Earth className="w-7 h-7" strokeWidth={1.75} />
                      </div>
                      <h3 className="text-xl font-bold text-main-blue mb-3">{t('home.incidencia_titulo', 'Incidencia Internacional')}</h3>
                      <p className="text-gray-500 font-light text-sm leading-relaxed grow">{t('home.incidencia_desc', 'Investigaciones, informes de impacto y documentos de litigio estratégico.')}</p>
                    </article>
                  </Link>

                  {/* Tarjeta 3: Formación con Lucide (Unificado fondo y acento azul claro institucional) */}
                  <Link to="/cursos" className="group sm:col-span-2">
                    <article className="flex flex-col sm:flex-row items-start sm:items-center h-full bg-white p-8 border border-gray-100 rounded-3xl hover:border-main-red/30 hover:shadow-lg transition-all duration-300 gap-6">
                      <div className="w-14 h-14 bg-light-blue text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <GraduationCap className="w-7 h-7" strokeWidth={1.75} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-main-blue mb-2">{t('home.formacion_titulo', 'Formación Especializada')}</h3>
                        <p className="text-gray-500 font-light text-sm leading-relaxed">{t('home.formacion_desc', 'Certificaciones y programas académicos diseñados para los líderes del cambio social.')}</p>
                      </div>
                    </article>
                  </Link>
                </div>
              </div>

              {/* COLUMNA DERECHA: CONTACTO (5 columnas) */}
              <div className="lg:col-span-5 flex flex-col h-full">
                <article className="bg-gray-50/50 p-8 md:p-10 border border-gray-100 rounded-3xl flex flex-col h-full shadow-sm">
                  <h3 className="text-2xl md:text-3xl font-black text-main-blue mb-2">{t('home.contacto_titulo', '¿Hablamos?')}</h3>
                  <p className="text-gray-500 font-light mb-8 text-sm md:text-base leading-relaxed">
                    {t('home.contacto_subtitulo', 'Estamos aquí para colaborar y responder tus dudas.')}
                  </p>
                  
                  <ToastAlert open={estadoEnvio === "exito"} message={t('home.msg_exito', '¡Mensaje enviado con éxito!')} isError={false} onClose={() => setEstadoEnvio("idle")} />
                  <ToastAlert open={estadoEnvio === "error"} message={t('home.msg_error', 'Ocurrió un error al enviar el mensaje.')} isError={true} onClose={() => setEstadoEnvio("idle")} />
                  
                  {/* Formulario con mejoras UX en los textfields y feedback activo en el botón */}
                  <form onSubmit={handleEnviarContacto} className="flex flex-col gap-6 grow">
                    <AdminTextField 
                      label={t('home.form_nombre', 'Nombre')} 
                      required 
                      value={contacto.nombre} 
                      onChange={(e) => setContacto({...contacto, nombre: e.target.value})} 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <AdminTextField 
                      label={t('home.form_email', 'Email')} 
                      type="email" 
                      required 
                      value={contacto.correo} 
                      onChange={(e) => setContacto({...contacto, correo: e.target.value})} 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    
                    <div className="grow flex flex-col">
                      <AdminTextField 
                        label={t('home.form_mensaje', 'Mensaje')} 
                        required 
                        multiline 
                        rows={5} 
                        value={contacto.mensaje} 
                        onChange={(e) => setContacto({...contacto, mensaje: e.target.value})} 
                        sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </div>
                    
                    {/* MEJORA UX: Botón con estado dinámico e indicador circular de carga integrado */}
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="secondary" 
                      disabled={estadoEnvio === "enviando"} 
                      sx={{ 
                        py: 1.5, 
                        width: '100%', 
                        borderRadius: '12px', 
                        fontWeight: 'bold', 
                        textTransform: 'uppercase', 
                        tracking: '0.1em', 
                        mt: 'auto',
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
                        t('home.btn_enviar', 'Enviar Mensaje')
                      )}
                    </Button>
                  </form>
                </article>
              </div>

            </div>
          </section>

        </div>
      </div>
    </main>
  );
}