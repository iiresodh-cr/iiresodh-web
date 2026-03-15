// src/components/Footer.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import logoBlanco from "../assets/logo.png";

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-light-blue text-white flex flex-col relative z-40">
        {/* Aquí redujimos py-12 md:py-16 a py-8 md:py-10 para una franja más compacta */}
        <div className="max-w-6xl mx-auto w-full px-8 py-8 md:py-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold uppercase tracking-widest mb-2">Contáctanos</h3>
            <p className="text-lg">
              Email: <a href="mailto:contacto@iiresodh.org" className="font-bold hover:text-main-blue transition-colors">contacto@iiresodh.org</a>
            </p>
            <p className="font-light text-sm max-w-sm mt-4 opacity-90 leading-relaxed">
              Construyendo una cultura donde el respeto a los derechos humanos es el pilar del desarrollo directo de empresas e instituciones.
            </p>
          </div>

          <div className="flex md:justify-end justify-start">
            <img 
              src={logoBlanco} 
              alt="Logo IIRESODH Blanco" 
              className="w-full max-w-100 object-contain opacity-95"
            />
          </div>
        </div>

        <div className="bg-main-blue py-5 px-4 text-center text-xs md:text-sm text-gray-300 font-light">
          <p className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center items-center gap-2 md:gap-3">
            <span className="font-bold text-white tracking-wide">IIRESODH© 2026 is licensed under CC BY-NC-ND 4.0</span> 
            <span className="hidden md:inline">—</span>
            {/* Un solo enlace limpio y corporativo */}
            <Link to="/privacidad" className="hover:text-white transition-colors">Privacidad y Términos</Link>
            <span className="hidden md:inline">—</span>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Aviso SUGEF
            </button>
          </p>
        </div>
      </footer>

      {/* Modal Aviso SUGEF */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm transition-opacity"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 md:p-8 relative border-t-8 border-main-red animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-main-red transition-colors cursor-pointer"
              aria-label="Cerrar aviso"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <div className="pr-2">
              <h3 className="text-xl md:text-2xl font-extrabold text-main-blue mb-4 uppercase tracking-wider border-b-2 border-pale-blue pb-2 inline-block">
                Aviso SUGEF
              </h3>
              <p className="text-gray-700 text-base md:text-lg font-light leading-relaxed text-justify">
                "Se advierte al público que la Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos es supervisada solamente en materia de prevención de legitimación de capitales, financiamiento al terrorismo y financiamiento de la proliferación de armas de destrucción masiva, y además se encuentra sujeta a disposiciones vinculantes de la Unidad de Inteligencia Financiera de Instituto Costarricense sobre Drogas. Por lo tanto, la Sugef no supervisa en materia financiera a la Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos, ni los negocios que ofrece, ni su seguridad, estabilidad o solvencia".
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-main-blue hover:bg-light-blue text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors text-sm md:text-base cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}