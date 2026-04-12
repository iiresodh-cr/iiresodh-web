// src/pages/Cursos.jsx
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";

export default function CursosActivos() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* ENCABEZADO Estandarizado */}
      <PageHeader 
        titulo="Cursos Activos" 
        subtitulo="Programas de formación especializada en Derechos Humanos y Responsabilidad Social." 
      />

      <div className="relative overflow-hidden grow flex items-center justify-center p-8">
        {/* Marca de agua institucional */}
        <div className="bg-watermark" aria-hidden="true"></div>
        
        <div className="relative z-10 text-center" role="status">
          {/* Animación de carga sutil */}
          <div className="w-16 h-16 border-4 border-pale-blue border-t-main-red rounded-full animate-spin mx-auto mb-6" aria-hidden="true"></div>
          <p className="text-gray-400 uppercase tracking-widest font-bold">Sección en construcción</p>
          <p className="text-gray-300 text-sm mt-2 italic">Estamos actualizando nuestra oferta académica para el periodo 2026.</p>
        </div>
      </div>
    </main>
  );
}