// src/pages/LitigioEstrategico.jsx
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

export default function LitigioEstrategico() {
  const { t } = useTranslation(); // HOOK DE TRADUCCIÓN

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* ENCABEZADO Estandarizado */}
      <PageHeader 
        titulo={t('litigio.header_titulo', 'Litigio Estratégico')} 
        subtitulo={t('litigio.header_subtitulo', 'Defensa activa y capacitación en los sistemas universales y regionales de protección.')} 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative pt-4 md:pt-6 px-0 z-10" aria-labelledby="intro-litigio">
          <div className="max-w-7xl mx-auto bg-white overflow-hidden">
            <div className="px-6 md:px-12 lg:px-16 pt-4 md:pt-6 pb-12 animate-fade-in-up w-full">
              
              <div id="intro-litigio" className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-12">
                <p>
                  <strong className="font-extrabold text-main-blue">IIRESODH</strong> {t('litigio.intro_p1', 'fomenta activamente el litigio estratégico internacional en materia de derechos humanos. Capacitamos a ONGs, defensores de derechos humanos y otras organizaciones de la sociedad civil, con el fin de que hagan uso de los mecanismos judiciales y cuasi-judiciales que ofrecen los sistemas universales y regionales de protección.')} 
                </p>
                <p>
                  {t('litigio.intro_p2', 'Las capacitaciones son impartidas por expertos de gran prestigio, así como por personas que trabajan en los principales organismos y tribunales internacionales. También litigamos casos de situaciones generalizadas de violaciones de derechos humanos en distintos países.')}
                </p>
              </div>

              <section className="bg-gray-50 border-l-4 border-l-main-red p-8 md:p-10 rounded-r-xl mb-12 border-y border-r border-gray-100" aria-labelledby="certificacion-titulo">
                <h3 id="certificacion-titulo" className="text-xl md:text-2xl font-extrabold text-main-blue mb-4">
                  {t('litigio.certificacion_titulo', 'Certificación en Litigio Estratégico Internacional')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify">
                  <p>
                    {t('litigio.cert_p1_pt1', 'Por medio de la Certificación en litigio estratégico internacional,')} <strong className="text-main-blue font-bold">{t('litigio.cert_p1_pt2', 'más de mil cuatrocientas personas')}</strong> {t('litigio.cert_p1_pt3', 'cuentan ahora con la herramienta para litigar ante la Corte Interamericana y los Comités de la ONU, así como para acudir a los procedimientos especiales de Naciones Unidas.')}
                  </p>
                  <p>
                    {t('litigio.cert_p2_pt1', 'Impartimos también una')} <strong className="text-main-red font-bold">{t('litigio.cert_p2_pt2', 'Certificación de Litigio que se lleva a cabo en Europa')}</strong>{t('litigio.cert_p2_pt3', ', que profundiza en los mandatos de la Corte Internacional de Justicia, la Corte Penal Internacional y el Tribunal Europeo de Derechos Humanos.')}
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center pt-6">
                <section aria-labelledby="impacto-titulo">
                  <h3 id="impacto-titulo" className="text-2xl md:text-3xl font-extrabold text-main-blue mb-6 tracking-tight uppercase">
                    {t('litigio.impacto_titulo', 'Nuestro Impacto Global')}
                  </h3>
                  <p className="text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify">
                    {t('litigio.impacto_texto', 'El trabajo del IIRESODH en el litigio estratégico ha tenido un impacto positivo en México, Panamá, Costa Rica, El Salvador, Colombia, Guatemala, Argentina y Nicaragua, así como en algunos países de África y Europa.')}
                  </p>
                </section>
                
                <section className="bg-pale-blue/10 p-8 md:p-10 rounded-2xl h-full flex flex-col justify-center border border-pale-blue/20" aria-labelledby="accion-nacional-titulo">
                  <h4 id="accion-nacional-titulo" className="text-xl font-extrabold text-main-blue mb-4 flex items-center gap-3 uppercase tracking-tight">
                    <svg className="w-8 h-8 text-main-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                    </svg>
                    {t('litigio.accion_nacional_titulo', 'Acción a Nivel Nacional')}
                  </h4>
                  <p className="text-base md:text-lg font-light text-gray-700 leading-relaxed">
                    {t('litigio.accion_nacional_pt1', 'Además, en')} <strong className="text-main-blue font-bold">{t('litigio.accion_nacional_pt2', 'México, Costa Rica y El Salvador')}</strong> {t('litigio.accion_nacional_pt3', 'realizamos litigios y asesorías en materia constitucional y afines.')}
                  </p>
                </section>
              </div>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}