// src/components/cursos/ModalTerminosClickwrap.jsx
import React, { useEffect } from "react";

export default function ModalTerminosClickwrap({ open, onClose, onAceptar }) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-terminos-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABECERA DEL MODAL */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-50 text-main-blue border border-blue-100 flex items-center justify-center text-xl shrink-0">
              📜
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-main-red block">
                Condiciones Contractuales Oficiales
              </span>
              <h3 id="modal-terminos-titulo" className="text-base sm:text-lg font-black text-main-blue tracking-tight">
                Inscripción y Términos de Contratación
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Curso Internacional Palermo 2027
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center border border-gray-200 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* CUERPO CONTEXTUAL SCROLLEABLE CON EL TEXTO LEGAL EXACTO */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-5 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-950 font-medium leading-relaxed">
            Antes de formalizar tu inscripción y proceder con el pago, por favor revisa y acepta las condiciones contractuales del programa:
          </div>

          {/* 1. ENTIDAD ORGANIZADORA */}
          <div className="space-y-1.5 border-b border-gray-100 pb-4">
            <h4 className="font-extrabold text-main-blue text-sm">
              1. Entidad Organizadora y Prestadora del Servicio:
            </h4>
            <p className="text-gray-600 leading-relaxed">
              El «Curso Internacional Palermo 2027» es organizado, coordinado y ejecutado por el{" "}
              <strong className="text-gray-900">
                Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)
              </strong>
              , persona jurídica constituida en la República de Costa Rica (Cédula Jurídica: 3-002-671392), quien emitirá tu comprobante o factura oficial por los servicios académicos correspondientes.
            </p>
          </div>

          {/* 2. CANALES Y GESTIÓN DE PAGO */}
          <div className="space-y-2 border-b border-gray-100 pb-4">
            <h4 className="font-extrabold text-main-blue text-sm">
              2. Canales y Gestión de Pago:
            </h4>
            <ul className="space-y-2.5 pl-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-main-blue font-bold mt-0.5">•</span>
                <div>
                  <strong className="text-gray-900">Pagos con Tarjeta (Crédito/Débito en línea):</strong>{" "}
                  Autorizas expresamente que el cobro electrónico sea procesado a través de nuestro agente recaudador autorizado en EE. UU.,{" "}
                  <strong className="text-gray-900">IIRESODH PAYMENTS, LLC</strong> (Delaware), por cuenta y orden de IIRESODH Costa Rica. En tu estado de cuenta, la transacción podrá reflejarse como <em>«IIRESODH PAYMENTS»</em>.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-main-blue font-bold mt-0.5">•</span>
                <div>
                  <strong className="text-gray-900">Pagos por Transferencia Bancaria o Efectivo:</strong>{" "}
                  El pago se realizará directamente a las cuentas bancarias autorizadas de IIRESODH PAYMENTS, LLC o IIRESODH en Costa Rica o en ventanilla autorizada. La formalización de este formulario genera una reserva provisional sujeta a la acreditación efectiva de los fondos dentro de los 5 días naturales posteriores.
                </div>
              </li>
            </ul>
          </div>

          {/* 3. LOGÍSTICA, BOLETOS Y VISADOS */}
          <div className="space-y-1.5 border-b border-gray-100 pb-4">
            <h4 className="font-extrabold text-main-blue text-sm">
              3. Logística, Boletos Aéreos y Visados:
            </h4>
            <p className="text-gray-600 leading-relaxed">
              La matrícula cubre exclusivamente el acceso académico, los servicios formativos y hospedaje especificados en el programa oficial. Todo gasto relativo a boletos aéreos, seguros médicos y trámites consulares es de exclusiva cuenta y riesgo del participante. IIRESODH emitirá, previa solicitud, una constancia de inscripción para trámites consulares, sin que esto constituya patrocinio migratorio ni garantía de emisión de visa.
            </p>
          </div>

          {/* 4. POLÍTICAS DE CUPO, CANCELACIÓN Y DEVOLUCIÓN */}
          <div className="space-y-2 border-b border-gray-100 pb-4">
            <h4 className="font-extrabold text-main-blue text-sm">
              4. Políticas de Cupo, Cancelación y Devolución:
            </h4>
            <ul className="space-y-2 pl-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-main-blue font-bold mt-0.5">•</span>
                <span>
                  Las cancelaciones solicitadas por escrito con al menos 30 días de anticipación al inicio del curso tendrán derecho a reintegro del 50% de lo pagado hasta esa fecha.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-main-blue font-bold mt-0.5">•</span>
                <span>
                  Por razones de reserva de recinto y coordinación docente en Palermo, las cancelaciones voluntarias o derivadas de negación de visado fuera de los plazos fijados no darán derecho a devolución.
                </span>
              </li>
            </ul>
          </div>

          {/* 5. CONSENTIMIENTO CONTRACTUAL Y REGISTRO */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-main-blue text-sm">
              5. Consentimiento Contractual y Registro:
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Al activar la casilla y hacer clic en «Confirmar Inscripción», manifiestas tu voluntad libre e informada de contratar los servicios formativos de IIRESODH bajo estos Términos, así como la{" "}
              <a
                href="/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-main-blue font-bold underline hover:text-light-blue"
              >
                Política de Privacidad (https://iiresodh.org/privacidad)
              </a>
              . Tu dirección IP, fecha, hora y datos de registro quedarán archivados electrónicamente como constancia y evidencia formal de tu aceptación contractual.
            </p>
          </div>
        </div>

        {/* PIE DEL MODAL CON BOTONES DE ACCIÓN */}
        <div className="px-6 py-4 bg-slate-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 text-gray-700 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              if (onAceptar) onAceptar();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-main-blue hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <span>✓ Aceptar Términos y Condiciones</span>
          </button>
        </div>
      </div>
    </div>
  );
}
