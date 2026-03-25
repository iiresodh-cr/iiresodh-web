// src/pages/Equipo.jsx
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
// Importamos las imágenes desde la carpeta assets
import fotoPresidente from "../assets/victor.webp";
import fotoDavid from "../assets/David_Urquilla-IIRE.webp";
import fotoJIR from "../assets/Juan-Ignacio-Rodriguez.webp";
import fotoRandall from "../assets/Randall.webp";
import fotoRoxanne from "../assets/Roxanne-Cabrera.webp";
import fotoFabricio from "../assets/Fabricio-Soley.webp";

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
        nombre: "Nombre Ejecutivo",
        cargo: "Dirección Ejecutiva",
        fotoUrl: "https://via.placeholder.com/400x500",
        destacado: false,
        orden: 2
      },
      {
        id: "staff-1",
        nombre: "David Urquilla",
        cargo: "Coordinador de tecnología y Abogado",
        fotoUrl: fotoDavid, // Imagen actualizada aquí
        destacado: false,
        orden: 3
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
        orden: 6
      },
      {
        id: "staff-5",
        nombre: "Fabricio Soley Rojas",
        cargo: "Abogado de Litigio Estratégico",
        fotoUrl: fotoFabricio,
        destacado: false,
        orden: 7
      }
    ];

    setEquipo(mockupData);
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-main-blue font-bold uppercase tracking-widest">
      Cargando...
    </div>
  );

  const presidente = equipo.find(m => m.destacado);
  const staff = equipo.filter(m => !m.destacado).sort((a, b) => a.orden - b.orden);

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      
      <PageHeader 
        titulo="Equipo de Trabajo" 
        subtitulo="El talento humano detrás de la promoción y protección de los derechos humanos." 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark"></div>

        <section className="relative pt-12 md:pt-16 px-0 md:px-8 z-10">
          <div className="max-w-7xl mx-auto bg-white overflow-hidden shadow-sm md:rounded-3xl border border-gray-50">
            
            <div className="px-8 md:px-12 lg:px-16 py-12 md:py-16 animate-fade-in-up">
              
              {/* SECCIÓN PRESIDENTE */}
              {presidente && (
                <div className="mb-24">
                  <div className="flex flex-col md:flex-row items-start gap-10 md:gap-20">
                    <div className="w-full md:w-2/5 shrink-0">
                      <div className="aspect-4/5 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-md">
                        <img 
                          src={presidente.fotoUrl} 
                          alt={presidente.nombre} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="w-full md:w-3/5 text-justify">
                      <span className="text-xs font-black text-main-red uppercase tracking-[0.4em] mb-4 block">Alta Dirección</span>
                      <h2 className="text-3xl md:text-5xl font-semibold text-main-blue mb-4 tracking-tighter uppercase leading-tight">
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
                </div>
              )}

              {/* SECCIÓN STAFF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {staff.map((miembro) => (
                  <div key={miembro.id} className="flex flex-col group">
                    <div className="aspect-4/5 w-full mb-6 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shadow-sm transition-all duration-500 group-hover:shadow-lg">
                      <img 
                        src={miembro.fotoUrl} 
                        alt={miembro.nombre} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                      />
                    </div>
                    <div className="px-2">
                      <h3 className="text-xl font-semibold text-main-blue leading-tight mb-1 group-hover:text-main-red transition-colors uppercase tracking-tight">
                        {miembro.nombre}
                      </h3>
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {miembro.cargo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}