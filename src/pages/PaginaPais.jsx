// src/pages/PaginaPais.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { Paper } from "@mui/material";
import PageHeader from "../components/PageHeader"; 

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

// Nota: Dejamos el tag tal cual porque es el valor exacto en Firestore (en español).
// La traducción visual la haremos dentro del componente usando el hook de i18next.
const CONFIG_PAISES = {
  "canada": { tag: "Canadá", keyTraduccion: "canada" },
  "guatemala": { tag: "Guatemala", keyTraduccion: "guatemala" },
  "mexico": { tag: "México", keyTraduccion: "mexico" },
  "costa-rica": { tag: "Costa Rica", keyTraduccion: "costa_rica" },
  "colombia": { tag: "Colombia", keyTraduccion: "colombia" }
};

export default function PaginaPais({ paisKey: propsPaisKey }) {
  const { t } = useTranslation(); // HOOK DE TRADUCCIÓN
  const { paisRoute } = useParams();
  const key = propsPaisKey || paisRoute;
  const data = CONFIG_PAISES[key];

  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data) return;

    const fetchNoticias = async () => {
      setLoading(true);
      
      try {
        const q = query(
          collection(db, "noticias"),
          where("tags", "array-contains", data.tag),
          orderBy("fechaPublicacion", "desc"),
          limit(6)
        );

        const querySnapshot = await getDocs(q);
        const resultados = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setNoticias(resultados);
      } catch (error) {
        console.error("❌ Error en la consulta de Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, [key, data]);

  if (!data) return <div className="p-20 text-center">{t('pagina_pais.no_configurado', 'País no configurado.')}</div>;

  // Obtenemos los textos traducidos para el país actual usando las llaves de nuestro diccionario del Footer/Equipo
  let tituloPaisTraducido = "";
  let contactoPaisTraducido = "";

  switch (data.keyTraduccion) {
    case "canada":
      tituloPaisTraducido = t('equipo.canada', 'Canadá');
      contactoPaisTraducido = t('pagina_pais.canada_contacto', 'Ciudad de Lévis, Québec. Toronto: Waldman & Associates. contacto@iiresodh.org');
      break;
    case "guatemala":
      tituloPaisTraducido = t('equipo.guatemala', 'Guatemala');
      contactoPaisTraducido = t('pagina_pais.guatemala_contacto', 'Diagonal 6 12-42, Edificio Design Center. Oficina 506, Torre 1, Zona 10. +502 5557 7466');
      break;
    case "mexico":
      tituloPaisTraducido = t('equipo.mexico', 'México');
      contactoPaisTraducido = t('pagina_pais.mexico_contacto', 'Atención virtual o presencial previa cita en CDMX. contacto@iiresodh.org');
      break;
    case "costa_rica":
      tituloPaisTraducido = t('equipo.costa_rica', 'Costa Rica');
      contactoPaisTraducido = t('pagina_pais.costa_rica_contacto', 'Sede Central: Escazú, San José. CP 10201. +506 4703 5727');
      break;
    case "colombia":
      tituloPaisTraducido = t('equipo.colombia', 'Colombia');
      contactoPaisTraducido = t('pagina_pais.colombia_contacto', 'Carrera. 11C No. 117-05. Oficina 5. Bogotá. +57 301 4844324');
      break;
    default:
      tituloPaisTraducido = data.tag;
      contactoPaisTraducido = "";
  }

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden">
      
      <PageHeader 
        titulo={t('pagina_pais.header_titulo', 'IIRESODH {{pais}}').replace('{{pais}}', tituloPaisTraducido)} 
        subtitulo={t('pagina_pais.header_subtitulo', 'Actividad y presencia institucional en {{pais}}.').replace('{{pais}}', tituloPaisTraducido)} 
      />

      <div className="relative overflow-hidden grow pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <div className="bg-watermark"></div>
        </div>

        <section className="relative z-10 pt-4 md:pt-8 px-0">
          <div className="max-w-7xl mx-auto bg-white">
            <div className="px-6 md:px-12 lg:px-16 pt-8 pb-16 w-full animate-fade-in-up">
              
              {/* NOTICIAS */}
              <div className="mb-16">
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-2xl md:text-3xl font-black text-main-blue uppercase tracking-tight">
                    {t('pagina_pais.noticias_de', 'Noticias de {{pais}}').replace('{{pais}}', tituloPaisTraducido)}
                  </h2>
                  <div className="grow h-px bg-gray-100"></div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(n => <div key={n} className="h-64 bg-gray-50 animate-pulse rounded-4xl"></div>)}
                  </div>
                ) : noticias.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {noticias.map((item) => (
                      <Link key={item.id} to={`/noticias/${item.slug || item.id}`} className="group h-full">
                        <Paper elevation={0} className="flex flex-col h-full rounded-4xl overflow-hidden border border-gray-100 hover:border-main-red/20 hover:shadow-2xl transition-all duration-300">
                          <img src={item.imagenPrincipalUrl} alt="" className="aspect-video object-cover duration-4000 group-hover:scale-110 transition-transform" />
                          <div className="p-6 bg-white">
                            <h3 className="text-xl font-bold text-main-blue group-hover:text-main-red transition-colors line-clamp-2">{item.titulo}</h3>
                            <p className="text-gray-500 text-sm mt-4 line-clamp-3">{item.resumen}</p>
                          </div>
                        </Paper>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-4xl border border-dashed border-gray-200">
                    <p className="text-gray-400">
                      {t('pagina_pais.no_hay_noticias', 'No hay noticias con el tag "{{tag}}".').replace('{{tag}}', data.tag)} <br/> 
                      <small>{t('pagina_pais.verifica_tag', 'Verifica que el tag en el Admin sea idéntico (mayúsculas y tildes).')}</small>
                    </p>
                  </div>
                )}
              </div>
              
              {/* CONTACTO */}
              <div>
                 <div className="bg-gray-50 rounded-4xl p-8 md:p-12 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl text-center md:text-left">
                       <h2 className="text-2xl font-black text-main-blue mb-2 uppercase">
                         {t('pagina_pais.sede', 'Sede {{pais}}').replace('{{pais}}', tituloPaisTraducido)}
                       </h2>
                       <p className="text-gray-600 font-light">{contactoPaisTraducido}</p>
                    </div>
                    <Link to="/contacto" className="bg-main-red text-white font-bold py-4 px-10 rounded-xl uppercase text-xs hover:bg-red-800 transition-colors shrink-0">
                      {t('pagina_pais.btn_contactar', 'Contactar')}
                    </Link>
                 </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </main>
  );
}