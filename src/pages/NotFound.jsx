// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation(); // HOOK DE TRADUCCIÓN

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="relative overflow-hidden grow flex items-center justify-center py-20">
        
        <div className="bg-watermark"></div>

        <section className="relative z-10 px-8 w-full">
          <div className="max-w-6xl mx-auto flex justify-center">
            
            <div className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-12 md:p-20 text-center max-w-2xl w-full">
              <h1 className="text-8xl md:text-9xl font-black text-main-red mb-4 animate-bounce-slow">
                404
              </h1>
              <h2 className="text-2xl md:text-3xl font-extrabold text-main-blue mb-6 uppercase tracking-tight">
                {t('not_found.titulo', 'Página no encontrada')}
              </h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                {t('not_found.descripcion', 'Lo sentimos, el recurso que intentas buscar no existe o ha sido movido. Utiliza el menú de navegación o regresa a nuestra página principal.')}
              </p>
              
              <Link 
                to="/" 
                className="inline-block bg-main-blue hover:bg-light-blue text-white font-bold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {t('not_found.btn_volver', 'Volver al Inicio')}
              </Link>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}