// src/pages/Noticias.jsx
import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, limit, startAfter, endBefore, limitToLast } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const NOTICIAS_POR_PAGINA = 10;

export default function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Paginación
  const [firstVisible, setFirstVisible] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(true);

  // Función de carga genérica
  const fetchNoticias = async (consulta) => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(consulta);
      
      if (!querySnapshot.empty) {
        // Guardamos los punteros para la paginación
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        
        const noticiasData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNoticias(noticiasData);
        
        // Verificamos si hay una posible página siguiente
        setHayMas(querySnapshot.docs.length === NOTICIAS_POR_PAGINA);
      } else {
        if (pagina > 1) setHayMas(false);
        else setNoticias([]);
      }
    } catch (error) {
      console.error("Error al obtener noticias:", error);
    } finally {
      setLoading(false);
      window.scrollTo(0, 0); // Volver arriba al cambiar de página
    }
  };

  // Carga inicial: Salta la primera noticia (la de la portada)
  useEffect(() => {
    const iniciarCentroNoticias = async () => {
      try {
        // 1. Obtenemos solo la noticia más reciente para usarla como punto de partida
        const qCursor = query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"), limit(1));
        const snapCursor = await getDocs(qCursor);
        
        if (!snapCursor.empty) {
          // 2. Iniciamos la carga normal saltando esa primera noticia (startAfter)
          const q = query(
            collection(db, "noticias"),
            orderBy("fechaPublicacion", "desc"),
            startAfter(snapCursor.docs[0]),
            limit(NOTICIAS_POR_PAGINA)
          );
          fetchNoticias(q);
        } else {
          // Si no hay ninguna noticia
          setLoading(false);
        }
      } catch (error) {
        console.error("Error en carga inicial:", error);
        setLoading(false);
      }
    };

    iniciarCentroNoticias();
  }, []);

  const paginaSiguiente = () => {
    if (!lastVisible) return;
    const q = query(
      collection(db, "noticias"),
      orderBy("fechaPublicacion", "desc"),
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
      orderBy("fechaPublicacion", "desc"),
      endBefore(firstVisible),
      limitToLast(NOTICIAS_POR_PAGINA)
    );
    fetchNoticias(q);
    setPagina(prev => prev - 1);
  };

  if (loading && noticias.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-20" role="status">
        <div className="w-16 h-16 border-4 border-pale-blue border-t-main-red rounded-full animate-spin mb-6" aria-hidden="true"></div>
        <span className="text-main-blue font-bold text-lg uppercase tracking-widest">Cargando Noticias...</span>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* HEADER ESTANDARIZADO */}
      <PageHeader 
        titulo="Centro de Noticias" 
        subtitulo="Archivo histórico y actualidad institucional del IIRESODH." 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        {/* CONTENEDOR INSTITUCIONAL HOMOLOGADO */}
        <section className="relative pt-12 md:pt-16 px-0 md:px-8 z-10">
          <div className={`max-w-7xl mx-auto bg-white overflow-hidden md:rounded-3xl ${noticias.length === 0 ? 'min-h-100 flex items-center justify-center' : ''}`}>
            
            <div className="px-8 md:px-12 lg:px-16 py-12 md:py-16 animate-fade-in-up w-full">
              
              {noticias.length === 0 ? (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-main-blue mb-4 uppercase tracking-widest">
                    No se encontraron entradas
                  </h2>
                  <p className="text-gray-500 font-light max-w-2xl mx-auto leading-relaxed italic">
                    Nuestra sala de prensa está siendo actualizada. Pronto encontrará aquí los últimos comunicados institucionales.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6" role="list">
                  {noticias.map((noticia) => (
                    <article key={noticia.id} role="listitem">
                      <Link 
                        to={`/noticias/${noticia.slug || noticia.id}`} 
                        className="group bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6 md:gap-8 hover:shadow-xl transition-all duration-300"
                        aria-label={`Leer noticia: ${noticia.titulo}`}
                      >
                        {/* Miniatura Izquierda */}
                        <div className="w-full md:w-48 h-48 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-50">
                          <img 
                            src={noticia.imagenPrincipalUrl} 
                            alt="" 
                            aria-hidden="true"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
                        </div>

                        {/* Contenido Derecha */}
                        <div className="flex flex-col grow min-w-0">
                          <span className="text-xs font-black text-main-red uppercase tracking-widest mb-2">
                            {noticia.fechaPublicacion?.toDate ? 
                              new Date(noticia.fechaPublicacion.toDate()).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) 
                              : 'Reciente'}
                          </span>
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

              {/* Controles de Paginación */}
              {noticias.length > 0 && (
                <nav className="mt-16 flex items-center justify-center gap-8 border-t border-gray-100 pt-10" aria-label="Navegación de noticias">
                  <button 
                    onClick={paginaAnterior}
                    disabled={pagina === 1 || loading}
                    className={`px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                      pagina === 1 || loading 
                      ? 'text-gray-300 cursor-not-allowed border border-gray-200' 
                      : 'text-main-blue hover:bg-main-blue hover:text-white border border-main-blue cursor-pointer'
                    }`}
                    aria-label="Ir a la página anterior de noticias"
                  >
                    &larr; Anterior
                  </button>

                  <span className="text-main-blue font-black text-xl" aria-current="page">
                    <span className="sr-only">Página actual:</span> {pagina}
                  </span>

                  <button 
                    onClick={paginaSiguiente}
                    disabled={!hayMas || loading}
                    className={`px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                      !hayMas || loading 
                      ? 'text-gray-300 cursor-not-allowed border border-gray-200' 
                      : 'text-main-blue hover:bg-main-blue hover:text-white border border-main-blue cursor-pointer'
                    }`}
                    aria-label="Ir a la página siguiente de noticias"
                  >
                    Siguiente &rarr;
                  </button>
                </nav>
              )}

            </div>
          </div>
        </section>

      </div>
    </main>
  );
}