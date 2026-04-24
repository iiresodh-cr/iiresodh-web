// src/pages/InformesAnuales.jsx
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { Paper } from "@mui/material";

// Generamos datos dummy para los informes desde 2025 hasta 2016
const informesMock = Array.from({ length: 2025 - 2016 + 1 }, (_, i) => {
  const year = 2025 - i;
  return {
    id: year,
    titulo: `Informe Anual de Gestión ${year}`,
    descripcion: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam.",
    tipo: "PDF",
    tamaño: `${(Math.random() * 5 + 2).toFixed(1)} MB`,
    url: "#" // Enlace de marcador de posición
  };
});

export default function InformesAnuales() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      {/* ENCABEZADO Estandarizado */}
      <PageHeader 
        titulo="Informes Anuales" 
        subtitulo="Transparencia y rendición de cuentas sobre nuestra gestión e impacto en los Derechos Humanos." 
      />

      <div className="relative overflow-hidden grow pb-20">
        {/* Marca de agua institucional */}
        <div className="bg-watermark" aria-hidden="true"></div>
        
        <section className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-12 pb-16">
          
          {/* INTRODUCCIÓN */}
          <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-black text-main-blue tracking-tighter mb-6 text-center md:text-left">
              Archivo Histórico de Gestión
            </h2>
            <p>
              En nuestro compromiso con la transparencia, cada año publicamos un informe detallado que resume nuestras actividades, logros, impacto en litigio estratégico y el estado financiero de la organización.
            </p>
            <p>
              Estos documentos son un pilar de nuestra rendición de cuentas ante donantes, socios y el público general, reflejando el trabajo realizado en la promoción y defensa de los derechos humanos en la región.
            </p>
          </div>

          <div className="w-16 h-1 bg-main-red mx-auto mt-8 mb-12 rounded-full"></div>

          {/* LISTA DE INFORMES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {informesMock.map((informe) => (
              <Paper 
                key={informe.id} 
                elevation={0} 
                className="group flex flex-col bg-gray-50/50 p-8 border border-gray-100 hover:border-main-red/30 hover:shadow-lg transition-all duration-300 h-full relative overflow-hidden" 
                sx={{ borderRadius: '24px' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-pale-blue/20 text-main-blue text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-md border border-pale-blue/30">
                    Año {informe.id}
                  </span>
                  <span className="text-gray-400 text-xs font-bold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    {informe.tipo} • {informe.tamaño}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-main-blue mb-3 tracking-tight group-hover:text-main-red transition-colors">
                  {informe.titulo}
                </h3>
                <p className="text-gray-500 font-light leading-relaxed text-sm mb-8 grow">
                  {informe.descripcion}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <a href={informe.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-main-red uppercase tracking-widest hover:text-red-800 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Descargar Informe
                  </a>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-main-red/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
              </Paper>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}