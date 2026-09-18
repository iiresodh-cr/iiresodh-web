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

  const defaultUrl = typeof window !== "undefined" ? window.location.origin : "https://iiresodh.org";
  
  // Si el anuncio tiene archivo PDF, generamos la URL institucional sobre el dominio raíz (/documentos/anuncios/...)
  const obtenerUrlPdfInstitucional = () => {
    if (!anuncio?.archivoPdfUrl) return defaultUrl;
    if (anuncio.archivoPdfUrl.startsWith("blob:")) {
      return anuncio.archivoPdfUrl;
    }

    const docId = anuncio.id || "activo";
    const textoBase = (anuncio.archivoPdfNombre || anuncio.titulo || "comunicado")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    const slug = textoBase.replace(/-pdf$/, "").replace(/\.pdf$/, "") || "comunicado";
    return `${defaultUrl}/documentos/anuncios/${docId}/${slug}.pdf`;
  };

  const urlParaCompartir = anuncio?.archivoPdfUrl ? obtenerUrlPdfInstitucional() : defaultUrl;

  const handleCopiarEnlace = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(urlParaCompartir);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = urlParaCompartir;
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

  const shareText = `${anuncio.titulo || "Comunicado Oficial IIRESODH"}`;
  
  const shareUrls = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " - " + urlParaCompartir)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(urlParaCompartir)}&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlParaCompartir)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlParaCompartir)}`
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
                    href={urlParaCompartir}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-main-blue bg-white border border-gray-200 hover:border-main-blue rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                    title="Abrir en pantalla completa"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Pantalla completa</span>
                  </a>

                  <a
                    href={urlParaCompartir}
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

              <div className="flex items-center gap-2 flex-wrap">
                {/* WhatsApp */}
                <a
                  href={shareUrls.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartir en WhatsApp"
                  title="Compartir en WhatsApp"
                  className="p-2.5 rounded-xl bg-white text-[#25D366] hover:bg-[#25D366] hover:text-white border border-gray-200 transition-all shadow-2xs hover:scale-105 cursor-pointer flex items-center justify-center"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={shareUrls.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartir en Facebook"
                  title="Compartir en Facebook"
                  className="p-2.5 rounded-xl bg-white text-[#1877F2] hover:bg-[#1877F2] hover:text-white border border-gray-200 transition-all shadow-2xs hover:scale-105 cursor-pointer flex items-center justify-center"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
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
                  className="p-2.5 rounded-xl bg-white text-gray-900 hover:bg-black hover:text-white border border-gray-200 transition-all shadow-2xs hover:scale-105 cursor-pointer flex items-center justify-center"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
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
                  className="p-2.5 rounded-xl bg-white text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white border border-gray-200 transition-all shadow-2xs hover:scale-105 cursor-pointer flex items-center justify-center"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>

                {/* Copiar Enlace */}
                <button
                  onClick={handleCopiarEnlace}
                  className={`p-2.5 rounded-xl border transition-all shadow-2xs hover:scale-105 cursor-pointer flex items-center gap-1.5 ${
                    copiado 
                      ? "bg-green-600 text-white border-green-600" 
                      : "bg-white text-gray-600 hover:text-main-blue border-gray-200"
                  }`}
                  title={anuncio?.archivoPdfUrl ? "Copiar enlace al documento PDF" : "Copiar enlace"}
                >
                  {copiado ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copiado && <span className="text-xs font-bold pr-1">¡Copiado!</span>}
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
