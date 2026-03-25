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

const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  const partes = texto.split(/(<[^>]+>)/g);
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 0) {
      let procesado = partes[i].replace(/(https?:\/\/[^\s<]+)/g, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-semibold underline transition-colors pointer-events-auto wrap-break-word">${url}</a>`;
      });
      procesado = procesado.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (hashtag) => {
        const termino = hashtag.substring(1); 
        return `<a href="/buscar?q=${termino}" class="text-light-blue font-semibold">${hashtag}</a>`;
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

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-bold text-main-blue text-xl">Cargando IIRESODH...</div>;

  return (
    <div className="bg-white flex flex-col min-h-screen font-sans">
      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark"></div>

        <div className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-8 md:pt-12 pb-16 flex flex-col gap-8 md:gap-10 overflow-hidden">
          
          {/* BLOQUE 1: NOTICIA DESTACADA */}
          {noticia && (
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start bg-white">
              
              <div className="w-full md:w-2/5 shrink-0 mb-8 md:mb-0">
                <Swiper 
                  modules={[Pagination, Autoplay]} 
                  pagination={{ clickable: true }} 
                  autoplay={{ delay: 4000 }} 
                  className="w-full swiper-custom-pagination"
                >
                  <SwiperSlide className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center">
                    <img src={noticia.imagenPrincipalUrl} alt="" className="w-full aspect-4/5 object-cover block" />
                  </SwiperSlide>
                  {noticia.imagenesCarruselUrls?.map((url, i) => (
                    <SwiperSlide key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center">
                      <img src={url} alt="" className="w-full aspect-4/5 object-cover block" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <div className="w-full md:w-3/5 flex flex-col justify-start md:pl-12 overflow-hidden bg-white">
                {/* TÍTULO: FONDO BLANCO, COLOR AZUL OSCURO (text-main-blue) Y PESO SEMIBOLD */}
                <h2 className="text-3xl md:text-5xl font-semibold text-main-blue mb-8 leading-tight tracking-tight">
                  {noticia.titulo}
                </h2>
                <div ref={contentRef} className="text-gray-600 mb-6 text-base md:text-lg font-light leading-relaxed noticia-content text-justify overflow-hidden" dangerouslySetInnerHTML={{ __html: formatearTextoConLinksYHashtags(noticia.contenido) }} />
                {isOverflowing && (
                  <Link to={`/noticias/${noticia.slug || noticia.id}`} className="text-main-red font-bold hover:text-main-blue transition-colors mt-auto flex items-center gap-2 self-start uppercase tracking-wide text-sm">
                    Leer noticia completa <span>&rarr;</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* BLOQUE 2: NUESTRAS OFICINAS */}
          <div className="pt-4 bg-white">
            <h2 className="text-2xl md:text-3xl font-extrabold text-main-blue uppercase tracking-widest mb-12 text-center w-full bg-white">
              Nuestras Oficinas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-10 gap-10 items-center overflow-visible bg-white min-h-125">
              
              {/* IZQUIERDA: TEXTO INSTITUCIONAL */}
              <div className="md:col-span-4 flex flex-col justify-center space-y-4 bg-white pr-10">
                <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed text-justify">
                  El <strong className="font-extrabold text-main-blue">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</strong>, nace en San José, Costa Rica, logrando crecer muy rápidamente para una más amplia y mejor atención que hoy nos permite tener oficinas de trabajo en varios países.
                </p>
                <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed text-justify">
                  Desde su creación fue una entidad con claridad en sus objetivos para el fortalecimiento, promoción y protección de los derechos humanos, y con ello incidir en una cultura donde el respeto sea asumido por las empresas e instituciones públicas como una forma de desarrollo directo.
                </p>
                <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed text-justify">
                  Fomenta el mejoramiento social, económico, cultural, educativo, organizativo y productivo por medio de la promoción de la responsabilidad social empresarial y la promoción y protección de los derechos humanos.
                </p>
              </div>

              {/* DERECHA: MAPA */}
              <div ref={mapContainerRef} className="md:col-span-6 map-container-wrapper bg-white">
                <ComposableMap projection="geoMercator" projectionConfig={{ scale: 280, center: [-85, 30] }} className="w-full h-full bg-white overflow-visible">
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography key={geo.rsmKey} geography={geo} fill="#F3F4F6" stroke="#FFFFFF" strokeWidth={0.5} style={{ default: { outline: "none" }, hover: { fill: "#E5E7EB", outline: "none" } }} />
                      ))
                    }
                  </Geographies>

                  {sedes.map((sede) => (
                    <Marker key={sede.id} coordinates={sede.coords}>
                      <circle r={20} fill="transparent" className="cursor-pointer" onMouseEnter={(e) => handleHover(sede, e)} onMouseLeave={() => setHoveredSede(null)} />
                      <circle r={10} fill="#B92F32" fillOpacity={0.1} className="animate-pulse pointer-events-none" />
                      <circle r={5} fill="#B92F32" stroke="#FFFFFF" strokeWidth={2} className="pointer-events-none" />
                    </Marker>
                  ))}
                </ComposableMap>

                {/* TARJETA FLOTANTE HTML */}
                {hoveredSede && (
                  <div 
                    className="absolute z-50 bg-white p-6 rounded-2xl shadow-2xl border-t-8 border-main-red flex flex-col gap-3 pointer-events-none w-[320px] transition-opacity duration-150"
                    style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}
                  >
                    <h3 className="text-xl font-extrabold text-main-blue uppercase tracking-tight border-b border-gray-100 pb-2">{hoveredSede.pais}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{hoveredSede.info}</p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}