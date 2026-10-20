// src/components/cursos/ModalContactoEmail.jsx
import React, { useState, useEffect } from "react";
import { Mail, Copy, Check, ExternalLink, X } from "lucide-react";

export default function ModalContactoEmail({
  open,
  onClose,
  email = "cursos@iiresodh.org",
  subject = "Consulta sobre el Curso Internacional Palermo 2027",
  body = "Estimado equipo de IIRESODH,\n\nSolicito información detallada sobre el Curso Internacional en Palermo 2027.\n\nMuchas gracias."
}) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  const urlGmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodedSubject}&body=${encodedBody}`;
  const urlOutlook = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodedSubject}&body=${encodedBody}`;
  const urlMailto = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;

  const handleCopiar = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (err) {
      console.error("Error al copiar correo:", err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-email-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABECERA */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-main-red block">
                Contacto Directo
              </span>
              <h3 id="modal-email-titulo" className="text-base sm:text-lg font-black text-main-blue tracking-tight">
                Enviar Correo Electrónico
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center border border-gray-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="p-6 space-y-5">
          {/* CUADRO DEL CORREO CON BOTÓN DE COPIAR */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-0.5">
                Dirección Oficial de Consultas:
              </span>
              <span className="text-base sm:text-lg font-bold text-main-blue font-mono select-all">
                {email}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopiar}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs ${
                copiado
                  ? "bg-emerald-600 text-white"
                  : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              {copiado ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-500" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center font-medium">
            Selecciona la opción con la que prefieres redactar tu mensaje:
          </p>

          {/* OPCIONES DE CORREO */}
          <div className="space-y-2.5">
            {/* OPCIÓN 1: GMAIL */}
            <a
              href={urlGmail}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-red-400/80 hover:bg-red-50/30 hover:shadow-xs transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-base shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 6l-10 7L2 6" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <div className="text-left">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                    Abrir en Gmail
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Abre el redactor web de Gmail en una nueva pestaña
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors shrink-0" />
            </a>

            {/* OPCIÓN 2: OUTLOOK / HOTMAIL WEB */}
            <a
              href={urlOutlook}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-blue-400/80 hover:bg-blue-50/30 hover:shadow-xs transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-base shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="#0078D4" strokeWidth="2"/>
                    <path d="M3 7l9 6 9-6" stroke="#0078D4" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
                <div className="text-left">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    Abrir en Outlook Web
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Outlook.com o Microsoft 365 en el navegador
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
            </a>

            {/* OPCIÓN 3: CLIENTE DE ESCRITORIO (MAILTO) */}
            <a
              href={urlMailto}
              onClick={onClose}
              className="w-full p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-slate-400/80 hover:bg-slate-50 hover:shadow-xs transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5 text-slate-700" />
                </span>
                <div className="text-left">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-slate-900 transition-colors">
                    App de Correo Predeterminada
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Outlook de escritorio, Apple Mail, Thunderbird u otra
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-slate-700 transition-colors shrink-0" />
            </a>
          </div>
        </div>

        {/* PIE DEL MODAL */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-500">
            Respuesta oficial en menos de 24 horas hábiles por el equipo académico de IIRESODH.
          </p>
        </div>
      </div>
    </div>
  );
}
