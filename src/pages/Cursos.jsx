// src/pages/Cursos.jsx
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { Paper } from "@mui/material";

const cursosMock = [
  {
    id: 1,
    titulo: "Certificación Internacional en Litigio Estratégico (Europa 2025)",
    fecha: "Inscripciones Abiertas | Inicia: Febrero 2025",
    descripcion: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Profundiza en los mandatos de la Corte Internacional de Justicia, la Corte Penal Internacional y el Tribunal Europeo de Derechos Humanos. Un programa intensivo para profesionales del derecho.",
    estado: "Próximamente",
    imagen: null // Placeholder
  },
  {
    id: 2,
    titulo: "Curso de Litigio Estratégico (Washington D.C. 2024)",
    fecha: "Finalizado | Julio 2024",
    descripcion: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper.",
    estado: "Finalizado",
    imagen: null // Placeholder
  },
  {
    id: 3,
    titulo: "Certificación en Derechos Humanos (Edición 2024)",
    fecha: "Finalizado | Marzo 2024",
    descripcion: "Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi.",
    estado: "Finalizado",
    imagen: null // Placeholder
  }
];

export default function CursosActivos() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      {/* ENCABEZADO Estandarizado */}
      <PageHeader 
        titulo="Cursos y Certificaciones" 
        subtitulo="Programas de formación especializada en Derechos Humanos y Responsabilidad Social." 
      />

      <div className="relative overflow-hidden grow pb-20">
        {/* Marca de agua institucional */}
        <div className="bg-watermark" aria-hidden="true"></div>
        
        <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cursosMock.map((curso) => (
              <Paper 
                key={curso.id}
                elevation={0}
                className="group flex flex-col bg-gray-50/50 border border-gray-100 hover:shadow-xl transition-all duration-300 h-full rounded-3xl overflow-hidden"
              >
                <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div className="p-6 flex flex-col grow">
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${curso.estado === 'Próximamente' ? 'bg-blue-100 text-main-blue' : 'bg-gray-200 text-gray-500'}`}>
                      {curso.estado}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{curso.fecha}</span>
                  </div>
                  <h3 className="text-xl font-bold text-main-blue mb-3 tracking-tight group-hover:text-main-red transition-colors">
                    {curso.titulo}
                  </h3>
                  <p className="text-gray-500 font-light leading-relaxed text-sm mb-6 grow">
                    {curso.descripcion}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-200">
                    <button 
                      disabled={curso.estado !== 'Próximamente'}
                      className="w-full text-center bg-main-blue text-white font-bold py-3 px-6 rounded-lg text-sm uppercase tracking-widest transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-light-blue"
                    >
                      {curso.estado === 'Próximamente' ? 'Más Información' : 'Curso Finalizado'}
                    </button>
                  </div>
                </div>
              </Paper>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}