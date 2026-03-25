// src/pages/CooperacionInternacional.jsx
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";

export default function CooperacionInternacional() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* ENCABEZADO Estandarizado */}
      <PageHeader 
        titulo="Cooperación Internacional" 
        subtitulo="Alianzas estratégicas para el fortalecimiento de los Derechos Humanos a nivel global." 
      />

      <div className="relative overflow-hidden grow flex items-center justify-center p-8">
        {/* Marca de agua institucional */}
        <div className="bg-watermark"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-pale-blue border-t-main-red rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-400 uppercase tracking-widest font-bold">Sección en construcción</p>
          <p className="text-gray-300 text-sm mt-2 italic">Próximamente compartiremos nuestros proyectos y aliados.</p>
        </div>
      </div>
    </div>
  );
}