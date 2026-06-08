// src/pages/LitigioEstrategico.jsx
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { Paper } from "@mui/material";

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

// IMPORTACIÓN DE LA IMAGEN
import imagenCIJ from "../assets/CIJ.webp";

export default function LitigioEstrategico() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Función auxiliar para separar el título del contenido en los pilares
  const renderPilar = (textoCompleto, numero) => {
    const partes = textoCompleto.split(':');
    const titulo = partes[0];
    const contenido = partes.slice(1).join(':').trim();

    return (
      <Paper elevation={0} className="flex flex-col bg-gray-50/50 p-8 border border-gray-100 hover:border-main-red/30 hover:shadow-md transition-all duration-300 h-full" sx={{ borderRadius: '20px' }}>
        <h3 className="text-xl font-bold text-main-blue mb-3 flex items-center gap-3 tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-main-red text-white flex items-center justify-center shrink-0 font-black text-sm" aria-hidden="true">
            {numero}
          </div>
          {titulo}
        </h3>
        <p className="text-gray-500 font-light leading-relaxed text-sm text-justify">
          {contenido}
        </p>
      </Paper>
    );
  };

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden">
      
      <PageHeader 
        titulo={t('litigio.header_titulo', 'Litigio Estratégico')} 
        subtitulo={t('litigio.header_subtitulo', 'Defensa activa y capacitación en los sistemas universales y regionales de protección.')} 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative z-10 max-w-7xl mx-auto bg-white px-6 md:px-12 pt-12 pb-16 flex flex-col gap-16 md:gap-20">
          
          {/* =========================================
              BLOQUE 1: INTRODUCCIÓN
          ========================================= */}
          <div id="intro-litigio" className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify animate-fade-in-up">
            <p>
              <strong className="font-semibold text-main-blue">IIRESODH</strong> {t('litigio.intro_p1', 'impulsa el litigio estratégico internacional como una herramienta fundamental para la defensa y promoción de los derechos humanos. Proveemos formación altamente especializada a organizaciones no gubernamentales, defensores de derechos humanos y actores de la sociedad civil, empoderándolos en el uso de los mecanismos judiciales y cuasi-judiciales de los sistemas regionales y universales de protección.')} 
            </p>
            <p>
              {t('litigio.intro_p2', 'Nuestros programas académicos están a cargo de expertos de prestigio global y funcionarios activos de los principales organismos y tribunales internacionales. Paralelamente, asumimos la representación legal en casos emblemáticos que involucran violaciones sistemáticas de derechos humanos en diversas jurisdicciones.')}
            </p>
          </div>

          <div className="w-20 h-1 bg-main-red mx-auto rounded-full"></div>

          {/* =========================================
              BLOQUE 2: ¿QUÉ ES? + IMAGEN CIJ
          ========================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-main-red font-black tracking-[0.3em] uppercase text-xs mb-3 block">
                {t('litigio.que_es_subtitulo', 'Justicia que transforma realidades, más allá de las fronteras.')}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-main-blue tracking-tighter mb-6">
                {t('litigio.que_es_titulo', '¿Qué es el Litigio Estratégico Internacional?')}
              </h2>
              <div className="space-y-4 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify">
                <p>
                  {t('litigio.que_es_p1', 'Cuando los caminos de la justicia local se agotan o fallan en proteger los derechos fundamentales, la comunidad internacional ofrece una última esperanza. El litigio estratégico internacional no busca únicamente resolver un caso individual; busca transformar el sistema desde la raíz.')}
                </p>
                <p>
                  {t('litigio.que_es_p2', 'Consiste en seleccionar y llevar casos emblemáticos ante organismos y tribunales internacionales (como el Sistema Interamericano de Derechos Humanos o las Naciones Unidas) para evidenciar violaciones sistemáticas de derechos humanos. Nuestro objetivo no es solo ganar un juicio, sino lograr un efecto multiplicador: crear precedentes legales que obliguen a los Estados a cambiar leyes injustas, reparar de forma integral a las víctimas y evitar que las injusticias se repitan.')}
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2 w-full flex justify-center">
              <Paper elevation={0} className="w-full rounded-3xl overflow-hidden shadow-lg bg-black border border-gray-100" sx={{ borderRadius: '4px' }}>
                <img 
                  src={imagenCIJ} 
                  alt={t('litigio.alt_img_cij', 'Abogados de IIRESODH en la Corte Internacional de Justicia')} 
                  className="w-full h-auto object-cover aspect-4/3 md:aspect-video lg:aspect-square"
                  loading="lazy"
                />
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm font-medium text-gray-600 italic">
                  {t('litigio.caption_cij', 'Equipo legal de IIRESODH ante la Corte Internacional de Justicia.')}
                </div>
              </Paper>
            </div>
          </div>

          <div className="w-16 h-1 bg-main-red mx-auto rounded-full"></div>

          {/* =========================================
              BLOQUE 3: CÓMO LO HACEMOS (PRO-BONO)
          ========================================= */}
          <div className="max-w-4xl mx-auto space-y-6 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-8 uppercase tracking-tighter text-main-blue">
              {t('litigio.como_hacemos_titulo', '¿Cómo lo hacemos? El Poder del Pro-Bono')}
            </h2>
            <p>
              {t('litigio.como_hacemos_p1', 'En nuestra organización creemos firmemente que el acceso a la justicia internacional no debe ser un privilegio de unos pocos. Por eso, dedicamos nuestro conocimiento, tiempo y recursos de manera totalmente gratuita (pro-bono) al servicio de personas, comunidades y colectivos en situación de vulnerabilidad.')}
            </p>
            <p>
              {t('litigio.como_hacemos_p2', 'Asumimos la defensa técnica con los más altos estándares de excelencia jurídica, acompañando de forma integral a las víctimas y articulando esfuerzos con movimientos sociales. El litigio estratégico es nuestra forma de nivelar la balanza y poner el derecho internacional al servicio de la dignidad humana.')}
            </p>
          </div>

          <div className="w-16 h-1 bg-main-red mx-auto rounded-full"></div>

          {/* =========================================
              BLOQUE 4: LOS TRES PILARES
          ========================================= */}
          <section aria-labelledby="pilares-titulo">
            <div className="text-center mb-12">
              <h2 id="pilares-titulo" className="text-3xl md:text-4xl font-black text-main-blue uppercase tracking-tighter">
                {t('litigio.pilares_titulo', 'Los Tres Pilares de Nuestro Impacto:')}
              </h2>
              <div className="w-16 h-1 bg-main-red mx-auto mt-4 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {renderPilar(t('litigio.pilar_1', 'Creación de Precedentes: Logramos fallos internacionales que sirven como "escudo legal" para proteger a miles de personas en situaciones similares.'), 1)}
              {renderPilar(t('litigio.pilar_2', 'Reforma Estructural: Presionamos a los Gobiernos para que modifiquen políticas públicas y leyes que vulneran los derechos humanos.'), 2)}
              {renderPilar(t('litigio.pilar_3', 'Visibilidad y Concientización: Llevamos las voces de las víctimas a los escenarios globales más importantes, rompiendo el silencio y la impunidad.'), 3)}
            </div>

            <div className="max-w-4xl mx-auto text-center">
              <blockquote className="text-xl md:text-2xl font-bold text-main-blue italic px-6 py-4 bg-gray-50 border-l-4 border-r-4 border-main-red rounded-lg">
                {t('litigio.cita_final', '"Buscamos que la victoria de una persona se convierta en la justicia de toda una comunidad."')}
              </blockquote>
            </div>
          </section>

          <div className="w-16 h-1 bg-main-red mx-auto rounded-full"></div>

          {/* =========================================
              BLOQUE 5: CERTIFICACIÓN
          ========================================= */}
          <article className="bg-gray-50 border-l-4 border-main-red p-8 md:p-10 rounded-r-2xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-extrabold text-main-blue mb-6 uppercase tracking-wider flex items-center gap-3">
              <span className="bg-main-red text-white w-10 h-10 flex items-center justify-center rounded-xl text-lg font-black shadow-sm" aria-hidden="true">C</span>
              {t('litigio.certificacion_titulo', 'Certificación en Litigio Estratégico Internacional')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base md:text-lg font-light text-gray-700 leading-relaxed text-justify">
              <p>
                {t('litigio.cert_p1_pt1', 'A través de nuestro programa insignia, la Certificación en Litigio Estratégico Internacional,')} <strong className="text-main-blue font-bold">{t('litigio.cert_p1_pt2', 'hemos dotado a más de 1,400 profesionales')}</strong> {t('litigio.cert_p1_pt3', 'con las herramientas técnicas y jurídicas necesarias para litigar ante la Corte Interamericana de Derechos Humanos, los Comités de la ONU y acceder a los Procedimientos Especiales de las Naciones Unidas.')}
              </p>
              <p>
                {t('litigio.cert_p2_pt1', 'Adicionalmente, impartimos una edición avanzada de esta')} <strong className="text-main-red font-bold">{t('litigio.cert_p2_pt2', 'Certificación con sede en Europa')}</strong>{t('litigio.cert_p2_pt3', ', diseñada para profundizar en los mandatos y procedimientos de la Corte Internacional de Justicia, la Corte Penal Internacional y el Tribunal Europeo de Derechos Humanos.')}
              </p>
            </div>
          </article>

        </section>
      </div>
    </main>
  );
}