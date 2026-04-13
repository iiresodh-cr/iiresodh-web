// src/components/Footer.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import logoBlanco from "../assets/logo.png";
import { Tooltip } from '@mui/material'; // <-- Agregamos Tooltip de MUI

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

          {/* Columna Derecha: Redes Sociales */}
          <div className="flex flex-col items-start md:items-end justify-center w-full">
            <h3 className="text-sm font-semibold tracking-wider text-gray-300 mb-4 uppercase">Síguenos en nuestras redes</h3>
            
            <div className="flex items-center gap-5 md:gap-6 text-white" role="group" aria-label="Redes sociales">
              <Tooltip title="Síguenos en Facebook" arrow placement="top">
                <a href="https://www.facebook.com/iiresodhcostarica" target="_blank" rel="noreferrer" className="hover:text-light-blue transition-colors flex items-center" aria-label="Visitar nuestro Facebook">
                  <svg className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
              </Tooltip>
              <Tooltip title="Síguenos en Instagram" arrow placement="top">
                <a href="https://www.instagram.com/iiresodh" target="_blank" rel="noreferrer" className="hover:text-light-blue transition-colors flex items-center" aria-label="Visitar nuestro Instagram">
                  <svg className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
              </Tooltip>
              <Tooltip title="Síguenos en X" arrow placement="top">
                <a href="https://x.com/IIRESODH1" target="_blank" rel="noreferrer" className="hover:text-light-blue transition-colors flex items-center" aria-label="Visitar nuestro perfil en X">
                  <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              </Tooltip>
              <Tooltip title="Síguenos en YouTube" arrow placement="top">
                <a href="https://www.youtube.com/@iiresodh" target="_blank" rel="noreferrer" className="hover:text-light-blue transition-colors flex items-center" aria-label="Visitar nuestro canal de YouTube">
                  <svg className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M21.582 6.186a2.658 2.658 0 00-1.874-1.886C18.053 3.846 12 3.846 12 3.846s-6.053 0-7.708.454a2.658 2.658 0 00-1.874 1.886C1.964 7.857 1.964 12 1.964 12s0 4.143.454 5.814a2.658 2.658 0 001.874 1.886C5.947 20.154 12 20.154 12 20.154s6.053 0 7.708-.454a2.658 2.658 0 001.874-1.886C22.036 16.143 22.036 12 22.036 12s0-4.143-.454-5.814zM9.965 15.485V8.515L15.918 12l-5.953 3.485z" /></svg>
                </a>
              </Tooltip>
            </div>
          </div>
          
        </div>
      </div>

      {/* Franja inferior de derechos y Aviso SUGEF */}
      <div className="bg-main-blue pb-8 px-4 text-center text-xs md:text-sm text-gray-300 font-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-2 md:gap-3">
          <span className="text-white tracking-wide">IIRESODH© 2026 is licensed under CC BY-NC-ND 4.0</span> 
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