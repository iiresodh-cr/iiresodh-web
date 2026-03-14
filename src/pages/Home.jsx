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

  // Efecto para comprobar si el texto de la noticia se desborda (overflow)
  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight } = contentRef.current;
        // Agregamos un pequeño margen de 2px para evitar falsos positivos por redondeo del navegador
        setIsOverflowing(scrollHeight > clientHeight + 2);
      }
    };

    checkOverflow();
    // Ejecutamos nuevamente tras un breve tiempo para asegurar que las fuentes/imágenes hayan cargado
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

  // Preparamos el contenido por si algunos campos vienen vacíos (compatibilidad)
  const contenidoNoticia = noticia ? (noticia.contenido || noticia.contenidoHTML || noticia.cuerpo || `<p>${noticia.resumen}</p>` || "") : "";

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
                      to={`/noticias/${noticia.id}`} 
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

        {/* SECCIÓN ACTUALIZADA: Alineada a max-w-6xl con el botón creativo del video */}
        <section className="relative py-12 md:py-16 px-8 z-10">
          <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center gap-10">
            
            {/* Columna Izquierda: Texto */}
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

            {/* Columna Derecha: Botón de Video Institucional */}
            <div className="lg:w-1/3 flex flex-col items-center justify-center w-full border-t lg:border-t-0 lg:border-l border-gray-200/60 pt-10 lg:pt-0 lg:pl-10">
              <div className="relative group w-full max-w-sm">
                {/* Efecto de resplandor (glow) detrás del botón */}
                <div className="absolute -inset-1 bg-gradient-to-r from-main-red to-light-blue rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                
                <a href="https://storage.googleapis.com/iiresodh_10_anios/IIRESODH.mp4" target="_blank" rel="noreferrer" className="relative flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all transform group-hover:-translate-y-1 h-full cursor-pointer">
                  
                  <div className="bg-main-red group-hover:bg-bright-red text-white w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-5 shadow-inner transition-colors">
                    <svg className="w-8 h-8 md:w-10 md:h-10 ml-1 md:ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  
                  <span className="text-main-blue font-extrabold uppercase tracking-widest text-center text-base md:text-lg mb-1">
                    Video Institucional
                  </span>
                  <span className="text-xs md:text-sm text-light-blue font-medium text-center">
                    Conoce nuestra historia
                  </span>
                </a>
              </div>
            </div>

          </div>
        </section>

        <div className="max-w-6xl mx-auto border-t border-gray-200/60 relative z-10"></div>

        <section className="relative py-20 px-8 max-w-6xl mx-auto z-10">
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
        </section>
      </div>
    </div>
  );
}