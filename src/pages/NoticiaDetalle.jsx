// src/pages/NoticiaDetalle.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase/config";

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// FUNCIÓN ACTUALIZADA: Ahora detecta formato Markdown [Texto Corto](URLLarga)
const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";

  // 1. Procesar enlaces estilo Markdown: [Texto visible](https://url-larga.com)
  let procesado = texto.replace(/\[([^\]]+)\]\((https?:\/\/[^\s<]+)\)/g, (match, textoEnlace, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-semibold underline transition-colors pointer-events-auto wrap-break-word">${textoEnlace}</a>`;
  });

  const partes = procesado.split(/(<[^>]+>)/g);
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 0) {
      // 2. Convertir URLs sueltas
      let parte = partes[i].replace(/(https?:\/\/[^\s<]+)/g, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-semibold underline transition-colors pointer-events-auto wrap-break-word">${url}</a>`;
      });
      // 3. Convertir Hashtags (#)
      parte = parte.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (hashtag) => {
        const termino = hashtag.substring(1); 
        return `<a href="/buscar?q=${termino}" class="text-light-blue font-semibold">${hashtag}</a>`;
      });
      partes[i] = parte;
    }
  }
  return partes.join('');
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

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-main-blue font-bold text-xl uppercase tracking-widest">Cargando Noticia...</div>;
  if (!noticia) return <div className="min-h-screen bg-white flex items-center justify-center text-bright-red font-bold text-xl">Noticia no encontrada</div>;

  const todasLasImagenes = [noticia.imagenPrincipalUrl, ...(noticia.imagenesCarruselUrls || [])].filter(Boolean);

  const shareUrls = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(noticia.titulo + " " + currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(noticia.titulo)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* ENCABEZADO: Franja Azul Sólida Institucional */}
      <div className="bg-main-blue text-white py-14 px-6 text-center relative z-20">
        <span className="text-xs font-black text-main-red uppercase tracking-[0.3em] mb-4 block">
          {noticia.fechaPublicacion?.toDate ? 
            noticia.fechaPublicacion.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) 
            : 'Comunicado Oficial'}
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter mb-8 max-w-5xl mx-auto leading-[1.1]">
          {noticia.titulo}
        </h1>
        <div className="w-24 h-1.5 bg-main-red mx-auto rounded-full"></div>
      </div>

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark"></div>

        <article className="relative z-10 max-w-6xl mx-auto px-6 pt-12">
          
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Carrusel de Imágenes */}
            <div className="w-full lg:w-1/2 shrink-0">
              <Swiper 
                modules={[Pagination, Autoplay]} 
                pagination={{ clickable: true }} 
                autoplay={{ delay: 5000 }} 
                className="w-full swiper-custom-pagination"
              >
                {todasLasImagenes.map((url, i) => (
                  <SwiperSlide key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <img 
                      src={url} 
                      alt="" 
                      className="w-full aspect-4/5 object-cover block" 
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Contenido de la Noticia */}
            <div className="w-full lg:w-1/2">
              <div 
                className="noticia-content text-lg text-gray-600 leading-relaxed font-light text-justify"
                dangerouslySetInnerHTML={{ __html: formatearTextoConLinksYHashtags(noticia.contenido) }}
              />
              
              <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 text-center lg:text-left">
                  Compartir esta noticia
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  
                  {/* WhatsApp */}
                  <a href={shareUrls.whatsapp} target="_blank" rel="noreferrer" 
                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 text-gray-500 hover:bg-green-50 hover:text-green-600 transition-all border border-transparent hover:border-green-200"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    <span className="text-xs font-bold uppercase tracking-wider">WhatsApp</span>
                  </a>

                  {/* Facebook */}
                  <a href={shareUrls.facebook} target="_blank" rel="noreferrer"
                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-200"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Facebook</span>
                  </a>

                  {/* Twitter / X */}
                  <a href={shareUrls.twitter} target="_blank" rel="noreferrer"
                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 text-gray-500 hover:bg-black hover:text-white transition-all border border-transparent hover:border-gray-800"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Twitter</span>
                  </a>

                </div>
              </div>
            </div>

          </div>
        </article>
      </div>
    </div>
  );
}