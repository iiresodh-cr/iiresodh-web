import { useEffect } from "react";

export default function LitigiosActivos() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="bg-white text-main-blue py-12 px-6 text-center relative z-20 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 uppercase">Litigios Activos</h1>
        <p className="text-base md:text-lg text-light-blue max-w-3xl mx-auto font-medium">Área de acceso privado para clientes.</p>
        <div className="w-20 h-1 bg-main-red mx-auto mt-6 rounded-full"></div>
      </div>
      <div className="relative overflow-hidden grow flex items-center justify-center p-8">
        <div className="bg-watermark"></div>
        <div className="relative z-10 text-center text-gray-500">
          <p>Sección en construcción...</p>
        </div>
      </div>
    </div>
  );
}