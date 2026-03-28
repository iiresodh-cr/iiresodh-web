// src/pages/ArticuloDetalle.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// MOTOR ESTRUCTURAL PURO
export const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  
  // 1. Escapar < y > por seguridad, pero NO TOCAR el & para no romper URLs
  let procesado = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const linksGuardados = []; // Caja fuerte temporal

  // 2. Extraer Markdown: [Texto visible](URL)
  procesado = procesado.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, url) => {
    let visible = label;
    // Si la etiqueta visible es muy larga, la acortamos a 45 caracteres
    if (visible.length > 45) {
      visible = visible.substring(0, 42) + "...";
    }
    linksGuardados.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline break-all">${visible}</a>`);
    return `__LINK_${linksGuardados.length - 1}__`; // Dejamos marcador
  });

  // 3. Extraer URLs crudas pegadas directamente
  procesado = procesado.replace(/(https?:\/\/[^\s]+)/g, (match, url) => {
    if (url.includes("__LINK_")) return match; // Evitar procesar los marcadores
    
    let visible = url;
    // Acortar visualmente la URL a 45 caracteres
    if (visible.length > 45) {
      visible = visible.substring(0, 42) + "...";
    }
    linksGuardados.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline break-all">${visible}</a>`);
    return `__LINK_${linksGuardados.length - 1}__`; // Dejamos marcador
  });

  // 4. Procesar Hashtags
  procesado = procesado.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (match) => {
    const term = match.substring(1);
    return `<a href="/buscar?q=${term}" class="text-light-blue hover:text-main-red font-bold">${match}</a>`;
  });

  // 5. Restaurar Links desde la caja fuerte
  procesado = procesado.replace(/__LINK_(\d+)__/g, (match, i) => linksGuardados[i]);

  // 6. Convertir saltos de línea a párrafos
  const parrafos = procesado.split(/\n\s*\n/);
  return parrafos.map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`).join('');
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-20" role="status">
        <div className="w-16 h-16 border-4 border-pale-blue border-t-main-red rounded-full animate-spin mb-6" aria-hidden="true"></div>
        <span className="text-main-blue font-bold text-lg uppercase tracking-widest">Cargando artículo...</span>
      </div>
    );
  }

  if (!articulo) return null;

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative pt-12 md:pt-16 px-0 md:px-8 z-10">
          <article className="max-w-7xl mx-auto bg-white overflow-hidden md:rounded-3xl">
            
            <div className="px-8 pt-8 md:px-12 lg:px-16 md:pt-12">
              <Link to="/articulos-academicos" className="inline-flex items-center gap-2 text-xs font-bold text-main-red uppercase tracking-widest hover:text-main-blue transition-colors" aria-label="Regresar al repositorio de artículos">
                <span className="text-lg leading-none" aria-hidden="true">&larr;</span> Volver al repositorio
              </Link>
            </div>

            <div className="px-8 md:px-12 lg:px-16 py-8 md:py-12 animate-fade-in-up">
              
              <header className="mb-10 border-b border-gray-100 pb-10">
                <span className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 block">
                  {formatearFecha(articulo.fechaPublicacion)}
                </span>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-main-blue leading-tight mb-6">
                  {articulo.titulo}
                </h1>
              </header>

              {articulo.imagenPrincipalUrl && (
                <div className="mb-12 w-full rounded-2xl overflow-hidden bg-gray-50">
                  <img 
                    src={articulo.imagenPrincipalUrl} 
                    alt={`Imagen ilustrativa del artículo: ${articulo.titulo}`} 
                    className="w-full max-h-150 object-contain"
                  />
                </div>
              )}

              <div 
                className="noticia-content"
                dangerouslySetInnerHTML={{ __html: formatearTextoConLinksYHashtags(articulo.contenido) }}
              />

            </div>
          </article>
        </section>
      </div>
    </main>
  );
}