// src/pages/Colombia.jsx
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

// Componentes de UI
import { Paper } from "@mui/material";

export default function Colombia() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticiasColombia = async () => {
      try {
        // LÓGICA: Filtramos por el tag "Colombia" que mencionaste
        const q = query(
          collection(db, "noticias"),
          where("tags", "array-contains", "Colombia"),
          orderBy("fechaPublicacion", "desc"),
          limit(6) // Mostramos las últimas 6 noticias de Colombia
        );

        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNoticias(docs);
      } catch (error) {
        console.error("Error al cargar noticias de Colombia:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticiasColombia();
  }, []);

  return (
    <main className="bg-white min-h-screen font-sans">
      {/* HERO ESPECÍFICO DE COLOMBIA */}
      <section className="bg-main-blue py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <span className="text-main-red font-black tracking-[0.3em] uppercase text-xs mb-4 block">
            Presencia Nacional
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            IIRESODH <span className="text-pale-blue">Colombia</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-light max-w-3xl leading-relaxed">
            Desde nuestra sede en Bogotá, impulsamos la defensa de los derechos humanos, 
            el litigio estratégico y la formación académica adaptada al contexto nacional.
          </p>
        </div>
      </section>

      {/* SECCIÓN DE NOTICIAS FILTRADAS */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-main-blue uppercase tracking-tight">
            Actualidad en Colombia
          </h2>
          <div className="grow h-px bg-gray-100"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-80 bg-gray-50 animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : noticias.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {noticias.map((item) => (
              <Link 
                key={item.id} 
                to={`/noticias/${item.slug || item.id}`}
                className="group flex flex-col h-full"
              >
                <Paper 
                  elevation={0}
                  className="flex flex-col h-full rounded-4xl overflow-hidden border border-gray-100 hover:border-main-red/20 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Imagen con Ratio Fijo */}
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={item.imagenPrincipalUrl} 
                      alt={item.titulo} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-main-blue/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Contenido de la noticia */}
                  <div className="p-6 flex flex-col grow bg-white">
                    <span className="text-main-red text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                      Colombia
                    </span>
                    <h3 className="text-xl font-bold text-main-blue mb-3 leading-snug group-hover:text-main-red transition-colors line-clamp-2">
                      {item.titulo}
                    </h3>
                    <p className="text-gray-500 text-sm font-light line-clamp-3 mb-6">
                      {item.resumen}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        {new Date(item.fechaPublicacion?.seconds * 1000).toLocaleDateString()}
                      </span>
                      <span className="text-main-blue font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        Leer más +
                      </span>
                    </div>
                  </div>
                </Paper>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No hay noticias recientes etiquetadas para Colombia.</p>
          </div>
        )}
      </section>

      {/* BLOQUE DE CONTACTO LOCAL O INFORMACIÓN ADICIONAL */}
      <section className="pb-20 px-6 max-w-7xl mx-auto">
         <Paper 
            elevation={0}
            className="bg-gray-50 rounded-[3rem] p-8 md:p-12 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8"
         >
            <div className="max-w-xl text-center md:text-left">
               <h2 className="text-2xl md:text-3xl font-black text-main-blue mb-4 uppercase tracking-tighter">Sede Bogotá</h2>
               <p className="text-gray-600 font-light">
                  Carrera. 11C No. 117-05. Oficina 5. Bogotá, Colombia.<br/>
                  Teléfono: Bogotá +7461964. Móvil: +57 301 4844324
               </p>
            </div>
            <Link to="/contacto" className="bg-main-red text-white font-bold py-4 px-10 rounded-xl hover:bg-red-800 transition-all uppercase tracking-widest text-xs">
               Contactar Sede
            </Link>
         </Paper>
      </section>
    </main>
  );
}