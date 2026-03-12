// src/pages/QuienesSomos.jsx
import isotipo from "../assets/isotipo-blanco.png";

export default function QuienesSomos() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      
      <div className="bg-white text-[#1D3557] py-12 px-6 text-center relative z-20 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 uppercase">¿Quiénes Somos?</h1>
        <p className="text-lg text-[#457B9D] max-w-3xl mx-auto font-medium">
          Defendiendo la democracia y los derechos humanos desde Costa Rica para el mundo.
        </p>
        <div className="w-20 h-1 bg-[#B92F32] mx-auto mt-6 rounded-full"></div>
      </div>

      <div className="relative overflow-hidden flex-grow border-b border-gray-200">
        <div 
          className="bg-watermark"
          style={{ backgroundImage: `url(${isotipo})` }}
        ></div>

        <section className="relative z-10 px-8 pt-6 pb-12 md:pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-sm text-lg text-gray-700 leading-loose text-justify space-y-6">
              <p>
                El IIRESODH es una asociación sin fines de lucro, con su sede principal en Costa Rica y oficinas en otros países como Canadá, Colombia, Guatemala, Honduras, México, con el objetivo de fomentar el cumplimiento de los estándares internacionales de derechos humanos mediante un enfoque de participación ciudadana, gubernamental y corporativa, de la cual nazcan proyectos y sinergias conjuntas entre todas las partes relevantes.
              </p>
              <p>
                Para ello, IIRESODH realiza labores de capacitación, litigio estratégico y empoderamiento de la sociedad civil con fondos privados y de la cooperación internacional. El Instituto participa frecuentemente en los diferentes espacios de trabajos y audiencias de los sistemas de protección de derechos humanos, siendo una voz activa en la defensa de la democracia y los derechos humanos.
              </p>
              <p>
                El Instituto cuenta con acuerdos de cooperación con el CCPR-Centre, ONG ubicada en Ginebra, Suiza, que se encarga de dar seguimiento a las recomendaciones emitidas por el Comité de Derechos Humanos de la ONU. Asimismo, IIRESODH ha firmado acuerdos con la Comisión Interamericana de Derechos Humanos, la Universidad Nacional de La Plata (Argentina) y el Instituto Universitario de Yucatán (México). Todos sus funcionarios y funcionarias cuentan con amplia experiencia en el sistema interamericano y en el sistema universal de Naciones Unidas, habiendo sido miembros de dichos organismos, o bien, habiéndose desempeñado como pasantes y asistentes legales.
              </p>
              <p>
                Desde el año 2013, IIRESODH ha capacitado a más de 1500 personas en América Latina y Europa en temas de litigio estratégico internacionales ante foros regionales y universales, incluyendo visitas a los principales órganos del sistema interamericano y de la ONU, así como ofreciendo oportunidades de realimentación con personas funcionarias de dichos órganos. En marzo de 2021, IIRESODH abrió las puertas de un instituto de altos estudios universitarios (U-IIRESODH) en Villahermosa, Tabasco, México, para ofrecer un valor agregado a aquellas personas que deseen optar por el grado académico de maestría.
              </p>
              <p>
                Con el fin de afianzar el vínculo natural entre el IIRESODH y la sociedad civil, desde el año 2019 se han implementado proyectos de cooperación internacional orientados a la incidencia y al litigio estratégico internacional colaborando en el fortalecimiento de capacidades de diferentes organizaciones de Nicaragua, Venezuela, Costa Rica y Colombia, para lo cual se recibió el apoyo de donantes internacionales como la embajada de Reino Unido en Costa Rica, la Embajada de Suiza para Costa Rica, El Salvador, Nicaragua y Costa Rica, y el Programa de Naciones Unidas para el Desarrollo.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-10 px-8 py-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-xl border-t-4 border-[#B92F32]">
              <h2 className="text-3xl font-extrabold text-[#1D3557] mb-6 uppercase tracking-wider flex items-center gap-3">
                <span className="bg-[#B92F32] text-white w-10 h-10 flex items-center justify-center rounded-full text-xl shadow-inner">M</span>
                Misión
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed text-justify">
                Promover el respeto y cumplimiento de los estándares internacionales en derechos humanos a través del litigio estratégico, proyectos de capacitación así como brindar un acompañamiento interdisciplinario tanto al sector público como privado para desarrollar iniciativas de capacitación en materia de responsabilidad social con enfoque en derechos humanos que permitan la defensa y reivindicación de los derechos de diversos actores sociales que históricamente han visto vulnerados sus derechos humanos.
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-xl border-t-4 border-[#457B9D]">
              <h2 className="text-3xl font-extrabold text-[#1D3557] mb-6 uppercase tracking-wider flex items-center gap-3">
                <span className="bg-[#457B9D] text-white w-10 h-10 flex items-center justify-center rounded-full text-xl shadow-inner">V</span>
                Visión
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed text-justify">
                Una institución que impulse en la comunidad internacional el respeto y la inclusión de los derechos humanos mediante el desarrollo de estrategias de defensa y capacitación en responsabilidad social y derechos humanos con la finalidad de construir una sociedad democrática, participativa y respetuosa de los derechos de todas las personas.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-10 px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1D3557] text-center mb-12 uppercase tracking-widest bg-white/60 backdrop-blur-sm py-4 rounded-xl shadow-sm inline-block px-8 mx-auto flex w-fit">
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
                <div key={index} className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-[#A8DADC] shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-[#B92F32] font-black text-3xl opacity-50">0{index + 1}</div>
                  <p className="text-[#1D3557] font-bold text-lg">{principio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div> 

      <section className="bg-[#1D3557] text-white py-20 px-6 relative z-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 uppercase tracking-widest text-white">
            Organigrama y Estructura
          </h2>
          <div className="text-lg text-gray-200 leading-relaxed text-justify space-y-6 mb-16 font-light">
            <p>
              La estructura organizacional del IIRESODH tiene como máxima figura de autoridad formal a la Presidencia, a la cual están adscritas, en una línea de subordinación directa todas las unidades internas.
            </p>
            <p>
              El principio de división del trabajo se realiza a través de la aplicación de criterios mixtos; inicialmente con un criterio funcional, donde las unidades estructurales y el talento humano asignado, se identifican según la función específica que se les asigna. Adicionalmente, se utiliza un criterio territorial, para reflejar las oficinas del Instituto, ubicadas en distintos países del mundo, las cuales igualmente están subordinadas a la Presidencia. 
            </p>
            <p>
              Cada unidad estructural divide a su personal en dos tipos: puestos de Coordinación y otros tipos de puestos colaboradores. La estructura organizacional está regida por el principio de flexibilidad, ya que el talento humano podrá participar de distintos procesos de trabajos transversales, entre unidades diferenciadas, según sea la decisión de la Presidencia, y en procura de la eficiencia y la calidad del servicio a las personas usuarias del Instituto. El Instituto de Altos Estudios Universitarios (U-IIRESODH), se ubica fuera de la estructura organizacional, en virtud de que se trata de una institución separada, que mantiene vínculos organizacionales con el IIRESODH.
            </p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl overflow-x-auto">
            <div className="min-w-[700px] flex flex-col items-center">
              <div className="bg-[#B92F32] text-white font-bold py-3 px-10 rounded-lg shadow-md border-b-4 border-red-900 z-10 relative">
                PRESIDENCIA
              </div>
              <div className="w-1 h-8 bg-[#457B9D]"></div>
              <div className="w-3/4 h-1 bg-[#457B9D]"></div>
              <div className="flex justify-between w-3/4 mt-0">
                <div className="w-1 h-8 bg-[#457B9D]"></div>
                <div className="w-1 h-8 bg-[#457B9D]"></div>
                <div className="w-1 h-8 bg-[#457B9D]"></div>
              </div>
              <div className="flex justify-between w-full mt-0 gap-4">
                <div className="flex-1 flex flex-col items-center">
                  <div className="bg-[#1D3557] text-white font-bold py-2 px-4 rounded shadow text-center w-full text-sm">
                    Unidades Funcionales
                  </div>
                  <div className="w-1 h-6 bg-gray-300"></div>
                  <div className="bg-gray-100 text-[#1D3557] border border-gray-300 py-2 px-4 rounded text-center w-full text-xs font-semibold">
                    Coordinadores / Colaboradores
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="bg-[#1D3557] text-white font-bold py-2 px-4 rounded shadow text-center w-full text-sm">
                    Oficinas Territoriales
                  </div>
                  <div className="w-1 h-6 bg-gray-300"></div>
                  <div className="bg-gray-100 text-[#1D3557] border border-gray-300 py-2 px-4 rounded text-center w-full text-xs font-semibold">
                    Coordinadores / Colaboradores
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="bg-[#457B9D] text-white font-bold py-2 px-4 rounded shadow text-center w-full text-sm">
                    Proyectos Transversales
                  </div>
                </div>
              </div>
              <div className="mt-12 flex items-center gap-4 border-2 border-dashed border-gray-400 p-4 rounded-lg bg-gray-50 relative w-full justify-center">
                <span className="text-gray-500 font-bold text-sm absolute top-2 left-4">Institución Vinculada:</span>
                <div className="bg-[#A8DADC] text-[#1D3557] font-bold py-3 px-8 rounded shadow mt-4">
                  U-IIRESODH (Altos Estudios Universitarios)
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-400 text-sm mt-4 italic">
            * Organigrama ilustrativo. Será reemplazado por la gráfica oficial próximamente.
          </p>
        </div>
      </section>
    </div>
  );
}