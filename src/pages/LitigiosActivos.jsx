// src/pages/LitigiosActivos.jsx
import { useEffect } from "react";

export default function LitigiosActivos() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* ENCABEZADO: Franja Azul Sólida Institucional */}
      <div className="bg-main-blue text-white py-14 px-6 text-center relative z-20">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter mb-3 uppercase">
          Litigios Activos
        </h1>
        <p className="text-blue-100 max-w-3xl mx-auto font-medium opacity-90">
          Área de consulta privada para el seguimiento de procesos judiciales y recursos para clientes.
        </p>
        <div className="w-20 h-1.5 bg-main-red mx-auto mt-8 rounded-full"></div>
      </div>

      <div className="relative overflow-hidden grow flex items-center justify-center p-8">
        {/* Marca de agua institucional */}
        <div className="bg-watermark"></div>
        
        <div className="relative z-10 text-center">
          {/* Animación de carga sutil para la construcción */}
          <div className="w-16 h-16 border-4 border-pale-blue border-t-main-red rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-400 uppercase tracking-widest font-bold">Sección en construcción</p>
          <p className="text-gray-300 text-sm mt-2 italic">Estamos habilitando el portal de acceso seguro para nuestros representados.</p>
        </div>
      </div>
    </div>
  );
}