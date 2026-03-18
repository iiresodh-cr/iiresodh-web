// src/pages/LitigioEstrategico.jsx
import { useEffect } from "react";
// Importamos la imagen para la cabecera
import cabeceraImg from "../assets/Litigio_Estrategico.png";

export default function LitigioEstrategico() {
  // Hacer scroll al tope de la página al cargar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white flex flex-col min-h-screen">
      
      <div className="relative overflow-hidden grow pb-20">
        {/* Marca de agua institucional */}
        <div className="bg-watermark"></div>

        <section className="relative pt-8 md:pt-12 px-0 md:px-8 z-10">
          {/* Contenedor estandarizado a max-w-7xl (1280px) con DISEÑO PLANO (Sin sombras ni bordes) */}
          <div className="max-w-7xl mx-auto bg-white overflow-hidden">
            
            {/* IMAGEN DE CABECERA CON EL CORTE CURVO SUPERIOR IZQUIERDO */}
            <div className="w-full bg-white">
              <img 
                src={cabeceraImg} 
                alt="Banner Litigio Estratégico" 
                // MODIFICACIÓN AQUÍ: rounded-tl con valores dinámicos para curvar esa esquina progresivamente
                className="w-full h-48 md:h-80 lg:h-96 object-cover object-center rounded-tl-[80px] md:rounded-tl-[120px] lg:rounded-tl-[160px]"
              />
            </div>

            {/* ENCABEZADO (Sin título redundante, padding superior ajustado, sin borde gris) */}
            <div className="bg-white text-main-blue pt-10 pb-10 md:pt-8 md:pb-12 px-6 text-center">
              <p className="text-base md:text-lg text-light-blue max-w-3xl mx-auto font-medium">
                Defensa activa y capacitación en los sistemas universales y regionales de protección.
              </p>
              <div className="w-20 h-1 bg-main-red mx-auto mt-6 rounded-full"></div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="px-8 md:px-12 lg:px-16 pb-12 md:pb-16 animate-fade-in-up">
              
              {/* Párrafos centrados para lectura cómoda */}
              <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-12">
                <p>
                  <strong className="font-extrabold text-main-blue">IIRESODH</strong> fomenta activamente el litigio estratégico internacional en materia de derechos humanos. Capacitamos a ONGs, defensores de derechos humanos y otras organizaciones de la sociedad civil, con el fin de que hagan uso de los mecanismos judiciales y cuasi-judiciales que ofrecen los sistemas universales y regionales de protección. 
                </p>
                <p>
                  Las capacitaciones son impartidas por expertos de gran prestigio, así como por personas que trabajan en los principales organismos y tribunales internacionales. También litigamos casos de situaciones generalizadas de violaciones de derechos humanos en distintos países.
                </p>
              </div>

              {/* Caja destacada para las Certificaciones (Aprovecha el ancho, diseño plano con acento rojo) */}
              <div className="bg-gray-50 border-l-4 border-main-red p-8 md:p-10 rounded-r-xl mb-12">
                <h3 className="text-xl md:text-2xl font-extrabold text-main-blue mb-4">
                  Certificación en Litigio Estratégico Internacional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify">
                  <p>
                    Por medio de la Certificación en litigio estratégico internacional, <strong className="text-main-blue">más de mil cuatrocientas personas</strong> cuentan ahora con la herramienta para litigar ante la Corte Interamericana y los Comités de la ONU, así como para acudir a los procedimientos especiales de Naciones Unidas, tales como las Relatorías Especiales y los Grupos de Trabajo.
                  </p>
                  <p>
                    Con el fin de disminuir la brecha entre los distintos sistemas de protección, en el IIRESODH impartimos también una <strong className="text-main-red">Certificación de Litigio que se lleva a cabo en Europa</strong>, que profundiza en los mandatos de la Corte Internacional de Justicia, la Corte Penal Internacional, el Tribunal Europeo de Derechos Humanos y la Oficina del Alto Comisionado de las Naciones Unidas para los Derechos Humanos.
                  </p>
                </div>
              </div>

              {/* Grid de Impacto Global (Aprovecha todo el ancho, sin bordes divisorios) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center pt-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-main-blue mb-6">
                    Nuestro Impacto Global
                  </h3>
                  <p className="text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify">
                    El trabajo del IIRESODH en el litigio estratégico ha tenido un impacto positivo en México, Panamá, Costa Rica, El Salvador, Colombia, Guatemala, Argentina y Nicaragua, así como en algunos países de África y Europa.
                  </p>
                </div>
                
                {/* Caja plana azul sin bordes */}
                <div className="bg-pale-blue/10 p-8 md:p-10 rounded-2xl h-full flex flex-col justify-center">
                  <h4 className="text-xl font-extrabold text-main-blue mb-4 flex items-center gap-3">
                    <svg className="w-8 h-8 text-main-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                    </svg>
                    Acción a Nivel Nacional
                  </h4>
                  <p className="text-base md:text-lg font-light text-gray-700 leading-relaxed">
                    Además, en <strong className="text-main-blue font-bold">México, Costa Rica y El Salvador</strong> realizamos litigios y asesorías en materia constitucional y afines.
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