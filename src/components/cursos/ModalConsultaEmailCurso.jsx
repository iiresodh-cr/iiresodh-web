// src/components/cursos/ModalConsultaEmailCurso.jsx
import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, functions } from "../../firebase/config";
import { httpsCallable } from "firebase/functions";

const normalizarTitulo = (titulo) => {
  if (!titulo) return "Curso Internacional Palermo 2027";
  return String(titulo)
    .replace(/crímen/gi, "Crimen")
    .replace(/Crímen/g, "Crimen")
    .replace(/CRÍMEN/g, "CRIMEN")
    .trim();
};

const construirAsunto = (titulo) => {
  const tit = normalizarTitulo(titulo);
  // Si ya comienza explícitamente con "Curso" o "El curso"
  if (/^curso\b/i.test(tit)) {
    return `Consulta sobre el ${tit}`;
  }
  // Para títulos como "Aplicación de las Convenciones..."
  return `Consulta sobre el curso ${tit}`;
};

export default function ModalConsultaEmailCurso({
  isOpen,
  onClose,
  cursoTitulo = "Curso Internacional Palermo 2027",
  cursoId = "palermo-2027"
}) {
  const tituloLimpio = normalizarTitulo(cursoTitulo);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [asunto, setAsunto] = useState(() => construirAsunto(cursoTitulo));
  const [mensaje, setMensaje] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(true);

  const [enviando, setEnviando] = useState(false);
  const [enviadoExito, setEnviadoExito] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Manejar tecla ESC para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setEnviadoExito(false);
      setErrorMsg("");
      setAsunto(construirAsunto(cursoTitulo));
    }
  }, [isOpen, cursoTitulo]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nombre.trim()) {
      setErrorMsg("Por favor, ingresa tu nombre completo.");
      return;
    }
    if (!correo.trim() || !/^\S+@\S+\.\S+$/.test(correo.trim())) {
      setErrorMsg("Por favor, ingresa una dirección de correo electrónico válida.");
      return;
    }
    if (!mensaje.trim()) {
      setErrorMsg("Por favor, escribe el contenido de tu consulta o mensaje.");
      return;
    }
    if (!aceptaPrivacidad) {
      setErrorMsg("Debes aceptar la política de privacidad para enviar tu consulta.");
      return;
    }

    setEnviando(true);

    try {
      // 1. Guardar constancia de la consulta en Firestore
      await addDoc(collection(db, "solicitudesCursos"), {
        cursoId: cursoId || "palermo-2027",
        cursoTitulo: tituloLimpio,
        nombre: nombre.trim(),
        nombres: nombre.trim(),
        email: correo.trim(),
        telefono: telefono.trim(),
        asunto: asunto.trim() || construirAsunto(cursoTitulo),
        comentarios: mensaje.trim(),
        tipoRegistro: "consulta_email",
        modalidadSolicitud: "consulta_directa",
        emailDestino: "cursos@iiresodh.org",
        fechaSolicitud: serverTimestamp(),
        estado: "pendiente",
        consentimientoPrivacidad: true,
        fechaConsentimiento: new Date().toISOString()
      });

      // 2. Disparar envío formal del correo a cursos@iiresodh.org mediante Cloud Functions
      try {
        const enviarCorreoFn = httpsCallable(functions, "enviarFormularioContacto");
        await enviarCorreoFn({
          nombre: nombre.trim(),
          correo: correo.trim(),
          telefono: telefono.trim(),
          mensaje: mensaje.trim(),
          asunto: asunto.trim() || construirAsunto(cursoTitulo),
          destinatario: "cursos@iiresodh.org",
          cursoTitulo: tituloLimpio,
          origen: "curso_landing"
        });
      } catch (fnErr) {
        console.warn("Aviso en llamada de Cloud Function (el registro quedó asegurado en base de datos):", fnErr);
      }

      setEnviadoExito(true);
      setNombre("");
      setCorreo("");
      setTelefono("");
      setMensaje("");
    } catch (err) {
      console.error("Error al enviar la consulta:", err);
      setErrorMsg("Ocurrió un inconveniente al enviar tu mensaje. Por favor intenta de nuevo o escríbenos directamente a cursos@iiresodh.org.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-consulta-titulo"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ENCABEZADO */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-main-blue text-white p-5 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-main-red/30 text-red-300 border border-main-red/40 text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full">
              Atención Académica
            </span>
            <span className="text-[11px] text-slate-300 font-mono">
              cursos@iiresodh.org
            </span>
          </div>
          <h3 id="modal-consulta-titulo" className="text-lg sm:text-xl font-black tracking-tight text-white">
            Escríbenos tu consulta
          </h3>
          <p className="text-xs text-slate-300 font-light mt-1 leading-relaxed">
            Tu mensaje llegará directamente al equipo académico en <strong className="text-white font-medium">cursos@iiresodh.org</strong>. Te responderemos a la brevedad.
          </p>
        </div>

        {/* CONTENIDO DEL FORMULARIO O MENSAJE DE ÉXITO */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {enviadoExito ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-black text-main-blue">
                ¡Consulta enviada con éxito!
              </h4>
              <p className="text-sm text-gray-600 font-light leading-relaxed max-w-sm mx-auto">
                Hemos recibido tu mensaje correctamente y fue remitido a la coordinación del curso en <strong className="text-main-blue font-semibold">cursos@iiresodh.org</strong>. Te responderemos a tu correo a la brevedad posible.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-main-blue hover:bg-light-blue text-white font-bold text-xs uppercase tracking-widest py-3 px-8 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Entendido / Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* NOMBRE */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nombre completo <span className="text-main-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Dr. Carlos Rodríguez"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue bg-white"
                />
              </div>

              {/* CORREO Y TELÉFONO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tu correo electrónico <span className="text-main-red">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Teléfono / WhatsApp <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+506 8888 8888"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue bg-white"
                  />
                </div>
              </div>

              {/* ASUNTO */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Asunto de la consulta
                </label>
                <input
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Asunto de la consulta..."
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue bg-white"
                />
              </div>

              {/* MENSAJE */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  ¿En qué podemos orientarte? <span className="text-main-red">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Escribe tus dudas sobre fechas, facilidades de pago, hospedaje o requerimientos de admisión..."
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue resize-none bg-white"
                />
              </div>

              {/* PRIVACIDAD */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  id="chk-privacidad-consulta"
                  type="checkbox"
                  checked={aceptaPrivacidad}
                  onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-main-blue focus:ring-main-blue border-gray-300 cursor-pointer"
                />
                <label htmlFor="chk-privacidad-consulta" className="text-xs text-gray-600 cursor-pointer select-none">
                  Acepto que mis datos sean tratados por IIRESODH únicamente para responder esta consulta académica, conforme a la política de privacidad.
                </label>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={enviando}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 text-gray-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full sm:w-auto bg-main-red hover:bg-[#8b1515] text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {enviando ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Enviando mensaje...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span>Enviar a cursos@iiresodh.org</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
