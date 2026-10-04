// src/components/cursos/FormularioPagoCurso.jsx
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { functions } from "../../firebase/config";
import { httpsCallable } from "firebase/functions";
import { CircularProgress, Alert } from "@mui/material";
import { PAISES_LATINOAMERICA } from "../../data/paisesLatinoamerica";

// ============================================================================
// HELPER: CÁLCULO DE FECHA LÍMITE DE PAGO (ÚLTIMO DÍA DEL MES ANTERIOR AL EVENTO)
// ============================================================================
export function calcularFechaLimitePago(curso, landing) {
  // 1. Configuración explícita en landingPage o curso (ej: "2027-04-30")
  const fechaCfg = landing?.fechaLimitePago || curso?.fechaLimitePago;
  if (fechaCfg) {
    const d = new Date(fechaCfg + "T23:59:59");
    if (!isNaN(d.getTime())) return d;
  }

  // 2. Extraer el mes y año del evento a partir de texto (ej: "Palermo, Sicilia, Italia | Del 17 al 23 de mayo de 2027")
  const texto = (landing?.ubicacionFechas || curso?.fecha || curso?.titulo || "").toLowerCase();
  const meses = [
    { nombre: "enero", idx: 0 },
    { nombre: "febrero", idx: 1 },
    { nombre: "marzo", idx: 2 },
    { nombre: "abril", idx: 3 },
    { nombre: "mayo", idx: 4 },
    { nombre: "junio", idx: 5 },
    { nombre: "julio", idx: 6 },
    { nombre: "agosto", idx: 7 },
    { nombre: "septiembre", idx: 8 },
    { nombre: "octubre", idx: 9 },
    { nombre: "noviembre", idx: 10 },
    { nombre: "diciembre", idx: 11 }
  ];

  const matchAño = texto.match(/202[0-9]/);
  const año = matchAño ? parseInt(matchAño[0], 10) : 2027;

  for (const m of meses) {
    if (texto.includes(m.nombre)) {
      // Último día del mes previo al evento:
      // En JS new Date(año, m.idx, 0, 23, 59, 59) retorna el último día del mes anterior a m.idx
      return new Date(año, m.idx, 0, 23, 59, 59);
    }
  }

  // Fallback para Palermo (mayo de 2027 -> 30 de abril de 2027)
  return new Date(2027, 3, 30, 23, 59, 59);
}

// Carga la clave pública de Stripe para cursos (por defecto usa la key de prueba provista)
const STRIPE_CURSOS_KEY = import.meta.env.VITE_STRIPE_CURSOS_PUBLIC_KEY || "pk_test_51R0ovD2c2u6cty9mPu0lrl7lQrjpLsrfH5buxYVayH58IZjHjVfXqKLhdPObJN1rY2vD92jSlPHU9DNZr1NYbiT500sNDUpxbR";
const stripeCursosPromise = loadStripe(STRIPE_CURSOS_KEY);

const cardElementOptions = {
  hidePostalCode: true,
  disableLink: true,
  style: {
    base: {
      fontSize: "16px", // Previene auto-zoom en iOS Safari
      color: "#1D3557",
      fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: "500",
      "::placeholder": {
        color: "#94a3b8",
      },
      iconColor: "#1D3557",
    },
    invalid: {
      color: "#B92F32",
      iconColor: "#B92F32",
    },
  },
};

const TEMAS_EXPERIENCIA_OPCIONES = [
  "Crimen organizado",
  "Trata de personas",
  "Lavado de activos",
  "Litigio estratégico",
  "Otro"
];

// Formulario interno con acceso al hook de Stripe Elements
function CheckoutFormCurso({
  curso,
  landing,
  planCuotas: propPlanCuotas,
  setPlanCuotas: propSetPlanCuotas,
  onSwitchToTransferencia
}) {
  const stripe = useStripe();
  const elements = useElements();

  // Estados de datos del participante y perfil académico
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    nombre: "",
    email: "",
    telefono: "",
    institucion: "",
    pais: "Costa Rica",
    profesion: "",
    experienciaTemas: [],
    experienciaOtro: "",
    motivoParticipacion: "",
    cursosPrevios: "no",
    detalleCursosPrevios: "",
    alumnoIiresodh: "no"
  });

  // Plan de cuotas seleccionado (1 = Pago único, 2 = 2 pagos, 3 = 3 pagos, 4 = 4 pagos)
  const [internalPlanCuotas, setInternalPlanCuotas] = useState(1);
  const planCuotas = propPlanCuotas !== undefined ? propPlanCuotas : internalPlanCuotas;
  const setPlanCuotas = propSetPlanCuotas || setInternalPlanCuotas;
  const [aceptarTerminos, setAceptarTerminos] = useState(false);

  // Estados de proceso
  const [loadingPago, setLoadingPago] = useState(false);
  const [errorPago, setErrorPago] = useState(null);
  const [exito, setExito] = useState(false);
  const [reciboPago, setReciboPago] = useState(null);

  // Cálculo del monto total y moneda (Transacciones oficiales en USD)
  const precioTexto = landing?.precioInversion || "3,350 USD";
  const monedaDetectada = "USD";
  const simboloMoneda = "$";
  
  // Extracción robusta del monto numérico respetando separador de miles con coma y decimales con punto
  const parsearMontoTotal = (texto) => {
    if (!texto) return 3350;
    let s = String(texto).replace(/USD|EUR|\$|€/gi, "").trim();
    if (s.includes("3.350")) s = s.replace("3.350", "3350");
    s = s.replace(/,/g, ""); // Remueve coma de miles
    const val = parseFloat(s);
    return (!isNaN(val) && val >= 50) ? val : 3350;
  };
  const montoTotal = parsearMontoTotal(precioTexto);

  // Formateador estándar financiero USD: coma (,) para miles y punto (.) para 2 decimales en todas las cuotas y pagos
  const formatMonto = (num) => {
    const n = Number(num) || 0;
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Monto por cuota según plan
  const calcularMontoCuota = (cuotas) => {
    return Math.round((montoTotal / cuotas) * 100) / 100;
  };

  const montoCuotaActual = calcularMontoCuota(planCuotas);

  // ==========================================================================
  // CONTROL INSTITUCIONAL DE FECHA LÍMITE:
  // Todos los plazos deben quedar liquidados a más tardar el último día del mes
  // anterior al evento (ej. para Palermo: 30 de abril de 2027).
  // ==========================================================================
  const fechaLimiteObj = calcularFechaLimitePago(curso, landing);
  const fechaLimiteTexto = fechaLimiteObj.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const hoy = new Date();

  // Calcula la fecha de vencimiento de la cuota i (0 = hoy, 1 = dentro de 1 mes, etc.)
  const calcularFechaCuota = (fechaInicio, mesesAdelante) => {
    const d = new Date(fechaInicio);
    d.setMonth(d.getMonth() + mesesAdelante);
    return d;
  };

  // Verifica si un plan de cuotas concluye dentro del plazo límite permitido
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
      badge: "0% Interés • Recomendado",
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

  // Si el plan actualmente seleccionado no está disponible, seleccionar el plan válido con más cuotas
  useEffect(() => {
    const planActual = opcionesPlanes.find((p) => p.cuotas === planCuotas);
    if (planActual && !planActual.disponible) {
      const disponibles = opcionesPlanes.filter((p) => p.disponible);
      if (disponibles.length > 0) {
        setPlanCuotas(disponibles[disponibles.length - 1].cuotas);
      } else {
        setPlanCuotas(1);
      }
    }
  }, [planCuotas]);

  const handleToggleTema = (tema) => {
    setFormData((prev) => {
      const existe = prev.experienciaTemas.includes(tema);
      if (existe) {
        return { ...prev, experienciaTemas: prev.experienciaTemas.filter((t) => t !== tema) };
      } else {
        return { ...prev, experienciaTemas: [...prev.experienciaTemas, tema] };
      }
    });
  };

  const handleSubmitPago = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorPago("El sistema de pagos de Stripe se está inicializando. Por favor intenta en unos segundos.");
      return;
    }

    if (!formData.nombres.trim() || !formData.apellidos.trim() || !formData.email.trim() || !formData.telefono.trim()) {
      setErrorPago("Por favor completa tus nombres, apellidos (conforme a tu pasaporte), correo electrónico y teléfono de contacto.");
      return;
    }

    if (!formData.motivoParticipacion.trim()) {
      setErrorPago("Por favor cuéntanos brevemente por qué deseas participar en este curso.");
      return;
    }

    if (!aceptarTerminos) {
      setErrorPago("Debes aceptar la Política de Privacidad y autorizar el tratamiento de datos para proceder con la inscripción.");
      return;
    }

    if (planCuotas > 1 && !verificarDisponibilidadPlan(planCuotas)) {
      setErrorPago(`El plan de ${planCuotas} cuotas no está disponible porque la última cuota superaría la fecha límite institucional del ${fechaLimiteTexto} (último día del mes anterior al evento). Por favor selecciona un plan con menos cuotas o pago único.`);
      return;
    }

    setLoadingPago(true);
    setErrorPago(null);

    // Formatear experiencia
    const temasFinales = formData.experienciaTemas.includes("Otro") && formData.experienciaOtro.trim()
      ? [...formData.experienciaTemas.filter(t => t !== "Otro"), `Otro: ${formData.experienciaOtro.trim()}`]
      : formData.experienciaTemas;

    const cursosPreviosFinal = formData.cursosPrevios === "si"
      ? (formData.detalleCursosPrevios.trim() ? `Sí (${formData.detalleCursosPrevios.trim()})` : "Sí")
      : "No";

    const nombreCompleto = `${formData.nombres.trim()} ${formData.apellidos.trim()}`;

    try {
      // 1. Invocar la Cloud Function para crear el PaymentIntent con la cuenta dedicada de cursos
      const crearIntento = httpsCallable(functions, "crearIntentoPagoCurso");
      const { data } = await crearIntento({
        cursoId: curso?.id || "palermo-2027",
        cursoTitulo: curso?.titulo || "Curso Internacional - Palermo 2027",
        email: formData.email.trim(),
        nombre: nombreCompleto,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        telefono: formData.telefono.trim(),
        institucion: formData.institucion.trim(),
        pais: formData.pais,
        profesion: formData.profesion.trim(),
        experienciaTemas: temasFinales,
        motivoParticipacion: formData.motivoParticipacion.trim(),
        cursosPrevios: cursosPreviosFinal,
        alumnoIiresodh: formData.alumnoIiresodh,
        monto: montoCuotaActual,
        montoTotal: montoTotal,
        moneda: monedaDetectada,
        planCuotas: planCuotas,
        numCuota: 1,
        aceptaPoliticaPrivacidad: true,
        versionPoliticaPrivacidad: "2026-09-12"
      });

      if (!data || !data.clientSecret) {
        throw new Error("No se recibió la confirmación de sesión segura de Stripe.");
      }

      // 2. Confirmar el pago de la tarjeta con Stripe Elements
      const cardElement = elements.getElement(CardElement);
      const resultado = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: nombreCompleto,
            email: formData.email.trim(),
            phone: formData.telefono.trim()
          }
        },
        receipt_email: formData.email.trim()
      });

      if (resultado.error) {
        setErrorPago(resultado.error.message || "La tarjeta fue rechazada o los datos son inválidos.");
      } else if (resultado.paymentIntent && resultado.paymentIntent.status === "succeeded") {
        setReciboPago({
          id: resultado.paymentIntent.id,
          montoPagado: montoCuotaActual,
          montoTotal: montoTotal,
          planCuotas: planCuotas,
          moneda: monedaDetectada,
          email: formData.email.trim(),
          nombre: nombreCompleto,
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          profesion: formData.profesion.trim(),
          saldoRestante: Math.max(0, montoTotal - montoCuotaActual)
        });
        setExito(true);
      }
    } catch (err) {
      console.error("Error al procesar pago de curso:", err);
      setErrorPago(err.message || "Ocurrió un error al procesar el pago. Por favor intenta de nuevo o solicita transferencia.");
    } finally {
      setLoadingPago(false);
    }
  };

  // PANTALLA DE ÉXITO
  if (exito && reciboPago) {
    return (
      <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-green-200 shadow-xl space-y-6 animate-fade-in text-center max-w-xl mx-auto">
        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
          ✓
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Inscripción Confirmada
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-main-blue tracking-tight">
            ¡Pago Realizado con Éxito!
          </h3>
          <p className="text-xs text-gray-600 font-light max-w-md mx-auto leading-relaxed">
            Hemos recibido el pago de tu matrícula y tu plaza en el curso ha quedado formalmente reservada.
          </p>
        </div>

        {/* DETALLE DEL RECIBO */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-gray-200 text-left text-xs space-y-2.5">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-500">Participante:</span>
            <span className="font-bold text-gray-900">{reciboPago.nombre}</span>
          </div>
          {reciboPago.profesion && (
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Profesión:</span>
              <span className="font-semibold text-gray-800">{reciboPago.profesion}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-500">Correo Electrónico:</span>
            <span className="font-bold text-gray-900 break-all">{reciboPago.email}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-500">Modalidad de Pago:</span>
            <span className="font-bold text-main-blue">
              {reciboPago.planCuotas === 1 ? "1 Pago Único" : `${reciboPago.planCuotas} Pagos Sin Intereses`}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-500">Monto Cobrado Hoy:</span>
            <span className="font-extrabold text-green-700 text-sm">
              {simboloMoneda}{formatMonto(reciboPago.montoPagado)} {reciboPago.moneda}
            </span>
          </div>
          {reciboPago.planCuotas > 1 && (
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Saldo Restante ({reciboPago.planCuotas - 1} cuotas):</span>
              <span className="font-bold text-gray-800">
                {simboloMoneda}{formatMonto(reciboPago.saldoRestante)} {reciboPago.moneda}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-[11px] text-gray-400">
            <span>Referencia Stripe:</span>
            <span className="font-mono">{reciboPago.id.slice(0, 18)}...</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 font-light text-left leading-relaxed">
          ℹ️ Hemos enviado el comprobante oficial y los detalles del programa a <strong>{reciboPago.email}</strong>. Nuestro equipo académico se pondrá en contacto para tramitar tu acreditación y expediente.
        </div>

        <button
          onClick={() => {
            setExito(false);
            setReciboPago(null);
          }}
          className="w-full sm:w-auto bg-main-blue hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-8 rounded-xl transition shadow-sm cursor-pointer"
        >
          Finalizar y Volver
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmitPago} className="space-y-6">
      {/* 1. DATOS PERSONALES Y PROFESIONALES */}
      <div className="space-y-4">
        <label className="block text-xs font-black text-main-blue uppercase tracking-wider">
          1. Datos Personales y Profesionales
        </label>

        {/* AVISO PASAPORTE */}
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs text-sky-900 flex items-center gap-2">
          <span className="text-base">🛂</span>
          <span className="text-[11px] font-medium leading-tight">
            Ingresa tus nombres y apellidos <strong>exactamente conforme aparecen en tu pasaporte</strong> para la emisión de certificaciones oficiales, reservas y acreditación internacional.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nombres * <span className="text-gray-400 font-normal lowercase">(según pasaporte)</span>
            </label>
            <input
              type="text"
              required
              value={formData.nombres}
              onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
              placeholder="Ej: Carlos Alberto"
              className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Apellidos * <span className="text-gray-400 font-normal lowercase">(según pasaporte)</span>
            </label>
            <input
              type="text"
              required
              value={formData.apellidos}
              onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              placeholder="Ej: Mendoza Alvarado"
              className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Profesión / Cargo Actual <span className="text-gray-400 font-normal lowercase">(opcional)</span>
            </label>
            <input
              type="text"
              value={formData.profesion}
              onChange={(e) => setFormData({ ...formData, profesion: e.target.value })}
              placeholder="Ej: Juez Penal / Fiscal / Abogado Litigante"
              className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Institución / Despacho / Universidad
            </label>
            <input
              type="text"
              value={formData.institucion}
              onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
              placeholder="Poder Judicial / Fiscalía / Bufete"
              className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tu.correo@institucion.org"
              className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Teléfono / WhatsApp *
            </label>
            <input
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+506 8888 8888"
              className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
            País de Residencia *
          </label>
          <select
            value={formData.pais}
            onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
            className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue bg-white"
          >
            {PAISES_LATINOAMERICA.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. PERFIL ACADÉMICO Y EXPERIENCIA PREVIA */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <label className="block text-xs font-black text-main-blue uppercase tracking-wider">
          2. Perfil Académico y Experiencia en la Materia
        </label>

        {/* EXPERIENCIA EN TEMAS */}
        <div>
          <span className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            ¿Posees experiencia o vinculación en alguno de estos temas? (Selecciona los que apliquen)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TEMAS_EXPERIENCIA_OPCIONES.map((tema) => {
              const checked = formData.experienciaTemas.includes(tema);
              return (
                <label
                  key={tema}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                    checked
                      ? "bg-blue-50/70 border-main-blue text-main-blue font-bold shadow-xs"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleTema(tema)}
                    className="w-4 h-4 rounded border-gray-300 text-main-blue focus:ring-main-blue cursor-pointer"
                  />
                  <span>{tema}</span>
                </label>
              );
            })}
          </div>

          {/* Campo si selecciona Otro */}
          {formData.experienciaTemas.includes("Otro") && (
            <div className="mt-2.5 animate-fade-in">
              <input
                type="text"
                value={formData.experienciaOtro}
                onChange={(e) => setFormData({ ...formData, experienciaOtro: e.target.value })}
                placeholder="Indica el área o materia específica..."
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-1 focus:ring-main-blue bg-blue-50/30"
              />
            </div>
          )}
        </div>

        {/* MOTIVACIÓN */}
        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
            ¿Por qué deseas participar en el curso? *
          </label>
          <textarea
            rows={3}
            required
            value={formData.motivoParticipacion}
            onChange={(e) => setFormData({ ...formData, motivoParticipacion: e.target.value })}
            placeholder="Describe tus expectativas, objetivos profesionales o aplicación práctica en tus labores..."
            className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue resize-none bg-white"
          />
        </div>

        {/* PREGUNTAS CONDICIONALES RÁPIDAS (CURSOS PREVIOS Y ALUMNO IIRESODH) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-200 text-xs">
          {/* Cursos previos */}
          <div className="space-y-2">
            <span className="block font-bold text-gray-800 leading-tight">
              ¿Has participado en cursos internacionales sobre estos temas anteriormente?
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
                <input
                  type="radio"
                  name="cursosPreviosStripe"
                  value="si"
                  checked={formData.cursosPrevios === "si"}
                  onChange={() => setFormData({ ...formData, cursosPrevios: "si" })}
                  className="text-main-blue focus:ring-main-blue"
                />
                <span>Sí</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
                <input
                  type="radio"
                  name="cursosPreviosStripe"
                  value="no"
                  checked={formData.cursosPrevios === "no"}
                  onChange={() => setFormData({ ...formData, cursosPrevios: "no", detalleCursosPrevios: "" })}
                  className="text-main-blue focus:ring-main-blue"
                />
                <span>No</span>
              </label>
            </div>
            {formData.cursosPrevios === "si" && (
              <input
                type="text"
                value={formData.detalleCursosPrevios}
                onChange={(e) => setFormData({ ...formData, detalleCursosPrevios: e.target.value })}
                placeholder="¿Cuáles cursos o en qué instituciones?"
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-main-blue animate-fade-in"
              />
            )}
          </div>

          {/* Ex-alumno IIRESODH */}
          <div className="space-y-2">
            <span className="block font-bold text-gray-800 leading-tight">
              ¿Has sido alumno(a) de IIRESODH anteriormente?
            </span>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
                <input
                  type="radio"
                  name="alumnoIiresodhStripe"
                  value="si"
                  checked={formData.alumnoIiresodh === "si"}
                  onChange={() => setFormData({ ...formData, alumnoIiresodh: "si" })}
                  className="text-main-blue focus:ring-main-blue"
                />
                <span className="text-emerald-700 font-bold">Sí (Comunidad IIRESODH)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
                <input
                  type="radio"
                  name="alumnoIiresodhStripe"
                  value="no"
                  checked={formData.alumnoIiresodh === "no"}
                  onChange={() => setFormData({ ...formData, alumnoIiresodh: "no" })}
                  className="text-main-blue focus:ring-main-blue"
                />
                <span>No (Primera vez)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DATOS DE TARJETA CON STRIPE ELEMENTS Y SELLO DE CONFIANZA */}
      <div className="space-y-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="block text-xs font-black text-main-blue uppercase tracking-wider">
            3. Datos de Tarjeta de Crédito / Débito
          </label>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 rounded-lg border border-sky-100 text-[10px] font-bold text-sky-800">
            <span className="inline-block w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span>Conexión Segura SSL 256-bit</span>
          </div>
        </div>

        {/* INPUT DE TARJETA CON LOGOS DE MARCAS */}
        <div className="space-y-1.5">
          <div className="p-3.5 sm:p-4 rounded-xl border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-main-blue/30 focus-within:border-main-blue shadow-xs transition">
            <CardElement options={cardElementOptions} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 pt-0.5 flex-wrap gap-1">
            <span className="flex items-center gap-1.5 font-medium text-gray-500">
              <span>Aceptamos:</span>
              <span className="font-bold text-gray-700">Visa, Mastercard, Amex, Diners, Discover</span>
            </span>
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <span>🔒</span> Cifrado bancario de punto a punto
            </span>
          </div>
        </div>
      </div>

      {/* 4. RESUMEN DE CARGO Y TÉRMINOS */}
      <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2">
        <div className="flex items-center justify-between text-gray-700">
          <span>Inversión total del curso:</span>
          <span className="font-bold text-gray-900">{simboloMoneda}{formatMonto(montoTotal)} USD</span>
        </div>
        <div className="flex items-center justify-between text-gray-700">
          <span>Modalidad de pago seleccionada:</span>
          <span className="font-bold text-sky-800 bg-sky-100/80 px-2.5 py-0.5 rounded-md border border-sky-200 text-[11px]">
            {planCuotas === 1 ? "Pago Único Completo" : `${planCuotas} Pagos Sin Intereses`}
          </span>
        </div>
        <div className="flex items-center justify-between text-main-blue font-bold text-sm border-t border-gray-200 pt-2">
          <span>Importe a cobrar hoy ({planCuotas === 1 ? "Pago total" : "1ª Cuota"}):</span>
          <span className="text-base text-main-red font-black">
            {simboloMoneda}{formatMonto(montoCuotaActual)} USD
          </span>
        </div>
        {planCuotas > 1 && (
          <p className="text-[11px] text-gray-500 font-light leading-relaxed">
            Las <strong>{planCuotas - 1} cuotas mensuales restantes</strong> de {simboloMoneda}{formatMonto(montoCuotaActual)} USD se programarán mensualmente sin ningún tipo de interés bancario ni recargo adicional.
          </p>
        )}

        {/* CLÁUSULA INFORMATIVA DE PROTECCIÓN DE DATOS - LEY N° 8968 (COSTA RICA) (COLAPSABLE, CERRADA POR DEFECTO) */}
        <details className="group bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-gray-600 leading-relaxed text-left">
          <summary className="font-bold text-gray-800 flex items-center justify-between cursor-pointer select-none text-xs list-none">
            <span className="flex items-center gap-1.5">
              <span>🛡️</span> Protección de Datos Personales (Ley N° 8968 / Costa Rica)
            </span>
            <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">▼</span>
          </summary>
          <div className="pt-2.5 space-y-2 border-t border-slate-200/60 mt-2">
            <p className="text-[11px] leading-relaxed">
              De conformidad con la Ley N° 8968 (Protección de la Persona frente al Tratamiento de sus Datos Personales), se le informa que sus datos personales y de perfil académico serán incorporados a las bases de datos de la <strong>Asociación Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)</strong>, Cédula de Persona Jurídica 3-002-671392, con la finalidad exclusiva de gestionar su postulación, registro, emisión de acreditaciones de participación y coordinación académica y administrativa del curso.
            </p>
            <p className="text-[11px] leading-relaxed text-gray-500">
              La entrega de sus datos es voluntaria, con la consecuencia de que no facilitarlos imposibilita tramitar su inscripción. Sus datos no serán cedidos a terceros con fines comerciales o publicitarios. Puede ejercer en cualquier momento sus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) escribiendo a <a href="mailto:contacto@iiresodh.org" className="text-main-blue font-bold hover:underline">contacto@iiresodh.org</a>.
            </p>
          </div>
        </details>

        <label className="flex items-start gap-2.5 pt-1 text-xs text-gray-700 font-medium cursor-pointer select-none text-left">
          <input
            type="checkbox"
            checked={aceptarTerminos}
            onChange={(e) => setAceptarTerminos(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-main-blue focus:ring-main-blue cursor-pointer"
          />
          <span className="leading-snug">
            He leído y acepto la{" "}
            <a
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-main-blue font-bold underline hover:text-light-blue"
            >
              Política de Privacidad y Protección de Datos Personales
            </a>{" "}
            de IIRESODH y autorizo expresamente el tratamiento de mis datos para los fines académicos del curso.
          </span>
        </label>
      </div>

      {/* ALERTA DE ERROR */}
      {errorPago && (
        <Alert severity="error" sx={{ borderRadius: "12px", fontSize: "12px" }}>
          {errorPago}
        </Alert>
      )}

      {/* BOTÓN DE ACCIÓN */}
      <div className="space-y-3">

        <button
          type="submit"
          disabled={loadingPago || !stripe}
          className="w-full bg-main-red hover:bg-red-800 disabled:bg-gray-400 text-white font-bold text-xs uppercase tracking-widest py-4 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
        >
          {loadingPago ? (
            <>
              <CircularProgress size={16} thickness={5} sx={{ color: "white" }} />
              <span>Procesando inscripción y pago seguro...</span>
            </>
          ) : (
            <>
              <span>🔒 Confirmar Pago de {simboloMoneda}{formatMonto(montoCuotaActual)} USD</span>
              {planCuotas > 1 && (
                <span className="text-[10px] bg-red-950/40 px-2 py-0.5 rounded-full font-medium">
                  Cuota 1 de {planCuotas}
                </span>
              )}
            </>
          )}
        </button>

        <p className="text-[11px] text-gray-500 text-center leading-relaxed">
          Al confirmar tu pago recibirás inmediatamente el recibo oficial y la confirmación de matrícula en tu correo electrónico.
        </p>

        {/* ALTERNATIVAS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px] text-gray-500 text-center sm:text-left">
          {landing?.enlaceStripe && (
            <a
              href={landing.enlaceStripe}
              target="_blank"
              rel="noopener noreferrer"
              className="text-main-blue hover:underline font-semibold flex items-center gap-1"
            >
              <span>🔗 O pagar vía Stripe Checkout externo</span>
            </a>
          )}
          
          {onSwitchToTransferencia && (
            <button
              type="button"
              onClick={onSwitchToTransferencia}
              className="text-gray-600 hover:text-main-blue font-medium underline cursor-pointer"
            >
              🏛️ ¿Prefieres transferencia bancaria institucional?
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

// Wrapper exportado que incluye el Provider <Elements>
export default function FormularioPagoCurso({
  curso,
  landing,
  planCuotas,
  setPlanCuotas,
  onSwitchToTransferencia
}) {
  return (
    <Elements stripe={stripeCursosPromise}>
      <CheckoutFormCurso 
        curso={curso} 
        landing={landing} 
        planCuotas={planCuotas}
        setPlanCuotas={setPlanCuotas}
        onSwitchToTransferencia={onSwitchToTransferencia} 
      />
    </Elements>
  );
}
