// src/pages/LitigioEstrategico.jsx
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

// IMPORTACIÓN DE LA IMAGEN
import imagenCIJ from "../assets/CIJ.webp";

export default function LitigioEstrategico() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans">
      
      {/* ENCABEZADO */}
      <PageHeader 
        titulo={t('litigio.header_titulo', 'Litigio Estratégico')} 
        subtitulo={t('litigio.header_subtitulo', 'Defensa activa y capacitación en los sistemas universales y regionales de protección.')} 
      />

      <div className="relative overflow-hidden grow pb-24">
        {/* Marca de agua de fondo */}
        <div className="bg-watermark opacity-40" aria-hidden="true"></div>

        <article className="relative pt-8 md:pt-12 px-6 md:px-12 lg:px-16 z-10 w-full max-w-7xl mx-auto animate-fade-in-up">
          
          {/* =========================================
              BLOQUE 1: INTRO + ¿QUÉ ES? + IMAGEN
          ========================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-16 lg:mb-24">
            
            {/* Columna Izquierda: Textos */}
            <div className="lg:col-span-7 space-y-10">
              
              {/* Lead Paragraph (Introducción) */}
              <div className="space-y-6 text-lg md:text-xl font-light text-gray-700 leading-relaxed text-justify">
                <p>
                  <strong className="font-extrabold text-main-blue">IIRESODH</strong> {t('litigio.intro_p1', 'impulsa el litigio estratégico internacional como una herramienta fundamental para la defensa y promoción de los derechos humanos. Proveemos formación altamente especializada a organizaciones no gubernamentales, defensores de derechos humanos y actores de la sociedad civil, empoderándolos en el uso de los mecanismos judiciales y cuasi-judiciales de los sistemas regionales y universales de protección.')} 
                </p>
                <p>
                  {t('litigio.intro_p2', 'Nuestros programas académicos están a cargo de expertos de prestigio global y funcionarios activos de los principales organismos y tribunales internacionales. Paralelamente, asumimos la representación legal en casos emblemáticos que involucran violaciones sistemáticas de derechos humanos en diversas jurisdicciones.')}
                </p>
              </div>

              {/* ¿Qué es el Litigio? */}
              <section aria-labelledby="que-es-titulo" className="pt-4 border-t border-gray-100">
                <h2 id="que-es-titulo" className="text-2xl md:text-3xl font-extrabold text-main-blue mb-2 tracking-tight">
                  {t('litigio.que_es_titulo', '¿Qué es el Litigio Estratégico Internacional?')}
                </h2>
                <h3 className="text-lg font-bold text-main-red mb-6 uppercase tracking-wider">
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
            </div>

            {/* Columna Derecha: Imagen CIJ */}
            <div className="lg:col-span-5 relative">
              <figure className="relative group w-full">
                {/* Sombra difuminada detrás de la imagen para darle tridimensionalidad */}
                <div className="absolute -inset-4 bg-linear-to-tr from-main-blue/20 to-main-red/10 rounded-[2.5rem] blur-xl opacity-60 transition duration-500 group-hover:opacity-100"></div>
                <img 
                  src={imagenCIJ} 
                  alt={t('litigio.alt_img_cij', 'Abogados de IIRESODH en la Corte Internacional de Justicia')} 
                  className="relative w-full h-auto object-cover rounded-3xl shadow-2xl border border-white/50 aspect-4/5 object-center"
                  loading="lazy"
                />
                <figcaption className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 text-sm py-3 px-5 rounded-xl shadow-lg border border-white text-center font-medium">
                  {t('litigio.caption_cij', 'Equipo legal de IIRESODH ante la Corte Internacional de Justicia.')}
                </figcaption>
              </figure>
            </div>
          </div>

          {/* =========================================
              BLOQUE 2: ¿CÓMO LO HACEMOS? Y PILARES
          ========================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-16 lg:mb-24">
            
            {/* Columna Izquierda: El Poder del Pro-Bono */}
            <section aria-labelledby="como-hacemos-titulo" className="bg-gray-50 p-8 md:p-10 rounded-3xl border border-gray-100 h-full">
              <div className="w-12 h-12 bg-main-blue/10 text-main-blue rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h2 id="como-hacemos-titulo" className="text-2xl font-extrabold text-main-blue mb-6">
                {t('litigio.como_hacemos_titulo', '¿Cómo lo hacemos? El Poder del Pro-Bono')}
              </h2>
              <div className="space-y-4 text-base lg:text-lg font-light text-gray-700 leading-relaxed text-justify">
                <p>
                  {t('litigio.como_hacemos_p1', 'En nuestra organización creemos firmemente que el acceso a la justicia internacional no debe ser un privilegio de unos pocos. Por eso, dedicamos nuestro conocimiento, tiempo y recursos de manera totalmente gratuita (pro-bono) al servicio de personas, comunidades y colectivos en situación de vulnerabilidad.')}
                </p>
                <p>
                  {t('litigio.como_hacemos_p2', 'Asumimos la defensa técnica con los más altos estándares de excelencia jurídica, acompañando de forma integral a las víctimas y articulando esfuerzos con movimientos sociales. El litigio estratégico es nuestra forma de nivelar la balanza y poner el derecho internacional al servicio de la dignidad humana.')}
                </p>
              </div>
            </section>

            {/* Columna Derecha: Los Tres Pilares */}
            <section aria-labelledby="pilares-titulo" className="flex flex-col justify-center">
              <h3 id="pilares-titulo" className="text-2xl font-extrabold text-main-blue mb-8">
                {t('litigio.pilares_titulo', 'Los Tres Pilares de Nuestro Impacto:')}
              </h3>
              <ul className="space-y-8 text-base lg:text-lg font-light text-gray-700 leading-relaxed pl-0">
                <li className="flex items-start group">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-main-red/10 text-main-red flex items-center justify-center font-bold mt-1 mr-4 group-hover:bg-main-red group-hover:text-white transition-colors">1</div>
                  <span>{t('litigio.pilar_1', 'Creación de Precedentes: Logramos fallos internacionales que sirven como "escudo legal" para proteger a miles de personas en situaciones similares.')}</span>
                </li>
                <li className="flex items-start group">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-main-red/10 text-main-red flex items-center justify-center font-bold mt-1 mr-4 group-hover:bg-main-red group-hover:text-white transition-colors">2</div>
                  <span>{t('litigio.pilar_2', 'Reforma Estructural: Presionamos a los Gobiernos para que modifiquen políticas públicas y leyes que vulneran los derechos humanos.')}</span>
                </li>
                <li className="flex items-start group">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-main-red/10 text-main-red flex items-center justify-center font-bold mt-1 mr-4 group-hover:bg-main-red group-hover:text-white transition-colors">3</div>
                  <span>{t('litigio.pilar_3', 'Visibilidad y Concientización: Llevamos las voces de las víctimas a los escenarios globales más importantes, rompiendo el silencio y la impunidad.')}</span>
                </li>
              </ul>
            </section>
          </div>

          {/* =========================================
              BLOQUE 3: CITA DE IMPACTO (FULL WIDTH)
          ========================================= */}
          <div className="max-w-5xl mx-auto text-center mb-16 lg:mb-24 px-4">
            <svg className="w-12 h-12 text-main-red/20 mx-auto mb-6" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-semibold text-main-blue leading-snug tracking-tight">
              {t('litigio.cita_final', '"Buscamos que la victoria de una persona se convierta en la justicia de toda una comunidad."')}
            </blockquote>
          </div>

          {/* =========================================
              BLOQUE 4: CERTIFICACIÓN
          ========================================= */}
          <section className="bg-white shadow-xl shadow-main-blue/5 border-l-8 border-l-main-red p-8 md:p-12 lg:p-16 rounded-2xl border-y border-r border-gray-100" aria-labelledby="certificacion-titulo">
            <div className="max-w-4xl mx-auto text-center mb-10">
              <h3 id="certificacion-titulo" className="text-2xl md:text-3xl font-extrabold text-main-blue mb-4">
                {t('litigio.certificacion_titulo', 'Certificación en Litigio Estratégico Internacional')}
              </h3>
              <div className="w-24 h-1 bg-main-red mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify">
              <p>
                {t('litigio.cert_p1_pt1', 'A través de nuestro programa insignia, la Certificación en Litigio Estratégico Internacional,')} <strong className="text-main-blue font-bold">{t('litigio.cert_p1_pt2', 'hemos dotado a más de 1,400 profesionales')}</strong> {t('litigio.cert_p1_pt3', 'con las herramientas técnicas y jurídicas necesarias para litigar ante la Corte Interamericana de Derechos Humanos, los Comités de la ONU y acceder a los Procedimientos Especiales de las Naciones Unidas.')}
              </p>
              <p>
                {t('litigio.cert_p2_pt1', 'Adicionalmente, impartimos una edición avanzada de esta')} <strong className="text-main-red font-bold">{t('litigio.cert_p2_pt2', 'Certificación con sede en Europa')}</strong>{t('litigio.cert_p2_pt3', ', diseñada para profundizar en los mandatos y procedimientos de la Corte Internacional de Justicia, la Corte Penal Internacional y el Tribunal Europeo de Derechos Humanos.')}
              </p>
            </div>
          </section>

        </article>
      </div>
    </main>
  );
}