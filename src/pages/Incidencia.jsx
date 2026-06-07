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

  const indiceUltimoDocumento = paginaActual * documentosPorPagina;
  const indicePrimerDocumento = indiceUltimoDocumento - documentosPorPagina;
  const documentosPaginados = documentos.slice(indicePrimerDocumento, indiceUltimoDocumento);
  const totalPaginas = Math.ceil(documentos.length / documentosPorPagina);

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
              
              {/* PANEL DE INFORMACIÓN (TARJETA EN BLANCO) */}
              <div className="w-full lg:w-1/4 flex flex-col justify-center text-left">
                {(() => {
                  const paisActivo = paisesIncidencia.find(p => p.id === paisActivoId) || paisesIncidencia.find(p => p.id === 'cr');

                  return (
                    <Paper elevation={0} className="p-8 border border-gray-100 bg-gray-50/50 rounded-2xl min-h-62.5 flex flex-col" sx={{ borderRadius: '24px' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-main-red animate-pulse"></div>
                        <span className="text-xs font-bold text-main-red uppercase tracking-widest">
                          {t('incidencia.pais_seleccionado', 'País Seleccionado')}
                        </span>
                      </div>
                      <h4 className="text-3xl font-extrabold text-main-blue mb-4 leading-tight uppercase">
                        {paisActivo.pais}
                      </h4>
                      {/* Espacio en blanco preparado para futura información de proyectos/incidencia */}
                      <div className="grow flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                         <span className="text-gray-400 text-sm italic">{t('incidencia.info_proximamente', 'Información de incidencia próximamente')}</span>
                      </div>
                    </Paper>
                  );
                })()}
              </div>

              {/* MAPA INTERACTIVO (Ajustado para que quepa América y Europa) */}
              <div className="w-full lg:w-3/4 flex items-center justify-end relative">
                <ComposableMap 
                  projection="geoMercator" 
                  projectionConfig={{ scale: 220, center: [-30, 30] }} // Aleja el zoom y centra en el Atlántico
                  width={1000} 
                  height={550} 
                  className="w-full h-auto outline-none" 
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) => geographies.map((geo) => (
                      <Geography 
                        key={geo.rsmKey} 
                        geography={geo} 
                        fill="#E5E7EB" // Mapa un poco más oscuro
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
                          <circle r={25} fill="transparent" /> {/* Área interactiva más grande */}
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
          <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-16 animate-fade-in-up">
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

          <div ref={listRef} className="w-16 h-1 bg-main-red mx-auto mt-8 mb-12 rounded-full"></div>

          {/* LISTA DE DOCUMENTOS */}
          {documentos.length === 0 ? (
            <div className="text-center py-10">
              <h2 className="text-2xl font-semibold text-main-blue mb-4 uppercase tracking-widest">
                {t('incidencia.no_docs_titulo', 'Aún no hay documentos')}
              </h2>
              <p className="text-gray-500 font-light max-w-2xl mx-auto leading-relaxed italic">
                {t('incidencia.no_docs_desc', 'Próximamente estaremos publicando nuestros documentos de incidencia.')}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {documentosPaginados.map((doc) => (
                  <Paper 
                    key={doc.id} 
                    elevation={0} 
                    className="group flex flex-col bg-gray-50/50 p-8 border border-gray-100 hover:border-main-red/30 hover:shadow-lg transition-all duration-300 h-full relative overflow-hidden" 
                    sx={{ borderRadius: '24px' }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-pale-blue/20 text-main-blue text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-md border border-pale-blue/30">
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
                    <p className="text-gray-500 font-light leading-relaxed text-sm mb-8 grow">
                      {doc.resumen}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <a 
                        href={doc.archivoIncidenciaUrl || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-main-red uppercase tracking-widest hover:text-red-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        {t('incidencia.btn_descargar', 'Descargar Documento')}
                      </a>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-main-red/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
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