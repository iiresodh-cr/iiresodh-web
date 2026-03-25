// src/pages/ArticuloDetalle.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function ArticuloDetalle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchArticulo = async () => {
      try {
        const q = query(collection(db, "articulos_academicos"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setArticulo({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        } else {
          const docRef = doc(db, "articulos_academicos", slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setArticulo({ id: docSnap.id, ...docSnap.data() });
          } else {
            navigate("/articulos-academicos");
            return;
          }
        }
      } catch (error) {
        console.error("Error al cargar el artículo:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticulo();
    }
  }, [slug, navigate]);

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-20">
        <div className="w-16 h-16 border-4 border-pale-blue border-t-main-red rounded-full animate-spin mb-6"></div>
        <span className="text-main-blue font-bold text-lg uppercase tracking-widest">Cargando artículo...</span>
      </div>
    );
  }

  if (!articulo) return null;

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark"></div>

        <section className="relative pt-12 md:pt-20 px-6 md:px-8 z-10">
          <div className="max-w-4xl mx-auto bg-white overflow-hidden shadow-sm md:rounded-3xl border border-gray-100">
            
            <div className="px-8 pt-8 md:px-16 md:pt-12">
              <Link to="/articulos-academicos" className="inline-flex items-center gap-2 text-xs font-bold text-main-red uppercase tracking-widest hover:text-main-blue transition-colors">
                <span className="text-lg leading-none">&larr;</span> Volver al repositorio
              </Link>
            </div>

            <div className="px-8 md:px-16 py-8 md:py-12 animate-fade-in-up">
              
              <div className="mb-10 border-b border-gray-100 pb-10">
                <span className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 block">
                  {formatearFecha(articulo.fechaPublicacion)}
                </span>
                <h1 className="text-3xl md:text-5xl font-semibold text-main-blue leading-tight mb-6">
                  {articulo.titulo}
                </h1>
              </div>

              {articulo.imagenPrincipalUrl && (
                <div className="mb-12 w-full rounded-2xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
                  <img 
                    src={articulo.imagenPrincipalUrl} 
                    alt={articulo.titulo} 
                    className="w-full max-h-125 object-contain"
                  />
                </div>
              )}

              {/* AQUÍ ESTÁ EL CAMBIO CLAVE: Pasamos articulo.contenido directo */}
              <div 
                className="text-gray-700 text-lg md:text-xl font-light leading-relaxed noticia-content text-justify space-y-6"
                dangerouslySetInnerHTML={{ __html: articulo.contenido }}
              />

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}