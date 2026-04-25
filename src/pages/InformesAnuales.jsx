// src/pages/InformesAnuales.jsx
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { Paper, CircularProgress } from "@mui/material";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";

export default function InformesAnuales() {
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchInformes = async () => {
      try {
        const q = query(collection(db, "informes"), orderBy("año", "desc"));
        const querySnapshot = await getDocs(q);
        
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setInformes(data);
      } catch (error) {
        console.error("Error al cargar los informes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInformes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-20" role="status">
        <CircularProgress size={50} thickness={4} sx={{ color: '#1D3557' }} />
        <span className="text-main-blue font-bold text-sm uppercase tracking-widest animate-pulse">
          Cargando archivo histórico...
        </span>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      <PageHeader 
        titulo="Informes Anuales" 
        subtitulo="Transparencia y rendición de cuentas sobre nuestra gestión e impacto en los Derechos Humanos." 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>
        
        <section className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-12 pb-16">
          
          <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-black text-main-blue tracking-tighter mb-6 text-center md:text-left">
              Archivo Histórico de Gestión
            </h2>
            <p>
              En nuestro compromiso con la transparencia, cada año publicamos un informe detallado que resume nuestras actividades, logros, impacto en litigio estratégico y el estado financiero de la organización.
            </p>
            <p>
              Estos documentos son un pilar de nuestra rendición de cuentas ante donantes, socios y el público general, reflejando el trabajo realizado en la promoción y defensa de los derechos humanos en la región.
            </p>
          </div>

          <div className="w-16 h-1 bg-main-red mx-auto mt-8 mb-16 rounded-full"></div>

          {informes.length === 0 ? (
             <div className="text-center py-10">
               <h2 className="text-2xl font-semibold text-main-blue mb-4 uppercase tracking-widest">
                 Aún no hay informes
               </h2>
               <p className="text-gray-500 font-light max-w-2xl mx-auto leading-relaxed italic">
                 Próximamente estaremos publicando nuestros informes de gestión.
               </p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {informes.map((informe) => (
                <Paper 
                  key={informe.id} 
                  elevation={0} 
                  className="group relative overflow-hidden aspect-3/4 border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  sx={{ borderRadius: '24px' }}
                >
                  {/* Imagen de fondo (Portada del informe) */}
                  <div 
                    className="absolute inset-0 bg-cover bg-top transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${informe.imagenPrincipalUrl || 'https://via.placeholder.com/600x800?text=Sin+Portada'})` }}
                    aria-label={`Portada del Informe ${informe.año}`}
                  />
                  
                  {/* Filtro oscuro para legibilidad */}
                  <div className="absolute inset-0 bg-linear-to-t from-main-blue via-main-blue/50 to-transparent opacity-90 group-hover:opacity-75 transition-opacity duration-500" />
                  
                  {/* Contenido de la tarjeta */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <span className="self-start bg-main-red text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg mb-auto shadow-lg">
                      Año {informe.año}
                    </span>
                    
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight drop-shadow-md">
                      Informe Anual de Gestión
                    </h3>
                    
                    <div className="w-12 h-1 bg-main-red rounded-full mb-6 transition-all duration-500 group-hover:w-24"></div>

                    <a 
                      href={informe.archivoInformeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white text-white hover:text-main-blue backdrop-blur-md border border-white/30 text-sm font-bold uppercase tracking-widest py-3.5 px-4 rounded-xl transition-all duration-300 w-full shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Descargar PDF
                    </a>
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