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

import mapaAmerica from "../assets/mapa-america.svg";

// FUNCIÓN: Detecta URLs y también Hashtags (#)
const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  const partes = texto.split(/(<[^>]+>)/g);
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 0) {
      let procesado = partes[i].replace(/(https?:\/\/[^\s<]+)/g, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red hover:text-main-blue font-bold underline transition-colors pointer-events-auto wrap-break-word">${url}</a>`;
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
            <div className="flex flex-col md:flex-row gap-8 md:gap-0 items-start min-h-112 md:min-h-120">
              
              {/* Izquierda: Imagen */}
              <div className="w-full md:w-2/5 relative shrink-0"> 
                <div className="aspect-4/5 w-full relative rounded-xl overflow-hidden shadow-sm bg-gray-50">
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
              
              {/* Derecha: Texto */}
              <div className="w-full md:w-3/5 flex flex-col justify-start md:pl-12 overflow-hidden">
                <span className="text-xs font-extrabold text-bright-red uppercase tracking-widest mb-3 block">Última Noticia</span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-main-blue mb-6 leading-tight wrap-break-word">{noticia.titulo}</h2>
                
                <div 
                  ref={contentRef}
                  className="text-gray-600 mb-6 text-base md:text-lg font-light leading-relaxed noticia-content text-justify overflow-hidden wrap-break-word"
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
            
            {/* Izquierda: Texto justificado */}
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-main-blue uppercase tracking-widest mb-10 text-center wrap-break-word">
              Nuestras Oficinas
            </h2>
            
            {/* Contenedor del Mapa */}
            <div className="relative w-full max-w-3xl mx-auto aspect-3/4 md:aspect-[4/5] bg-pale-blue/5 rounded-2xl overflow-hidden border border-gray-100 shadow-inner flex items-center justify-center p-4">
              
              {/* IMAGEN DEL MAPA REAL */}
              <img 
                src={mapaAmerica} 
                alt="Mapa de América" 
                className="absolute inset-0 w-full h-full object-contain opacity-20 p-8"
              />

              {/* PUNTOS INTERACTIVOS (Oficinas IIRESODH) */}
              {[
                {
                  id: 'ca',
                  pais: 'Canadá',
                  top: '20%', 
                  left: '35%',
                  detalles: ['Atención virtual o presencial previa cita en la ciudad de Lévis, Québec.', 'En Toronto, Ontario vinculados con Waldman & Associates.', 'Email: contacto@iiresodh.org']
                },
                {
                  id: 'mx',
                  pais: 'México',
                  top: '40%',
                  left: '25%',
                  detalles: ['Atención virtual o presencial previa cita.', 'Email: contacto@iiresodh.org']
                },
                {
                  id: 'gt',
                  pais: 'Guatemala',
                  top: '48%',
                  left: '27%',
                  detalles: ['Diagonal 6 12-42, Edificio Design Center', 'Oficina No. 506, Torre 1, Zona 10', 'Ciudad de Guatemala', 'Teléfono: +502 5557 7466']
                },
                {
                  id: 'cr',
                  pais: 'Costa Rica',
                  top: '55%',
                  left: '32%',
                  detalles: ['Centro Corporativo San Rafael, nivel 3', 'San Rafael de Escazú, San José', 'CP 10201', 'Teléfono: +506 4703 5727']
                },
                {
                  id: 'co',
                  pais: 'Colombia',
                  top: '62%',
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
                        <li key={i} className="leading-snug wrap-break-word">
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
               <p className="text-xs text-gray-400 italic bg-gray-50 inline-block px-4 py-1.5 rounded-full border border-gray-100 wrap-break-word">Toca los puntos en el mapa para ver la información de contacto.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}