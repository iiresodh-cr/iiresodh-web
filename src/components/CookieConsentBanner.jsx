// src/components/CookieConsentBanner.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Cookie } from "lucide-react";

export const COOKIE_CONSENT_KEY = "iiresodh_cookie_consent";

export default function CookieConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Mostramos el banner con un pequeño retardo para no bloquear el primer render
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("Error reading cookie consent:", e);
    }
  }, []);

  const handleConsent = (tipo) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, tipo);
      window.dispatchEvent(new CustomEvent("cookie_consent_updated", { detail: tipo }));
    } catch (e) {
      console.error("Error writing cookie consent:", e);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside 
      role="region" 
      aria-live="polite"
      aria-label={t('cookies.aria_label', 'Aviso de privacidad y cookies')}
      className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 bg-[#172B47]/95 backdrop-blur-md border-t border-white/10 text-white shadow-2xl animate-fade-in-up"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8">
        
        <div className="flex items-start gap-3 md:gap-4 grow">
          <div className="p-2.5 rounded-xl bg-white/10 text-amber-300 shrink-0 mt-0.5 md:mt-0">
            <Cookie className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="text-xs md:text-sm text-gray-200 leading-relaxed">
            <p className="font-semibold text-white mb-1">
              {t('cookies.titulo', 'Transparencia y Protección de Datos')}
            </p>
            <p>
              {t(
                'cookies.descripcion', 
                'En IIRESODH utilizamos cookies técnicas indispensables y herramientas analíticas para optimizar tu experiencia y evaluar el impacto de nuestros recursos en derechos humanos, de conformidad con la Ley N° 8968 de Costa Rica.'
              )}{' '}
              <Link 
                to="/privacidad" 
                className="text-amber-300 hover:text-white underline font-medium ml-1 transition-colors"
              >
                {t('cookies.ver_politica', 'Conoce nuestra Política de Privacidad')}
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0">
          <button
            type="button"
            onClick={() => handleConsent("necessary")}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg transition-all w-1/2 md:w-auto text-center cursor-pointer"
          >
            {t('cookies.solo_necesarias', 'Solo Necesarias')}
          </button>
          
          <button
            type="button"
            onClick={() => handleConsent("all")}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-main-red hover:bg-red-800 rounded-lg shadow-md hover:shadow-lg transition-all w-1/2 md:w-auto text-center cursor-pointer"
          >
            {t('cookies.aceptar_todas', 'Aceptar Todas')}
          </button>
        </div>

      </div>
    </aside>
  );
}
