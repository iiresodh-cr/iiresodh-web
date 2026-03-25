// src/pages/Equipo.jsx
import { useEffect, useState } from "react";
// Importamos la imagen desde la carpeta assets
import fotoPresidente from "../assets/victor.webp";

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
        bio: "Reseña profesional aquí.",
        fotoUrl: fotoPresidente, // <-- Imagen actualizada
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
        nombre: "Nombre Staff",
        cargo: "Coordinación Técnica",
        fotoUrl: "https://via.placeholder.com/400x500",
        destacado: false,
        orden: 3
      },
      {
        id: "staff-2",
        nombre: "Nombre Staff",
        cargo: "Asesoría Legal",
        fotoUrl: "https://via.placeholder.com/400x500",
        destacado: false,
        orden: 4
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
      
      <div className="bg-main-blue text-white py-14 px-6 text-center relative z-20">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter mb-3 uppercase">Equipo de Trabajo</h1>
        <p className="text-blue-100 max-w-3xl mx-auto font-medium opacity-90">
          El talento humano detrás de la promoción y protección de los derechos humanos.
        </p>
        <div className="w-20 h-1.5 bg-main-red mx-auto mt-8 rounded-full"></div>
      </div>

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark"></div>

        <div className="relative z-10 max-w-6xl mx-auto py-16 px-6">
          
          {presidente && (
            <div className="mb-24">
              <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
                <div className="w-full md:w-2/5 shrink-0">
                  <div className="aspect-4/5 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <img 
                      src={presidente.fotoUrl} 
                      alt={presidente.nombre} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-3/5 text-justify md:text-left">
                  <span className="text-xs font-black text-main-red uppercase tracking-[0.4em] mb-4 block">Alta Dirección</span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-main-blue mb-4 tracking-tighter uppercase">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {staff.map((miembro) => (
              <div key={miembro.id} className="flex flex-col group">
                <div className="aspect-4/5 w-full mb-6 rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                  <img 
                    src={miembro.fotoUrl} 
                    alt={miembro.nombre} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  />
                </div>
                <div className="px-2">
                  <h3 className="text-xl font-extrabold text-main-blue leading-tight mb-1 group-hover:text-main-red transition-colors uppercase tracking-tight">
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
    </div>
  );
}