// src/pages/LitigioEstrategico.jsx
import { useEffect } from "react";

export default function LitigioEstrategico() {
  // Hacer scroll al tope de la página al cargar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white flex flex-col min-h-screen">
      {/* Encabezado de la página */}
      <div className="bg-white text-main-blue py-12 px-6 text-center relative z-20 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 uppercase">
          Litigio Estratégico
        </h1>
        <p className="text-base md:text-lg text-light-blue max-w-3xl mx-auto font-medium">
          Defensa activa y capacitación en los sistemas universales y regionales de protección.
        </p>
        <div className="w-20 h-1 bg-main-red mx-auto mt-6 rounded-full"></div>
      </div>

      <div className="relative overflow-hidden grow pb-20">
        {/* Marca de agua institucional */}
        <div className="bg-watermark"></div>

        <section className="relative py-12 md:py-16 px-0 md:px-8 z-10">
          <div className="max-w-5xl mx-auto bg-white md:rounded-3xl shadow-2xl border-y md:border border-gray-100 p-8 md:p-12 lg:p-16">
            
            {/* Contenido principal con tipografía light y justificada */}
            <div className="space-y-8 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify animate-fade-in-up">
              
              <p>
                <strong className="font-extrabold text-main-blue">IIRESODH</strong> fomenta activamente el litigio estratégico internacional en materia de derechos humanos. Capacitamos a ONGs, defensores de derechos humanos y otras organizaciones de la sociedad civil, con el fin de que hagan uso de los mecanismos judiciales y cuasi-judiciales que ofrecen los sistemas universales y regionales de protección. 
              </p>

              <p>
                Las capacitaciones son impartidas por expertos de gran prestigio, así como por personas que trabajan en los principales organismos y tribunales internacionales. También litigamos casos de situaciones generalizadas de violaciones de derechos humanos en distintos países.
              </p>

              {/* Caja destacada para las Certificaciones */}
              <div className="bg-gray-50 border-l-4 border-main-red p-6 md:p-8 rounded-r-xl shadow-sm my-10">
                <h3 className="text-xl md:text-2xl font-extrabold text-main-blue mb-4">
                  Certificación en Litigio Estratégico Internacional
                </h3>
                <p className="mb-4">
                  Por medio de la Certificación en litigio estratégico internacional, <strong className="text-main-blue">más de mil cuatrocientas personas</strong> cuentan ahora con la herramienta para litigar ante la Corte Interamericana y los Comités de la ONU, así como para acudir a los procedimientos especiales de Naciones Unidas, tales como las Relatorías Especiales y los Grupos de Trabajo.
                </p>
                <p>
                  Con el fin de disminuir la brecha entre los distintos sistemas de protección, en el IIRESODH impartimos también una <strong className="text-main-red">Certificación de Litigio que se lleva a cabo en Europa</strong>, que profundiza en los mandatos de la Corte Internacional de Justicia, la Corte Penal Internacional, el Tribunal Europeo de Derechos Humanos y la Oficina del Alto Comisionado de las Naciones Unidas para los Derechos Humanos.
                </p>
              </div>

              {/* Grid para separar el impacto global de la acción local */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center border-t border-gray-100 pt-10 mt-10">
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-main-blue mb-4">
                    Nuestro Impacto Global
                  </h3>
                  <p>
                    El trabajo del IIRESODH en el litigio estratégico ha tenido un impacto positivo en México, Panamá, Costa Rica, El Salvador, Colombia, Guatemala, Argentina y Nicaragua, así como en algunos países de África y Europa.
                  </p>
                </div>
                
                <div className="bg-pale-blue/20 p-8 rounded-2xl border border-pale-blue">
                  <h4 className="font-extrabold text-main-blue mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6 text-main-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                    </svg>
                    Acción a Nivel Nacional
                  </h4>
                  <p className="text-sm md:text-base">
                    Además, en <strong>México, Costa Rica y El Salvador</strong> realizamos litigios y asesorías en materia constitucional y afines.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>
      </div>
    </div>
  );
}