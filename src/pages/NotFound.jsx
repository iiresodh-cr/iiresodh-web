// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import isotipo from "../assets/isotipo-blanco.png";

export default function NotFound() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="relative overflow-hidden flex-grow flex items-center justify-center py-20">
        
        {/* Capa de Marca de Agua con utilidad global */}
        <div 
          className="bg-watermark"
          style={{ backgroundImage: `url(${isotipo})` }}
        ></div>

        <section className="relative z-10 px-8 w-full">
          <div className="max-w-6xl mx-auto flex justify-center">
            
            <div className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-12 md:p-20 text-center max-w-2xl w-full">
              <h1 className="text-8xl md:text-9xl font-black text-[#B92F32] mb-4 animate-bounce-slow">
                404
              </h1>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#1D3557] mb-6 uppercase tracking-tight">
                Página no encontrada
              </h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                Lo sentimos, el recurso que intentas buscar no existe o ha sido movido. 
                Utiliza el menú de navegación o regresa a nuestra página principal.
              </p>
              
              <Link 
                to="/" 
                className="inline-block bg-[#1D3557] hover:bg-[#457B9D] text-white font-bold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Volver al Inicio
              </Link>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}