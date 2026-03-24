// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// FUNCIÓN: Detecta URLs y también Hashtags (#)
const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  const partes = texto.split(/(<[^>]+>)/g);
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 0) {
      let procesado = partes[i].replace(/(https?:\/\/[^\s<]+)/g, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red hover:text-main-blue font-bold underline transition-colors pointer-events-auto break-all">${url}</a>`;
      });
      procesado = procesado.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (hashtag) => {
        const termino = hashtag.substring(1); 
        return `<a href="/buscar?q=${termino}" class="text-light-blue hover:text-main-red font-bold transition-colors pointer-events-auto">${hashtag}</a>`;
      });
      partes[i] = procesado;
    }
  }
  return partes.join('');
};

export default function Home() {
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchUltimaNoticia = async () => {
      try {
        const q = query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setNoticia({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        }
      } catch (error) {
        console.error("Error al obtener la noticia:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUltimaNoticia();
  }, []);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight } = contentRef.current;
        setIsOverflowing(scrollHeight > clientHeight + 2);
      }
    };

    checkOverflow();
    const timeoutId = setTimeout(checkOverflow, 150);
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [noticia]);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-main-blue font-bold text-xl">Cargando IIRESODH...</div>;
  }

  const contenidoNoticiaRaw = noticia ? (noticia.contenido || noticia.contenidoHTML || noticia.cuerpo || `<p>${noticia.resumen}</p>` || "") : "";
  const contenidoNoticia = formatearTextoConLinksYHashtags(contenidoNoticiaRaw);

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <div className="relative overflow-hidden grow pb-20">
        
        <div className="bg-watermark"></div>

        {/* CONTENEDOR MAESTRO UNIFICADO */}
        <div className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-8 md:pt-12 pb-16 flex flex-col gap-12 md:gap-16">
          
          {/* ========================================================== */}
          {/* BLOQUE 1: ÚLTIMA NOTICIA */}
          {/* ========================================================== */}
          {!noticia ? (
            <div className="text-center text-light-blue text-xl py-20">
              Aún no hay noticias publicadas.
            </div>
          ) : (
            /* En móvil usa gap-8 para separar foto y texto verticalmente. En desktop gap-0 porque usa paddings. */
            <div className="flex flex-col md:flex-row gap-8 md:gap-0 items-start min-h-[28rem] md:min-h-[30rem]">
              
              {/* Izquierda: Imagen */}
              <div className="w-full md:w-2/5 relative shrink-0"> 
                <div className="aspect-[4/5] w-full relative rounded-xl overflow-hidden shadow-sm bg-gray-50">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 4000 }}
                    className="absolute inset-0 w-full h-full swiper-custom-navigation"
                  >
                    <SwiperSlide className="flex items-center justify-center h-full w-full">
                      <img src={noticia.imagenPrincipalUrl} alt="Principal" className="w-full h-full object-contain" />
                    </SwiperSlide>
                    {noticia.imagenesCarruselUrls && noticia.imagenesCarruselUrls.map((url, index) => (
                      <SwiperSlide key={index} className="flex items-center justify-center h-full w-full">
                        <img src={url} alt={`Carrusel ${index + 1}`} className="w-full h-full object-contain" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
              
              {/* Derecha: Texto (md:pl-12 asegura el margen en desktop. break-words previene desbordamiento en móvil) */}
              <div className="w-full md:w-3/5 flex flex-col justify-start md:pl-12 overflow-hidden">
                <span className="text-xs font-extrabold text-bright-red uppercase tracking-widest mb-3 block">Última Noticia</span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-main-blue mb-6 leading-tight break-words">{noticia.titulo}</h2>
                
                <div 
                  ref={contentRef}
                  className="text-gray-600 mb-6 text-base md:text-lg font-light leading-relaxed noticia-content text-justify overflow-hidden break-words"
                  dangerouslySetInnerHTML={{ __html: contenidoNoticia }}
                />
                
                {isOverflowing && (
                  <Link 
                    to={`/noticias/${noticia.slug || noticia.id}`} 
                    className="text-main-red font-bold hover:text-main-blue transition-colors mt-auto flex items-center gap-2 self-start uppercase tracking-wide text-sm"
                  >
                    Leer noticia completa <span className="text-xl">&rarr;</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* BLOQUE 2: ACERCA DEL INSTITUTO */}
          {/* ========================================================== */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-0 items-start">
            
            {/* Izquierda: Texto justificado (md:pr-12 lo separa del video en desktop) */}
            <div className="w-full md:w-3/5 space-y-6 text-gray-600 text-base md:text-lg font-light leading-relaxed text-justify md:pr-12">
              <p>
                El <strong className="font-extrabold text-main-blue">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</strong>, nace en San José, Costa Rica, logrando crecer muy rápidamente para una más amplia y mejor atención que hoy nos permite tener oficinas de trabajo en varios países.
              </p>
              <p>
                Desde su creación fue una entidad con claridad en sus objetivos para el fortalecimiento, promoción y protección de los derechos humanos, y con ello incidir en una cultura donde el respeto sea asumido por las empresas e instituciones públicas como una forma de desarrollo directo.
              </p>
              <p>
                Fomenta el mejoramiento social, económico, cultural, educativo, organizativo y productivo por medio de la promoción de la responsabilidad social empresarial y la promoción y protección de los derechos humanos.
              </p>
            </div>

            {/* Derecha: Video */}
            <div className="w-full md:w-2/5 shrink-0">
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md">
                <video 
                  className="w-full h-full object-cover"
                  controls 
                  preload="metadata"
                  src="https://storage.googleapis.com/iiresodh_10_anios/IIRESODH.mp4"
                >
                  Tu navegador no soporta la reproducción de videos.
                </video>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* BLOQUE 3: OFICINAS (MAPA INTERACTIVO DE AMÉRICA) */}
          {/* ========================================================== */}
          <div className="pt-12 border-t border-gray-100">
            <h2 className="text-2xl md:text-3xl font-extrabold text-main-blue uppercase tracking-widest mb-10 text-center break-words">
              Nuestras Oficinas
            </h2>
            
            {/* Contenedor del Mapa - Relación de aspecto ajustada para América */}
            <div className="relative w-full max-w-4xl mx-auto aspect-[3/4] md:aspect-[1/1] bg-pale-blue/5 rounded-2xl overflow-hidden border border-gray-100 shadow-inner flex items-center justify-center p-4">
              
              {/* Mapa Vectorial de América Real y Detallado */}
              <svg 
                className="absolute inset-0 w-full h-full text-gray-200 p-6 md:p-10" 
                fill="currentColor" 
                viewBox="0 0 340 500" // Viewbox optimizado para el trazado de América
                preserveAspectRatio="xMidYMid meet"
              >
                <title>Mapa de América - Sedes IIRESODH</title>
                <path d="M107.7,2.3C104.5,4.1,101,7.2,100,9c-1.1,1.8-1.1,2.2-0.3,4.6c0.6,1.8,1.3,4.4,1.6,5.7c0.4,1.7-0.1,2.3-3.4,3.7 c-2.1,0.9-4.8,2.7-5.9,4c-3.1,3.4-12.7,8.3-15.5,8.1c-1.3-0.1-4.7,0.7-7.4,1.7c-3.8,1.4-5.3,1.5-7.7,0.4c-2.4-1.2-3.6-1.1-6.7,0.3 c-2,0.9-4.9,1.6-6.4,1.6c-2.6,0-2.8,0.2-3.8,3.9c-0.6,2.2-1.6,5.2-2.1,6.8c-1.5,4.3-1.4,6.6,0.5,10.6c1.2,2.5,1.5,3.9,1.5,7 c0,3.3-0.2,4.3-1.6,6.3c-1.7,2.5-1.9,4.4-0.9,7.6c0.6,2.1,1.7,5.7,2.4,8c0.7,2.3,2.2,6,3.3,8.3c1.7,3.5,2.1,5.3,1.9,8.5 c-0.3,4.8,0.1,6.3,2.9,11c1.6,2.7,4.3,6,6,7.5c3,2.6,3.1,2.8,3,4.8c-0.1,1.1,0.5,3.3,1.3,4.9c1.6,3,2.1,3.2,5.2,1.9 c1.9-0.8,3.7-1.1,3.9-0.6c0.3,0.5,1.7,0.3,3.3-0.4c1.6-0.7,3.8-1,4.9-0.7c1.1,0.3,2.9,0.1,4-0.4c1.1-0.5,4.1-0.7,6.8-0.5 c4.7,0.3,4.9,0.3,5.9-2.2c0.6-1.4,1.3-2.6,1.6-2.6c0.3,0,1.3-1.2,2.2-2.7c1.5-2.6,1.6-2.6,4-2.4c1.4,0.1,4.7-0.1,7.2-0.5 c4.4-0.7,5.3-0.5,8.1,2.1c1.7,1.6,3.6,2.9,4.3,2.9c0.7,0,1.5,1.2,1.8,2.7c0.3,1.5,1.1,2.7,1.8,2.7c2.6,0,7.2,5.9,7.2,9.3 c0,1.5,1.2,3.3,2.6,3.9c1.4,0.6,2.5,1.7,2.5,2.6c0,1,0.7,1.7,1.5,1.7c0.8,0,2.1,0.9,2.9,2.1c1.4,1.8,1.4,1.9,0.3,3.5 c-1.2,1.7-1.2,1.9-0.1,3.8c0.6,1.1,1.1,2.8,1.1,3.7c0,0.9,1.1,1.7,2.5,1.7c1.4,0,3.3,1,4.1,2.1c0.8,1.2,2.1,2.1,2.9,2.1 c0.8,0,1.5,1.1,1.5,2.5c0,1.4,0.9,2.5,2.1,2.5c1.1,0,3,1.3,4.2,3c1.2,1.6,2.6,2.7,3.3,2.5c0.6-0.2,1.8,0.7,2.6,2 c0.8,1.3,1.9,2.1,2.5,1.9c1-0.3,1.1,0.3,0.3,2.5c-0.6,1.6-0.6,2.1,0.1,2.7c0.6,0.6,0.6,1.1,0,1.8c-1.4,1.4-1.1,3.6,0.6,4.6 c1.1,0.6,1.4,1.2,0.9,1.8c-0.5,0.6-0.1,1.1,0.9,1.1c1.6,0,1.7,0.2,1.3,1.7c-0.3,1-0.1,2.1,0.4,2.5c1,0.8,0.3,3.7-1.1,4.8 c-1.3,1-1.3,1.1-0.2,2c0.7,0.6,1.5,1.7,1.7,2.5c0.6,2,3,4.8,4.2,4.8c1,0,1.1,0.2,1.1,1.8s0.3,1.8,2.5,1.8c1.3,0,2.5,0.7,2.5,1.5 c0,0.8,1.2,1.5,2.7,1.5c1.4,0,3.1,1.1,3.7,2.5c0.6,1.3,1.7,2.5,2.5,2.5c2.3,0,4.7,4,3.1,5.2c-0.6,0.4-0.5,1-0.1,1.8 c0.7,1.4,0.3,2.1-1.3,2.3c-1.1,0.1-2.2,0.7-2.6,1.3c-0.7,1-3.6,0.7-4.9-0.4c-1.3-1.1-2.9-0.9-2.9,0.4c0,1.4-1.2,2-4.1,2.1 c-2.4,0-4,0.6-3.8,1.3c0.1,0.7-0.7,1.3-1.8,1.3c-1.1,0-2-0.7-2-1.5s-0.7-1.5-1.5-1.5c-2.2,0-2.3-0.1-1.1-1.5 c0.8-0.9,1-2.2,0.4-2.8c-1.1-1.1-4.8-1-5.7,0.1c-0.4,0.6-1.5,0.9-2.4,0.7s-1.8,0-2,0.6c-0.2,0.6-1.6,0.9-3.1,0.7s-3.2-0.1-3.8,0.4 c-0.6,0.5-2,0.7-3,0.3c-1.1-0.3-1.7,0-1.5,1s1.3,3.4,2.5,4.3c0.9,0.7,2,1.3,2.4,1.3c1,0,1.3,2.1,0.4,3.6c-0.6,0.9-0.1,1.7,1.6,2.5 c1.5,0.7,2.5,1.6,2.2,2.2c-0.3,0.5-0.1,1,0.6,1c0.7,0,2.1,1.1,3.1,2.5c1,1.4,2.1,2.5,2.5,2.5c0.4,0,1.5,1.1,2.5,2.5 c1.7,2.3,1.9,2.4,4,2.2c1.3-0.1,3.4,0.1,4.7,0.5s2.7,0.5,3.1,0.2c0.4-0.3,1.9,0.3,3.3,1.4c1.4,1.1,3.1,2.1,3.9,2.1s1.5,0.7,1.5,1.5 s0.9,1.5,2.1,1.5c1.2,0,2.1,0.9,2.1,2.1c0,1.1,0.7,2.1,1.5,2.1c1.7,0,4.8,3.2,4.8,4.9c0,1.3,2.1,3.8,3,3.5c0.4-0.1,1.1,0.5,1.6,1.3 c0.5,0.9,1.5,1.6,2.2,1.6c0.7,0,1.3,0.9,1.3,2s1.1,2,2.5,2s2.5,1.1,2.5,2.5s0.9,2.5,2.1,2.5c1.1,0,3,1.1,4.1,2.5c1.1,1.4,2.6,2.5,3.2,2.5 c1,0,2.3,2.8,1.7,3.6c-0.2,0.4,0,0.9,0.7,1.2c0.6,0.3,1.1,1.1,1.1,1.8s0.7,1.3,1.5,1.3c0.8,0,1.5,0.7,1.5,1.5s0.9,1.5,2.1,1.5 c2.5,0,2.8,2,0.3,2.5c-0.8,0.1-1.5,0.7-1.5,1.3s0.7,1.1,1.5,1.1s1.5,0.9,1.5,2s0.9,2,2,2c1.7,0,1.7,0.1,1,2.2c-1,2.6-1.9,3.7-4.1,4.7 c-2.4,1.1-2.9,0.9-2.9-0.8c0-1-0.9-1.8-2-1.8s-2.1,0.6-2.4,1.4c-0.2,0.8-1.6,1.4-3.1,1.4s-3.3,0.9-4,2c-0.7,1.1-2,2-2.9,2 s-2,0.9-2.5,2s-1.8,2-2.9,2c-1.1,0-2,0.6-2,1.3c0,0.7-1.1,1.3-2.5,1.3s-2.5,0.7-2.5,1.5c0,0.8-0.9,1.5-2.1,1.5 c-1.2,0-2.1,0.9-2.1,2.1c0,1.1-0.9,2.1-2,2.1s-2,0.7-2,1.5c0,0.8-0.9,1.5-2.1,1.5s-2.1,0.9-2.1,2.1s-1.1,2.1-2.5,2.1s-2.5,1.1-2.5,2.5 s-1.1,2.5-2.5,2.5c-1.4,0-2.5,0.9-2.5,2.1c0,1.2-0.7,2.1-1.5,2.1s-1.5,0.7-1.5,1.5s-0.7,1.5-1.5,1.5s-1.5,0.7-1.5,1.5s-0.7,1.5-1.5,1.5 s-1.5,0.9-1.5,2.1s-1.1,2.1-2.5,2.1s-2.5,1.1-2.5,2.5s-0.9,2.5-2,2.5c-1.1,0-2,0.7-2,1.5s-1.1,1.5-2.5,1.5s-2.5,0.9-2.5,2s-1.1,2-2.5,2 s-2.5,1.1-2.5,2.5s-1.1,2.5-2.5,2.5s-2.5,0.7-2.5,1.5s-0.9,1.5-2,1.5s-2,0.9-2,2s-0.7,2-1.5,2s-1.5,0.9-1.5,2s-0.9,2-2,2 c-1.1,0-2,0.9-2,2s-1.1,2-2.5,2s-2.5,0.9-2.5,2s-0.7,2-1.5,2s-1.5,1.1-1.5,2.5s-0.7,2.5-1.5,2.5s-1.5,0.7-1.5,1.5s-1.1,1.5-2.5,1.5 s-2.5,0.9-2.5,2s-1.1,2-2.5,2s-2.5,0.9-2.5,2s-0.7,2-1.5,2c-1.4,0-1.5,0.1-0.8,1.5s1,2.5,0.5,2.5c-0.4,0-0.6,0.7-0.3,1.5 c0.3,0.8,0.1,1.5-0.5,1.5s-1.1-0.9-1.1-2.1c0-1.1-0.6-2.1-1.3-2.1c-1.1,0-1.1-0.1-0.3-1.6c0.6-1.1,0.6-1.6,0-1.6c-0.6,0-1.1-0.6-1.1-1.3 s-0.7-1.3-1.5-1.3s-1.5-0.7-1.5-1.5s-0.6-1.5-1.3-1.5c-1.1,0-1.1-0.1-0.3-1.6c0.6-1.1,0.6-1.6,0-1.6c-1,0-2.3-2.8-1.7-3.6 c0.3-0.4-0.1-1-0.8-1.3c-0.8-0.3-1.1-1.1-0.7-1.8c0.6-0.9,0.3-1.3-0.9-1.3c-1.3,0-1.3-0.1-0.1-1.5c0.8-0.9,0.9-2.1,0.3-2.7 c-0.6-0.6-0.7-1.7-0.1-2.5c0.5-0.8,0.5-1.4-0.1-1.4c-0.6,0-1.1-1.1-1.1-2.5c0-1.4-0.7-2.5-1.5-2.5s-1.5-0.9-1.5-2s-1.1-2-2.5-2 s-2.5-1.1-2.5-2.5s-0.7-2.5-1.5-2.5s-1.5-1.1-1.5-2.5s-0.9-2.5-2-2.5c-1.1,0-2-1.1-2-2.5s-1.1-2.5-2.5-2.5s-2.5-1.1-2.5-2.5 c0-2-2.3-2.8-4.1-1.3c-0.8,0.6-1.5,0.9-1.5,0.6s0.1-1.1,0.8-1.8c1.3-1.3,1.2-2.6-0.3-3.7c-0.7-0.6-1.3-1.7-1.3-2.5c0-1,0.6-1.5,1.6-1.3 c0.9,0.2,2.4-0.2,3.1-0.9c0.8-0.7,2.2-0.8,3.1-0.1c1.2,0.9,1.6,0.8,1.6-0.5c0-1,1.1-1.8,2.5-1.8s2.5-0.9,2.5-2s0.7-2,1.5-2 s1.5-1.1,1.5-2.5s0.6-2.5,1.3-2.5s1.3-0.7,1.3-1.5s0.7-1.5,1.5-1.5s1.5-1.1,1.5-2.5s1.1-2.5,2.5-2.5s2.5-0.6,2.5-1.3 c0-0.7,0.6-1.3,1.3-1.3s1.3-0.6,1.3-1.3s0.7-1.3,1.5-1.3s1.5-1.1,1.5-2.5s0.9-2.5,2-2.5s2-0.9,2-2s0.6-2,1.3-2s1.3-1.1,1.3-2.5 s0.9-2.5,2-2.5s2-0.9,2-2s0.6-2,1.3-2s1.3-1.1,1.3-2.5s1.1-2.5,2.5-2.5s2.5-0.9,2.5-2s1.1-2,2.5-2s2.5-1.1,2.5-2.5 s1.1-2.5,2.5-2.5s2.5-0.7,2.5-1.5s1.1-1.5,2.5-1.5s2.5-0.9,2.5-2s1.1-2,2.5-2s2.5-1.1,2.5-2.5s1.1-2.5,2.5-2.5s2.5-0.9,2.5-2 s0.7-2,1.5-2s1.5-0.7,1.5-1.5c0-1.3,2.2-2.8,3.6-2.5c0.6,0.1,1.3-0.4,1.6-1.1s1.3-1.3,2.2-1.3c2.1,0,2.1-0.1,0.3-2.7 c-1.1-1.6-1.4-2.7-1.1-3.6c0.3-1.1-0.2-2.2-1.5-3.3c-1.1-1-2-2.3-2-2.8c0-0.6,1.1-1,2.5-1s2.5-0.6,2.5-1.3c0-0.7,1.1-1.3,2.5-1.3 s2.5-0.7,2.5-1.5s1.1-1.5,2.5-1.5s2.5-0.6,2.5-1.3s0.6-1.3,1.3-1.3s1.3-1.1,1.3-2.5s0.6-2.5,1.3-2.5s1.3-0.7,1.3-1.5s0.9-1.5,2-1.5 s2-1.1,2-2.5c0-1.6,1.4-2.8,4-3.4c1.7-0.4,3.1-1.4,3.1-2.1c0-0.8,0.6-1.5,1.3-1.5s1.3-0.7,1.3-1.5s1.1-1.5,2.5-1.5s2.5-1.1,2.5-2.5 s0.9-2.5,2-2.5s2-0.7,2-1.5c0-0.8,0.9-1.5,2.1-1.5c1.2,0,2.1-0.6,2.1-1.3c0-0.7,0.7-1.3,1.5-1.3s1.5-0.9,1.5-2c0-1.7,2.3-2.2,3.3-0.8 c0.5,0.6,0.9,0.5,0.9-0.1c0-1,2.3-1.8,4.3-1.5c1.1,0.2,2.3-0.1,2.8-0.6c0.5-0.5,1.7-0.6,2.8-0.1c1.1,0.4,2.2,0.3,2.5-0.3 c0.3-0.6,1.7-0.9,3.1-0.7s2.5,0.1,2.5-0.5s0.7-1.1,1.5-1.1c1.3,0,1.5-0.2,0.8-1.5C108.9,2.8,108.9,2.3,107.7,2.3z M117.7,26.3 c1.6,1.1,2,2.2,0.9,2.5c-0.6,0.1-1.1,0.8-1.1,1.5s-0.9,1.2-1.9,1c-1.1-0.2-2.1,0.2-2.1,1c0,0.8-0.9,1-2,0.6c-2.4-0.9-2.8-2.6-0.7-3.1 c1.1-0.3,1.3-0.8,0.6-1.3c-1-0.7-1-0.7,0.1-1.5c0.7-0.6,1.9-1,2.6-1S116.8,25.6,117.7,26.3z M86.8,114.1c1.1,0.6,1.4,1.2,0.9,1.8 c-0.6,0.6-0.4,1.1,0.3,1.1s1.3,0.7,1.3,1.5s0.9,1.5,2,1.5c1.1,0,2,1.1,2,2.5s1.1,2.5,2.5,2.5c1.4,0,2.5,0.9,2.5,2s0.7,2,1.5,2 s1.5,1.1,1.5,2.5s0.9,2.5,2,2.5s2,0.9,2,2s0.9,2,2,2s2,0.7,2,1.5s1.1,1.5,2.5,1.5c1.4,0,2.5,0.9,2.5,2s0.6,2,1.3,2s1.3,0.6,1.3,1.3 s0.7,1.3,1.5,1.3s1.5,1.1,1.5,2.5s0.7,2.5,1.5,2.5s1.5,0.7,1.5,1.5s0.9,1.5,2,1.5s2,1.1,2,2.5s0.6,2.5,1.3,2.5s1.3,0.7,1.3,1.5 s1.1,1.5,2.5,1.5c1.4,0,2.5,0.9,2.5,2s0.7,2,1.5,2s1.5,0.7,1.5,1.5s1.1,1.5,2.5,1.5s2.5,0.9,2.5,2s0.9,2,2,2s2,0.9,2,2 c0,1.3-1.6,2.1-3,1.6c-0.6-0.2-1.3,0.3-1.6,1.1s-1.3,1.3-2.2,1.3c-1.3,0-1.3,0.1-0.1,1.5c0.8,0.9,0.9,2.1,0.3,2.7 c-0.6,0.6-0.6,1.1,0,1.1c1.3,0,1.3,0.1,0.1,1.5c-0.8,0.9-0.8,1.2,0.1,1.8c0.6,0.4,1.1,1.1,1.1,1.5s0.7,0.8,1.5,0.8s1.5,0.7,1.5,1.5 s1.1,1.5,2.5,1.5c1.4,0,2.5,0.6,2.5,1.3c0,0.7,1.1,1.3,2.5,1.3s2.5,0.7,2.5,1.5s1.1,1.5,2.5,1.5s2.5,0.9,2.5,2s0.7,2,1.5,2 s1.5,1.1,1.5,2.5s0.9,2.5,2,2.5s2,1.1,2,2.5s0.6,2.5,1.3,2.5s1.3,0.9,1.3,2s0.7,2,1.5,2s1.5,0.9,1.5,2s0.9,2,2,2 c1.1,0,2,0.7,2,1.5s1.1,1.5,2.5,1.5c1.4,0,2.5,1.1,2.5,2.5s0.7,2.5,1.5,2.5s1.5,0.9,1.5,2s0.9,2,2,2c1.1,0,2,0.9,2,2s1.1,2,2.5,2 c1.4,0,2.5,0.9,2.5,2s0.7,2,1.5,2s1.5,0.9,1.5,2s0.9,2,2,2c1.1,0,2,0.9,2,2s1.1,2,2.5,2s2.5,0.9,2.5,2s0.7,2,1.5,2 s1.5,1.1,1.5,2.5s0.9,2.5,2,2.5s2,1.1,2,2.5s0.7,2.5,1.5,2.5s1.5,0.9,1.5,2s0.9,2,2,2c1.1,0,2,0.9,2,2s1.1,2,2.5,2 s2.5,1.1,2.5,2.5s0.7,2.5,1.5,2.5s1.5,0.9,1.5,2s0.9,2,2,2c1.1,0,2,0.9,2,2s0.7,2,1.5,2s1.5,1.1,1.5,2.5s0.9,2.5,2,2.5s2,0.7,2,1.5 c0,0.8,1.1,1.5,2.5,1.5s2.5,0.9,2.5,2s1.1,2,2.5,2c1.4,0,2.5,0.6,2.5,1.3c0,0.7,0.7,1.3,1.5,1.3s1.5,0.9,1.5,2 c0,1.4,1.4,2,4.1,2.1c2.2,0.1,2.6,0.3,1.7,0.8c-0.6,0.3-0.7,0.9-0.1,1.3c1.7,0.9,1.2,3.3-0.6,4.6c-0.9,0.7-1.1,1.5-0.7,2 c0.6,0.6,0.6,1.1,0,1.1c-1.3,0-1.3,0.1-0.1,1.5c0.8,0.9,0.9,2.1,0.3,2.7c-0.6,0.6-0.6,1.1,0,1.1c1.3,0,1.3,0.1,0.1,1.5 c-0.8,0.9-0.8,1.2,0.1,1.8c0.6,0.4,1.1,1.1,1.1,1.5s0.9,0.8,2,0.8c1.1,0,2,0.7,2,1.5s0.7,1.5,1.5,1.5s1.5,0.9,1.5,2s1.1,2,2.5,2 s2.5,1.1,2.5,2.5s0.7,2.5,1.5,2.5s1.5,0.9,1.5,2s0.9,2,2,2c1.1,0,2,1.1,2,2.5s1.1,2.5,2.5,2.5s2.5,0.7,2.5,1.5s0.7,1.5,1.5,1.5 s1.5,1.1,1.5,2.5s0.9,2.5,2,2.5s2,0.7,2,1.5c0,0.8,0.9,1.5,2.1,1.5c1.2,0,2.1,0.9,2.1,2.1c0,1.1,1.1,2.1,2.5,2.1s2.5,1.1,2.5,2.5 c0,1.4,1.1,2.5,2.5,2.5s2.5,0.9,2.5,2s0.9,2,2,2c1.1,0,2,1.1,2,2.5s1.1,2.5,2.5,2.5s2.5,1.1,2.5,2.5s0.7,2.5,1.5,2.5s1.5,0.7,1.5,1.5 s0.9,1.5,2,1.5s2,0.7,2,1.5c0,1.3-1.6,2.1-3,1.6c-0.6-0.2-1.3,0.3-1.6,1.1s-1.3,1.3-2.2,1.3c-1.3,0-1.3,0.1-0.1,1.5 c0.8,0.9,0.9,2.1,0.3,2.7c-0.6,0.6-0.6,1.1,0,1.1c1.3,0,1.3,0.1,0.1,1.5c-0.8,0.9-0.8,1.2,0.1,1.8c0.6,0.4,1.1,1.1,1.1,1.5 s0.9,0.8,2,0.8c1.1,0,2,0.7,2,1.5s0.7,1.5,1.5,1.5s1.5,0.9,1.5,2s0.9,2,2,2c1.1,0,2,0.7,2,1.5s1.1,1.5,2.5,1.5c1.4,0,2.5,0.6,2.5,1.3 c0,0.7,1.1,1.3,2.5,1.3s2.5,0.7,2.5,1.5s0.7,1.5,1.5,1.5s1.5,0.7,1.5,1.5s0.9,1.5,2,1.5s2,1.1,2,2.5s0.7,2.5,1.5,2.5s1.5,1.1,1.5,2.5 c0,2.3-2.7,3.6-4,1.9c-0.6-0.8-1.5-1.1-2.1-0.6c-0.6,0.5-0.9,0.3-0.7-0.3c0.3-0.6,0.1-1.1-0.3-1.1c-0.5,0-0.7-0.7-0.5-1.5 c0.3-1.3-0.3-1.8-1.9-1.8c-1.3,0-1.3-0.1-0.1-1.5c0.8-0.9,0.9-2.1,0.3-2.7c-0.6-0.6-0.6-1.1,0-1.1s0.9-0.6,1.1-1.4 c0.2-0.8,0.1-1.4-0.3-1.4c-0.4,0-0.6-0.7-0.4-1.5c0.3-1.1-0.1-1.5-1.1-1.1c-0.8,0.4-1.5,0.1-1.5-0.5s-0.7-1.1-1.5-1.1 c-1.3,0-1.5-0.2-0.8-1.5c0.6-1.1,0.6-1.6,0-1.6c-0.6,0-1.1-0.6-1.1-1.3s-0.9-1.3-2-1.3c-1.1,0-2-1.1-2-2.5s-0.9-2.5-2-2.5s-2-0.7-2-1.5 c0-0.8-0.9-1.5-2.1-1.5c-1.2,0-2.1-0.6-2.1-1.3s-0.7-1.3-1.5-1.3c-0.8,0-1.5-1.1-1.5-2.5s-1.1-2.5-2.5-2.5s-2.5-1.1-2.5-2.5 s-0.7-2.5-1.5-2.5s-1.5-0.7-1.5-1.5s-1.1-1.5-2.5-1.5s-2.5-0.9-2.5-2s-1.1-2-2.5-2s-2.5-1.1-2.5-2.5s-0.7-2.5-1.5-2.5 s-1.5-0.9-1.5-2s-0.9-2-2-2s-2-0.7-2-1.5c0-0.8-0.9-1.5-2.1-1.5s-2.1-0.9-2.1-2.1c0-1.1-0.9-2.1-2-2.1s-2-0.7-2-1.5 c0-0.8-0.7-1.5-1.5-1.5s-1.5-0.6-1.5-1.3c0-0.7-0.9-1.3-2-1.3c-1.1,0-2-0.9-2-2s-0.7-2-1.5-2s-1.5-0.9-1.5-2s-0.9-2-2-2 s-2-0.7-2-1.5s-0.7-1.5-1.5-1.5s-1.5-0.6-1.5-1.3c0-0.7-0.7-1.3-1.5-1.3s-1.5-0.6-1.5-1.3c0-1.1-1-1.7-2.5-1.5 c-0.8,0.1-1.5,0.7-1.5,1.3s-0.7,1.1-1.5,1.1s-1.5,0.7-1.5,1.5s-0.9,1.5-2,1.5s-2,0.7-2,1.5c0,1-1.1,1.6-3.1,1.6 c-2.3,0-2.6,0.3-2,2.2c0.4,1.4,0.1,2.5-0.8,2.7c-1,0.2-1.5,1-1.1,2.1c0.3,0.9,0.1,1.6-0.5,1.6s-1.1,0.9-1.1,2.1c0,1.1-0.7,2.1-1.5,2.1 c-0.8,0-1.5,0.9-1.5,2s-0.7,2-1.5,2s-1.5,0.7-1.5,1.5s-0.9,1.5-2,1.5s-2,0.9-2,2s-0.7,2-1.5,2s-1.5,0.9-1.5,2s-1.1,2-2.5,2 s-2.5,1.1-2.5,2.5s-0.7,2.5-1.5,2.5s-1.5,1.1-1.5,2.5c0,1.4-0.7,2.5-1.5,2.5s-1.5,0.9-1.5,2s-0.9,2-2,2c-1.1,0-2,0.7-2,1.5 s-0.7,1.5-1.5,1.5s-1.5,0.6-1.5,1.3c0,0.7-0.9,1.3-2,1.3c-1.1,0-2,0.7-2,1.5s-0.6,1.5-1.3,1.5c-0.7,0-1.3,0.7-1.3,1.5s-0.9,1.5-2,1.5 s-2,0.7-2,1.5c0,0.8-0.9,1.5-2.1,1.5c-1.2,0-2.1,0.7-2.1,1.5c0,0.8-0.7,1.5-1.5,1.5s-1.5,0.9-1.5,2s-0.7,2-1.5,2s-1.5,0.9-1.5,2 s-1.1,2-2.5,2s-2.5,0.9-2.5,2s-0.7,2-1.5,2s-1.5,1.1-1.5,2.5s-0.7,2.5-1.5,2.5s-1.5,0.9-1.5,2s-0.9,2-2,2c-1.1,0-2,0.9-2,2 s-1.1,2-2.5,2s-2.5,0.9-2.5,2s-0.7,2-1.5,2s-1.5,0.7-1.5,1.5s-0.6,1.5-1.3,1.5s-1.3,1.1-1.3,2.5c0,1.4-0.6,2.5-1.3,2.5s-1.3,0.7-1.3,1.5 c0,0.8-0.6,1.5-1.3,1.5c-1.1,0-1.1-0.1-0.3-1.6c0.6-1.1,0.6-1.6,0-1.6c-0.6,0-1.1-0.9-1.1-2.1c0-1.1-0.7-2.1-1.5-2.1s-1.5-1.1-1.5-2.5 s-0.9-2.5-2-2.5s-2-0.7-2-1.5s-0.7-1.5-1.5-1.5s-1.5-0.7-1.5-1.5s-1.1-1.5-2.5-1.5c-1.4,0-2.5-0.7-2.5-1.5s-0.9-1.5-2-1.5 s-2-0.7-2-1.5s-0.7-1.5-1.5-1.5s-1.5-1.1-1.5-2.5c0-1.4-1.1-2.5-2.5-2.5s-2.5-0.9-2.5-2s-1.1-2-2.5-2s-2.5-1.1-2.5-2.5 s-0.7-2.5-1.5-2.5s-1.5-1.1-1.5-2.5c0-1.4-1.1-2.5-2.5-2.5s-2.5-0.9-2.5-2s-0.7-2-1.5-2c-1.4,0-1.5-0.1-0.8-1.5c0.6-1.1,0.6-1.6,0-1.6 c-0.6,0-1.1-0.9-1.1-2c0-1.1-0.6-2-1.3-2c-0.7,0-1.3-0.9-1.3-2s-0.7-2-1.5-2s-1.5-0.9-1.5-2s-0.9-2-2-2c-1.1,0-2-0.7-2-1.5 s-1.1-1.5-2.5-1.5s-2.5-0.9-2.5-2s-0.9-2-2-2s-2-1.1-2-2.5c0-1.4-1.1-2.5-2.5-2.5s-2.5-1.1-2.5-2.5s-0.9-2.5-2-2.5c-1.1,0-2-0.9-2-2 s-1.1-2-2.5-2s-2.5-1.1-2.5-2.5s-0.7-2.5-1.5-2.5s-1.5-1.1-1.5-2.5s-1.1-2.5-2.5-2.5s-2.5-0.9-2.5-2s-0.7-2-1.5-2s-1.5-1.1-1.5-2.5 s-1.1-2.5-2.5-2.5s-2.5-0.9-2.5-2s-1.1-2-2.5-2s-2.5-1.1-2.5-2.5s-1.1-2.5-2.5-2.5c-1.4,0-2.5-1.1-2.5-2.5s-0.6-2.5-1.3-2.5 c-1.1,0-1.1-0.1-0.3-1.6c0.6-1.1,0.6-1.6,0-1.6c-0.6,0-1.1-0.6-1.1-1.3s-0.9-1.3-2-1.3s-2-0.9-2-2s-1.1-2-2.5-2s-2.5-0.9-2.5-2 s-0.7-2-1.5-2s-1.5-0.9-1.5-2s-1.1-2-2.5-2s-2.5-0.9-2.5-2s-0.7-2-1.5-2s-1.5-1.1-1.5-2.5s-1.1-2.5-2.5-2.5s-2.5-1.1-2.5-2.5 s-0.9-2.5-2-2.5c-1.1,0-2-1.1-2-2.5s-0.7-2.5-1.5-2.5s-1.5-0.9-1.5-2s-1.1-2-2.5-2s-2.5-1.1-2.5-2.5s-0.7-2.5-1.5-2.5 s-1.5-1.1-1.5-2.5c0-1.4-1.1-2.5-2.5-2.5s-2.5-0.7-2.5-1.5s-0.9-1.5-2-1.5s-2-1.1-2-2.5c0-1.4-0.6-2.5-1.3-2.5s-1.3-0.7-1.3-1.5 s-0.6-1.5-1.3-1.5c-0.7,0-1.3-0.7-1.3-1.5c0-1.1-1-1.7-2.5-1.5c-0.8,0.1-1.5,0.7-1.5,1.3s-0.7,1.1-1.5,1.1s-1.5,0.9-1.5,2s-0.7,2-1.5,2 s-1.5,1.1-1.5,2.5s-0.9,2.5-2,2.5s-2,0.9-2,2s-0.6,2-1.3,2c-0.7,0-1.3,0.7-1.3,1.5s-0.7,1.5-1.5,1.5s-1.5,0.9-1.5,2s-0.9,2-2,2 s-2,1.1-2,2.5c0,1.4-1.1,2.5-2.5,2.5s-2.5,1.1-2.5,2.5c0,1.3-1.1,2.1-3.3,2.3c-2,0.1-3.3,0.7-3.3,1.5c0,0.8-1.1,1.5-2.5,1.5 s-2.5,0.7-2.5,1.5s-1.1,1.5-2.5,1.5s-2.5,0.6-2.5,1.3c0,1.1-1.3,1.7-4,1.7s-4,0.1-4,0.8c0,0.8-1.1,1.5-2.5,1.5s-2.5,0.7-2.5,1.5 s-0.6,1.5-1.3,1.5c-0.7,0-1.3,0.7-1.3,1.5s-0.7,1.5-1.5,1.5s-1.5,0.9-1.5,2s-0.9,2-2,2s-2,0.7-2,1.5s-0.6,1.5-1.3,1.5 c-0.7,0-1.3,0.7-1.3,1.5s-0.9,1.5-2,1.5s-2,1.1-2,2.5c0,1.4-0.6,2.5-1.3,2.5s-1.3,0.9-1.3,2s-0.6,2-1.3,2c-1.3,0-1.3,0.1,0.3,2 c1,1.3,0.9,2.6-0.3,3.7c-0.7,0.6-1.3,1.7-1.3,2.5s0.9,1.5,2.1,1.5c1.2,0,2.1,0.7,2.1,1.5s0.6,1.5,1.3,1.5c1.4,0,1.5,0.1,0.8,1.5 C88,114.6,88,114.1,86.8,114.1z" />
              </svg>

              {/* PUNTOS INTERACTIVOS (Oficinas IIRESODH) */}
              {[
                {
                  id: 'ca',
                  pais: 'Canadá',
                  // Coordenadas ajustadas para el nuevo trazado
                  top: '25%', 
                  left: '26%',
                  detalles: ['Atención virtual o presencial previa cita en la ciudad de Lévis, Québec.', 'En Toronto, Ontario vinculados con Waldman & Associates.', 'Email: contacto@iiresodh.org']
                },
                {
                  id: 'mx',
                  pais: 'México',
                  top: '47%',
                  left: '22%',
                  detalles: ['Atención virtual o presencial previa cita.', 'Email: contacto@iiresodh.org']
                },
                {
                  id: 'gt',
                  pais: 'Guatemala',
                  top: '56%',
                  left: '27%',
                  detalles: ['Diagonal 6 12-42, Edificio Design Center', 'Oficina No. 506, Torre 1, Zona 10', 'Ciudad de Guatemala', 'Teléfono: +502 5557 7466']
                },
                {
                  id: 'cr',
                  pais: 'Costa Rica',
                  top: '63%',
                  left: '32%',
                  detalles: ['Centro Corporativo San Rafael, nivel 3', 'San Rafael de Escazú, San José', 'CP 10201', 'Teléfono: +506 4703 5727']
                },
                {
                  id: 'co',
                  pais: 'Colombia',
                  top: '71%',
                  left: '39%',
                  detalles: ['Carrera. 11C No. 117-05. Oficina 5', 'Bogotá, Colombia', 'Teléfono: Bogotá +7461964', 'Móvil: +57 301 4844324']
                }
              ].map((oficina) => (
                <div 
                  key={oficina.id} 
                  className="absolute group z-20 cursor-pointer"
                  style={{ top: oficina.top, left: oficina.left }}
                >
                  {/* Punto Rojo con animación "Ping" (Radar) */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-4 h-4 md:w-5 md:h-5 bg-main-red rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-3 h-3 md:w-3.5 md:h-3.5 bg-main-red rounded-full border-2 border-white shadow-md group-hover:scale-125 transition-transform duration-300"></div>
                  </div>

                  {/* Tarjeta de Información (Aparece en Hover) */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 md:w-72 bg-white rounded-xl shadow-2xl p-5 border-t-4 border-main-red opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:-translate-y-2 pointer-events-none group-hover:pointer-events-auto">
                    <h3 className="text-lg font-extrabold text-main-blue border-b border-gray-100 pb-2 mb-3">
                      {oficina.pais}
                    </h3>
                    <ul className="text-sm font-light text-gray-600 space-y-2">
                      {oficina.detalles.map((linea, i) => (
                        <li key={i} className="leading-snug break-words">
                          {linea.includes('Email:') ? (
                            <span>Email: <a href={`mailto:${linea.split('Email: ')[1]}`} className="text-light-blue font-bold hover:text-main-red transition-colors">{linea.split('Email: ')[1]}</a></span>
                          ) : (
                            linea
                          )}
                        </li>
                      ))}
                    </ul>
                    {/* Triángulo apuntador de la tarjeta */}
                    <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 border-solid border-t-8 border-t-white border-x-8 border-x-transparent border-b-0 drop-shadow-md"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Texto de ayuda para móviles */}
            <div className="mt-6 md:hidden text-center">
               <p className="text-xs text-gray-400 italic bg-gray-50 inline-block px-4 py-1.5 rounded-full border border-gray-100">Toca los puntos en el mapa para ver la información de contacto.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}