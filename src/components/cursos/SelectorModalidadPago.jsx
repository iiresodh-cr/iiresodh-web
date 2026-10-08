// src/components/cursos/SelectorModalidadPago.jsx
import React from "react";
import { calcularFechaLimitePago } from "./FormularioPagoCurso";

export const parsearMontoTotal = (texto) => {
  if (!texto) return 3350;
  let s = String(texto).replace(/USD|EUR|\$|€/gi, "").trim();
  if (s.includes("3.350")) s = s.replace("3.350", "3350");
  s = s.replace(/,/g, "");
  const val = parseFloat(s);
  return (!isNaN(val) && val >= 50) ? val : 3350;
};

export const formatMonto = (num) => {
  const n = Number(num) || 0;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function SelectorModalidadPago({
  curso,
  landing,
  planCuotas,
  setPlanCuotas,
  className = ""
}) {
  const precioTexto = landing?.precioInversion || "3,350 USD";
  const montoTotal = parsearMontoTotal(precioTexto);
  const simboloMoneda = "$";

  const calcularMontoCuota = (cuotas) => {
    return Math.round((montoTotal / cuotas) * 100) / 100;
  };

  const montoCuotaActual = calcularMontoCuota(planCuotas);

  const fechaLimiteObj = calcularFechaLimitePago(curso, landing);
  const fechaLimiteTexto = fechaLimiteObj.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const hoy = new Date();

  const calcularFechaCuota = (fechaInicio, mesesAdelante) => {
    const d = new Date(fechaInicio);
    d.setMonth(d.getMonth() + mesesAdelante);
    return d;
  };

  const verificarDisponibilidadPlan = (cuotas) => {
    if (cuotas <= 1) return true;
    const fechaFinPlan = calcularFechaCuota(hoy, cuotas - 1);
    return fechaFinPlan <= fechaLimiteObj;
  };

  const opcionesPlanes = [
    {
      cuotas: 1,
      titulo: "Pago Único Completo",
      badge: "Inscripción Total",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200 font-medium",
      montoPorCuota: montoTotal,
      descripcion: "1 solo pago para liquidar la totalidad de la matrícula.",
      destacado: false,
      disponible: true,
      fechaFin: hoy
    },
    {
      cuotas: 2,
      titulo: "2 Pagos Sin Intereses",
      badge: "0% Interés",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200 font-medium",
      montoPorCuota: calcularMontoCuota(2),
      descripcion: `1ª cuota hoy (${simboloMoneda}${formatMonto(calcularMontoCuota(2))}) y 2ª cuota el ${calcularFechaCuota(hoy, 1).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}.`,
      destacado: false,
      disponible: verificarDisponibilidadPlan(2),
      fechaFin: calcularFechaCuota(hoy, 1)
    },
    {
      cuotas: 3,
      titulo: "3 Pagos Sin Intereses",
      badge: "0% Interés",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-300 font-bold",
      montoPorCuota: calcularMontoCuota(3),
      descripcion: `1ª cuota hoy y 2 cuotas mensuales. Liquidación: ${calcularFechaCuota(hoy, 2).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}.`,
      destacado: true,
      disponible: verificarDisponibilidadPlan(3),
      fechaFin: calcularFechaCuota(hoy, 2)
    },
    {
      cuotas: 4,
      titulo: "4 Pagos Sin Intereses",
      badge: "0% Interés • Flexible",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200 font-medium",
      montoPorCuota: calcularMontoCuota(4),
      descripcion: `1ª cuota hoy y 3 cuotas mensuales. Liquidación: ${calcularFechaCuota(hoy, 3).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}.`,
      destacado: false,
      disponible: verificarDisponibilidadPlan(4),
      fechaFin: calcularFechaCuota(hoy, 3)
    }
  ];

  return (
    <div className={`bg-slate-50 border border-gray-200 p-5 rounded-3xl shadow-xs space-y-3.5 ${className}`}>
      {/* CABECERA */}
      <div className="flex items-center justify-between flex-wrap gap-1 border-b border-gray-200/80 pb-2.5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-800 block">
            Modalidad de Pago
          </span>
          <h4 className="text-sm sm:text-base font-extrabold text-main-blue tracking-tight">
            Selecciona tu Plan de Pago
          </h4>
        </div>
        <span className="text-[10px] font-bold text-sky-700 bg-sky-100/90 px-2.5 py-0.5 rounded-full border border-sky-200">
          ✓ 0% Costo Financiero
        </span>
      </div>

      {/* CUADROS DE FINANCIAMIENTO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
        {opcionesPlanes.map((opcion) => {
          const isSelected = planCuotas === opcion.cuotas;
          const isDisponible = opcion.disponible;

          return (
            <div
              key={opcion.cuotas}
              onClick={() => {
                if (isDisponible) {
                  setPlanCuotas(opcion.cuotas);
                }
              }}
              className={`relative p-3 rounded-2xl border-2 transition-all text-left ${!isDisponible
                  ? "border-gray-200 bg-gray-100/60 opacity-60 cursor-not-allowed"
                  : isSelected
                    ? "border-sky-600 bg-sky-50/50 shadow-xs ring-2 ring-sky-500/20 cursor-pointer scale-[1.01]"
                    : "border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50/20 cursor-pointer"
                }`}
            >
              {/* Radio y Badge */}
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${!isDisponible
                        ? "border-gray-300 bg-gray-200"
                        : isSelected
                          ? "border-sky-600 bg-sky-600"
                          : "border-gray-300 bg-white"
                      }`}
                  >
                    {isSelected && isDisponible && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className={`text-xs font-bold leading-tight ${isDisponible ? "text-gray-900" : "text-gray-400 line-through"}`}>
                    {opcion.titulo}
                  </span>
                </div>
                {isDisponible ? (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${opcion.badgeColor}`}>
                    {opcion.badge}
                  </span>
                ) : (
                  <span className="text-[9px] px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-700 font-bold uppercase tracking-wider">
                    Límite Superado
                  </span>
                )}
              </div>

              {/* Importe */}
              <div className="pl-6">
                <div className="flex items-baseline gap-1">
                  <span className={`text-base sm:text-lg font-black ${isDisponible ? "text-main-blue" : "text-gray-400"}`}>
                    {simboloMoneda}{formatMonto(opcion.montoPorCuota)}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500">USD</span>
                  {opcion.cuotas > 1 && (
                    <span className="text-[10px] text-gray-400 font-medium">/ cuota</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 font-light mt-0.5 leading-snug">
                  {isDisponible ? (
                    opcion.descripcion
                  ) : (
                    <span className="text-red-600 font-normal">
                      No disponible: la última cuota superaría el {fechaLimiteTexto}.
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CRONOGRAMA CUANDO PLAN > 1 */}
      {planCuotas > 1 && (
        <div className="bg-gradient-to-br from-sky-50/90 via-white to-sky-50/60 border border-sky-200 rounded-2xl p-3 text-xs space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <span className="font-extrabold text-sky-950 uppercase tracking-wide text-[10px] flex items-center gap-1.5">
              <span>📅</span> Cronograma de Cuotas
            </span>
            <span className="text-[9px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
              0% Recargo
            </span>
          </div>

          <div className="space-y-1.5">
            {Array.from({ length: planCuotas }).map((_, i) => {
              const fechaCuota = calcularFechaCuota(hoy, i);
              const esHoy = i === 0;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-sky-100 shadow-2xs text-[10px]"
                >
                  <div>
                    <p className="font-bold text-gray-800">
                      {esHoy ? "1ª Cuota (Inmediata)" : `${i + 1}ª Cuota Mensual`}
                    </p>
                    <p className="text-[9px] text-gray-500 font-light">
                      {esHoy
                        ? "Cobro hoy al matricularte"
                        : fechaCuota.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className="font-black text-main-blue text-xs">
                    {simboloMoneda}{formatMonto(montoCuotaActual)}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-sky-900/80 leading-snug pt-1 border-t border-sky-100">
            ℹ️ Plazo institucional límite de liquidación: <strong>{fechaLimiteTexto}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
