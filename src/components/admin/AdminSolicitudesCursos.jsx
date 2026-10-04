// src/components/admin/AdminSolicitudesCursos.jsx
import { useState, useEffect, useMemo } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query, 
  orderBy,
  serverTimestamp 
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
  FormControl,
  TextField,
  InputLabel
} from "@mui/material";
import { PAISES_LATINOAMERICA } from "../../data/paisesLatinoamerica";

export default function AdminSolicitudesCursos({ onVolver, logActividad, cursoInicial }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [filtroCurso, setFiltroCurso] = useState(
    cursoInicial?.slug || cursoInicial?.id || ""
  );
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroMetodo, setFiltroMetodo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [actualizandoId, setActualizandoId] = useState(null);

  // Alertas
  const [alerta, setAlerta] = useState({ open: false, mensaje: "", esError: false });
  // Modal de confirmación para eliminar
  const [modalBorrar, setModalBorrar] = useState({ open: false, id: null, nombre: "" });

  // Modal para Registro Manual de Participante (por WhatsApp, email o llamada)
  const [modalManual, setModalManual] = useState(false);
  const [guardandoManual, setGuardandoManual] = useState(false);
  const [formManual, setFormManual] = useState({
    cursoKey: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    pais: "Costa Rica",
    profesion: "",
    institucion: "",
    metodoPago: "transferencia",
    planCuotas: 1,
    montoTotalInversion: 3350,
    montoPagado: 0,
    estado: "contactado",
    comentarios: ""
  });

  const mostrarToast = (mensaje, esError = false) => {
    setAlerta({ open: true, mensaje, esError });
  };

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // 1. Cargar solicitudes
      const qSolicitudes = query(
        collection(db, "solicitudesCursos"),
        orderBy("fechaSolicitud", "desc")
      );
      const snapshotSolicitudes = await getDocs(qSolicitudes);
      const itemsSolicitudes = snapshotSolicitudes.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSolicitudes(itemsSolicitudes);

      // 2. Cargar cursos oficiales
      const snapshotCursos = await getDocs(collection(db, "cursos"));
      const itemsCursos = snapshotCursos.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCursos(itemsCursos);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      mostrarToast("Error al cargar las solicitudes y cursos.", true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Construir catálogo de cursos disponibles combinando 'cursos' y 'solicitudesCursos'
  const cursosDisponibles = useMemo(() => {
    const map = new Map();

    // Cursos desde la colección 'cursos'
    cursos.forEach(c => {
      const key = c.slug || c.id;
      map.set(key, {
        key,
        id: c.id,
        slug: c.slug || c.id,
        titulo: c.titulo || c.slug || c.id,
        alias: [c.id, c.slug, c.titulo].filter(Boolean).map(x => String(x).toLowerCase().trim())
      });
    });

    // Detectar cursos adicionales presentes en solicitudes
    solicitudes.forEach(s => {
      const keyCandidate = s.cursoId || s.cursoTitulo || "palermo-2027";
      const rawTitulo = s.cursoTitulo || s.cursoId || "Curso Internacional";

      let matched = false;
      for (const [, cursoItem] of map.entries()) {
        if (
          cursoItem.alias.includes(String(s.cursoId || "").toLowerCase().trim()) ||
          cursoItem.alias.includes(String(s.cursoTitulo || "").toLowerCase().trim())
        ) {
          matched = true;
          break;
        }
      }

      if (!matched) {
        map.set(keyCandidate, {
          key: keyCandidate,
          id: s.cursoId || keyCandidate,
          slug: s.cursoId || keyCandidate,
          titulo: rawTitulo,
          alias: [s.cursoId, s.cursoTitulo].filter(Boolean).map(x => String(x).toLowerCase().trim())
        });
      }
    });

    // Si aún no hay ninguno, aseguramos Palermo 2027 por defecto
    if (map.size === 0) {
      map.set("palermo-2027", {
        key: "palermo-2027",
        id: "palermo-2027",
        slug: "palermo-2027",
        titulo: "Curso Internacional 2027 - Palermo",
        alias: ["palermo-2027", "curso internacional 2027 - palermo"]
      });
    }

    // Calcular conteo por curso
    return Array.from(map.values()).map(c => {
      const conteo = solicitudes.filter(s => {
        const sid = String(s.cursoId || "").toLowerCase().trim();
        const stit = String(s.cursoTitulo || "").toLowerCase().trim();
        return c.alias.includes(sid) || c.alias.includes(stit);
      }).length;
      return { ...c, conteoTotal: conteo };
    });
  }, [cursos, solicitudes]);

  // Selección automática del primer curso si filtroCurso está vacío
  useEffect(() => {
    if (!filtroCurso && cursosDisponibles.length > 0) {
      if (cursoInicial?.slug || cursoInicial?.id) {
        const matching = cursosDisponibles.find(
          c => c.key === cursoInicial.slug || c.key === cursoInicial.id || c.id === cursoInicial.id
        );
        if (matching) {
          setFiltroCurso(matching.key);
          return;
        }
      }
      setFiltroCurso(cursosDisponibles[0].key);
    }
  }, [cursosDisponibles, cursoInicial, filtroCurso]);

  // Objeto del curso actualmente activo
  const cursoActivoObj = useMemo(() => {
    if (filtroCurso === "todos") {
      return { key: "todos", titulo: "Todos los Cursos Académicos (Consolidado)" };
    }
    return cursosDisponibles.find(c => c.key === filtroCurso) || cursosDisponibles[0] || null;
  }, [cursosDisponibles, filtroCurso]);

  // Comprobar si una solicitud pertenece al curso seleccionado
  const esDeCurso = (s, cursoKey) => {
    if (!cursoKey || cursoKey === "todos") return true;
    const target = cursosDisponibles.find(c => c.key === cursoKey);
    if (!target) {
      return s.cursoId === cursoKey || s.cursoTitulo === cursoKey;
    }
    const sid = String(s.cursoId || "").toLowerCase().trim();
    const stit = String(s.cursoTitulo || "").toLowerCase().trim();
    return target.alias.includes(sid) || target.alias.includes(stit);
  };

  // 1. Solicitudes aisladas del curso seleccionado (para estadísticas y conteos exactos)
  const solicitudesDelCurso = useMemo(() => {
    if (filtroCurso === "todos") return solicitudes;
    return solicitudes.filter(s => esDeCurso(s, filtroCurso));
  }, [solicitudes, filtroCurso, cursosDisponibles]);

  // Métricas del curso seleccionado
  const conteoPendientes = solicitudesDelCurso.filter(s => (s.estado || "pendiente") === "pendiente").length;
  const conteoContactados = solicitudesDelCurso.filter(s => s.estado === "contactado").length;
  const conteoConfirmados = solicitudesDelCurso.filter(s => s.estado === "confirmado").length;
  const conteoStripe = solicitudesDelCurso.filter(s => s.metodoPago === "stripe").length;
  const totalRecaudadoStripe = solicitudesDelCurso
    .filter(s => s.metodoPago === "stripe")
    .reduce((acc, s) => acc + (Number(s.montoPagado) || 0), 0);

  // 2. Solicitudes filtradas por método de pago, estado secundario y buscador
  const solicitudesFiltradas = useMemo(() => {
    return solicitudesDelCurso.filter(s => {
      const cumpleEstado = filtroEstado === "todos" || (s.estado || "pendiente") === filtroEstado;
      const cumpleMetodo = filtroMetodo === "todos" || (s.metodoPago || "transferencia") === filtroMetodo;

      const busq = busqueda.toLowerCase().trim();
      if (!busq) return cumpleEstado && cumpleMetodo;

      const temasStr = Array.isArray(s.experienciaTemas) ? s.experienciaTemas.join(" ") : (s.experienciaTemas || "");
      const textoCompleto = `${s.nombre || ""} ${s.nombres || ""} ${s.apellidos || ""} ${s.email || ""} ${s.telefono || ""} ${s.profesion || ""} ${s.institucion || ""} ${s.pais || ""} ${s.cursoTitulo || ""} ${temasStr} ${s.stripePaymentIntentId || ""}`.toLowerCase();
      return cumpleEstado && cumpleMetodo && textoCompleto.includes(busq);
    });
  }, [solicitudesDelCurso, filtroEstado, filtroMetodo, busqueda]);

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

  // Abrir modal de registro manual con el curso activo preseleccionado
  const abrirRegistroManual = () => {
    setFormManual({
      cursoKey: filtroCurso !== "todos" ? filtroCurso : (cursosDisponibles[0]?.key || "palermo-2027"),
      nombres: "",
      apellidos: "",
      email: "",
      telefono: "",
      pais: "Costa Rica",
      profesion: "",
      institucion: "",
      metodoPago: "transferencia",
      planCuotas: 1,
      montoTotalInversion: 3350,
      montoPagado: 0,
      estado: "contactado",
      comentarios: ""
    });
    setModalManual(true);
  };

  const handleGuardarManual = async (e) => {
    e.preventDefault();
    if (!formManual.nombres.trim() || !formManual.apellidos.trim() || !formManual.email.trim()) {
      mostrarToast("Nombres, apellidos y correo electrónico son obligatorios.", true);
      return;
    }

    setGuardandoManual(true);
    try {
      const cursoElegido = cursosDisponibles.find(c => c.key === formManual.cursoKey) || {
        key: formManual.cursoKey,
        id: formManual.cursoKey,
        titulo: "Curso Internacional"
      };

      const nombreCompleto = `${formManual.nombres.trim()} ${formManual.apellidos.trim()}`;
      const totalInv = Number(formManual.montoTotalInversion) || 3350;
      const pagado = Number(formManual.montoPagado) || 0;
      const cuotas = Number(formManual.planCuotas) || 1;

      const nuevaData = {
        cursoId: cursoElegido.id || cursoElegido.key,
        cursoTitulo: cursoElegido.titulo,
        nombre: nombreCompleto,
        nombres: formManual.nombres.trim(),
        apellidos: formManual.apellidos.trim(),
        email: formManual.email.trim(),
        telefono: formManual.telefono.trim(),
        pais: formManual.pais,
        profesion: formManual.profesion.trim(),
        institucion: formManual.institucion.trim(),
        metodoPago: formManual.metodoPago,
        planCuotas: cuotas,
        cuotasPagadas: pagado > 0 ? 1 : 0,
        montoTotalInversion: totalInv,
        montoPagado: pagado,
        saldoPendiente: Math.max(0, totalInv - pagado),
        estado: formManual.estado || "contactado",
        origen: "manual_admin",
        comentarios: formManual.comentarios.trim(),
        aceptaPoliticaPrivacidad: true,
        versionPoliticaPrivacidad: "2026-09-12",
        constanciaPrivacidad: "Registro administrativo directo en panel.",
        fechaSolicitud: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "solicitudesCursos"), nuevaData);

      // Prepend a estado local
      const nuevoItemLocal = {
        id: docRef.id,
        ...nuevaData,
        fechaSolicitud: new Date()
      };

      setSolicitudes(prev => [nuevoItemLocal, ...prev]);

      mostrarToast(`Participante "${nombreCompleto}" registrado exitosamente como ${formManual.estado}.`);

      if (logActividad) {
        logActividad(
          `Registró manualmente a "${nombreCompleto}" en el curso "${cursoElegido.titulo}" con estado "${formManual.estado}"`,
          { id: docRef.id, nombre: nombreCompleto, curso: cursoElegido.titulo }
        );
      }

      setModalManual(false);
    } catch (error) {
      console.error("Error al registrar manualmente:", error);
      mostrarToast("Error al guardar el participante en el curso.", true);
    } finally {
      setGuardandoManual(false);
    }
  };

  const exportarCSV = () => {
    if (solicitudesDelCurso.length === 0) {
      mostrarToast("No hay solicitudes para exportar en este curso.", true);
      return;
    }

    const headers = [
      "Fecha",
      "Estado",
      "Nombre",
      "Nombres",
      "Apellidos",
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
      "Consentimiento Ley 8968",
      "Fecha Aceptación Privacidad",
      "Versión Política",
      "Curso",
      "Comentarios"
    ];

    const rows = solicitudesDelCurso.map(s => {
      const fecha = s.fechaSolicitud?.toDate
        ? s.fechaSolicitud.toDate().toLocaleString("es-CR")
        : s.fechaSolicitud?.seconds
        ? new Date(s.fechaSolicitud.seconds * 1000).toLocaleString("es-CR")
        : "Sin fecha";

      const fechaPrivacidad = s.fechaAceptacionPrivacidad?.toDate
        ? s.fechaAceptacionPrivacidad.toDate().toLocaleString("es-CR")
        : s.fechaAceptacionPrivacidad?.seconds
        ? new Date(s.fechaAceptacionPrivacidad.seconds * 1000).toLocaleString("es-CR")
        : (s.aceptaPoliticaPrivacidad ? "Aceptado al registrarse" : "No registrado");

      const temas = Array.isArray(s.experienciaTemas)
        ? s.experienciaTemas.join("; ")
        : (s.experienciaTemas || "");

      return [
        `"${fecha}"`,
        `"${s.estado || 'pendiente'}"`,
        `"${(s.nombre || '').replace(/"/g, '""')}"`,
        `"${(s.nombres || '').replace(/"/g, '""')}"`,
        `"${(s.apellidos || '').replace(/"/g, '""')}"`,
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
        `"${s.aceptaPoliticaPrivacidad ? 'SÍ (Otorgado)' : 'No registrado'}"`,
        `"${fechaPrivacidad}"`,
        `"${s.versionPoliticaPrivacidad || '2026-09-12'}"`,
        `"${(s.cursoTitulo || s.cursoId || '').replace(/"/g, '""')}"`,
        `"${(s.comentarios || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const safeSlug = (cursoActivoObj?.slug || cursoActivoObj?.key || "curso")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_");
    link.setAttribute("download", `solicitudes_${safeSlug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mostrarToast(`Reporte CSV de "${cursoActivoObj?.titulo || 'Curso'}" descargado con éxito.`);
  };

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

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="contained"
            onClick={abrirRegistroManual}
            sx={{
              bgcolor: "#B92F32",
              textTransform: "none",
              fontSize: "13px",
              py: 1,
              px: 2,
              borderRadius: "12px",
              fontWeight: 700,
              boxShadow: "0 2px 4px rgba(185, 47, 50, 0.25)",
              "&:hover": { bgcolor: "#8b1d20" }
            }}
          >
            ➕ Registrar Participante Manual
          </Button>

          <Button
            variant="outlined"
            onClick={cargarDatos}
            disabled={cargando}
            sx={{
              borderColor: "#d1d5db",
              color: "#374151",
              textTransform: "none",
              fontSize: "13px",
              py: 1,
              px: 2,
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
            disabled={cargando || solicitudesDelCurso.length === 0}
            sx={{
              bgcolor: "#1D3557",
              textTransform: "none",
              fontSize: "13px",
              py: 1,
              px: 2,
              borderRadius: "12px",
              fontWeight: 700,
              boxShadow: "0 2px 4px rgba(29, 53, 87, 0.15)",
              "&:hover": { bgcolor: "#14253d" }
            }}
          >
            📥 Exportar CSV ({solicitudesDelCurso.length})
          </Button>
        </div>
      </div>

      {/* SELECTOR EXCLUSIVO DE CURSO PARA AISLAR COMPLETAMENTE LOS DATOS */}
      <section className="bg-gradient-to-r from-slate-900 via-main-blue to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-md space-y-4 border border-blue-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20 shrink-0">
              🎓
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-amber-300 font-extrabold block">
                Expedientes del Curso Seleccionado:
              </span>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight">
                {cursoActivoObj?.titulo || "Seleccione un Curso"}
              </h1>
            </div>
          </div>

          {/* Menú Selector de Cursos */}
          <div className="w-full lg:w-auto min-w-[280px]">
            <label className="text-[10px] uppercase font-bold text-blue-200 block mb-1">
              Ver datos de otro curso:
            </label>
            <select
              value={filtroCurso}
              onChange={(e) => setFiltroCurso(e.target.value)}
              className="w-full bg-white text-gray-900 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border-2 border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md cursor-pointer"
            >
              {cursosDisponibles.map(c => (
                <option key={c.key} value={c.key}>
                  📚 {c.titulo} ({c.conteoTotal} {c.conteoTotal === 1 ? 'inscrito' : 'inscritos'})
                </option>
              ))}
              <option value="todos">🌐 Todos los Cursos (Vista combinada)</option>
            </select>
          </div>
        </div>

        {/* Pestañas de acceso rápido a cada curso */}
        {cursosDisponibles.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-3 border-t border-white/10">
            <span className="text-[11px] font-semibold text-blue-200 whitespace-nowrap">
              Cursos:
            </span>
            {cursosDisponibles.map(c => {
              const activo = filtroCurso === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setFiltroCurso(c.key)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activo
                      ? "bg-amber-400 text-slate-950 shadow-md font-black"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  <span>{c.titulo}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activo ? "bg-slate-900 text-amber-300" : "bg-black/40 text-white"}`}>
                    {c.conteoTotal}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setFiltroCurso("todos")}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                filtroCurso === "todos"
                  ? "bg-amber-400 text-slate-950 shadow-md font-black"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              }`}
            >
              <span>Todos los Cursos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${filtroCurso === "todos" ? "bg-slate-900 text-amber-300" : "bg-black/40 text-white"}`}>
                {solicitudes.length}
              </span>
            </button>
          </div>
        )}
      </section>

      {/* TARJETA PRINCIPAL CON MÉTRICAS DEL CURSO SELECCIONADO Y FILTROS */}
      <section className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200 space-y-6">
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-md bg-blue-100 text-main-blue">
                  {filtroCurso === "todos" ? "Consolidado" : "Datos Aislados"}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  Total de inscripciones en este curso: <strong className="text-gray-900">{solicitudesDelCurso.length}</strong>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                Planes de financiamiento (1 a 4 cuotas), postulaciones bancarias, pagos en línea por Stripe y registros directos de participantes contactados.
              </p>
            </div>

            {/* CONTADORES Y MÉTRICAS DEL CURSO SELECCIONADO */}
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

        {/* FILTROS Y BÚSQUEDA DENTRO DEL CURSO */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Buscador general */}
            <div className="md:col-span-6">
              <div className="relative">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="🔍 Buscar por nombre, profesión, email, país, WhatsApp..."
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
                <option value="efectivo">💵 Efectivo / Otro</option>
              </select>
            </div>

            {/* Estado rápido */}
            <div className="md:col-span-3">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:border-main-blue"
              >
                <option value="todos">Todos los Estados ({solicitudesDelCurso.length})</option>
                <option value="contactado">📞 Contactados ({conteoContactados})</option>
                <option value="pendiente">⏳ Pendientes ({conteoPendientes})</option>
                <option value="confirmado">✅ Confirmados ({conteoConfirmados})</option>
                <option value="cancelado">❌ Cancelados</option>
              </select>
            </div>
          </div>

          {/* Pastillas de filtro de estado para acceso rápido */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { id: "todos", label: `Todos (${solicitudesDelCurso.length})` },
              { id: "contactado", label: `Contactados (${conteoContactados})` },
              { id: "pendiente", label: `Pendientes (${conteoPendientes})` },
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

        {/* LISTADO DE SOLICITUDES DEL CURSO */}
        {cargando ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <CircularProgress size={42} thickness={4} sx={{ color: "#1D3557" }} />
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase animate-pulse">
              Cargando inscripciones del curso...
            </span>
          </div>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 space-y-3">
            <span className="text-4xl block">📭</span>
            <h3 className="text-base font-bold text-gray-700">
              No hay inscripciones registradas para este curso
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {solicitudesDelCurso.length === 0
                ? "Aún no se han recibido registros para este curso en particular. Puedes agregar a personas contactadas directamente con el botón de abajo."
                : "No hay solicitudes que coincidan con los filtros de estado o búsqueda seleccionados."}
            </p>
            {solicitudesDelCurso.length === 0 && (
              <Button
                variant="outlined"
                onClick={abrirRegistroManual}
                sx={{
                  color: "#B92F32",
                  borderColor: "#B92F32",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "12px",
                  borderRadius: "10px",
                  mt: 1,
                  "&:hover": { bgcolor: "#fee2e2", borderColor: "#8b1d20" }
                }}
              >
                ➕ Registrar primer participante en este curso
              </Button>
            )}
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
                      ) : solicitud.metodoPago === "efectivo" ? (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                          💵 Efectivo / Otro
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                          🏛️ Transferencia Bancaria
                        </span>
                      )}

                      {/* Badge Origen */}
                      {solicitud.origen === "manual_admin" && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                          ✍️ Registro Manual
                        </span>
                      )}

                      {/* Badge Ex-alumno */}
                      {esExAlumno && (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          ⭐ Ex-alumno IIRESODH
                        </span>
                      )}

                      {/* Si está en modo todos, mostrar el curso al que pertenece */}
                      {filtroCurso === "todos" && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                          🎓 {solicitud.cursoTitulo || solicitud.cursoId}
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
                        {solicitud.nombre || (solicitud.nombres ? `${solicitud.nombres} ${solicitud.apellidos || ""}`.trim() : "Sin nombre registrado")}
                      </h4>
                      {(solicitud.nombres || solicitud.apellidos) && (
                        <p className="text-[11px] text-gray-500 font-medium">
                          🛂 Pasaporte: <span className="text-gray-700 font-semibold">{solicitud.nombres || ""} {solicitud.apellidos || ""}</span>
                        </p>
                      )}
                      
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

                      {/* CONSTANCIA LEGAL DE PROTECCIÓN DE DATOS (LEY 8968) */}
                      <div className="pt-2 border-t border-gray-100 space-y-0.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Consentimiento Ley N° 8968 (Privacidad)
                        </span>
                        <div className="flex items-center gap-1.5 text-xs">
                          {solicitud.aceptaPoliticaPrivacidad ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1 text-[11px]">
                              ✓ Consentimiento Otorgado
                              <span className="text-[10px] font-normal text-emerald-800">
                                (Ver. {solicitud.versionPoliticaPrivacidad || "2026-09-12"})
                              </span>
                            </span>
                          ) : (
                            <span className="font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                              Aceptado previo al envío
                            </span>
                          )}
                        </div>
                        {solicitud.fechaAceptacionPrivacidad && (
                          <span className="text-[10px] text-gray-400 block">
                            Constancia: {formatearFecha(solicitud.fechaAceptacionPrivacidad)}
                          </span>
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

      {/* MODAL DE REGISTRO MANUAL DE PARTICIPANTE */}
      <Dialog
        open={modalManual}
        onClose={() => !guardandoManual && setModalManual(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#1D3557", borderBottom: "1px solid #f3f4f6" }}>
          ➕ Registrar Participante Manual (Contactado por WhatsApp / Teléfono / Correo)
        </DialogTitle>
        <form onSubmit={handleGuardarManual}>
          <DialogContent sx={{ py: 3 }} className="space-y-4">
            <p className="text-xs text-gray-500 -mt-1">
              Ingresa los datos del interesado que se haya comunicado directamente. Quedará guardado en el expediente oficial del curso con su estado de gestión correspondiente.
            </p>

            {/* CURSO DESTINO */}
            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200">
              <label className="block text-xs font-bold text-main-blue uppercase mb-1.5">
                Curso al que se inscribe *
              </label>
              <select
                value={formManual.cursoKey}
                onChange={(e) => setFormManual({ ...formManual, cursoKey: e.target.value })}
                required
                className="w-full bg-white text-gray-800 font-bold text-sm px-3.5 py-2.5 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-main-blue"
              >
                {cursosDisponibles.map(c => (
                  <option key={c.key} value={c.key}>
                    🎓 {c.titulo}
                  </option>
                ))}
              </select>
            </div>

            {/* NOMBRES Y APELLIDOS SEGÚN PASAPORTE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nombres * (según pasaporte)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Eduardo"
                  value={formManual.nombres}
                  onChange={(e) => setFormManual({ ...formManual, nombres: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-main-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Apellidos * (según pasaporte)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Gómez Morales"
                  value={formManual.apellidos}
                  onChange={(e) => setFormManual({ ...formManual, apellidos: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-main-blue"
                />
              </div>
            </div>

            {/* EMAIL Y TELÉFONO / WHATSAPP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={formManual.email}
                  onChange={(e) => setFormManual({ ...formManual, email: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-main-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Teléfono / WhatsApp * (con código de país)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+506 8888 8888"
                  value={formManual.telefono}
                  onChange={(e) => setFormManual({ ...formManual, telefono: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-main-blue"
                />
              </div>
            </div>

            {/* PAÍS Y PROFESIÓN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  País de Residencia *
                </label>
                <select
                  value={formManual.pais}
                  onChange={(e) => setFormManual({ ...formManual, pais: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-main-blue bg-white"
                >
                  {PAISES_LATINOAMERICA.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Profesión u Ocupación
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juez, Defensor, Docente, Abogado"
                  value={formManual.profesion}
                  onChange={(e) => setFormManual({ ...formManual, profesion: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-main-blue"
                />
              </div>
            </div>

            {/* INSTITUCIÓN */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Institución u Organización
              </label>
              <input
                type="text"
                placeholder="Ej: Poder Judicial / Universidad / Despacho privado"
                value={formManual.institucion}
                onChange={(e) => setFormManual({ ...formManual, institucion: e.target.value })}
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-main-blue"
              />
            </div>

            {/* DATOS FINANCIEROS Y ESTADO */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">
                Modalidad de Pago y Estado del Contacto
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Estado Inicial *
                  </label>
                  <select
                    value={formManual.estado}
                    onChange={(e) => setFormManual({ ...formManual, estado: e.target.value })}
                    className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-gray-300 bg-white"
                  >
                    <option value="contactado">📞 Contactado (Seguimiento)</option>
                    <option value="pendiente">⏳ Pendiente de Pago</option>
                    <option value="confirmado">✅ Confirmado / Inscrito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={formManual.metodoPago}
                    onChange={(e) => setFormManual({ ...formManual, metodoPago: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white"
                  >
                    <option value="transferencia">🏛️ Transferencia Bancaria</option>
                    <option value="stripe">💳 Tarjeta (Stripe)</option>
                    <option value="efectivo">💵 Efectivo / Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Plan de Financiamiento
                  </label>
                  <select
                    value={formManual.planCuotas}
                    onChange={(e) => setFormManual({ ...formManual, planCuotas: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white"
                  >
                    <option value={1}>Pago Único (1 cuota)</option>
                    <option value={2}>2 pagos sin interés</option>
                    <option value={3}>3 pagos sin interés</option>
                    <option value={4}>4 pagos sin interés</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Monto Total Inversión (USD)
                  </label>
                  <input
                    type="number"
                    value={formManual.montoTotalInversion}
                    onChange={(e) => setFormManual({ ...formManual, montoTotalInversion: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Monto Abonado Inicialmente (USD)
                  </label>
                  <input
                    type="number"
                    value={formManual.montoPagado}
                    onChange={(e) => setFormManual({ ...formManual, montoPagado: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* NOTAS Y COMENTARIOS INTERNOS */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Comentarios / Bitácora de Contacto (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ej: Nos escribió por WhatsApp interesado en pagar la primera cuota la próxima quincena..."
                value={formManual.comentarios}
                onChange={(e) => setFormManual({ ...formManual, comentarios: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-main-blue"
              />
            </div>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: "1px solid #f3f4f6" }}>
            <Button
              onClick={() => setModalManual(false)}
              disabled={guardandoManual}
              sx={{ textTransform: "none", color: "#6b7280" }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={guardandoManual}
              sx={{
                bgcolor: "#B92F32",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "10px",
                px: 3,
                "&:hover": { bgcolor: "#8b1d20" }
              }}
            >
              {guardandoManual ? "Guardando..." : "Guardar Participante"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
