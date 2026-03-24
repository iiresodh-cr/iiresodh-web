// src/pages/QuienesSomos.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function QuienesSomos() {
  const location = useLocation();

  // Este efecto revisa si la URL trae un #hash y hace scroll suave hasta ahí
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

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* ENCABEZADO: Franja Azul Sólida (Congruente con Equipo) */}
      <div className="bg-main-blue text-white py-14 px-6 text-center relative z-20">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter mb-3 uppercase">¿Quiénes Somos?</h1>
        <p className="text-blue-100 max-w-3xl mx-auto font-medium opacity-90">
          Defendiendo la democracia y los derechos humanos desde Costa Rica para el mundo.
        </p>
        <div className="w-20 h-1.5 bg-main-red mx-auto mt-8 rounded-full"></div>
      </div>

      <div className="relative overflow-hidden grow pb-20">
        {/* Marca de agua institucional */}
        <div className="bg-watermark"></div>

        <section className="relative pt-12 md:pt-16 px-0 md:px-8 z-10">
          <div className="max-w-7xl mx-auto bg-white overflow-hidden">

            {/* CONTENIDO PRINCIPAL */}
            <div className="px-8 md:px-12 lg:px-16 pb-12 md:pb-16 animate-fade-in-up">
              
              {/* Párrafos centrados para lectura cómoda */}
              <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-16">
                <p>
                  El <strong className="font-extrabold text-main-blue">IIRESODH</strong> es una asociación sin fines de lucro, con su sede principal en Costa Rica y oficinas en otros países como Canadá, Colombia, Guatemala, Honduras, México, con el objetivo de fomentar el cumplimiento de los estándares internacionales de derechos humanos mediante un enfoque de participación ciudadana, gubernamental y corporativa.
                </p>
                <p>
                  Realizamos labores de capacitación, litigio estratégico y empoderamiento de la sociedad civil con fondos privados y de la cooperación internacional. El Instituto participa frecuentemente en los diferentes espacios de trabajos y audiencias de los sistemas de protección de derechos humanos, siendo una voz activa en la defensa de la democracia y los derechos humanos.
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

              {/* SECCIÓN MISIÓN Y VISIÓN */}
              <div id="mision-vision" className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mb-16 scroll-mt-32">
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

              {/* SECCIÓN PRINCIPIOS RECTORES */}
              <div id="principios-rectores" className="pt-10 border-t border-gray-100 scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-extrabold text-main-blue text-center mb-10 uppercase tracking-widest">
                  Principios Rectores
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    "Respeto a la dignidad humana.",
                    "Defensa de los derechos humanos.",
                    "Equidad de género.",
                    "Respeto y protección al medio ambiente.",
                    "Ética y transparencia laboral.",
                    "Inclusión social."
                  ].map((principio, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <div className="w-2.5 h-2.5 rounded-full bg-main-red shrink-0"></div>
                      <p className="text-main-blue font-bold text-base md:text-lg">{principio}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECCIÓN ORGANIGRAMA */}
        <section id="organigrama" className="bg-main-blue text-white py-16 md:py-20 px-6 relative z-20 scroll-mt-32 mt-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 uppercase tracking-widest text-white">
              Organigrama y Estructura
            </h2>
            <div className="text-base md:text-lg text-gray-200 leading-relaxed text-justify space-y-6 mb-16 font-light">
              <p>
                La estructura organizacional del IIRESODH tiene como máxima figura de autoridad formal a la Presidencia, a la cual están adscritas todas las unidades internas.
              </p>
              <p>
                Se aplica un criterio funcional para las unidades estructurales y un criterio territorial para reflejar nuestras oficinas en distintos países del mundo, ambas subordinadas a la Presidencia.
              </p>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-xl overflow-x-auto shadow-inner">
              <div className="min-w-175 flex flex-col items-center">
                <div className="bg-main-red text-white font-bold py-3 px-10 rounded-lg border-b-4 border-red-900 z-10 relative">
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
                    <div className="w-1 h-6 bg-gray-300"></div>
                    <div className="bg-gray-100 text-main-blue border border-gray-300 py-2 px-4 rounded text-center w-full text-xs font-semibold">
                      Coordinadores / Colaboradores
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="bg-main-blue text-white font-bold py-2 px-4 rounded text-center w-full text-sm">
                      Oficinas Territoriales
                    </div>
                    <div className="w-1 h-6 bg-gray-300"></div>
                    <div className="bg-gray-100 text-main-blue border border-gray-300 py-2 px-4 rounded text-center w-full text-xs font-semibold">
                      Coordinadores / Colaboradores
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="bg-light-blue text-white font-bold py-2 px-4 rounded text-center w-full text-sm">
                      Proyectos Transversales
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex items-center gap-4 border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 relative w-full justify-center">
                  <span className="text-gray-500 font-bold text-sm absolute top-2 left-4">Institución Vinculada:</span>
                  <div className="bg-pale-blue text-main-blue font-bold py-3 px-8 rounded mt-4">
                    U-IIRESODH (Altos Estudios Universitarios)
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-400 text-sm mt-4 italic">
              * Organigrama ilustrativo institucional.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}