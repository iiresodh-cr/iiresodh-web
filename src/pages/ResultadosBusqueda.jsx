// src/pages/ResultadosBusqueda.jsx
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";

// Índice interno de páginas estáticas del sitio web (ENRIQUECIDO Y CON DEEP LINKS)
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
    ruta: '/', 
    descripcion: 'Nuestra área de trabajo enfocada en el litigio estratégico para la defensa de los derechos humanos.', 
    palabrasClave: ['litigio', 'estrategico', 'derechos', 'humanos', 'legal', 'corte', 'area', 'trabajo'] 
  },
  { 
    id: 'p5', 
    titulo: 'Cooperación Internacional', 
    ruta: '/', 
    descripcion: 'Proyectos y alianzas de cooperación a nivel internacional.', 
    palabrasClave: ['cooperacion', 'internacional', 'alianzas', 'proyectos', 'global', 'area', 'trabajo'] 
  },
  { 
    id: 'p6', 
    titulo: 'Donaciones', 
    ruta: '/', 
    descripcion: 'Apoya nuestra causa y contribuye a la defensa de los derechos humanos.', 
    palabrasClave: ['donar', 'donaciones', 'apoyo', 'colaborar', 'aportar', 'ayuda'] 
  }
];

// Función auxiliar para quitar acentos y facilitar la búsqueda
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

      // 1. Buscar en páginas estáticas
      const paginasFiltradas = PAGINAS_ESTATICAS.filter(pagina => {
        const tituloMatch = normalizarTexto(pagina.titulo).includes(terminoNormalizado);
        const descMatch = normalizarTexto(pagina.descripcion).includes(terminoNormalizado);
        const keywordMatch = pagina.palabrasClave.some(kw => normalizarTexto(kw).includes(terminoNormalizado));
        return tituloMatch || descMatch || keywordMatch;
      });
      setResultadosPaginas(paginasFiltradas);

      // 2. Buscar en Noticias de Firestore
      try {
        const q = query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"));
        const querySnapshot = await getDocs(q);
        
        const noticiasFiltradas = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Normalizamos campos para buscar ignorando mayúsculas y acentos
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
    <div className="bg-basic-beige min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-extrabold text-main-blue mb-2">
            Resultados de Búsqueda
          </h1>
          <p className="text-lg text-light-blue">
            Buscando: <span className="font-bold text-main-red">"{terminoBusqueda}"</span>
          </p>
          {!loading && (
            <p className="text-sm text-gray-500 mt-2">
              Se encontraron {totalResultados} resultado{totalResultados !== 1 ? 's' : ''}.
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-10 w-10 text-main-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-main-blue font-bold text-lg">Buscando...</span>
          </div>
        ) : totalResultados === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <h2 className="text-xl font-bold text-main-blue mb-2">No encontramos coincidencias</h2>
            <p className="text-gray-500">Intenta utilizar otras palabras clave o términos más generales.</p>
            <Link to="/" className="inline-block mt-6 text-main-red hover:text-bright-red font-bold transition-colors">
              &larr; Volver al inicio
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* SECCIÓN: PÁGINAS DEL SITIO */}
            {resultadosPaginas.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-main-blue mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path></svg>
                  Secciones del Sitio
                </h2 >
                <div className="grid gap-4">
                  {resultadosPaginas.map(pagina => (
                    <Link key={pagina.id} to={pagina.ruta} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-pale-blue transition-all group">
                      <h3 className="text-lg font-bold text-main-blue group-hover:text-light-blue transition-colors mb-1">{pagina.titulo}</h3>
                      <p className="text-sm text-gray-600">{pagina.descripcion}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* SECCIÓN: NOTICIAS */}
            {resultadosNoticias.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-main-blue mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path></svg>
                  Noticias Publicadas
                </h2>
                <div className="grid gap-4">
                  {resultadosNoticias.map(noticia => (
                    <Link key={noticia.id} to={`/noticias/${noticia.id}`} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-5 hover:shadow-md hover:border-pale-blue transition-all group">
                      <div className="w-full sm:w-40 shrink-0 aspect-video sm:aspect-square bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                        <img src={noticia.imagenPrincipalUrl} alt={noticia.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-main-blue group-hover:text-light-blue transition-colors mb-2 line-clamp-2">
                          {noticia.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {noticia.resumen}
                        </p>
                        <span className="text-xs font-bold text-main-red uppercase tracking-wider">
                          Leer más &rarr;
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}