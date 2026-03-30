// src/pages/NoticiaDetalle.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase/config";

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// Importaciones de MUI
import { CircularProgress, Button, Alert } from "@mui/material";

// ==========================================
// NUEVO MOTOR DE LINKS (INFALIBLE)
// ==========================================
export const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  
  let procesado = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const linksGuardados = [];

  procesado = procesado.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, url) => {
    linksGuardados.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline wrap-break-words">${label}</a>`);
    return `__LINK_${linksGuardados.length - 1}__`; 
  });

  procesado = procesado.replace(/(https?:\/\/[^\s]+)/g, (match, url) => {
    if (url.includes("__LINK_")) return match; 
    const textoFijo = "clic aquí";
    linksGuardados.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline wrap-break-words">${textoFijo}</a>`);
    return `__LINK_${linksGuardados.length - 1}__`; 
  });

  procesado = procesado.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (match) => {
    const term = match.substring(1);
    return `<a href="/buscar?q=${term}" class="text-light-blue hover:text-main-red font-bold">${match}</a>`;
  });

  procesado = procesado.replace(/__LINK_(\d+)__/g, (match, i) => linksGuardados[i]);

  const parrafos = procesado.split(/\n\s*\n/);
  return parrafos.map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`).join('');
};

export default function NoticiaDetalle() {
  const { id } = useParams(); 
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUrl = window.location.href;

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchNoticia = async () => {
      try {
        const q = query(collection(db, "noticias"), where("slug", "==", id), limit(1));
        const querySnapshot = await getDocs(q);
        let data = null;

        if (!querySnapshot.empty) {
          data = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        } else {
          const docRef = doc(db, "noticias", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) data = { id: docSnap.id, ...docSnap.data() };
        }

        if (data) {
          setNoticia(data);
          if (data.titulo) {
            document.title = `${data.titulo} | IIRESODH`;
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNoticia();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4" role="status">
        <CircularProgress size={50} thickness={4} sx={{ color: '#1D3557' }} />
        <span className="text-main-blue font-bold text-sm uppercase tracking-widest animate-pulse">
          Cargando Noticia...
        </span>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" role="alert">
        <Alert severity="error" variant="filled" sx={{ borderRadius: '12px', px: 4, py: 2 }}>
          <span className="font-bold text-lg">Noticia no encontrada</span>
          <p className="text-sm mt-1 opacity-90">Es posible que el enlace sea incorrecto o la publicación haya sido eliminada.</p>
        </Alert>
      </div>
    );
  }

  const todasLasImagenes = [noticia.imagenPrincipalUrl, ...(noticia.imagenesCarruselUrls || [])].filter(Boolean);

  const shareUrls = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(noticia.titulo + " " + currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(noticia.titulo)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
  };

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      <header className="bg-main-blue text-white py-14 px-6 text-center relative z-20">
        <span className="text-xs font-black text-main-red uppercase tracking-[0.3em] mb-4 block">
          {noticia.fechaPublicacion?.toDate ? 
            noticia.fechaPublicacion.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) 
            : 'Comunicado Oficial'}
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter mb-8 max-w-5xl mx-auto leading-[1.1]">
          {noticia.titulo}
        </h1>
        <div className="w-24 h-1.5 bg-main-red mx-auto rounded-full" aria-hidden="true"></div>
      </header>

      {/* CORRECCIÓN 1: Se quitó el 'overflow-hidden' del contenedor general para no romper el Sticky */}
      <div className="relative grow pb-20">
        
        {/* CORRECCIÓN 2: Se encierra la marca de agua en su propia "jaula" con overflow-hidden */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <div className="bg-watermark"></div>
        </div>

        <section className="relative pt-4 md:pt-6 px-0 z-10">
          
          {/* CORRECCIÓN 3: Se quitó el 'overflow-hidden' del article */}
          <article className="max-w-7xl mx-auto bg-white">
            
            <div className="px-6 md:px-12 lg:px-16 pt-4 md:pt-6 pb-6">
              <Button 
                component={Link} 
                to="/noticias" 
                startIcon={<span className="text-xl leading-none -mt-1" aria-hidden="true">&larr;</span>}
                sx={{ 
                  color: 'secondary.main', 
                  fontWeight: 'bold', 
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  '&:hover': { bgcolor: 'rgba(185, 47, 50, 0.04)', color: 'primary.main' } 
                }}
                aria-label="Regresar a las noticias"
              >
                Volver al repositorio
              </Button>
            </div>

            <div className="px-6 md:px-12 lg:px-16 pb-12 md:pb-16 animate-fade-in-up w-full">
              
              <div className="flex flex-col lg:flex-row gap-12 items-start">
                
                {/* LA MAGIA: lg:sticky y lg:top-8 ahora sí funcionarán libremente */}
                <div className="w-full lg:w-1/2 shrink-0 lg:sticky lg:top-8 z-20">
                  <Swiper 
                    modules={[Pagination, Autoplay]} 
                    pagination={{ clickable: true }} 
                    autoplay={{ delay: 5000 }} 
                    className="w-full swiper-custom-pagination"
                    aria-label="Galería de imágenes de la noticia"
                  >
                    {todasLasImagenes.map((url, i) => (
                      <SwiperSlide key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <img 
                          src={url} 
                          alt={`Imagen ${i + 1} de la noticia: ${noticia.titulo}`} 
                          className="w-full aspect-4/5 object-cover block" 
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                <div className="w-full lg:w-1/2 z-10">
                  <div 
                    className="noticia-content"
                    dangerouslySetInnerHTML={{ __html: formatearTextoConLinksYHashtags(noticia.contenido) }}
                  />
                  
                  <footer className="mt-12 pt-8 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 text-center lg:text-left">
                      Compartir esta noticia
                    </p>
                    
                    <nav className="flex flex-wrap justify-center lg:justify-start gap-3" aria-label="Redes sociales para compartir">
                      
                      <Button
                        component="a"
                        href={shareUrls.whatsapp}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        startIcon={<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>}
                        aria-label="Compartir en WhatsApp"
                        sx={{
                          borderRadius: 50,
                          px: 2.5,
                          py: 1,
                          color: '#6B7280',
                          bgcolor: '#F9FAFB',
                          borderColor: 'transparent',
                          fontWeight: 'bold',
                          letterSpacing: '0.05em',
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: '#F0FDF4', 
                            color: '#16A34A', 
                            borderColor: '#BBF7D0', 
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                          }
                        }}
                      >
                        WhatsApp
                      </Button>

                      <Button
                        component="a"
                        href={shareUrls.facebook}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        startIcon={<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
                        aria-label="Compartir en Facebook"
                        sx={{
                          borderRadius: 50,
                          px: 2.5,
                          py: 1,
                          color: '#6B7280',
                          bgcolor: '#F9FAFB',
                          borderColor: 'transparent',
                          fontWeight: 'bold',
                          letterSpacing: '0.05em',
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: '#EFF6FF', 
                            color: '#1D4ED8', 
                            borderColor: '#BFDBFE', 
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                          }
                        }}
                      >
                        Facebook
                      </Button>

                      <Button
                        component="a"
                        href={shareUrls.twitter}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        startIcon={<svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>}
                        aria-label="Compartir en Twitter (X)"
                        sx={{
                          borderRadius: 50,
                          px: 2.5,
                          py: 1,
                          color: '#6B7280',
                          bgcolor: '#F9FAFB',
                          borderColor: 'transparent',
                          fontWeight: 'bold',
                          letterSpacing: '0.05em',
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: '#000000', 
                            color: '#FFFFFF', 
                            borderColor: '#000000',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                      >
                        X (Twitter)
                      </Button>

                    </nav>
                  </footer>
                </div>
              </div>

            </div>
          </article>
        </section>

      </div>
    </main>
  );
}