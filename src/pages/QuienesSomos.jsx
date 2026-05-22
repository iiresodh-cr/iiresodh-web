// src/pages/QuienesSomos.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";

// Importaciones estructurales de UI
import { Paper } from "@mui/material";
import posterVideo from "../assets/Isotipo-color-512.png";

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

export default function QuienesSomos() {
  const location = useLocation();
  const { t } = useTranslation(); 

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
      
      <PageHeader 
        titulo={t('quienes_somos.header_titulo', '¿Quiénes Somos?')} 
        subtitulo={t('quienes_somos.header_subtitulo', 'Defendiendo la democracia y los derechos humanos desde Costa Rica para el mundo.')} 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-12 pb-16 flex flex-col gap-16 md:gap-20">

          {/* BLOQUE 2: HISTORIA */}
          <div id="historia-section" className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify animate-fade-in-up">
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

          <div className="w-20 h-1 bg-main-red mx-auto rounded-full"></div>

          {/* SECCIÓN SEDES: ESTILO IGUAL A BENTO BOX, MÁS ANCHO Y SIN AIRE */}
          <section id="sedes-oficiales" className="pt-4 border-t border-gray-100 relative scroll-mt-24">
            
            {/* Cabecera idéntica al estilo de los pilares (Litigio Estratégico) */}
            <div className="mb-8 text-left">
              <h3 className="text-2xl font-bold text-main-blue mb-2">
                {t('quienes_somos.sedes_titulo', 'Sedes Oficiales')}
              </h3>
              <p className="text-gray-500 font-light text-base mb-6">
                {t('quienes_somos.sedes_subtitulo', 'Pasa el ratón sobre los puntos rojos en el mapa')}
              </p>
            </div>

            {/* Contenedor Ultra-Ancho: 20% texto / 80% mapa */}
            <div className="w-full flex flex-col-reverse lg:flex-row items-center gap-10">
              
              {/* PANEL DE INFORMACIÓN (Delgado lg:w-1/5) */}
              <div className="w-full lg:w-1/5 flex flex-col justify-center text-left">
                {(() => {
                  const sedeActiva = sedes.find(s => s.id === sedeActivaId) || sedes.find(s => s.id === 'cr');
                  const esCostaRica = sedeActiva.id === 'cr';
                  const textoEtiqueta = esCostaRica 
                    ? t('quienes_somos.sede_principal', 'Sede Principal') 
                    : t('quienes_somos.oficina_regional', 'Oficina Regional');

                  return (
                    <div className="flex flex-col justify-center animate-fade-in">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-main-red animate-pulse"></div>
                        <span className="text-[10px] font-bold text-main-red uppercase tracking-widest">
                          {textoEtiqueta}
                        </span>
                      </div>
                      <h4 className="text-xl font-extrabold text-main-blue mb-3 leading-tight uppercase">
                        {sedeActiva.pais}
                      </h4>
                      <p className="text-gray-600 font-light leading-relaxed text-sm">
                        {sedeActiva.info}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* MAPA (Gigante lg:w-4/5) - Proporción 1000x500 para máximo ancho */}
              <div className="w-full lg:w-4/5 flex items-center justify-end relative">
                <ComposableMap 
                  projection="geoMercator" 
                  projectionConfig={{ scale: 380, center: [-84, 22] }} 
                  width={1000} 
                  height={500} 
                  className="w-full h-auto outline-none" 
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) => geographies.map((geo) => (
                      <Geography 
                        key={geo.rsmKey} 
                        geography={geo} 
                        fill="#F3F4F6" 
                        stroke="#FFFFFF" 
                        strokeWidth={0.5} 
                        style={{ default: { outline: "none" }, hover: { fill: "#E5E7EB", outline: "none" } }} 
                      />
                    ))}
                  </Geographies>
                  {sedes.map((sede) => {
                    const isActive = sedeActivaId === sede.id;
                    return (
                      <Marker key={sede.id} coordinates={sede.coords}>
                        <g 
                          onMouseEnter={() => setSedeActivaId(sede.id)} 
                          className="focus:outline-none cursor-pointer"
                        >
                          <circle r={30} fill="transparent" />
                          {isActive && (
                            <circle r={20} fill="#1D3557" fillOpacity={0.15} className="animate-pulse" />
                          )}
                          <circle 
                            r={isActive ? 10 : 7} 
                            fill={isActive ? "#1D3557" : "#B92F32"} 
                            stroke="#FFFFFF" 
                            strokeWidth={2} 
                            className="transition-all duration-300" 
                          />
                        </g>
                      </Marker>
                    );
                  })}
                </ComposableMap>
              </div>

            </div>
          </section>

          {/* BLOQUE 1: PRESENCIA AUDIOVISUAL */}
          <div className="w-full flex flex-col gap-10">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-main-red font-black tracking-[0.3em] uppercase text-xs mb-3 block">
                {t('quienes_somos.presencia_etiqueta', 'Nuestra Presencia')}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-main-blue tracking-tighter">
                {t('quienes_somos.presencia_titulo', 'Impacto Global, Acción Local')}
              </h2>
            </div>

            <div className="max-w-5xl mx-auto w-full">
              <Paper elevation={4} className="w-full aspect-video rounded-3xl overflow-hidden shadow-lg bg-black" sx={{ borderRadius: '24px' }}>
                <video src="https://storage.googleapis.com/videos-iire/IIRESODH.webm" controls className="w-full h-full object-contain" poster={posterVideo} />
              </Paper>
            </div>
          </div>

          <div className="w-16 h-1 bg-main-red mx-auto rounded-full"></div>

          {/* BLOQUE 3: MISIÓN Y VISIÓN */}
          <div id="mision-vision" className="grid grid-cols-1 md:grid-cols-2 gap-8 scroll-mt-32">
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
                {t('quienes_somos.vision_texto', 'Ser una institución que impulse el respeto y la inclusión de los derechos humanos mediante estrategias de defense y capacitación, con la finalidad de construir una sociedad democrática y participativa.')}
              </p>
            </article>
          </div>

          <div className="w-16 h-1 bg-main-red mx-auto rounded-full"></div>

          {/* BLOQUE 4: PRINCIPIOS RECTORES */}
          <section id="principios-rectores" className="scroll-mt-32" aria-labelledby="principios-titulo">
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

          <div className="w-16 h-1 bg-main-red mx-auto rounded-full"></div>

          {/* BLOQUE 5: ORGANIGRAMA */}
          <section id="organigrama" className="relative z-20 scroll-mt-32" aria-labelledby="organigrama-titulo">
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