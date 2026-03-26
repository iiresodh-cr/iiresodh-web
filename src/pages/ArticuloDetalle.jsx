// src/pages/ArticuloDetalle.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// MOTOR DE RENDERIZADO ESTRUCTURAL
const formatearTextoEstructural = (texto) => {
  if (!texto) return "";

  let seguro = texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  seguro = seguro.replace(/\[([^\]]+)\]\((https?:\/\/[^\s<)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  seguro = seguro.replace(/(?<!href="|href=)(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  seguro = seguro.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (hashtag) => {
    const termino = hashtag.substring(1); 
    return `<a href="/buscar?q=${termino}" class="text-light-blue font-semibold hover:text-main-red transition-colors">${hashtag}</a>`;
  });

  const parrafos = seguro.split(/\n\s*\n/);
  const htmlFinal = parrafos.map(p => {
    return `<p>${p.replace(/\n/g, '<br />')}</p>`;
  }).join('');

  return htmlFinal;
};

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
          if (docSnap.exists()) setArticulo({ id: docSnap.id, ...docSnap.data() });
          else return navigate("/articulos-academicos");
        }
      } catch (error) { console.error("Error:", error); } 
      finally { setLoading(false); }
    };
    if (slug) fetchArticulo();
  }, [slug, navigate]);

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-main-blue uppercase">Cargando...</div>;
  if (!articulo) return null;

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark"></div>
        
        <section className="relative pt-12 md:pt-16 px-0 md:px-8 z-10">
          {/* CONTENEDOR INSTITUCIONAL PLANO (Sin sombra) */}
          <div className="max-w-7xl mx-auto bg-white overflow-hidden md:rounded-3xl border border-gray-100">
            
            <div className="px-8 pt-8 md:px-12 lg:px-16 md:pt-12">
              <Link to="/articulos-academicos" className="inline-flex items-center gap-2 text-xs font-bold text-main-red uppercase tracking-widest hover:text-main-blue">
                <span className="text-lg leading-none">&larr;</span> Volver al repositorio
              </Link>
            </div>
            
            <div className="px-8 md:px-12 lg:px-16 py-8 md:py-12">
              <div className="mb-10 border-b border-gray-100 pb-10">
                <span className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 block">
                  {formatearFecha(articulo.fechaPublicacion)}
                </span>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-main-blue leading-tight mb-6">
                  {articulo.titulo}
                </h1>
              </div>
              
              {articulo.imagenPrincipalUrl && (
                {/* TARJETA DE IMAGEN CON SOMBRA (shadow-sm) */}
                <div className="mb-12 w-full rounded-2xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
                  <img src={articulo.imagenPrincipalUrl} alt="" className="w-full max-h-150 object-contain" />
                </div>
              )}
              
              {/* Contenido insertado con la tipografía heredada del CSS */}
              <div 
                className="noticia-content"
                dangerouslySetInnerHTML={{ __html: formatearTextoEstructural(articulo.contenido) }}
              />
            </div>
            
          </div>
        </section>
      </div>
    </div>
  );
}