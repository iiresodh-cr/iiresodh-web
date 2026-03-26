// src/pages/CursosPasados.jsx
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";

export default function CursosPasados() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* ENCABEZADO Estandarizado */}
      <PageHeader 
        titulo="Cursos Pasados" 
        subtitulo="Archivo histórico de nuestra oferta académica y programas de formación concluidos." 
      />

      <div className="relative overflow-hidden grow flex items-center justify-center p-8">
        {/* Marca de agua institucional */}
        <div className="bg-watermark" aria-hidden="true"></div>
        
        <div className="relative z-10 text-center" role="status">
          {/* Animación de carga sutil */}
          <div className="w-16 h-16 border-4 border-pale-blue border-t-main-red rounded-full animate-spin mx-auto mb-6" aria-hidden="true"></div>
          <p className="text-gray-400 uppercase tracking-widest font-bold">Sección en construcción</p>
          <p className="text-gray-300 text-sm mt-2 italic">Estamos organizando nuestra memoria académica para su consulta pública.</p>
        </div>
      </div>
    </main>
  );
}