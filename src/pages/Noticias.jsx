// src/pages/Noticias.jsx
import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, limit, startAfter, endBefore, limitToLast, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

// Importaciones de MUI
import { CircularProgress, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

const NOTICIAS_POR_PAGINA = 10;

// Utilizando tus tags reales del panel de administración
const TAGS_DISPONIBLES = ["Canadá", "México", "Guatemala", "Costa Rica", "Colombia", "Institucional"];

export default function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Filtros
  const [tagFiltro, setTagFiltro] = useState("Todos");
  const [ordenFecha, setOrdenFecha] = useState("desc");

  // Estados para Paginación
  const [firstVisible, setFirstVisible] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(true);

  // Función genérica para construir la consulta base con los filtros activos
  const getBaseConstraints = () => {
    const constraints = [];
    
    // Si hay un tag seleccionado (diferente a "Todos"), filtramos el array
    if (tagFiltro !== "Todos") {
      constraints.push(where("tags", "array-contains", tagFiltro));
    }
    
    // Ordenamiento por fecha
    constraints.push(orderBy("fechaPublicacion", ordenFecha));
    
    return constraints;
  };

  const fetchNoticias = async (consulta) => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(consulta);
      
      if (!querySnapshot.empty) {
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        
        const noticiasData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNoticias(noticiasData);
        
        setHayMas(querySnapshot.docs.length === NOTICIAS_POR_PAGINA);
      } else {
        if (pagina > 1) setHayMas(false);
        else setNoticias([]);
      }
    } catch (error) {
      console.error("Error al obtener noticias:", error);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Carga inicial y reacción a cambios en los filtros
  useEffect(() => {
    setPagina(1); // Reiniciamos a la página 1 cuando cambia un filtro
    const q = query(
      collection(db, "noticias"),
      ...getBaseConstraints(),
      limit(NOTICIAS_POR_PAGINA)
    );
    fetchNoticias(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagFiltro, ordenFecha]);

  const paginaSiguiente = () => {
    if (!lastVisible) return;
    const q = query(
      collection(db, "noticias"),
      ...getBaseConstraints(),
      startAfter(lastVisible),
      limit(NOTICIAS_POR_PAGINA)
    );
    fetchNoticias(q);
    setPagina(prev => prev + 1);
  };

  const paginaAnterior = () => {
    if (!firstVisible) return;
    const q = query(
      collection(db, "noticias"),
      ...getBaseConstraints(),
      endBefore(firstVisible),
      limitToLast(NOTICIAS_POR_PAGINA)
    );
    fetchNoticias(q);
    setPagina(prev => prev - 1);
  };

  // ESTADO DE CARGA HOMOLOGADO CON MUI
  if (loading && noticias.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-20" role="status">
        <CircularProgress size={50} thickness={4} sx={{ color: '#1D3557' }} />
        <span className="text-main-blue font-bold text-sm uppercase tracking-widest animate-pulse">Cargando Noticias...</span>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      <PageHeader 
        titulo="Centro de Noticias" 
        subtitulo="Archivo histórico y actualidad institucional del IIRESODH." 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative pt-4 md:pt-6 px-0 z-10">
          <div className="max-w-7xl mx-auto bg-white overflow-hidden">
            
            <div className="px-6 md:px-12 lg:px-16 pt-4 md:pt-6 pb-12 animate-fade-in-up w-full">
              
              {/* BARRA DE FILTROS */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 pb-6 border-b border-gray-100">
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                  <InputLabel id="tag-select-label">Filtrar por Etiqueta</InputLabel>
                  <Select
                    labelId="tag-select-label"
                    value={tagFiltro}
                    label="Filtrar por Etiqueta"
                    onChange={(e) => setTagFiltro(e.target.value)}
                    disabled={loading}
                    sx={{ borderRadius: '8px' }}
                  >
                    <MenuItem value="Todos">Todas las noticias</MenuItem>
                    {TAGS_DISPONIBLES.map(tag => (
                      <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                  <InputLabel id="orden-select-label">Ordenar por fecha</InputLabel>
                  <Select
                    labelId="orden-select-label"
                    value={ordenFecha}
                    label="Ordenar por fecha"
                    onChange={(e) => setOrdenFecha(e.target.value)}
                    disabled={loading}
                    sx={{ borderRadius: '8px' }}
                  >
                    <MenuItem value="desc">Más recientes primero</MenuItem>
                    <MenuItem value="asc">Más antiguas primero</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {noticias.length === 0 ? (
                <div className="text-center py-10">
                  <h2 className="text-2xl font-semibold text-main-blue mb-4 uppercase tracking-widest">
                    No se encontraron entradas
                  </h2>
                  <p className="text-gray-500 font-light max-w-2xl mx-auto leading-relaxed italic">
                    {tagFiltro !== "Todos" 
                      ? `No hemos encontrado noticias bajo la etiqueta "${tagFiltro}".`
                      : "Nuestra sala de prensa está siendo actualizada. Pronto encontrará aquí los últimos comunicados."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6" role="list">
                  {noticias.map((noticia) => (
                    <article key={noticia.id} role="listitem">
                      <Link 
                        to={`/noticias/${noticia.slug || noticia.id}`} 
                        className="group bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6 md:gap-8 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="w-full md:w-48 h-48 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-50 relative">
                          {/* Pin para noticias persistentes si aplica */}
                          {noticia.persistente && (
                            <div className="absolute top-2 right-2 bg-main-blue/90 p-1.5 rounded-full z-10 shadow-sm">
                              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v4l2 2v2h-7v5l-1 1-1-1v-5H4v-2l2-2V4z" />
                              </svg>
                            </div>
                          )}
                          <img 
                            src={noticia.imagenPrincipalUrl} 
                            alt="" 
                            aria-hidden="true"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
                        </div>

                        <div className="flex flex-col grow min-w-0 h-full">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="text-xs font-black text-main-red uppercase tracking-widest">
                              {noticia.fechaPublicacion?.toDate ? 
                                new Date(noticia.fechaPublicacion.toDate()).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) 
                                : 'Reciente'}
                            </span>
                            {/* Renderizar tags en la vista pública */}
                            {noticia.tags && noticia.tags.length > 0 && (
                              <div className="flex gap-1">
                                {noticia.tags.map(t => (
                                  <span key={t} className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <h2 className="text-xl md:text-2xl font-bold text-main-blue mb-3 line-clamp-1 leading-tight group-hover:text-light-blue transition-colors uppercase tracking-tight">
                            {noticia.titulo}
                          </h2>
                          <p className="text-gray-600 text-sm md:text-base line-clamp-2 font-light leading-relaxed mb-4">
                            {noticia.resumen}
                          </p>
                          <div className="text-main-red text-xs font-black uppercase flex items-center gap-2 mt-auto">
                            Leer noticia completa <span className="text-lg leading-none" aria-hidden="true">&rarr;</span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}

              {/* CONTROLES DE PAGINACIÓN */}
              {noticias.length > 0 && (
                <nav className="mt-16 flex items-center justify-center gap-8 border-t border-gray-100 pt-10">
                  <Button 
                    onClick={paginaAnterior}
                    disabled={pagina === 1 || loading}
                    variant="outlined"
                    startIcon={<span className="text-lg leading-none">&larr;</span>}
                    sx={{
                      px: 4, py: 1, borderRadius: '50px', fontWeight: 'bold', fontSize: '0.75rem',
                      letterSpacing: '0.1em', color: 'primary.main', borderColor: 'primary.main',
                      '&:hover': { bgcolor: 'rgba(29, 53, 87, 0.04)', borderColor: 'primary.main' },
                      '&.Mui-disabled': { color: '#D1D5DB', borderColor: '#E5E7EB' }
                    }}
                  >
                    Anterior
                  </Button>

                  <span className="text-main-blue font-black text-xl">
                    {pagina}
                  </span>

                  <Button 
                    onClick={paginaSiguiente}
                    disabled={!hayMas || loading}
                    variant="outlined"
                    endIcon={<span className="text-lg leading-none">&rarr;</span>}
                    sx={{
                      px: 4, py: 1, borderRadius: '50px', fontWeight: 'bold', fontSize: '0.75rem',
                      letterSpacing: '0.1em', color: 'primary.main', borderColor: 'primary.main',
                      '&:hover': { bgcolor: 'rgba(29, 53, 87, 0.04)', borderColor: 'primary.main' },
                      '&.Mui-disabled': { color: '#D1D5DB', borderColor: '#E5E7EB' }
                    }}
                  >
                    Siguiente
                  </Button>
                </nav>
              )}

            </div>
          </div>
        </section>

      </div>
    </main>
  );
}