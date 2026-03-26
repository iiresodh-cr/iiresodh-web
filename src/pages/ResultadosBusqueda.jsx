// src/pages/ResultadosBusqueda.jsx
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import PageHeader from "../components/PageHeader";

const PAGINAS_ESTATICAS = [
  { 
    id: 'p1-general', 
    titulo: '¿Quiénes somos? - Historia', 
    ruta: '/quienes-somos', 
    descripcion: 'Conoce la historia, trayectoria y participación ciudadana del IIRESODH.', 
    palabrasClave: ['historia', 'nosotros', 'acerca', 'institucion', 'quienes', 'somos'] 
  },
  { 
    id: 'p1-mision', 
    titulo: 'Misión y Visión', 
    ruta: '/quienes-somos#mision-vision', 
    descripcion: 'Conoce nuestra misión y visión institucional.', 
    palabrasClave: ['mision', 'vision', 'objetivos', 'proposito'] 
  },
  { 
    id: 'p1-principios', 
    titulo: 'Principios Rectores', 
    ruta: '/quienes-somos#principios-rectores', 
    descripcion: 'Descubre los valores y principios rectores que guían nuestro trabajo en la defensa de los derechos humanos.', 
    palabrasClave: ['principios', 'rectores', 'principios rectores', 'valores', 'etica', 'moral', 'dignidad', 'equidad', 'inclusion'] 
  },
  { 
    id: 'p1-organigrama', 
    titulo: 'Organigrama y Estructura', 
    ruta: '/quienes-somos#organigrama', 
    descripcion: 'Estructura organizacional y territorial del IIRESODH.', 
    palabrasClave: ['organigrama', 'estructura', 'presidencia', 'unidades', 'oficinas', 'territorial'] 
  },
  { 
    id: 'p2', 
    titulo: 'Equipo de Trabajo', 
    ruta: '/equipo', 
    descripcion: 'Conoce a los profesionales y expertos que conforman nuestro equipo.', 
    palabrasClave: ['equipo', 'profesionales', 'staff', 'directiva', 'miembros', 'personas'] 
  },
  { 
    id: 'p3', 
    titulo: 'Informes Anuales', 
    ruta: '/informes', 
    descripcion: 'Revisa nuestros informes de gestión y transparencia anual.', 
    palabrasClave: ['informes', 'anuales', 'transparencia', 'documentos', 'gestion', 'resultados'] 
  },
  { 
    id: 'p4', 
    titulo: 'Litigio Estratégico', 
    ruta: '/litigio-estrategico', 
    descripcion: 'Nuestra área de trabajo enfocada en el litigio estratégico para la defensa de los derechos humanos.', 
    palabrasClave: ['litigio', 'estrategico', 'derechos', 'humanos', 'legal', 'corte', 'area', 'trabajo'] 
  },
  { 
    id: 'p5', 
    titulo: 'Cooperación Internacional', 
    ruta: '/cooperacion-internacional', 
    descripcion: 'Proyectos y alianzas de cooperación a nivel internacional.', 
    palabrasClave: ['cooperacion', 'internacional', 'alianzas', 'proyectos', 'global', 'area', 'trabajo'] 
  },
  { 
    id: 'p6', 
    titulo: 'Donaciones', 
    ruta: '/donaciones', 
    descripcion: 'Apoya nuestra causa y contribuye a la defensa de los derechos humanos.', 
    palabrasClave: ['donar', 'donaciones', 'apoyo', 'colaborar', 'aportar', 'ayuda'] 
  }
];

const normalizarTexto = (texto) => {
  return texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
};

export default function ResultadosBusqueda() {
  const [searchParams] = useSearchParams();
  const terminoBusqueda = searchParams.get("q") || "";
  
  const [resultadosPaginas, setResultadosPaginas] = useState([]);
  const [resultadosNoticias, setResultadosNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarDatos = async () => {
      if (!terminoBusqueda.trim()) {
        setResultadosPaginas([]);
        setResultadosNoticias([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const terminoNormalizado = normalizarTexto(terminoBusqueda);

      const paginasFiltradas = PAGINAS_ESTATICAS.filter(pagina => {
        const tituloMatch = normalizarTexto(pagina.titulo).includes(terminoNormalizado);
        const descMatch = normalizarTexto(pagina.descripcion).includes(terminoNormalizado);
        const keywordMatch = pagina.palabrasClave.some(kw => normalizarTexto(kw).includes(terminoNormalizado));
        return tituloMatch || descMatch || keywordMatch;
      });
      setResultadosPaginas(paginasFiltradas);

      try {
        const q = query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"));
        const querySnapshot = await getDocs(q);
        
        const noticiasFiltradas = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const tituloNorm = normalizarTexto(data.titulo);
          const resumenNorm = normalizarTexto(data.resumen);
          const contenidoNorm = normalizarTexto(data.contenido);

          if (tituloNorm.includes(terminoNormalizado) || 
              resumenNorm.includes(terminoNormalizado) || 
              contenidoNorm.includes(terminoNormalizado)) {
            noticiasFiltradas.push({ id: doc.id, ...data });
          }
        });
        
        setResultadosNoticias(noticiasFiltradas);
      } catch (error) {
        console.error("Error al buscar en noticias:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarDatos();
  }, [terminoBusqueda]);

  const totalResultados = resultadosPaginas.length + resultadosNoticias.length;

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      <PageHeader 
        titulo="Resultados de Búsqueda" 
        subtitulo={`Mostrando resultados para: "${terminoBusqueda}"`} 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        {/* CONTENEDOR INSTITUCIONAL */}
        <section className="relative pt-12 md:pt-16 px-0 md:px-8 z-10" aria-label="Resultados encontrados">
          <div className="max-w-6xl mx-auto bg-white overflow-hidden shadow-sm md:rounded-3xl border border-gray-50">
            
            <div className="px-8 md:px-12 lg:px-16 py-12 md:py-16 animate-fade-in-up">
              
              {loading ? (
                <div className="flex flex-col justify-center items-center py-20" role="status">
                  <div className="w-16 h-16 border-4 border-pale-blue border-t-main-red rounded-full animate-spin mb-6" aria-hidden="true"></div>
                  <span className="text-main-blue font-bold text-lg uppercase tracking-widest">Buscando coincidencias...</span>
                </div>
              ) : totalResultados === 0 ? (
                <div className="text-center py-12" role="alert">
                  <svg className="w-20 h-20 text-gray-200 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <h2 className="text-2xl font-semibold text-main-blue mb-4">No encontramos coincidencias para su búsqueda</h2>
                  <p className="text-gray-500 font-light mb-8 max-w-md mx-auto">
                    Intente utilizar palabras clave más generales o revise la ortografía del término ingresado.
                  </p>
                  <Link to="/" className="inline-block bg-main-blue text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-light-blue transition-colors shadow-md" aria-label="Regresar a la página de inicio">
                    &larr; Volver al inicio
                  </Link>
                </div>
              ) : (
                <div className="space-y-16">
                  
                  {/* SECCIÓN: PÁGINAS ESTATÍSTICAS */}
                  {resultadosPaginas.length > 0 && (
                    <section aria-labelledby="static-results-title">
                      <h2 id="static-results-title" className="text-sm font-black text-main-red uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                        Secciones Institucionales
                        <div className="h-px bg-gray-100 grow" aria-hidden="true"></div>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
                        {resultadosPaginas.map(pagina => (
                          <article key={pagina.id} role="listitem">
                            <Link to={pagina.ruta} className="group bg-gray-50 p-6 rounded-2xl border border-transparent hover:border-pale-blue hover:bg-white hover:shadow-lg transition-all duration-300 block h-full" aria-label={`Ir a sección: ${pagina.titulo}`}>
                              <h3 className="text-lg font-semibold text-main-blue group-hover:text-light-blue transition-colors mb-2">{pagina.titulo}</h3>
                              <p className="text-sm text-gray-600 font-light leading-relaxed">{pagina.descripcion}</p>
                              <div className="mt-4 text-main-red text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                Ir a la sección <span aria-hidden="true">&rarr;</span>
                              </div>
                            </Link>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* SECCIÓN: NOTICIAS */}
                  {resultadosNoticias.length > 0 && (
                    <section aria-labelledby="news-results-title">
                      <h2 id="news-results-title" className="text-sm font-black text-main-red uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                        Noticias y Comunicados
                        <div className="h-px bg-gray-100 grow" aria-hidden="true"></div>
                      </h2>
                      <div className="flex flex-col gap-6" role="list">
                        {resultadosNoticias.map(noticia => (
                          <article key={noticia.id} role="listitem">
                            <Link to={`/noticias/${noticia.slug || noticia.id}`} className="group bg-white p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-xl hover:border-pale-blue transition-all duration-300 block" aria-label={`Leer noticia: ${noticia.titulo}`}>
                              <div className="w-full sm:w-48 shrink-0 aspect-4/5 bg-gray-50 rounded-xl overflow-hidden shadow-sm">
                                <img src={noticia.imagenPrincipalUrl} alt="" aria-hidden="true" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              </div>
                              <div className="flex flex-col justify-center grow">
                                <h3 className="text-xl font-semibold text-main-blue group-hover:text-main-red transition-colors mb-3 line-clamp-2 leading-tight">
                                  {noticia.titulo}
                                </h3>
                                <p className="text-gray-500 font-light text-sm line-clamp-2 mb-4 leading-relaxed">
                                  {noticia.resumen}
                                </p>
                                <span className="text-xs font-black text-main-red uppercase tracking-[0.2em] flex items-center gap-2">
                                  Leer noticia completa <span className="text-lg" aria-hidden="true">&rarr;</span>
                                </span>
                              </div>
                            </Link>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                </div>
              )}

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}