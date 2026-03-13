// src/pages/NoticiaDetalle.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function NoticiaDetalle() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        const docRef = doc(db, "noticias", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setNoticia({ id: docSnap.id, ...docSnap.data() });
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
    return <div className="min-h-screen bg-white flex items-center justify-center text-[#1D3557] font-bold text-xl">Cargando Noticia...</div>;
  }
  if (!noticia) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-red-500 font-bold text-xl">Noticia no encontrada</div>;
  }

  const todasLasImagenes = noticia.imagenPrincipalUrl ? [noticia.imagenPrincipalUrl] : [];
  if (noticia.imagenesCarruselUrls && noticia.imagenesCarruselUrls.length > 0) {
    todasLasImagenes.push(...noticia.imagenesCarruselUrls);
  }

  const contenidoNoticia = noticia.contenido || noticia.contenidoHTML || noticia.cuerpo || "<p>No hay contenido disponible para esta noticia.</p>";

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

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="relative overflow-hidden flex-grow pb-20">
        
        <div className="bg-watermark"></div>

        <section className="relative z-10 px-8 pt-6">
          <div className="max-w-6xl mx-auto">
            
            <div className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              
              <div className="p-8 md:p-12 border-b border-gray-100 text-center">
                <span className="text-sm font-extrabold text-[#E63946] uppercase tracking-widest mb-4 block">
                  PUBLICADO EL: {fechaFormateada}
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#1D3557] leading-tight mb-6">
                  {noticia.titulo}
                </h1>
                <div className="w-20 h-1 bg-[#B92F32] mx-auto rounded-full"></div>
              </div>

              {todasLasImagenes.length > 0 && (
                <div className="w-full bg-white border-b border-gray-100 relative aspect-[4/5] md:aspect-auto md:h-[600px]">
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

              <div className="p-8 md:p-12 md:px-16">
                <div 
                  className="noticia-content text-lg text-gray-700 leading-loose prose-a:text-[#B92F32] hover:prose-a:text-[#1D3557] prose-a:font-bold prose-strong:text-[#1D3557] prose-strong:font-bold"
                  dangerouslySetInnerHTML={{ __html: contenidoNoticia }}
                ></div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}