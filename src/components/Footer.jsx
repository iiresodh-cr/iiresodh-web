// src/components/Footer.jsx
import { Link } from "react-router-dom";
import logoBlanco from "../assets/logo.webp";
import { Tooltip, Zoom } from '@mui/material'; 

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

export default function Footer() {
  // HOOK DE TRADUCCIÓN
  const { t } = useTranslation();

  const sugefText = t('footer.sugef_texto', '"Se advierte al público que la Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos es supervisada solamente en materia de prevención de legitimación de capitales, financiamiento al terrorismo y financiamiento de la proliferación de armas de destrucción masiva, y además se encuentra sujeta a disposiciones vinculantes de la Unidad de Inteligencia Financiera de Instituto Costarricense sobre Drogas. Por lo tanto, la Sugef no supervisa en materia financiera a la Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos, ni los negocios que ofrece, ni su seguridad, estabilidad o solvencia".');

  return (
    <footer className="flex flex-col relative z-40 bg-main-blue text-white mt-auto">
      
      {/* SECCIÓN PRINCIPAL (3 COLUMNAS) */}
      <div className="max-w-7xl mx-auto w-full px-8 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
        
        {/* Columna Izquierda: Logo e Info */}
        <div className="flex flex-col items-start space-y-6">
          <Link to="/">
            <img 
              src={logoBlanco} 
              alt={t('footer.logo_alt', 'Logo institucional de IIRESODH')} 
              className="w-full max-w-50 object-contain opacity-95 hover:opacity-100 transition-opacity"
            />
          </Link>
          <p className="text-sm font-light text-gray-300 leading-relaxed max-w-sm">
            {t('footer.descripcion', 'Fomentamos el cumplimiento de estándares internacionales en derechos humanos a través del litigio estratégico, cooperación técnica y formación académica.')}
          </p>
        </div>

        {/* Columna Central: Enlaces Rápidos */}
        <div className="flex flex-col items-start lg:items-center">
          <div>
            <h3 className="text-sm font-bold tracking-[0.2em] text-white uppercase mb-6">{t('footer.instituciones_amigas', 'Instituciones Amigas')}</h3>
            <div className="flex flex-col space-y-4">
              <a href="https://pidh.ch" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all text-sm font-light flex items-center gap-2">
                <span className="text-main-red text-xs">▹</span> PIDH
              </a>
              <a href="https://pida-ai.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all text-sm font-light flex items-center gap-2">
                <span className="text-main-red text-xs">▹</span> PIDA
              </a>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Redes y Contacto */}
        <div className="flex flex-col items-start lg:items-end">
          <h3 className="text-sm font-bold tracking-[0.2em] text-white uppercase mb-6 lg:text-right">{t('footer.conecta', 'Conecta con nosotros')}</h3>
          
          <div className="flex items-center gap-4 text-gray-300 mb-8" role="group" aria-label="Redes sociales">
            <Tooltip title={t('footer.siguenos_facebook', 'Síguenos en Facebook')} arrow placement="top" slots={{ transition: Zoom }}>
              <a href="https://www.facebook.com/iiresodhcostarica" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-main-red hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
            </Tooltip>
            <Tooltip title={t('footer.siguenos_instagram', 'Síguenos en Instagram')} arrow placement="top" slots={{ transition: Zoom }}>
              <a href="https://www.instagram.com/iiresodh" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-main-red hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
            </Tooltip>
            <Tooltip title={t('footer.siguenos_x', 'Síguenos en X')} arrow placement="top" slots={{ transition: Zoom }}>
              <a href="https://x.com/IIRESODH1" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-main-red hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            </Tooltip>
            <Tooltip title={t('footer.siguenos_youtube', 'Síguenos en YouTube')} arrow placement="top" slots={{ transition: Zoom }}>
              <a href="https://www.youtube.com/@iiresodh" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-main-red hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.582 6.186a2.658 2.658 0 00-1.874-1.886C18.053 3.846 12 3.846 12 3.846s-6.053 0-7.708.454a2.658 2.658 0 00-1.874 1.886C1.964 7.857 1.964 12 1.964 12s0 4.143.454 5.814a2.658 2.658 0 001.874 1.886C5.947 20.154 12 20.154 12 20.154s6.053 0 7.708-.454a2.658 2.658 0 001.874-1.886C22.036 16.143 22.036 12 22.036 12s0-4.143-.454-5.814zM9.965 15.485V8.515L15.918 12l-5.953 3.485z" /></svg>
              </a>
            </Tooltip>
            <Tooltip title={t('footer.siguenos_linkedin', 'Síguenos en LinkedIn')} arrow placement="top" slots={{ transition: Zoom }}>
              <a href="https://www.linkedin.com/company/iiresodh" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-main-red hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" /></svg>
              </a>
            </Tooltip>
            <Tooltip title={t('footer.siguenos_tiktok', 'Síguenos en TikTok')} arrow placement="top" slots={{ transition: Zoom }}>
              <a href="https://www.tiktok.com/@iiresodh" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-main-red hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </Tooltip>
          </div>

          <Link to="/tienda" className="bg-main-red text-white text-xs font-bold uppercase tracking-[0.15em] py-3 px-6 rounded-lg hover:bg-red-800 transition-colors shadow-lg shadow-main-red/20 w-full text-center lg:w-auto">
            {t('footer.apoyar', 'Apoyar Nuestra Labor')}
          </Link>
        </div>
        
      </div>

      {/* FRANJA LEGAL E INFERIOR */}
      <div className="bg-[#172B47] py-6 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-gray-400">
          
          <div className="text-center md:text-left">
            <span>IIRESODH© {new Date().getFullYear()} {t('footer.licencia', 'está bajo licencia CC BY-NC-ND 4.0')}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/privacidad" className="hover:text-white transition-colors">{t('footer.privacidad', 'Privacidad y Términos')}</Link>
            
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            
            <Tooltip 
              title={<div className="p-1 text-[11px] font-normal leading-relaxed text-justify">{sugefText}</div>} 
              placement="top" 
              arrow 
              disableFocusListener={false}
              enterTouchDelay={50}
              componentsProps={{
                tooltip: { sx: { bgcolor: 'white', color: '#1D3557', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6', maxWidth: 350, p: 1.5 } },
                arrow: { sx: { color: 'white' } }
              }}
            >
              <button className="hover:text-white transition-colors cursor-help hover:border-white pb-0.5 outline-none">
                {t('footer.aviso_sugef', 'Aviso SUGEF')}
              </button>
            </Tooltip>
          </div>

        </div>
      </div>
      
    </footer>
  );
}