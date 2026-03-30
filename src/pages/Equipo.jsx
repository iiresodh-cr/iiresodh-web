// src/pages/Equipo.jsx
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
// Importamos las imágenes desde la carpeta assets
import noFoto from "../assets/NoFoto.png";
import fotoPresidente from "../assets/victor.webp";
import fotoFabiola from "../assets/fabiola-galaviz.webp"
import fotoDavid from "../assets/David_Urquilla-IIRE.webp";
import fotoJIR from "../assets/Juan-Ignacio-Rodriguez.webp";
import fotoRandall from "../assets/Randall.webp";
import fotoRoxanne from "../assets/Roxanne-Cabrera.webp";
import fotoFabricio from "../assets/Fabricio-Soley.webp";

// Importaciones de MUI
import { CircularProgress, Paper } from "@mui/material";

export default function Equipo() {
  const [equipo, setEquipo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const mockupData = [
      {
        id: "pres-1",
        nombre: "Dr. Víctor Rodríguez Rescia",
        cargo: "Presidente del IIRESODH",
        bio: "Actual miembro del Mecanismo Internacional de Expertos Independientes para Promover la Justicia e Igualdad Racial en la Aplicación de la Ley. Ex miembro del Comité de Derechos Humanos de Naciones Unidas y su Relator Especial para seguimiento de cumplimiento de comunicaciones, ex Presidente del Subcomité para la Prevención de la Tortura de las Naciones Unidas, ex Secretario Adjunto de la Corte Interamericana de Derechos Humanos y ex Director del Centro de Derechos Humanos para las Américas, DePaul University, Chicago, U.S.A. Sede Costa Rica. Además, es miembro de la Asamblea General del Instituto Interamericano de Derechos Humanos, de la Asamblea de la Comisión Internacional de Juristas, Ginebra (ICJ) y profesor invitado en diversas universidades de América Latina y Europa, entre ellas Columbia University, New York, USA y Universidad de Verona, Italia. Ha realizado múltiples publicaciones en materia de derechos humanos, litigio estratégico, acceso a la justicia y responsabilidad social. Cuenta con vasta experiencia como consultor independiente y como evaluador de proyectos y programas de desarrollo y derechos humanos. Actualmente ocupa el cargo de Presidente del Centro de Derechos Civiles y Políticos con sede en Ginebra, Suiza y del Instituto Internacional de Responsabilidad Social y Derechos Humanos.",
        fotoUrl: fotoPresidente,
        destacado: true,
        orden: 1
      },
      {
        id: "dir-1",
        nombre: "Fabiola Galaviz",
        cargo: "Direcctora Ejecutiva",
        fotoUrl: fotoFabiola,
        destacado: false,
        orden: 2
      },
      {
        id: "staff-1",
        nombre: "David Urquilla",
        cargo: "Coordinador de tecnología y Abogado",
        fotoUrl: fotoDavid,
        destacado: false,
        orden: 6
      },
      {
        id: "staff-2",
        nombre: "Juan Ignacio Rodríguez",
        cargo: "Coordinador de Litigio Estratégico",
        fotoUrl: fotoJIR,
        destacado: false,
        orden: 4
      },
      {
        id: "staff-3",
        nombre: "Randall Quirós Soto",
        cargo: "Coordinador de Administración",
        fotoUrl: fotoRandall,
        destacado: false,
        orden: 5
      },
      {
        id: "staff-4",
        nombre: "Roxanne Cabrera Baptista",
        cargo: "Coordinadora de Cooperación Internacional y Abogada",
        fotoUrl: fotoRoxanne,
        destacado: false,
        orden: 7
      },
      {
        id: "staff-5",
        nombre: "Fabricio Soley Rojas",
        cargo: "Abogado de Litigio Estratégico",
        fotoUrl: fotoFabricio,
        destacado: false,
        orden: 8
      },
      {
        id: "dir-2",
        nombre: "Jessica Bellanger",
        cargo: "Asistente de Presidencia",
        fotoUrl: noFoto,
        destacado: false,
        orden: 3
      }
    ];

    // Simulamos un pequeño tiempo de carga para que la animación de MUI sea visible y fluida
    setTimeout(() => {
      setEquipo(mockupData);
      setLoading(false);
    }, 400);
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
                    
                    <div className="w-full md:w-3/5 text-justify">
                      <span className="text-xs font-black text-main-red uppercase tracking-[0.4em] mb-4 block">Alta Dirección</span>
                      <h2 id="presidente-nombre" className="text-3xl md:text-5xl font-semibold text-main-blue mb-4 tracking-tighter uppercase leading-tight">
                        {presidente.nombre}
                      </h2>
                      <p className="text-xl font-bold text-light-blue mb-8 italic">
                        {presidente.cargo}
                      </p>
                      <p className="text-gray-600 font-light leading-relaxed text-lg">
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