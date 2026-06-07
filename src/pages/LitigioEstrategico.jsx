// src/pages/LitigioEstrategico.jsx
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

// IMPORTACIÓN DE LA IMAGEN
import imagenCIJ from "../assets/CIJ.webp";

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
              
              {/* INTRODUCCIÓN MEJORADA */}
              <div id="intro-litigio" className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify mb-16">
                <p>
                  <strong className="font-extrabold text-main-blue">IIRESODH</strong> {t('litigio.intro_p1', 'impulsa el litigio estratégico internacional como una herramienta fundamental para la defensa y promoción de los derechos humanos. Proveemos formación altamente especializada a organizaciones no gubernamentales, defensores de derechos humanos y actores de la sociedad civil, empoderándolos en el uso de los mecanismos judiciales y cuasi-judiciales de los sistemas regionales y universales de protección.')} 
                </p>
                <p>
                  {t('litigio.intro_p2', 'Nuestros programas académicos están a cargo de expertos de prestigio global y funcionarios activos de los principales organismos y tribunales internacionales. Paralelamente, asumimos la representación legal en casos emblemáticos que involucran violaciones sistemáticas de derechos humanos en diversas jurisdicciones.')}
                </p>
              </div>

              {/* CONTENEDOR CON GRID: TEXTO IZQUIERDA / IMAGEN DERECHA */}
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-16">
                
                {/* COLUMNA DE TEXTOS */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-12">
                  
                  {/* SECCIÓN: ¿Qué es el Litigio Estratégico Internacional? */}
                  <section aria-labelledby="que-es-titulo">
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

                  {/* SECCIÓN: ¿Cómo lo hacemos? */}
                  <section aria-labelledby="como-hacemos-titulo">
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

                  {/* SECCIÓN: Pilares y Cita */}
                  <section aria-labelledby="pilares-titulo">
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
                </div>

                {/* COLUMNA DE IMAGEN */}
                <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0">
                  <figure className="relative group">
                    <div className="absolute -inset-2 bg-linear-to-r from-main-blue/20 to-main-red/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                    <img 
                      src={imagenCIJ} 
                      alt={t('litigio.alt_img_cij', 'Abogados de IIRESODH en la Corte Internacional de Justicia')} 
                      className="relative w-full h-auto rounded-2xl shadow-xl border border-gray-100 object-cover aspect-square"
                      width="900"
                      height="900"
                      loading="lazy"
                    />
                    <figcaption className="text-sm md:text-base text-gray-500 mt-4 text-center italic px-2">
                      {t('litigio.caption_cij', 'Equipo legal de IIRESODH ante la Corte Internacional de Justicia.')}
                    </figcaption>
                  </figure>
                </div>

              </div>

              {/* SECCIÓN MEJORADA: Certificación */}
              <section className="max-w-6xl mx-auto bg-gray-50 border-l-4 border-l-main-red p-8 md:p-10 rounded-r-xl border-y border-r border-gray-100" aria-labelledby="certificacion-titulo">
                <h3 id="certificacion-titulo" className="text-xl md:text-2xl font-extrabold text-main-blue mb-4">
                  {t('litigio.certificacion_titulo', 'Certificación en Litigio Estratégico Internacional')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify">
                  <p>
                    {t('litigio.cert_p1_pt1', 'A través de nuestro programa insignia, la Certificación en Litigio Estratégico Internacional,')} <strong className="text-main-blue font-bold">{t('litigio.cert_p1_pt2', 'hemos dotado a más de 1,400 profesionales')}</strong> {t('litigio.cert_p1_pt3', 'con las herramientas técnicas y jurídicas necesarias para litigar ante la Corte Interamericana de Derechos Humanos, los Comités de la ONU y acceder a los Procedimientos Especiales de las Naciones Unidas.')}
                  </p>
                  <p>
                    {t('litigio.cert_p2_pt1', 'Adicionalmente, impartimos una edición avanzada de esta')} <strong className="text-main-red font-bold">{t('litigio.cert_p2_pt2', 'Certificación con sede en Europa')}</strong>{t('litigio.cert_p2_pt3', ', diseñada para profundizar en los mandatos y procedimientos de la Corte Internacional de Justicia, la Corte Penal Internacional y el Tribunal Europeo de Derechos Humanos.')}
                  </p>
                </div>
              </section>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}