// src/pages/Privacidad.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Privacidad() {
  // Ahora el estado puede ser: "general", "mexico" o "terminos"
  const [activeTab, setActiveTab] = useState("general");

  // Hacer scroll al tope de la página al cargar o al cambiar de pestaña
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

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
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-8 px-6 md:px-0">
              <button
                onClick={() => setActiveTab("general")}
                className={`py-3 px-8 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-md ${
                  activeTab === "general"
                    ? "bg-main-blue text-white"
                    : "bg-white text-main-blue border border-gray-200 hover:bg-pale-blue hover:text-main-blue"
                }`}
              >
                Política General
              </button>
              <button
                onClick={() => setActiveTab("mexico")}
                className={`py-3 px-8 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-md ${
                  activeTab === "mexico"
                    ? "bg-main-red text-white"
                    : "bg-white text-main-red border border-gray-200 hover:bg-red-50 hover:border-main-red"
                }`}
              >
                Aviso para México
              </button>
              <button
                onClick={() => setActiveTab("terminos")}
                className={`py-3 px-8 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-md ${
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
                <div className="space-y-10 text-lg text-gray-700 leading-loose animate-fade-in-up">
                  <div className="border-b border-gray-100 pb-8 mb-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-main-blue mb-4">Política de Privacidad de IIRESODH y PIDA-AI</h2>
                    <p className="text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 14 de marzo de 2026</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">1. Introducción y Alcance</h3>
                    <p className="mb-4">Bienvenido a la Política de Privacidad de la plataforma institucional y académica del Instituto Internacional de Responsabilidad Social y Derechos Humanos (en adelante, “IIRESODH”) y del servicio tecnológico asociado PIDA-AI.</p>
                    <p className="mb-4">Debido a la naturaleza de nuestras operaciones, esta política distingue claramente el tratamiento de datos entre nuestras dos plataformas principales:</p>
                    <ul className="list-disc pl-8 mb-6 space-y-2 font-medium">
                      <li><strong>Sitio Web Institucional y Plataforma Educativa:</strong> <a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">https://iiresodh.org</a> (operado por IIRESODH).</li>
                      <li><strong>Servicio de Inteligencia Artificial:</strong> <a href="https://pida-ai.com" target="_blank" rel="noopener noreferrer" className="text-light-blue hover:text-main-blue transition-colors">https://pida-ai.com</a> (operado de forma independiente por IIRESODH PAYMENTS, LLC).</li>
                    </ul>
                    <p>Al utilizar cualquiera de estos sitios o servicios, usted reconoce que ha leído y acepta las prácticas descritas en esta Política de Privacidad, reconociendo la independencia jurídica de los responsables que se detallan a continuación.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">2. Responsables del Tratamiento de sus Datos</h3>
                    <p className="mb-4">La recolección y el tratamiento de sus datos están divididos según el servicio que usted utilice:</p>
                    <ul className="list-disc pl-8 space-y-4">
                      <li>
                        <strong>Para el Sitio Institucional y Cursos (IIRESODH):</strong> El responsable es el <strong>Instituto Internacional de Responsabilidad Social y Derechos Humanos</strong>, con domicilio en Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.
                      </li>
                      <li>
                        <strong>Para el Servicio PIDA-AI:</strong> El responsable legal y tecnológico es <strong>IIRESODH PAYMENTS, LLC</strong>, sociedad de responsabilidad limitada constituida bajo las leyes de Delaware, EE.UU., con domicilio en [DIRECCIÓN EXACTA EN DELAWARE].
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">3. ¿Qué Información Recopilamos?</h3>
                    
                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">3.1. Por parte de IIRESODH (Web Institucional y Cursos)</h4>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Datos de Contacto y Académicos:</strong> Nombre, correo electrónico, y datos proporcionados al inscribirse en cursos o contactarnos.</li>
                      <li><strong>Información de Pago (Cursos):</strong> Datos necesarios para procesar inscripciones a cursos a través de pasarelas de pago seguras. IIRESODH no almacena los datos de sus tarjetas.</li>
                    </ul>

                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">3.2. Por parte de IIRESODH PAYMENTS, LLC (Servicio PIDA-AI)</h4>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Información de Registro:</strong> Su nombre, dirección de correo electrónico y contraseña (cifrada) para gestionar su cuenta en la IA.</li>
                      <li><strong>Información de Pago (Suscripciones):</strong> Para procesar su suscripción a PIDA-AI, se utilizan proveedores de pago externos (ej. Stripe). IIRESODH PAYMENTS, LLC no almacena los datos completos de su tarjeta.</li>
                      <li><strong>Contenido de Entrada y Salida:</strong> Las preguntas o “prompts” que ingresa (“Contenido de Entrada”) y las respuestas generadas (“Contenido de Salida”).</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">4. ¿Para Qué Utilizamos su Información? (Fines y Base Legal)</h3>
                    
                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">4.1. Fines de IIRESODH:</h4>
                    <ul className="list-disc pl-8 space-y-3">
                      <li>Responder consultas, procesar inscripciones a cursos y emitir certificaciones. (Base legal: Ejecución de un contrato y/o Consentimiento).</li>
                      <li>Enviar boletines y noticias institucionales. (Base legal: Interés legítimo o Consentimiento).</li>
                    </ul>

                    <h4 className="text-xl font-bold text-main-blue mt-8 mb-4">4.2. Fines de IIRESODH PAYMENTS, LLC (PIDA-AI):</h4>
                    <ul className="list-disc pl-8 space-y-3">
                      <li>Proveer y gestionar el servicio de suscripción a la inteligencia artificial. (Base legal: Necesidad contractual).</li>
                      <li>Mejorar los modelos de IA utilizando el Contenido de Entrada y Salida de forma <strong>estrictamente agregada y anonimizada</strong>, disociándolo de su identidad personal. (Base legal: Interés legítimo).</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">5. ¿Con Quién Compartimos su Información?</h3>
                    <p className="mb-4">No vendemos ni alquilamos su información personal. Los datos se comparten únicamente en estas circunstancias:</p>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Entre IIRESODH e IIRESODH PAYMENTS, LLC:</strong> Únicamente para fines de validación de usuarios si usted enlaza sus cuentas, o para verificar descuentos aplicables a alumnos del IIRESODH en el servicio PIDA.</li>
                      <li><strong>Proveedores Tecnológicos y de Pago:</strong> Hosting, pasarelas de pago y analítica web que operan bajo acuerdos de confidencialidad.</li>
                      <li><strong>Obligación Legal:</strong> Si una autoridad competente de la jurisdicción del responsable lo exige mediante el debido proceso.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">6. Cookies y Tecnologías Similares</h3>
                    <p>Utilizamos cookies para el funcionamiento técnico de nuestros sitios, recordar sus preferencias y para fines de análisis. Usted puede controlar y deshabilitar el uso de cookies a través de la configuración de su navegador.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">7. Seguridad de su Información</h3>
                    <p>Ambas entidades toman medidas de seguridad técnicas y organizativas para proteger su información (cifrado SSL, firewalls y respaldos periódicos). Sin embargo, ningún sistema en internet es 100% seguro.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">8. Sus Derechos sobre sus Datos Personales</h3>
                    <p className="mb-4">Usted tiene derecho a Acceder, Rectificar, Suprimir, Oponerse y Limitar el uso de sus datos. Puede ejercer estos derechos dirigiéndose al responsable respectivo:</p>
                    <ul className="list-disc pl-8 mt-4 space-y-2">
                      <li>Para temas de IIRESODH y Cursos: <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue font-bold transition-colors">contacto@iiresodh.org</a></li>
                      <li>Para temas de PIDA-AI y suscripciones: <a href="mailto:[CORREO DE CONTACTO PIDA/LLC]" className="text-light-blue hover:text-main-blue font-bold transition-colors">[CORREO DE CONTACTO PIDA/LLC]</a></li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">9. Contacto General</h3>
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm mt-4">
                      <p className="font-bold text-main-blue mb-2">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</p>
                      <p className="mb-2"><strong>Correo electrónico:</strong> <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
                      <p><strong>Dirección Costa Rica:</strong> Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                      <p className="mt-4"><strong>Soporte PIDA-AI (IIRESODH PAYMENTS, LLC):</strong> <a href="mailto:[CORREO DE CONTACTO PIDA/LLC]" className="text-light-blue hover:text-main-blue transition-colors">[CORREO DE CONTACTO PIDA/LLC]</a></p>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================
                  CONTENIDO: AVISO PARA MÉXICO
              ========================================= */}
              {activeTab === "mexico" && (
                <div className="space-y-10 text-lg text-gray-700 leading-loose animate-fade-in-up">
                  <div className="border-b border-gray-100 pb-8 mb-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-main-blue mb-4">Aviso de Privacidad (MÉXICO)</h2>
                    <p className="text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 14 de marzo de 2026</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">1. Introducción y Marco Legal</h3>
                    <p className="mb-4">En cumplimiento a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), se emite el presente Aviso de Privacidad, el cual detalla el tratamiento de los datos personales recopilados en nuestros dos entornos tecnológicos principales:</p>
                    <ul className="list-disc pl-8 mb-6 space-y-2 font-medium">
                      <li>La plataforma institucional y académica: <a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">https://iiresodh.org</a></li>
                      <li>El servicio de Inteligencia Artificial PIDA-AI: <a href="https://pida-ai.com" target="_blank" rel="noopener noreferrer" className="text-light-blue hover:text-main-blue transition-colors">https://pida-ai.com</a></li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">2. Identidad y Domicilio de los Responsables</h3>
                    <p className="mb-4">Existen dos Responsables jurídicamente independientes, de acuerdo a la plataforma que el Titular utilice:</p>
                    <ul className="list-disc pl-8 space-y-4">
                      <li><strong>IIRESODH (Para el sitio general y los cursos):</strong> Asociación con domicilio en Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</li>
                      <li><strong>IIRESODH PAYMENTS, LLC (Para PIDA-AI):</strong> Sociedad legalmente constituida en Delaware, EE.UU., encargada de la gestión tecnológica y de suscripciones de la plataforma PIDA-AI, con domicilio en [DIRECCIÓN EXACTA EN DELAWARE].</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">3. Datos Personales que Tratamos</h3>
                    <p>Los Responsables, en sus respectivos ámbitos, podrán recabar los siguientes datos:</p>
                    <ul className="list-disc pl-8 mt-4 space-y-3">
                      <li><strong>Datos de Identificación y Contacto:</strong> Nombre, correo electrónico y datos académicos (en caso de cursos).</li>
                      <li><strong>Datos de Uso:</strong> Dirección IP, información del navegador e interacciones dentro de los sitios web.</li>
                      <li><strong>Datos Patrimoniales:</strong> Para cursos (IIRESODH) o suscripciones (IIRESODH PAYMENTS, LLC), se utilizan procesadores de pago externos. El tratamiento de estos datos requiere su <strong>consentimiento expreso</strong>, otorgado al realizar la transacción. <em>Ninguno de los responsables almacena los 16 dígitos de su tarjeta bancaria.</em></li>
                      <li><strong>Contenido Generado (PIDA-AI):</strong> Las interacciones (prompts) que realice con el asistente de IA.</li>
                    </ul>
                    <p className="mt-4 text-main-red font-bold">Datos Personales Sensibles:</p>
                    <p>Ninguno de los Responsables solicita ni da tratamiento proactivo a datos personales sensibles. Le pedimos abstenerse de ingresar este tipo de datos (origen racial, estado de salud, afiliación política) en nuestros formularios o en la plataforma de IA.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">4. Finalidades del Tratamiento</h3>
                    <p className="font-bold mb-3 text-main-blue">Finalidades Primarias (necesarias para la relación jurídica):</p>
                    <ul className="list-disc pl-8 mb-6 space-y-3">
                      <li><strong>Por IIRESODH:</strong> Inscripción a cursos, emisión de certificados y atención de dudas institucionales.</li>
                      <li><strong>Por IIRESODH PAYMENTS, LLC:</strong> Gestión de cuentas de PIDA-AI, procesamiento de pagos de suscripción y generación de respuestas de Inteligencia Artificial.</li>
                    </ul>

                    <p className="font-bold mb-3 text-main-blue">Finalidades Secundarias:</p>
                    <ul className="list-disc pl-8 space-y-3">
                      <li>Envío de publicidad, boletines e información sobre eventos.</li>
                      <li>Entrenamiento y mejora de los algoritmos de PIDA-AI mediante la <strong>anonimización irreversible</strong> de las consultas realizadas por los usuarios.</li>
                    </ul>
                    <p className="mt-4">Si no desea que sus datos sean tratados para finalidades secundarias, envíe un correo manifestando su negativa a <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue font-bold transition-colors">contacto@iiresodh.org</a>.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">5. Transferencias de Datos Personales</h3>
                    <p className="mb-4">Sus datos personales no serán transferidos a terceros ajenos a los responsables para fines distintos a los establecidos, salvo obligación legal prevista en el artículo 37 de la LFPDPPP.</p>
                    <p>Las transferencias de datos entre IIRESODH e IIRESODH PAYMENTS, LLC se realizan exclusivamente bajo acuerdos de corresponsabilidad para validar la identidad de los usuarios y aplicar beneficios conjuntos (ej. descuentos para alumnos en la plataforma de IA).</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">6. Derechos ARCO y Revocación de Consentimiento</h3>
                    <p className="mb-4">Usted tiene derecho a <strong>A</strong>cceder, <strong>R</strong>ectificar, <strong>C</strong>ancelar u <strong>O</strong>ponerse al tratamiento de sus datos, así como revocar su consentimiento. Deberá presentar una solicitud al correo <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue font-bold transition-colors">contacto@iiresodh.org</a> indicando:</p>
                    <ol className="list-decimal pl-8 mt-4 space-y-3 font-medium">
                      <li>Nombre completo y documento que acredite su identidad oficial.</li>
                      <li>Descripción clara del derecho ARCO que desea ejercer o la revocación del consentimiento.</li>
                      <li>En caso de PIDA-AI, indicar el correo asociado a su suscripción.</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">7. Modificaciones al Aviso de Privacidad</h3>
                    <p>Cualquier modificación a este Aviso de Privacidad será publicada en las plataformas web de los Responsables indicando la fecha de su última actualización.</p>
                  </div>
                </div>
              )}

              {/* =========================================
                  CONTENIDO: TÉRMINOS Y CONDICIONES
              ========================================= */}
              {activeTab === "terminos" && (
                <div className="space-y-10 text-lg text-gray-700 leading-loose animate-fade-in-up">
                  <div className="border-b border-gray-100 pb-8 mb-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-main-blue mb-4">Términos y Condiciones del Sitio Web</h2>
                    <p className="text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 14 de marzo de 2026</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">1. Introducción</h3>
                    <p>Estos Términos y Condiciones (en adelante, los “Términos”) se aplican al uso de este sitio web, accesible en <a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors font-bold">https://iiresodh.org</a> (en adelante, el “Sitio Web”), y a las transacciones relacionadas con nuestros productos y servicios. Su relación con nosotros podría estar regida también por contratos adicionales. En caso de conflicto entre las disposiciones de estos Términos y las de cualquier contrato adicional, prevalecerán las disposiciones de dichos contratos adicionales.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">2. Aceptación de los Términos</h3>
                    <p>Al registrarse, acceder o utilizar de cualquier forma este Sitio Web, usted acepta quedar vinculado por los Términos que se exponen a continuación. El mero uso del Sitio Web implica el conocimiento y la aceptación de estos Términos. En casos específicos, podremos solicitarle su aceptación explícita.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">3. Comunicación Electrónica</h3>
                    <p>Al utilizar este Sitio Web o comunicarse con nosotros por medios electrónicos, usted acepta y reconoce que podemos comunicarnos con usted de forma electrónica a través de nuestro Sitio Web o mediante el envío de correos electrónicos. Asimismo, usted acepta que todos los acuerdos, avisos, divulgaciones y otras comunicaciones que le proporcionemos por medios electrónicos satisfacen cualquier requisito legal que exija que dichas comunicaciones sean por escrito.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">4. Propiedad Intelectual</h3>
                    <p className="mb-4">Nosotros o nuestros licenciantes poseemos y controlamos todos los derechos de autor y otros derechos de propiedad intelectual sobre el Sitio Web, así como los datos, la información, el contenido y otros recursos mostrados o accesibles en él.</p>
                    
                    <h4 className="text-xl font-bold text-main-blue mt-6 mb-3">4.1. Licencia Creative Commons</h4>
                    <p className="mb-4">Salvo que se especifique lo contrario, el contenido original y las obras de creación de este Sitio Web se encuentran bajo una licencia <strong>Creative Commons Atribución-NoComercial-SinDerivadas 4.0 Internacional (CC BY-NC-ND 4.0)</strong>. Esto significa que usted es libre de compartir (copiar y redistribuir el material en cualquier medio o formato) bajo los siguientes términos:</p>
                    <ul className="list-disc pl-8 space-y-3">
                      <li><strong>Atribución:</strong> Debe dar el crédito apropiado, proporcionar un enlace a la licencia e indicar si se han realizado cambios.</li>
                      <li><strong>NoComercial:</strong> No puede utilizar el material para una finalidad comercial.</li>
                      <li><strong>SinDerivadas:</strong> Si remezcla, transforma o crea a partir del material, no puede difundir el material modificado.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">5. Enlaces a Sitios Web de Terceros</h3>
                    <p className="mb-4">Nuestro Sitio Web puede incluir hipervínculos u otras referencias a sitios web de terceros. No supervisamos ni revisamos el contenido de los sitios web de terceros enlazados desde este Sitio Web. Los productos o servicios ofrecidos por otros sitios web estarán sujetos a los Términos y Condiciones aplicables de dichos terceros. Las opiniones expresadas o el material que aparece en esos sitios no son necesariamente compartidos o respaldados por nosotros.</p>
                    <p>No seremos responsables de las prácticas de privacidad ni del contenido de dichos sitios. Usted asume todos los riesgos asociados al uso de estos sitios web y de cualquier servicio de terceros relacionado. No aceptaremos responsabilidad alguna por cualquier pérdida o daño, independientemente de cómo se produzca, que resulte de la divulgación de su información personal a terceros.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">6. Uso Responsable</h3>
                    <p className="mb-4">Al visitar nuestro Sitio Web, usted se compromete a utilizarlo únicamente para los fines previstos y conforme a lo permitido por estos Términos, los contratos adicionales que tenga con nosotros, las leyes y regulaciones aplicables, así como las prácticas en línea generalmente aceptadas y las directrices del sector.</p>
                    <p className="font-bold text-main-red mb-3">Queda estrictamente prohibido:</p>
                    <ul className="list-disc pl-8 space-y-3">
                      <li>Usar nuestro Sitio Web o servicios para utilizar, publicar o distribuir cualquier material que contenga o esté vinculado a software malicioso (malware).</li>
                      <li>Utilizar los datos recogidos en nuestro Sitio Web para cualquier actividad de marketing directo.</li>
                      <li>Realizar cualquier actividad de recopilación de datos, ya sea sistemática o automatizada, en nuestro Sitio Web o en relación con él.</li>
                      <li>Realizar cualquier actividad que cause o pueda causar daños al Sitio Web, o que interfiera en su rendimiento, disponibilidad o accesibilidad.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">7. Registro de Cuenta</h3>
                    <p className="mb-4">Puede registrarse para obtener una cuenta en nuestro Sitio Web. Durante este proceso, se le podría pedir que elija una contraseña. Usted es el único responsable de mantener la confidencialidad de su contraseña y de la información de su cuenta. Se compromete a no compartir sus credenciales (contraseña, información de cuenta o acceso seguro) con ninguna otra persona.</p>
                    <p className="mb-4">No debe permitir que terceros utilicen su cuenta para acceder al Sitio Web, ya que usted es responsable de todas las actividades que se realicen a través de sus contraseñas o cuentas. Debe notificarnos inmediatamente si tiene conocimiento de cualquier divulgación o uso no autorizado de su contraseña.</p>
                    <p>Tras la cancelación de su cuenta, no intentará registrar una nueva sin nuestro permiso explícito.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">8. Contenido Publicado por Usted</h3>
                    <p>Podemos ofrecer herramientas de comunicación abierta en nuestro Sitio Web, como comentarios en blogs, foros, reseñas y servicios de redes sociales. Aunque no nos sea posible supervisar todo el contenido que usted u otros compartan, nos reservamos el derecho de revisar dicho contenido, supervisar el uso del Sitio Web y eliminar o rechazar cualquier contenido a nuestra entera discreción. Al publicar información o utilizar estas herramientas, usted garantiza que su contenido cumplirá con estos Términos, no será ilícito ni infringirá los derechos legales de ninguna persona.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">9. Envío de Ideas No Solicitadas</h3>
                    <p>No nos envíe ideas, invenciones, obras de autor u otra información que pueda considerarse de su propiedad intelectual, a menos que hayamos firmado previamente un acuerdo sobre propiedad intelectual o un acuerdo de no divulgación. Si nos divulga contenido en ausencia de dicho acuerdo, nos otorga una licencia mundial, irrevocable, no exclusiva y libre de regalías para usar, reproducir, almacenar, adaptar, publicar, traducir y distribuir su contenido en cualquier medio existente o futuro.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">10. Terminación de Uso</h3>
                    <p>Nos reservamos el derecho de modificar o interrumpir, a nuestra entera discreción y en cualquier momento, el acceso temporal o permanente al Sitio Web o a cualquiera de sus servicios. Usted acepta que no seremos responsables ante usted ni ante ningún tercero por dicha modificación, suspensión o interrupción de su acceso. No tendrá derecho a compensación alguna si se pierden permanentemente funciones, configuraciones o cualquier Contenido con el que usted haya contribuido. No debe eludir, evitar o intentar eludir ninguna medida de restricción de acceso en nuestro Sitio Web.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">11. Garantías y Responsabilidad</h3>
                    <p className="mb-4">Este Sitio Web y todo su contenido se proporcionan “tal cual” y “según disponibilidad” y pueden contener imprecisiones o errores tipográficos. Renunciamos expresamente a toda garantía, ya sea expresa o implícita, en cuanto a la disponibilidad, exactitud o integridad del Contenido.</p>
                    <p className="font-bold text-main-blue mb-3">No garantizamos que:</p>
                    <ul className="list-disc pl-8 mb-6 space-y-3">
                      <li>Este Sitio Web, o nuestros productos y servicios, satisfagan sus requisitos específicos.</li>
                      <li>El acceso al Sitio Web sea ininterrumpido, oportuno, seguro o libre de errores.</li>
                      <li>La calidad de cualquier producto o servicio adquirido a través de este Sitio Web cumpla con sus expectativas.</li>
                    </ul>
                    <p className="mb-4">Las disposiciones de esta sección se aplicarán en la máxima medida permitida por la ley aplicable. En ningún caso seremos responsables de daños directos o indirectos (incluida la pérdida de beneficios, pérdida o corrupción de datos, software o bases de datos, o daños a la propiedad) sufridos por usted o por un tercero como resultado de su acceso o uso de nuestro Sitio Web.</p>
                    <p>Salvo que un contrato adicional establezca lo contrario, nuestra máxima responsabilidad ante usted por todos los daños que surjan o estén relacionados con el Sitio Web, o con cualquier producto o servicio comercializado a través de él, se limitará al precio total que usted nos pagó para adquirir dichos productos o servicios, o para utilizar el Sitio Web. Este límite se aplicará de forma agregada a todas sus reclamaciones y acciones legales de cualquier naturaleza.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">12. Privacidad</h3>
                    <p className="mb-4">Para acceder a nuestro Sitio Web o servicios, es posible que se le solicite información personal durante el proceso de registro. Usted se compromete a que toda la información proporcionada sea siempre precisa, correcta y actualizada.</p>
                    <p>Nos tomamos muy en serio la protección de sus datos personales. Nuestra Política de Privacidad, que puede consultar en la <strong>pestaña de Política General</strong> de esta misma página, detalla cómo recopilamos, usamos y protegemos sus datos. No utilizaremos su dirección de correo electrónico para comunicaciones no solicitadas (spam).</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">13. Cumplimiento Legal y Restricciones Geográficas</h3>
                    <p>Se prohíbe el acceso al Sitio Web desde territorios o países donde el contenido o la compra de productos o servicios vendidos en el Sitio Web sea ilegal. Usted no puede utilizar este Sitio Web en violación de las leyes y regulaciones de exportación de Costa Rica.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">14. Cesión</h3>
                    <p>Usted no puede ceder, transferir o subcontratar ninguno de sus derechos u obligaciones bajo estos Términos, en su totalidad o en parte, a ningún tercero sin nuestro consentimiento previo por escrito. Cualquier intento de cesión que infrinja esta cláusula será nulo y sin efecto.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">15. Incumplimiento de estos Términos</h3>
                    <p>Sin perjuicio de nuestros otros derechos, si usted incumple estos Términos de cualquier manera, podremos tomar las medidas que consideremos apropiadas para hacer frente a dicho incumplimiento. Estas medidas pueden incluir la suspensión temporal o permanente de su acceso al Sitio Web, el contacto con su proveedor de servicios de Internet para que bloquee su acceso y/o el inicio de acciones legales en su contra.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">16. Fuerza Mayor</h3>
                    <p>Exceptuando las obligaciones de pago, ningún retraso, fallo u omisión por parte de cualquiera de las partes en el cumplimiento de sus obligaciones se considerará un incumplimiento de estos Términos si dicho retraso, fallo u omisión se debe a una causa que escapa a su control razonable (fuerza mayor).</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">17. Indemnización</h3>
                    <p>Usted se compromete a indemnizarnos, defendernos y eximirnos de toda responsabilidad ante cualquier reclamación, daño, pérdida y gasto relacionado con la violación por su parte de estos Términos y de las leyes aplicables, incluidos los derechos de propiedad intelectual y de privacidad. Usted nos reembolsará sin demora los daños, pérdidas, costos y gastos derivados de dichas reclamaciones.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">18. Renuncia</h3>
                    <p>El hecho de no hacer cumplir alguna de las disposiciones de estos Términos o de no ejercer una opción de terminación no se interpretará como una renuncia a dichas disposiciones y no afectará su validez ni el derecho a hacerlas cumplir en el futuro.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">19. Idioma</h3>
                    <p>Estos Términos se interpretarán y regirán exclusivamente en español. Todas las notificaciones y correspondencia se redactarán únicamente en este idioma.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">20. Acuerdo Completo</h3>
                    <p>Estos Términos, junto con nuestra Política de Privacidad, constituyen el acuerdo completo entre usted y el IIRESODH en relación con el uso de este Sitio Web.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">21. Actualización de estos Términos</h3>
                    <p>Podemos actualizar estos Términos periódicamente. Es su obligación revisarlos para verificar si existen cambios. La fecha indicada al principio de este documento corresponde a la última revisión. Los cambios entrarán en vigor en el momento de su publicación en el Sitio Web. Su uso continuado del Sitio Web tras la publicación de los cambios se considerará una aceptación de los nuevos Términos.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">22. Ley Aplicable y Jurisdicción</h3>
                    <p>Estos Términos se regirán por las leyes de Costa Rica. Cualquier disputa relacionada con estos Términos estará sujeta a la jurisdicción exclusiva de los tribunales de Costa Rica. Si un tribunal u otra autoridad competente determina que alguna parte de estos Términos es inválida o inaplicable, dicha parte será modificada o eliminada en la medida necesaria para preservar la intención original de los Términos, sin afectar la validez de las disposiciones restantes.</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-main-blue mb-4">23. Información de Contacto</h3>
                    <p className="mb-4">Este Sitio Web es propiedad y está gestionado por el IIRESODH. Puede contactarnos en relación con estos Términos y Condiciones escribiéndonos a la siguiente dirección de correo electrónico o postal:</p>
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm mt-4">
                      <p className="font-bold text-main-blue mb-2">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</p>
                      <p className="mb-2"><strong>Correo electrónico:</strong> <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
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