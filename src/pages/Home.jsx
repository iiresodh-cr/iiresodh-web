// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// Mapa
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// FUNCIÓN DE FORMATEO: Detecta Markdown y Hashtags
const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";

  // 1. Procesar enlaces estilo Markdown: [Texto visible](https://url-larga.com)
  let procesado = texto.replace(/\[([^\]]+)\]\((https?:\/\/[^\s<]+)\)/g, (match, textoEnlace, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-semibold underline transition-colors pointer-events-auto wrap-break-word">${textoEnlace}</a>`;
  });

  const partes = procesado.split(/(<[^>]+>)/g);
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 0) {
      // 2. Convertir URLs sueltas
      let parte = partes[i].replace(/(https?:\/\/[^\s<]+)/g, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-semibold underline transition-colors pointer-events-auto wrap-break-word">${url}</a>`;
      });
      // 3. Convertir Hashtags (#)
      parte = parte.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (hashtag) => {
        const termino = hashtag.substring(1); 
        return `<a href="/buscar?q=${termino}" class="text-light-blue font-semibold">${hashtag}</a>`;
      });
      partes[i] = parte;
    }
  }
  return partes.join('');
};

export default function Home() {
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [hoveredSede, setHoveredSede] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  
  const contentRef = useRef(null);
  const mapContainerRef = useRef(null);

  const sedes = [
    { id: 'ca', pais: 'Canadá', coords: [-71.1743, 46.8033], info: 'Atención virtual o presencial previa cita en la ciudad de Lévis, Québec. En Toronto vinculado con Waldman & Associates. Email: contacto@iiresodh.org' },
    { id: 'mx', pais: 'México', coords: [-99.1332, 19.4326], info: 'Atención virtual o presencial previa cita. Email: contacto@iiresodh.org' },
    { id: 'gt', pais: 'Guatemala', coords: [-90.5069, 14.6349], info: 'Diagonal 6 12-42, Edificio Design Center. Oficina No. 506, Torre 1, Zona 10. Ciudad de Guatemala. Teléfono: +502 5557 7466' },
    { id: 'cr', pais: 'Costa Rica', coords: [-84.0833, 9.9333], info: 'Centro Corporativo San Rafael, nivel 3. San Rafael de Escazú, San José. CP 10201. Teléfono: +506 4703 5727' },
    { id: 'co', pais: 'Colombia', coords: [-74.0636, 4.6243], info: 'Carrera. 11C No. 117-05. Oficina 5. Bogotá, Colombia. Teléfono: Bogotá +7461964. Móvil: +57 301 4844324' }
  ];

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        const q = query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) setNoticia({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchNoticia();
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

  const handleHover = (sede, e) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const leftPos = x > rect.width / 2 ? x - 340 : x + 20;
    const topPos = y < 150 ? y + 20 : y - 180;

    setTooltipPos({ top: topPos, left: leftPos });
    setHoveredSede(sede);
  };

  const showTooltipKeyboard = (sede, target) => {
    const rect = target.getBoundingClientRect();
    const mapRect = mapContainerRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - mapRect.left;
    const y = rect.top + rect.height / 2 - mapRect.top;

    const leftPos = x > mapRect.width / 2 ? x - 340 : x + 20;
    const topPos = y < 150 ? y + 20 : y - 180;

    setTooltipPos({ top: topPos, left: leftPos });
    setHoveredSede(sede);
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-bold text-main-blue text-xl">Cargando IIRESODH...</div>;

  return (
    <main className="bg-white flex flex-col min-h-screen font-sans">
      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <div className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-8 md:pt-12 pb-16 flex flex-col gap-8 md:gap-10 overflow-hidden">
          
          {/* BLOQUE 1: NOTICIA DESTACADA */}
          {noticia && (
            <article className="flex flex-col md:flex-row gap-8 md:gap-12 items-start bg-white">
              
              <div className="w-full md:w-2/5 shrink-0 mb-8 md:mb-0">
                <Swiper 
                  modules={[Pagination, Autoplay]} 
                  pagination={{ clickable: true }} 
                  autoplay={{ delay: 4000 }} 
                  className="w-full swiper-custom-pagination"
                >
                  <SwiperSlide className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center">
                    <img src={noticia.imagenPrincipalUrl} alt={`Imagen principal: ${noticia.titulo}`} className="w-full aspect-4/5 object-cover block" />
                  </SwiperSlide>
                  {noticia.imagenesCarruselUrls?.map((url, i) => (
                    <SwiperSlide key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center">
                      <img src={url} alt={`Imagen ${i + 1} de carrusel: ${noticia.titulo}`} className="w-full aspect-4/5 object-cover block" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <div className="w-full md:w-3/5 flex flex-col justify-start md:pl-12 overflow-hidden bg-white">
                <h1 className="text-3xl md:text-5xl font-semibold text-main-blue mb-8 leading-tight tracking-tight">
                  {noticia.titulo}
                </h1>
                <div ref={contentRef} className="text-gray-600 mb-6 text-base md:text-lg font-light leading-relaxed noticia-content text-justify overflow-hidden" dangerouslySetInnerHTML={{ __html: formatearTextoConLinksYHashtags(noticia.contenido) }} />
                {isOverflowing && (
                  <Link 
                    to={`/noticias/${noticia.slug || noticia.id}`} 
                    className="text-main-red font-bold hover:text-main-blue transition-colors mt-auto flex items-center gap-2 self-start uppercase tracking-wide text-sm"
                    aria-label={`Leer noticia completa: ${noticia.titulo}`}
                  >
                    Leer noticia completa <span>&rarr;</span>
                  </Link>
                )}
              </div>
            </article>
          )}

          {/* BLOQUE 2: TEXTO INSTITUCIONAL Y MAPA */}
          <div className="pt-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-10 items-center overflow-visible bg-white min-h-125">
              
              {/* IZQUIERDA: TEXTO INSTITUCIONAL */}
              <div className="md:col-span-4 flex flex-col justify-center space-y-4 bg-white pr-10 md:mt-12">
                <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed text-justify">
                  El <strong className="font-semibold text-main-blue">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</strong>, es una asociación sin fines de lucro, con su sede principal en Costa Rica y oficinas en otros países como Canadá, Colombia, Guatemala, México, con el objetivo de fomentar el cumplimiento de los estándares internacionales de derechos humanos mediante un enfoque de participación ciudadana, gubernamental y corporativa.
                </p>
                <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed text-justify">
                  Realizamos labores de capacitación, litigio estratégico y empoderamiento de la sociedad civil con fondos privados y de la cooperación internacional. Participamos frecuentemente en los diferentes espacios de trabajos y audiencias de los sistemas de protección de derechos humanos, siendo una voz activa en la defensa de la democracia y los derechos humanos.
                </p>
                <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed text-justify">
                  Fomentamos el mejoramiento social, económico, cultural, educativo, organizativo y productivo por medio de la promoción de la responsabilidad social empresarial y la promoción y protección de los derechos humanos.
                </p>
              </div>

              {/* DERECHA: TÍTULO Y MAPA */}
              <section className="md:col-span-6 flex flex-col items-center bg-white w-full" aria-labelledby="map-title">
                <h2 id="map-title" className="text-2xl md:text-3xl font-semibold text-main-blue mb-8 text-center w-full">
                  Nuestras Oficinas
                </h2>
                
                <div ref={mapContainerRef} className="map-container-wrapper bg-white w-full relative">
                  <ComposableMap 
                    projection="geoMercator" 
                    projectionConfig={{ scale: 300, center: [-85, 30] }} 
                    className="w-full h-full bg-white overflow-visible"
                    aria-label="Mapa interactivo de sedes internacionales"
                  >
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map((geo) => (
                          <Geography 
                            key={geo.rsmKey} 
                            geography={geo} 
                            fill="#457B9D" 
                            stroke="#FFFFFF" 
                            strokeWidth={0.5} 
                            style={{ default: { outline: "none" }, hover: { fill: "#1D3557", outline: "none" } }} 
                          />
                        ))
                      }
                    </Geographies>

                    {sedes.map((sede) => (
                      <Marker key={sede.id} coordinates={sede.coords}>
                        <g 
                          tabIndex="0" 
                          role="button" 
                          aria-label={`Sede en ${sede.pais}. Presiona para ver información.`}
                          onMouseEnter={(e) => handleHover(sede, e)} 
                          onMouseLeave={() => setHoveredSede(null)}
                          onFocus={(e) => showTooltipKeyboard(sede, e.target)}
                          onBlur={() => setHoveredSede(null)}
                          className="focus:outline-none"
                        >
                          <circle r={20} fill="transparent" className="cursor-pointer" />
                          <circle r={10} fill="#B92F32" fillOpacity={0.1} className="animate-pulse pointer-events-none" />
                          <circle r={5} fill="#B92F32" stroke="#FFFFFF" strokeWidth={2} className="pointer-events-none" />
                        </g>
                      </Marker>
                    ))}
                  </ComposableMap>

                  {/* TARJETA FLOTANTE HTML */}
                  {hoveredSede && (
                    <div 
                      role="tooltip"
                      className="absolute z-50 bg-white p-6 rounded-2xl flex flex-col gap-3 pointer-events-none w-[320px] transition-opacity duration-150 shadow-xl border border-gray-100"
                      style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}
                    >
                      <h3 className="text-xl font-semibold text-main-red uppercase tracking-tight border-b border-gray-100 pb-2">{hoveredSede.pais}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">{hoveredSede.info}</p>
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}