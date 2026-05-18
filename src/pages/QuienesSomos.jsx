// src/pages/QuienesSomos.jsx
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";

// Importaciones para el Mapa y Video
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Paper } from "@mui/material";
import posterVideo from "../assets/Isotipo-color-512.png";

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function QuienesSomos() {
  const location = useLocation();
  const { t } = useTranslation(); // HOOK DE TRADUCCIÓN

  // Estados y Refs para el Mapa
  const [hoveredSede, setHoveredSede] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const mapContainerRef = useRef(null);

  // Sedes traducidas dinámicamente
  const sedes = [
    { id: 'ca', pais: t('quienes_somos.sede_ca_pais', 'Canadá'), coords: [-71.1743, 46.8033], info: t('quienes_somos.sede_ca_info', 'Atención virtual o presencial previa cita en la ciudad de Lévis, Québec. En Toronto vinculado con Waldman & Associates. Email: contacto@iiresodh.org') },
    { id: 'mx', pais: t('quienes_somos.sede_mx_pais', 'México'), coords: [-99.1332, 19.4326], info: t('quienes_somos.sede_mx_info', 'Atención virtual o presencial previa cita. Email: contacto@iiresodh.org') },
    { id: 'gt', pais: t('quienes_somos.sede_gt_pais', 'Guatemala'), coords: [-90.5069, 14.6349], info: t('quienes_somos.sede_gt_info', 'Diagonal 6 12-42, Edificio Design Center. Oficina No. 506, Torre 1, Zona 10. Ciudad de Guatemala. Teléfono: +502 5557 7466') },
    { id: 'cr', pais: t('quienes_somos.sede_cr_pais', 'Costa Rica'), coords: [-84.0833, 9.9333], info: t('quienes_somos.sede_cr_info', 'Centro Corporativo San Rafael, nivel 3. San Rafael de Escazú, San José. CP 10201. Teléfono: +506 4703 5727') },
    { id: 'co', pais: t('quienes_somos.sede_co_pais', 'Colombia'), coords: [-74.0636, 4.6243], info: t('quienes_somos.sede_co_info', 'Carrera. 11C No. 117-05. Oficina 5. Bogotá, Colombia. Teléfono: Bogotá +7461964. Móvil: +57 301 4844324') }
  ];

  useEffect(() => {
    if (location.hash) {
      const elemento = document.getElementById(location.hash.substring(1));
      if (elemento) {
        setTimeout(() => {
          elemento.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0); 
    }
  }, [location]);

  // Funciones del Mapa
  const handleHover = (sede, e) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const leftPos = x > rect.width / 2 ? x - 260 : x + 20;
    const topPos = y < 150 ? y + 20 : y - 140;
    setTooltipPos({ top: topPos, left: leftPos });
    setHoveredSede(sede);
  };

  const showTooltipKeyboard = (sede, target) => {
    const rect = target.getBoundingClientRect();
    const mapRect = mapContainerRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - mapRect.left;
    const y = rect.top + rect.height / 2 - mapRect.top;
    const leftPos = x > mapRect.width / 2 ? x - 260 : x + 20;
    const topPos = y < 150 ? y + 20 : y - 140;
    setTooltipPos({ top: topPos, left: leftPos });
    setHoveredSede(sede);
  };

  // PRINCIPIOS RECTORES traducidos dinámicamente
  const principiosRectores = [
    {
      titulo: t('quienes_somos.prin_1_tit', 'Dignidad Humana'),
      texto: t('quienes_somos.prin_1_tex', 'Valor intrínseco e inalienable de cada persona. Exige tratar a los individuos como un fin en sí mismos, garantizando una vida libre de humillaciones y basada en el reconocimiento mutuo.')
    },
    {
      titulo: t('quienes_somos.prin_2_tit', 'Defensa de Derechos'),
      texto: t('quienes_somos.prin_2_tex', 'Velar por las garantías fundamentales que permiten vivir con libertad, justicia y paz. Actúan como un escudo protector frente al abuso de poder y la discriminación sistemática.')
    },
    {
      titulo: t('quienes_somos.prin_3_tit', 'Equidad de Género'),
      texto: t('quienes_somos.prin_3_tex', 'Asegurar que todas las personas tengan acceso a las mismas oportunidades, eliminando barreras estructurales y prejuicios para construir una sociedad justa y equitativa.')
    },
    {
      titulo: t('quienes_somos.prin_4_tit', 'Protección Ambiental'),
      texto: t('quienes_somos.prin_4_tex', 'Adoptar prácticas sostenibles que minimicen nuestra huella ecológica, reconociendo nuestra interdependencia con la naturaleza para protegerla para las generaciones futuras.')
    },
    {
      titulo: t('quienes_somos.prin_5_tit', 'Ética y Transparencia'),
      texto: t('quienes_somos.prin_5_tex', 'Actuar con integridad, evitando conflictos de intereses y combatiendo la corrupción. Fomentar una cultura de rendición de cuentas donde la honestidad sea la norma.')
    },
    {
      titulo: t('quienes_somos.prin_6_tit', 'Inclusión Social'),
      texto: t('quienes_somos.prin_6_tex', 'Integrar a todos los individuos en la vida comunitaria, especialmente a los más vulnerables, derribando barreras físicas, económicas y culturales que impiden la participación.')
    }
  ];

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden">
      
      {/* PageHeader TRADUCIDO */}
      <PageHeader 
        titulo={t('quienes_somos.header_titulo', '¿Quiénes Somos?')} 
        subtitulo={t('quienes_somos.header_subtitulo', 'Defendiendo la democracia y los derechos humanos desde Costa Rica para el mundo.')} 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-12 pb-16">

          {/* BLOQUE 2: HISTORIA */}
          <div id="historia-section" className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-20 animate-fade-in-up">
            <p>
              {t('quienes_somos.historia_1_pt1', 'El')} <strong className="font-semibold text-main-blue">IIRESODH</strong> {t('quienes_somos.historia_1_pt2', 'nace en San José, Costa Rica, logrando crecer muy rápidamente para una más amplia y mejor atención que hoy nos permite tener oficinas de trabajo en varios países.')}
            </p>
            <p>
              {t('quienes_somos.historia_2', 'Desde su creación fue una entidad con claridad en sus objetivos para el fortalecimiento, promoción y protección de los derechos humanos, y con ello incidir en una cultura donde el respeto sea asumido por las empresas e instituciones públicas como una forma de desarrollo directo.')}
            </p>
            <p>
              {t('quienes_somos.historia_3', 'Contamos con acuerdos de cooperación con el CCPR-Centre en Ginebra, la Comisión Interamericana de Derechos Humanos, la Universidad Nacional de La Plata y el Instituto Universitario de Yucatán. Nuestro personal cuenta con amplia experiencia en el sistema interamericano y universal de Naciones Unidas.')}
            </p>
            <p>
              {t('quienes_somos.historia_4', 'Desde 2013 hemos capacitado a más de 1500 personas en América Latina y Europa. En 2021 abrimos el instituto de altos estudios universitarios (U-IIRESODH) en México para ofrecer maestrías especializadas.')}
            </p>
            <p>
              {t('quienes_somos.historia_5', 'Desde 2019 implementamos proyectos de cooperación orientados a la incidencia y al litigio estratégico en Nicaragua, Venezuela, Costa Rica y Colombia, con el apoyo de donantes como las embajadas de Reino Unido y Suiza, y el PNUD.')}
            </p>
          </div>

          <div className="w-20 h-1 bg-main-red mx-auto mt-16 mb-16 rounded-full"></div>

          {/* BLOQUE 1: Presencia (Video/Map) */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-main-red font-black tracking-[0.3em] uppercase text-xs mb-3 block">
              {t('quienes_somos.presencia_etiqueta', 'Nuestra Presencia')}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-main-blue tracking-tighter">
              {t('quienes_somos.presencia_titulo', 'Impacto Global, Acción Local')}
            </h2>
          </div>

          {/* VIDEO INSTITUCIONAL */}
          <div className="max-w-5xl mx-auto mb-16">
            <Paper elevation={4} className="w-full aspect-video rounded-3xl overflow-hidden shadow-lg bg-black" sx={{ borderRadius: '24px' }}>
              <video src="https://storage.googleapis.com/videos-iire/IIRESODH.webm" controls className="w-full h-full object-contain" poster={posterVideo} />
            </Paper>
          </div>

          {/* SEDES OFICIALES (MAPA) */}
          <div className="max-w-5xl mx-auto">
            <Paper elevation={0} className="w-full relative bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col items-center justify-center h-full" sx={{ borderRadius: '24px' }}>
              <div className="text-center mb-4 w-full">
                <h3 className="text-xl font-black text-main-blue uppercase tracking-tight">{t('quienes_somos.sedes_titulo', 'Sedes Oficiales')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('quienes_somos.sedes_subtitulo', 'Pasa el ratón sobre los puntos rojos en el mapa')}</p>
              </div>
              
              <div ref={mapContainerRef} className="w-full grow flex items-center justify-center relative">
                <ComposableMap projection="geoMercator" projectionConfig={{ scale: 300, center: [-85, 30] }} className="w-full h-auto max-h-96" aria-label="Mapa interactivo de sedes internacionales">
                  <Geographies geography={geoUrl}>
                    {({ geographies }) => geographies.map((geo) => (
                      <Geography key={geo.rsmKey} geography={geo} fill="#457B9D" stroke="#FFFFFF" strokeWidth={0.5} style={{ default: { outline: "none" }, hover: { fill: "#1D3557", outline: "none" } }} />
                    ))}
                  </Geographies>
                  {sedes.map((sede) => (
                    <Marker key={sede.id} coordinates={sede.coords}>
                      <g tabIndex="0" role="button" aria-label={`Sede en ${sede.pais}`} onMouseEnter={(e) => handleHover(sede, e)} onMouseLeave={() => setHoveredSede(null)} onFocus={(e) => showTooltipKeyboard(sede, e.target)} onBlur={() => setHoveredSede(null)} className="focus:outline-none cursor-pointer">
                        <circle r={25} fill="transparent" className="cursor-pointer" />
                        <circle r={25} fill="#B92F32" fillOpacity={0.1} className="animate-pulse pointer-events-none" />
                        <circle r={10} fill="#B92F32" stroke="#FFFFFF" strokeWidth={2} className="pointer-events-none" />
                      </g>
                    </Marker>
                  ))}
                </ComposableMap>
                
                {hoveredSede && (
                  <div role="tooltip" className="absolute z-50 bg-white p-4 rounded-xl flex flex-col gap-2 w-60 shadow-xl border border-gray-100 pointer-events-none" style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}>
                    <h4 className="text-lg font-semibold text-main-red uppercase tracking-tight border-b border-gray-50 pb-2">{hoveredSede.pais}</h4>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">{hoveredSede.info}</p>
                  </div>
                )}
              </div>
            </Paper>
          </div>

          <div className="w-16 h-1 bg-main-red mx-auto mt-12 mb-12 rounded-full"></div>

          {/* BLOQUE 3: MISIÓN Y VISIÓN */}
          <div id="mision-vision" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 scroll-mt-32">
            <article className="bg-gray-50 border-l-4 border-main-red p-8 md:p-10 rounded-r-2xl shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-extrabold text-main-blue mb-4 uppercase tracking-wider flex items-center gap-3">
                <span className="bg-main-red text-white w-10 h-10 flex items-center justify-center rounded-xl text-lg font-black shadow-sm" aria-hidden="true">M</span>
                {t('quienes_somos.mision_titulo', 'Misión')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed text-justify">
                {t('quienes_somos.mision_texto', 'Promover el respeto y cumplimiento de los estándares internacionales en derechos humanos a través del litigio estratégico y proyectos de capacitación, brindando acompañamiento al sector público y privado en materia de responsabilidad social.')}
              </p>
            </article>
            <article className="bg-pale-blue/10 border-l-4 border-light-blue p-8 md:p-10 rounded-r-2xl shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-extrabold text-main-blue mb-4 uppercase tracking-wider flex items-center gap-3">
                <span className="bg-light-blue text-white w-10 h-10 flex items-center justify-center rounded-xl text-lg font-black shadow-sm" aria-hidden="true">V</span>
                {t('quienes_somos.vision_titulo', 'Visión')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed text-justify">
                {t('quienes_somos.vision_texto', 'Ser una institución que impulse el respeto y la inclusión de los derechos humanos mediante estrategias de defensa y capacitación, con la finalidad de construir una sociedad democrática y participativa.')}
              </p>
            </article>
          </div>

          <div className="w-16 h-1 bg-main-red mx-auto mt-12 mb-12 rounded-full"></div>

          {/* BLOQUE 4: PRINCIPIOS RECTORES */}
          <section id="principios-rectores" className="scroll-mt-32 mb-16" aria-labelledby="principios-titulo">
            <div className="text-center mb-12">
              <h2 id="principios-titulo" className="text-3xl md:text-4xl font-black text-main-blue uppercase tracking-tighter">
                {t('quienes_somos.principios_titulo', 'Principios Rectores')}
              </h2>
              <div className="w-16 h-1 bg-main-red mx-auto mt-4 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {principiosRectores.map((principio, index) => (
                <Paper key={index} elevation={0} className="flex flex-col bg-gray-50/50 p-8 border border-gray-100 hover:border-main-red/30 hover:shadow-md transition-all duration-300 h-full" sx={{ borderRadius: '20px' }} role="listitem">
                  <h3 className="text-xl font-bold text-main-blue mb-3 flex items-center gap-3 tracking-tight">
                    <div className="w-2.5 h-2.5 rounded-full bg-main-red shrink-0" aria-hidden="true"></div>
                    {principio.titulo}
                  </h3>
                  <p className="text-gray-500 font-light leading-relaxed text-sm">
                    {principio.texto}
                  </p>
                </Paper>
              ))}
            </div>
          </section>

          {/* BLOQUE 5: ORGANIGRAMA */}
          <section id="organigrama" className="relative z-20 scroll-mt-32 mt-8" aria-labelledby="organigrama-titulo">
            <div className="max-w-5xl mx-auto">
              <h2 id="organigrama-titulo" className="text-3xl md:text-4xl font-black text-center mb-8 uppercase tracking-tighter text-main-blue">
                {t('quienes_somos.org_titulo', 'Organigrama Institucional')}
              </h2>
              <div className="text-base md:text-lg text-gray-600 leading-relaxed text-justify space-y-6 mb-12 font-light max-w-4xl mx-auto">
                <p>
                  {t('quienes_somos.org_texto_1', 'La estructura organizacional del IIRESODH tiene como máxima figura de autoridad formal a la Presidencia, a la cual están adscritas todas las unidades internas.')}
                </p>
                <p>
                  {t('quienes_somos.org_texto_2', 'Se aplica un criterio funcional para las unidades estructurales y un criterio territorial para reflejar nuestras oficinas en distintos países del mundo, ambas subordinadas a la Presidencia.')}
                </p>
              </div>
              
              {/* Contenedor del diagrama plano */}
              <div className="bg-gray-50 p-8 md:p-12 rounded-4xl overflow-x-auto border border-gray-100" role="img" aria-label="Diagrama de flujo que muestra la estructura del organigrama institucional">
                <div className="min-w-175 flex flex-col items-center">
                  <div className="bg-main-red text-white font-black py-4 px-12 rounded-xl z-10 relative shadow-sm tracking-widest uppercase">
                    {t('quienes_somos.org_presidencia', 'PRESIDENCIA')}
                  </div>
                  <div className="w-1 h-8 bg-light-blue" aria-hidden="true"></div>
                  <div className="w-3/4 h-1 bg-light-blue" aria-hidden="true"></div>
                  <div className="flex justify-between w-3/4 mt-0" aria-hidden="true">
                    <div className="w-1 h-8 bg-light-blue"></div>
                    <div className="w-1 h-8 bg-light-blue"></div>
                    <div className="w-1 h-8 bg-light-blue"></div>
                  </div>
                  <div className="flex justify-between w-full mt-0 gap-6">
                    <div className="flex-1 flex flex-col items-center">
                      <div className="rounded-lg p-3 text-center w-full text-sm font-bold border border-gray-200 bg-white text-main-blue shadow-sm">
                        {t('quienes_somos.org_unidades', 'Unidades Funcionales')}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="rounded-lg p-3 text-center w-full text-sm font-bold border border-gray-200 bg-white text-main-blue shadow-sm">
                        {t('quienes_somos.org_territoriales', 'Oficinas Territoriales')}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="rounded-lg p-3 text-center w-full text-sm font-bold border border-gray-200 bg-white text-main-blue shadow-sm">
                        {t('quienes_somos.org_transversales', 'Proyectos Transversales')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 flex items-center gap-4 border-2 border-dashed border-gray-300 p-8 rounded-2xl bg-white relative w-full justify-center">
                    <div className="bg-pale-blue text-main-blue font-black py-4 px-10 rounded-xl shadow-sm tracking-wide border border-pale-blue">
                      {t('quienes_somos.org_universidad', 'U-IIRESODH (Altos Estudios Universitarios)')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </section>

      </div>
    </main>
  );
}