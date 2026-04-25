// src/pages/Cursos.jsx
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { Paper, CircularProgress } from "@mui/material";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCursos = async () => {
      try {
        const q = query(collection(db, "cursos"), orderBy("fechaPublicacion", "desc"));
        const querySnapshot = await getDocs(q);
        
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCursos(data);
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-20" role="status">
        <CircularProgress size={50} thickness={4} sx={{ color: '#1D3557' }} />
        <span className="text-main-blue font-bold text-sm uppercase tracking-widest animate-pulse">
          Cargando oferta académica...
        </span>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      <PageHeader 
        titulo="Oferta Académica y Cursos" 
        subtitulo="Formación especializada en Derechos Humanos y Litigio Estratégico." 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>
        
        <section className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-12 pb-16">
          
          <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-black text-main-blue tracking-tighter mb-6 text-center md:text-left">
              Capacitación Continua
            </h2>
            <p>
              Nuestra oferta académica está diseñada para empoderar a profesionales, defensores de derechos humanos y estudiantes con herramientas prácticas y conocimientos actualizados en materia de Derechos Humanos.
            </p>
          </div>

          <div className="w-16 h-1 bg-main-red mx-auto mt-8 mb-16 rounded-full"></div>

          {cursos.length === 0 ? (
             <div className="text-center py-10">
               <h2 className="text-2xl font-semibold text-main-blue mb-4 uppercase tracking-widest">
                 Próximamente
               </h2>
               <p className="text-gray-500 font-light max-w-2xl mx-auto leading-relaxed italic">
                 Estamos preparando nuevos cursos y diplomados. Mantente atento a nuestras redes sociales.
               </p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cursos.map((curso) => (
                <Paper 
                  key={curso.id} 
                  elevation={0} 
                  className={`group flex flex-col bg-white border border-gray-100 hover:border-main-blue/30 hover:shadow-xl transition-all duration-300 h-full overflow-hidden ${!curso.cursoActivo ? 'opacity-90 grayscale-[0.3]' : ''}`} 
                  sx={{ borderRadius: '24px' }}
                >
                  <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
                    <img 
                      src={curso.imagenPrincipalUrl || 'https://via.placeholder.com/800x450?text=Curso+IIRESODH'} 
                      alt={`Portada del curso: ${curso.titulo}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className={`absolute top-4 left-4 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md shadow-md ${curso.cursoActivo ? 'bg-main-blue' : 'bg-gray-500'}`}>
                      {curso.cursoActivo ? 'Inscripciones Abiertas' : 'Finalizado / Cerrado'}
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col grow">
                    <h3 className={`text-xl md:text-2xl font-bold mb-3 tracking-tight transition-colors leading-snug ${curso.cursoActivo ? 'text-gray-800 group-hover:text-main-blue' : 'text-gray-500'}`}>
                      {curso.titulo}
                    </h3>
                    <p className="text-gray-500 font-light leading-relaxed text-sm mb-8 grow line-clamp-3">
                      {curso.resumen}
                    </p>
                    
                    <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                      {curso.cursoActivo && curso.enlaceInscripcion ? (
                        <a 
                          href={curso.enlaceInscripcion} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bg-main-red hover:bg-red-800 text-white text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all w-full text-center shadow-md shadow-main-red/20 active:scale-95"
                        >
                          Inscribirse Ahora
                        </a>
                      ) : (
                        <div className="bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] py-3.5 px-6 rounded-xl w-full text-center border border-gray-200">
                          {curso.cursoActivo ? 'Enlace no disponible' : 'Periodo de inscripción cerrado'}
                        </div>
                      )}
                    </div>
                  </div>
                </Paper>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}