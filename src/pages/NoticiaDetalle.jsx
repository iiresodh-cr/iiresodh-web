// src/pages/NoticiaDetalle.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase/config";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// FUNCIÓN: Detecta URLs y también Hashtags (#)
const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  const partes = texto.split(/(<[^>]+>)/g);
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 0) {
      let procesado = partes[i].replace(/(https?:\/\/[^\s<]+)/g, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red hover:text-main-blue font-bold underline transition-colors pointer-events-auto">${url}</a>`;
      });
      procesado = procesado.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (hashtag) => {
        const termino = hashtag.substring(1); 
        return `<a href="/buscar?q=${termino}" class="text-light-blue hover:text-main-red font-bold transition-colors pointer-events-auto">${hashtag}</a>`;
      });
      partes[i] = procesado;
    }
  }
  return partes.join('');
};

export default function NoticiaDetalle() {
  const { id } = useParams(); 
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener la URL actual para compartir
  const currentUrl = window.location.href;

  useEffect(() => {
    // Hacer scroll arriba al cargar
    window.scrollTo(0, 0);

    const fetchNoticia = async () => {
      try {
        const q = query(collection(db, "noticias"), where("slug", "==", id), limit(1));
        const querySnapshot = await getDocs(q);

        let data = null;

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0];
          data = { id: docData.id, ...docData.data() };
        } else {
          const docRef = doc(db, "noticias", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            data = { id: docSnap.id, ...docSnap.data() };
          }
        }

        if (data) {
          setNoticia(data);
          
          // INYECTOR DE OPEN GRAPH (Para que FB, X y WhatsApp vean la imagen)
          if (data.imagenPrincipalUrl) {
            // Actualizar o crear og:image
            let ogImage = document.querySelector('meta[property="og:image"]');
            if (!ogImage) {
              ogImage = document.createElement('meta');
              ogImage.setAttribute('property', 'og:image');
              document.head.appendChild(ogImage);
            }
            ogImage.setAttribute('content', data.imagenPrincipalUrl);

            // Actualizar o crear og:title
            let ogTitle = document.querySelector('meta[property="og:title"]');
            if (!ogTitle) {
              ogTitle = document.createElement('meta');
              ogTitle.setAttribute('property', 'og:title');
              document.head.appendChild(ogTitle);
            }
            ogTitle.setAttribute('content', data.titulo);
          }
        }
      } catch (error) {
        console.error("Error al obtener la noticia:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNoticia();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-main-blue font-bold text-xl">Cargando Noticia...</div>;
  }
  if (!noticia) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-bright-red font-bold text-xl">Noticia no encontrada</div>;
  }

  const todasLasImagenes = noticia.imagenPrincipalUrl ? [noticia.imagenPrincipalUrl] : [];
  if (noticia.imagenesCarruselUrls && noticia.imagenesCarruselUrls.length > 0) {
    todasLasImagenes.push(...noticia.imagenesCarruselUrls);
  }

  const contenidoNoticiaRaw = noticia.contenido || noticia.contenidoHTML || noticia.cuerpo || "<p>No hay contenido disponible para esta noticia.</p>";
  const contenidoNoticia = formatearTextoConLinksYHashtags(contenidoNoticiaRaw);

  let fechaFormateada = "Fecha no disponible";
  if (noticia.fechaPublicacion) {
    if (typeof noticia.fechaPublicacion === 'string') {
      fechaFormateada = noticia.fechaPublicacion;
    } else if (noticia.fechaPublicacion.toDate) {
      fechaFormateada = noticia.fechaPublicacion.toDate().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  // URLs de Share generadas dinámicamente
  const shareUrls = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(noticia.titulo + " " + currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(noticia.titulo)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="relative overflow-hidden grow pb-20">
        
        <div className="bg-watermark"></div>

        {/* Tarjeta exterior con max-w-6xl para mantener coherencia con el Home */}
        <section className="relative z-10 px-0 md:px-8 pt-8 md:pt-12">
          <div className="max-w-6xl mx-auto">
            
            <div className="bg-white md:rounded-3xl shadow-2xl overflow-hidden border-y md:border border-gray-100">
              
              <div className="p-8 md:p-12 border-b border-gray-100 text-center">
                <span className="text-sm font-extrabold text-bright-red uppercase tracking-widest mb-4 block">
                  PUBLICADO EL: {fechaFormateada}
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-main-blue leading-tight mb-6 max-w-4xl mx-auto">
                  {noticia.titulo}
                </h1>
                <div className="w-20 h-1 bg-main-red mx-auto rounded-full"></div>
              </div>

              {todasLasImagenes.length > 0 && (
                <div className="w-full bg-white border-b border-gray-100 relative aspect-4/5 md:aspect-auto md:h-120">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 4000 }}
                    className="w-full h-full absolute inset-0 swiper-custom-navigation"
                  >
                    {todasLasImagenes.map((url, index) => (
                      <SwiperSlide key={index} className="flex items-center justify-center bg-white w-full h-full">
                        <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-contain p-4" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}

              {/* Contenido de la Noticia */}
              <div className="p-8 md:p-12 lg:p-16">
                
                {/* Contenedor max-w-4xl mx-auto para que el texto sea cómodo de leer */}
                <div className="max-w-4xl mx-auto">
                  <div 
                    className="noticia-content text-lg text-gray-700 leading-loose prose-a:text-main-red hover:prose-a:text-main-blue prose-a:font-bold prose-strong:text-main-blue prose-strong:font-bold text-justify"
                    dangerouslySetInnerHTML={{ __html: contenidoNoticia }}
                  ></div>

                  {/* BOTONES DE COMPARTIR EN REDES SOCIALES */}
                  <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-main-blue font-bold uppercase tracking-widest text-sm">Compartir noticia:</span>
                    <div className="flex items-center gap-4">
                      
                      {/* WhatsApp */}
                      <a 
                        href={shareUrls.whatsapp} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-md transition-transform hover:scale-110"
                        aria-label="Compartir en WhatsApp"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                        </svg>
                      </a>

                      {/* Twitter / X */}
                      <a 
                        href={shareUrls.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-black hover:bg-gray-800 text-white p-3 rounded-full shadow-md transition-transform hover:scale-110"
                        aria-label="Compartir en X"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>

                      {/* Facebook */}
                      <a 
                        href={shareUrls.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-md transition-transform hover:scale-110"
                        aria-label="Compartir en Facebook"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>

                      {/* LinkedIn */}
                      <a 
                        href={shareUrls.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-800 hover:bg-blue-900 text-white p-3 rounded-full shadow-md transition-transform hover:scale-110"
                        aria-label="Compartir en LinkedIn"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>

                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}