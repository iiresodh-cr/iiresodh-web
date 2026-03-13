// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Home() {
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUltimaNoticia = async () => {
      try {
        const q = query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setNoticia({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        }
      } catch (error) {
        console.error("Error al obtener la noticia:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUltimaNoticia();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-[#1D3557] font-bold text-xl">Cargando IIRESODH...</div>;
  }

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <div className="relative overflow-hidden flex-grow">
        
        {/* Marca de agua puramente en CSS */}
        <div className="bg-watermark"></div>

        <section className="relative pt-6 pb-12 px-8 z-10">
          <div className="max-w-6xl mx-auto">
            {!noticia ? (
              <div className="text-center text-[#457B9D] text-xl py-20 bg-white/80 rounded-xl backdrop-blur-sm shadow-sm">
                Aún no hay noticias publicadas.
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row border-t-8 border-[#B92F32] min-h-[450px] md:min-h-[480px]">
                
                <div className="w-full md:w-2/5 bg-white border-b md:border-b-0 md:border-r border-gray-100 relative flex-shrink-0"> 
                  <div className="aspect-[4/5] w-full relative">
                    <Swiper
                      modules={[Navigation, Pagination, Autoplay]}
                      navigation
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 4000 }}
                      className="absolute inset-0 w-full h-full swiper-custom-navigation"
                    >
                      <SwiperSlide className="flex items-center justify-center bg-white h-full w-full">
                        <img src={noticia.imagenPrincipalUrl} alt="Principal" className="w-full h-full object-contain" />
                      </SwiperSlide>
                      {noticia.imagenesCarruselUrls && noticia.imagenesCarruselUrls.map((url, index) => (
                        <SwiperSlide key={index} className="flex items-center justify-center bg-white h-full w-full">
                          <img src={url} alt={`Carrusel ${index + 1}`} className="w-full h-full object-contain" />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
                
                <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center bg-white/95">
                  <span className="text-xs font-extrabold text-[#E63946] uppercase tracking-widest mb-3">Última Noticia</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#1D3557] mb-6 leading-tight">{noticia.titulo}</h2>
                  <p className="text-gray-600 mb-8 text-lg font-light leading-relaxed">{noticia.resumen}</p>
                  <Link to={`/noticias/${noticia.id}`} className="inline-block bg-[#1D3557] hover:bg-[#457B9D] text-white font-bold py-3 px-8 rounded-full transition-colors self-start shadow-md">
                    Leer noticia completa
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="relative py-20 px-8 z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 text-[#1D3557] text-lg md:text-xl font-light leading-relaxed bg-white/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl">
            <p className="italic">
              El <strong className="font-extrabold text-[#457B9D]">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</strong>, nace en San José, Costa Rica, logrando crecer muy rápidamente para una más amplia y mejor atención que hoy nos permite tener oficinas de trabajo en varios países.
            </p>
            <p className="italic">
              Desde su creación fue una entidad con claridad en sus objetivos para el fortalecimiento, promoción y protección de los derechos humanos, y con ello incidir en una cultura donde el respeto sea asumido por las empresas e instituciones públicas como una forma de desarrollo directo.
            </p>
            <p className="italic">
              Fomenta el mejoramiento social, económico, cultural, educativo, organizativo y productivo por medio de la promoción de la responsabilidad social empresarial y la promoción y protección de los derechos humanos.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto border-t border-gray-200/60 relative z-10"></div>

        <section className="relative py-20 px-8 max-w-6xl mx-auto z-10">
          <h2 className="text-3xl font-extrabold text-[#B92F32] uppercase tracking-widest mb-12 text-center md:text-left">
            Nuestras Oficinas:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-[#1D3557] mb-4 border-b-2 border-[#A8DADC] pb-2 inline-block">Costa Rica</h3>
              <div className="text-gray-600 font-light space-y-1 text-sm md:text-base">
                <p>Centro Corporativo San Rafael, nivel 3</p>
                <p>San Rafael de Escazú, San José, Costa Rica</p>
                <p>CP 10201</p>
                <p className="pt-3 text-[#457B9D] font-medium">Teléfono: +506 4703 5727</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-[#1D3557] mb-4 border-b-2 border-[#A8DADC] pb-2 inline-block">Colombia</h3>
              <div className="text-gray-600 font-light space-y-1 text-sm md:text-base">
                <p>Carrera. 11C No. 117-05. Oficina 5</p>
                <p>Bogotá, Colombia</p>
                <p className="pt-3 text-[#457B9D] font-medium">Teléfono: Bogotá +7461964</p>
                <p className="text-[#457B9D] font-medium">Móvil: +57 301 4844324</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-[#1D3557] mb-4 border-b-2 border-[#A8DADC] pb-2 inline-block">México</h3>
              <div className="text-gray-600 font-light space-y-1 text-sm md:text-base">
                <p>Atención virtual o presencial previa cita.</p>
                <p className="pt-3 font-medium">
                  Email: <a href="mailto:contacto@iiresodh.org" className="text-[#457B9D] hover:text-[#B92F32] transition-colors">contacto@iiresodh.org</a>
                </p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-[#1D3557] mb-4 border-b-2 border-[#A8DADC] pb-2 inline-block">Guatemala</h3>
              <div className="text-gray-600 font-light space-y-1 text-sm md:text-base">
                <p>Diagonal 6 12-42, Edificio Design Center</p>
                <p>Oficina No. 506, Torre 1, Zona 10</p>
                <p>Ciudad de Guatemala</p>
                <p className="pt-3 text-[#457B9D] font-medium">Teléfono: +502 5557 7466</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
              <h3 className="text-2xl font-bold text-[#1D3557] mb-4 border-b-2 border-[#A8DADC] pb-2 inline-block">Canadá</h3>
              <div className="text-gray-600 font-light space-y-3 text-sm md:text-base">
                <p>Atención virtual o presencial previa cita en la ciudad de Lévis, Québec.</p>
                <p>En Toronto, Ontario de manera vinculada con la firma de abogados Waldman & Associates.</p>
                <p className="pt-1 font-medium">
                  Email: <a href="mailto:contacto@iiresodh.org" className="text-[#457B9D] hover:text-[#B92F32] transition-colors">contacto@iiresodh.org</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}