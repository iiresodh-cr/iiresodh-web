// src/pages/ResultadosBusqueda.jsx
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import PageHeader from "../components/PageHeader";

// Importaciones de MUI
import { CircularProgress, Button } from "@mui/material";

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';
import { obtenerTextoTraducido } from "../utils/traductorDinamico";

const normalizarTexto = (texto) => {
  return texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
};

export default function ResultadosBusqueda() {
  const { t, i18n } = useTranslation(); 
  const [searchParams] = useSearchParams();
  const terminoBusqueda = searchParams.get("q") || "";
  
  const [resultadosPaginas, setResultadosPaginas] = useState([]);
  const [resultadosNoticias, setResultadosNoticias] = useState([]);
  const [resultadosArticulos, setResultadosArticulos] = useState([]);
  const [resultadosCursos, setResultadosCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const PAGINAS_ESTATICAS = [
    { 
      id: 'p1-general', 
      titulo: t('busqueda.p_historia_tit', '¿Quiénes somos? - Historia'), 
      ruta: '/quienes-somos', 
      descripcion: t('busqueda.p_historia_desc', 'Conoce la historia, trayectoria y participación ciudadana del IIRESODH.'), 
      palabrasClave: ['historia', 'nosotros', 'acerca', 'institucion', 'quienes', 'somos', 'about', 'history', 'histoire', 'nous'] 
    },
    { 
      id: 'p1-mision', 
      titulo: t('busqueda.p_mision_tit', 'Misión y Visión'), 
      ruta: '/quienes-somos#mision-vision', 
      descripcion: t('busqueda.p_mision_desc', 'Conoce nuestra misión y visión institucional.'), 
      palabrasClave: ['mision', 'vision', 'objetivos', 'proposito', 'mission', 'objectives', 'but'] 
    },
    { 
      id: 'p1-principios', 
      titulo: t('busqueda.p_principios_tit', 'Principios Rectores'), 
      ruta: '/quienes-somos#principios-rectores', 
      descripcion: t('busqueda.p_principios_desc', 'Descubre los valores y principios rectores que guían nuestro trabajo en la defensa de los derechos humanos.'), 
      palabrasClave: ['principios', 'rectores', 'valores', 'etica', 'moral', 'dignidad', 'equidad', 'inclusion', 'principles', 'values', 'ethics', 'valeurs', 'principes'] 
    },
    { 
      id: 'p1-organigrama', 
      titulo: t('busqueda.p_org_tit', 'Organigrama y Estructura'), 
      ruta: '/quienes-somos#organigrama', 
      descripcion: t('busqueda.p_org_desc', 'Estructura organizacional y territorial del IIRESODH.'), 
      palabrasClave: ['organigrama', 'estructura', 'presidencia', 'unidades', 'oficinas', 'territorial', 'structure', 'chart'] 
    },
    { 
      id: 'p2', 
      titulo: t('busqueda.p_equipo_tit', 'Equipo de Trabajo'), 
      ruta: '/equipo', 
      descripcion: t('busqueda.p_equipo_desc', 'Conoce a los profesionales y expertos que conforman nuestro equipo.'), 
      palabrasClave: ['equipo', 'profesionales', 'staff', 'directiva', 'miembros', 'personas', 'team', 'equipe'] 
    },
    { 
      id: 'p3', 
      titulo: t('busqueda.p_informes_tit', 'Informes Anuales'), 
      ruta: '/informes', 
      descripcion: t('busqueda.p_informes_desc', 'Revisa nuestros informes de gestión y transparencia anual.'), 
      palabrasClave: ['informes', 'anuales', 'transparencia', 'documentos', 'gestion', 'resultados', 'reports', 'annual', 'rapports'] 
    },
    { 
      id: 'p4', 
      titulo: t('busqueda.p_litigio_tit', 'Litigio Estratégico'), 
      ruta: '/litigio-estrategico', 
      descripcion: t('busqueda.p_litigio_desc', 'Nuestra área de trabajo enfocada en el litigio estratégico para la defensa de los derechos humanos.'), 
      palabrasClave: ['litigio', 'estrategico', 'derechos', 'humanos', 'legal', 'corte', 'area', 'trabajo', 'litigation', 'litige'] 
    },
    { 
      id: 'p5', 
      titulo: t('busqueda.p_cooperacion_tit', 'Cooperación Internacional'), 
      ruta: '/cooperacion-internacional', 
      descripcion: t('busqueda.p_cooperacion_desc', 'Proyectos y alianzas de cooperación a nivel internacional.'), 
      palabrasClave: ['cooperacion', 'internacional', 'alianzas', 'proyectos', 'global', 'cooperation', 'international'] 
    },
    { 
      id: 'p6', 
      titulo: t('busqueda.p_donaciones_tit', 'Donaciones'), 
      ruta: '/donaciones', 
      descripcion: t('busqueda.p_donaciones_desc', 'Apoya nuestra causa y contribuye a la defensa de los derechos humanos.'), 
      palabrasClave: ['donar', 'donaciones', 'apoyo', 'colaborar', 'aportar', 'ayuda', 'donate', 'donations', 'dons'] 
    }
  ];

  useEffect(() => {
    const buscarDatos = async () => {
      if (!terminoBusqueda.trim()) {
        setResultadosPaginas([]);
        setResultadosNoticias([]);
        setResultadosArticulos([]);
        setResultadosCursos([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const terminoNormalizado = normalizarTexto(terminoBusqueda);

      // 1. Filtrar páginas estáticas locales
      const paginasFiltradas = PAGINAS_ESTATICAS.filter(pagina => {
        const tituloMatch = normalizarTexto(pagina.titulo).includes(terminoNormalizado);
        const descMatch = normalizarTexto(pagina.descripcion).includes(terminoNormalizado);
        const keywordMatch = pagina.palabrasClave.some(kw => normalizarTexto(kw).includes(terminoNormalizado));
        return tituloMatch || descMatch || keywordMatch;
      });
      setResultadosPaginas(paginasFiltradas);

      try {
        // 2. Ejecutar consultas concurrentes a Firestore para máxima velocidad
        const [snapNoticias, snapArticulos, snapCursos] = await Promise.all([
          getDocs(query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"))),
          getDocs(query(collection(db, "articulos_academicos"), orderBy("fechaPublicacion", "desc"))),
          getDocs(query(collection(db, "cursos"), orderBy("fechaPublicacion", "desc")))
        ]);
        
        // 3. Filtrar colección de Noticias (respetando multilenguaje dinámico)
        const noticiasFiltradas = [];
        snapNoticias.forEach((doc) => {
          const data = doc.data();
          const tituloFinal = obtenerTextoTraducido(data, 'titulo', i18n.language);
          const resumenFinal = obtenerTextoTraducido(data, 'resumen', i18n.language);
          const contenidoFinal = obtenerTextoTraducido(data, 'contenido', i18n.language);

          if (
            normalizarTexto(tituloFinal).includes(terminoNormalizado) || 
            normalizarTexto(resumenFinal).includes(terminoNormalizado) || 
            normalizarTexto(contenidoFinal).includes(terminoNormalizado)
          ) {
            noticiasFiltradas.push({ id: doc.id, ...data });
          }
        });

        // 4. Filtrar colección de Artículos Académicos
        const articulosFiltrados = [];
        snapArticulos.forEach((doc) => {
          const data = doc.data();
          const tituloFinal = obtenerTextoTraducido(data, 'titulo', i18n.language);
          const resumenFinal = obtenerTextoTraducido(data, 'resumen', i18n.language);
          const contenidoFinal = obtenerTextoTraducido(data, 'contenido', i18n.language);

          if (
            normalizarTexto(tituloFinal).includes(terminoNormalizado) || 
            normalizarTexto(resumenFinal).includes(terminoNormalizado) || 
            normalizarTexto(contenidoFinal).includes(terminoNormalizado)
          ) {
            articulosFiltrados.push({ id: doc.id, ...data });
          }
        });

        // 5. Filtrar colección de Cursos
        const cursosFiltrados = [];
        snapCursos.forEach((doc) => {
          const data = doc.data();
          const tituloFinal = obtenerTextoTraducido(data, 'titulo', i18n.language);
          const resumenFinal = obtenerTextoTraducido(data, 'resumen', i18n.language);

          if (
            normalizarTexto(tituloFinal).includes(terminoNormalizado) || 
            normalizarTexto(resumenFinal).includes(terminoNormalizado)
          ) {
            cursosFiltrados.push({ id: doc.id, ...data });
          }
        });
        
        setResultadosNoticias(noticiasFiltradas);
        setResultadosArticulos(articulosFiltrados);
        setResultadosCursos(cursosFiltrados);
      } catch (error) {
        console.error("Error al buscar en colecciones de Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminoBusqueda, i18n.language]);

  const totalResultados = resultadosPaginas.length + resultadosNoticias.length + resultadosArticulos.length + resultadosCursos.length;

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      <PageHeader 
        titulo={t('busqueda.header_titulo', 'Resultados de Búsqueda')} 
        subtitulo={t('busqueda.header_subtitulo', 'Mostrando resultados para: "{{termino}}"').replace('{{termino}}', terminoBusqueda)} 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative pt-12 md:pt-16 px-0 md:px-8 z-10" aria-label="Resultados encontrados">
          <div className="max-w-6xl mx-auto bg-white overflow-hidden shadow-sm md:rounded-3xl border border-gray-50">
            
            <div className="px-8 md:px-12 lg:px-16 py-12 md:py-16 animate-fade-in-up">
              
              {loading ? (
                <div className="flex flex-col justify-center items-center py-20 gap-4" role="status">
                  <CircularProgress size={50} thickness={4} sx={{ color: '#1D3557' }} />
                  <span className="text-main-blue font-bold text-lg uppercase tracking-widest animate-pulse">
                    {t('busqueda.cargando', 'Buscando coincidencias...')}
                  </span>
                </div>
              ) : totalResultados === 0 ? (
                <div className="text-center py-12" role="alert">
                  <svg className="w-20 h-20 text-gray-200 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <h2 className="text-2xl font-semibold text-main-blue mb-4">
                    {t('busqueda.sin_resultados_tit', 'No encontramos coincidencias para su búsqueda')}
                  </h2>
                  <p className="text-gray-500 font-light mb-8 max-w-md mx-auto">
                    {t('busqueda.sin_resultados_desc', 'Intente utilizar palabras clave más generales o revise la ortografía del término ingresado.')}
                  </p>
                  
                  <Button 
                    component={Link}
                    to="/"
                    variant="contained"
                    startIcon={<span className="text-lg leading-none">&larr;</span>}
                    sx={{
                      bgcolor: 'primary.main', color: 'white', px: 4, py: 1.5, borderRadius: '50px',
                      fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      '&:hover': { bgcolor: 'info.main', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
                    }}
                    aria-label="Regresar a la página de inicio"
                  >
                    {t('busqueda.btn_volver', 'Volver al inicio')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-16">
                  
                  {/* SECCIÓN: PÁGINAS ESTATÍSTICAS */}
                  {resultadosPaginas.length > 0 && (
                    <section aria-labelledby="static-results-title">
                      <h2 id="static-results-title" className="text-sm font-black text-main-red uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                        {t('busqueda.sec_institucionales', 'Secciones Institucionales')}
                        <div className="h-px bg-gray-100 grow" aria-hidden="true"></div>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
                        {resultadosPaginas.map(pagina => (
                          <article key={pagina.id} role="listitem">
                            <Link to={pagina.ruta} className="group bg-gray-50 p-6 rounded-2xl border border-transparent hover:border-pale-blue hover:bg-white hover:shadow-lg transition-all duration-300 block h-full" aria-label={`Ir a sección: ${pagina.titulo}`}>
                              <h3 className="text-lg font-semibold text-main-blue group-hover:text-light-blue transition-colors mb-2">{pagina.titulo}</h3>
                              <p className="text-sm text-gray-600 font-light leading-relaxed">{pagina.descripcion}</p>
                              <div className="mt-4 text-main-red text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                {t('busqueda.ir_seccion', 'Ir a la sección')} <span aria-hidden="true">&rarr;</span>
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
                        {t('busqueda.sec_noticias', 'Noticias y Comunicados')}
                        <div className="h-px bg-gray-100 grow" aria-hidden="true"></div>
                      </h2>
                      <div className="flex flex-col gap-6" role="list">
                        {resultadosNoticias.map(noticia => {
                          const tituloTraducido = obtenerTextoTraducido(noticia, 'titulo', i18n.language);
                          const resumenTraducido = obtenerTextoTraducido(noticia, 'resumen', i18n.language);

                          return (
                            <article key={noticia.id} role="listitem">
                              <Link to={`/noticias/${noticia.slug || noticia.id}`} className="group bg-white p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-xl hover:border-pale-blue transition-all duration-300 h-full" aria-label={`Leer noticia: ${tituloTraducido}`}>
                                <div className="w-full sm:w-48 shrink-0 aspect-4/5 bg-gray-50 rounded-xl overflow-hidden shadow-sm">
                                  <img src={noticia.imagenPrincipalUrl} alt="" aria-hidden="true" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="flex flex-col justify-center grow">
                                  <h3 className="text-xl font-semibold text-main-blue group-hover:text-main-red transition-colors mb-3 line-clamp-2 leading-tight">
                                    {tituloTraducido}
                                  </h3>
                                  <p className="text-gray-500 font-light text-sm line-clamp-2 mb-4 leading-relaxed">
                                    {resumenTraducido}
                                  </p>
                                  <span className="text-xs font-black text-main-red uppercase tracking-[0.2em] flex items-center gap-2">
                                    {t('busqueda.leer_noticia', 'Leer noticia completa')} <span className="text-lg" aria-hidden="true">&rarr;</span>
                                  </span>
                                </div>
                              </Link>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* SECCIÓN: ARTÍCULOS ACADÉMICOS */}
                  {resultadosArticulos.length > 0 && (
                    <section aria-labelledby="articles-results-title">
                      <h2 id="articles-results-title" className="text-sm font-black text-main-red uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                        {t('busqueda.sec_articulos', 'Artículos Académicos')}
                        <div className="h-px bg-gray-100 grow" aria-hidden="true"></div>
                      </h2>
                      <div className="flex flex-col gap-6" role="list">
                        {resultadosArticulos.map(articulo => {
                          const tituloTraducido = obtenerTextoTraducido(articulo, 'titulo', i18n.language);
                          const resumenTraducido = obtenerTextoTraducido(articulo, 'resumen', i18n.language);

                          return (
                            <article key={articulo.id} role="listitem">
                              <Link to={`/articulos-academicos/${articulo.slug || articulo.id}`} className="group bg-white p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-xl hover:border-pale-blue transition-all duration-300 h-full" aria-label={`Leer artículo: ${tituloTraducido}`}>
                                {articulo.imagenPrincipalUrl && (
                                  <div className="w-full sm:w-48 shrink-0 aspect-video bg-gray-50 rounded-xl overflow-hidden shadow-sm self-center">
                                    <img src={articulo.imagenPrincipalUrl} alt="" aria-hidden="true" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  </div>
                                )}
                                <div className="flex flex-col justify-center grow">
                                  <h3 className="text-xl font-semibold text-main-blue group-hover:text-main-red transition-colors mb-3 line-clamp-2 leading-tight">
                                    {tituloTraducido}
                                  </h3>
                                  <p className="text-gray-500 font-light text-sm line-clamp-2 mb-4 leading-relaxed">
                                    {resumenTraducido}
                                  </p>
                                  <span className="text-xs font-black text-main-red uppercase tracking-[0.2em] flex items-center gap-2">
                                    {t('busqueda.leer_articulo', 'Leer artículo completo')} <span className="text-lg" aria-hidden="true">&rarr;</span>
                                  </span>
                                </div>
                              </Link>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* SECCIÓN: OFERTA ACADÉMICA / CURSOS */}
                  {resultadosCursos.length > 0 && (
                    <section aria-labelledby="courses-results-title">
                      <h2 id="courses-results-title" className="text-sm font-black text-main-red uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                        {t('busqueda.sec_cursos', 'Oferta Académica y Cursos')}
                        <div className="h-px bg-gray-100 grow" aria-hidden="true"></div>
                      </h2>
                      <div className="flex flex-col gap-6" role="list">
                        {resultadosCursos.map(curso => {
                          const tituloTraducido = obtenerTextoTraducido(curso, 'titulo', i18n.language);
                          const resumenTraducido = obtenerTextoTraducido(curso, 'resumen', i18n.language);

                          return (
                            <article key={curso.id} role="listitem">
                              <Link to="/cursos" className="group bg-white p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-xl hover:border-pale-blue transition-all duration-300 h-full" aria-label={`Ver curso: ${tituloTraducido}`}>
                                {curso.imagenPrincipalUrl && (
                                  <div className="w-full sm:w-48 shrink-0 aspect-video bg-gray-50 rounded-xl overflow-hidden shadow-sm self-center">
                                    <img src={curso.imagenPrincipalUrl} alt="" aria-hidden="true" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  </div>
                                )}
                                <div className="flex flex-col justify-center grow">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${curso.cursoActivo ? 'bg-blue-50 text-main-blue border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                      {curso.cursoActivo ? t('cursos.badge_abierto', 'Inscripciones Abiertas') : t('cursos.badge_cerrado', 'Cerrado')}
                                    </span>
                                  </div>
                                  <h3 className="text-xl font-semibold text-main-blue group-hover:text-main-red transition-colors mb-3 line-clamp-2 leading-tight">
                                    {tituloTraducido}
                                  </h3>
                                  <p className="text-gray-500 font-light text-sm line-clamp-2 mb-4 leading-relaxed">
                                    {resumenTraducido}
                                  </p>
                                  <span className="text-xs font-black text-main-red uppercase tracking-[0.2em] flex items-center gap-2">
                                    {t('busqueda.ver_curso', 'Ver oferta académica')} <span className="text-lg" aria-hidden="true">&rarr;</span>
                                  </span>
                                </div>
                              </Link>
                            </article>
                          );
                        })}
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