// src/pages/Equipo.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import PageHeader from "../components/PageHeader";

// Importaciones de MUI
import { CircularProgress, Paper } from "@mui/material";

export default function Equipo() {
  const [equipo, setEquipo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchEquipo = async () => {
      try {
        // 1. Creamos la consulta a la colección 'equipo', ordenada por el campo 'orden'.
        const q = query(collection(db, "equipo"), orderBy("orden", "asc"));
        const querySnapshot = await getDocs(q);

        // 2. Mapeamos los documentos al formato que el componente ya espera.
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

  // ESTADO DE CARGA MEJORADO CON MUI
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-20" role="status">
        <CircularProgress size={50} thickness={4} sx={{ color: '#1D3557' }} />
        <span className="text-main-blue font-bold text-sm uppercase tracking-widest animate-pulse">
          Cargando equipo...
        </span>
      </div>
    );
  }

  const presidente = equipo.find(m => m.destacado);
  const staff = equipo.filter(m => !m.destacado).sort((a, b) => a.orden - b.orden);

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      <PageHeader 
        titulo="Equipo de Trabajo" 
        subtitulo="El talento humano detrás de la promoción y protección de los derechos humanos." 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative pt-4 md:pt-6 px-0 z-10">
          {/* AQUÍ SE ELIMINARON LAS CLASES: shadow-sm border border-gray-50 */}
          <div className="max-w-7xl mx-auto bg-white overflow-hidden">
            
            <div className="px-6 md:px-12 lg:px-16 pt-4 md:pt-6 pb-12 animate-fade-in-up w-full">
              
              {/* SECCIÓN PRESIDENTE MEJORADA CON MUI PAPER */}
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
                          bgcolor: '#F9FAFB', // bg-gray-50
                          border: '1px solid #E5E7EB' // border-gray-200
                        }}
                      >
                        <img 
                          src={presidente.fotoUrl} 
                          alt={`Retrato de ${presidente.nombre}`} 
                          className="w-full h-full object-cover"
                        />
                      </Paper>
                    </div>
                    
                    <div className="w-full md:w-3/5">
                      <span className="text-xs font-black text-main-red uppercase tracking-[0.4em] mb-4 block">Alta Dirección</span>
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

              {/* SECCIÓN STAFF MEJORADA CON MUI PAPER */}
              <section aria-label="Miembros del equipo">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                  {staff.map((miembro) => (
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
                          transition: 'all 0.5s ease',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // shadow-xl
                          },
                          // Este selector mantiene la funcionalidad de escala de grises de Tailwind
                          '&:hover img': {
                            filter: 'grayscale(0%)',
                          }
                        }}
                      >
                        <img 
                          src={miembro.fotoUrl} 
                          alt={`Retrato de ${miembro.nombre}`} 
                          className="w-full h-full object-cover grayscale transition-all duration-700" 
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

            </div>
          </div>
        </section>

      </div>
    </main>
  );
}