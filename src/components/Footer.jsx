// src/components/Footer.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import logoBlanco from "../assets/logo.png";

export default function Footer() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <footer className="flex flex-col relative z-40 text-white">
      {/* SECCIÓN INSTITUCIONAL */}
      <div className="bg-main-blue pb-4">
        <div className="max-w-7xl mx-auto w-full px-8 py-8 md:py-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Columna Izquierda: Logo */}
          <div className="flex flex-col items-start">
            <img 
              src={logoBlanco} 
              alt="Logo institucional de IIRESODH en color blanco" 
              className="w-full max-w-48 md:max-w-64 object-contain opacity-95"
            />
          </div>

          {/* Columna Derecha: Espacio vacío reservado para mapa de navegación */}
          <div className="flex flex-col items-start md:items-end justify-start w-full">
            {/* Aquí puedes agregar tu futuro mapa de navegación, enlaces rápidos o texto */}
          </div>
          
        </div>
      </div>

      {/* Franja inferior de derechos y Aviso SUGEF */}
      <div className="bg-main-blue pb-8 px-4 text-center text-xs md:text-sm text-gray-300 font-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-2 md:gap-3">
          <span className="font-bold text-white tracking-wide">IIRESODH© 2026 is licensed under CC BY-NC-ND 4.0</span> 
          <span className="hidden md:inline" aria-hidden="true">—</span>
          <Link to="/privacidad" className="hover:text-white transition-colors" aria-label="Ver política de privacidad y términos">Privacidad y Términos</Link>
          <span className="hidden md:inline" aria-hidden="true">—</span>
          
          <div className="relative inline-block">
            <button 
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              aria-describedby="tooltip-sugef"
              className="hover:text-white transition-colors cursor-help outline-none focus:ring-1 focus:ring-white rounded px-1"
            >
              Aviso SUGEF
            </button>

            {showTooltip && (
              <div 
                id="tooltip-sugef"
                role="tooltip"
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 md:w-80 p-4 bg-white text-main-blue rounded-lg shadow-2xl border border-gray-200 z-50 pointer-events-none"
              >
                <p className="text-[10px] leading-tight text-justify font-normal">
                  "Se advierte al público que la Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos es supervisada solamente en materia de prevención de legitimación de capitales, financiamiento al terrorismo y financiamiento de la proliferación de armas de destrucción masiva, y además se encuentra sujeta a disposiciones vinculantes de la Unidad de Inteligencia Financiera de Instituto Costarricense sobre Drogas. Por lo tanto, la Sugef no supervisa en materia financiera a la Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos, ni los negocios que ofrece, ni su seguridad, estabilidad o solvencia".
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" aria-hidden="true"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}