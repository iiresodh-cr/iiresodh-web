// src/pages/Privacidad.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function Privacidad() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    
    if (tab === "general" || tab === "mexico" || tab === "terminos") {
      setActiveTab(tab);
    }
    
    window.scrollTo(0, 0);
  }, [location]);

  const legalTextClass = "space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify animate-fade-in-up";

  return (
    <main className="bg-white flex flex-col min-h-screen font-sans">
      
      <PageHeader 
        titulo="Privacidad y Términos" 
        subtitulo="Transparencia y protección de datos para todos nuestros usuarios." 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative py-12 md:py-16 px-0 md:px-8 z-10" aria-label="Contenido legal">
          <div className="max-w-7xl mx-auto">
            
            <nav className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-12 px-6 md:px-0" role="tablist" aria-label="Secciones legales">
              <button
                role="tab"
                aria-selected={activeTab === "general"}
                onClick={() => setActiveTab("general")}
                className={`py-3 px-8 rounded-full font-bold uppercase tracking-widest text-sm transition-all cursor-pointer ${
                  activeTab === "general"
                    ? "bg-main-blue text-white"
                    : "bg-white text-main-blue border border-gray-200 hover:bg-pale-blue hover:text-main-blue"
                }`}
              >
                Política General
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "mexico"}
                onClick={() => setActiveTab("mexico")}
                className={`py-3 px-8 rounded-full font-bold uppercase tracking-widest text-sm transition-all cursor-pointer ${
                  activeTab === "mexico"
                    ? "bg-main-red text-white"
                    : "bg-white text-main-red border border-gray-200 hover:bg-red-50 hover:border-main-red"
                }`}
              >
                Aviso para México
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "terminos"}
                onClick={() => setActiveTab("terminos")}
                className={`py-3 px-8 rounded-full font-bold uppercase tracking-widest text-sm transition-all cursor-pointer ${
                  activeTab === "terminos"
                    ? "bg-main-blue text-white"
                    : "bg-white text-main-blue border border-gray-200 hover:bg-pale-blue hover:text-main-blue"
                }`}
              >
                Términos de Uso
              </button>
            </nav>

            <div className="bg-white md:rounded-3xl p-8 md:p-12 lg:p-16">
              
              {/* POLÍTICA GENERAL */}
              {activeTab === "general" && (
                <article className={legalTextClass} role="tabpanel" aria-labelledby="tab-general">
                  <header className="border-b border-gray-100 pb-6 mb-8 text-center md:text-left">
                    <h2 className="text-2xl md:text-4xl font-bold text-main-blue mb-2">Política de Privacidad de IIRESODH</h2>
                    <p className="text-xs md:text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 29 de marzo de 2026</p>
                  </header>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">1. Introducción y Alcance</h3>
                    <p className="mb-3">Bienvenido a la Política de Privacidad del Instituto Internacional de Responsabilidad Social y Derechos Humanos (en adelante, “IIRESODH”, “nosotros” o “nuestro”).</p>
                    <p className="mb-3">Esta política describe cómo recopilamos, utilizamos, protegemos y compartimos su información personal cuando visita nuestro sitio web institucional (<a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors font-semibold">https://iiresodh.org</a>) y se comunica con nosotros.</p>
                    
                    <div className="bg-red-50 p-6 rounded-2xl mt-6 border border-red-100">
                      <p className="text-sm font-bold text-main-red mb-2 uppercase tracking-widest">Advertencia de Seguridad y Trazabilidad:</p>
                      <p className="text-sm text-gray-700 leading-relaxed italic">
                        Para la adquisición de material bibliográfico en formato PDF, IIRESODH registra la dirección IP, el nodo de conexión y los datos de identidad del adquirente. Cada archivo entregado cuenta con marcas de agua digitales e identificadores únicos vinculados a la transacción. El uso de este sitio implica la aceptación del monitoreo técnico para prevenir la redistribución ilícita.
                      </p>
                    </div>

                    <aside className="bg-pale-blue/20 p-6 rounded-2xl mt-6">
                      <p className="text-sm font-medium text-main-blue leading-relaxed">
                        <strong>Nota sobre servicios externos:</strong> El servicio tecnológico asociado PIDA-AI (<a href="https://pida-ai.com" target="_blank" rel="noopener noreferrer" className="text-light-blue hover:text-main-blue transition-colors">https://pida-ai.com</a>) es gestionado por una entidad jurídica independiente y se rige estrictamente por su propia Política de Privacidad, disponible en su respectivo sitio web.
                      </p>
                    </aside>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">2. Responsable del Tratamiento de sus Datos</h3>
                    <p>El responsable del tratamiento de sus datos personales es el <strong>Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</strong>, organización con domicilio en Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">3. ¿Qué Información Recopilamos?</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Información proporcionada directamente:</strong> Recopilamos datos personales cuando nos contacta, se inscribe en nuestras actividades o realiza una donación. Esto incluye su nombre, dirección de correo electrónico, país de residencia y el contenido de sus mensajes.</li>
                      <li><strong>Información recopilada automáticamente:</strong> Al navegar por nuestro sitio, recopilamos información técnica estándar (dirección IP, tipo de navegador, páginas visitadas) con fines de análisis y seguridad para mejorar nuestros servicios institucionales.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">4. ¿Para Qué Utilizamos su Información? (Fines y Base Legal)</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Atención y Comunicación:</strong> Responder a sus consultas, solicitudes de información y gestionar inscripciones a nuestros programas. (Base legal: Consentimiento).</li>
                      <li><strong>Difusión Institucional:</strong> Envío de boletines informativos o noticias sobre nuestras labores en defensa de los derechos humanos, siempre que usted haya aceptado recibirlos. (Base legal: Consentimiento).</li>
                      <li><strong>Mantenimiento y Seguridad:</strong> Analizar el tráfico de nuestro sitio para optimizar la experiencia de usuario y prevenir fraudes informáticos. (Base legal: Interés legítimo).</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">5. ¿Con Quién Compartimos su Información?</h3>
                    <p className="mb-3">IIRESODH no vende, alquila ni comercializa su información personal bajo ninguna circunstancia. Solo la compartimos en casos estrictamente necesarios:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Proveedores Tecnológicos:</strong> Empresas que nos brindan servicios de alojamiento web (hosting) o plataformas para el envío de boletines, quienes operan bajo estrictos acuerdos de confidencialidad.</li>
                      <li><strong>Obligación Legal:</strong> Cuando una autoridad competente lo requiera en el marco de la ley y el debido proceso jurisdiccional.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">6. Seguridad de su Información</h3>
                    <p>IIRESODH aplica medidas de seguridad técnicas y organizativas para proteger su información contra accesos no autorizados, pérdida o alteración. Nuestro sitio utiliza certificados SSL para cifrar la información durante la transmisión, protegiendo así su privacidad.</p>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">7. Retención de Datos</h3>
                    <p>Conservaremos sus datos personales únicamente durante el tiempo que sea necesario para cumplir con las finalidades descritas en esta política o para dar cumplimiento a obligaciones legales o fiscales vigentes aplicables a la institución.</p>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">8. Sus Derechos</h3>
                    <p className="mb-3">Como usuario, usted tiene derecho a Acceder a sus datos, Rectificarlos si son incorrectos, solicitar su Supresión, u Oponerse a ciertos tratamientos (como darse de baja de nuestros boletines). Para ejercer sus derechos, por favor escríbanos a:</p>
                    <p className="font-bold text-main-blue pl-6"><a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">9. Modificaciones</h3>
                    <p>IIRESODH se reserva el derecho de actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas institucionales o en la normativa aplicable. La fecha de la última revisión se publicará siempre en la parte superior de esta página.</p>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">10. Contacto</h3>
                    <address className="bg-gray-50 p-8 rounded-2xl mt-4 text-left not-italic font-normal text-sm md:text-base border border-gray-100">
                      <p className="font-bold text-main-blue mb-1 uppercase tracking-tight">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</p>
                      <p className="mb-1"><strong>Correo electrónico:</strong> <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
                      <p><strong>Dirección Sede Central:</strong> Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                    </address>
                  </section>
                </article>
              )}

              {/* AVISO PARA MÉXICO */}
              {activeTab === "mexico" && (
                <article className={legalTextClass} role="tabpanel" aria-labelledby="tab-mexico">
                  <div className="border-b border-gray-100 pb-6 mb-8 text-center md:text-left">
                    <h2 className="text-2xl md:text-4xl font-bold text-main-blue mb-2">Aviso de Privacidad (MÉXICO)</h2>
                    <p className="text-xs md:text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 29 de marzo de 2026</p>
                  </div>
                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">1. Introducción y Marco Legal</h3>
                    <p className="mb-3">En estricto cumplimiento a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) aplicable en los Estados Unidos Mexicanos, se emite el presente Aviso de Privacidad para informar a los usuarios (en adelante, el “Titular”) sobre el tratamiento de sus datos en el sitio web institucional: <a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors font-semibold">https://iiresodh.org</a>.</p>
                    
                    <p className="mt-4 bg-gray-50 p-6 rounded-xl text-sm border-l-4 border-main-red leading-relaxed">
                      <strong>Cláusula de Protección de Activos Digitales:</strong> En términos de la LFPDPPP, se informa que el tratamiento de datos personales para la entrega de publicaciones digitales incluye la validación de integridad del archivo y el registro de metadatos de acceso. Cualquier intento de vulnerar los sistemas de protección de propiedad intelectual o la redistribución no autorizada será reportada ante las autoridades competentes por constituir una violación a los derechos de autor y el uso indebido de activos institucionales.
                    </p>
                  </section>
                </article>
              )}

              {/* TÉRMINOS Y CONDICIONES */}
              {activeTab === "terminos" && (
                <article className={legalTextClass} role="tabpanel" aria-labelledby="tab-terminos">
                  <header className="border-b border-gray-100 pb-6 mb-8 text-center md:text-left">
                    <h2 className="text-2xl md:text-4xl font-bold text-main-blue mb-2">Términos y Condiciones del Sitio Web</h2>
                    <p className="text-xs md:text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 29 de marzo de 2026</p>
                  </header>
                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">1. Introducción</h3>
                    <p className="mb-6">Estos Términos y Condiciones (en adelante, los “Términos”) se aplican al uso de este sitio web, accesible en <a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors font-bold">https://iiresodh.org</a> (en adelante, el “Sitio Web”), y a las transacciones relacionadas con nuestros productos y servicios.</p>
                    
                    <h3 className="text-lg md:text-xl font-bold text-main-red mb-3 uppercase tracking-tighter">2. Política Estricta Anti-Piratería y Propiedad Intelectual</h3>
                    <div className="space-y-4 bg-gray-50 p-8 rounded-2xl border border-gray-200 mb-8">
                      <p><strong>A. Licencia Intransferible:</strong> La adquisición de un manual o libro en formato PDF otorga una licencia de uso <strong>personal, privada y no exclusiva</strong>. Queda terminantemente prohibido compartir, distribuir, enviar por correo, cargar en servidores públicos o redes sociales el material adquirido.</p>
                      <p><strong>B. Enlaces de Descarga:</strong> Por seguridad de la propiedad intelectual, el enlace de descarga enviado tras la compra caduca exactamente **48 horas** después de la transacción. Es responsabilidad exclusiva del usuario descargar y resguardar el archivo en su dispositivo personal antes de este plazo.</p>
                      <p><strong>C. Consecuencias Legales:</strong> La detección de cualquier copia de nuestro material académico en circulación pública o privada no autorizada facultará a IIRESODH para iniciar de inmediato acciones legales penales y civiles contra el comprador original por violación a los derechos de autor internacionales.</p>
                    </div>
                  </section>
                </article>
              )}

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}