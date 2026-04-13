// src/pages/PaginaPais.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { Paper } from "@mui/material";

const CONFIG_PAISES = {
  "canada": { tag: "Canadá", titulo: "Canadá", contacto: "Ciudad de Lévis, Québec. Toronto: Waldman & Associates. contacto@iiresodh.org" },
  "guatemala": { tag: "Guatemala", titulo: "Guatemala", contacto: "Diagonal 6 12-42, Edificio Design Center. Oficina 506, Torre 1, Zona 10. +502 5557 7466" },
  // CORRECCIÓN: Agregué la tilde a México por si acaso así está en tu DB
  "mexico": { tag: "México", titulo: "México", contacto: "Atención virtual o presencial previa cita en CDMX. contacto@iiresodh.org" },
  "costa-rica": { tag: "Costa Rica", titulo: "Costa Rica", contacto: "Sede Central: Escazú, San José. CP 10201. +506 4703 5727" },
  "colombia": { tag: "Colombia", titulo: "Colombia", contacto: "Carrera. 11C No. 117-05. Oficina 5. Bogotá. +57 301 4844324" }
};

export default function PaginaPais({ paisKey: propsPaisKey }) {
  const { paisRoute } = useParams();
  const key = propsPaisKey || paisRoute;
  const data = CONFIG_PAISES[key];

  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data) return;

    const fetchNoticias = async () => {
      setLoading(true);
      console.log(`🔍 Buscando noticias con el tag: "${data.tag}" para ${data.titulo}...`);
      
      try {
        const q = query(
          collection(db, "noticias"),
          where("tags", "array-contains", data.tag),
          orderBy("fechaPublicacion", "desc"),
          limit(6)
        );

        const querySnapshot = await getDocs(q);
        const resultados = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        console.log(`✅ Resultados encontrados para ${data.titulo}:`, resultados.length);
        setNoticias(resultados);
      } catch (error) {
        // IMPORTANTE: Si falta un índice, el enlace para crearlo saldrá aquí en la consola
        console.error("❌ Error en la consulta de Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, [key, data]);

  if (!data) return <div className="p-20 text-center">País no configurado.</div>;

  return (
    <main className="bg-white min-h-screen font-sans">
      {/* HERO */}
      <section className="bg-main-blue py-16 md:py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="text-main-red font-black tracking-[0.3em] uppercase text-xs mb-4 block">Presencia Internacional</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tighter">
            IIRESODH <span className="text-pale-blue">{data.titulo}</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-light max-w-3xl leading-relaxed">
            Actividad y presencia institucional en {data.titulo}.
          </p>
        </div>
      </section>

      {/* NOTICIAS */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-main-blue uppercase tracking-tight">Noticias</h2>
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
                <Paper elevation={0} className="flex flex-col h-full rounded-4xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
                  <img src={item.imagenPrincipalUrl} alt="" className="aspect-video object-cover duration-4000 group-hover:scale-110 transition-transform" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-main-blue group-hover:text-main-red transition-colors line-clamp-2">{item.titulo}</h3>
                    <p className="text-gray-500 text-sm mt-4 line-clamp-3">{item.resumen}</p>
                  </div>
                </Paper>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-400">No hay noticias con el tag "{data.tag}". <br/> <small>Verifica que el tag en el Admin sea idéntico (mayúsculas y tildes).</small></p>
          </div>
        )}
      </section>
      
      {/* CONTACTO */}
      <section className="pb-20 px-6 max-w-7xl mx-auto">
         <div className="bg-gray-50 rounded-[3rem] p-8 md:p-12 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
               <h2 className="text-2xl font-black text-main-blue mb-2 uppercase">Sede {data.titulo}</h2>
               <p className="text-gray-600 font-light">{data.contacto}</p>
            </div>
            <Link to="/contacto" className="bg-main-red text-white font-bold py-4 px-10 rounded-xl uppercase text-xs">Contactar</Link>
         </div>
      </section>
    </main>
  );
}