// src/pages/QuienesSomos.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function QuienesSomos() {
  const location = useLocation();

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
      titulo: "Respeto a la dignidad humana",
      texto: "La dignidad humana es el valor intrínseco e inalienable que posee cada persona por el simple hecho de serlo, sin distinción alguna de su origen, condición o capacidades. Este principio exige que los individuos sean tratados siempre como un fin en sí mismos y nunca meramente como un medio o herramienta para alcanzar otros objetivos. Implica reconocer la autonomía personal y garantizar que cada ser humano pueda vivir libre de humillaciones, maltratos o cualquier forma de degradación. Al colocar la dignidad en el centro de nuestras acciones, sentamos las bases para una convivencia basada en el reconocimiento mutuo y el valor sagrado de la vida."
    },
    {
      titulo: "Defensa de los derechos humanos",
      texto: "Defender los derechos humanos significa velar por el cumplimiento de las garantías fundamentales que permiten a las personas vivir con libertad, justicia y paz. Estos derechos son universales e interdependientes, actuando como un escudo protector frente al abuso de poder, la violencia y la discriminación sistemática. Su promoción no es solo una obligación legal de los Estados, sino un compromiso ético de la sociedad civil para erradicar la injusticia y proteger a los más vulnerables. Al garantizar estos derechos, aseguramos que la voz de cada individuo sea escuchada y que su integridad sea respetada en cualquier rincón del mundo."
    },
    {
      titulo: "Equidad de género",
      texto: "La equidad de género busca asegurar que todas las personas, independientemente de su sexo o identidad, tengan acceso a las mismas oportunidades, recursos y derechos fundamentales. No se trata simplemente de una igualdad numérica, sino de identificar y eliminar las barreras estructurales y los prejuicios históricos que han limitado históricamente el desarrollo de ciertos grupos. Fomentar la equidad permite que el talento y el esfuerzo se valoren por su capacidad real y no por estereotipos obsoletos que perpetúan la desigualdad. Es un paso indispensable para construir una sociedad más justa, donde el género no determine el límite de las aspiraciones de nadie."
    },
    {
      titulo: "Respeto y protección al medio ambiente",
      texto: "Este principio implica reconocer nuestra profunda interdependencia con la naturaleza y asumir la responsabilidad de preservar los recursos del planeta para las generaciones presentes y futuras. El respeto al entorno nos obliga a adoptar prácticas sostenibles que minimicen nuestra huella ecológica y promuevan la regeneración de los ecosistemas dañados por la actividad humana. No es una opción meramente estética o altruista, sino una necesidad vital para la supervivencia de la especie y el equilibrio climático global. Proteger el medio ambiente es, en última instancia, un acto de respeto hacia la vida en todas sus manifestaciones y una deuda con el futuro."
    },
    {
      titulo: "Ética y transparencia laboral",
      texto: "La ética y la transparencia son los pilares que sostienen la confianza dentro de cualquier organización y el sistema económico en su conjunto. Actuar con integridad en el trabajo significa tomar decisiones basadas en valores morales sólidos, evitando conflictos de intereses y combatiendo activamente cualquier forma de corrupción o favoritismo. La transparencia permite que los procesos sean claros y auditables, fomentando una cultura de rendición de cuentas donde la honestidad sea la norma y no la excepción. Un entorno laboral ético no solo mejora la productividad, sino que también dignifica el esfuerzo de los trabajadores y fortalece la reputación institucional."
    },
    {
      titulo: "Inclusión social",
      texto: "La inclusión social es el proceso proactivo de integrar a todos los individuos en la vida comunitaria, asegurando que aquellos en situación de vulnerabilidad o exclusión puedan participar plenamente. Esto requiere derribar barreras físicas, económicas y culturales que impiden el acceso equitativo a servicios básicos, empleo digno y participación ciudadana. Al valorar la diversidad como una riqueza y no como un problema, la inclusión fortalece el tejido social y reduce las brechas de desigualdad que suelen generar resentimiento y conflicto. Una sociedad verdaderamente inclusiva es aquella que se adapta para abrazar a todos sus miembros, garantizando que nadie se quede atrás."
    }
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      
      <PageHeader 
        titulo="¿Quiénes Somos?" 
        subtitulo="Defendiendo la democracia y los derechos humanos desde Costa Rica para el mundo." 
      />

      <div className="relative overflow-hidden grow pb-10">
        <div className="bg-watermark"></div>

        <section className="relative pt-8 md:pt-12 px-0 md:px-8 z-10">
          <div className="max-w-7xl mx-auto bg-white overflow-hidden">

            <div className="px-8 md:px-12 lg:px-16 pb-8 animate-fade-in-up w-full">
              
              <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-12">
                <p>
                  El <strong className="font-extrabold text-main-blue">IIRESODH</strong> nace en San José, Costa Rica, logrando crecer muy rápidamente para una más amplia y mejor atención que hoy nos permite tener oficinas de trabajo en varios países.
                </p>
                <p>
                  Desde su creación fue una entidad con claridad en sus objetivos para el fortalecimiento, promoción y protección de los derechos humanos, y con ello incidir en una cultura donde el respeto sea asumido por las empresas e instituciones públicas como una forma de desarrollo directo.
                </p>
                <p>
                  Contamos con acuerdos de cooperación con el CCPR-Centre en Ginebra, la Comisión Interamericana de Derechos Humanos, la Universidad Nacional de La Plata y el Instituto Universitario de Yucatán. Nuestro personal cuenta con amplia experiencia en el sistema interamericano y universal de Naciones Unidas.
                </p>
                <p>
                  Desde 2013 hemos capacitado a más de 1500 personas en América Latina y Europa. En 2021 abrimos el instituto de altos estudios universitarios (U-IIRESODH) en México para ofrecer maestrías especializadas.
                </p>
                <p>
                  Desde 2019 implementamos proyectos de cooperación orientados a la incidencia y al litigio estratégico en Nicaragua, Venezuela, Costa Rica y Colombia, con el apoyo de donantes como las embajadas de Reino Unido y Suiza, y el PNUD.
                </p>
              </div>

              <div id="mision-vision" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 scroll-mt-32">
                <div className="bg-gray-50 border-l-4 border-main-red p-8 md:p-10 rounded-r-xl">
                  <h2 className="text-2xl font-extrabold text-main-blue mb-4 uppercase tracking-wider flex items-center gap-3">
                    <span className="bg-main-red text-white w-8 h-8 flex items-center justify-center rounded-full text-lg font-black">M</span>
                    Misión
                  </h2>
                  <p className="text-gray-700 text-base md:text-lg font-light leading-relaxed text-justify">
                    Promover el respeto y cumplimiento de los estándares internacionales en derechos humanos a través del litigio estratégico y proyectos de capacitación, brindando acompañamiento al sector público y privado en materia de responsabilidad social.
                  </p>
                </div>
                <div className="bg-pale-blue/10 border-l-4 border-light-blue p-8 md:p-10 rounded-r-xl">
                  <h2 className="text-2xl font-extrabold text-main-blue mb-4 uppercase tracking-wider flex items-center gap-3">
                    <span className="bg-light-blue text-white w-8 h-8 flex items-center justify-center rounded-full text-lg font-black">V</span>
                    Visión
                  </h2>
                  <p className="text-gray-700 text-base md:text-lg font-light leading-relaxed text-justify">
                    Ser una institución que impulse el respeto y la inclusión de los derechos humanos mediante estrategias de defensa y capacitación, con la finalidad de construir una sociedad democrática y participativa.
                  </p>
                </div>
              </div>

              <div id="principios-rectores" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-semibold text-main-blue text-center mb-10 uppercase">
                  Principios Rectores
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {principiosRectores.map((principio, index) => (
                    <div key={index} className="flex flex-col bg-gray-50 p-8 rounded-xl border-t-4 border-main-red">
                      <h3 className="text-xl font-extrabold text-main-blue mb-3 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-main-red shrink-0"></div>
                        {principio.titulo}
                      </h3>
                      <p className="text-gray-600 font-light leading-relaxed text-justify text-base">
                        {principio.texto}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        <section id="organigrama" className="bg-main-blue text-white py-14 px-6 relative z-20 scroll-mt-32 mt-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-10 uppercase">
              Organigrama y Estructura
            </h2>
            <div className="text-base md:text-lg text-gray-200 leading-relaxed text-justify space-y-6 mb-16 font-light max-w-4xl mx-auto">
              <p>
                La estructura organizacional del IIRESODH tiene como máxima figura de autoridad formal a la Presidencia, a la cual están adscritas todas las unidades internas.
              </p>
              <p>
                Se aplica un criterio funcional para las unidades estructurales y un criterio territorial para reflejar nuestras oficinas en distintos países del mundo, ambas subordinadas a la Presidencia.
              </p>
            </div>
            
            <div className="bg-white p-8 md:p-12 rounded-xl overflow-x-auto">
              <div className="min-w-175 flex flex-col items-center">
                <div className="bg-main-red text-white font-bold py-3 px-10 rounded-lg z-10 relative">
                  PRESIDENCIA
                </div>
                <div className="w-1 h-8 bg-light-blue"></div>
                <div className="w-3/4 h-1 bg-light-blue"></div>
                <div className="flex justify-between w-3/4 mt-0">
                  <div className="w-1 h-8 bg-light-blue"></div>
                  <div className="w-1 h-8 bg-light-blue"></div>
                  <div className="w-1 h-8 bg-light-blue"></div>
                </div>
                <div className="flex justify-between w-full mt-0 gap-4">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="bg-main-blue text-white font-bold py-2 px-4 rounded text-center w-full text-sm">
                      Unidades Funcionales
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="bg-main-blue text-white font-bold py-2 px-4 rounded text-center w-full text-sm">
                      Oficinas Territoriales
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="bg-light-blue text-white font-bold py-2 px-4 rounded text-center w-full text-sm">
                      Proyectos Transversales
                    </div>
                  </div>
                </div>
                <div className="mt-10 flex items-center gap-4 border-2 border-dashed border-gray-300 p-6 rounded-lg bg-gray-50 relative w-full justify-center">
                  <div className="bg-pale-blue text-main-blue font-bold py-3 px-8 rounded">
                    U-IIRESODH (Altos Estudios Universitarios)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}