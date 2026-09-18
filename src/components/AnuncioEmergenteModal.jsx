// src/components/AnuncioEmergenteModal.jsx
import { useEffect, useState, useId } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { 
  X, 
  Share2, 
  FileText, 
  Download, 
  ExternalLink, 
  Check, 
  Copy, 
  Maximize2 
} from "lucide-react";

export default function AnuncioEmergenteModal({ 
  previewData = null, 
  isManualOpen = false, 
  onManualClose = null 
}) {
  const [anuncio, setAnuncio] = useState(previewData);
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [cargando, setCargando] = useState(!previewData && !isManualOpen);
  const titleId = useId();

  // Si se utiliza en modo de previsualización desde el AdminPanel
  useEffect(() => {
    if (previewData) {
      setAnuncio(previewData);
      setAbierto(isManualOpen);
    }
  }, [previewData, isManualOpen]);

  // Consulta al cargar la portada (Home)
  useEffect(() => {
    // Si viene en modo preview controlado, no hacemos consulta a Firestore
    if (previewData !== null) return;

    let isMounted = true;

    const verificarAnuncioActivo = async () => {
      try {
        const docRef = doc(db, "configuracion", "anuncio_emergente");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && isMounted) {
          const docData = docSnap.data();

          if (docData.activo) {
            const identificador = docData.id || docData.ultimaActualizacion?.seconds || "activo";
            const sessionKey = `iiresodh_anuncio_visto_${identificador}`;
            const yaVistoEnSesion = sessionStorage.getItem(sessionKey);

            if (!yaVistoEnSesion) {
              setAnuncio({ id: identificador, ...docData });
              setAbierto(true);
            }
          }
        }
      } catch (error) {
        console.error("Error al consultar anuncio emergente:", error);
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    verificarAnuncioActivo();

    return () => {
      isMounted = false;
    };
  }, [previewData]);

  // Manejo de teclado (tecla Escape para cerrar) y bloqueo de scroll del fondo
  useEffect(() => {
    if (!abierto) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        cerrarModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevenir scroll de la página mientras el modal esté abierto
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [abierto, anuncio]);

  const cerrarModal = () => {
    setAbierto(false);

    // Si es modo preview, invocamos callback manual
    if (onManualClose) {
      onManualClose();
    }

    // Persistencia por sesión: no vuelve a salir en esta sesión de navegación
    if (anuncio?.id && !previewData) {
      try {
        sessionStorage.setItem(`iiresodh_anuncio_visto_${anuncio.id}`, "true");
      } catch (e) {
        console.error("Error guardando en sessionStorage:", e);
      }
    }
  };

  const handleCopiarEnlace = async () => {
    const url = window.location.origin;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (e) {
      console.error("Error al copiar enlace", e);
    }
  };

  if (cargando || !abierto || !anuncio) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.origin : "https://iiresodh.org";
  const shareText = `${anuncio.titulo || "Comunicado Oficial IIRESODH"}`;
  
  const shareUrls = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " - " + currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        // Cerrar si se hace clic exactamente en el fondo backdrop
        if (e.target === e.currentTarget) cerrarModal();
      }}
    >
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ENCABEZADO CON BOTÓN DE CIERRE "X" */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-gray-50/80 to-white">
          <div className="pr-10">
            {anuncio.subtitulo && (
              <span className="inline-block px-3 py-1 bg-main-red/10 text-main-red text-[11px] font-black uppercase tracking-wider rounded-full mb-1.5">
                {anuncio.subtitulo}
              </span>
            )}
            <h2 
              id={titleId}
              className="text-xl sm:text-2xl font-black text-main-blue tracking-tight leading-snug"
            >
              {anuncio.titulo}
            </h2>
          </div>

          <button
            onClick={cerrarModal}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-main-red hover:bg-red-50 rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-main-red"
            aria-label="Cerrar comunicado emergente"
            title="Cerrar (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CUERPO PRINCIPAL CON SCROLL INTERNO SI EL CONTENIDO ES LARGO */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 text-gray-700 font-sans text-sm sm:text-base leading-relaxed">
          
          {/* AFICHE / IMAGEN DESTACADA */}
          {anuncio.imagenUrl && (
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 flex items-center justify-center max-h-[420px]">
              <img
                src={anuncio.imagenUrl}
                alt={anuncio.titulo || "Anuncio IIRESODH"}
                className="w-full h-auto max-h-[420px] object-contain"
                loading="eager"
              />
            </div>
          )}

          {/* TEXTO O MENSAJE DEL COMUNICADO */}
          {anuncio.mensaje && (
            <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 whitespace-pre-line text-justify leading-relaxed">
              {anuncio.mensaje}
            </div>
          )}

          {/* VISOR INTEGRADO DE DOCUMENTO PDF */}
          {anuncio.archivoPdfUrl && (
            <div className="rounded-2xl border-2 border-red-100 bg-red-50/40 p-4 space-y-3">
              {/* Barra de herramientas del PDF */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-red-100/80">
                <div className="flex items-center gap-2.5 text-main-blue font-bold text-xs sm:text-sm">
                  <div className="w-8 h-8 rounded-lg bg-main-red/10 text-main-red flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate max-w-[200px] sm:max-w-xs">
                    <p className="truncate font-bold text-gray-900 leading-tight">
                      {anuncio.archivoPdfNombre || "Documento Oficial en PDF"}
                    </p>
                    <span className="text-[11px] font-normal text-gray-500">Documento institucional</span>
                  </div>
                </div>

                {/* Acciones del PDF (Abrir en pantalla completa y Descargar) */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={anuncio.archivoPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-main-blue bg-white border border-gray-200 hover:border-main-blue rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                    title="Abrir en pantalla completa"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Pantalla completa</span>
                  </a>

                  <a
                    href={anuncio.archivoPdfUrl}
                    download={anuncio.archivoPdfNombre || "comunicado_iiresodh.pdf"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-main-red hover:bg-main-red/90 rounded-xl transition-all shadow-2xs cursor-pointer"
                    title="Descargar documento"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </a>
                </div>
              </div>

              {/* Visor iframe embebido responsive */}
              <div className="relative w-full h-[280px] sm:h-[360px] rounded-xl overflow-hidden border border-gray-200 bg-white shadow-inner">
                <iframe
                  src={`${anuncio.archivoPdfUrl}#toolbar=1&navpanes=0`}
                  title={anuncio.archivoPdfNombre || "Visor de Documento PDF"}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* BOTÓN DE LLAMADA A LA ACCIÓN OPCIONAL (CTA) */}
          {anuncio.enlaceBoton && anuncio.textoBoton && (
            <div className="pt-2 text-center">
              <a
                href={anuncio.enlaceBoton}
                target={anuncio.enlaceBoton.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-main-blue hover:bg-main-blue/90 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto hover:-translate-y-0.5"
              >
                <span>{anuncio.textoBoton}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* PIE DEL MODAL: COMPARTIR EN REDES Y BOTÓN CERRAR */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* BOTONES PARA COMPARTIR EN REDES */}
          {anuncio.mostrarCompartir !== false ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5 shrink-0">
                <Share2 className="w-4 h-4 text-main-red" />
                <span>Compartir:</span>
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* WhatsApp */}
                <a
                  href={shareUrls.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartir en WhatsApp"
                  title="Compartir en WhatsApp"
                  className="p-2 rounded-xl bg-white text-[#25D366] hover:bg-[#25D366] hover:text-white border border-gray-200 transition-all shadow-2xs hover:scale-105 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={shareUrls.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartir en Facebook"
                  title="Compartir en Facebook"
                  className="p-2 rounded-xl bg-white text-[#1877F2] hover:bg-[#1877F2] hover:text-white border border-gray-200 transition-all shadow-2xs hover:scale-105 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* X (Twitter) */}
                <a
                  href={shareUrls.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartir en X (Twitter)"
                  title="Compartir en X"
                  className="p-2 rounded-xl bg-white text-gray-900 hover:bg-black hover:text-white border border-gray-200 transition-all shadow-2xs hover:scale-105 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href={shareUrls.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartir en LinkedIn"
                  title="Compartir en LinkedIn"
                  className="p-2 rounded-xl bg-white text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white border border-gray-200 transition-all shadow-2xs hover:scale-105 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>

                {/* Copiar Enlace */}
                <button
                  onClick={handleCopiarEnlace}
                  className={`p-2 rounded-xl border transition-all shadow-2xs hover:scale-105 cursor-pointer flex items-center gap-1 ${
                    copiado 
                      ? "bg-green-600 text-white border-green-600" 
                      : "bg-white text-gray-600 hover:text-main-blue border-gray-200"
                  }`}
                  title="Copiar enlace al comunicado"
                >
                  {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiado && <span className="text-[11px] font-bold pr-1">¡Copiado!</span>}
                </button>
              </div>
            </div>
          ) : <div />}

          {/* BOTÓN CERRAR */}
          <button
            onClick={cerrarModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Cerrar comunicado
          </button>
        </div>
      </div>
    </div>
  );
}
