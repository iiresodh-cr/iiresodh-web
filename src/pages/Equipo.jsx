// src/pages/Equipo.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import PageHeader from "../components/PageHeader";

// Importaciones de MUI
import { CircularProgress, Paper, Skeleton } from "@mui/material";

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

// ==========================================
// COMPONENTE DE IMAGEN INTELIGENTE
// ==========================================
const ImagenConSkeleton = ({ src, alt, className, priority = false }) => {
  const [cargada, setCargada] = useState(false);

  return (
    <div className="w-full h-full relative">
      {!cargada && (
        <div className="absolute inset-0 z-10">
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height="100%" 
            animation="wave" 
            sx={{ bgcolor: 'rgba(0,0,0,0.04)' }} 
          />
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setCargada(true)}
        className={`${className} transition-opacity duration-700 ease-in-out ${
          cargada ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default function Equipo() {
  const { t } = useTranslation(); // HOOK DE TRADUCCIÓN
  const [equipo, setEquipo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchEquipo = async () => {
      try {
        const q = query(collection(db, "equipo"), orderBy("orden", "asc"));
        const querySnapshot = await getDocs(q);

        const equipoData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setEquipo(equipoData);
      } catch (error) {
        console.error("Error al cargar el equipo desde Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-20" role="status">
        <CircularProgress size={50} thickness={4} sx={{ color: '#1D3557' }} />
        <span className="text-main-blue font-bold text-sm uppercase tracking-widest animate-pulse">
          {t('equipo.cargando', 'Cargando equipo...')}
        </span>
      </div>
    );
  }

  const presidente = equipo.find(m => m.destacado);
  const staff = equipo.filter(m => !m.destacado).sort((a, b) => a.orden - b.orden);

  const secciones = ['Canadá', 'Colombia', 'Costa Rica', 'Guatemala', 'México', 'Otra'];
  const staffPorPais = staff.reduce((acc, miembro) => {
    const pais = miembro.pais || 'Otra';
    if (!acc[pais]) acc[pais] = [];
    acc[pais].push(miembro);
    return acc;
  }, {});

  // Función auxiliar para traducir los nombres de los países devueltos por la base de datos
  const traducirPais = (pais) => {
    switch(pais) {
      case 'Canadá': return t('equipo.canada', 'Canadá');
      case 'Colombia': return t('equipo.colombia', 'Colombia');
      case 'Costa Rica': return t('equipo.costa_rica', 'Costa Rica');
      case 'Guatemala': return t('equipo.guatemala', 'Guatemala');
      case 'México': return t('equipo.mexico', 'México');
      case 'Otra': return t('equipo.otros_miembros', 'Otros Miembros');
      default: return pais;
    }
  };

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      <PageHeader 
        titulo={t('equipo.header_titulo', 'Equipo de Trabajo')} 
        subtitulo={t('equipo.header_subtitulo', 'El talento humano detrás de la promoción y protección de los derechos humanos.')} 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative pt-4 md:pt-6 px-0 z-10">
          <div className="max-w-7xl mx-auto bg-white overflow-hidden">
            
            <div className="px-6 md:px-12 lg:px-16 pt-4 md:pt-6 pb-12 animate-fade-in-up w-full">
              
              {/* SECCIÓN PRESIDENTE */}
              {presidente && (
                <section className="mb-24" aria-labelledby="presidente-nombre">
                  <div className="flex flex-col md:flex-row items-start gap-10 md:gap-20">
                    <div className="w-full md:w-2/5 shrink-0">
                      <Paper 
                        elevation={4} 
                        sx={{ 
                          aspectRatio: '4/5', 
                          borderRadius: '16px', 
                          overflow: 'hidden',
                          bgcolor: '#F9FAFB', 
                          border: '1px solid #E5E7EB' 
                        }}
                      >
                        <ImagenConSkeleton 
                          src={presidente.fotoUrl} 
                          alt={`${t('equipo.retrato_de', 'Retrato de')} ${presidente.nombre}`} 
                          className="w-full h-full object-cover"
                          priority={true}
                        />
                      </Paper>
                    </div>
                    
                    <div className="w-full md:w-3/5">
                      <span className="text-xs font-black text-main-red uppercase tracking-[0.4em] mb-4 block">
                        {t('equipo.alta_direccion', 'Alta Dirección')}
                      </span>
                      <h2 id="presidente-nombre" className="text-3xl md:text-5xl font-semibold text-main-blue mb-4 tracking-tighter uppercase leading-tight">
                        {presidente.nombre}
                      </h2>
                      <p className="text-xl font-bold text-light-blue mb-8 italic">
                        {presidente.cargo}
                      </p>
                      <p className="text-gray-600 font-light leading-relaxed text-lg text-justify">
                        {presidente.bio}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* SECCIONES DEL STAFF POR PAÍS */}
              <div className="flex flex-col gap-16">
                {secciones.map(pais => {
                  const miembrosPais = staffPorPais[pais];
                  if (!miembrosPais || miembrosPais.length === 0) return null;
                  return (
                    <section aria-label={`Equipo de ${pais}`} key={pais}>
                      <h3 className="text-2xl font-black text-main-blue uppercase tracking-tight mb-8 border-b-2 border-main-red inline-block pb-2">
                        {traducirPais(pais)}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {miembrosPais.map((miembro) => (
                          <article key={miembro.id} className="flex flex-col group cursor-default">
                            <Paper
                              elevation={1}
                              sx={{
                                aspectRatio: '4/5',
                                width: '100%',
                                mb: 3,
                                borderRadius: '16px',
                                overflow: 'hidden',
                                bgcolor: '#F9FAFB',
                                border: '1px solid #F3F4F6',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)', 
                                },
                                '&:hover img': {
                                  filter: 'grayscale(0%)',
                                }
                              }}
                            >
                              <ImagenConSkeleton 
                                src={miembro.fotoUrl} 
                                alt={`${t('equipo.retrato_de', 'Retrato de')} ${miembro.nombre}`} 
                                className="w-full h-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
                                priority={false}
                              />
                            </Paper>
                            <div className="px-2">
                              <h3 className="text-xl font-semibold text-main-blue leading-tight mb-1 group-hover:text-main-red transition-colors uppercase tracking-tight">
                                {miembro.nombre}
                              </h3>
                              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                {miembro.cargo}
                              </p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

      </div>
    </main>
  );
}