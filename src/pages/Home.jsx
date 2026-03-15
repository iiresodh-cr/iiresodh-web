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
import pidaLogo from "../assets/PIDA_logo-576.png";
import pidaMascota from "../assets/PIDA-MASCOTA-576-trans.png";

// NUEVA FUNCIÓN: Detecta URLs y también Hashtags (#)
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

  // ESTADO REFATORIZADO: Ahora guarda la URL del video activo, o null si está cerrado
  const [activeVideo, setActiveVideo] = useState(null);

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
      <div className="relative overflow-hidden grow">
        
        <div className="bg-watermark"></div>

        <section className="relative pt-6 pb-12 px-8 z-10">
          <div className="max-w-6xl mx-auto">
            {!noticia ? (
              <div className="text-center text-light-blue text-xl py-20 bg-white/80 rounded-xl backdrop-blur-sm shadow-sm">
                Aún no hay noticias publicadas.
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row border-t-8 border-main-red min-h-112.5 md:min-h-120">
                
                <div className="w-full md:w-2/5 bg-white border-b md:border-b-0 md:border-r border-gray-100 relative shrink-0"> 
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
                
                <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center bg-white/95">
                  <span className="text-xs font-extrabold text-bright-red uppercase tracking-widest mb-3">Última Noticia</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-main-blue mb-6 leading-tight">{noticia.titulo}</h2>
                  
                  <div 
                    ref={contentRef}
                    className="text-gray-600 mb-6 text-lg font-light leading-relaxed noticia-content max-h-80 overflow-hidden"
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
        </section>

        <section className="relative py-12 md:py-16 px-8 z-10">
          <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row items-center gap-12">
            
            <div className="lg:w-2/3 space-y-6 text-main-blue text-lg md:text-xl font-light leading-relaxed text-center lg:text-left">
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

            <div className="lg:w-1/3 flex flex-col items-center justify-center w-full border-t lg:border-t-0 lg:border-l border-gray-200 pt-10 lg:pt-0 lg:pl-10">
              <div className="flex flex-col items-center justify-center gap-10 w-full max-w-[16rem]">
                <img 
                  src={isotipoColor} 
                  alt="Isotipo IIRESODH" 
                  className="w-48 md:w-56 h-auto object-contain opacity-95 drop-shadow-sm" 
                />
                <button 
                  onClick={() => setActiveVideo("https://storage.googleapis.com/iiresodh_10_anios/IIRESODH.mp4")}
                  className="bg-main-red hover:bg-bright-red text-white px-8 py-2.5 rounded-full font-medium uppercase text-sm tracking-widest shadow-md transition-colors w-full text-center cursor-pointer"
                >
                  Video IIRESODH
                </button>
              </div>
            </div>

          </div>
        </section>

        <div className="px-8 relative z-10">
          <div className="max-w-6xl mx-auto border-t border-gray-200/60"></div>
        </div>

        <section className="relative py-20 px-8 z-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-extrabold text-main-red uppercase tracking-widest mb-12 text-center md:text-left">
              Nuestras Oficinas:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-main-blue mb-4 border-b-2 border-pale-blue pb-2 inline-block">Costa Rica</h3>
                <div className="text-gray-600 font-light space-y-1 text-sm md:text-base">
                  <p>Centro Corporativo San Rafael, nivel 3</p>
                  <p>San Rafael de Escazú, San José, Costa Rica</p>
                  <p>CP 10201</p>
                  <p className="pt-3 text-light-blue font-medium">Teléfono: +506 4703 5727</p>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-main-blue mb-4 border-b-2 border-pale-blue pb-2 inline-block">Colombia</h3>
                <div className="text-gray-600 font-light space-y-1 text-sm md:text-base">
                  <p>Carrera. 11C No. 117-05. Oficina 5</p>
                  <p>Bogotá, Colombia</p>
                  <p className="pt-3 text-light-blue font-medium">Teléfono: Bogotá +7461964</p>
                  <p className="text-light-blue font-medium">Móvil: +57 301 4844324</p>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-main-blue mb-4 border-b-2 border-pale-blue pb-2 inline-block">México</h3>
                <div className="text-gray-600 font-light space-y-1 text-sm md:text-base">
                  <p>Atención virtual o presencial previa cita.</p>
                  <p className="pt-3 font-medium">
                    Email: <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-red transition-colors">contacto@iiresodh.org</a>
                  </p>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-main-blue mb-4 border-b-2 border-pale-blue pb-2 inline-block">Guatemala</h3>
                <div className="text-gray-600 font-light space-y-1 text-sm md:text-base">
                  <p>Diagonal 6 12-42, Edificio Design Center</p>
                  <p>Oficina No. 506, Torre 1, Zona 10</p>
                  <p>Ciudad de Guatemala</p>
                  <p className="pt-3 text-light-blue font-medium">Teléfono: +502 5557 7466</p>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                <h3 className="text-2xl font-bold text-main-blue mb-4 border-b-2 border-pale-blue pb-2 inline-block">Canadá</h3>
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
        </section>

        {/* Separador */}
        <div className="px-8 relative z-10">
          <div className="max-w-6xl mx-auto border-t border-gray-200/60"></div>
        </div>

        {/* SECCIÓN: PIDA - TODO DENTRO DE UNA GRAN TARJETA COHERENTE */}
        <section className="relative py-20 px-8 z-10">
          <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 lg:p-16 overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Mitad Izquierda */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <img 
                  src={pidaLogo} 
                  alt="Logo PIDA" 
                  className="w-64 md:w-80 lg:w-96 object-contain mb-8" 
                />
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-main-blue leading-tight mb-6">
                  Inteligencia Aumentada para la Defensa de los <br className="hidden lg:block" />
                  <span className="text-main-red">Derechos Humanos</span>
                </h2>
                <p className="text-lg text-gray-700 leading-loose">
                  Los asistentes de Inteligencia Artificial genéricos son un océano de información, pero sin un ancla, pueden llevarte a la deriva con datos imprecisos.
                </p>
              </div>

              {/* Mitad Derecha */}
              <div className="flex flex-col items-center justify-center gap-8 relative mt-10 lg:mt-0">
                <img 
                  src={pidaMascota} 
                  alt="Robot PIDA" 
                  className="w-72 md:w-96 object-contain drop-shadow-2xl" 
                />
                
                <button 
                  onClick={() => setActiveVideo("https://storage.googleapis.com/img-pida/PIDA.mp4")}
                  className="bg-main-red hover:bg-bright-red text-white px-8 py-3 rounded-full font-medium uppercase text-sm tracking-widest shadow-md transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Ver PIDA en acción
                </button>
              </div>
            </div>

            {/* Explicación Inferior - Una sola columna unificada */}
            <div className="mt-16 pt-12 border-t border-gray-100 max-w-4xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-extrabold text-main-blue mb-6 text-center">
                ¿Cuál es la gran diferencia de PIDA?
              </h3>
              <div className="space-y-6 text-lg text-gray-700 leading-loose text-justify md:text-center">
                <p>
                  PIDA no improvisa buscando en el caos de internet. Su punto de partida es la biblioteca del <strong className="text-main-blue">IIRESODH</strong>, una institución referente con más de 30 años de experiencia en Litigio Estratégico Internacional.
                </p>
                <p>
                  Primero, PIDA consulta este acervo validado por personas expertas en Derechos Humanos para obtener el fundamento correcto. Luego, usa la IA para construir tu respuesta. Así obtienes la velocidad de la tecnología, pero con la <strong className="text-main-red">autoridad y el rigor técnico</strong> que solo el IIRESODH puede garantizar.
                </p>
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* Modal de Video Global */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm transition-opacity"
          onClick={() => setActiveVideo(null)} 
        >
          <div 
            className="w-full max-w-5xl relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 text-white hover:text-main-red transition-colors flex items-center gap-2 font-bold uppercase tracking-wider cursor-pointer"
              aria-label="Cerrar video"
            >
              Cerrar
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
              <video 
                className="w-full h-full object-contain"
                controls 
                autoPlay 
                src={activeVideo}
              >
                Tu navegador no soporta la reproducción de videos.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}