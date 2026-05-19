// src/pages/ArticulosAcademicos.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit, startAfter, endBefore, limitToLast } from "firebase/firestore";
import { db } from "../firebase/config";
import PageHeader from "../components/PageHeader";

// Importaciones de MUI
import { CircularProgress, Button } from "@mui/material";

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

const ARTICULOS_POR_PAGINA = 10;

export default function ArticulosAcademicos() {
  const { t, i18n } = useTranslation(); // HOOK DE TRADUCCIÓN E INSTANCIA
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para Paginación
  const [firstVisible, setFirstVisible] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(true);

  // Función de carga genérica
  const fetchArticulos = async (consulta) => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(consulta);
      
      if (!querySnapshot.empty) {
        // Guardamos los punteros para la paginación
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArticulos(data);
        
        setHayMas(querySnapshot.docs.length === ARTICULOS_POR_PAGINA);
      } else {
        if (pagina > 1) setHayMas(false);
        else setArticulos([]);
      }
    } catch (error) {
      console.error("Error al cargar artículos:", error);
    } finally {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  // Carga inicial
  useEffect(() => { 
    const q = query(
      collection(db, "articulos_academicos"), 
      orderBy("fechaPublicacion", "desc"),
      limit(ARTICULOS_POR_PAGINA)
    );
    fetchArticulos(q);
  }, []);

  const paginaSiguiente = () => {
    if (!lastVisible) return;
    const q = query(
      collection(db, "articulos_academicos"),
      orderBy("fechaPublicacion", "desc"),
      startAfter(lastVisible),
      limit(ARTICULOS_POR_PAGINA)
    );
    fetchArticulos(q);
    setPagina(prev => prev + 1);
  };

  const paginaAnterior = () => {
    if (!firstVisible) return;
    const q = query(
      collection(db, "articulos_academicos"),
      orderBy("fechaPublicacion", "desc"),
      endBefore(firstVisible),
      limitToLast(ARTICULOS_POR_PAGINA)
    );
    fetchArticulos(q);
    setPagina(prev => prev - 1);
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString(i18n.language || "es-ES", { year: "numeric", month: "long", day: "numeric" });
  };

  // ESTADO DE CARGA HOMOLOGADO CON MUI
  if (loading && articulos.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-20" role="status">
        <CircularProgress size={50} thickness={4} sx={{ color: '#1D3557' }} />
        <span className="text-main-blue font-bold text-sm uppercase tracking-widest animate-pulse">
          {t('articulos.cargando', 'Cargando repositorio...')}
        </span>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      <PageHeader 
        titulo={t('articulos.header_titulo', 'Artículos Académicos')} 
        subtitulo={t('articulos.header_subtitulo', 'Investigación y análisis especializado en Derechos Humanos.')} 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative pt-4 md:pt-6 px-0 z-10" aria-label="Lista de artículos académicos">
          <div className="max-w-7xl mx-auto bg-white overflow-hidden">
            
            <div className="px-6 md:px-12 lg:px-16 pt-4 md:pt-6 pb-12 animate-fade-in-up w-full">
              
              {articulos.length === 0 ? (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-main-blue mb-4 uppercase tracking-widest">
                    {t('articulos.repositorio_titulo', 'Repositorio en Organización')}
                  </h2>
                  <p className="text-gray-500 font-light max-w-2xl mx-auto leading-relaxed italic">
                    {t('articulos.repositorio_desc', 'Estamos digitalizando y categorizando nuestra producción académica para facilitar su consulta y descarga gratuita. Próximamente encontrará aquí ensayos, ponencias y artículos de nuestros expertos.')}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
                    {articulos.map((articulo) => (
                      <article key={articulo.id} role="listitem">
                        <Link 
                          to={`/articulos-academicos/${articulo.slug || articulo.id}`}
                          className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-pale-blue transition-all duration-300 flex flex-col group cursor-pointer h-full"
                          aria-label={`${t('articulos.aria_leer_articulo', 'Leer artículo:')} ${articulo.titulo}`}
                        >
                          {articulo.imagenPrincipalUrl && (
                            <div className="w-full aspect-video overflow-hidden bg-gray-200 shrink-0">
                              <img 
                                src={articulo.imagenPrincipalUrl} 
                                alt="" 
                                aria-hidden="true"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            </div>
                          )}
                          <div className="p-6 flex flex-col grow">
                            <span className="text-xs font-black text-main-red uppercase tracking-widest mb-3 block">
                              {formatearFecha(articulo.fechaPublicacion)}
                            </span>
                            <h3 className="text-xl font-bold text-main-blue group-hover:text-light-blue transition-colors mb-3 line-clamp-2 leading-tight">
                              {articulo.titulo}
                            </h3>
                            <p className="text-gray-600 font-light text-sm line-clamp-3 mb-6 leading-relaxed grow">
                              {articulo.resumen}
                            </p>
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-main-blue uppercase tracking-widest group-hover:text-main-red transition-colors mt-auto">
                              {t('articulos.leer_articulo', 'Leer artículo')} <span className="text-lg leading-none" aria-hidden="true">&rarr;</span>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>

                  {/* CONTROLES DE PAGINACIÓN MEJORADOS CON MUI */}
                  <nav className="mt-16 flex items-center justify-center gap-8 border-t border-gray-100 pt-10" aria-label="Navegación de páginas de artículos">
                    <Button 
                      onClick={paginaAnterior}
                      disabled={pagina === 1 || loading}
                      variant="outlined"
                      startIcon={<span className="text-lg leading-none">&larr;</span>}
                      sx={{
                        px: 4,
                        py: 1,
                        borderRadius: '50px',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        letterSpacing: '0.1em',
                        color: 'primary.main',
                        borderColor: 'primary.main',
                        '&:hover': { bgcolor: 'rgba(29, 53, 87, 0.04)', borderColor: 'primary.main' },
                        '&.Mui-disabled': { color: '#D1D5DB', borderColor: '#E5E7EB' }
                      }}
                    >
                      {t('articulos.anterior', 'Anterior')}
                    </Button>

                    <span className="text-main-blue font-black text-xl" aria-current="page">
                      <span className="sr-only">Página actual:</span> {pagina}
                    </span>

                    <Button 
                      onClick={paginaSiguiente}
                      disabled={!hayMas || loading}
                      variant="outlined"
                      endIcon={<span className="text-lg leading-none">&rarr;</span>}
                      sx={{
                        px: 4,
                        py: 1,
                        borderRadius: '50px',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        letterSpacing: '0.1em',
                        color: 'primary.main',
                        borderColor: 'primary.main',
                        '&:hover': { bgcolor: 'rgba(29, 53, 87, 0.04)', borderColor: 'primary.main' },
                        '&.Mui-disabled': { color: '#D1D5DB', borderColor: '#E5E7EB' }
                      }}
                    >
                      {t('articulos.siguiente', 'Siguiente')}
                    </Button>
                  </nav>
                </>
              )}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}