// src/pages/Donaciones.jsx
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";

export default function Donaciones() {
  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* ENCABEZADO Estandarizado */}
      <PageHeader 
        titulo="Donaciones" 
        subtitulo="Tu apoyo contribuye directamente a la promoción y defensa de los Derechos Humanos y la Responsabilidad Social." 
      />

      <div className="relative overflow-hidden grow flex items-center justify-center p-8">
        {/* Marca de agua institucional */}
        <div className="bg-watermark" aria-hidden="true"></div>
        
        <div className="relative z-10 text-center" role="status">
          {/* Animación de carga para la construcción */}
          <div className="w-16 h-16 border-4 border-pale-blue border-t-main-red rounded-full animate-spin mx-auto mb-6" aria-hidden="true"></div>
          <p className="text-gray-400 uppercase tracking-widest font-bold">Sección en desarrollo</p>
          <p className="text-gray-300 text-sm mt-2 italic">Estamos habilitando los canales oficiales para recibir tus valiosas aportaciones.</p>
        </div>
      </div>
    </main>
  );
}