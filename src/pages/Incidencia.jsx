// src/pages/Incidencia.jsx
import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import PageHeader from "../components/PageHeader";
import { Paper, CircularProgress, Pagination, Stack } from "@mui/material";

// Componentes para la sección de mapas interactivos
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

// CONFIGURACIÓN GLOBAL DEL MAPA 
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function Incidencia() {
  const { t, i18n } = useTranslation(); 
  const [documentos, setDocumentos] = useState([]);
  const [busqueda, setBusqueda] = useState(""); // NUEVO: Estado para búsqueda
  const [loading, setLoading] = useState(true);
  
  // ESTADO PARA EL MAPA
  const [paisActivoId, setPaisActivoId] = useState('cr'); 

  // ESTADOS PARA PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const documentosPorPagina = 10;
  const listRef = useRef(null); 

  // LISTADO DE PAÍSES DE INCIDENCIA
  const paisesIncidencia = [
    { id: 'ca', pais: t('incidencia.pais_ca', 'Canadá'), coords: [-106.3468, 56.1304] },
    { id: 'mx', pais: t('incidencia.pais_mx', 'México'), coords: [-102.5528, 23.6345] },
    { id: 'gt', pais: t('incidencia.pais_gt', 'Guatemala'), coords: [-90.2308, 15.7835] },
    { id: 'hn', pais: t('incidencia.pais_hn', 'Honduras'), coords: [-86.2419, 15.2000] },
    { id: 'cr', pais: t('incidencia.pais_cr', 'Costa Rica'), coords: [-83.7534, 9.7489] },
    { id: 'co', pais: t('incidencia.pais_co', 'Colombia'), coords: [-74.2973, 4.5709] },
    { id: 'ch', pais: t('incidencia.pais_ch', 'Suiza'), coords: [8.2275, 46.8182] }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchDocumentos = async () => {
      try {
        const q = query(collection(db, "incidencia"), orderBy("fechaPublicacion", "desc"));
        const querySnapshot = await getDocs(q);
        
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDocumentos(data);
      } catch (error) {
        console.error("Error al cargar los documentos de incidencia:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentos();
  }, []);

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString(i18n.language || "es-ES", { year: "numeric", month: "long" });
  };

  const handleCambioPagina = (event, value) => {
    setPaginaActual(value);
    if (listRef.current) {
      const yOffset = listRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: yOffset, behavior: 'smooth' });
    }
  };

  // NUEVO: Lógica de filtrado de documentos por búsqueda
  const documentosFiltrados = documentos.filter(doc => 
    doc.titulo?.toLowerCase().includes(busqueda.toLowerCase()) || 
    doc.resumen?.toLowerCase().includes(busqueda.toLowerCase()) ||
    doc.tipo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indiceUltimoDocumento = paginaActual * documentosPorPagina;
  const indicePrimerDocumento = indiceUltimoDocumento - documentosPorPagina;
  const documentosPaginados = documentosFiltrados.slice(indicePrimerDocumento, indiceUltimoDocumento);
  const totalPaginas = Math.ceil(documentosFiltrados.length / documentosPorPagina);

  // Reiniciar la página a 1 si se realiza una búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-20" role="status">
        <CircularProgress size={50} thickness={4} sx={{ color: '#1D3557' }} />
        <span className="text-main-blue font-bold text-sm uppercase tracking-widest animate-pulse">
          {t('incidencia.cargando', 'Cargando documentos...')}
        </span>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden">
      
      <PageHeader 
        titulo={t('incidencia.header_titulo', 'Incidencia Internacional')} 
        subtitulo={t('incidencia.header_subtitulo', 'Acciones estratégicas e informes presentados ante los sistemas internacionales de protección.')} 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-12 pb-16">

          {/* ==================================================== */}
          {/* SECCIÓN MAPA DE INCIDENCIA                           */}
          {/* ==================================================== */}
          <section id="mapa-incidencia" className="mb-20 pb-16 border-b border-gray-100 relative scroll-mt-24 animate-fade-in-up">
            <div className="mb-8 text-left">
              <span className="text-main-red font-black tracking-[0.3em] uppercase text-xs mb-3 block">
                {t('incidencia.mapa_etiqueta', 'Nuestra Presencia')}
              </span>
              <h3 className="text-3xl md:text-4xl font-black text-main-blue mb-2 tracking-tight">
                {t('incidencia.mapa_titulo', 'Impacto Global')}
              </h3>
              <p className="text-gray-500 font-light text-base mb-6">
                {t('incidencia.mapa_subtitulo', 'Pasa el ratón sobre los puntos rojos en el mapa para explorar nuestra incidencia por país.')}
              </p>
            </div>

            <div className="w-full flex flex-col-reverse lg:flex-row items-center gap-10">
              
              {/* PANEL DE INFORMACIÓN */}
              <div className="w-full lg:w-1/4 flex flex-col justify-center text-left">
                {(() => {
                  const paisActivo = paisesIncidencia.find(p => p.id === paisActivoId) || paisesIncidencia.find(p => p.id === 'cr');

                  return (
                    <Paper elevation={0} className="p-8 border border-gray-100 bg-gray-50/50 min-h-62.5 flex flex-col" sx={{ borderRadius: '20px' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-main-red animate-pulse"></div>
                        <span className="text-xs font-bold text-main-red uppercase tracking-widest">
                          {t('incidencia.pais_seleccionado', 'País Seleccionado')}
                        </span>
                      </div>
                      <h4 className="text-3xl font-extrabold text-main-blue mb-4 leading-tight uppercase">
                        {paisActivo.pais}
                      </h4>
                      {/* MEJORA UX/UI: Empty state suavizado con ícono */}
                      <div className="grow flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-white/50 p-4 text-center">
                         <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                         <span className="text-gray-400 text-sm font-medium">{t('incidencia.info_proximamente', 'Información de incidencia próximamente')}</span>
                      </div>
                    </Paper>
                  );
                })()}
              </div>

              {/* MAPA INTERACTIVO */}
              <div className="w-full lg:w-3/4 flex items-center justify-end relative">
                <ComposableMap 
                  projection="geoMercator" 
                  projectionConfig={{ scale: 220, center: [-30, 30] }} 
                  width={1000} 
                  height={550} 
                  className="w-full h-auto outline-none" 
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) => geographies.map((geo) => (
                      <Geography 
                        key={geo.rsmKey} 
                        geography={geo} 
                        fill="#E5E7EB" 
                        stroke="#FFFFFF" 
                        strokeWidth={0.5} 
                        style={{ default: { outline: "none" }, hover: { fill: "#D1D5DB", outline: "none" } }} 
                      />
                    ))}
                  </Geographies>
                  {paisesIncidencia.map((pais) => {
                    const isActive = paisActivoId === pais.id;
                    return (
                      <Marker key={pais.id} coordinates={pais.coords}>
                        <g 
                          onMouseEnter={() => setPaisActivoId(pais.id)} 
                          className="focus:outline-none cursor-pointer"
                        >
                          <circle r={25} fill="transparent" /> 
                          {isActive && (
                            <circle r={15} fill="#1D3557" fillOpacity={0.15} className="animate-pulse" />
                          )}
                          <circle 
                            r={isActive ? 8 : 5} 
                            fill={isActive ? "#1D3557" : "#B92F32"} 
                            stroke="#FFFFFF" 
                            strokeWidth={1.5} 
                            className="transition-all duration-300" 
                          />
                        </g>
                      </Marker>
                    );
                  })}
                </ComposableMap>
              </div>
            </div>
          </section>
          
          {/* ==================================================== */}
          {/* INTRODUCCIÓN Y LISTADO DE DOCUMENTOS                   */}
          {/* ==================================================== */}
          <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-black text-main-blue tracking-tighter mb-6 text-center md:text-left">
              {t('incidencia.intro_titulo', 'Documentos y Posicionamientos')}
            </h2>
            <p>
              {t('incidencia.intro_p1_pt1', 'Como parte de nuestro compromiso con la defensa de la dignidad humana, desde el ')}<strong className="font-semibold text-main-blue">IIRESODH</strong>{t('incidencia.intro_p1_pt2', ' generamos investigaciones, informes de impacto y documentos de litigio estratégico.')}
            </p>
            <p>
              {t('incidencia.intro_p2', 'A continuación, ponemos a disposición pública nuestro acervo documental de incidencia internacional, diseñado para sentar precedentes, informar a la opinión pública y aportar herramientas jurídicas ante organismos como la CIDH y la Corte Interamericana.')}
            </p>
          </div>

          {/* NUEVO: BARRA DE BÚSQUEDA (UX) */}
          <div className="max-w-xl mx-auto mb-10" ref={listRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                placeholder={t('incidencia.buscar_placeholder', 'Buscar por título, tipo o palabra clave...')}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue transition-all"
              />
            </div>
          </div>

          <div className="w-16 h-1 bg-main-red mx-auto mt-8 mb-12 rounded-full"></div>

          {/* LISTA DE DOCUMENTOS */}
          {documentosFiltrados.length === 0 ? (
            <div className="text-center py-10">
              <h2 className="text-2xl font-semibold text-main-blue mb-4 uppercase tracking-widest">
                {t('incidencia.no_docs_titulo', 'Aún no hay documentos')}
              </h2>
              <p className="text-gray-500 font-light max-w-2xl mx-auto leading-relaxed italic">
                {busqueda !== "" 
                  ? t('incidencia.no_docs_busqueda', 'No encontramos coincidencias para tu búsqueda. Intenta con otras palabras.')
                  : t('incidencia.no_docs_desc', 'Próximamente estaremos publicando nuestros documentos de incidencia.')}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {documentosPaginados.map((doc) => (
                  <Paper 
                    key={doc.id} 
                    elevation={0} 
                    className="group flex flex-col bg-gray-50/50 p-8 border border-gray-100 hover:border-main-red/30 hover:shadow-md transition-all duration-300 h-full relative overflow-hidden" 
                    sx={{ borderRadius: '20px' }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-pale-blue/10 text-main-blue text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-md border border-pale-blue/20">
                        {formatearFecha(doc.fechaPublicacion)}
                      </span>
                      <span className="text-gray-400 text-xs font-bold flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        {doc.tipo || t('incidencia.tipo_default', 'Documento PDF')}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-main-blue mb-3 tracking-tight group-hover:text-main-red transition-colors">
                      {doc.titulo}
                    </h3>
                    
                    {/* MEJORA UI: line-clamp-3 para mantener la simetría de las tarjetas */}
                    <p className="text-gray-500 font-light leading-relaxed text-sm mb-8 grow line-clamp-3">
                      {doc.resumen}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      {/* MEJORA UX/UI: Botón fantasma en lugar de solo texto */}
                      <a 
                        href={doc.archivoIncidenciaUrl || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-main-red uppercase tracking-widest border-2 border-main-red/20 rounded-lg hover:bg-main-red hover:text-white hover:border-main-red transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        {t('incidencia.btn_descargar', 'Descargar Documento')}
                      </a>
                    </div>
                  </Paper>
                ))}
              </div>

              {/* CONTROLES DE PAGINACIÓN */}
              {totalPaginas > 1 && (
                <div className="mt-16 flex justify-center">
                  <Stack spacing={2}>
                    <Pagination 
                      count={totalPaginas} 
                      page={paginaActual} 
                      onChange={handleCambioPagina} 
                      color="primary" 
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontFamily: 'inherit',
                          fontWeight: 'bold',
                        },
                        '& .Mui-selected': {
                          backgroundColor: '#1D3557 !important',
                          color: '#ffffff',
                        }
                      }}
                    />
                  </Stack>
                </div>
              )}
            </>
          )}

        </section>
      </div>
    </main>
  );
}