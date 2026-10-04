// src/pages/DocumentoProxy.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import { CircularProgress } from "@mui/material";

export default function DocumentoProxy() {
  const { coleccion, id, slug } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelado = false;

    const resolverDocumento = async () => {
      try {
        let fileUrl = null;

        if (coleccion === "anuncios" || coleccion === "comunicados") {
          if (!id || id === "activo" || id.toLowerCase().endsWith(".pdf")) {
            const snap = await getDoc(doc(db, "configuracion", "anuncio_emergente"));
            if (snap.exists()) fileUrl = snap.data().archivoPdfUrl;
          } else {
            const snapHist = await getDoc(doc(db, "configuracion", "anuncio_emergente", "historial", id));
            if (snapHist.exists()) {
              fileUrl = snapHist.data().archivoPdfUrl;
            } else {
              const snapActivo = await getDoc(doc(db, "configuracion", "anuncio_emergente"));
              if (snapActivo.exists()) fileUrl = snapActivo.data().archivoPdfUrl;
            }
          }
        } else if (coleccion === "noticias" && id) {
          let snap = await getDoc(doc(db, "noticias", id));
          if (!snap.exists()) {
            const q = query(collection(db, "noticias"), where("slug", "==", id), limit(1));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
              snap = querySnap.docs[0];
            }
          }
          if (snap && snap.exists()) {
            const data = snap.data();
            if (data.archivosAdjuntos && Array.isArray(data.archivosAdjuntos) && data.archivosAdjuntos.length > 0) {
              const indexMatch = slug && slug.match(/^doc-(\d+)/);
              if (indexMatch && data.archivosAdjuntos[parseInt(indexMatch[1], 10)]) {
                fileUrl = data.archivosAdjuntos[parseInt(indexMatch[1], 10)].url;
              } else if (slug) {
                const matchClean = slug.replace(/\.pdf$/i, '').toLowerCase();
                const found = data.archivosAdjuntos.find(a => 
                  a.nombre && a.nombre.toLowerCase().replace(/[^a-z0-9]/g, '').includes(matchClean.replace(/[^a-z0-9]/g, ''))
                );
                fileUrl = found ? found.url : data.archivosAdjuntos[0].url;
              } else {
                fileUrl = data.archivosAdjuntos[0].url;
              }
            } else {
              fileUrl = data.archivoPdfUrl || data.archivoUrl || null;
            }
          }
        } else if (coleccion === "incidencia" && id) {
          const snap = await getDoc(doc(db, "incidencia", id));
          if (snap.exists()) fileUrl = snap.data().archivoIncidenciaUrl;
        } else if (coleccion === "informes" && id) {
          const snap = await getDoc(doc(db, "informes", id));
          if (snap.exists()) fileUrl = snap.data().archivoInformeUrl;
        }

        if (fileUrl && !cancelado) {
          window.location.replace(fileUrl);
          return;
        }

        if (!cancelado) setError(true);
      } catch (err) {
        console.error("Error al resolver documento:", err);
        if (!cancelado) setError(true);
      }
    };

    resolverDocumento();

    return () => {
      cancelado = true;
    };
  }, [coleccion, id, slug]);

  if (error) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4 bg-gradient-to-b from-white via-[#FAFBFD] to-[#FAFBFD]">
        <h2 className="text-2xl font-bold text-main-blue">Documento no disponible</h2>
        <p className="text-gray-600 max-w-md">No se pudo encontrar el archivo solicitado o ya no está disponible.</p>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 bg-main-blue text-white rounded-xl font-bold text-sm hover:bg-main-blue/90 cursor-pointer"
        >
          Volver al Inicio
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-b from-white via-[#FAFBFD] to-[#FAFBFD] gap-4">
      <CircularProgress size={45} thickness={4} sx={{ color: '#1D3557' }} />
      <span className="text-main-blue font-bold text-xs uppercase tracking-widest animate-pulse">
        Cargando documento...
      </span>
    </main>
  );
}
