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

// Imágenes y Recursos
import isotipoFondo from "../assets/Isotipo-color-512.png"; 

// UI Propia
import AdminTextField from "../components/ui/AdminTextField";
import ToastAlert from "../components/ui/ToastAlert";

// UI Externa
import { Button } from "@mui/material";

// IMPORTACIONES PARA i18n Y TRADUCCIÓN DINÁMICA
import { useTranslation } from 'react-i18next';
import { obtenerTextoTraducido } from "../utils/traductorDinamico"; // <-- HELPER MÁGICO

export const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  let procesado = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const linksGuardados = []; 
  procesado = procesado.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, url) => {
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
  const { t, i18n } = useTranslation(); // <-- Extraemos i18n para saber el idioma activo
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
      console.error("Error enviando correo:", error);
      setEstadoEnvio("error");
      setTimeout(() => setEstadoEnvio("idle"), 5000);
    }
  };

  return (
    <main className="bg-white flex flex-col min-h-screen font-sans overflow-x-hidden">
      <div className="relative grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <div className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-4 md:pt-6 pb-12 flex flex-col">
          
          {/* HERO SECTION */}
          <section className="relative pt-2 pb-12 lg:pt-6 lg:pb-24 overflow-visible">
            <div className="absolute top-0 right-0 -mr-24 -mt-16 opacity-10 pointer-events-none hidden md:block">
              <img src={isotipoFondo} alt="" className="w-200 object-cover" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
              
              <div className="lg:col-span-8 max-w-4xl">
                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-[#0B1E40] leading-[1.05] mb-6 tracking-tighter">
                  {t('home.hero_titulo_1', 'Defendiendo la')}<br className="hidden md:block"/>
                  {t('home.hero_titulo_2', 'dignidad y los')}<br className="hidden md:block"/>
                  {t('home.hero_titulo_3', 'Derechos Humanos')}
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 font-medium mb-10 leading-relaxed max-w-2xl">
                  {t('home.hero_subtitulo', 'Fomentamos el cumplimiento de estándares internacionales mediante la participación ciudadana y gubernamental.')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/incidencia-internacional" className="bg-[#B91C1C] text-white font-bold py-3.5 px-8 rounded-md hover:bg-main-red transition-all text-center uppercase tracking-widest text-xs shadow-md">
                    {t('home.btn_incidencia', 'Incidencia Internacional')}
                  </Link>
                  <Link to="/noticias" className="bg-white text-[#0B1E40] border border-gray-200 font-bold py-3.5 px-8 rounded-md hover:border-gray-400 transition-all text-center uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    {t('home.btn_noticias', 'Noticias')} &rarr;
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 hidden lg:flex justify-end relative z-20 text-right">
                <div className="bg-transparent pt-4 flex flex-col gap-10 min-w-70">
                  <div className="flex flex-col gap-8">
                    <div>
                      <span className="block text-4xl font-black text-[#B91C1C] mb-1">{cifrasImpacto.cifra1}</span>
                      <span className="text-xs font-bold tracking-wider text-gray-500">{obtenerTextoTraducido(cifrasImpacto, 'texto1', i18n.language)}</span>
                    </div>
                    <div>
                      <span className="block text-4xl font-black text-[#B91C1C] mb-1">{cifrasImpacto.cifra2}</span>
                      <span className="text-xs font-bold tracking-wider text-gray-500">{obtenerTextoTraducido(cifrasImpacto, 'texto2', i18n.language)}</span>
                    </div>
                    <div>
                      <span className="block text-4xl font-black text-[#B91C1C] mb-1">{cifrasImpacto.cifra3}</span>
                      <span className="text-xs font-bold tracking-wider text-gray-500">{obtenerTextoTraducido(cifrasImpacto, 'texto3', i18n.language)}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* CARRUSEL DE NOTICIAS */}
          <section id="noticias-recientes" className="pt-8 pb-12 scroll-mt-24 border-t border-gray-100 relative">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-main-blue tracking-tight">
                  {t('home.seccion_actualidad', 'Actualidad')}
                </h2>
                <div className="w-20 h-1.5 bg-main-red mt-4 rounded-full"></div>
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
                  className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                  {noticias.map((noticia) => {
                    // ==========================================
                    // TRADUCCIÓN DINÁMICA DEL CARRUSEL
                    // ==========================================
                    const tituloTraducido = obtenerTextoTraducido(noticia, 'titulo', i18n.language);
                    const resumenTraducido = obtenerTextoTraducido(noticia, 'resumen', i18n.language);

                    return (
                      <SwiperSlide key={noticia.id}>
                        <article className="group relative w-full h-125 md:h-150 lg:h-160 overflow-hidden bg-main-blue cursor-pointer" onClick={() => navigate(`/noticias/${noticia.slug || noticia.id}`, { state: { noticiaPreCargada: noticia } })}>
                          <div 
                            className="absolute inset-0 w-full h-full bg-cover bg-top bg-no-repeat transition-transform duration-4000 group-hover:scale-105 bg-gray-200"
                            style={{ backgroundImage: `url(${noticia.imagenPrincipalUrl})` }}
                            role="img"
                            aria-label={tituloTraducido || "Imagen de la noticia"}
                          />
                          
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-1000"></div>
                          <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-auto w-[90%] md:w-[75%] lg:w-[65%] h-auto min-h-80 md:min-h-96 lg:min-h-112 p-6 md:p-10 lg:p-12 bg-white/30 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/30 z-10 flex flex-col justify-end transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-main-blue/20">
                            <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                              {noticia.tags?.map(tag => (
                                <span key={tag} className="bg-white/40 border border-white/50 text-main-blue text-[10px] md:text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest">{tag}</span>
                              ))}
                            </div>
                            <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-main-blue mb-4 pb-1 leading-tight tracking-tight group-hover:text-main-red transition-colors line-clamp-4">
                              {tituloTraducido}
                            </h3>
                            <p className="text-gray-800 line-clamp-2 md:line-clamp-3 mb-6 md:mb-8 text-sm md:text-lg font-medium leading-relaxed drop-shadow-sm">
                              {resumenTraducido}
                            </p>
                            <div className="text-main-red font-black flex items-center gap-2 uppercase text-xs md:text-sm tracking-[0.2em] group-hover:gap-4 transition-all">{t('home.leer_articulo', 'Leer artículo')} <span aria-hidden="true" className="text-lg md:text-xl leading-none">&rarr;</span></div>
                          </div>
                        </article>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>

                {/* CONTROLES DEL CARRUSEL */}
                <button className="swiper-btn-prev absolute top-1/2 left-2 md:-left-6 z-20 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white/90 shadow-xl rounded-full text-main-red hover:bg-main-red hover:text-white hover:scale-110 transition-all duration-300 outline-none flex items-center justify-center cursor-pointer" aria-label="Ver noticia anterior">
                  <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button className="swiper-btn-next absolute top-1/2 right-2 md:-right-6 z-20 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white/90 shadow-xl rounded-full text-main-red hover:bg-main-red hover:text-white hover:scale-110 transition-all duration-300 outline-none flex items-center justify-center cursor-pointer" aria-label="Ver siguiente noticia">
                  <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            ) : null}
          </section>

          {/* BENTO BOX PILARES Y FORMULARIO DE CONTACTO */}
          <div className="pt-12 pb-8 bg-white border-t border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              <div className="lg:col-span-7 flex flex-col">
                <div className="mb-8">
                  <span className="text-main-red font-black tracking-[0.3em] uppercase text-xs mb-3 block">{t('home.nuestra_labor', 'Nuestra Labor')}</span>
                  <h2 className="text-4xl md:text-5xl font-black text-main-blue tracking-tighter mb-4 leading-tight">
                    {t('home.que_hacemos_titulo', '¿Qué hacemos en IIRESODH?')}
                  </h2>
                  <p className="text-gray-500 text-xl font-light leading-relaxed">
                    {t('home.que_hacemos_subtitulo', 'Combinamos acción jurídica, cooperación técnica y formación académica para generar un impacto real en la sociedad.')}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Link to="/litigio-estrategico" className="group bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                    <div className="w-14 h-14 bg-main-red text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-main-red/20 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-main-blue mb-3">{t('home.litigio_titulo', 'Litigio Estratégico')}</h3>
                    <p className="text-gray-500 font-light leading-relaxed">{t('home.litigio_desc', 'Defensa jurídica ante tribunales internacionales para sentar precedentes en la protección de derechos.')}</p>
                  </Link>
                  <Link to="/incidencia-internacional" className="group bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                    <div className="w-14 h-14 bg-light-blue text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-light-blue/20 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-main-blue mb-3">{t('home.incidencia_titulo', 'Incidencia Internacional')}</h3>
                    <p className="text-gray-500 font-light leading-relaxed">{t('home.incidencia_desc', 'Investigaciones, informes de impacto y documentos de litigio estratégico.')}</p>
                  </Link>
                  <Link to="/cursos" className="md:col-span-2 group bg-main-blue rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center hover:shadow-2xl transition-all duration-300">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-main-red group-hover:border-main-red transition-all">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{t('home.formacion_titulo', 'Formación Especializada')}</h3>
                      <p className="text-gray-300 font-light text-lg">{t('home.formacion_desc', 'Certificaciones y programas académicos diseñados para los líderes del cambio social.')}</p>
                    </div>
                  </Link>
                </div>
              </div>
              
              <div className="lg:col-span-5 w-full h-full flex flex-col">
                <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl h-full">
                  <h3 className="text-3xl font-black text-main-blue mb-3">{t('home.contacto_titulo', '¿Hablamos?')}</h3>
                  <p className="text-gray-500 font-light mb-8 text-lg leading-tight">{t('home.contacto_subtitulo', 'Estamos aquí para colaborar y responder tus dudas.')}</p>
                  
                  <ToastAlert open={estadoEnvio === "exito"} message={t('home.msg_exito', '¡Mensaje enviado con éxito!')} isError={false} onClose={() => setEstadoEnvio("idle")} />
                  <ToastAlert open={estadoEnvio === "error"} message={t('home.msg_error', 'Ocurrió un error al enviar el mensaje.')} isError={true} onClose={() => setEstadoEnvio("idle")} />
                  
                  <form onSubmit={handleEnviarContacto} className="space-y-6 flex flex-col grow">
                    <div className="flex flex-col gap-6">
                      <AdminTextField label={t('home.form_nombre', 'Nombre')} required value={contacto.nombre} onChange={(e) => setContacto({...contacto, nombre: e.target.value})} />
                      <AdminTextField label={t('home.form_email', 'Email')} type="email" required value={contacto.correo} onChange={(e) => setContacto({...contacto, correo: e.target.value})} />
                    </div>
                    <div className="grow">
                      <AdminTextField label={t('home.form_mensaje', 'Mensaje')} required multiline rows={6} value={contacto.mensaje} onChange={(e) => setContacto({...contacto, mensaje: e.target.value})} />
                    </div>
                    <Button type="submit" variant="contained" color="secondary" disabled={estadoEnvio === "enviando"} sx={{ py: 2, px: 8, width: '100%', borderRadius: '12px', fontWeight: 'bold', textTransform: 'uppercase', tracking: '0.1em', marginTop: 'auto' }}>
                      {estadoEnvio === "enviando" ? t('home.btn_enviando', 'Enviando...') : t('home.btn_enviar', 'Enviar Mensaje')}
                    </Button>
                  </form>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}