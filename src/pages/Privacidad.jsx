// src/pages/Privacidad.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";

// Importaciones de MUI
import { Tabs, Tab, Box } from '@mui/material';

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

export default function Privacidad() {
  const { t } = useTranslation(); // HOOK DE TRADUCCIÓN
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("privacidad");

  // Leer el parámetro de la URL para abrir la pestaña correcta y hacer scroll
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    
    if (tab === "terminos") {
      setActiveTab("terminos");
    } else {
      setActiveTab("privacidad");
    }
    
    window.scrollTo(0, 0);
  }, [location]);

  // Manejador para el componente Tabs de MUI
  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Constante para estandarizar la clase tipográfica institucional de los textos legales
  const legalTextClass = "space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify animate-fade-in-up";

  return (
    <div className="bg-white flex flex-col min-h-screen font-sans">
      
      {/* ENCABEZADO Estandarizado */}
      <PageHeader 
        titulo={t('privacidad.header_titulo', 'Privacidad y Términos')} 
        subtitulo={t('privacidad.header_subtitulo', 'Transparencia y protección de datos para todos nuestros usuarios.')} 
      />

      <div className="relative overflow-hidden grow pb-20">
        {/* Marca de agua institucional */}
        <div className="bg-watermark"></div>

        <section className="relative pt-4 md:pt-6 px-0 z-10">
          
          <div className="max-w-7xl mx-auto bg-white overflow-hidden">
            
            {/* PESTAÑAS DE NAVEGACIÓN MEJORADAS CON MUI */}
            <Box sx={{ width: '100%', pt: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center' }}>
              <Tabs
                value={activeTab}
                onChange={handleChangeTab}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                TabIndicatorProps={{
                  sx: { backgroundColor: '#B92F32', height: 3, borderRadius: '3px 3px 0 0' } 
                }}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  width: '100%',
                  '& .MuiTabs-flexContainer': {
                    justifyContent: { xs: 'flex-start', md: 'center' }
                  },
                  '& .MuiTab-root': {
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    letterSpacing: '0.1em',
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    fontFamily: '"Work Sans", sans-serif',
                    transition: 'all 0.3s',
                    px: { xs: 3, md: 6 },
                    py: 2.5,
                    '&.Mui-selected': {
                      color: '#1D3557', 
                    },
                    '&:hover': {
                      color: '#1D3557',
                      backgroundColor: 'rgba(29, 53, 87, 0.04)' 
                    }
                  }
                }}
              >
                <Tab label={t('privacidad.tab_integral', 'Política de Privacidad')} value="privacidad" />
                <Tab label={t('privacidad.tab_terminos', 'Términos de Uso')} value="terminos" />
              </Tabs>
            </Box>

            <div className="px-6 md:px-12 lg:px-16 pt-8 pb-12 w-full">
              
              {/* =========================================
                  CONTENIDO: POLÍTICA DE PRIVACIDAD INTEGRAL
              ========================================= */}
              {activeTab === "privacidad" && (
                <div className={legalTextClass}>
                  <div className="border-b border-gray-100 pb-6 mb-8 text-center md:text-left">
                    <h2 className="text-2xl md:text-4xl font-bold text-main-blue mb-2">{t('privacidad.titulo_integral', 'Política de Privacidad y Protección de Datos Personales')}</h2>
                    <p className="text-xs md:text-sm font-bold text-light-blue uppercase tracking-widest">{t('privacidad.subtitulo_integral', 'Estándares Interamericanos (OEA), Sede Costa Rica (Ley N° 8968 / PRODHAB) y Cláusulas Regionales')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('privacidad.ultima_act', 'Fecha de última actualización: 12 de septiembre de 2026')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">1. Introducción y Marco Normativo Interamericano</h3>
                    <p className="mb-3">Bienvenido a la Política de Privacidad del Instituto Internacional de Responsabilidad Social y Derechos Humanos (en adelante, “IIRESODH”, “nosotros” o “nuestro”).</p>
                    <p className="mb-3">Como organismo dedicado a la defensa de los derechos fundamentales, el litigio estratégico ante tribunales internacionales y la formación académica en América Latina y el mundo, el IIRESODH asume el más alto compromiso ético y legal en la salvaguarda de la privacidad y la autodeterminación informativa de sus usuarios, lectores, estudiantes, colaboradores y donantes.</p>
                    <p className="mb-3">El tratamiento de datos en este portal web (https://iiresodh.org) se rige primordialmente por la legislación de nuestra sede jurídica en la República de Costa Rica (<strong>Ley N° 8968</strong>, su Reglamento Decreto N° 37788-JP y la tutela de la <strong>PRODHAB</strong>), integrando armónicamente los <strong>Principios Actualizados sobre la Privacidad y la Protección de Datos Personales de la Organización de los Estados Americanos (OEA / Comité Jurídico Interamericano, CP/CAJP-3588/21)</strong>, así como las normativas protectoras aplicables en la región interamericana.</p>
                    <div className="bg-pale-blue/20 p-6 rounded-2xl mt-4">
                      <p className="text-sm font-medium text-main-blue leading-relaxed">
                        <strong>Nota sobre servicios externos:</strong> El servicio tecnológico asociado PIDA-AI (https://pida-ai.com) es gestionado por una entidad jurídica independiente y se rige estrictamente por su propia Política de Privacidad, disponible en su respectivo sitio web.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">2. Responsable del Tratamiento de sus Datos</h3>
                    <p className="mb-3">El responsable general y legal de las bases de datos personales generadas en este portal es:</p>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-3 space-y-1 text-sm md:text-base">
                      <p className="font-bold text-main-blue">Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)</p>
                      <p><strong>Cédula de persona jurídica:</strong> 3-002-671392</p>
                      <p><strong>Domicilio legal:</strong> Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
                      <p><strong>Correo electrónico para atención de privacidad y derechos ARCO:</strong> <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue font-bold transition-colors">contacto@iiresodh.org</a></p>
                    </div>
                    <p className="text-sm text-gray-600">Para las transacciones de libros y pasarela de pago Stripe, interviene conjuntamente IIRESODH PAYMENTS, LLC, con domicilio en 131 Continental Dr Suite 305, Newark, DE 19713, EE.UU.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">3. Datos Personales que Recopilamos y Prohibición de Datos Sensibles</h3>
                    <p className="mb-3">Recopilamos únicamente la información necesaria y pertinente para los fines legítimos de nuestra institución:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li><strong>Datos facilitados directamente por usted:</strong> Nombre completo, dirección de correo electrónico, país de residencia, institución de procedencia y el contenido de sus mensajes o solicitudes de orientación a través de nuestros formularios o inscripciones a actividades académicas.</li>
                      <li><strong>Datos de trazabilidad de compras bibliográficas:</strong> Para la adquisición de manuales y libros en formato PDF, IIRESODH PAYMENTS, LLC procesa identificadores de dispositivo, dirección IP y metadatos criptográficos estrictamente orientados a la protección de la propiedad intelectual, licenciamiento personal y prevención de piratería.</li>
                      <li><strong>Información técnica y analítica web consentida:</strong> Datos técnicos de navegación (tipo de navegador, páginas visitadas, métricas agregadas) a través de cookies técnicas esenciales y herramientas analíticas (Firebase Analytics) sujetas a su previo consentimiento.</li>
                    </ul>
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                      <p className="text-sm md:text-base font-semibold text-main-red mb-2 uppercase tracking-wide">Aviso Riguroso: Prohibición de Consignar Datos Sensibles</p>
                      <p className="text-sm md:text-base text-gray-800 leading-relaxed">
                        De conformidad con el artículo 9 de la Ley N° 8968 y el Principio 4 de la OEA, el IIRESODH <strong>NO solicita, no recaba ni trata datos personales sensibles</strong> (tales como origen racial o étnico, convicciones religiosas o filosóficas, opiniones políticas, afiliación sindical, información de salud o vida sexual). Le solicitamos abstenerse expresamente de compartir información sensible a través de nuestros formularios de contacto general o del asistente virtual IRENE.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">4. ¿Para Qué Utilizamos su Información? (Finalidades del Tratamiento)</h3>
                    <p className="font-bold mb-2 text-main-blue uppercase text-xs tracking-widest">Finalidades Primarias (Indispensables para la Relación con el Usuario):</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                      <li>Responder a consultas ciudadanas, orientación técnica y solicitudes de colaboración en derechos humanos enviadas por el formulario de contacto.</li>
                      <li>Gestionar la matrícula, control de asistencia y emisión de acreditaciones o diplomas en cursos, foros y eventos académicos de IIRESODH.</li>
                      <li>Procesar pedidos de material bibliográfico digital, generar enlaces de descarga segura y garantizar el licenciamiento personal anti-piratería.</li>
                    </ul>

                    <p className="font-bold mb-2 text-main-blue uppercase text-xs tracking-widest">Finalidades Secundarias (Requieren su Consentimiento Previo):</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Envío de boletines informativos institucionales, informes anuales y comunicados sobre derechos humanos.</li>
                      <li>Análisis estadístico anónimo para evaluar el impacto de nuestras publicaciones y optimizar el rendimiento del sitio web.</li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-600">Usted puede manifestar en cualquier momento su negativa al tratamiento de sus datos para Finalidades Secundarias enviando un correo a <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue underline font-bold">contacto@iiresodh.org</a>.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">5. Carácter Facultativo de la Entrega de Datos</h3>
                    <p className="mb-3">La entrega de sus datos personales a través de este portal es voluntaria y libre.</p>
                    <p><strong>Consecuencias de la negativa:</strong> La no facilitación de los datos básicos solicitados en los formularios (nombre y correo electrónico) tendrá como único efecto la imposibilidad material de atender su consulta, inscribirle en nuestras actividades o emitir y entregar los libros digitales adquiridos.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">6. Destinatarios y Transferencias Internacionales de Datos</h3>
                    <p className="mb-3">El IIRESODH <strong>no vende, no alquila, no cede ni comercializa</strong> sus datos personales con terceros para fines publicitarios o lucrativos.</p>
                    <p className="mb-3">Para la prestación de nuestros servicios digitales, realizamos transferencias internacionales indispensables a encargados tecnológicos internacionales que operan bajo rigurosos acuerdos de confidencialidad y estándares de seguridad:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Google Cloud Platform / Firebase (EE.UU.):</strong> Infraestructura de servidores seguros en la nube y base de datos con cifrado de punto a punto.</li>
                      <li><strong>Stripe / IIRESODH PAYMENTS, LLC (EE.UU.):</strong> Pasarela de pago certificada bajo el estándar bancario internacional PCI-DSS Nivel 1 para la compra de publicaciones.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">7. Seguridad de la Información</h3>
                    <p>El IIRESODH aplica estrictas medidas de seguridad técnicas, físicas y organizativas orientadas a prevenir la adulteración, pérdida, consulta indebida o acceso no autorizado a sus datos. Toda la comunicación entre su navegador y nuestro portal viaja cifrada mediante protocolos de seguridad SSL/TLS de alta graduación.</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">8. Sus Derechos (ARCO) y Procedimiento para Ejercerlos</h3>
                    <p className="mb-3">Todo usuario, sin importar su país de residencia, goza de los derechos de <strong>Acceso</strong>, <strong>Rectificación</strong>, <strong>Cancelación / Supresión</strong> y <strong>Oposición</strong> respecto a sus datos personales.</p>
                    <p className="mb-3">Para ejercer cualquiera de sus derechos, envíe una solicitud formal por escrito a:</p>
                    <p className="font-bold text-main-blue pl-6 mb-3"><a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors">contacto@iiresodh.org</a></p>
                    <p className="mb-2">La solicitud debe contener:</p>
                    <ol className="list-decimal pl-6 space-y-1 mb-4 font-medium text-gray-800">
                      <li>Nombre completo del titular y correo electrónico para recibir notificaciones.</li>
                      <li>Copia digital legible de su documento oficial de identidad (cédula, DIMEX, pasaporte o documento de identidad nacional).</li>
                      <li>Descripción clara del derecho que desea ejercer y los datos respecto de los cuales solicita la acción.</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">9. Disposiciones Específicas por Jurisdicción</h3>
                    <p className="mb-4">Para garantizar el estricto apego a las legislaciones locales de nuestros usuarios y clientes, se establecen las siguientes directrices complementarias:</p>

                    <div className="space-y-4">
                      {/* Costa Rica */}
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <h4 className="text-base font-bold text-main-blue mb-2">9.1. Costa Rica (Sede Legal - Ley N° 8968 y Decreto N° 37788-JP)</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm md:text-base mb-3">
                          <li><strong>Plazo perentorio de respuesta:</strong> Conforme al Artículo 32 del Reglamento a la Ley N° 8968, IIRESODH dará respuesta formal y motivada a toda solicitud ARCO en un plazo máximo de <strong>cinco (5) días hábiles</strong>.</li>
                          <li><strong>Tutela administrativa ante la PRODHAB:</strong> En caso de denegatoria, falta de respuesta en el plazo de ley o vulneración a su autodeterminación informativa, el titular puede interponer reclamo formal ante la <strong>Agencia de Protección de Datos de los Habitantes (PRODHAB)</strong>, órgano desconcentrado del Ministerio de Justicia y Paz de Costa Rica (sitio web: <a href="https://prodhab.go.cr" target="_blank" rel="noopener noreferrer" className="text-light-blue hover:text-main-blue underline font-bold">https://prodhab.go.cr</a>).</li>
                        </ul>
                      </div>

                      {/* México */}
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <h4 className="text-base font-bold text-main-blue mb-2">9.2. México (LFPDPPP)</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
                          <li>En estricto cumplimiento a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares aplicable a transacciones o actividades vinculadas a México, los usuarios pueden manifestar su negativa a finalidades secundarias o ejercer sus derechos ARCO ante el responsable institucional.</li>
                          <li>Autoridad reguladora competente: <strong>Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI)</strong>.</li>
                        </ul>
                      </div>

                      {/* Colombia */}
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <h4 className="text-base font-bold text-main-blue mb-2">9.3. Colombia (Ley Estatutaria 1581 de 2012)</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
                          <li>El tratamiento de datos de usuarios en Colombia se sustenta en la autorización previa, expresa e informada otorgada a través de las casillas de verificación de este portal.</li>
                          <li>Autoridad de supervisión de Hábeas Data: <strong>Superintendencia de Industria y Comercio (SIC)</strong>.</li>
                        </ul>
                      </div>

                      {/* OEA y Resto de las Américas */}
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <h4 className="text-base font-bold text-main-blue mb-2">9.4. Estados Miembros de la OEA y Comunidad Internacional</h4>
                        <p className="text-sm md:text-base leading-relaxed">
                          Para los usuarios de otros países de las Américas y la comunidad internacional, el IIRESODH aplica como marco vinculante y de tutela efectiva los <strong>Principios Jurídicos sobre Privacidad y Protección de Datos Personales de la OEA</strong>, asegurando los estándares universales de transparencia, lealtad, finalidad legítima y seguridad informática.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">10. Modificaciones y Contacto</h3>
                    <p className="mb-3">El IIRESODH se reserva el derecho de actualizar la presente Política de Privacidad para reflejar cambios en nuestras prácticas institucionales o en las regulaciones internacionales aplicables. La fecha de la última revisión constará siempre en el encabezado de este documento.</p>
                    <div className="bg-gray-50 p-8 rounded-2xl mt-4 text-left not-italic font-normal text-sm md:text-base border border-gray-100">
                      <p className="font-bold text-main-blue mb-1 uppercase tracking-tight">Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</p>
                      <p className="mb-1"><strong>Cédula de persona jurídica:</strong> 3-002-671392</p>
                      <p className="mb-1"><strong>Correo electrónico:</strong> <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors font-bold">contacto@iiresodh.org</a></p>
                      <p><strong>Dirección:</strong> Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
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
                    <h2 className="text-2xl md:text-4xl font-bold text-main-blue mb-2">{t('privacidad.term_titulo', 'Términos y Condiciones del Sitio Web')}</h2>
                    <p className="text-xs md:text-sm font-bold text-light-blue uppercase tracking-widest">{t('privacidad.ultima_act', 'Fecha de última actualización: 12 de septiembre de 2026')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec1_tit', '1. Introducción')}</h3>
                    <p>{t('privacidad.term_sec1_p1', 'Estos Términos y Condiciones (en adelante, los “Términos”) se aplican al uso de este sitio web, accesible en https://iiresodh.org (en adelante, el “Sitio Web”), y a las transacciones relacionadas con nuestros productos y servicios. Su relación con nosotros podría estar regida también por contratos adicionales. En caso de conflicto entre las disposiciones de estos Términos y las de cualquier contrato adicional, prevalecerán las disposiciones de dichos contratos adicionales.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec2_tit', '2. Aceptación de los Términos')}</h3>
                    <p>{t('privacidad.term_sec2_p1', 'Al registrarse, acceder o utilizar de cualquier forma este Sitio Web, usted acepta quedar vinculado por los Términos que se exponen a continuación. El mero uso del Sitio Web implica el conocimiento y la aceptación de estos Términos. En casos específicos, podremos solicitarle su aceptación explícita.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec3_tit', '3. Comunicación Electrónica')}</h3>
                    <p>{t('privacidad.term_sec3_p1', 'Al utilizar este Sitio Web o comunicarse con nosotros por medios electrónicos, usted acepta y reconoce que podemos comunicarnos con usted de forma electrónica a través de nuestro Sitio Web o mediante el envío de correos electrónicos. Asimismo, usted acepta que todos los acuerdos, avisos, divulgaciones y otras comunicaciones que le proporcionemos por medios electrónicos satisfacen cualquier requisito legal que exija que dichas comunicaciones sean por escrito.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec4_tit', '4. Propiedad Intelectual')}</h3>
                    <p className="mb-3">{t('privacidad.term_sec4_p1', 'Nosotros o nuestros licenciantes poseemos y controlamos todos los derechos de autor y otros derechos de propiedad intelectual sobre el Sitio Web, así como los datos, la información, el contenido y otros recursos mostrados o accesibles en él.')}</p>
                    
                    <h4 className="text-base md:text-lg font-bold text-main-red mt-5 mb-2">{t('privacidad.term_sec4_1_tit', '4.1. Política Estricta Anti-Piratería y Uso de Material Digital (PDF)')}</h4>
                    <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 mb-6 space-y-4">
                      <p className="font-bold text-main-blue">{t('privacidad.term_sec4_1_p1', 'Al adquirir o descargar material académico en formato PDF de IIRESODH, usted acepta los siguientes términos de carácter vinculante y estricto:')}</p>
                      <ul className="list-decimal pl-6 space-y-4 font-medium text-gray-800">
                        <li><strong>{t('privacidad.term_sec4_1_l1_tit', 'Licencia Unipersonal e Intransferible:')}</strong> {t('privacidad.term_sec4_1_l1_txt', 'La compra de un libro digital otorga únicamente una licencia de uso personal, privada y no exclusiva. Queda terminantemente prohibida su reproducción, venta, préstamo o comunicación pública.')}</li>
                        <li><strong>{t('privacidad.term_sec4_1_l2_tit', 'Prohibición de Redistribución Digital:')}</strong> {t('privacidad.term_sec4_1_l2_txt', 'No está permitido compartir, enviar por correo electrónico, subir a servidores de almacenamiento público (Drive, Dropbox, etc.), o publicar en redes sociales el archivo PDF adquirido.')}</li>
                        <li><strong>{t('privacidad.term_sec4_1_l3_tit', 'Trazabilidad y Rastreo Digital:')}</strong> {t('privacidad.term_sec4_1_l3_txt', 'IIRESODH emplea identificadores únicos, marcas de agua criptográficas y metadatos invisibles vinculados a la transacción de cada comprador. En caso de detectarse una copia en circulación ilegal, el adquirente original será identificado y denunciado judicialmente.')}</li>
                        <li><strong>{t('privacidad.term_sec4_1_l4_tit', 'Caducidad de los Enlaces de Descarga:')}</strong> {t('privacidad.term_sec4_1_l4_txt', 'Por seguridad de la propiedad intelectual, los enlaces enviados tienen una validez estricta de 48 horas. Es responsabilidad exclusiva del usuario resguardar su archivo en dicho plazo.')}</li>
                        <li><strong>{t('privacidad.term_sec4_1_l5_tit', 'Sanciones Legales:')}</strong> {t('privacidad.term_sec4_1_l5_txt', 'El incumplimiento de estas condiciones constituye un delito federal y activará acciones legales penales y civiles bajo las leyes internacionales de propiedad intelectual y el Código Penal correspondiente.')}</li>
                      </ul>
                    </div>

                    <h4 className="text-base md:text-lg font-bold text-main-blue mt-5 mb-2">{t('privacidad.term_sec4_2_tit', '4.2. Licencia Creative Commons')}</h4>
                    <p className="mb-3">{t('privacidad.term_sec4_2_p1', 'Salvo para el material bibliográfico de venta y descarga protegida detallado en el punto anterior, el contenido general informativo de este Sitio Web se encuentra bajo una licencia Creative Commons Atribución-NoComercial-SinDerivadas 4.0 Internacional (CC BY-NC-ND 4.0). Esto significa que usted es libre de compartir (copiar y redistribuir el material informativo en cualquier medio o formato) bajo los siguientes términos:')}</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>{t('privacidad.term_sec4_2_l1_tit', 'Atribución:')}</strong> {t('privacidad.term_sec4_2_l1_txt', 'Debe dar el crédito apropiado, proporcionar un enlace a la licencia e indicar si se han realizado cambios.')}</li>
                      <li><strong>{t('privacidad.term_sec4_2_l2_tit', 'NoComercial:')}</strong> {t('privacidad.term_sec4_2_l2_txt', 'No puede utilizar el material para una finalidad comercial.')}</li>
                      <li><strong>{t('privacidad.term_sec4_2_l3_tit', 'SinDerivadas:')}</strong> {t('privacidad.term_sec4_2_l3_txt', 'Si remezcla, transforma o crea a partir del material, no puede difundir el material modificado.')}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec5_tit', '5. Enlaces a Sitios Web de Terceros')}</h3>
                    <p className="mb-3">{t('privacidad.term_sec5_p1', 'Nuestro Sitio Web puede incluir hipervínculos u otras referencias a sitios web de terceros. No supervisamos ni revisamos el contenido de los sitios web de terceros enlazados desde este Sitio Web. Los productos o servicios ofrecidos por otros sitios web estarán sujetos a los Términos y Condiciones aplicables de dichos terceros. Las opiniones expresadas o el material que aparece en esos sitios no son necesariamente compartidos o respaldados por nosotros.')}</p>
                    <p>{t('privacidad.term_sec5_p2', 'No seremos responsables de las prácticas de privacidad ni del contenido de dichos sitios. Usted asume todos los riesgos asociados al uso de estos sitios web y de cualquier servicio de terceros relacionado. No aceptaremos responsabilidad alguna por cualquier pérdida o daño, independientemente de cómo se produzca, que resulte de la divulgación de su información personal a terceros.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec6_tit', '6. Uso Responsable')}</h3>
                    <p className="mb-3">{t('privacidad.term_sec6_p1', 'Al visitar nuestro Sitio Web, usted se compromete a utilizarlo únicamente para los fines previstos y conforme a lo permitido por estos Términos, los contratos adicionales que tenga con nosotros, las leyes y regulaciones aplicables, así como las prácticas en línea generalmente aceptadas y las directrices del sector.')}</p>
                    <p className="font-bold text-main-red mb-2 uppercase text-xs tracking-widest">{t('privacidad.term_sec6_p2', 'Queda estrictamente prohibido:')}</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>{t('privacidad.term_sec6_l1', 'Usar nuestro Sitio Web o servicios para utilizar, publicar o distribuir cualquier material que contenga o esté vinculado a software malicioso (malware).')}</li>
                      <li>{t('privacidad.term_sec6_l2', 'Utilizar los datos recogidos en nuestro Sitio Web para cualquier actividad de marketing directo.')}</li>
                      <li>{t('privacidad.term_sec6_l3', 'Realizar cualquier actividad de recopilación de datos, ya sea sistemática o automatizada, en nuestro Sitio Web o en relación con él.')}</li>
                      <li>{t('privacidad.term_sec6_l4', 'Realizar cualquier actividad que cause o pueda causar daños al Sitio Web, o que interfiera en su rendimiento, disponibilidad o accesibilidad.')}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec7_tit', '7. Registro de Cuenta')}</h3>
                    <p className="mb-3">{t('privacidad.term_sec7_p1', 'Puede registrarse para obtener una cuenta en nuestro Sitio Web. Durante este proceso, se le podría pedir que elija una contraseña. Usted es el único responsable de mantener la confidencialidad de su contraseña y de la información de su cuenta. Se compromete a no compartir sus credenciales (contraseña, información de cuenta o acceso seguro) con ninguna otra persona.')}</p>
                    <p className="mb-3">{t('privacidad.term_sec7_p2', 'No debe permitir que terceros utilicen su cuenta para acceder al Sitio Web, ya que usted es responsable de todas las actividades que se realicen a través de sus contraseñas o cuentas. Debe notificarnos inmediatamente si tiene conocimiento de cualquier divulgación o uso no autorizado de su contraseña.')}</p>
                    <p>{t('privacidad.term_sec7_p3', 'Tras la cancelación de su cuenta, no intentará registrar una nueva sin nuestro permiso explícito.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec8_tit', '8. Contenido Publicado por Usted')}</h3>
                    <p>{t('privacidad.term_sec8_p1', 'Podemos ofrecer herramientas de comunicación abierta en nuestro Sitio Web, como comentarios en blogs, foros, reseñas y servicios de redes sociales. Aunque no nos sea posible supervisar todo el contenido que usted u otros compartan, nos reservamos el derecho de revisar dicho contenido, supervisar el uso del Sitio Web y eliminar o rechazar cualquier contenido a nuestra entera discreción. Al publicar información o utilizar estas herramientas, usted garantiza que su contenido cumplirá con estos Términos, no será ilícito ni infringirá los derechos legales de ninguna persona.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec9_tit', '9. Envío de Ideas No Solicitadas')}</h3>
                    <p>{t('privacidad.term_sec9_p1', 'No nos envíe ideas, invenciones, obras de autor u otra información que pueda considerarse de su propiedad intelectual, a menos que hayamos firmado previamente un acuerdo sobre propiedad intelectual o un acuerdo de no divulgación. Si nos divulga contenido en ausencia de dicho acuerdo, nos otorga una licencia mundial, irrevocable, no exclusiva y libre de regalías para usar, reproducir, almacenar, adaptar, publicar, traducir y distribuir su contenido en cualquier medio existente o futuro.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec10_tit', '10. Terminación de Uso')}</h3>
                    <p>{t('privacidad.term_sec10_p1', 'Nos reservamos el derecho de modificar o interrumpir, a nuestra entera discreción y en cualquier momento, el acceso temporal o permanente al Sitio Web o a cualquiera de sus servicios. Usted acepta que no seremos responsables ante usted ni ante ningún tercero por dicha modificación, suspensión o interrupción de su acceso. No tendrá derecho a compensación alguna si se pierden permanentemente funciones, configuraciones o cualquier Contenido con el que usted haya contribuido. No debe eludir, evitar o intentar eludir ninguna medida de restricción de acceso en nuestro Sitio Web.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec11_tit', '11. Garantías y Responsabilidad')}</h3>
                    <p className="mb-3">{t('privacidad.term_sec11_p1', 'Este Sitio Web y todo su contenido se proporcionan “tal cual” y “según disponibilidad” y pueden contener imprecisiones o errores tipográficos. Renunciamos expresamente a toda garantía, ya sea expresa o implícita, en cuanto a la disponibilidad, exactitud o integridad del Contenido.')}</p>
                    <p className="font-bold text-main-blue mb-2 uppercase text-xs tracking-widest">{t('privacidad.term_sec11_p2', 'No garantizamos que:')}</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                      <li>{t('privacidad.term_sec11_l1', 'Este Sitio Web, o nuestros productos y servicios, satisfagan sus requisitos específicos.')}</li>
                      <li>{t('privacidad.term_sec11_l2', 'El acceso al Sitio Web sea ininterrumpido, oportuno, seguro o libre de errores.')}</li>
                      <li>{t('privacidad.term_sec11_l3', 'La calidad de cualquier producto o servicio adquirido a través de este Sitio Web cumpla con sus expectativas.')}</li>
                    </ul>
                    <p className="mb-3">{t('privacidad.term_sec11_p3', 'Las disposiciones de esta sección se aplicarán en la máxima medida permitida por la ley aplicable. En ningún caso seremos responsables de daños directos o indirectos (incluida la pérdida de beneficios, pérdida o corrupción de datos, software o bases de datos, o daños a la propiedad) sufridos por usted o por un tercero como resultado de su acceso o uso de nuestro Sitio Web.')}</p>
                    <p>{t('privacidad.term_sec11_p4', 'Salvo que un contrato adicional establezca lo contrario, nuestra máxima responsabilidad ante usted por todos los daños que surjan o estén relacionados con el Sitio Web, o con cualquier producto o servicio comercializado a través de él, se limitará al precio total que usted nos pagó para adquirir dichos productos o servicios, o para utilizar el Sitio Web. Este límite se aplicará de forma agregada a todas sus reclamaciones y acciones legales de cualquier naturaleza.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec12_tit', '12. Privacidad')}</h3>
                    <p className="mb-3">{t('privacidad.term_sec12_p1', 'Para acceder a nuestro Sitio Web o servicios, es posible que se le solicite información personal durante el proceso de registro. Usted se compromete a que toda la información proporcionada sea siempre precisa, correcta y actualizada.')}</p>
                    <p>{t('privacidad.term_sec12_p2', 'Nos tomamos muy en serio la protección de sus datos personales. Nuestra Política de Privacidad, que puede consultar en la pestaña de Política General de esta misma página, detalla cómo recopilamos, usamos y protegemos sus datos. No utilizaremos su dirección de correo electrónico para comunicaciones no solicitadas (spam).')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec13_tit', '13. Cumplimiento Legal y Restricciones Geográficas')}</h3>
                    <p>{t('privacidad.term_sec13_p1', 'Se prohíbe el acceso al Sitio Web desde territorios o países donde el contenido o la compra de productos o servicios vendidos en el Sitio Web sea ilegal. Usted no puede utilizar este Sitio Web en violación de las leyes y regulaciones de exportación de Costa Rica.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec14_tit', '14. Cesión')}</h3>
                    <p>{t('privacidad.term_sec14_p1', 'Usted no puede ceder, transferir o subcontratar ninguno de sus derechos u obligaciones bajo estos Términos, en su totalidad o en parte, a ningún tercero sin nuestro consentimiento previo por escrito. Cualquier intento de cesión que infrinja esta cláusula será nulo y sin efecto.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec15_tit', '15. Incumplimiento de estos Términos')}</h3>
                    <p>{t('privacidad.term_sec15_p1', 'Sin perjuicio de nuestros otros derechos, si usted incumple estos Términos de cualquier manera, incluyendo la violación a la política anti-piratería del material digital, podremos tomar las medidas que consideremos apropiadas para hacer frente a dicho incumplimiento. Estas medidas pueden incluir la suspensión temporal o permanente de su acceso al Sitio Web, el bloqueo de su cuenta de usuario, el contacto con su proveedor de servicios de Internet para que bloquee su acceso y/o el inicio de acciones legales penales y civiles en su contra.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec16_tit', '16. Fuerza Mayor')}</h3>
                    <p>{t('privacidad.term_sec16_p1', 'Exceptuando las obligaciones de pago, ningún retraso, fallo u omisión por parte de cualquiera de las partes en el cumplimiento de sus obligaciones se considerará un incumplimiento de estos Términos si dicho retraso, fallo u omisión se debe a una causa que escapa a su control razonable (fuerza mayor).')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec17_tit', '17. Indemnización')}</h3>
                    <p>{t('privacidad.term_sec17_p1', 'Usted se compromete a indemnizarnos, defendernos y eximirnos de toda responsabilidad ante cualquier reclamación, daño, pérdida y gasto relacionado con la violación por su parte de estos Términos y de las leyes aplicables, incluidos los derechos de propiedad intelectual y de privacidad. Usted nos reembolsará sin demora los daños, pérdidas, costos y gastos derivados de dichas reclamaciones.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec18_tit', '18. Renuncia')}</h3>
                    <p>{t('privacidad.term_sec18_p1', 'El hecho de no hacer cumplir alguna de las disposiciones de estos Términos o de no ejercer una opción de terminación no se interpretará como una renuncia a dichas disposiciones y no afectará su validez ni el derecho a hacerlas cumplir en el futuro.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec19_tit', '19. Idioma')}</h3>
                    <p>{t('privacidad.term_sec19_p1', 'Estos Términos se interpretarán y regirán exclusivamente en español. Todas las notificaciones y correspondencia se redactarán únicamente en este idioma.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec20_tit', '20. Acuerdo Completo')}</h3>
                    <p>{t('privacidad.term_sec20_p1', 'Estos Términos, junto con nuestra Política de Privacidad, constituyen el acuerdo completo entre usted y el IIRESODH en relación con el uso de este Sitio Web.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec21_tit', '21. Actualización de estos Términos')}</h3>
                    <p>{t('privacidad.term_sec21_p1', 'Podemos actualizar estos Términos periódicamente. Es su obligación revisarlos para verificar si existen cambios. La fecha indicada al principio de este documento corresponde a la última revisión. Los cambios entrarán en vigor en el momento de su publicación en el Sitio Web. Su uso continuado del Sitio Web tras la publicación de los cambios se considerará una aceptación de los nuevos Términos.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec22_tit', '22. Ley Aplicable y Jurisdicción')}</h3>
                    <p>{t('privacidad.term_sec22_p1', 'Estos Términos se regirán por las leyes de Costa Rica. Cualquier disputa relacionada con estos Términos estará sujeta a la jurisdicción exclusiva de los tribunales de Costa Rica. Si un tribunal u otra autoridad competente determina que alguna parte de estos Términos es inválida o inaplicable, dicha parte será modificada o eliminada en la medida necesaria para preservar la intención original de los Términos, sin afectar la validez de las disposiciones restantes.')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-main-blue mb-3">{t('privacidad.term_sec23_tit', '23. Información de Contacto')}</h3>
                    <p className="mb-4">{t('privacidad.term_sec23_p1', 'Este Sitio Web es propiedad y está gestionado por el IIRESODH. Puede contactarnos en relación con estos Términos y Condiciones escribiéndonos a la siguiente dirección de correo electrónico o postal:')}</p>
                    <div className="bg-gray-50 p-8 rounded-2xl mt-4 text-left not-italic font-normal text-sm md:text-base border border-gray-100">
                      <p className="font-bold text-main-blue mb-1 uppercase tracking-tight">Instituto Internacional de Responsabilidad Social y Derechos Humanos – IIRESODH</p>
                      <p className="mb-1"><strong>{t('privacidad.correo', 'Correo electrónico:')}</strong> <a href="mailto:contacto@iiresodh.org" className="text-light-blue hover:text-main-blue transition-colors font-bold">contacto@iiresodh.org</a></p>
                      <p><strong>{t('privacidad.direccion_postal', 'Dirección postal:')}</strong> Centro Corporativo San Rafael, piso 3, oficina 28, San José, CP-10203, Costa Rica.</p>
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