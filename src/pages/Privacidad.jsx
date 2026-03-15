// src/pages/Privacidad.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

            {/* Contenedor de la Política (Mismo estilo que el Home) */}
            <div className="bg-white md:rounded-3xl shadow-2xl border-y md:border border-gray-100 p-8 md:p-12 lg:p-16">
              
              {/* CONTENIDO: POLÍTICA GENERAL */}
              {activeTab === "general" && (
                <div className="space-y-10 text-lg text-gray-700 leading-loose animate-fade-in-up">
                  <div className="border-b border-gray-100 pb-8 mb-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-main-blue mb-4">Política de Privacidad de IIRESODH y sus Servicios</h2>
                    <p className="text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 14 de marzo de 2026</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">1. Introducción y Alcance</h3>
                    <p className="mb-4">Bienvenido a la Política de Privacidad del Instituto Internacional de Responsabilidad Social y Derechos Humanos (en adelante, “IIRESODH”, “nosotros” o “nuestro”).</p>
                    <p className="mb-4">Esta política describe cómo recopilamos, utilizamos, protegemos y compartimos su información personal. Aplica a todos los visitantes y usuarios de:</p>
                    <ul className="list-disc pl-8 mb-6 space-y-2 font-medium">
                      <li>Nuestro sitio web institucional: <a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">https://iiresodh.org</a> (en adelante, el “Sitio Web General”).</li>
                      <li>Nuestro servicio de inteligencia artificial por suscripción: <a href="https://pida-ai.com" target="_blank" rel="noopener noreferrer" className="text-light-blue hover:text-main-blue transition-colors">https://pida-ai.com</a> (en adelante, el “Servicio PIDA-AI”).</li>
                    </ul>
                    <p>Al utilizar cualquiera de nuestros sitios o servicios, usted reconoce que ha leído y acepta las prácticas descritas en esta Política de Privacidad. Si no está de acuerdo con esta política, por favor, no utilice nuestros servicios.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">2. Responsable del Tratamiento de sus Datos</h3>
                    <p>El responsable del tratamiento de sus datos personales es el <strong>Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</strong>, con domicilio en Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">3. ¿Qué Información Recopilamos?</h3>
                    <p>Recopilamos diferentes tipos de información según el servicio que utilice.</p>
                    
                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">3.1. Información Aplicable a Todos Nuestros Sitios (Sitio Web General y PIDA-AI)</h4>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Información que usted nos proporciona directamente:</strong> Recopilamos datos personales cuando nos contacta a través de formularios, como su nombre, dirección de correo electrónico y el contenido de su mensaje.</li>
                      <li><strong>Información recopilada automáticamente:</strong> Cuando navega por nuestros sitios, recopilamos cierta información de manera automática, como su dirección IP, tipo de navegador, sistema operativo, páginas visitadas y la fecha y hora de su visita. Esta información se utiliza para análisis, seguridad y mejora de nuestros servicios.</li>
                    </ul>

                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">3.2. Información Específica del Servicio PIDA-AI</h4>
                    <p className="mb-4">Además de la información anterior, si usted es usuario del Servicio PIDA-AI, recopilamos:</p>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Información de Registro y Cuenta:</strong> Su nombre, dirección de correo electrónico y contraseña (cifrada) para crear y gestionar su cuenta.</li>
                      <li><strong>Información de Pago:</strong> Para procesar su suscripción, utilizamos proveedores de pago externos y seguros (ej. Stripe, PayPal). Nosotros <strong>no almacenamos</strong> los datos completos de su tarjeta de crédito o débito. Solo recibimos una confirmación de pago, su nombre y datos de contacto.</li>
                      <li><strong>Contenido de Entrada y Salida:</strong> Recopilamos las preguntas o “prompts” que usted ingresa en el Servicio PIDA-AI (“Contenido de Entrada”) y las respuestas que la IA genera (“Contenido de Salida”) para poder prestarle el servicio.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">4. ¿Para Qué Utilizamos su Información? (Fines y Base Legal)</h3>
                    <p>Utilizamos su información para fines específicos y siempre amparados en una base legal válida.</p>
                    
                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">4.1. Para el Sitio Web General:</h4>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Responder a sus consultas:</strong> Para dar seguimiento a las solicitudes que nos envía. (Base legal: Su consentimiento).</li>
                      <li><strong>Mejorar nuestro sitio:</strong> Analizar cómo se utiliza nuestro sitio para optimizar la experiencia del usuario. (Base legal: Nuestro interés legítimo).</li>
                      <li><strong>Seguridad:</strong> Proteger nuestro sitio contra fraudes y ataques informáticos. (Base legal: Nuestro interés legítimo).</li>
                    </ul>

                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">4.2. Para el Servicio PIDA-AI:</h4>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Proveer y gestionar el servicio:</strong> Crear su cuenta, procesar su suscripción y darle acceso a la plataforma. (Base legal: Necesidad contractual).</li>
                      <li><strong>Comunicarnos con usted:</strong> Enviarle información importante sobre su cuenta, facturación o cambios en el servicio. (Base legal: Necesidad contractual).</li>
                      <li><strong>Mejorar el Servicio PIDA-AI:</strong> Utilizamos el Contenido de Entrada y Salida de forma <strong>agregada y anonimizada</strong> para entrenar, mejorar la precisión y la seguridad de nuestros modelos de IA. Nunca utilizaremos sus datos personales o contenido específico para este fin sin antes disociarlos de su identidad. (Base legal: Nuestro interés legítimo).</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">5. ¿Con Quién Compartimos su Información?</h3>
                    <p className="mb-4">Su privacidad es fundamental. No vendemos ni alquilamos su información personal. Solo la compartimos en las siguientes circunstancias:</p>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Proveedores de Servicios:</strong> Con empresas que nos ayudan a operar, como proveedores de alojamiento web (hosting), servicios de análisis (ej. Google Analytics) y plataformas de comunicación.</li>
                      <li><strong>Procesadores de Pago:</strong> Con nuestros socios de pago para gestionar de forma segura las transacciones de suscripción de PIDA-AI.</li>
                      <li><strong>Obligación Legal:</strong> Si una autoridad competente o una ley nos exige divulgar información, lo haremos cumpliendo estrictamente con el procedimiento legal.</li>
                      <li><strong>Consentimiento:</strong> Con terceros, si usted nos ha dado su consentimiento explícito para hacerlo.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">6. Cookies y Tecnologías Similares</h3>
                    <p>Utilizamos cookies (pequeños archivos de texto en su navegador) para el funcionamiento técnico de nuestros sitios, recordar sus preferencias y para fines de análisis. Usted puede controlar y deshabilitar el uso de cookies a través de la configuración de su navegador. Tenga en cuenta que si las deshabilita, algunas funciones de nuestros sitios podrían verse limitadas.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">7. Seguridad de su Información</h3>
                    <p>Tomamos medidas de seguridad técnicas y organizativas para proteger su información. Utilizamos tecnología de cifrado SSL (Secure Sockets Layer) para las transferencias de datos, firewalls para proteger nuestros servidores y realizamos copias de seguridad periódicas. Sin embargo, ningún sistema es 100% seguro. Hacemos nuestro mejor esfuerzo para proteger sus datos, pero no podemos garantizar una seguridad absoluta.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">8. ¿Por Cuánto Tiempo Conservamos sus Datos? (Retención)</h3>
                    <p className="mb-4">Conservamos su información personal solo durante el tiempo necesario para cumplir con los fines para los que fue recopilada, o según lo exijan las obligaciones legales.</p>
                    <ul className="list-disc pl-8 space-y-3">
                      <li>Los datos de contacto del Sitio Web General se conservan mientras sea necesario para gestionar su consulta.</li>
                      <li>Los datos de la cuenta de PIDA-AI se conservan mientras su suscripción esté activa y por un período razonable después para fines administrativos.</li>
                      <li>El contenido anonimizado para la mejora del modelo puede conservarse por períodos más largos.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">9. Sus Derechos sobre sus Datos Personales</h3>
                    <p className="mb-4">Usted tiene derecho a:</p>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Acceder</strong> a la información personal que tenemos sobre usted.</li>
                      <li><strong>Rectificar</strong> cualquier información que sea inexacta o incompleta.</li>
                      <li><strong>Suprimir (eliminar)</strong> sus datos cuando ya no sean necesarios para los fines para los que fueron recogidos.</li>
                      <li><strong>Oponerse</strong> al tratamiento de sus datos en determinadas circunstancias.</li>
                      <li><strong>Limitar</strong> el tratamiento de sus datos.</li>
                      <li><strong>Solicitar la portabilidad</strong> de sus datos a otro proveedor de servicios.</li>
                    </ul>
                    <p className="mt-6">Para ejercer cualquiera de estos derechos, puede contactarnos a través del correo electrónico: <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue font-bold transition-colors">contacto@iiresodh.org</a>.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">10. Privacidad de Menores de Edad</h3>
                    <p>Nuestros servicios no están dirigidos a personas menores de 18 años. No recopilamos intencionadamente información de menores. Si detectamos que lo hemos hecho, tomaremos medidas para eliminar dicha información.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">11. Cambios a esta Política de Privacidad</h3>
                    <p>Podemos actualizar esta política periódicamente para reflejar cambios en nuestros servicios o en la legislación. Cuando lo hagamos, actualizaremos la fecha en la parte superior de esta página. Le recomendamos revisar esta política con regularidad.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">12. Contacto</h3>
                    <p className="mb-4">Si tiene alguna pregunta sobre esta Política de Privacidad o sobre cómo tratamos sus datos, no dude en contactarnos:</p>
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm">
                      <p className="font-bold text-main-blue mb-2">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</p>
                      <p className="mb-2"><strong>Correo electrónico:</strong> <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
                      <p><strong>Dirección:</strong> Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO: AVISO PARA MÉXICO */}
              {activeTab === "mexico" && (
                <div className="space-y-10 text-lg text-gray-700 leading-loose animate-fade-in-up">
                  <div className="border-b border-gray-100 pb-8 mb-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-main-blue mb-4">Aviso de Privacidad de IIRESODH y sus Servicios (MÉXICO)</h2>
                    <p className="text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 14 de marzo de 2026</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">1. Introducción</h3>
                    <p className="mb-4">Este es el Aviso de Privacidad del Instituto Internacional de Responsabilidad Social y Derechos Humanos (en adelante, “IIRESODH”). Este documento describe cómo tratamos los datos personales de los usuarios (en adelante, el “Titular” o “usted”) de:</p>
                    <ul className="list-disc pl-8 mb-6 space-y-2 font-medium">
                      <li>Nuestro sitio web institucional: <a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">https://iiresodh.org</a> (en adelante, el “Sitio Web General”).</li>
                      <li>Nuestro servicio de inteligencia artificial por suscripción: <a href="https://pida-ai.com" target="_blank" rel="noopener noreferrer" className="text-light-blue hover:text-main-blue transition-colors">https://pida-ai.com</a> (en adelante, el “Servicio PIDA-AI”).</li>
                    </ul>
                    <p>Al proporcionarnos sus datos personales y/o utilizar nuestros servicios, usted otorga su consentimiento para el tratamiento de sus datos conforme a este Aviso de Privacidad.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">2. Identidad y Domicilio del Responsable</h3>
                    <p>IIRESODH, con domicilio en Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica, es el <strong>Responsable</strong> del tratamiento de sus datos personales.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">3. Datos Personales que Tratamos</h3>
                    <p>Tratamos distintas categorías de datos personales según el servicio que utilice.</p>
                    
                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">3.1. Datos Tratados en Todos Nuestros Sitios (Sitio Web General y PIDA-AI)</h4>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Datos de Identificación y Contacto:</strong> Nombre y correo electrónico que nos proporciona directamente a través de formularios.</li>
                      <li><strong>Datos de Uso y de Dispositivo:</strong> Dirección IP, tipo de navegador, sistema operativo y páginas visitadas, recopilados de forma automática.</li>
                    </ul>

                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">3.2. Datos Específicos del Servicio PIDA-AI</h4>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Datos de Registro de Cuenta:</strong> Nombre, correo electrónico y contraseña (cifrada).</li>
                      <li><strong>Datos Patrimoniales y Financieros:</strong> A través de nuestros proveedores de pago externos, se recopila la información necesaria para procesar el pago de su suscripción. IIRESODH <strong>no almacena</strong> los datos completos de su tarjeta. Su tratamiento requiere su <strong>consentimiento expreso</strong>, el cual se otorga al momento de ingresar los datos en la pasarela de pago para completar la transacción.</li>
                      <li><strong>Contenido Generado por el Usuario:</strong> Las preguntas o “prompts” que usted ingresa en el Servicio PIDA-AI.</li>
                    </ul>

                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">3.3. Datos Personales Sensibles</h4>
                    <p>IIRESODH <strong>no solicita</strong> datos personales sensibles (como origen racial o étnico, estado de salud, creencias religiosas, opiniones políticas, preferencia sexual, etc.). Le rogamos <strong>no proporcionar</strong> este tipo de información a través de nuestros servicios.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">4. Finalidades del Tratamiento de sus Datos</h3>
                    <p>Distinguimos entre finalidades primarias (necesarias para el servicio) y secundarias (accesorias).</p>
                    
                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">4.1. Finalidades Primarias (necesarias):</h4>
                    <p className="font-bold mb-3 text-main-blue">En ambos sitios:</p>
                    <ul className="list-disc pl-8 mb-6 space-y-3">
                      <li>Gestionar y responder a sus solicitudes de información.</li>
                      <li>Mantener la seguridad e integridad de nuestros sistemas.</li>
                    </ul>
                    <p className="font-bold mb-3 text-main-blue">En el Servicio PIDA-AI:</p>
                    <ul className="list-disc pl-8 space-y-3">
                      <li>Crear, verificar y administrar su cuenta de usuario.</li>
                      <li>Procesar los pagos de su suscripción.</li>
                      <li>Prestarle el servicio de IA solicitado, procesando su Contenido de Entrada para generar el Contenido de Salida.</li>
                      <li>Enviarle comunicaciones transaccionales sobre su cuenta o el servicio.</li>
                    </ul>

                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">4.2. Finalidades Secundarias (accesorias):</h4>
                    <ul className="list-disc pl-8 mb-6 space-y-3">
                      <li>Analizar el uso de nuestros sitios para mejorar la experiencia del usuario.</li>
                      <li>De forma <strong>agregada y anonimizada</strong>, utilizar el contenido generado en PIDA-AI para mejorar la precisión y seguridad de nuestros modelos de IA.</li>
                    </ul>
                    <p>Usted puede manifestar su negativa para el tratamiento de sus datos para estas finalidades secundarias enviando un correo a <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue font-bold transition-colors">contacto@iiresodh.org</a>.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">5. Transferencia y/o Remisión de Datos Personales</h3>
                    <ul className="list-disc pl-8 space-y-5">
                      <li><strong>Remisiones (No requieren consentimiento):</strong> Compartimos sus datos con proveedores que actúan en nuestro nombre (encargados), como servicios de alojamiento web (hosting), análisis de datos (Google Analytics) y procesadores de pago (ej. Stripe, PayPal), quienes están obligados a mantener la confidencialidad y seguridad de la información.</li>
                      <li><strong>Transferencias (Requieren consentimiento):</strong> IIRESODH <strong>no realiza transferencias</strong> de sus datos personales a terceros (otros responsables) sin su consentimiento expreso, salvo en los casos de excepción previstos en el artículo 37 de la LFPDPPP (ej. requerimiento de una autoridad competente).</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">6. Medios para Ejercer sus Derechos ARCO y Revocar el Consentimiento</h3>
                    <p className="mb-4">Usted, como Titular, tiene derecho a:</p>
                    <ul className="list-disc pl-8 mb-6 space-y-3">
                      <li><strong>Acceso:</strong> Conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos.</li>
                      <li><strong>Rectificación:</strong> Solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta.</li>
                      <li><strong>Cancelación:</strong> Solicitar que eliminemos su información de nuestros registros o bases de datos cuando considere que no está siendo utilizada adecuadamente. (Su solicitud dará lugar a un período de bloqueo y posterior supresión).</li>
                      <li><strong>Oposición:</strong> Oponerse al uso de sus datos personales para fines específicos.</li>
                    </ul>
                    <p className="mb-4">Asimismo, usted puede <strong>revocar el consentimiento</strong> que nos haya otorgado y <strong>limitar el uso o divulgación</strong> de su información personal.</p>
                    <p className="mb-4">Para ejercer cualquiera de estos derechos, deberá enviar una solicitud por escrito al correo electrónico <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue font-bold transition-colors">contacto@iiresodh.org</a>, la cual deberá contener:</p>
                    <ol className="list-decimal pl-8 mt-4 space-y-3 font-medium">
                      <li>Su nombre completo.</li>
                      <li>Un correo electrónico para comunicarle la respuesta.</li>
                      <li>Una copia de un documento que acredite su identidad (ej. credencial de elector, pasaporte).</li>
                      <li>La descripción clara y precisa de los datos respecto de los que busca ejercer alguno de los derechos y el derecho que desea ejercer.</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">7. Uso de Cookies</h3>
                    <p>Utilizamos cookies para el funcionamiento técnico y análisis de nuestros sitios. Usted puede deshabilitarlas desde la configuración de su navegador, aunque esto podría limitar su experiencia de usuario.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">8. Medidas de Seguridad</h3>
                    <p>Implementamos medidas de seguridad físicas, técnicas y administrativas para proteger sus datos personales, incluyendo el uso de cifrado SSL, firewalls y políticas de acceso.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">9. Cambios a este Aviso de Privacidad</h3>
                    <p>Cualquier modificación a este Aviso de Privacidad le será notificada a través de una publicación en nuestros sitios web.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">10. Contacto</h3>
                    <p className="mb-4">Si tiene alguna pregunta sobre este Aviso de Privacidad, puede contactarnos en:</p>
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm">
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