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

import isotipoColor from "../assets/Isotipo-color-512.png";

// FUNCIÓN: Detecta URLs y también Hashtags (#)
const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  const partes = texto.split(/(<[^>]+>)/g);
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 0) {
      let procesado = partes[i].replace(/(https?:\/\/[^\s<]+)/g, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red hover:text-main-blue font-bold underline transition-colors pointer-events-auto">${url}</a>`;
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

        {/* CONTENEDOR MAESTRO: Un solo documento continuo, sin divisiones ni bordes */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-8 md:pt-12 flex flex-col gap-16 md:gap-24">
          
          {/* BLOQUE 1: ÚLTIMA NOTICIA */}
          <div>
            {!noticia ? (
              <div className="text-center text-light-blue text-xl py-20 bg-white">
                Aún no hay noticias publicadas.
              </div>
            ) : (
              <div className="bg-white flex flex-col md:flex-row min-h-112.5 md:min-h-120">
                
                <div className="w-full md:w-2/5 bg-white relative shrink-0"> 
                  <div className="aspect-4/5 w-full relative">
                    <Swiper
                      modules={[Navigation, Pagination, Autoplay]}
                      navigation
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 4000 }}
                      className="absolute inset-0 w-full h-full swiper-custom-navigation"
                    >
                      <SwiperSlide className="flex items-center justify-center bg-white h-full w-full">
                        <img src={noticia.imagenPrincipalUrl} alt="Principal" className="w-full h-full object-contain" />
                      </SwiperSlide>
                      {noticia.imagenesCarruselUrls && noticia.imagenesCarruselUrls.map((url, index) => (
                        <SwiperSlide key={index} className="flex items-center justify-center bg-white h-full w-full">
                          <img src={url} alt={`Carrusel ${index + 1}`} className="w-full h-full object-contain" />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
                
                <div className="w-full md:w-3/5 py-8 md:py-12 md:pl-12 flex flex-col justify-center bg-white">
                  <span className="text-xs font-extrabold text-bright-red uppercase tracking-widest mb-3">Última Noticia</span>
                  <h2 className="text-2xl md:text-4xl font-extrabold text-main-blue mb-6 leading-tight">{noticia.titulo}</h2>
                  
                  <div 
                    ref={contentRef}
                    className="text-gray-600 mb-6 text-base md:text-lg font-light leading-relaxed noticia-content max-h-80 overflow-hidden"
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
          </div>

          {/* BLOQUE 2: ACERCA DEL INSTITUTO (Con video incrustado) */}
          <div className="bg-white flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-2/3 space-y-6 text-main-blue text-base md:text-xl font-light leading-relaxed text-center lg:text-left">
              <p className="italic">
                El <strong className="font-extrabold text-light-blue">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</strong>, nace en San José, Costa Rica, logrando crecer muy rápidamente para una más amplia y mejor atención que hoy nos permite tener oficinas de trabajo en varios países.
              </p>
              <p className="italic">
                Desde su creación fue una entidad con claridad en sus objetivos para el fortalecimiento, promoción y protección de los derechos humanos, y con ello incidir en una cultura donde el respeto sea asumido por las empresas e instituciones públicas como una forma de desarrollo directo.
              </p>
              <p className="italic">
                Fomenta el mejoramiento social, económico, cultural, educativo, organizativo y productivo por medio de la promoción de la responsabilidad social empresarial y la promoción y protección de los derechos humanos.
              </p>
            </div>

            <div className="lg:w-1/3 flex flex-col items-center justify-center w-full pt-10 lg:pt-0 lg:pl-10">
              <div className="flex flex-col items-center justify-center gap-6 w-full max-w-md">
                <img 
                  src={isotipoColor} 
                  alt="Isotipo IIRESODH" 
                  className="w-32 md:w-40 h-auto object-contain opacity-95 drop-shadow-sm mb-2" 
                />
                
                {/* VIDEO INCRUSTADO AQUÍ */}
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md border border-gray-100">
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
          </div>

          {/* BLOQUE 3: OFICINAS */}
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-main-red uppercase tracking-widest mb-10 md:mb-14 text-center md:text-left">
              Nuestras Oficinas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
              
              <div className="bg-transparent">
                <h3 className="text-xl md:text-2xl font-bold text-main-blue mb-4 border-b-2 border-pale-blue pb-2 inline-block">Costa Rica</h3>
                <div className="text-gray-600 font-light space-y-1 text-sm md:text-base">
                  <p>Centro Corporativo San Rafael, nivel 3</p>
                  <p>San Rafael de Escazú, San José, Costa Rica</p>
                  <p>CP 10201</p>
                  <p className="pt-3 text-light-blue font-medium">Teléfono: +506 4703 5727</p>
                </div>
              </div>
              
              <div className="bg-transparent">
                <h3 className="text-xl md:text-2xl font-bold text-main-blue mb-4 border-b-2 border-pale-blue pb-2 inline-block">Colombia</h3>
                <div className="text-gray-600 font-light space-y-1 text-sm md:text-base">
                  <p>Carrera. 11C No. 117-05. Oficina 5</p>
                  <p>Bogotá, Colombia</p>
                  <p className="pt-3 text-light-blue font-medium">Teléfono: Bogotá +7461964</p>
                  <p className="text-light-blue font-medium">Móvil: +57 301 4844324</p>
                </div>
              </div>
              
              <div className="bg-transparent">
                <h3 className="text-xl md:text-2xl font-bold text-main-blue mb-4 border-b-2 border-pale-blue pb-2 inline-block">México</h3>
                <div className="text-gray-600 font-light space-y-1 text-sm md:text-base">
                  <p>Atención virtual o presencial previa cita.</p>
                  <p className="pt-3 font-medium">
                    Email: <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-red transition-colors">contacto@iiresodh.org</a>
                  </p>
                </div>
              </div>
              
              <div className="bg-transparent">
                <h3 className="text-xl md:text-2xl font-bold text-main-blue mb-4 border-b-2 border-pale-blue pb-2 inline-block">Guatemala</h3>
                <div className="text-gray-600 font-light space-y-1 text-sm md:text-base">
                  <p>Diagonal 6 12-42, Edificio Design Center</p>
                  <p>Oficina No. 506, Torre 1, Zona 10</p>
                  <p>Ciudad de Guatemala</p>
                  <p className="pt-3 text-light-blue font-medium">Teléfono: +502 5557 7466</p>
                </div>
              </div>
              
              <div className="bg-transparent lg:col-span-2">
                <h3 className="text-xl md:text-2xl font-bold text-main-blue mb-4 border-b-2 border-pale-blue pb-2 inline-block">Canadá</h3>
                <div className="text-gray-600 font-light space-y-3 text-sm md:text-base">
                  <p>Atención virtual o presencial previa cita en la ciudad de Lévis, Québec.</p>
                  <p>En Toronto, Ontario de manera vinculada con la firma de abogados Waldman & Associates.</p>
                  <p className="pt-1 font-medium">
                    Email: <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-red transition-colors">contacto@iiresodh.org</a>
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}