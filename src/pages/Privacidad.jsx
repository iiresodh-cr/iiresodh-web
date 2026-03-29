// src/pages/Privacidad.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";

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
    <main className="bg-white flex flex-col min-h-screen font-sans">
      
      {/* ENCABEZADO Estandarizado */}
      <PageHeader 
        titulo="Privacidad y Términos" 
        subtitulo="Transparencia y protección de datos para todos nuestros usuarios." 
      />

      <div className="relative overflow-hidden grow pb-20">
        {/* Marca de agua institucional */}
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative py-12 md:py-16 px-0 md:px-8 z-10" aria-label="Contenido legal">
          {/* Ancho homologado a max-w-7xl como en el resto del sitio */}
          <div className="max-w-7xl mx-auto">
            
            {/* Pestañas de Navegación alineadas al contenedor - Sombras eliminadas */}
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

            {/* Contenedor Legal - DISEÑO PLANO: Sin sombras ni bordes grises */}
            <div className="bg-white md:rounded-3xl p-8 md:p-12 lg:p-16">
              
              {/* =========================================
                  CONTENIDO: POLÍTICA GENERAL
              ========================================= */}
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
                  </section>

                  {/* ADVERTENCIA ESTRÍCTA SOBRE LIBROS DIGITALES */}
                  <aside className="bg-red-50 p-6 rounded-2xl mt-6 border border-red-100">
                    <p className="text-sm font-bold text-main-red leading-relaxed mb-2 uppercase tracking-tight">
                      Control de Acceso y Propiedad Intelectual:
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Al adquirir material bibliográfico en formato digital (PDF), el sistema registra su dirección IP y datos de transacci&oacute;n. IIRESODH implementa medidas tecnológicas de protección para prevenir la piratería. Cualquier intento de redistribución no autorizada será detectado y resultará en la inhabilitación inmediata del acceso sin posibilidad de reembolso, además de las acciones legales correspondientes.
                    </p>
                  </aside>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">2. Responsable del Tratamiento de sus Datos</h3>
                    <p>El responsable del tratamiento de sus datos personales es el <strong>Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</strong>, organización con domicilio en Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">3. ¿Qué Información Recopilamos?</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Información proporcionada directamente:</strong> Recopilamos datos personales cuando nos contacta, se inscribe en nuestras actividades, realiza una donación o adquiere libros digitales.</li>
                      <li><strong>Información de Compra:</strong> En la adquisición de archivos PDF, se procesa su correo electrónico para el envío del material y datos de facturación a través de plataformas de pago seguras.</li>
                    </ul>
                  </section>
                </article>
              )}

              {/* =========================================
                  CONTENIDO: AVISO PARA MÉXICO
              ========================================= */}
              {activeTab === "mexico" && (
                <article className={legalTextClass} role="tabpanel" aria-labelledby="tab-mexico">
                  <div className="border-b border-gray-100 pb-6 mb-8 text-center md:text-left">
                    <h2 className="text-2xl md:text-4xl font-bold text-main-blue mb-2">Aviso de Privacidad (MÉXICO)</h2>
                    <p className="text-xs md:text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 29 de marzo de 2026</p>
                  </div>
                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">1. Introducción y Marco Legal</h3>
                    <p className="mb-3">En estricto cumplimiento a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) aplicable en los Estados Unidos Mexicanos, se emite el presente Aviso de Privacidad para informar a los usuarios sobre el tratamiento de sus datos en <a href="https://iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors font-semibold">https://iiresodh.org</a>.</p>
                    <p className="bg-gray-50 p-4 rounded-xl text-sm italic">
                      Este aviso cubre la protección de sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) ante el tratamiento de datos derivados de la compra de publicaciones digitales y donaciones.
                    </p>
                  </section>
                </article>
              )}

              {/* =========================================
                  CONTENIDO: TÉRMINOS Y CONDICIONES
              ========================================= */}
              {activeTab === "terminos" && (
                <article className={legalTextClass} role="tabpanel" aria-labelledby="tab-terminos">
                  <header className="border-b border-gray-100 pb-6 mb-8 text-center md:text-left">
                    <h2 className="text-2xl md:text-4xl font-bold text-main-blue mb-2">Términos y Condiciones del Sitio Web</h2>
                    <p className="text-xs md:text-sm font-bold text-light-blue uppercase tracking-widest">Fecha de última actualización: 29 de marzo de 2026</p>
                  </header>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">1. Uso de Contenidos Digitales y Política Anti-Piratería</h3>
                    <p className="mb-4">Al adquirir o descargar material bibliográfico o académico en formato digital (PDF) de IIRESODH, usted acepta los siguientes términos de carácter vinculante y estricto:</p>
                    
                    <div className="space-y-4 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200">
                      <p><strong>A. Licencia de Uso Personal:</strong> La compra otorga una licencia de uso personal, no exclusiva e intransferible. El archivo está destinado únicamente para el estudio privado del adquirente.</p>
                      
                      <p><strong>B. Prohibición de Redistribución:</strong> Queda terminantemente prohibida la reproducción total o parcial, el alquiler, la venta, el préstamo, la carga en servidores públicos, la distribución en redes sociales o cualquier otra forma de comunicación pública de los archivos PDF suministrados.</p>
                      
                      <p><strong>C. Enlaces Temporales:</strong> Por seguridad, los enlaces de descarga proporcionados tras el pago tienen una validez de <strong>48 horas</strong>. Es responsabilidad del usuario descargar y resguardar su archivo en dicho plazo. No se generarán enlaces nuevos tras la expiración salvo por fallos técnicos comprobables del sistema.</p>
                      
                      <p className="text-main-red font-bold">D. Consecuencias de la Piratería: IIRESODH perseguirá legalmente cualquier infracción a sus derechos de autor. La distribución ilícita de nuestro material académico constituye un delito bajo las leyes de propiedad intelectual internacionales y regionales.</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">2. Propiedad Intelectual</h3>
                    <p>Todo el material contenido en este sitio, incluyendo pero no limitado a textos, logotipos, libros en PDF, diseños y código fuente, es propiedad exclusiva de IIRESODH o de sus autores. El uso no autorizado de estos elementos será sancionado conforme a la legislación civil y penal vigente.</p>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">3. Transacciones y Pagos</h3>
                    <p>IIRESODH utiliza pasarelas de pago cifradas de terceros. No almacenamos los datos de su tarjeta de crédito. Una vez procesado el pago con éxito, el sistema automatizado procederá al envío del material al correo electrónico proporcionado. Dada la naturaleza digital de los productos (PDF), no se aceptan cambios ni devoluciones una vez que el enlace de descarga ha sido generado.</p>
                  </section>

                  <section>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">4. Limitación de Responsabilidad</h3>
                    <p>IIRESODH no se hace responsable de las pérdidas de archivos por parte del usuario tras la descarga exitosa o el vencimiento del enlace de 48 horas. Tampoco garantizamos que el sitio web sea ininterrumpido o libre de errores, aunque nos esforzamos por mantener la máxima disponibilidad técnica.</p>
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