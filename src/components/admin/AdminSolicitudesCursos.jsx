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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../firebase/config";
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

  // Subida y visor de pasaporte
  const [subiendoPasaporteId, setSubiendoPasaporteId] = useState(null);
  const [modalPasaporte, setModalPasaporte] = useState({ open: false, url: "", nombre: "", tipo: "" });

  // Control de Pagos y Abonos
  const [modalPagos, setModalPagos] = useState({ open: false, solicitud: null });
  const [formAbono, setFormAbono] = useState({
    monto: "",
    fecha: new Date().toISOString().slice(0, 10),
    metodo: "transferencia",
    referencia: "",
    notas: "",
    comprobanteFile: null
  });
  const [guardandoAbono, setGuardandoAbono] = useState(false);
  const [editandoPlan, setEditandoPlan] = useState(false);
  const [formPlan, setFormPlan] = useState({ montoTotalInversion: 3350, planCuotas: 1 });
  const [guardandoPlan, setGuardandoPlan] = useState(false);

  // Alertas
  const [alerta, setAlerta] = useState({ open: false, mensaje: "", esError: false });
  // Modal de confirmación para eliminar
  const [modalBorrar, setModalBorrar] = useState({ open: false, id: null, nombre: "", cursoTitulo: "" });

  // Modal para Registro Manual de Participante
  const [modalManual, setModalManual] = useState(false);
  const [guardandoManual, setGuardandoManual] = useState(false);
  const [archivoPasaporteManual, setArchivoPasaporteManual] = useState(null);
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
    comentarios: "",
    otorgoConsentimiento: true,
    medioConsentimiento: "WhatsApp",
    detalleConsentimiento: ""
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

    // 1. Cursos desde la colección 'cursos'
    cursos.forEach(c => {
      const key = c.slug || c.id;
      const aliasSet = new Set([
        c.id,
        c.slug,
        c.titulo,
        key
      ].filter(Boolean).map(x => String(x).toLowerCase().trim()));

      const tituloLower = String(c.titulo || "").toLowerCase();
      if (tituloLower.includes("palermo")) {
        aliasSet.add("palermo");
        aliasSet.add("palermo-2027");
        aliasSet.add("curso palermo iiresodh 2027");
        aliasSet.add("curso-palermo-2027");
      }

      map.set(key, {
        key,
        id: c.id,
        slug: c.slug || c.id,
        titulo: c.titulo || c.slug || c.id,
        alias: Array.from(aliasSet)
      });
    });

    // 2. Detectar cursos adicionales presentes en solicitudes
    solicitudes.forEach(s => {
      const sId = String(s.cursoId || "").toLowerCase().trim();
      const sTit = String(s.cursoTitulo || "").toLowerCase().trim();

      let matchedItem = null;
      for (const [, cursoItem] of map.entries()) {
        if (
          cursoItem.alias.includes(sId) ||
          cursoItem.alias.includes(sTit) ||
          (sTit && cursoItem.titulo && (sTit.includes(cursoItem.titulo.toLowerCase()) || cursoItem.titulo.toLowerCase().includes(sTit))) ||
          ((sId.includes("palermo") || sTit.includes("palermo")) && cursoItem.alias.some(a => a.includes("palermo")))
        ) {
          matchedItem = cursoItem;
          break;
        }
      }

      if (matchedItem) {
        if (s.cursoId) matchedItem.alias.push(sId);
        if (s.cursoTitulo) matchedItem.alias.push(sTit);
      } else {
        const keyCandidate = s.cursoId || s.cursoTitulo || "curso-adicional";
        const rawTitulo = s.cursoTitulo || s.cursoId || "Curso Internacional";
        map.set(keyCandidate, {
          key: keyCandidate,
          id: s.cursoId || keyCandidate,
          slug: s.cursoId || keyCandidate,
          titulo: rawTitulo,
          alias: [s.cursoId, s.cursoTitulo, keyCandidate].filter(Boolean).map(x => String(x).toLowerCase().trim())
        });
      }
    });

    // 3. Fallback por si la base aún estuviese totalmente vacía
    if (map.size === 0) {
      map.set("palermo-2027", {
        key: "palermo-2027",
        id: "palermo-2027",
        slug: "palermo-2027",
        titulo: "Curso Internacional 2027 - Palermo",
        alias: ["palermo-2027", "palermo", "curso internacional 2027 - palermo", "curso palermo iiresodh 2027"]
      });
    }

    // 4. Calcular conteo exacto por cada curso
    return Array.from(map.values()).map(c => {
      const conteo = solicitudes.filter(s => {
        const sid = String(s.cursoId || "").toLowerCase().trim();
        const stit = String(s.cursoTitulo || "").toLowerCase().trim();
        if (c.alias.includes(sid) || c.alias.includes(stit)) return true;
        if (c.id && String(s.cursoId || "") === String(c.id)) return true;
        if (c.slug && String(s.cursoId || "") === String(c.slug)) return true;
        if (c.titulo && stit && (stit.includes(c.titulo.toLowerCase()) || c.titulo.toLowerCase().includes(stit))) return true;
        if ((sid.includes("palermo") || stit.includes("palermo")) && c.alias.some(a => a.includes("palermo"))) return true;
        return false;
      }).length;
      return { ...c, conteoTotal: conteo };
    });
  }, [cursos, solicitudes]);

  // Selección automática y reconciliación del curso activo
  useEffect(() => {
    if (cursosDisponibles.length === 0) return;
    if (filtroCurso === "todos") return;

    // Si se especificó un curso inicial, darle prioridad absoluta
    if (cursoInicial?.slug || cursoInicial?.id || cursoInicial?.titulo) {
      const rawBuscado = [cursoInicial.id, cursoInicial.slug, cursoInicial.titulo]
        .filter(Boolean)
        .map(x => String(x).toLowerCase().trim());

      const found = cursosDisponibles.find(c => 
        c.key === cursoInicial.slug ||
        c.key === cursoInicial.id ||
        c.id === cursoInicial.id ||
        c.slug === cursoInicial.slug ||
        c.alias.some(a => rawBuscado.includes(a))
      );
      if (found && filtroCurso !== found.key) {
        setFiltroCurso(found.key);
        return;
      }
    }

    // Verificar si el valor actual de filtroCurso coincide con algún curso disponible
    const matching = cursosDisponibles.find(c => 
      c.key === filtroCurso || 
      c.id === filtroCurso || 
      c.slug === filtroCurso || 
      c.alias.includes(String(filtroCurso || "").toLowerCase().trim())
    );

    if (matching) {
      if (filtroCurso !== matching.key) {
        setFiltroCurso(matching.key);
      }
    } else {
      // Si no existe, asociar con el primer curso disponible
      setFiltroCurso(cursosDisponibles[0].key);
    }
  }, [cursosDisponibles, cursoInicial, filtroCurso]);

  // Objeto del curso actualmente activo
  const cursoActivoObj = useMemo(() => {
    if (filtroCurso === "todos") {
      return { key: "todos", titulo: "Todos los Cursos Académicos (Consolidado)" };
    }
    return (
      cursosDisponibles.find(c => 
        c.key === filtroCurso || 
        c.id === filtroCurso || 
        c.slug === filtroCurso || 
        c.alias.includes(String(filtroCurso || "").toLowerCase().trim())
      ) ||
      cursosDisponibles[0] ||
      null
    );
  }, [cursosDisponibles, filtroCurso]);

  // Comprobar si una solicitud pertenece al curso seleccionado
  const esDeCurso = (s, cursoKey) => {
    if (!cursoKey || cursoKey === "todos") return true;

    const target = cursosDisponibles.find(c => 
      c.key === cursoKey ||
      c.id === cursoKey ||
      c.slug === cursoKey ||
      c.alias.includes(String(cursoKey).toLowerCase().trim())
    );

    const sid = String(s.cursoId || "").toLowerCase().trim();
    const stit = String(s.cursoTitulo || "").toLowerCase().trim();

    if (!target) {
      const keyNorm = String(cursoKey).toLowerCase().trim();
      return sid === keyNorm || stit === keyNorm || (keyNorm && (stit.includes(keyNorm) || keyNorm.includes(stit)));
    }

    if (target.alias.includes(sid) || target.alias.includes(stit)) return true;
    if (target.id && String(s.cursoId || "") === String(target.id)) return true;
    if (target.slug && String(s.cursoId || "") === String(target.slug)) return true;
    if (target.titulo && stit && (stit.includes(target.titulo.toLowerCase()) || target.titulo.toLowerCase().includes(stit))) return true;

    if ((sid.includes("palermo") || stit.includes("palermo")) && target.alias.some(a => a.includes("palermo"))) {
      return true;
    }

    return false;
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
  const totalRecaudado = solicitudesDelCurso.reduce((acc, s) => acc + (Number(s.montoPagado) || 0), 0);
  const totalPorCobrar = solicitudesDelCurso.reduce((acc, s) => {
    const inv = Number(s.montoTotalInversion) || 3350;
    const pag = Number(s.montoPagado) || 0;
    return acc + Math.max(0, inv - pag);
  }, 0);

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

  // Subir copia de pasaporte a Firebase Storage con auditoría
  const handleSubirPasaporte = async (solicitud, file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      mostrarToast("El archivo de pasaporte no debe superar los 25MB.", true);
      return;
    }

    setSubiendoPasaporteId(solicitud.id);
    try {
      const extension = file.name.split('.').pop() || 'pdf';
      const safeName = `pasaporte_${solicitud.id}_${Date.now()}.${extension}`;
      const rutaStorage = `pasaportes_cursos/${solicitud.cursoId || 'curso'}/${safeName}`;
      const storageRef = ref(storage, rutaStorage);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const updateData = {
        pasaporteUrl: url,
        pasaporteNombre: file.name,
        pasaporteTipo: file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image'),
        pasaporteRutaStorage: rutaStorage,
        fechaSubidaPasaporte: serverTimestamp(),
        pasaporteSubidoPor: auth.currentUser?.email || "Administrador"
      };

      await updateDoc(doc(db, "solicitudesCursos", solicitud.id), updateData);

      setSolicitudes(prev => prev.map(s => (s.id === solicitud.id ? { ...s, ...updateData } : s)));

      mostrarToast(`Copia de pasaporte de ${solicitud.nombre || 'participante'} subida con éxito.`);

      if (logActividad) {
        await logActividad(
          `Subió copia de pasaporte para ${solicitud.nombre || solicitud.id} (${file.name}) en curso "${solicitud.cursoTitulo || solicitud.cursoId || ''}"`,
          {
            solicitudId: solicitud.id,
            nombreParticipante: solicitud.nombre || `${solicitud.nombres || ''} ${solicitud.apellidos || ''}`.trim(),
            archivo: file.name,
            tamanoBytes: file.size,
            tipo: file.type,
            curso: solicitud.cursoTitulo || solicitud.cursoId
          }
        );
      }
    } catch (error) {
      console.error("Error al subir copia de pasaporte:", error);
      mostrarToast("Error al subir el archivo de pasaporte a Storage.", true);
    } finally {
      setSubiendoPasaporteId(null);
    }
  };

  // Cambio de estado con log de auditoría
  const handleCambiarEstado = async (id, nuevoEstado, solicitudActual) => {
    setActualizandoId(id);
    const estadoAnterior = solicitudActual.estado || "pendiente";
    try {
      const docRef = doc(db, "solicitudesCursos", id);
      await updateDoc(docRef, { 
        estado: nuevoEstado,
        fechaModificacionEstado: serverTimestamp(),
        modificadoPor: auth.currentUser?.email || "Administrador"
      });

      setSolicitudes(prev =>
        prev.map(s => (s.id === id ? { ...s, estado: nuevoEstado } : s))
      );

      mostrarToast(`Estado actualizado a: ${nuevoEstado}`);

      if (logActividad) {
        await logActividad(
          `Actualizó estado de participante "${solicitudActual.nombre || id}" a "${nuevoEstado}"`,
          {
            solicitudId: id,
            nombreParticipante: solicitudActual.nombre || `${solicitudActual.nombres || ''} ${solicitudActual.apellidos || ''}`.trim(),
            estadoAnterior: estadoAnterior,
            nuevoEstado: nuevoEstado,
            curso: solicitudActual.cursoTitulo || solicitudActual.cursoId
          }
        );
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      mostrarToast("No se pudo actualizar el estado de la solicitud.", true);
    } finally {
      setActualizandoId(null);
    }
  };

  // Eliminación con log de auditoría
  const confirmarBorrado = async () => {
    if (!modalBorrar.id) return;
    try {
      await deleteDoc(doc(db, "solicitudesCursos", modalBorrar.id));
      setSolicitudes(prev => prev.filter(s => s.id !== modalBorrar.id));
      mostrarToast("Solicitud eliminada con éxito.");

      if (logActividad) {
        await logActividad(
          `Eliminó participante de curso: "${modalBorrar.nombre || modalBorrar.id}" (ID: ${modalBorrar.id})`,
          {
            solicitudId: modalBorrar.id,
            nombreParticipante: modalBorrar.nombre,
            curso: modalBorrar.cursoTitulo
          }
        );
      }
    } catch (error) {
      console.error("Error al eliminar solicitud:", error);
      mostrarToast("Error al eliminar la solicitud.", true);
    } finally {
      setModalBorrar({ open: false, id: null, nombre: "", cursoTitulo: "" });
    }
  };

  // ==========================================
  // GESTIÓN Y CONTROL DE PAGOS Y ABONOS
  // ==========================================
  const abrirGestionPagos = (solicitud) => {
    const totalInv = Number(solicitud.montoTotalInversion) || 3350;
    const cuotas = Number(solicitud.planCuotas) || 1;
    const pagado = Number(solicitud.montoPagado) || 0;
    const saldo = Math.max(0, totalInv - pagado);

    // Sugerir monto de la próxima cuota o saldo restante
    const cuotaMonto = cuotas > 1 ? Number((totalInv / cuotas).toFixed(2)) : totalInv;
    const sugerido = saldo > 0 ? (saldo < cuotaMonto ? saldo : cuotaMonto) : "";

    setModalPagos({ open: true, solicitud });
    setFormAbono({
      monto: sugerido ? String(sugerido) : "",
      fecha: new Date().toISOString().slice(0, 10),
      metodo: solicitud.metodoPago || "transferencia",
      referencia: "",
      notas: "",
      comprobanteFile: null
    });
    setFormPlan({
      montoTotalInversion: totalInv,
      planCuotas: cuotas
    });
    setEditandoPlan(false);
  };

  // Registrar un nuevo abono
  const handleRegistrarAbono = async (e) => {
    e.preventDefault();
    const solicitud = modalPagos.solicitud;
    if (!solicitud) return;

    const montoNum = Number(formAbono.monto);
    if (!montoNum || montoNum <= 0) {
      mostrarToast("Por favor ingresa un monto válido mayor a 0.", true);
      return;
    }

    setGuardandoAbono(true);
    try {
      let comprobanteData = {};
      if (formAbono.comprobanteFile) {
        try {
          const extension = formAbono.comprobanteFile.name.split('.').pop() || 'pdf';
          const safeName = `comprobante_${solicitud.id}_${Date.now()}.${extension}`;
          const rutaStorage = `comprobantes_pagos/${solicitud.cursoId || 'curso'}/${safeName}`;
          const storageRef = ref(storage, rutaStorage);
          await uploadBytes(storageRef, formAbono.comprobanteFile);
          const url = await getDownloadURL(storageRef);
          comprobanteData = {
            comprobanteUrl: url,
            comprobanteNombre: formAbono.comprobanteFile.name
          };
        } catch (errUpload) {
          console.error("Error al subir comprobante de pago:", errUpload);
        }
      }

      const nuevoPagoItem = {
        id: `pago_${Date.now()}`,
        monto: montoNum,
        fecha: formAbono.fecha,
        metodo: formAbono.metodo,
        referencia: formAbono.referencia.trim(),
        notas: formAbono.notas.trim(),
        registradoPor: auth.currentUser?.email || "Administrador",
        timestamp: new Date().toISOString(),
        ...comprobanteData
      };

      const historialPrevio = Array.isArray(solicitud.historialPagos) ? solicitud.historialPagos : [];
      const nuevoHistorial = [...historialPrevio, nuevoPagoItem];

      const nuevoMontoPagado = Number(((Number(solicitud.montoPagado) || 0) + montoNum).toFixed(2));
      const totalInv = Number(solicitud.montoTotalInversion) || 3350;
      const nuevoSaldo = Math.max(0, Number((totalInv - nuevoMontoPagado).toFixed(2)));
      const planCuotas = Number(solicitud.planCuotas) || 1;
      const montoPorCuota = totalInv / planCuotas;
      const cuotasPagadasCalc = Math.min(planCuotas, Math.floor((nuevoMontoPagado + 1) / montoPorCuota));

      const updateData = {
        montoPagado: nuevoMontoPagado,
        saldoPendiente: nuevoSaldo,
        cuotasPagadas: cuotasPagadasCalc,
        historialPagos: nuevoHistorial,
        ultimoPagoFecha: formAbono.fecha,
        ultimoPagoMonto: montoNum
      };

      // Si quedó 100% liquidado, confirmar inscripción automáticamente
      if (nuevoSaldo <= 0 && solicitud.estado !== "confirmado") {
        updateData.estado = "confirmado";
      }

      await updateDoc(doc(db, "solicitudesCursos", solicitud.id), updateData);

      const solicitudActualizada = { ...solicitud, ...updateData };
      setSolicitudes(prev => prev.map(s => (s.id === solicitud.id ? solicitudActualizada : s)));
      setModalPagos({ open: true, solicitud: solicitudActualizada });

      mostrarToast(`Abono de $${montoNum.toLocaleString()} USD registrado con éxito.`);

      if (logActividad) {
        await logActividad(
          `Registró abono de $${montoNum.toLocaleString()} USD para "${solicitud.nombre || solicitud.id}" en curso "${solicitud.cursoTitulo || ''}"`,
          {
            solicitudId: solicitud.id,
            participante: solicitud.nombre,
            montoAbonado: montoNum,
            nuevoTotalPagado: nuevoMontoPagado,
            saldoPendiente: nuevoSaldo,
            referencia: formAbono.referencia,
            metodo: formAbono.metodo,
            liquidadoCompletamente: nuevoSaldo <= 0
          }
        );
      }

      // Limpiar formulario de abono
      setFormAbono({
        monto: "",
        fecha: new Date().toISOString().slice(0, 10),
        metodo: solicitud.metodoPago || "transferencia",
        referencia: "",
        notas: "",
        comprobanteFile: null
      });
    } catch (error) {
      console.error("Error al registrar abono:", error);
      mostrarToast("Error al registrar el abono.", true);
    } finally {
      setGuardandoAbono(false);
    }
  };

  // Anular o eliminar un abono
  const handleEliminarAbono = async (pagoId, montoAbono) => {
    const solicitud = modalPagos.solicitud;
    if (!solicitud) return;

    if (!window.confirm(`¿Estás seguro de anular este abono de $${montoAbono} USD?`)) return;

    try {
      const nuevoHistorial = (solicitud.historialPagos || []).filter(p => p.id !== pagoId);
      const nuevoMontoPagado = Math.max(0, Number(((Number(solicitud.montoPagado) || 0) - montoAbono).toFixed(2)));
      const totalInv = Number(solicitud.montoTotalInversion) || 3350;
      const nuevoSaldo = Math.max(0, Number((totalInv - nuevoMontoPagado).toFixed(2)));
      const planCuotas = Number(solicitud.planCuotas) || 1;
      const montoPorCuota = totalInv / planCuotas;
      const cuotasPagadasCalc = Math.min(planCuotas, Math.floor((nuevoMontoPagado + 1) / montoPorCuota));

      const updateData = {
        montoPagado: nuevoMontoPagado,
        saldoPendiente: nuevoSaldo,
        cuotasPagadas: cuotasPagadasCalc,
        historialPagos: nuevoHistorial
      };

      await updateDoc(doc(db, "solicitudesCursos", solicitud.id), updateData);

      const solicitudActualizada = { ...solicitud, ...updateData };
      setSolicitudes(prev => prev.map(s => (s.id === solicitud.id ? solicitudActualizada : s)));
      setModalPagos({ open: true, solicitud: solicitudActualizada });

      mostrarToast(`Abono de $${montoAbono} USD anulado correctamente.`);

      if (logActividad) {
        await logActividad(
          `Anuló abono de $${montoAbono} USD para "${solicitud.nombre || solicitud.id}"`,
          {
            solicitudId: solicitud.id,
            participante: solicitud.nombre,
            montoAnulado: montoAbono,
            nuevoSaldo: nuevoSaldo
          }
        );
      }
    } catch (error) {
      console.error("Error al anular abono:", error);
      mostrarToast("Error al anular el abono.", true);
    }
  };

  // Actualizar configuración del plan financiero de la solicitud
  const handleGuardarPlan = async (e) => {
    e.preventDefault();
    const solicitud = modalPagos.solicitud;
    if (!solicitud) return;

    setGuardandoPlan(true);
    try {
      const nuevoTotal = Number(formPlan.montoTotalInversion) || 3350;
      const nuevoPlanCuotas = Number(formPlan.planCuotas) || 1;
      const pagado = Number(solicitud.montoPagado) || 0;
      const nuevoSaldo = Math.max(0, Number((nuevoTotal - pagado).toFixed(2)));
      const montoPorCuota = nuevoTotal / nuevoPlanCuotas;
      const cuotasCalc = Math.min(nuevoPlanCuotas, Math.floor((pagado + 1) / montoPorCuota));

      const updateData = {
        montoTotalInversion: nuevoTotal,
        planCuotas: nuevoPlanCuotas,
        saldoPendiente: nuevoSaldo,
        cuotasPagadas: cuotasCalc
      };

      await updateDoc(doc(db, "solicitudesCursos", solicitud.id), updateData);

      const solicitudActualizada = { ...solicitud, ...updateData };
      setSolicitudes(prev => prev.map(s => (s.id === solicitud.id ? solicitudActualizada : s)));
      setModalPagos({ open: true, solicitud: solicitudActualizada });
      setEditandoPlan(false);

      mostrarToast("Plan financiero actualizado con éxito.");

      if (logActividad) {
        await logActividad(
          `Actualizó plan financiero de "${solicitud.nombre || solicitud.id}": Inversión $${nuevoTotal} USD, ${nuevoPlanCuotas} cuota(s)`,
          {
            solicitudId: solicitud.id,
            participante: solicitud.nombre,
            montoTotalInversion: nuevoTotal,
            planCuotas: nuevoPlanCuotas,
            saldoPendiente: nuevoSaldo
          }
        );
      }
    } catch (error) {
      console.error("Error al actualizar plan:", error);
      mostrarToast("Error al actualizar el plan financiero.", true);
    } finally {
      setGuardandoPlan(false);
    }
  };

  // Abrir modal de registro manual
  const abrirRegistroManual = () => {
    setArchivoPasaporteManual(null);
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
      comentarios: "",
      otorgoConsentimiento: true,
      medioConsentimiento: "WhatsApp",
      detalleConsentimiento: "El participante manifestó expresamente su consentimiento informado para el registro de sus datos conforme a la Ley N° 8968."
    });
    setModalManual(true);
  };

  // Guardar participante manual
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
      const adminActual = auth.currentUser?.email || "Administrador";

      let pasaporteSubidoData = {};
      if (archivoPasaporteManual) {
        try {
          const extension = archivoPasaporteManual.name.split('.').pop() || 'pdf';
          const safeName = `pasaporte_manual_${Date.now()}.${extension}`;
          const rutaStorage = `pasaportes_cursos/${cursoElegido.id || cursoElegido.key}/${safeName}`;
          const storageRef = ref(storage, rutaStorage);
          await uploadBytes(storageRef, archivoPasaporteManual);
          const url = await getDownloadURL(storageRef);
          pasaporteSubidoData = {
            pasaporteUrl: url,
            pasaporteNombre: archivoPasaporteManual.name,
            pasaporteTipo: archivoPasaporteManual.type || (archivoPasaporteManual.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image'),
            pasaporteRutaStorage: rutaStorage,
            fechaSubidaPasaporte: serverTimestamp(),
            pasaporteSubidoPor: adminActual
          };
        } catch (errPasaporte) {
          console.error("Error al subir pasaporte en registro manual:", errPasaporte);
        }
      }

      // Si se ingresó un abono inicial, crear registro en historialPagos
      let historialInicial = [];
      if (pagado > 0) {
        historialInicial.push({
          id: `pago_inicial_${Date.now()}`,
          monto: pagado,
          fecha: new Date().toISOString().slice(0, 10),
          metodo: formManual.metodoPago,
          referencia: "Abono inicial registrado en alta de participante",
          notas: "Registro administrativo directo",
          registradoPor: adminActual,
          timestamp: new Date().toISOString()
        });
      }

      const constanciaTexto = formManual.detalleConsentimiento.trim()
        ? formManual.detalleConsentimiento.trim()
        : `Consentimiento informado otorgado vía ${formManual.medioConsentimiento} conforme a la Ley N° 8968 de Costa Rica.`;

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
        historialPagos: historialInicial,
        estado: formManual.estado || "contactado",
        origen: "manual_admin",
        registradoPorAdmin: adminActual,
        comentarios: formManual.comentarios.trim(),
        // Consentimiento explícito Ley 8968
        aceptaPoliticaPrivacidad: !!formManual.otorgoConsentimiento,
        medioConsentimiento: formManual.medioConsentimiento,
        versionPoliticaPrivacidad: "2026-09-12",
        constanciaPrivacidad: constanciaTexto,
        fechaAceptacionPrivacidad: serverTimestamp(),
        fechaSolicitud: serverTimestamp(),
        ...pasaporteSubidoData
      };

      const docRef = await addDoc(collection(db, "solicitudesCursos"), nuevaData);

      const nuevoItemLocal = {
        id: docRef.id,
        ...nuevaData,
        fechaSolicitud: new Date()
      };

      setSolicitudes(prev => [nuevoItemLocal, ...prev]);

      mostrarToast(`Participante "${nombreCompleto}" registrado exitosamente.`);

      if (logActividad) {
        await logActividad(
          `Registró manualmente a "${nombreCompleto}" en el curso "${cursoElegido.titulo}" con estado "${formManual.estado}"`,
          {
            solicitudId: docRef.id,
            nombreParticipante: nombreCompleto,
            email: formManual.email.trim(),
            telefono: formManual.telefono.trim(),
            pais: formManual.pais,
            profesion: formManual.profesion.trim(),
            institucion: formManual.institucion.trim(),
            curso: cursoElegido.titulo,
            estado: formManual.estado,
            metodoPago: formManual.metodoPago,
            planCuotas: cuotas,
            montoTotalInversion: totalInv,
            montoPagado: pagado,
            consentimientoLey8968: !!formManual.otorgoConsentimiento,
            medioConsentimiento: formManual.medioConsentimiento,
            constanciaConsentimiento: constanciaTexto,
            pasaporteAdjunto: !!pasaporteSubidoData.pasaporteUrl,
            registradoPor: adminActual
          }
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

  // Exportar CSV
  const exportarCSV = async () => {
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
      "Copia Pasaporte (URL)",
      "Consentimiento Ley 8968",
      "Canal de Consentimiento",
      "Constancia Legal Privacidad",
      "Fecha Aceptación Privacidad",
      "Registrado Por",
      "Origen Registro",
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
      "Historial Abonos (Cantidad)",
      "ID Stripe PaymentIntent",
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

      const cantAbonos = Array.isArray(s.historialPagos) ? s.historialPagos.length : (Number(s.montoPagado) > 0 ? 1 : 0);

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
        `"${(s.pasaporteUrl || '').replace(/"/g, '""')}"`,
        `"${s.aceptaPoliticaPrivacidad ? 'SÍ (Otorgado)' : 'No registrado'}"`,
        `"${(s.medioConsentimiento || (s.origen === 'manual_admin' ? 'Registro Manual' : 'Formulario Web')).replace(/"/g, '""')}"`,
        `"${(s.constanciaPrivacidad || '').replace(/"/g, '""')}"`,
        `"${fechaPrivacidad}"`,
        `"${(s.registradoPorAdmin || 'Usuario Web').replace(/"/g, '""')}"`,
        `"${s.origen === 'manual_admin' ? 'Manual Admin' : 'Web Oficial'}"`,
        `"${s.alumnoIiresodh === 'si' ? 'SÍ' : 'NO'}"`,
        `"${temas.replace(/"/g, '""')}"`,
        `"${(s.cursosPrevios || 'No').replace(/"/g, '""')}"`,
        `"${(s.motivoParticipacion || '').replace(/"/g, '""')}"`,
        `"${s.metodoPago === 'stripe' ? 'Tarjeta en Línea (Stripe)' : (s.metodoPago === 'efectivo' ? 'Efectivo / Otro' : 'Transferencia Bancaria')}"`,
        `"${s.planCuotas ? `${s.planCuotas} cuota(s)` : 'Pago único'}"`,
        `"${s.cuotasPagadas || (s.metodoPago === 'stripe' ? 1 : 0)}"`,
        `"${s.montoPagado || (s.metodoPago === 'stripe' ? 3350 : 0)}"`,
        `"${s.montoTotalInversion || 3350}"`,
        `"${s.saldoPendiente !== undefined ? s.saldoPendiente : (s.metodoPago === 'stripe' ? 0 : 3350)}"`,
        `"${cantAbonos}"`,
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

    const safeSlug = (cursoActivoObj?.slug || cursoActivoObj?.key || "curso")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_");
    link.setAttribute("download", `solicitudes_${safeSlug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mostrarToast(`Reporte CSV de "${cursoActivoObj?.titulo || 'Curso'}" descargado con éxito.`);

    if (logActividad) {
      await logActividad(
        `Exportó reporte CSV de inscripciones del curso "${cursoActivoObj?.titulo || 'Todos'}"`,
        {
          curso: cursoActivoObj?.titulo,
          cantidadRegistros: solicitudesDelCurso.length,
          filtroEstado,
          filtroMetodo
        }
      );
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "Sin fecha";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
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
                  Total inscritos: <strong className="text-gray-900">{solicitudesDelCurso.length}</strong>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                Control financiero completo de pagos únicos y cuotas de financiamiento, estados de validación, pasaportes y auditoría.
              </p>
            </div>

            {/* CONTADORES Y MÉTRICAS DEL CURSO SELECCIONADO */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full lg:w-auto">
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
                <span className="text-[10px] uppercase font-bold text-indigo-800 block">Total Recaudado</span>
                <span className="text-lg font-black text-indigo-900 leading-tight">
                  ${totalRecaudado.toLocaleString()}
                </span>
                <span className="text-[9px] font-bold text-indigo-600 block">USD</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 px-3 py-2 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-rose-800 block">Saldo por Cobrar</span>
                <span className="text-lg font-black text-rose-900 leading-tight">
                  ${totalPorCobrar.toLocaleString()}
                </span>
                <span className="text-[9px] font-bold text-rose-600 block">USD</span>
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

              const porcentajePagado = montoTotal > 0 ? Math.round((montoPagado / montoTotal) * 100) : 0;
              const montoPorCuota = planCuotas > 0 ? montoTotal / planCuotas : montoTotal;

              // Historial de pagos
              const cantPagos = Array.isArray(solicitud.historialPagos) ? solicitud.historialPagos.length : (montoPagado > 0 ? 1 : 0);

              // Formato de temas
              const temas = Array.isArray(solicitud.experienciaTemas)
                ? solicitud.experienciaTemas
                : (solicitud.experienciaTemas ? [solicitud.experienciaTemas] : []);

              const esExAlumno = solicitud.alumnoIiresodh === "si";

              return (
                <article
                  key={solicitud.id}
                  className={`p-4 sm:p-6 bg-white border rounded-2xl shadow-xs hover:shadow-md transition-all space-y-4 ${
                    saldoPendiente <= 0 
                      ? "border-emerald-200 bg-gradient-to-br from-white via-white to-emerald-50/20" 
                      : (esStripe ? "border-indigo-200 bg-gradient-to-br from-white via-white to-indigo-50/20" : "border-gray-200")
                  }`}
                >
                  {/* CABECERA DE LA TARJETA */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] px-3 py-1 rounded-full border ${badge.bg}`}>
                        ● {badge.label}
                      </span>

                      {/* Badge Liquidado / Pendiente de Pago */}
                      {saldoPendiente <= 0 ? (
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          ✓ Totalmente Liquidado
                        </span>
                      ) : montoPagado > 0 ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
                          ⏳ Con Abonos (${montoPagado.toLocaleString()} pagado)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                          ⚠️ Sin Abonos Registrados
                        </span>
                      )}

                      {/* Badge Método de Pago */}
                      {esStripe ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-1">
                          💳 Pago con Tarjeta (Stripe)
                        </span>
                      ) : solicitud.metodoPago === "efectivo" ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                          💵 Efectivo / Otro
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
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
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
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
                        onClick={() => setModalBorrar({ 
                          open: true, 
                          id: solicitud.id, 
                          nombre: solicitud.nombre, 
                          cursoTitulo: solicitud.cursoTitulo || solicitud.cursoId 
                        })}
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
                    {/* COLUMNA 1: DATOS PERSONALES, PROFESIÓN, PASAPORTE Y CONSENTIMIENTO */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Participante y Perfil
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                        {solicitud.nombre || (solicitud.nombres ? `${solicitud.nombres} ${solicitud.apellidos || ""}`.trim() : "Sin nombre registrado")}
                      </h4>
                      {(solicitud.nombres || solicitud.apellidos) && (
                        <p className="text-[11px] text-gray-500 font-medium">
                          🛂 Nombre Pasaporte: <span className="text-gray-800 font-bold">{solicitud.nombres || ""} {solicitud.apellidos || ""}</span>
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

                      <div className="pt-1 flex flex-col gap-1 text-xs">
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

                      {/* COPIA DEL PASAPORTE (BOTÓN DE SUBIDA Y VISUALIZADOR) */}
                      <div className="pt-2.5 border-t border-gray-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Copia del Pasaporte
                        </span>

                        {solicitud.pasaporteUrl ? (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xl shrink-0">🛂</span>
                              <div className="min-w-0">
                                <span className="text-[11px] font-bold text-slate-800 block truncate" title={solicitud.pasaporteNombre || "Pasaporte"}>
                                  {solicitud.pasaporteNombre || "Copia_Pasaporte"}
                                </span>
                                <span className="text-[9px] text-emerald-700 font-bold block">
                                  ✓ Documento cargado
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setModalPasaporte({
                                  open: true,
                                  url: solicitud.pasaporteUrl,
                                  nombre: `${solicitud.nombres || solicitud.nombre || 'Participante'} ${solicitud.apellidos || ''}`.trim(),
                                  tipo: solicitud.pasaporteTipo || (solicitud.pasaporteUrl.toLowerCase().includes('.pdf') ? 'application/pdf' : 'image')
                                })}
                                className="bg-main-blue hover:bg-light-blue text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Ver copia del pasaporte"
                              >
                                <span>👁️</span>
                                <span>Ver</span>
                              </button>

                              <label
                                className={`bg-white hover:bg-gray-100 text-gray-600 border border-gray-300 text-[11px] font-bold px-2 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                                  subiendoPasaporteId === solicitud.id ? 'opacity-50 pointer-events-none' : ''
                                }`}
                                title="Reemplazar archivo de pasaporte"
                              >
                                <span>🔄</span>
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  className="hidden"
                                  disabled={subiendoPasaporteId === solicitud.id}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleSubirPasaporte(solicitud, e.target.files[0]);
                                      e.target.value = "";
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label
                              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/80 hover:bg-blue-50 hover:border-main-blue text-gray-700 hover:text-main-blue text-xs font-semibold cursor-pointer transition-all ${
                                subiendoPasaporteId === solicitud.id ? 'opacity-60 pointer-events-none' : ''
                              }`}
                            >
                              {subiendoPasaporteId === solicitud.id ? (
                                <>
                                  <CircularProgress size={13} thickness={4} sx={{ color: "#1D3557" }} />
                                  <span className="text-[11px] font-bold">Subiendo pasaporte...</span>
                                </>
                              ) : (
                                <>
                                  <span>📎</span>
                                  <span className="text-[11px] font-bold">Subir Copia de Pasaporte (PDF/Imagen)</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                disabled={subiendoPasaporteId === solicitud.id}
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleSubirPasaporte(solicitud, e.target.files[0]);
                                    e.target.value = "";
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>

                      {/* CONSTANCIA LEGAL DE PROTECCIÓN DE DATOS (LEY 8968) */}
                      <div className="pt-2.5 border-t border-gray-100 space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Consentimiento Informado (Ley N° 8968)
                        </span>
                        <div className="flex items-center gap-1.5 text-xs flex-wrap">
                          {solicitud.aceptaPoliticaPrivacidad ? (
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1 text-[11px]">
                              <span>✓ Consentimiento Otorgado</span>
                              {solicitud.medioConsentimiento && (
                                <span className="text-[10px] font-extrabold text-emerald-900 bg-emerald-200/80 px-1.5 py-0.2 rounded-full">
                                  Vía {solicitud.medioConsentimiento}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                              No registrado
                            </span>
                          )}
                        </div>
                        {solicitud.constanciaPrivacidad && (
                          <span className="text-[10px] text-gray-600 italic block leading-tight pt-0.5">
                            "{solicitud.constanciaPrivacidad}"
                          </span>
                        )}
                        {solicitud.fechaAceptacionPrivacidad && (
                          <span className="text-[9px] text-gray-400 block pt-0.5">
                            Fecha: {formatearFecha(solicitud.fechaAceptacionPrivacidad)}
                            {solicitud.registradoPorAdmin && ` | Autorizado por: ${solicitud.registradoPorAdmin}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* COLUMNA 2: DETALLES FINANCIEROS Y CONTROL DE PAGOS */}
                    <div className="space-y-3 bg-slate-50/90 p-4 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Control Financiero
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          saldoPendiente <= 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {saldoPendiente <= 0 ? 'Liquidado 100%' : `${porcentajePagado}% Pagado`}
                        </span>
                      </div>

                      {/* BARRA VISUAL DE PROGRESO DE PAGO */}
                      <div className="space-y-1">
                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${saldoPendiente <= 0 ? 'bg-emerald-500' : 'bg-main-blue'}`}
                            style={{ width: `${Math.min(100, Math.max(0, porcentajePagado))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                          <span>Abonado: <strong className="text-gray-900">${montoPagado.toLocaleString()}</strong></span>
                          <span>Total: <strong className="text-gray-900">${montoTotal.toLocaleString()} USD</strong></span>
                        </div>
                      </div>

                      {/* DETALLE FINANCIERO */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Modalidad:</span>
                          <span className="font-bold text-main-blue">
                            {planCuotas > 1 ? `Financiamiento (${planCuotas} cuotas)` : "Pago Único (1 cuota)"}
                          </span>
                        </div>

                        {/* DESGLOSE DE CUOTAS PARA PLANES FINANCIADOS */}
                        {planCuotas > 1 && (
                          <div className="pt-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                              Cuotas ({cuotasPagadas}/{planCuotas} pagadas):
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                              {Array.from({ length: planCuotas }).map((_, idx) => {
                                const cuotaNum = idx + 1;
                                const pagada = cuotaNum <= cuotasPagadas;
                                return (
                                  <div
                                    key={idx}
                                    className={`px-1.5 py-1 rounded text-center border text-[10px] font-bold ${
                                      pagada 
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-900" 
                                        : "bg-white border-gray-200 text-gray-500"
                                    }`}
                                  >
                                    <span className="block leading-none text-[9px] uppercase">
                                      C{cuotaNum} {pagada ? "✓" : "⏳"}
                                    </span>
                                    <span className="block leading-tight text-[10px]">
                                      ${montoPorCuota.toFixed(0)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-gray-600 font-medium">Saldo por Liquidar:</span>
                          <span className={`font-black ${saldoPendiente > 0 ? 'text-rose-700 text-sm' : 'text-emerald-700'}`}>
                            {saldoPendiente > 0 ? `$${saldoPendiente.toLocaleString()} USD` : "✓ Sin saldo pendiente"}
                          </span>
                        </div>

                        {solicitud.stripePaymentIntentId && (
                          <div className="pt-1 text-[10px] text-gray-500">
                            <span className="block font-semibold text-gray-600">ID Stripe:</span>
                            <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 block truncate text-slate-700 font-mono select-all">
                              {solicitud.stripePaymentIntentId}
                            </code>
                          </div>
                        )}
                      </div>

                      {/* BOTÓN PRINCIPAL PARA GESTIONAR PAGOS Y ABONOS */}
                      <button
                        type="button"
                        onClick={() => abrirGestionPagos(solicitud)}
                        className="w-full bg-white hover:bg-main-blue hover:text-white text-main-blue border-2 border-main-blue/30 hover:border-main-blue text-xs font-black py-2 px-3 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>💳</span>
                        <span>Gestionar Pagos y Abonos ({cantPagos})</span>
                      </button>
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

      {/* ========================================================= */}
      {/* MODAL COMPLETO DE CONTROL DE PAGOS Y ABONOS DEL CURSO     */}
      {/* ========================================================= */}
      {modalPagos.open && modalPagos.solicitud && (
        <Dialog
          open={modalPagos.open}
          onClose={() => setModalPagos({ open: false, solicitud: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 800, color: "#1D3557", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="flex items-center gap-2 truncate">
              <span className="text-xl">💳</span>
              <span className="truncate">
                Control de Pagos: {modalPagos.solicitud.nombre || `${modalPagos.solicitud.nombres || ''} ${modalPagos.solicitud.apellidos || ''}`.trim()}
              </span>
            </div>
            <button
              onClick={() => setModalPagos({ open: false, solicitud: null })}
              className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </DialogTitle>

          <DialogContent sx={{ py: 3 }} className="space-y-6">
            {/* CABECERA FINANCIERA RESUMEN */}
            <div className="bg-gradient-to-r from-slate-900 to-main-blue rounded-2xl p-4 sm:p-5 text-white shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                    Expediente Académico
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {modalPagos.solicitud.nombre || "Participante"}
                  </h3>
                  <p className="text-xs text-blue-200">
                    Curso: {modalPagos.solicitud.cursoTitulo || modalPagos.solicitud.cursoId}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl text-center border border-white/20">
                    <span className="text-[10px] uppercase text-blue-200 block font-bold">Total Inversión</span>
                    <span className="text-base font-black text-white">
                      ${(Number(modalPagos.solicitud.montoTotalInversion) || 3350).toLocaleString()} USD
                    </span>
                  </div>

                  <div className="bg-emerald-500/20 px-3.5 py-2 rounded-xl text-center border border-emerald-400/30">
                    <span className="text-[10px] uppercase text-emerald-200 block font-bold">Abonado</span>
                    <span className="text-base font-black text-emerald-300">
                      ${(Number(modalPagos.solicitud.montoPagado) || 0).toLocaleString()} USD
                    </span>
                  </div>

                  <div className="bg-rose-500/20 px-3.5 py-2 rounded-xl text-center border border-rose-400/30">
                    <span className="text-[10px] uppercase text-rose-200 block font-bold">Saldo Restante</span>
                    <span className="text-base font-black text-rose-300">
                      ${(Number(modalPagos.solicitud.saldoPendiente) !== undefined 
                        ? Number(modalPagos.solicitud.saldoPendiente) 
                        : Math.max(0, (Number(modalPagos.solicitud.montoTotalInversion) || 3350) - (Number(modalPagos.solicitud.montoPagado) || 0))
                      ).toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* BARRA DE PROGRESO DE LIQUIDACIÓN */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-blue-200">
                  <span>
                    Modalidad: {Number(modalPagos.solicitud.planCuotas) > 1 
                      ? `${modalPagos.solicitud.planCuotas} cuotas de financiamiento` 
                      : "Pago único de contado"
                    }
                  </span>
                  <span>
                    {Math.round(((Number(modalPagos.solicitud.montoPagado) || 0) / (Number(modalPagos.solicitud.montoTotalInversion) || 3350)) * 100)}% Liquidado
                  </span>
                </div>
                <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, Math.round(((Number(modalPagos.solicitud.montoPagado) || 0) / (Number(modalPagos.solicitud.montoTotalInversion) || 3350)) * 100))}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* OPCIÓN PARA AJUSTAR PLAN FINANCIERO O BECA */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Configuración del Plan de Pago
                  </h4>
                  <p className="text-xs text-gray-500">
                    Ajusta si el participante cambió de cuotas o si se le otorgó un monto especial por beca institucional.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditandoPlan(!editandoPlan)}
                  className="text-xs font-bold text-main-blue hover:text-light-blue px-3 py-1 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {editandoPlan ? "✕ Cancelar edición" : "✏️ Modificar Plan"}
                </button>
              </div>

              {editandoPlan && (
                <form onSubmit={handleGuardarPlan} className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Monto Total Inversión (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formPlan.montoTotalInversion}
                      onChange={(e) => setFormPlan({ ...formPlan, montoTotalInversion: Number(e.target.value) })}
                      className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Modalidad / Plan de Cuotas *
                    </label>
                    <select
                      value={formPlan.planCuotas}
                      onChange={(e) => setFormPlan({ ...formPlan, planCuotas: Number(e.target.value) })}
                      className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-gray-300 bg-white"
                    >
                      <option value={1}>Pago Único (1 cuota)</option>
                      <option value={2}>Financiamiento en 2 cuotas</option>
                      <option value={3}>Financiamiento en 3 cuotas</option>
                      <option value={4}>Financiamiento en 4 cuotas</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={guardandoPlan}
                      fullWidth
                      sx={{
                        bgcolor: "#1D3557",
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "12px",
                        py: 1,
                        borderRadius: "8px",
                        "&:hover": { bgcolor: "#14253d" }
                      }}
                    >
                      {guardandoPlan ? "Guardando..." : "Actualizar Plan"}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* FORMULARIO PARA REGISTRAR NUEVO ABONO / PAGO */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">➕</span>
                <h4 className="text-sm font-extrabold text-main-blue uppercase tracking-wider">
                  Registrar Nuevo Pago o Abono
                </h4>
              </div>

              <form onSubmit={handleRegistrarAbono} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Monto a Abonar (USD) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={formAbono.monto}
                      onChange={(e) => setFormAbono({ ...formAbono, monto: e.target.value })}
                      className="w-full text-sm font-black px-3.5 py-2 rounded-xl border border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-main-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Fecha del Pago *
                    </label>
                    <input
                      type="date"
                      required
                      value={formAbono.fecha}
                      onChange={(e) => setFormAbono({ ...formAbono, fecha: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-main-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Método de Pago *
                    </label>
                    <select
                      value={formAbono.metodo}
                      onChange={(e) => setFormAbono({ ...formAbono, metodo: e.target.value })}
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-gray-300 bg-white font-medium"
                    >
                      <option value="transferencia">🏛️ Transferencia Bancaria</option>
                      <option value="stripe">💳 Tarjeta / Stripe</option>
                      <option value="efectivo">💵 Efectivo</option>
                      <option value="sinpe">📱 SINPE Móvil / Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Referencia Bancaria o Comprobante #
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Ref. Banco Costa Rica #89472"
                      value={formAbono.referencia}
                      onChange={(e) => setFormAbono({ ...formAbono, referencia: e.target.value })}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-main-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Adjuntar Comprobante (Imagen o PDF)
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setFormAbono({ ...formAbono, comprobanteFile: e.target.files?.[0] || null })}
                      className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-main-blue file:text-white hover:file:bg-light-blue cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Notas u Observaciones del Abono (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Corresponde a la Cuota 2 de 3 convenida por correo"
                    value={formAbono.notas}
                    onChange={(e) => setFormAbono({ ...formAbono, notas: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-main-blue"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={guardandoAbono}
                    sx={{
                      bgcolor: "#1D3557",
                      textTransform: "none",
                      fontWeight: 700,
                      px: 3,
                      py: 1,
                      borderRadius: "10px",
                      "&:hover": { bgcolor: "#14253d" }
                    }}
                  >
                    {guardandoAbono ? "Registrando Abono..." : "💾 Registrar Abono"}
                  </Button>
                </div>
              </form>
            </div>

            {/* TABLA DE HISTORIAL DE PAGOS REGISTRADOS */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Historial de Pagos y Abonos Registrados
              </h4>

              {(!modalPagos.solicitud.historialPagos || modalPagos.solicitud.historialPagos.length === 0) ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-xs text-gray-500 font-medium">
                    No hay abonos individuales registrados en el historial de este participante.
                    {Number(modalPagos.solicitud.montoPagado) > 0 && ` (Se cuenta con un monto base registrado de $${Number(modalPagos.solicitud.montoPagado).toLocaleString()} USD).`}
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-3.5 py-2.5">Fecha</th>
                        <th className="px-3.5 py-2.5">Monto</th>
                        <th className="px-3.5 py-2.5">Método</th>
                        <th className="px-3.5 py-2.5">Referencia / Comprobante</th>
                        <th className="px-3.5 py-2.5">Registrado Por</th>
                        <th className="px-3.5 py-2.5 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {modalPagos.solicitud.historialPagos.map((pago, idx) => (
                        <tr key={pago.id || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3.5 py-2.5 font-semibold text-gray-900 whitespace-nowrap">
                            {pago.fecha || "Sin fecha"}
                          </td>
                          <td className="px-3.5 py-2.5 font-black text-emerald-700 whitespace-nowrap">
                            ${Number(pago.monto).toLocaleString()} USD
                          </td>
                          <td className="px-3.5 py-2.5 capitalize whitespace-nowrap">
                            {pago.metodo || "Transferencia"}
                          </td>
                          <td className="px-3.5 py-2.5 max-w-[200px]">
                            <span className="block font-semibold text-gray-800 truncate" title={pago.referencia}>
                              {pago.referencia || "Sin ref."}
                            </span>
                            {pago.notas && (
                              <span className="block text-[10px] text-gray-500 italic truncate" title={pago.notas}>
                                {pago.notas}
                              </span>
                            )}
                            {pago.comprobanteUrl && (
                              <a
                                href={pago.comprobanteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-main-blue hover:underline inline-flex items-center gap-0.5 mt-0.5"
                              >
                                📎 Ver Comprobante
                              </a>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-[10px] text-gray-500 truncate max-w-[140px]" title={pago.registradoPor}>
                            {pago.registradoPor || "Admin"}
                          </td>
                          <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleEliminarAbono(pago.id, Number(pago.monto))}
                              className="text-rose-600 hover:text-rose-800 font-bold text-[11px] p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Anular abono"
                            >
                              ✕ Anular
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: "1px solid #f3f4f6" }}>
            <Button
              onClick={() => setModalPagos({ open: false, solicitud: null })}
              variant="outlined"
              sx={{ textTransform: "none", color: "#6b7280", borderColor: "#d1d5db", fontWeight: 700 }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* MODAL PARA VISUALIZAR / DESPLEGAR COPIA DEL PASAPORTE */}
      <Dialog
        open={modalPasaporte.open}
        onClose={() => setModalPasaporte({ open: false, url: "", nombre: "", tipo: "" })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#1D3557", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="flex items-center gap-2 truncate">
            <span className="text-xl">🛂</span>
            <span className="truncate">Copia de Pasaporte: {modalPasaporte.nombre}</span>
          </div>
          <button
            type="button"
            onClick={() => setModalPasaporte({ open: false, url: "", nombre: "", tipo: "" })}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </DialogTitle>
        <DialogContent sx={{ p: 2, bgcolor: "#0f172a", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          {modalPasaporte.tipo?.includes("pdf") || modalPasaporte.url?.toLowerCase().includes(".pdf") ? (
            <iframe
              src={modalPasaporte.url}
              title="Copia de Pasaporte PDF"
              className="w-full h-[70vh] rounded-lg border-0 bg-white"
            />
          ) : (
            <img
              src={modalPasaporte.url}
              alt="Copia de Pasaporte"
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-lg"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0", justifyContent: "space-between" }}>
          <a
            href={modalPasaporte.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-main-blue hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <span>↗</span>
            <span>Abrir en pestaña completa / Descargar</span>
          </a>
          <Button
            onClick={() => setModalPasaporte({ open: false, url: "", nombre: "", tipo: "" })}
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: "#1D3557",
              fontWeight: 700,
              borderRadius: "10px",
              "&:hover": { bgcolor: "#14253d" }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

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
              Ingresa los datos del interesado que se haya comunicado directamente. Quedará guardado en el expediente oficial del curso con su estado de gestión, copia de pasaporte y constancia de consentimiento informado.
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

            {/* SUBIR COPIA DE PASAPORTE EN REGISTRO MANUAL */}
            <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-200 space-y-1.5">
              <label className="block text-xs font-bold text-main-blue uppercase">
                📎 Copia del Pasaporte (PDF o Imagen) - Opcional
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setArchivoPasaporteManual(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-main-blue file:text-white hover:file:bg-light-blue cursor-pointer"
              />
              {archivoPasaporteManual && (
                <span className="text-[11px] text-emerald-700 font-bold block pt-1">
                  ✓ Seleccionado: {archivoPasaporteManual.name} ({(archivoPasaporteManual.size / 1024).toFixed(0)} KB)
                </span>
              )}
            </div>

            {/* SECCIÓN CONSENTIMIENTO INFORMADO (LEY 8968) */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block flex items-center gap-1.5">
                🛡️ Consentimiento de Privacidad y Tratamiento de Datos (Ley N° 8968)
              </span>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formManual.otorgoConsentimiento}
                  onChange={(e) => setFormManual({ ...formManual, otorgoConsentimiento: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <span className="text-xs text-emerald-950 font-medium leading-snug">
                  <strong>Constancia de Consentimiento Expreso:</strong> El participante ha manifestado de forma informada su consentimiento para el tratamiento de sus datos personales y académicos.
                </span>
              </label>

              {formManual.otorgoConsentimiento && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-emerald-200/60">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">
                      Medio o Canal de Consentimiento *
                    </label>
                    <select
                      value={formManual.medioConsentimiento}
                      onChange={(e) => setFormManual({ ...formManual, medioConsentimiento: e.target.value })}
                      className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="WhatsApp">💬 Mensaje de WhatsApp</option>
                      <option value="Correo Electrónico">✉️ Correo Electrónico</option>
                      <option value="Llamada Telefónica">📞 Llamada Telefónica</option>
                      <option value="Formulario Físico / Escrito">📝 Formulario Físico / Escrito</option>
                      <option value="Presencial / Verbal">🤝 Presencial / Verbal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">
                      Constancia / Nota Expresa:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Aceptó términos por WhatsApp el 04/10/2026"
                      value={formManual.detalleConsentimiento}
                      onChange={(e) => setFormManual({ ...formManual, detalleConsentimiento: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-emerald-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
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
        onClose={() => setModalBorrar({ open: false, id: null, nombre: "", cursoTitulo: "" })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#1D3557" }}>
          ¿Eliminar solicitud?
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar permanentemente la solicitud de{" "}
            <strong>{modalBorrar.nombre || "este usuario"}</strong>? Esta acción no se puede deshacer y quedará registrada en el log de auditoría.
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setModalBorrar({ open: false, id: null, nombre: "", cursoTitulo: "" })}
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
