// src/pages/Privacidad.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Privacidad() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("general");

  // Leer el parámetro de la URL para abrir la pestaña correcta y hacer scroll
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    
    if (tab === "general" || tab === "mexico" || tab === "terminos") {
      setActiveTab(tab);
    }
    
    window.scrollTo(0, 0);
  }, [location]);

  // Constante para estandarizar la clase tipográfica institucional de los textos legales
  const legalTextClass = "space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify animate-fade-in-up";

  return (
    <div className="bg-white flex flex-col min-h-screen">
      {/* Encabezado de la página */}
      <div className="bg-white text-main-blue py-12 px-6 text-center relative z-20 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 uppercase">
          Privacidad y Términos
        </h1>
        <p className="text-base md:text-lg text-light-blue max-w-3xl mx-auto font-medium">
          Transparencia y protección de datos para todos nuestros usuarios.
        </p>
        <div className="w-20 h-1 bg-main-red mx-auto mt-6 rounded-full"></div>
      </div>

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark"></div>

        <section className="relative py-12 md:py-16 px-0 md:px-8 z-10">
          <div className="max-w-6xl mx-auto">
            
            {/* Pestañas de Navegación alineadas al contenedor */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-8 px-6 md:px-0">
              <button
                onClick={() => setActiveTab("general")}
                className={`py-3 px-8 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-md cursor-pointer ${
                  activeTab === "general"
                    ? "bg-main-blue text-white"
                    : "bg-white text-main-blue border border-gray-200 hover:bg-pale-blue hover:text-main-blue"
                }`}
              >
                Política General
              </button>
              <button
                onClick={() => setActiveTab("mexico")}
                className={`py-3 px-8 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-md cursor-pointer ${
                  activeTab === "mexico"
                    ? "bg-main-red text-white"
                    : "bg-white text-main-red border border-gray-200 hover:bg-red-50 hover:border-main-red"
                }`}
              >
                Aviso para México
              </button>
              <button
                onClick={() => setActiveTab("terminos")}
                className={`py-3 px-8 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-md cursor-pointer ${
                  activeTab === "terminos"
                    ? "bg-main-blue text-white"
                    : "bg-white text-main-blue border border-gray-200 hover:bg-pale-blue hover:text-main-blue"
                }`}
              >
                Términos de Uso
              </button>
            </div>

            {/* Contenedor Legal */}
            <div className="bg-white md:rounded-3xl shadow-2xl border-y md:border border-gray-100 p-8 md:p-12 lg:p-16">
              
              {/* =========================================
                  CONTENIDO: POLÍTICA GENERAL
              ========================================= */}
              {activeTab === "general" && (
                <div className={legalTextClass}>
                  <div className="border-b border-gray-100 pb-6 mb-8 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-main-blue mb-2">Política de Privacidad de IIRESODH</h2>
                    <p className="text-xs md:text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 14 de marzo de 2026</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">1. Introducción y Alcance</h3>
                    <p className="mb-3">Bienvenido a la Política de Privacidad del Instituto Internacional de Responsabilidad Social y Derechos Humanos (en adelante, “IIRESODH”, “nosotros” o “nuestro”).</p>
                    <p className="mb-3">Esta política describe cómo recopilamos, utilizamos, protegemos y compartimos su información personal cuando visita nuestro sitio web institucional (<a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">https://iiresodh.org</a>) y se comunica con nosotros.</p>
                    <div className="bg-pale-blue/30 p-4 rounded-xl border border-pale-blue mt-6">
                      <p className="text-sm font-medium text-main-blue">
                        <strong>Nota sobre servicios externos:</strong> El servicio tecnológico asociado PIDA-AI (<a href="https://pida-ai.com" target="_blank" rel="noopener noreferrer" className="text-light-blue hover:text-main-blue transition-colors">https://pida-ai.com</a>) es gestionado por una entidad jurídica independiente y se rige estrictamente por su propia Política de Privacidad, disponible en su respectivo sitio web.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">2. Responsable del Tratamiento de sus Datos</h3>
                    <p>El responsable del tratamiento de sus datos personales es el <strong>Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</strong>, organización con domicilio en Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">3. ¿Qué Información Recopilamos?</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Información proporcionada directamente:</strong> Recopilamos datos personales cuando nos contacta, se inscribe en nuestras actividades o realiza una donación. Esto incluye su nombre, dirección de correo electrónico, país de residencia y el contenido de sus mensajes.</li>
                      <li><strong>Información recopilada automáticamente:</strong> Al navegar por nuestro sitio, recopilamos información técnica estándar (dirección IP, tipo de navegador, páginas visitadas) con fines de análisis y seguridad para mejorar nuestros servicios institucionales.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">4. ¿Para Qué Utilizamos su Información? (Fines y Base Legal)</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Atención y Comunicación:</strong> Responder a sus consultas, solicitudes de información y gestionar inscripciones a nuestros programas. (Base legal: Consentimiento).</li>
                      <li><strong>Difusión Institucional:</strong> Envío de boletines informativos o noticias sobre nuestras labores en defensa de los derechos humanos, siempre que usted haya aceptado recibirlos. (Base legal: Consentimiento).</li>
                      <li><strong>Mantenimiento y Seguridad:</strong> Analizar el tráfico de nuestro sitio para optimizar la experiencia de usuario y prevenir fraudes informáticos. (Base legal: Interés legítimo).</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">5. ¿Con Quién Compartimos su Información?</h3>
                    <p className="mb-3">IIRESODH no vende, alquila ni comercializa su información personal bajo ninguna circunstancia. Solo la compartimos en casos estrictamente necesarios:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Proveedores Tecnológicos:</strong> Empresas que nos brindan servicios de alojamiento web (hosting) o plataformas para el envío de boletines, quienes operan bajo estrictos acuerdos de confidencialidad.</li>
                      <li><strong>Obligación Legal:</strong> Cuando una autoridad competente lo requiera en el marco de la ley y el debido proceso jurisdiccional.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">6. Seguridad de su Información</h3>
                    <p>IIRESODH aplica medidas de seguridad técnicas y organizativas para proteger su información contra accesos no autorizados, pérdida o alteración. Nuestro sitio utiliza certificados SSL para cifrar la información durante la transmisión, protegiendo así su privacidad.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">7. Retención de Datos</h3>
                    <p>Conservaremos sus datos personales únicamente durante el tiempo que sea necesario para cumplir con las finalidades descritas en esta política o para dar cumplimiento a obligaciones legales o fiscales vigentes aplicables a la institución.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">8. Sus Derechos</h3>
                    <p className="mb-3">Como usuario, usted tiene derecho a Acceder a sus datos, Rectificarlos si son incorrectos, solicitar su Supresión, u Oponerse a ciertos tratamientos (como darse de baja de nuestros boletines). Para ejercer sus derechos, por favor escríbanos a:</p>
                    <p className="font-bold text-main-blue pl-6"><a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">9. Modificaciones</h3>
                    <p>IIRESODH se reserva el derecho de actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas institucionales o en la normativa aplicable. La fecha de la última revisión se publicará siempre en la parte superior de esta página.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">10. Contacto</h3>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm mt-4 text-left not-italic font-normal text-sm md:text-base">
                      <p className="font-bold text-main-blue mb-1">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</p>
                      <p className="mb-1"><strong>Correo electrónico:</strong> <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
                      <p><strong>Dirección Sede Central:</strong> Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================
                  CONTENIDO: AVISO PARA MÉXICO
              ========================================= */}
              {activeTab === "mexico" && (
                <div className={legalTextClass}>
                  <div className="border-b border-gray-100 pb-6 mb-8 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-main-blue mb-2">Aviso de Privacidad (MÉXICO)</h2>
                    <p className="text-xs md:text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 14 de marzo de 2026</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">1. Introducción y Marco Legal</h3>
                    <p className="mb-3">En estricto cumplimiento a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) aplicable en los Estados Unidos Mexicanos, se emite el presente Aviso de Privacidad para informar a los usuarios (en adelante, el “Titular”) sobre el tratamiento de sus datos en el sitio web institucional: <a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">https://iiresodh.org</a>.</p>
                    <div className="bg-pale-blue/30 p-4 rounded-xl border border-pale-blue mt-6">
                      <p className="text-sm font-medium text-main-blue">
                        <strong>Importante:</strong> Este Aviso no cubre el servicio tecnológico PIDA-AI, el cual cuenta con su propio Responsable jurídico y Aviso de Privacidad independiente en <a href="https://pida-ai.com" target="_blank" rel="noopener noreferrer" className="text-light-blue hover:text-main-blue transition-colors">https://pida-ai.com</a>.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">2. Identidad y Domicilio del Responsable</h3>
                    <p>El <strong>Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)</strong>, con domicilio en Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica, es el Responsable de recabar sus datos personales, del uso que se le dé a los mismos y de su protección.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">3. Datos Personales que Tratamos</h3>
                    <p className="mb-3">Para las finalidades señaladas en el presente aviso, podemos recabar los siguientes datos personales:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Datos de Identificación y Contacto:</strong> Nombre completo, correo electrónico, institución a la que pertenece y país.</li>
                      <li><strong>Datos de Navegación:</strong> Dirección IP, cookies y datos analíticos de uso del portal web.</li>
                    </ul>
                    <p className="mt-4 text-main-red font-bold">Datos Personales Sensibles:</p>
                    <p>El IIRESODH <strong>no recaba ni trata</strong> datos personales sensibles para la operación de este portal. Le rogamos abstenerse de enviar información clasificada como sensible a través de nuestros formularios de contacto general.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">4. Finalidades del Tratamiento</h3>
                    <p className="font-bold mb-2 text-main-blue">Finalidades Primarias (necesarias para la relación jurídica):</p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                      <li>Proveer la información solicitada respecto a nuestras actividades y defensa de derechos humanos.</li>
                      <li>Contactar al Titular en respuesta a sus mensajes, dudas o comentarios.</li>
                      <li>Gestionar la inscripción a eventos, foros o programas académicos dictados por el IIRESODH.</li>
                    </ul>

                    <p className="font-bold mb-2 text-main-blue">Finalidades Secundarias:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Envío de boletines informativos institucionales.</li>
                      <li>Análisis estadístico del uso del sitio web para mejora continua.</li>
                    </ul>
                    <p className="mt-4">En caso de que no desee que sus datos personales sean tratados para las Finalidades Secundarias, usted puede manifestar su negativa enviando un correo a <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue font-bold transition-colors">contacto@iiresodh.org</a>.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">5. Transferencias y/o Remisiones de Datos Personales</h3>
                    <p className="mb-3">Le informamos que sus datos personales no son compartidos, vendidos ni transferidos a terceros (otros responsables) dentro ni fuera del país, salvo en aquellos casos en que la Ley lo exija expresamente (artículo 37 de la LFPDPPP).</p>
                    <p>El IIRESODH podrá realizar remisiones de datos a proveedores de servicios (ej. servidores web, gestores de correo) que fungen como Encargados y asumen las mismas obligaciones de confidencialidad y seguridad establecidas en este Aviso.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">6. Derechos ARCO y Revocación del Consentimiento</h3>
                    <p className="mb-3">Usted tiene derecho a conocer qué datos personales tenemos de usted (<strong>A</strong>cceso); solicitar la corrección de su información en caso de ser inexacta (<strong>R</strong>ectificación); que la eliminemos de nuestros registros (<strong>C</strong>ancelación); así como <strong>O</strong>ponerse al uso de sus datos para fines específicos.</p>
                    <p className="mb-3">Para ejercer cualquiera de los derechos ARCO, o revocar su consentimiento, deberá presentar la solicitud respectiva a través de un correo electrónico dirigido a <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue font-bold transition-colors">contacto@iiresodh.org</a>, incluyendo:</p>
                    <ol className="list-decimal pl-6 mt-3 space-y-2 font-medium">
                      <li>Su nombre y correo electrónico para recibir respuesta.</li>
                      <li>Documento oficial que acredite su identidad.</li>
                      <li>La descripción clara y precisa de los datos respecto de los cuales busca ejercer el derecho.</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">7. Uso de Cookies</h3>
                    <p>Nuestro sitio web utiliza tecnologías como cookies para mejorar su experiencia, analizar el tráfico y adaptar el contenido. Usted puede configurar su navegador web para rechazar todas las cookies o para que le avise cuando se envíe una cookie.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">8. Modificaciones al Aviso de Privacidad</h3>
                    <p>El IIRESODH se reserva el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente aviso de privacidad. Cualquier cambio estará disponible y visible al público en esta misma página web institucional.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">9. Contacto</h3>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm mt-4 text-left not-italic font-normal text-sm md:text-base">
                      <p className="font-bold text-main-blue mb-1">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</p>
                      <p className="mb-1"><strong>Correo electrónico:</strong> <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
                      <p><strong>Domicilio:</strong> Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================
                  CONTENIDO: TÉRMINOS Y CONDICIONES
              ========================================= */}
              {activeTab === "terminos" && (
                <div className={legalTextClass}>
                  <div className="border-b border-gray-100 pb-6 mb-8 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-main-blue mb-2">Términos y Condiciones del Sitio Web</h2>
                    <p className="text-xs md:text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 14 de marzo de 2026</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">1. Introducción</h3>
                    <p>Estos Términos y Condiciones (en adelante, los “Términos”) se aplican al uso de este sitio web, accesible en <a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors font-bold">https://iiresodh.org</a> (en adelante, el “Sitio Web”), y a las transacciones relacionadas con nuestros productos y servicios. Su relación con nosotros podría estar regida también por contratos adicionales. En caso de conflicto entre las disposiciones de estos Términos y las de cualquier contrato adicional, prevalecerán las disposiciones de dichos contratos adicionales.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">2. Aceptación de los Términos</h3>
                    <p>Al registrarse, acceder o utilizar de cualquier forma este Sitio Web, usted acepta quedar vinculado por los Términos que se exponen a continuación. El mero uso del Sitio Web implica el conocimiento y la aceptación de estos Términos. En casos específicos, podremos solicitarle su aceptación explícita.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">3. Comunicación Electrónica</h3>
                    <p>Al utilizar este Sitio Web o comunicarse con nosotros por medios electrónicos, usted acepta y reconoce que podemos comunicarnos con usted de forma electrónica a través de nuestro Sitio Web o mediante el envío de correos electrónicos. Asimismo, usted acepta que todos los acuerdos, avisos, divulgaciones y otras comunicaciones que le proporcionemos por medios electrónicos satisfacen cualquier requisito legal que exija que dichas comunicaciones sean por escrito.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">4. Propiedad Intelectual</h3>
                    <p className="mb-3">Nosotros o nuestros licenciantes poseemos y controlamos todos los derechos de autor y otros derechos de propiedad intelectual sobre el Sitio Web, así como los datos, la información, el contenido y otros recursos mostrados o accesibles en él.</p>
                    
                    <h4 className="text-base md:text-lg font-bold text-main-blue mt-5 mb-2">4.1. Licencia Creative Commons</h4>
                    <p className="mb-3">Salvo que se especifique lo contrario, el contenido original y las obras de creación de este Sitio Web se encuentran bajo una licencia <strong>Creative Commons Atribución-NoComercial-SinDerivadas 4.0 Internacional (CC BY-NC-ND 4.0)</strong>. Esto significa que usted es libre de compartir (copiar y redistribuir el material en cualquier medio o formato) bajo los siguientes términos:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Atribución:</strong> Debe dar el crédito apropiado, proporcionar un enlace a la licencia e indicar si se han realizado cambios.</li>
                      <li><strong>NoComercial:</strong> No puede utilizar el material para una finalidad comercial.</li>
                      <li><strong>SinDerivadas:</strong> Si remezcla, transforma o crea a partir del material, no puede difundir el material modificado.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">5. Enlaces a Sitios Web de Terceros</h3>
                    <p className="mb-3">Nuestro Sitio Web puede incluir hipervínculos u otras referencias a sitios web de terceros. No supervisamos ni revisamos el contenido de los sitios web de terceros enlazados desde este Sitio Web. Los productos o servicios ofrecidos por otros sitios web estarán sujetos a los Términos y Condiciones aplicables de dichos terceros. Las opiniones expresadas o el material que aparece en esos sitios no son necesariamente compartidos o respaldados por nosotros.</p>
                    <p>No seremos responsables de las prácticas de privacidad ni del contenido de dichos sitios. Usted asume todos los riesgos asociados al uso de estos sitios web y de cualquier servicio de terceros relacionado. No aceptaremos responsabilidad alguna por cualquier pérdida o daño, independientemente de cómo se produzca, que resulte de la divulgación de su información personal a terceros.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">6. Uso Responsable</h3>
                    <p className="mb-3">Al visitar nuestro Sitio Web, usted se compromete a utilizarlo únicamente para los fines previstos y conforme a lo permitido por estos Términos, los contratos adicionales que tenga con nosotros, las leyes y regulaciones aplicables, así como las practices en línea generalmente aceptadas y las directrices del sector.</p>
                    <p className="font-bold text-main-red mb-2">Queda estrictamente prohibido:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Usar nuestro Sitio Web o servicios para utilizar, publicar o distribuir cualquier material que contenga o esté vinculado a software malicioso (malware).</li>
                      <li>Utilizar los datos recogidos en nuestro Sitio Web para cualquier actividad de marketing directo.</li>
                      <li>Realizar cualquier actividad de recopilación de datos, ya sea sistemática o automatizada, en nuestro Sitio Web o en relación con él.</li>
                      <li>Realizar cualquier actividad que cause o pueda causar daños al Sitio Web, o que interfiera en su rendimiento, disponibilidad o accesibilidad.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">7. Registro de Cuenta</h3>
                    <p className="mb-3">Puede registrarse para obtener una cuenta en nuestro Sitio Web. Durante este proceso, se le podría pedir que elija una contraseña. Usted es el único responsable de mantener la confidencialidad de su contraseña y de la información de su cuenta. Se compromete a no compartir sus credenciales (contraseña, información de cuenta o acceso seguro) con ninguna otra persona.</p>
                    <p className="mb-3">No debe permitir que terceros utilicen su cuenta para acceder al Sitio Web, ya que usted es responsable de todas las actividades que se realicen a través de sus contraseñas o cuentas. Debe notificarnos inmediatamente si tiene conocimiento de cualquier divulgación o uso no autorizado de su contraseña.</p>
                    <p>Tras la cancelación de su cuenta, no intentará registrar una nueva sin nuestro permiso explícito.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">8. Contenido Publicado por Usted</h3>
                    <p>Podemos ofrecer herramientas de comunicación abierta en nuestro Sitio Web, como comentarios en blogs, foros, reseñas y servicios de redes sociales. Aunque no nos sea posible supervisar todo el contenido que usted u otros compartan, nos reservamos el derecho de revisar dicho contenido, supervisar el uso del Sitio Web y eliminar o rechazar cualquier contenido a nuestra entera discreción. Al publicar información o utilizar estas herramientas, usted garantiza que su contenido cumplirá con estos Términos, no será ilícito ni infringirá los derechos legales de ninguna persona.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">9. Envío de Ideas No Solicitadas</h3>
                    <p>No nos envíe ideas, invenciones, obras de autor u otra información que pueda considerarse de su propiedad intelectual, a menos que hayamos firmado previamente un acuerdo sobre propiedad intelectual o un acuerdo de no divulgación. Si nos divulga contenido en ausencia de dicho acuerdo, nos otorga una licencia mundial, irrevocable, no exclusiva y libre de regalías para usar, reproducir, almacenar, adaptar, publicar, traducir y distribuir su contenido en cualquier medio existente o futuro.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">10. Terminación de Uso</h3>
                    <p>Nos reservamos el derecho de modificar o interrumpir, a nuestra entera discreción y en cualquier momento, el acceso temporal o permanente al Sitio Web o a cualquiera de sus servicios. Usted acepta que no seremos responsables ante usted ni ante ningún tercero por dicha modificación, suspensión o interrupción de su acceso. No tendrá derecho a compensación alguna si se pierden permanentemente funciones, configuraciones o cualquier Contenido con el que usted haya contribuido. No debe eludir, evitar o intentar eludir ninguna medida de restricción de acceso en nuestro Sitio Web.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">11. Garantías y Responsabilidad</h3>
                    <p className="mb-3">Este Sitio Web y todo su contenido se proporcionan “tal cual” y “según disponibilidad” y pueden contener imprecisiones o errores tipográficos. Renunciamos expresamente a toda garantía, ya sea expresa o implícita, en cuanto a la disponibilidad, exactitud o integridad del Contenido.</p>
                    <p className="font-bold text-main-blue mb-2">No garantizamos que:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                      <li>Este Sitio Web, o nuestros productos y servicios, satisfagan sus requisitos específicos.</li>
                      <li>El acceso al Sitio Web sea ininterrumpido, oportuno, seguro o libre de errores.</li>
                      <li>La calidad de cualquier producto o servicio adquirido a través de este Sitio Web cumpla con sus expectativas.</li>
                    </ul>
                    <p className="mb-3">Las disposiciones de esta sección se aplicarán en la máxima medida permitida por la ley aplicable. En ningún caso seremos responsables de daños directos o indirectos (incluida la pérdida de beneficios, pérdida o corrupción de datos, software o bases de datos, o daños a la propiedad) sufridos por usted o por un tercero como resultado de su acceso o uso de nuestro Sitio Web.</p>
                    <p>Salvo que un contrato adicional establezca lo contrario, nuestra máxima responsabilidad ante usted por todos los daños que surjan o estén relacionados con el Sitio Web, o con cualquier producto o servicio comercializado a través de él, se limitará al precio total que usted nos pagó para adquirir dichos productos o servicios, o para utilizar el Sitio Web. Este límite se aplicará de forma agregada a todas sus reclamaciones y acciones legales de cualquier naturaleza.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">12. Privacidad</h3>
                    <p className="mb-3">Para acceder a nuestro Sitio Web o servicios, es posible que se le solicite información personal durante el proceso de registro. Usted se compromete a que toda la información proporcionada sea siempre precisa, correcta y actualizada.</p>
                    <p>Nos tomamos muy en serio la protección de sus datos personales. Nuestra Política de Privacidad, que puede consultar en la <strong>pestaña de Política General</strong> de esta misma página, detalla cómo recopilamos, usamos y protegemos sus datos. No utilizaremos su dirección de correo electrónico para comunicaciones no solicitadas (spam).</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">13. Cumplimiento Legal y Restricciones Geográficas</h3>
                    <p>Se prohíbe el acceso al Sitio Web desde territorios o países donde el contenido o la purchase de productos o servicios vendidos en el Sitio Web sea ilegal. Usted no puede utilizar este Sitio Web en violación de las leyes y regulaciones de exportación de Costa Rica.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">14. Cesión</h3>
                    <p>Usted no puede ceder, transferir o subcontratar ninguno de sus derechos u obligaciones bajo estos Términos, en su totalidad o en parte, a ningún tercero sin nuestro consentimiento previo por escrito. Cualquier intento de cesión que infrinja esta cláusula será nulo y sin efecto.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">15. Incumplimiento de estos Términos</h3>
                    <p>Sin perjuicio de nuestros otros derechos, si usted incumple estos Términos de cualquier manera, podremos tomar las medidas que consideremos apropiadas para hacer frente a dicho incumplimiento. Estas medidas pueden incluir la suspensión temporal o permanente de su acceso al Sitio Web, el contacto con su proveedor de servicios de Internet para que bloquee su acceso y/o el inicio de acciones legales en su contra.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">16. Fuerza Mayor</h3>
                    <p>Exceptuando las obligaciones de pago, ningún retraso, fallo u omisión por parte de cualquiera de las partes en el cumplimiento de sus obligaciones se considerará un incumplimiento de estos Términos si dicho retraso, fallo u omisión se debe a una causa que escapa a su control razonable (fuerza mayor).</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">17. Indemnización</h3>
                    <p>Usted se compromete a indemnizarnos, defendernos y eximirnos de toda responsabilidad ante cualquier reclamación, daño, pérdida y gasto relacionado con la violación por su parte de estos Términos y de las leyes aplicables, incluidos los derechos de propiedad intelectual y de privacidad. Usted nos reembolsará sin demora los daños, pérdidas, costos y gastos derivados de dichas reclamaciones.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">18. Renuncia</h3>
                    <p>El hecho de no hacer cumplir alguna de las disposiciones de estos Términos o de no ejercer una opción de terminación no se interpretará como una renuncia a dichas disposiciones y no afectará su validez ni el derecho a hacerlas cumplir en el futuro.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">19. Idioma</h3>
                    <p>Estos Términos se interpretarán y regirán exclusivamente en español. Todas las notificaciones y correspondencia se redactarán únicamente en este idioma.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">20. Acuerdo Completo</h3>
                    <p>Estos Términos, junto con nuestra Política de Privacidad, constituyen el acuerdo completo entre usted y el IIRESODH en relación con el uso de este Sitio Web.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">21. Actualización de estos Términos</h3>
                    <p>Podemos actualizar estos Términos periódicamente. Es su obligación revisarlos para verificar si existen cambios. La fecha indicada al principio de este documento corresponde a la última revisión. Los cambios entrarán en vigor en el momento de su publicación en el Sitio Web. Su uso continuado del Sitio Web tras la publicación de los cambios se considerará una aceptación de los nuevos Términos.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">22. Ley Aplicable y Jurisdicción</h3>
                    <p>Estos Términos se regirán por las leyes de Costa Rica. Cualquier disputa relacionada con estos Términos estará sujeta a la jurisdicción exclusiva de los tribunales de Costa Rica. Si un tribunal u otra autoridad competente determina que alguna parte de estos Términos es inválida o inaplicable, dicha parte será modificada o eliminada en la medida necesaria para preservar la intención original de los Términos, sin afectar la validez de las disposiciones restantes.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">23. Información de Contacto</h3>
                    <p className="mb-4">Este Sitio Web es propiedad y está gestionado por el IIRESODH. Puede contactarnos en relación con estos Términos y Condiciones escribiéndonos a la siguiente dirección de correo electrónico o postal:</p>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm mt-4 text-left not-italic font-normal text-sm md:text-base">
                      <p className="font-bold text-main-blue mb-1">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</p>
                      <p className="mb-1"><strong>Correo electrónico:</strong> <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
                      <p><strong>Dirección postal:</strong> Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}