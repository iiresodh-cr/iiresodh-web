// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

// Componentes para el bloque de noticias
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// MapLibre GL JS: Tecnología de excelencia para mapas vectoriales (WebGL)
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * FUNCIÓN: Detecta URLs y también Hashtags (#) en el contenido
 */
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
  const mapContainer = useRef(null);
  const map = useRef(null);

  // SEDES CON COORDENADAS GEOGRÁFICAS DE PRECISIÓN (Longitud, Latitud)
  const sedes = [
    {
      id: 'ca',
      pais: 'Canadá',
      coords: [-71.1743, 46.8033], // Lévis, Québec
      detalles: 'Atención virtual o presencial previa cita en la ciudad de Lévis, Québec.'
    },
    {
      id: 'mx',
      pais: 'México',
      coords: [-99.1332, 19.4326], // Ciudad de México
      detalles: 'Atención virtual o presencial previa cita.'
    },
    {
      id: 'gt',
      pais: 'Guatemala',
      coords: [-90.5069, 14.6349], // Ciudad de Guatemala
      detalles: 'Diagonal 6 12-42, Edificio Design Center, Zona 10'
    },
    {
      id: 'cr',
      pais: 'Costa Rica',
      coords: [-84.0833, 9.9333], // San José
      detalles: 'Centro Corporativo San Rafael, nivel 3'
    },
    {
      id: 'co',
      pais: 'Colombia',
      coords: [-74.0636, 4.6243], // Bogotá
      detalles: 'Carrera. 11C No. 117-05. Oficina 5'
    }
  ];

  // EFECTO: Inicialización y gestión del Mapa (Evita el cuadro blanco)
  useEffect(() => {
    if (!mapContainer.current) return;

    const inicializarMapa = () => {
      if (map.current) return;

      // Estilo minimalista profesional
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [-80, 20],
        zoom: 2.2,
        scrollZoom: false,
        trackResize: true
      });

      map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

      map.current.on('load', () => {
        sedes.forEach((sede) => {
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.width = '18px';
          el.style.height = '18px';
          el.style.backgroundColor = '#B92F32';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 0 15px rgba(185, 47, 50, 0.4)';
          el.style.cursor = 'pointer';
          el.style.position = 'relative';

          const pulse = document.createElement('div');
          pulse.className = 'animate-ping absolute inset-0 rounded-full bg-main-red opacity-40';
          el.appendChild(pulse);

          const popup = new maplibregl.Popup({ offset: 15, closeButton: false })
            .setHTML(`
              <div style="padding: 10px; font-family: 'Work Sans', sans-serif; min-width: 150px;">
                <h3 style="color: #1D3557; font-weight: 800; margin-bottom: 5px; text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #F1FAEE; padding-bottom: 5px;">${sede.pais}</h3>
                <p style="color: #457B9D; font-size: 12px; line-height: 1.4; margin: 0;">${sede.detalles}</p>
              </div>
            `);

          new maplibregl.Marker(el)
            .setLngLat(sede.coords)
            .setPopup(popup)
            .addTo(map.current);

          el.addEventListener('mouseenter', () => popup.addTo(map.current));
          el.addEventListener('mouseleave', () => popup.remove());
        });

        // Forzar redibujado tras la carga de estilos
        map.current.resize();
      });
    };

    // Retardo controlado para asegurar que el DOM esté listo
    const timer = setTimeout(inicializarMapa, 150);

    // Observador para redimensionar el mapa si el contenedor cambia
    const resizeObserver = new ResizeObserver(() => {
      if (map.current) map.current.resize();
    });
    resizeObserver.observe(mapContainer.current);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Carga de la última noticia
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
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [noticia]);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-main-blue font-bold text-xl">Cargando IIRESODH...</div>;
  }

  const contenidoNoticiaRaw = noticia ? (noticia.contenido || noticia.contenidoHTML || noticia.cuerpo || `<p>${noticia.resumen}</p>` || "") : "";
  const contenidoNoticia = formatearTextoConLinksYHashtags(contenidoNoticiaRaw);

  return (
    <div className="bg-white flex flex-col min-h-screen font-sans">
      <div className="relative overflow-hidden grow pb-20">
        
        <div className="bg-watermark"></div>

        <div className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-8 md:pt-12 pb-16 flex flex-col gap-12 md:gap-20 overflow-hidden">
          
          {/* BLOQUE 1: ÚLTIMA NOTICIA */}
          {!noticia ? (
            <div className="text-center text-light-blue text-xl py-20">Aún no hay noticias publicadas.</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 md:gap-0 items-start min-h-112 md:min-h-120">
              <div className="w-full md:w-2/5 relative shrink-0"> 
                <div className="aspect-4/5 w-full relative rounded-xl overflow-hidden shadow-sm bg-gray-50">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation pagination={{ clickable: true }} autoplay={{ delay: 4000 }}
                    className="absolute inset-0 w-full h-full swiper-custom-navigation"
                  >
                    <SwiperSlide className="flex items-center justify-center h-full w-full">
                      <img src={noticia.imagenPrincipalUrl} alt="Principal" className="w-full h-full object-contain" />
                    </SwiperSlide>
                    {noticia.imagenesCarruselUrls?.map((url, index) => (
                      <SwiperSlide key={index} className="flex items-center justify-center h-full w-full">
                        <img src={url} alt={`Carrusel ${index + 1}`} className="w-full h-full object-contain" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
              
              <div className="w-full md:w-3/5 flex flex-col justify-start md:pl-12 overflow-hidden">
                <span className="text-xs font-extrabold text-bright-red uppercase tracking-widest mb-3 block">Última Noticia</span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-main-blue mb-6 leading-tight wrap-break-word">{noticia.titulo}</h2>
                <div 
                  ref={contentRef}
                  className="text-gray-600 mb-6 text-base md:text-lg font-light leading-relaxed noticia-content text-justify overflow-hidden wrap-break-word"
                  dangerouslySetInnerHTML={{ __html: contenidoNoticia }}
                />
                {isOverflowing && (
                  <Link to={`/noticias/${noticia.slug || noticia.id}`} className="text-main-red font-bold hover:text-main-blue transition-colors mt-auto flex items-center gap-2 self-start uppercase tracking-wide text-sm">
                    Leer noticia completa <span className="text-xl">&rarr;</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* BLOQUE 2: NUESTRAS OFICINAS (MAPA + TEXTO UNIFICADO) */}
          <div className="pt-12 border-t border-gray-100 flex flex-col gap-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-main-blue uppercase tracking-widest mb-2 text-center">
              Nuestras Oficinas
            </h2>
            
            <div className="flex flex-col md:flex-row gap-12 items-stretch">
              
              {/* IZQUIERDA: MAPA VECTORIAL PROFESIONAL */}
              <div className="w-full md:w-2/5 h-100 md:h-auto rounded-3xl overflow-hidden shadow-2xl border border-gray-200 z-10 relative bg-gray-50 flex items-center justify-center">
                <div ref={mapContainer} className="w-full h-full min-h-100 md:min-h-120" />
              </div>

              {/* DERECHA: TEXTO INSTITUCIONAL */}
              <div className="w-full md:w-3/5 space-y-6 text-gray-700 text-lg md:text-xl font-light leading-relaxed text-justify flex flex-col justify-center px-4 md:pl-8">
                <p>
                  El <strong className="font-extrabold text-main-blue">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</strong>, nace en San José, Costa Rica, logrando crecer muy rápidamente para una más amplia y mejor atención que hoy nos permite tener oficinas de trabajo en varios países.
                </p>
                <p>
                  Desde su creación fue una entidad con claridad en sus objetivos para el fortalecimiento, promoción y protección de los derechos humanos, y con ello incidir en una cultura donde el respeto sea asumido por las empresas e instituciones públicas como una forma de desarrollo directo.
                </p>
                <p>
                  Fomenta el mejoramiento social, económico, cultural, educativo, organizativo y productivo por medio de la promoción de la responsabilidad social empresarial y la promoción y protección de los derechos humanos.
                </p>
                
                <div className="pt-4 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-pale-blue/20 px-4 py-2 rounded-full border border-pale-blue/30">
                    <div className="w-2 h-2 rounded-full bg-main-red"></div>
                    <span className="text-xs font-bold text-main-blue uppercase tracking-wider">Presencia Continental</span>
                  </div>
                  <div className="flex items-center gap-2 bg-pale-blue/20 px-4 py-2 rounded-full border border-pale-blue/30">
                    <div className="w-2 h-2 rounded-full bg-main-red"></div>
                    <span className="text-xs font-bold text-main-blue uppercase tracking-wider">Litigio Estratégico</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}