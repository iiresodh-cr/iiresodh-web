// src/pages/Noticias.jsx
import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

// Importar el isotipo para el fondo
import isotipo from "../assets/isotipo-blanco.png";

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
    // Pantalla de carga 100% blanca
    return <div className="min-h-screen bg-white flex items-center justify-center text-[#1D3557] font-bold text-xl">Cargando Noticias...</div>;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      
      {/* HEADER */}
      <div className="bg-white text-[#1D3557] py-8 md:py-10 px-6 text-center relative z-20 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 uppercase">Noticias y Actualidad</h1>
        <p className="text-lg text-[#457B9D] max-w-3xl mx-auto font-medium">
          Mantente informado sobre nuestras últimas acciones y proyectos.
        </p>
        <div className="w-20 h-1 bg-[#B92F32] mx-auto mt-6 rounded-full"></div>
      </div>

      {/* CONTENEDOR PRINCIPAL CON MARCA DE AGUA */}
      <div className="relative overflow-hidden flex-grow">
        
        {/* CAPA DE MARCA DE AGUA */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${isotipo})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '500px', 
            backgroundPosition: 'top center',
            opacity: 0.04, 
            filter: 'invert(1)', 
          }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto py-12 px-6">
          {noticias.length === 0 ? (
            <div className="text-center text-[#457B9D] text-xl py-20 bg-white/80 backdrop-blur-sm rounded-xl">
              No hay noticias publicadas en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {noticias.map((noticia) => (
                <div key={noticia.id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-100 hover:shadow-xl transition-shadow">
                  {/* Imagen rígida 4:5 */}
                  <div className="aspect-[4/5] w-full overflow-hidden bg-white border-b border-gray-100">
                    <img 
                      src={noticia.imagenPrincipalUrl} 
                      alt={noticia.titulo} 
                      className="w-full h-full object-contain p-2" 
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold text-[#1D3557] mb-3 line-clamp-2">{noticia.titulo}</h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{noticia.resumen}</p>
                    <Link 
                      to={`/noticias/${noticia.id}`} 
                      className="text-[#B92F32] font-bold hover:text-[#1D3557] transition-colors mt-auto flex items-center gap-1"
                    >
                      Leer noticia completa <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}