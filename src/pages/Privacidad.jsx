// src/pages/Privacidad.jsx
import { useState, useEffect } from "react";

export default function Privacidad() {
  const [activeTab, setActiveTab] = useState("general");

  // Hacer scroll al tope de la página al cargar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white flex flex-col min-h-screen">
      {/* Encabezado de la página */}
      <div className="bg-white text-main-blue py-12 px-6 text-center relative z-20 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 uppercase">
          Privacidad y Términos
        </h1>
        <p className="text-lg text-light-blue max-w-3xl mx-auto font-medium">
          Transparencia y protección de datos para todos nuestros usuarios.
        </p>
        <div className="w-20 h-1 bg-main-red mx-auto mt-6 rounded-full"></div>
      </div>

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark"></div>

        <section className="relative py-12 md:py-16 px-0 md:px-8 z-10">
          <div className="max-w-6xl mx-auto">
            
            {/* Pestañas de Navegación alineadas al contenedor */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 px-6 md:px-0">
              <button
                onClick={() => setActiveTab("general")}
                className={`py-3 px-10 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-md ${
                  activeTab === "general"
                    ? "bg-main-blue text-white"
                    : "bg-white text-main-blue border border-gray-200 hover:bg-pale-blue hover:text-main-blue"
                }`}
              >
                Política General
              </button>
              <button
                onClick={() => setActiveTab("mexico")}
                className={`py-3 px-10 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-md ${
                  activeTab === "mexico"
                    ? "bg-main-red text-white"
                    : "bg-white text-main-red border border-gray-200 hover:bg-red-50 hover:border-main-red"
                }`}
              >
                Aviso para México
              </button>
            </div>

            {/* Contenedor de la Política */}
            <div className="bg-white md:rounded-3xl shadow-2xl border-y md:border border-gray-100 p-8 md:p-12 lg:p-16">
              
              {/* CONTENIDO: POLÍTICA GENERAL */}
              {activeTab === "general" && (
                <div className="space-y-10 text-lg text-gray-700 leading-loose animate-fade-in-up">
                  <div className="border-b border-gray-100 pb-8 mb-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-main-blue mb-4">Política de Privacidad de IIRESODH</h2>
                    <p className="text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 14 de marzo de 2026</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">1. Introducción y Alcance</h3>
                    <p className="mb-4">Bienvenido a la Política de Privacidad del Instituto Internacional de Responsabilidad Social y Derechos Humanos (en adelante, “IIRESODH”, “nosotros” o “nuestro”).</p>
                    <p className="mb-4">Esta política describe cómo recopilamos, utilizamos, protegemos y compartimos su información personal cuando visita nuestro sitio web institucional (<a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">https://iiresodh.org</a>) y se comunica con nosotros.</p>
                    <div className="bg-pale-blue/30 p-4 rounded-xl border border-pale-blue mt-6">
                      <p className="text-sm font-medium text-main-blue">
                        <strong>Nota sobre servicios externos:</strong> El servicio tecnológico asociado PIDA-AI (<a href="https://pida-ai.com" target="_blank" rel="noopener noreferrer" className="text-light-blue hover:text-main-blue transition-colors">https://pida-ai.com</a>) es gestionado por una entidad jurídica independiente y se rige estrictamente por su propia Política de Privacidad, disponible en su respectivo sitio web.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">2. Responsable del Tratamiento de sus Datos</h3>
                    <p>El responsable del tratamiento de sus datos personales es el <strong>Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</strong>, organización con domicilio en Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">3. ¿Qué Información Recopilamos?</h3>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Información proporcionada directamente:</strong> Recopilamos datos personales cuando nos contacta, se inscribe en nuestras actividades o realiza una donación. Esto incluye su nombre, dirección de correo electrónico, país de residencia y el contenido de sus mensajes.</li>
                      <li><strong>Información recopilada automáticamente:</strong> Al navegar por nuestro sitio, recopilamos información técnica estándar (dirección IP, tipo de navegador, páginas visitadas) con fines de análisis y seguridad para mejorar nuestros servicios institucionales.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">4. ¿Para Qué Utilizamos su Información? (Fines y Base Legal)</h3>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Atención y Comunicación:</strong> Responder a sus consultas, solicitudes de información y gestionar inscripciones a nuestros programas. (Base legal: Consentimiento).</li>
                      <li><strong>Difusión Institucional:</strong> Envío de boletines informativos o noticias sobre nuestras labores en defensa de los derechos humanos, siempre que usted haya aceptado recibirlos. (Base legal: Consentimiento).</li>
                      <li><strong>Mantenimiento y Seguridad:</strong> Analizar el tráfico de nuestro sitio para optimizar la experiencia de usuario y prevenir fraudes informáticos. (Base legal: Interés legítimo).</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">5. ¿Con Quién Compartimos su Información?</h3>
                    <p className="mb-4">IIRESODH no vende, alquila ni comercializa su información personal bajo ninguna circunstancia. Solo la compartimos en casos estrictamente necesarios:</p>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Proveedores Tecnológicos:</strong> Empresas que nos brindan servicios de alojamiento web (hosting) o plataformas para el envío de boletines, quienes operan bajo estrictos acuerdos de confidencialidad.</li>
                      <li><strong>Obligación Legal:</strong> Cuando una autoridad competente lo requiera en el marco de la ley y el debido proceso jurisdiccional.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">6. Seguridad de su Información</h3>
                    <p>IIRESODH aplica medidas de seguridad técnicas y organizativas para proteger su información contra accesos no autorizados, pérdida o alteración. Nuestro sitio utiliza certificados SSL para cifrar la información durante la transmisión, protegiendo así su privacidad.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">7. Retención de Datos</h3>
                    <p>Conservaremos sus datos personales únicamente durante el tiempo que sea necesario para cumplir con las finalidades descritas en esta política o para dar cumplimiento a obligaciones legales o fiscales vigentes aplicables a la institución.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">8. Sus Derechos</h3>
                    <p className="mb-4">Como usuario, usted tiene derecho a Acceder a sus datos, Rectificarlos si son incorrectos, solicitar su Supresión, u Oponerse a ciertos tratamientos (como darse de baja de nuestros boletines). Para ejercer sus derechos, por favor escríbanos a:</p>
                    <p className="font-bold text-main-blue pl-8"><a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">9. Modificaciones</h3>
                    <p>IIRESODH se reserva el derecho de actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas institucionales o en la normativa aplicable. La fecha de la última revisión se publicará siempre en la parte superior de esta página.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">10. Contacto</h3>
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm mt-4">
                      <p className="font-bold text-main-blue mb-2">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</p>
                      <p className="mb-2"><strong>Correo electrónico:</strong> <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
                      <p><strong>Dirección Sede Central:</strong> Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO: AVISO PARA MÉXICO */}
              {activeTab === "mexico" && (
                <div className="space-y-10 text-lg text-gray-700 leading-loose animate-fade-in-up">
                  <div className="border-b border-gray-100 pb-8 mb-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-main-blue mb-4">Aviso de Privacidad (MÉXICO)</h2>
                    <p className="text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 14 de marzo de 2026</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">1. Introducción y Marco Legal</h3>
                    <p className="mb-4">En estricto cumplimiento a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) aplicable en los Estados Unidos Mexicanos, se emite el presente Aviso de Privacidad para informar a los usuarios (en adelante, el “Titular”) sobre el tratamiento de sus datos en el sitio web institucional: <a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">https://iiresodh.org</a>.</p>
                    <div className="bg-pale-blue/30 p-4 rounded-xl border border-pale-blue mt-6">
                      <p className="text-sm font-medium text-main-blue">
                        <strong>Importante:</strong> Este Aviso no cubre el servicio tecnológico PIDA-AI, el cual cuenta con su propio Responsable jurídico y Aviso de Privacidad independiente en <a href="https://pida-ai.com" target="_blank" rel="noopener noreferrer" className="text-light-blue hover:text-main-blue transition-colors">https://pida-ai.com</a>.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">2. Identidad y Domicilio del Responsable</h3>
                    <p>El <strong>Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)</strong>, con domicilio en Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica, es el Responsable de recabar sus datos personales, del uso que se le dé a los mismos y de su protección.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">3. Datos Personales que Tratamos</h3>
                    <p className="mb-4">Para las finalidades señaladas en el presente aviso, podemos recabar los siguientes datos personales:</p>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Datos de Identificación y Contacto:</strong> Nombre completo, correo electrónico, institución a la que pertenece y país.</li>
                      <li><strong>Datos de Navegación:</strong> Dirección IP, cookies y datos analíticos de uso del portal web.</li>
                    </ul>
                    <p className="mt-6 text-main-red font-bold">Datos Personales Sensibles:</p>
                    <p>El IIRESODH <strong>no recaba ni trata</strong> datos personales sensibles para la operación de este portal. Le rogamos abstenerse de enviar información clasificada como sensible a través de nuestros formularios de contacto general.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">4. Finalidades del Tratamiento</h3>
                    <p className="font-bold mb-3 text-main-blue">Finalidades Primarias (necesarias para la relación jurídica):</p>
                    <ul className="list-disc pl-8 mb-6 space-y-3">
                      <li>Proveer la información solicitada respecto a nuestras actividades y defensa de derechos humanos.</li>
                      <li>Contactar al Titular en respuesta a sus mensajes, dudas o comentarios.</li>
                      <li>Gestionar la inscripción a eventos, foros o programas académicos dictados por el IIRESODH.</li>
                    </ul>

                    <p className="font-bold mb-3 text-main-blue">Finalidades Secundarias:</p>
                    <ul className="list-disc pl-8 space-y-3">
                      <li>Envío de boletines informativos institucionales.</li>
                      <li>Análisis estadístico del uso del sitio web para mejora continua.</li>
                    </ul>
                    <p className="mt-4">En caso de que no desee que sus datos personales sean tratados para las Finalidades Secundarias, usted puede manifestar su negativa enviando un correo a <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue font-bold transition-colors">contacto@iiresodh.org</a>.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">5. Transferencias y/o Remisiones de Datos Personales</h3>
                    <p className="mb-4">Le informamos que sus datos personales no son compartidos, vendidos ni transferidos a terceros (otros responsables) dentro ni fuera del país, salvo en aquellos casos en que la Ley lo exija expresamente (artículo 37 de la LFPDPPP).</p>
                    <p>El IIRESODH podrá realizar remisiones de datos a proveedores de servicios (ej. servidores web, gestores de correo) que fungen como Encargados y asumen las mismas obligaciones de confidencialidad y seguridad establecidas en este Aviso.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">6. Derechos ARCO y Revocación del Consentimiento</h3>
                    <p className="mb-4">Usted tiene derecho a conocer qué datos personales tenemos de usted (<strong>A</strong>cceso); solicitar la corrección de su información en caso de ser inexacta (<strong>R</strong>ectificación); que la eliminemos de nuestros registros (<strong>C</strong>ancelación); así como <strong>O</strong>ponerse al uso de sus datos para fines específicos.</p>
                    <p className="mb-4">Para ejercer cualquiera de los derechos ARCO, o revocar su consentimiento, deberá presentar la solicitud respectiva a través de un correo electrónico dirigido a <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue font-bold transition-colors">contacto@iiresodh.org</a>, incluyendo:</p>
                    <ol className="list-decimal pl-8 mt-4 space-y-3 font-medium">
                      <li>Su nombre y correo electrónico para recibir respuesta.</li>
                      <li>Documento oficial que acredite su identidad.</li>
                      <li>La descripción clara y precisa de los datos respecto de los cuales busca ejercer el derecho.</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">7. Uso de Cookies</h3>
                    <p>Nuestro sitio web utiliza tecnologías como cookies para mejorar su experiencia, analizar el tráfico y adaptar el contenido. Usted puede configurar su navegador web para rechazar todas las cookies o para que le avise cuando se envíe una cookie.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">8. Modificaciones al Aviso de Privacidad</h3>
                    <p>El IIRESODH se reserva el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente aviso de privacidad. Cualquier cambio estará disponible y visible al público en esta misma página web institucional.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">9. Contacto</h3>
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm mt-4">
                      <p className="font-bold text-main-blue mb-2">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</p>
                      <p className="mb-2"><strong>Correo electrónico:</strong> <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
                      <p><strong>Domicilio:</strong> Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
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