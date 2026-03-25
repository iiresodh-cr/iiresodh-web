// src/pages/Colombia.jsx
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";

export default function Colombia() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* ENCABEZADO Estandarizado */}
      <PageHeader 
        titulo="IIRESODH Colombia" 
        subtitulo="Sede regional dedicada a la defensa y promoción de los Derechos Humanos en territorio colombiano." 
      />

      <div className="relative overflow-hidden grow flex items-center justify-center p-8">
        {/* Marca de agua institucional */}
        <div className="bg-watermark"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-pale-blue border-t-main-red rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-400 uppercase tracking-widest font-bold italic">Landing page en construcción</p>
          <p className="text-gray-300 text-sm mt-2 italic">Estamos trabajando para ofrecerte información detallada sobre nuestra sede en Bogotá.</p>
        </div>
      </div>
    </div>
  );
}