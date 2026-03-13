// src/pages/Noticias.jsx
import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

export default function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const q = query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"));
        const querySnapshot = await getDocs(q);
        const noticiasData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNoticias(noticiasData);
      } catch (error) {
        console.error("Error al obtener noticias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-main-blue font-bold text-xl">Cargando Noticias...</div>;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="bg-white text-main-blue py-8 md:py-10 px-6 text-center relative z-20 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 uppercase">Noticias y Actualidad</h1>
        <p className="text-lg text-light-blue max-w-3xl mx-auto font-medium">
          Mantente informado sobre nuestras últimas acciones y proyectos.
        </p>
        <div className="w-20 h-1 bg-main-red mx-auto mt-6 rounded-full"></div>
      </div>

      <div className="relative overflow-hidden grow">
        <div className="bg-watermark"></div>

        <div className="relative z-10 max-w-7xl mx-auto py-12 px-6">
          {noticias.length === 0 ? (
            <div className="text-center text-light-blue text-xl py-20 bg-white/80 backdrop-blur-sm rounded-xl">
              No hay noticias publicadas en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {noticias.map((noticia) => (
                <Link 
                  key={noticia.id} 
                  to={`/noticias/${noticia.id}`} 
                  // Agregamos la clase "group" y una animación sutil para indicar que es cliqueable
                  className="group bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="aspect-4/5 w-full overflow-hidden bg-white border-b border-gray-100">
                    <img 
                      src={noticia.imagenPrincipalUrl} 
                      alt={noticia.titulo} 
                      // Zoom ligero a la imagen al hacer hover sobre cualquier parte de la tarjeta
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-6 flex flex-col grow">
                    {/* El título cambia de color al hacer hover sobre la tarjeta */}
                    <h2 className="text-xl font-bold text-main-blue mb-3 line-clamp-2 group-hover:text-light-blue transition-colors">
                      {noticia.titulo}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 grow">
                      {noticia.resumen}
                    </p>
                    {/* El texto inferior se comporta como un botón y reacciona al hover global de la tarjeta */}
                    <div className="text-main-red font-bold group-hover:text-main-blue transition-colors mt-auto flex items-center gap-1">
                      Leer noticia completa <span>&rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}