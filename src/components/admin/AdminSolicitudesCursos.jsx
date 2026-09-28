// src/components/admin/AdminSolicitudesCursos.jsx
import { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Snackbar, 
  Alert,
  Select,
  MenuItem,
  FormControl
} from "@mui/material";

export default function AdminSolicitudesCursos({ onVolver, logActividad }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroMetodo, setFiltroMetodo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [actualizandoId, setActualizandoId] = useState(null);

  // Alertas
  const [alerta, setAlerta] = useState({ open: false, mensaje: "", esError: false });
  // Modal de confirmación para eliminar
  const [modalBorrar, setModalBorrar] = useState({ open: false, id: null, nombre: "" });

  const mostrarToast = (mensaje, esError = false) => {
    setAlerta({ open: true, mensaje, esError });
  };

  const cargarSolicitudes = async () => {
    setCargando(true);
    try {
      const q = query(
        collection(db, "solicitudesCursos"),
        orderBy("fechaSolicitud", "desc")
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSolicitudes(items);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      mostrarToast("Error al cargar las solicitudes de cursos.", true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const handleCambiarEstado = async (id, nuevoEstado, solicitudActual) => {
    setActualizandoId(id);
    try {
      const docRef = doc(db, "solicitudesCursos", id);
      await updateDoc(docRef, { estado: nuevoEstado });

      setSolicitudes(prev =>
        prev.map(s => (s.id === id ? { ...s, estado: nuevoEstado } : s))
      );

      mostrarToast(`Estado actualizado a: ${nuevoEstado}`);

      if (logActividad) {
        logActividad(
          `Actualizó estado de solicitud de curso (${solicitudActual.nombre || id}) a "${nuevoEstado}"`,
          { id, estadoAnterior: solicitudActual.estado, nuevoEstado }
        );
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      mostrarToast("No se pudo actualizar el estado de la solicitud.", true);
    } finally {
      setActualizandoId(null);
    }
  };

  const confirmarBorrado = async () => {
    if (!modalBorrar.id) return;
    try {
      await deleteDoc(doc(db, "solicitudesCursos", modalBorrar.id));
      setSolicitudes(prev => prev.filter(s => s.id !== modalBorrar.id));
      mostrarToast("Solicitud eliminada con éxito.");

      if (logActividad) {
        logActividad(
          `Eliminó solicitud de curso de "${modalBorrar.nombre || modalBorrar.id}"`,
          { id: modalBorrar.id, nombre: modalBorrar.nombre }
        );
      }
    } catch (error) {
      console.error("Error al eliminar solicitud:", error);
      mostrarToast("Error al eliminar la solicitud.", true);
    } finally {
      setModalBorrar({ open: false, id: null, nombre: "" });
    }
  };

  const exportarCSV = () => {
    if (solicitudes.length === 0) {
      mostrarToast("No hay solicitudes para exportar.", true);
      return;
    }

    const headers = [
      "Fecha",
      "Estado",
      "Nombre",
      "Email",
      "Teléfono",
      "Profesión",
      "Institución",
      "País",
      "Ex-alumno IIRESODH",
      "Experiencia en Temas",
      "Cursos Previos Internacionales",
      "Motivo Participación",
      "Método de Pago",
      "Plan Cuotas",
      "Cuotas Pagadas",
      "Monto Pagado USD",
      "Monto Total Inversión USD",
      "Saldo Pendiente USD",
      "ID Stripe PaymentIntent",
      "Curso",
      "Comentarios"
    ];

    const rows = solicitudes.map(s => {
      const fecha = s.fechaSolicitud?.toDate
        ? s.fechaSolicitud.toDate().toLocaleString("es-CR")
        : s.fechaSolicitud?.seconds
        ? new Date(s.fechaSolicitud.seconds * 1000).toLocaleString("es-CR")
        : "Sin fecha";

      const temas = Array.isArray(s.experienciaTemas)
        ? s.experienciaTemas.join("; ")
        : (s.experienciaTemas || "");

      return [
        `"${fecha}"`,
        `"${s.estado || 'pendiente'}"`,
        `"${(s.nombre || '').replace(/"/g, '""')}"`,
        `"${(s.email || '').replace(/"/g, '""')}"`,
        `"${(s.telefono || '').replace(/"/g, '""')}"`,
        `"${(s.profesion || '').replace(/"/g, '""')}"`,
        `"${(s.institucion || '').replace(/"/g, '""')}"`,
        `"${(s.pais || '').replace(/"/g, '""')}"`,
        `"${s.alumnoIiresodh === 'si' ? 'SÍ' : 'NO'}"`,
        `"${temas.replace(/"/g, '""')}"`,
        `"${(s.cursosPrevios || 'No').replace(/"/g, '""')}"`,
        `"${(s.motivoParticipacion || '').replace(/"/g, '""')}"`,
        `"${s.metodoPago === 'stripe' ? 'Tarjeta en Línea (Stripe)' : 'Transferencia Bancaria'}"`,
        `"${s.planCuotas ? `${s.planCuotas} cuota(s)` : 'Pago único'}"`,
        `"${s.cuotasPagadas || (s.metodoPago === 'stripe' ? 1 : 0)}"`,
        `"${s.montoPagado || (s.metodoPago === 'stripe' ? 3350 : 0)}"`,
        `"${s.montoTotalInversion || 3350}"`,
        `"${s.saldoPendiente !== undefined ? s.saldoPendiente : (s.metodoPago === 'stripe' ? 0 : 3350)}"`,
        `"${(s.stripePaymentIntentId || s.stripeSessionId || '').replace(/"/g, '""')}"`,
        `"${(s.cursoTitulo || s.cursoId || '').replace(/"/g, '""')}"`,
        `"${(s.comentarios || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `solicitudes_cursos_iiresodh_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mostrarToast("Reporte CSV detallado descargado con éxito.");
  };

  // Filtrado
  const solicitudesFiltradas = solicitudes.filter(s => {
    const cumpleEstado = filtroEstado === "todos" || (s.estado || "pendiente") === filtroEstado;
    const cumpleMetodo = filtroMetodo === "todos" || (s.metodoPago || "transferencia") === filtroMetodo;

    const busq = busqueda.toLowerCase().trim();
    if (!busq) return cumpleEstado && cumpleMetodo;

    const temasStr = Array.isArray(s.experienciaTemas) ? s.experienciaTemas.join(" ") : (s.experienciaTemas || "");
    const textoCompleto = `${s.nombre || ""} ${s.email || ""} ${s.telefono || ""} ${s.profesion || ""} ${s.institucion || ""} ${s.pais || ""} ${s.cursoTitulo || ""} ${temasStr} ${s.stripePaymentIntentId || ""}`.toLowerCase();
    return cumpleEstado && cumpleMetodo && textoCompleto.includes(busq);
  });

  const conteoPendientes = solicitudes.filter(s => (s.estado || "pendiente") === "pendiente").length;
  const conteoContactados = solicitudes.filter(s => s.estado === "contactado").length;
  const conteoConfirmados = solicitudes.filter(s => s.estado === "confirmado").length;
  const conteoStripe = solicitudes.filter(s => s.metodoPago === "stripe").length;
  const totalRecaudadoStripe = solicitudes
    .filter(s => s.metodoPago === "stripe")
    .reduce((acc, s) => acc + (Number(s.montoPagado) || 0), 0);

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "Sin fecha";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
      return date.toLocaleString("es-CR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Fecha no disponible";
    }
  };

  const getBadgeEstado = (estado = "pendiente") => {
    switch (estado) {
      case "contactado":
        return {
          bg: "bg-blue-100 text-blue-900 border-blue-300 font-bold",
          label: "Contactado"
        };
      case "confirmado":
        return {
          bg: "bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold",
          label: "Inscrito / Confirmado"
        };
      case "cancelado":
        return {
          bg: "bg-gray-100 text-gray-700 border-gray-300",
          label: "Cancelado"
        };
      default:
        return {
          bg: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
          label: "Pendiente de Validación"
        };
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* BARRA SUPERIOR DE ACCIONES */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 text-gray-700 font-medium hover:text-main-blue transition-colors cursor-pointer group py-1"
        >
          <div className="bg-white p-2.5 rounded-full shadow-xs group-hover:shadow border border-gray-200 transition-all">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="text-sm font-semibold">Regresar a Gestión de Cursos</span>
        </button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outlined"
            onClick={cargarSolicitudes}
            disabled={cargando}
            fullWidth
            sx={{
              borderColor: "#d1d5db",
              color: "#374151",
              textTransform: "none",
              fontSize: "13px",
              py: 1,
              borderRadius: "12px",
              fontWeight: 600,
              bgcolor: "white",
              "&:hover": { borderColor: "#1D3557", color: "#1D3557", bgcolor: "#f9fafb" }
            }}
          >
            🔄 Actualizar
          </Button>

          <Button
            variant="contained"
            onClick={exportarCSV}
            disabled={cargando || solicitudes.length === 0}
            fullWidth
            sx={{
              bgcolor: "#1D3557",
              textTransform: "none",
              fontSize: "13px",
              py: 1,
              borderRadius: "12px",
              fontWeight: 700,
              boxShadow: "0 2px 4px rgba(29, 53, 87, 0.15)",
              "&:hover": { bgcolor: "#14253d" }
            }}
          >
            📥 Exportar CSV Completo
          </Button>
        </div>
      </div>

      {/* TARJETA PRINCIPAL */}
      <section className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200 space-y-6">
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl">🎓</span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-main-blue tracking-tight">
                  Inscripciones y Solicitudes de Cursos
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                Visualiza datos académicos completos, planes de financiamiento (1 a 4 cuotas sin interés), pagos en línea con Stripe y postulaciones por transferencia.
              </p>
            </div>

            {/* CONTADORES Y MÉTRICAS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
              <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Pendientes</span>
                <span className="text-xl font-black text-amber-900 leading-tight">{conteoPendientes}</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Contactados</span>
                <span className="text-xl font-black text-blue-900 leading-tight">{conteoContactados}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Confirmados</span>
                <span className="text-xl font-black text-emerald-900 leading-tight">{conteoConfirmados}</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-indigo-800 block">Stripe Online</span>
                <span className="text-xl font-black text-indigo-900 leading-tight">{conteoStripe}</span>
                {totalRecaudadoStripe > 0 && (
                  <span className="text-[9px] font-bold text-indigo-700 block mt-0.5">
                    ${totalRecaudadoStripe.toLocaleString()} USD
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FILTROS Y BÚSQUEDA */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Buscador general */}
            <div className="md:col-span-6">
              <div className="relative">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="🔍 Buscar por nombre, profesión, email, país, tema..."
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-main-blue focus:ring-2 focus:ring-blue-100 bg-gray-50 focus:bg-white transition-all"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por método de pago */}
            <div className="md:col-span-3">
              <select
                value={filtroMetodo}
                onChange={(e) => setFiltroMetodo(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:border-main-blue"
              >
                <option value="todos">Todos los Métodos de Pago</option>
                <option value="stripe">💳 Tarjeta / Stripe Online</option>
                <option value="transferencia">🏛️ Transferencia Bancaria</option>
              </select>
            </div>

            {/* Estado rápido */}
            <div className="md:col-span-3">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:border-main-blue"
              >
                <option value="todos">Todos los Estados ({solicitudes.length})</option>
                <option value="pendiente">⏳ Pendientes ({conteoPendientes})</option>
                <option value="contactado">📞 Contactados ({conteoContactados})</option>
                <option value="confirmado">✅ Confirmados ({conteoConfirmados})</option>
                <option value="cancelado">❌ Cancelados</option>
              </select>
            </div>
          </div>

          {/* Pastillas de filtro de estado para acceso rápido */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { id: "todos", label: `Todos (${solicitudes.length})` },
              { id: "pendiente", label: `Pendientes (${conteoPendientes})` },
              { id: "contactado", label: `Contactados (${conteoContactados})` },
              { id: "confirmado", label: `Inscritos / Confirmados (${conteoConfirmados})` },
              { id: "cancelado", label: "Cancelados" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFiltroEstado(f.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filtroEstado === f.id
                    ? "bg-main-blue text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* LISTADO DE SOLICITUDES */}
        {cargando ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <CircularProgress size={42} thickness={4} sx={{ color: "#1D3557" }} />
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase animate-pulse">
              Cargando inscripciones y expedientes...
            </span>
          </div>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <span className="text-4xl">📭</span>
            <h3 className="text-base font-bold text-gray-700">No se encontraron inscripciones</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {solicitudes.length === 0
                ? "Aún no se han recibido registros a través del formulario del curso."
                : "No hay solicitudes que coincidan con los filtros o el texto de búsqueda ingresado."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudesFiltradas.map(solicitud => {
              const badge = getBadgeEstado(solicitud.estado);
              const cleanPhone = (solicitud.telefono || "").replace(/[^0-9+]/g, "");
              const esStripe = solicitud.metodoPago === "stripe";
              const planCuotas = Number(solicitud.planCuotas) || 1;
              const cuotasPagadas = Number(solicitud.cuotasPagadas) || (esStripe ? 1 : 0);
              const montoPagado = Number(solicitud.montoPagado) || (esStripe ? 3350 : 0);
              const montoTotal = Number(solicitud.montoTotalInversion) || 3350;
              const saldoPendiente = solicitud.saldoPendiente !== undefined 
                ? Number(solicitud.saldoPendiente) 
                : Math.max(0, montoTotal - montoPagado);

              // Formato de temas
              const temas = Array.isArray(solicitud.experienciaTemas)
                ? solicitud.experienciaTemas
                : (solicitud.experienciaTemas ? [solicitud.experienciaTemas] : []);

              const esExAlumno = solicitud.alumnoIiresodh === "si";

              return (
                <article
                  key={solicitud.id}
                  className={`p-4 sm:p-6 bg-white border rounded-2xl shadow-xs hover:shadow-md transition-all space-y-4 ${
                    esStripe ? "border-indigo-200 bg-gradient-to-br from-white via-white to-indigo-50/20" : "border-gray-200"
                  }`}
                >
                  {/* CABECERA DE LA TARJETA */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] px-3 py-1 rounded-full border ${badge.bg}`}>
                        ● {badge.label}
                      </span>

                      {/* Badge Método de Pago */}
                      {esStripe ? (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-1">
                          💳 Pago con Tarjeta (Stripe)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                          🏛️ Transferencia Bancaria
                        </span>
                      )}

                      {/* Badge Ex-alumno */}
                      {esExAlumno && (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          ⭐ Ex-alumno IIRESODH
                        </span>
                      )}

                      <span className="text-xs text-gray-500 font-medium">
                        🕒 {formatearFecha(solicitud.fechaSolicitud)}
                      </span>
                    </div>

                    {/* SELECTOR DE ESTADO DIRECTO */}
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">
                        Estado:
                      </span>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={solicitud.estado || "pendiente"}
                          disabled={actualizandoId === solicitud.id}
                          onChange={(e) => handleCambiarEstado(solicitud.id, e.target.value, solicitud)}
                          sx={{
                            fontSize: "12px",
                            fontWeight: 600,
                            borderRadius: "10px",
                            bgcolor: "white",
                            height: "34px"
                          }}
                        >
                          <MenuItem value="pendiente">Pendiente</MenuItem>
                          <MenuItem value="contactado">Contactado</MenuItem>
                          <MenuItem value="confirmado">Confirmado / Inscrito</MenuItem>
                          <MenuItem value="cancelado">Cancelado</MenuItem>
                        </Select>
                      </FormControl>

                      <button
                        type="button"
                        onClick={() => setModalBorrar({ open: true, id: solicitud.id, nombre: solicitud.nombre })}
                        title="Eliminar solicitud"
                        className="p-2 text-gray-400 hover:text-main-red hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* CUERPO CON DETALLES DE PAGO Y PERFIL */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* COLUMNA 1: DATOS PERSONALES Y PROFESIÓN */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Participante y Perfil
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                        {solicitud.nombre || "Sin nombre registrado"}
                      </h4>
                      
                      {solicitud.profesion && (
                        <p className="text-xs font-semibold text-main-blue bg-blue-50/70 border border-blue-100 px-2.5 py-1 rounded-lg inline-block">
                          💼 {solicitud.profesion}
                        </p>
                      )}

                      {solicitud.institucion && (
                        <p className="text-xs text-gray-600">
                          🏛️ {solicitud.institucion}
                        </p>
                      )}

                      <p className="text-xs text-gray-600">
                        🌍 País: <span className="font-semibold text-gray-800">{solicitud.pais || "No especificado"}</span>
                      </p>

                      <div className="pt-2 flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">✉️</span>
                          <a
                            href={`mailto:${solicitud.email}`}
                            className="text-main-blue hover:underline font-bold truncate max-w-[220px]"
                          >
                            {solicitud.email}
                          </a>
                        </div>
                        {solicitud.telefono ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">📱</span>
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                              title="Chatear por WhatsApp"
                            >
                              {solicitud.telefono}
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                                WhatsApp
                              </span>
                            </a>
                          </div>
                        ) : (
                          <p className="text-gray-400 italic">Sin teléfono registrado</p>
                        )}
                      </div>
                    </div>

                    {/* COLUMNA 2: DETALLES FINANCIEROS Y DE PAGO */}
                    <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Estado Financiero y Plan de Pago
                      </span>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Inversión total:</span>
                          <span className="font-extrabold text-gray-900">${montoTotal.toLocaleString()} USD</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Plan de financiamiento:</span>
                          <span className="font-bold text-main-blue">
                            {planCuotas > 1 ? `${planCuotas} pagos sin interés` : "Pago único (1 cuota)"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Monto abonado:</span>
                          <span className={`font-black ${montoPagado > 0 ? "text-emerald-700" : "text-gray-600"}`}>
                            ${montoPagado.toLocaleString()} USD
                            {planCuotas > 1 && ` (${cuotasPagadas}/${planCuotas} cuotas)`}
                          </span>
                        </div>

                        {saldoPendiente > 0 ? (
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                            <span className="text-amber-800 font-bold">Saldo por liquidar:</span>
                            <span className="font-black text-amber-900">${saldoPendiente.toLocaleString()} USD</span>
                          </div>
                        ) : (
                          <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-center">
                            ✓ Inversión Liquidada al 100%
                          </div>
                        )}

                        {solicitud.stripePaymentIntentId && (
                          <div className="pt-1.5 border-t border-slate-200 text-[10px] text-gray-500">
                            <span className="block font-semibold text-gray-600">ID Transacción Stripe:</span>
                            <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 block truncate text-slate-700 font-mono select-all">
                              {solicitud.stripePaymentIntentId}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLUMNA 3: EXPERIENCIA, MOTIVACIÓN Y COMENTARIOS */}
                    <div className="space-y-2.5">
                      {/* Áreas de Experiencia */}
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Experiencia en los Temas
                        </span>
                        {temas.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {temas.map((tema, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200"
                              >
                                {tema}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No especificó áreas temáticas.</p>
                        )}
                      </div>

                      {/* Cursos Internacionales Previos */}
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                          Cursos Internacionales Previos
                        </span>
                        <p className="text-xs text-gray-800 font-medium">
                          {solicitud.cursosPrevios || "No registrado"}
                        </p>
                      </div>

                      {/* Motivación */}
                      {solicitud.motivoParticipacion && (
                        <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-0.5">
                            Motivo de Participación
                          </span>
                          <p className="text-xs text-gray-700 italic leading-snug line-clamp-3 hover:line-clamp-none transition-all">
                            "{solicitud.motivoParticipacion}"
                          </p>
                        </div>
                      )}

                      {/* Comentarios Adicionales */}
                      {solicitud.comentarios && (
                        <div className="text-xs text-gray-500">
                          <span className="font-semibold text-gray-600 block text-[10px] uppercase">
                            Notas del Registro:
                          </span>
                          <p className="italic text-gray-600 line-clamp-2 hover:line-clamp-none">
                            {solicitud.comentarios}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* DIALOG DE CONFIRMACIÓN DE BORRADO */}
      <Dialog
        open={modalBorrar.open}
        onClose={() => setModalBorrar({ open: false, id: null, nombre: "" })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#1D3557" }}>
          ¿Eliminar solicitud?
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar permanentemente la solicitud de{" "}
            <strong>{modalBorrar.nombre || "este usuario"}</strong>? Esta acción no se puede deshacer.
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setModalBorrar({ open: false, id: null, nombre: "" })}
            sx={{ textTransform: "none", color: "#6b7280" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmarBorrado}
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: "#B92F32",
              "&:hover": { bgcolor: "#8b1d20" }
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR DE NOTIFICACIONES */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={4000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlerta({ ...alerta, open: false })}
          severity={alerta.esError ? "error" : "success"}
          sx={{ width: "100%", borderRadius: "14px" }}
        >
          {alerta.mensaje}
        </Alert>
      </Snackbar>
    </div>
  );
}
