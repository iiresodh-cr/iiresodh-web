// src/pages/ArticulosAcademicos.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import PageHeader from "../components/PageHeader";

export default function ArticulosAcademicos() {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    
    // Función para obtener los artículos desde Firebase
    const fetchArticulos = async () => {
      try {
        const q = query(collection(db, "articulos_academicos"), orderBy("fechaPublicacion", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArticulos(data);
      } catch (error) {
        console.error("Error al cargar artículos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticulos();
  }, []);

  // Utilidad para formatear la fecha de Firebase
  const formatearFecha = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* HEADER ESTANDARIZADO */}
      <PageHeader 
        titulo="Artículos Académicos" 
        subtitulo="Investigación, análisis y publicaciones especializadas en Derechos Humanos y Responsabilidad Social." 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark"></div>

        {/* CONTENEDOR INSTITUCIONAL */}
        <section className="relative pt-12 md:pt-16 px-0 md:px-8 z-10">
          {/* CONTENEDOR PLANO: Sin sombras ni bordes */}
          <div className={`max-w-7xl mx-auto bg-white overflow-hidden md:rounded-3xl ${articulos.length === 0 ? 'min-h-100 flex items-center justify-center' : ''}`}>
            
            <div className="px-8 md:px-12 lg:px-16 py-12 md:py-16 animate-fade-in-up w-full">
              
              {loading ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 border-4 border-pale-blue border-t-main-red rounded-full animate-spin mx-auto mb-6"></div>
                  <h2 className="text-xl font-bold text-main-blue uppercase tracking-widest">Cargando repositorio...</h2>
                </div>
              ) : articulos.length === 0 ? (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-main-blue mb-4 uppercase tracking-widest">
                    Repositorio en Organización
                  </h2>
                  <p className="text-gray-500 font-light max-w-2xl mx-auto leading-relaxed italic">
                    Estamos digitalizando y categorizando nuestra producción académica para facilitar su consulta y descarga gratuita. Próximamente encontrará aquí ensayos, ponencias y artículos de nuestros expertos.
                  </p>
                </div>
              ) : (
                /* GRID DE TARJETAS DE ARTÍCULOS */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articulos.map((articulo) => (
                    /* Tarjetas mantienen su interactividad */
                    <div key={articulo.id} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-pale-blue transition-all duration-300 flex flex-col group">
                      
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
                        
                        <Link 
                          to={`/articulos-academicos/${articulo.slug || articulo.id}`} 
                          className="inline-flex items-center gap-2 text-xs font-bold text-main-blue uppercase tracking-widest group-hover:text-main-red transition-colors mt-auto"
                        >
                          Leer artículo <span className="text-lg leading-none">&rarr;</span>
                        </Link>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}