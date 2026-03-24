// src/pages/Noticias.jsx
import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, limit, startAfter, endBefore, limitToLast } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

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
        
        // Verificamos si hay una posible página siguiente (aproximado)
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

  // Carga inicial
  useEffect(() => {
    const q = query(
      collection(db, "noticias"),
      orderBy("fechaPublicacion", "desc"),
      limit(NOTICIAS_POR_PAGINA)
    );
    fetchNoticias(q);
  }, []);

  const paginaSiguiente = () => {
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
    return <div className="min-h-screen bg-white flex items-center justify-center text-main-blue font-bold text-xl tracking-widest uppercase">Cargando Noticias...</div>;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      {/* Encabezado */}
      <div className="bg-white text-main-blue py-10 px-6 text-center border-b border-gray-100">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-2 uppercase">Centro de Noticias</h1>
        <p className="text-gray-500 max-w-2xl mx-auto font-light italic">
          Archivo histórico y actualidad institucional del IIRESODH.
        </p>
      </div>

      <div className="relative grow pb-20">
        <div className="bg-watermark"></div>

        <div className="relative z-10 max-w-5xl mx-auto py-10 px-6">
          {noticias.length === 0 ? (
            <div className="text-center text-gray-400 py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 uppercase font-bold tracking-widest">
              No se encontraron entradas
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {noticias.map((noticia) => (
                <Link 
                  key={noticia.id} 
                  to={`/noticias/${noticia.slug || noticia.id}`} 
                  className="group bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-4 md:gap-6 hover:shadow-md transition-all hover:border-main-red/20"
                >
                  {/* Miniatura Izquierda */}
                  <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-50">
                    <img 
                      src={noticia.imagenPrincipalUrl} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>

                  {/* Contenido Derecha */}
                  <div className="flex flex-col grow min-w-0">
                    <span className="text-[10px] font-bold text-main-red uppercase tracking-widest mb-1">
                      {noticia.fechaPublicacion?.toDate ? 
                        new Date(noticia.fechaPublicacion.toDate()).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) 
                        : 'Reciente'}
                    </span>
                    <h2 className="text-base md:text-xl font-extrabold text-main-blue mb-1 line-clamp-2 leading-tight group-hover:text-main-red transition-colors">
                      {noticia.titulo}
                    </h2>
                    <p className="text-gray-500 text-sm line-clamp-1 md:line-clamp-2 font-light hidden sm:block">
                      {noticia.resumen}
                    </p>
                    <div className="mt-2 text-main-red text-[11px] font-black uppercase flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Leer más <span>&rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Controles de Paginación */}
          <div className="mt-12 flex items-center justify-center gap-8">
            <button 
              onClick={paginaAnterior}
              disabled={pagina === 1 || loading}
              className={`px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest transition-all ${
                pagina === 1 || loading 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-main-blue hover:bg-main-blue hover:text-white border border-main-blue'
              }`}
            >
              &larr; Anterior
            </button>

            <span className="text-main-blue font-black text-lg">
              {pagina}
            </span>

            <button 
              onClick={paginaSiguiente}
              disabled={!hayMas || loading}
              className={`px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest transition-all ${
                !hayMas || loading 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-main-blue hover:bg-main-blue hover:text-white border border-main-blue'
              }`}
            >
              Siguiente &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}