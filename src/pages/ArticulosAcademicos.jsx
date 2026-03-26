// src/pages/ArticulosAcademicos.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit, startAfter, endBefore, limitToLast } from "firebase/firestore";
import { db } from "../firebase/config";
import PageHeader from "../components/PageHeader";

const ARTICULOS_POR_PAGINA = 10;

export default function ArticulosAcademicos() {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para Paginación
  const [firstVisible, setFirstVisible] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(true);

  // Función de carga genérica con lógica de paginación
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
        
        // Verificamos si hay una posible página siguiente
        setHayMas(querySnapshot.docs.length === ARTICULOS_POR_PAGINA);
      } else {
        if (pagina > 1) setHayMas(false);
        else setArticulos([]);
      }
    } catch (error) {
      console.error("Error al cargar artículos:", error);
    } finally {
      setLoading(false);
      window.scrollTo(0, 0); // Volver arriba al cambiar de página
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

  // Utilidad para formatear la fecha de Firebase
  const formatearFecha = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading && articulos.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-20">
        <div className="w-16 h-16 border-4 border-pale-blue border-t-main-red rounded-full animate-spin mb-6"></div>
        <span className="text-main-blue font-bold text-lg uppercase tracking-widest">Cargando repositorio...</span>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* HEADER ESTANDARIZADO - Subtítulo ajustado a una sola línea */}
      <PageHeader 
        titulo="Artículos Académicos" 
        subtitulo="Investigación y análisis especializado en Derechos Humanos." 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark"></div>

        {/* CONTENEDOR INSTITUCIONAL */}
        <section className="relative pt-12 md:pt-16 px-0 md:px-8 z-10">
          {/* CONTENEDOR PLANO: Sin sombras ni bordes */}
          <div className={`max-w-7xl mx-auto bg-white overflow-hidden md:rounded-3xl ${articulos.length === 0 ? 'min-h-100 flex items-center justify-center' : ''}`}>
            
            <div className="px-8 md:px-12 lg:px-16 py-12 md:py-16 animate-fade-in-up w-full">
              
              {articulos.length === 0 ? (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-main-blue mb-4 uppercase tracking-widest">
                    Repositorio en Organización
                  </h2>
                  <p className="text-gray-500 font-light max-w-2xl mx-auto leading-relaxed italic">
                    Estamos digitalizando y categorizando nuestra producción académica para facilitar su consulta y descarga gratuita. Próximamente encontrará aquí ensayos, ponencias y artículos de nuestros expertos.
                  </p>
                </div>
              ) : (
                <>
                  {/* GRID DE TARJETAS DE ARTÍCULOS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articulos.map((articulo) => (
                      /* TODA LA TARJETA ES UN LINK */
                      <Link 
                        key={articulo.id} 
                        to={`/articulos-academicos/${articulo.slug || articulo.id}`}
                        className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-pale-blue transition-all duration-300 flex flex-col group cursor-pointer"
                      >
                        
                        {articulo.imagenPrincipalUrl && (
                          <div className="w-full aspect-video overflow-hidden bg-gray-200 shrink-0">
                            <img 
                              src={articulo.imagenPrincipalUrl} 
                              alt={articulo.titulo} 
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
                          
                          {/* Div con estilo visual de botón */}
                          <div className="inline-flex items-center gap-2 text-xs font-bold text-main-blue uppercase tracking-widest group-hover:text-main-red transition-colors mt-auto">
                            Leer artículo <span className="text-lg leading-none">&rarr;</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Controles de Paginación dentro del lienzo blanco */}
                  <div className="mt-16 flex items-center justify-center gap-8 border-t border-gray-100 pt-10">
                    <button 
                      onClick={paginaAnterior}
                      disabled={pagina === 1 || loading}
                      className={`px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                        pagina === 1 || loading 
                        ? 'text-gray-300 cursor-not-allowed border border-gray-200' 
                        : 'text-main-blue hover:bg-main-blue hover:text-white border border-main-blue cursor-pointer'
                      }`}
                    >
                      &larr; Anterior
                    </button>

                    <span className="text-main-blue font-black text-xl">
                      {pagina}
                    </span>

                    <button 
                      onClick={paginaSiguiente}
                      disabled={!hayMas || loading}
                      className={`px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                        !hayMas || loading 
                        ? 'text-gray-300 cursor-not-allowed border border-gray-200' 
                        : 'text-main-blue hover:bg-main-blue hover:text-white border border-main-blue cursor-pointer'
                      }`}
                    >
                      Siguiente &rarr;
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}