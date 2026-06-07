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
              
              {/* INTRODUCCIÓN ORIGINAL */}
              <div id="intro-litigio" className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-12">
                <p>
                  <strong className="font-extrabold text-main-blue">IIRESODH</strong> {t('litigio.intro_p1', 'fomenta activamente el litigio estratégico internacional en materia de derechos humanos. Capacitamos a ONGs, defensores de derechos humanos y otras organizaciones de la sociedad civil, con el fin de que hagan uso de los mecanismos judiciales y cuasi-judiciales que ofrecen los sistemas universales y regionales de protección.')} 
                </p>
                <p>
                  {t('litigio.intro_p2', 'Las capacitaciones son impartidas por expertos de gran prestigio, así como por personas que trabajan en los principales organismos y tribunales internacionales. También litigamos casos de situaciones generalizadas de violaciones de derechos humanos en distintos países.')}
                </p>
              </div>

              {/* NUEVA SECCIÓN: ¿Qué es el Litigio Estratégico Internacional? */}
              <section className="max-w-4xl mx-auto mb-12" aria-labelledby="que-es-titulo">
                <h2 id="que-es-titulo" className="text-2xl md:text-3xl font-extrabold text-main-blue mb-2">
                  {t('litigio.que_es_titulo', '¿Qué es el Litigio Estratégico Internacional?')}
                </h2>
                <h3 className="text-lg md:text-xl font-bold text-main-red mb-6">
                  {t('litigio.que_es_subtitulo', 'Justicia que transforma realidades, más allá de las fronteras.')}
                </h3>
                <div className="space-y-4 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify">
                  <p>
                    {t('litigio.que_es_p1', 'Cuando los caminos de la justicia local se agotan o fallan en proteger los derechos fundamentales, la comunidad internacional ofrece una última esperanza. El litigio estratégico internacional no busca únicamente resolver un caso individual; busca transformar el sistema desde la raíz.')}
                  </p>
                  <p>
                    {t('litigio.que_es_p2', 'Consiste en seleccionar y llevar casos emblemáticos ante organismos y tribunales internacionales (como el Sistema Interamericano de Derechos Humanos o las Naciones Unidas) para evidenciar violaciones sistemáticas de derechos humanos. Nuestro objetivo no es solo ganar un juicio, sino lograr un efecto multiplicador: crear precedentes legales que obliguen a los Estados a cambiar leyes injustas, reparar de forma integral a las víctimas y evitar que las injusticias se repitan.')}
                  </p>
                </div>
              </section>

              {/* NUEVA SECCIÓN: ¿Cómo lo hacemos? */}
              <section className="max-w-4xl mx-auto mb-12" aria-labelledby="como-hacemos-titulo">
                <h2 id="como-hacemos-titulo" className="text-2xl md:text-3xl font-extrabold text-main-blue mb-6">
                  {t('litigio.como_hacemos_titulo', '¿Cómo lo hacemos? El Poder del Pro-Bono')}
                </h2>
                <div className="space-y-4 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify">
                  <p>
                    {t('litigio.como_hacemos_p1', 'En nuestra organización creemos firmemente que el acceso a la justicia internacional no debe ser un privilegio de unos pocos. Por eso, dedicamos nuestro conocimiento, tiempo y recursos de manera totalmente gratuita (pro-bono) al servicio de personas, comunidades y colectivos en situación de vulnerabilidad.')}
                  </p>
                  <p>
                    {t('litigio.como_hacemos_p2', 'Asumimos la defensa técnica con los más altos estándares de excelencia jurídica, acompañando de forma integral a las víctimas y articulando esfuerzos con movimientos sociales. El litigio estratégico es nuestra forma de nivelar la balanza y poner el derecho internacional al servicio de la dignidad humana.')}
                  </p>
                </div>
              </section>

              {/* NUEVA SECCIÓN: Pilares y Cita */}
              <section className="max-w-4xl mx-auto mb-16" aria-labelledby="pilares-titulo">
                <h3 id="pilares-titulo" className="text-xl md:text-2xl font-extrabold text-main-blue mb-6">
                  {t('litigio.pilares_titulo', 'Los Tres Pilares de Nuestro Impacto:')}
                </h3>
                <ul className="space-y-4 text-base md:text-lg font-light text-gray-700 leading-relaxed mb-10 pl-0">
                  <li className="flex items-start">
                    <span className="text-main-red mr-3 font-bold mt-1">•</span>
                    <span>{t('litigio.pilar_1', 'Creación de Precedentes: Logramos fallos internacionales que sirven como "escudo legal" para proteger a miles de personas en situaciones similares.')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-main-red mr-3 font-bold mt-1">•</span>
                    <span>{t('litigio.pilar_2', 'Reforma Estructural: Presionamos a los Gobiernos para que modifiquen políticas públicas y leyes que vulneran los derechos humanos.')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-main-red mr-3 font-bold mt-1">•</span>
                    <span>{t('litigio.pilar_3', 'Visibilidad y Concientización: Llevamos las voces de las víctimas a los escenarios globales más importantes, rompiendo el silencio y la impunidad.')}</span>
                  </li>
                </ul>

                <blockquote className="border-l-4 border-main-red pl-6 md:pl-8 italic text-lg md:text-xl lg:text-2xl font-medium text-gray-800 my-8 py-2">
                  {t('litigio.cita_final', '"Buscamos que la victoria de una persona se convierta en la justicia de toda una comunidad."')}
                </blockquote>
              </section>

              {/* SECCIÓN ORIGINAL: Certificación */}
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

              {/* SECCIÓN ORIGINAL: Impacto y Acción */}
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