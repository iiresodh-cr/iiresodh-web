// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db, functions } from "../firebase/config";
import { httpsCallable } from "firebase/functions";
import { Link } from "react-router-dom";

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// Mapa
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// Imagen para portada de video
import posterVideo from "../assets/Isotipo-color-512.png";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ==========================================
// NUEVO MOTOR DE LINKS (INFALIBLE)
// ==========================================
export const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  
  // 1. Escapar < y > por seguridad, pero NO TOCAR el & para no romper URLs
  let procesado = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const linksGuardados = []; // Caja fuerte temporal

  // 2. Extraer Markdown (Por si alguien decide usarlo manualmente: [Texto](URL))
  procesado = procesado.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, url) => {
    linksGuardados.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline wrap-break-words">${label}</a>`);
    return `__LINK_${linksGuardados.length - 1}__`; 
  });

  // 3. LA MAGIA AUTOMÁTICA: Extraer URLs crudas pegadas y convertirlas en "haciendo clic aquí"
  procesado = procesado.replace(/(https?:\/\/[^\s]+)/g, (match, url) => {
    if (url.includes("__LINK_")) return match; // Evitar procesar los que ya guardamos
    
    const textoFijo = "clic aquí";
    linksGuardados.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline wrap-break-words">${textoFijo}</a>`);
    return `__LINK_${linksGuardados.length - 1}__`; 
  });

  // 4. Procesar Hashtags
  procesado = procesado.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (match) => {
    const term = match.substring(1);
    return `<a href="/buscar?q=${term}" class="text-light-blue hover:text-main-red font-bold">${match}</a>`;
  });

  // 5. Restaurar Links desde la caja fuerte
  procesado = procesado.replace(/__LINK_(\d+)__/g, (match, i) => linksGuardados[i]);

  // 6. Convertir saltos de línea a párrafos
  const parrafos = procesado.split(/\n\s*\n/);
  return parrafos.map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`).join('');
};

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSede, setHoveredSede] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  
  // Estados para el formulario de contacto
  const [contacto, setContacto] = useState({ nombre: "", correo: "", mensaje: "" });
  const [estadoEnvio, setEstadoEnvio] = useState("idle");

  const mapContainerRef = useRef(null);

  const sedes = [
    { id: 'ca', pais: 'Canadá', coords: [-71.1743, 46.8033], info: 'Atención virtual o presencial previa cita en la ciudad de Lévis, Québec. En Toronto vinculado con Waldman & Associates. Email: contacto@iiresodh.org' },
    { id: 'mx', pais: 'México', coords: [-99.1332, 19.4326], info: 'Atención virtual o presencial previa cita. Email: contacto@iiresodh.org' },
    { id: 'gt', pais: 'Guatemala', coords: [-90.5069, 14.6349], info: 'Diagonal 6 12-42, Edificio Design Center. Oficina No. 506, Torre 1, Zona 10. Ciudad de Guatemala. Teléfono: +502 5557 7466' },
    { id: 'cr', pais: 'Costa Rica', coords: [-84.0833, 9.9333], info: 'Centro Corporativo San Rafael, nivel 3. San Rafael de Escazú, San José. CP 10201. Teléfono: +506 4703 5727' },
    { id: 'co', pais: 'Colombia', coords: [-74.0636, 4.6243], info: 'Carrera. 11C No. 117-05. Oficina 5. Bogotá, Colombia. Teléfono: Bogotá +7461964. Móvil: +57 301 4844324' }
  ];

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const q = query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"), limit(3));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setNoticias(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchNoticias();
  }, []);

  const handleHover = (sede, e) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const leftPos = x > rect.width / 2 ? x - 260 : x + 20;
    const topPos = y < 150 ? y + 20 : y - 140;

    setTooltipPos({ top: topPos, left: leftPos });
    setHoveredSede(sede);
  };

  const showTooltipKeyboard = (sede, target) => {
    const rect = target.getBoundingClientRect();
    const mapRect = mapContainerRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - mapRect.left;
    const y = rect.top + rect.height / 2 - mapRect.top;

    const leftPos = x > mapRect.width / 2 ? x - 260 : x + 20;
    const topPos = y < 150 ? y + 20 : y - 140;

    setTooltipPos({ top: topPos, left: leftPos });
    setHoveredSede(sede);
  };

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

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-bold text-main-blue text-xl">Cargando IIRESODH...</div>;

  return (
    <main className="bg-white flex flex-col min-h-screen font-sans">
      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        {/* AJUSTE 3: Reduje el padding superior (pt-4 md:pt-6) para que no haya tanto hueco debajo del menú */}
        <div className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-4 md:pt-6 pb-12 flex flex-col gap-8 md:gap-10 overflow-hidden">
          
          {/* BLOQUE 1: NOTICIAS DESTACADAS (CARRUSEL) */}
          {noticias.length > 0 && (
            <Swiper 
              modules={[Pagination, Autoplay]} 
              pagination={{ clickable: true }} 
              autoplay={{ delay: 5000 }} 
              spaceBetween={40}
              className="w-full swiper-custom-pagination pb-8 md:pb-12"
            >
              {noticias.map((noticia) => (
                <SwiperSlide key={noticia.id}>
                  {/* AJUSTE 2: Regresamos a items-center para que todo se centre bonito */}
                  <article className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center bg-white w-full">
                    
                    {/* AJUSTE 1: Imagen más angosta (lg:col-span-4) con aspecto 4/5 */}
                    <div className="md:col-span-5 lg:col-span-4 mb-6 md:mb-0">
                      <div className="bg-gray-50 rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex items-center justify-center">
                        <img 
                          src={noticia.imagenPrincipalUrl} 
                          alt={`Imagen principal: ${noticia.titulo}`} 
                          className="w-full aspect-4/5 object-cover object-top block" 
                        />
                      </div>
                    </div>

                    {/* AJUSTE 1: El texto toma el espacio sobrante (lg:col-span-8) */}
                    <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-center bg-white w-full">
                      <span className="text-xs font-bold text-main-red uppercase tracking-widest mb-3 block">
                        Destacado
                      </span>
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-main-blue mb-4 md:mb-6 leading-tight tracking-tight">
                        {noticia.titulo}
                      </h1>
                      
                      <p className="text-gray-600 mb-6 md:mb-8 text-base md:text-lg font-light leading-relaxed">
                        {noticia.resumen || "Haz clic a continuación para leer los detalles de este comunicado."}
                      </p>
                      
                      <Link 
                        to={`/noticias/${noticia.slug || noticia.id}`} 
                        className="text-main-red font-bold hover:text-main-blue transition-colors flex items-center gap-2 self-start uppercase tracking-wide text-sm"
                      >
                        Leer noticia completa <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* BLOQUE 2: QUIÉNES SOMOS (6) Y MAPA (4) */}
          <div className="pt-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-10 items-start overflow-visible bg-white min-h-125">
              
              {/* IZQUIERDA: QUIÉNES SOMOS + TEXTO */}
              <div className="md:col-span-6 flex flex-col items-center md:items-start bg-white relative z-10 w-full">
                <h2 className="text-2xl md:text-3xl font-semibold text-main-blue mb-8 text-center md:text-center w-full">
                  ¿Quiénes Somos?
                </h2>
                <div className="space-y-4 w-full mb-8">
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
              </div>

              {/* DERECHA: MAPA */}
              <section className="md:col-span-4 flex flex-col items-center bg-white w-full z-0" aria-labelledby="map-title">
                <h2 id="map-title" className="text-2xl md:text-3xl font-semibold text-main-blue mb-8 text-center w-full">
                  ¿Dónde Estamos?
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
                          <circle r={25} fill="transparent" className="cursor-pointer" />
                          <circle r={25} fill="#B92F32" fillOpacity={0.1} className="animate-pulse pointer-events-none" />
                          <circle r={10} fill="#B92F32" stroke="#FFFFFF" strokeWidth={2} className="pointer-events-none" />
                        </g>
                      </Marker>
                    ))}
                  </ComposableMap>

                  {hoveredSede && (
                    <div 
                      role="tooltip"
                      className="absolute z-50 bg-white p-4 rounded-xl flex flex-col gap-2 pointer-events-none w-60 transition-opacity duration-150 shadow-xl border border-gray-100"
                      style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}
                    >
                      <h3 className="text-lg font-semibold text-main-red uppercase tracking-tight border-b border-gray-100 pb-2">{hoveredSede.pais}</h3>
                      <p className="text-xs text-gray-700 leading-relaxed font-medium">{hoveredSede.info}</p>
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div>

          {/* BLOQUE 3: NUEVA SECCIÓN - VIDEO (5) Y FORMULARIO (5) */}
          <div className="pt-6 mt-0 border-t border-gray-100 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-10 items-stretch bg-white w-full">
              
              {/* IZQUIERDA: VIDEO INSTITUCIONAL */}
              <div className="md:col-span-5 flex flex-col w-full">
                <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white w-full aspect-video flex items-center justify-center h-full">
                  <video 
                    src="https://storage.googleapis.com/videos-iire/IIRESODH.webm" 
                    controls 
                    className="w-full h-full object-contain bg-white"
                    playsInline
                    preload="metadata"
                    poster={posterVideo}
                  >
                    Tu navegador no soporta la reproducción de video.
                  </video>
                </div>
              </div>

              {/* DERECHA: FORMULARIO DE CONTACTO */}
              <div className="md:col-span-5 flex flex-col w-full h-full">
                <div className="w-full h-full bg-gray-50 rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col justify-center">
                  <h3 className="text-2xl font-semibold text-main-blue mb-3 text-center">
                    Escríbenos un mensaje
                  </h3>
                  <p className="text-center text-gray-600 font-light mb-6 text-sm md:text-base">
                    ¿Tienes alguna consulta o deseas colaborar con nosotros?
                  </p>
                  
                  <form onSubmit={handleEnviarContacto} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input 
                          type="text" 
                          required 
                          value={contacto.nombre}
                          onChange={(e) => setContacto({...contacto, nombre: e.target.value})}
                          className="w-full border border-gray-300 p-3.5 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-light-blue bg-white"
                          placeholder="Tu nombre"
                          aria-label="Tu nombre"
                        />
                      </div>
                      <div>
                        <input 
                          type="email" 
                          required 
                          value={contacto.correo}
                          onChange={(e) => setContacto({...contacto, correo: e.target.value})}
                          className="w-full border border-gray-300 p-3.5 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-light-blue bg-white"
                          placeholder="tu@correo.com"
                          aria-label="Tu correo electrónico"
                        />
                      </div>
                    </div>
                    <div>
                      <textarea 
                        required 
                        rows="4"
                        value={contacto.mensaje}
                        onChange={(e) => setContacto({...contacto, mensaje: e.target.value})}
                        className="w-full border border-gray-300 p-3.5 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-light-blue bg-white resize-none"
                        placeholder="¿En qué te podemos ayudar?"
                        aria-label="Tu mensaje"
                      ></textarea>
                    </div>

                    {estadoEnvio === "exito" && (
                      <div className="bg-green-50 text-green-700 p-3 rounded-lg font-bold text-sm text-center border border-green-200">
                        ¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.
                      </div>
                    )}
                    
                    {estadoEnvio === "error" && (
                      <div className="bg-red-50 text-main-red p-3 rounded-lg font-bold text-sm text-center border border-red-200">
                        Error. Escríbenos a contacto@iiresodh.org
                      </div>
                    )}

                    <div className="text-center pt-2">
                      <button 
                        type="submit" 
                        disabled={estadoEnvio === "enviando"}
                        className="w-full md:w-auto md:px-12 bg-main-red hover:bg-main-blue text-white font-bold py-3.5 rounded-lg transition-colors duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                      >
                        {estadoEnvio === "enviando" ? "Enviando..." : "Enviar Mensaje"}
                      </button>
                    </div>
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