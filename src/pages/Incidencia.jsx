// src/pages/Incidencia.jsx
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { Paper } from "@mui/material";

export default function Incidencia() {
  
  // Hacemos scroll al inicio siempre que se carga la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // DATOS TEMPORALES (MOCK) - A futuro esto vendrá de Firestore
  const documentosMock = [
    {
      id: 1,
      titulo: "Informe sobre la Situación de Derechos Humanos en Centroamérica",
      fecha: "Octubre 2023",
      descripcion: "Análisis detallado de los retrocesos y avances democráticos en la región durante el último año, presentado ante la CIDH.",
      tipo: "PDF",
      tamaño: "2.4 MB",
      url: "#" // Aquí irá el enlace de Firebase Storage
    },
    {
      id: 2,
      titulo: "Amicus Curiae: Caso Libertad de Expresión vs Estado",
      fecha: "Agosto 2023",
      descripcion: "Documento de intervención de terceros presentado ante la Corte Interamericana de Derechos Humanos aportando estándares internacionales.",
      tipo: "PDF",
      tamaño: "1.1 MB",
      url: "#"
    },
    {
      id: 3,
      titulo: "Manual de Litigio Estratégico para Defensores Ambientales",
      fecha: "Enero 2023",
      descripcion: "Guía práctica desarrollada en cooperación técnica internacional para dotar de herramientas jurídicas a líderes comunitarios.",
      tipo: "PDF",
      tamaño: "5.7 MB",
      url: "#"
    },
    {
      id: 4,
      titulo: "Observaciones al Proyecto de Ley de Transparencia Pública",
      fecha: "Noviembre 2022",
      descripcion: "Análisis comparado y recomendaciones enviadas al panel legislativo para asegurar el cumplimiento del estándar interamericano.",
      tipo: "PDF",
      tamaño: "845 KB",
      url: "#"
    }
  ];

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden">
      
      <PageHeader 
        titulo="Incidencia Internacional" 
        subtitulo="Acciones estratégicas e informes presentados ante los sistemas internacionales de protección." 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-12 pb-16">
          
          {/* INTRODUCCIÓN */}
          <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-black text-main-blue tracking-tighter mb-6 text-center md:text-left">
              Documentos y Posicionamientos
            </h2>
            <p>
              Como parte de nuestro compromiso con la defensa de la dignidad humana, desde el <strong className="font-semibold text-main-blue">IIRESODH</strong> generamos investigaciones, informes de impacto y documentos de litigio estratégico.
            </p>
            <p>
              A continuación, ponemos a disposición pública nuestro acervo documental de incidencia internacional, diseñado para sentar precedentes, informar a la opinión pública y aportar herramientas jurídicas ante organismos como la CIDH y la Corte Interamericana.
            </p>
          </div>

          <div className="w-16 h-1 bg-main-red mx-auto mt-8 mb-12 rounded-full"></div>

          {/* LISTA DE DOCUMENTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {documentosMock.map((doc) => (
              <Paper 
                key={doc.id} 
                elevation={0} 
                className="group flex flex-col bg-gray-50/50 p-8 border border-gray-100 hover:border-main-red/30 hover:shadow-lg transition-all duration-300 h-full relative overflow-hidden" 
                sx={{ borderRadius: '24px' }}
              >
                {/* Etiqueta superior */}
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-pale-blue/20 text-main-blue text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-md border border-pale-blue/30">
                    {doc.fecha}
                  </span>
                  <span className="text-gray-400 text-xs font-bold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    {doc.tipo} • {doc.tamaño}
                  </span>
                </div>

                {/* Contenido */}
                <h3 className="text-xl md:text-2xl font-bold text-main-blue mb-3 tracking-tight group-hover:text-main-red transition-colors">
                  {doc.titulo}
                </h3>
                <p className="text-gray-500 font-light leading-relaxed text-sm mb-8 grow">
                  {doc.descripcion}
                </p>

                {/* Botón de acción */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-main-red uppercase tracking-widest hover:text-red-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Descargar Documento
                  </a>
                </div>

                {/* Acento visual en hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-main-red/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
              </Paper>
            ))}
          </div>

        </section>
      </div>
    </main>
  );
}