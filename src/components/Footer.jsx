// src/components/Footer.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import logoBlanco from "../assets/logo.png";

export default function Footer() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <footer className="flex flex-col relative z-40 text-white">
      {/* SECCIÓN DE CONTACTO: Se restauró a bg-light-blue */}
      <div className="bg-light-blue">
        <div className="max-w-6xl mx-auto w-full px-8 py-4 md:py-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
          
          <div className="space-y-3">
            <h3 className="text-xl md:text-2xl font-extrabold uppercase tracking-widest mb-1">Contáctanos</h3>
            <p className="text-base md:text-lg">
              Email: <a href="mailto:contacto@iiresodh.org" className="font-bold hover:text-main-blue transition-colors">contacto@iiresodh.org</a>
            </p>
            <p className="font-light text-xs md:text-sm max-w-sm mt-2 opacity-90 leading-relaxed">
              Construyendo una cultura donde el respeto a los derechos humanos es el pilar del desarrollo directo de empresas e instituciones.
            </p>
          </div>

          <div className="flex md:justify-end justify-start">
            <img 
              src={logoBlanco} 
              alt="Logo IIRESODH Blanco" 
              className="w-full max-w-64 md:max-w-80 object-contain opacity-95"
            />
          </div>
        </div>
      </div>

      {/* Franja inferior de derechos y Aviso SUGEF: Se mantiene en azul oscuro (bg-main-blue) */}
      <div className="bg-main-blue py-4 px-4 text-center text-xs md:text-sm text-gray-300 font-light border-t border-white/5">
        <p className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center items-center gap-2 md:gap-3">
          <span className="font-bold text-white tracking-wide">IIRESODH© 2026 is licensed under CC BY-NC-ND 4.0</span> 
          <span className="hidden md:inline">—</span>
          <Link to="/privacidad" className="hover:text-white transition-colors">Privacidad y Términos</Link>
          <span className="hidden md:inline">—</span>
          
          <span className="relative inline-block">
            <button 
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="hover:text-white transition-colors cursor-help outline-none"
            >
              Aviso SUGEF
            </button>

            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 md:w-80 p-3 bg-white text-main-blue rounded shadow-xl border border-gray-200 z-50 pointer-events-none">
                <p className="text-[10px] leading-tight text-justify font-normal">
                  "Se advierte al público que la Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos es supervisada solamente en materia de prevención de legitimación de capitales, financiamiento al terrorismo y financiamiento de la proliferación de armas de destrucción masiva, y además se encuentra sujeta a disposiciones vinculantes de la Unidad de Inteligencia Financiera de Instituto Costarricense sobre Drogas. Por lo tanto, la Sugef no supervisa en materia financiera a la Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos, ni los negocios que ofrece, ni su seguridad, estabilidad o solvencia".
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
              </div>
            )}
          </span>
        </p>
      </div>
    </footer>
  );
}