// src/components/PageHeader.jsx
export default function PageHeader({ titulo, subtitulo }) {
  return (
    <div className="bg-main-blue text-white py-14 px-6 text-center relative z-20">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-3 uppercase">
        {titulo}
      </h1>
      {subtitulo && (
        <p className="text-blue-100 max-w-3xl mx-auto font-medium opacity-90">
          {subtitulo}
        </p>
      )}
      <div className="w-20 h-1.5 bg-main-red mx-auto mt-8 rounded-full"></div>
    </div>
  );
}