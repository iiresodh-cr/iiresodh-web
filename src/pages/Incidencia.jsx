// src/pages/Incidencia.jsx
import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import PageHeader from "../components/PageHeader";
import { Paper, CircularProgress, Pagination, Stack } from "@mui/material";

export default function Incidencia() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS PARA PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const documentosPorPagina = 10;
  const listRef = useRef(null); // Referencia para hacer scroll al cambiar de página

  // Hacemos scroll al inicio siempre que se carga la página
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
    // Formato: "Mes Año" (ej. Octubre 2023)
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "long" });
  };

  // MANEJADOR DE CAMBIO DE PÁGINA
  const handleCambioPagina = (event, value) => {
    setPaginaActual(value);
    // Hacemos un scroll suave hacia el inicio de la lista
    if (listRef.current) {
      const yOffset = listRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: yOffset, behavior: 'smooth' });
    }
  };

  // LÓGICA DE CORTE PARA LA PAGINACIÓN
  const indiceUltimoDocumento = paginaActual * documentosPorPagina;
  const indicePrimerDocumento = indiceUltimoDocumento - documentosPorPagina;
  const documentosPaginados = documentos.slice(indicePrimerDocumento, indiceUltimoDocumento);
  const totalPaginas = Math.ceil(documentos.length / documentosPorPagina);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-20" role="status">
        <CircularProgress size={50} thickness={4} sx={{ color: '#1D3557' }} />
        <span className="text-main-blue font-bold text-sm uppercase tracking-widest animate-pulse">
          Cargando documentos...
        </span>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden">
      
      <PageHeader 
        titulo="Incidencia Internacional" 
        subtitulo="Acciones estratégicas e informes presentados ante los sistemas internacionales de protección." 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-12 pb-16">
          
          {/* INTRODUCCIÓN */}
          <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-black text-main-blue tracking-tighter mb-6 text-center md:text-left">
              Documentos y Posicionamientos
            </h2>
            <p>
              Como parte de nuestro compromiso con la defensa de la dignidad humana, desde el <strong className="font-semibold text-main-blue">IIRESODH</strong> generamos investigaciones, informes de impacto y documentos de litigio estratégico.
            </p>
            <p>
              A continuación, ponemos a disposición pública nuestro acervo documental de incidencia internacional, diseñado para sentar precedentes, informar a la opinión pública y aportar herramientas jurídicas ante organismos como la CIDH y la Corte Interamericana.
            </p>
          </div>

          <div ref={listRef} className="w-16 h-1 bg-main-red mx-auto mt-8 mb-12 rounded-full"></div>

          {/* LISTA DE DOCUMENTOS */}
          {documentos.length === 0 ? (
            <div className="text-center py-10">
              <h2 className="text-2xl font-semibold text-main-blue mb-4 uppercase tracking-widest">
                Aún no hay documentos
              </h2>
              <p className="text-gray-500 font-light max-w-2xl mx-auto leading-relaxed italic">
                Próximamente estaremos publicando nuestros documentos de incidencia.
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
                    {/* Etiqueta superior */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-pale-blue/20 text-main-blue text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-md border border-pale-blue/30">
                        {formatearFecha(doc.fechaPublicacion)}
                      </span>
                      <span className="text-gray-400 text-xs font-bold flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        {doc.tipo || "Documento PDF"}
                      </span>
                    </div>

                    {/* Contenido */}
                    <h3 className="text-xl md:text-2xl font-bold text-main-blue mb-3 tracking-tight group-hover:text-main-red transition-colors">
                      {doc.titulo}
                    </h3>
                    <p className="text-gray-500 font-light leading-relaxed text-sm mb-8 grow">
                      {doc.resumen}
                    </p>

                    {/* Botón de acción */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <a 
                        href={doc.archivoIncidenciaUrl || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-main-red uppercase tracking-widest hover:text-red-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Descargar Documento
                      </a>
                    </div>

                    {/* Acento visual en hover */}
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
                          backgroundColor: '#1D3557 !important', // main-blue
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