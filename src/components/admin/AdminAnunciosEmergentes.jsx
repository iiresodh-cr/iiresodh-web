// src/components/admin/AdminAnunciosEmergentes.jsx
import { useState, useEffect, useRef } from "react";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  writeBatch,
  setDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/config";

// Wrappers de UI
import AdminTextField from "../ui/AdminTextField";
import ConfirmDialog from "../ui/ConfirmDialog";
import ToastAlert from "../ui/ToastAlert";
import AnuncioEmergenteModal from "../AnuncioEmergenteModal";

// MUI
import { 
  Button, 
  FormControlLabel, 
  Switch, 
  CircularProgress, 
  Chip, 
  Paper 
} from "@mui/material";

// Iconos Lucide
import { 
  Megaphone, 
  FileText, 
  Image as ImageIcon, 
  Eye, 
  Trash2, 
  Edit3, 
  Power, 
  CheckCircle2, 
  XCircle, 
  Share2, 
  ArrowLeft, 
  Upload, 
  AlertCircle,
  ExternalLink,
  Calendar
} from "lucide-react";

const convertirAWebp = (file, calidad = 0.8) => {
  return new Promise((resolve, reject) => {
    if (file.type === "image/webp" || file.type === "image/gif" || file.type === "image/svg+xml") {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const nuevoNombre = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([blob], nuevoNombre, { type: "image/webp" });
            resolve(webpFile);
          } else {
            reject(new Error("Error al convertir la imagen a WebP"));
          }
        }, "image/webp", calidad);
      };
      img.onerror = () => reject(new Error("Error al cargar la imagen"));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
};

export default function AdminAnunciosEmergentes({ onVolver, logActividad }) {
  // Lista de anuncios guardados
  const [anuncios, setAnuncios] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  // Estados del formulario
  const [editandoId, setEditandoId] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("COMUNICADO OFICIAL");
  const [mensajeTexto, setMensajeTexto] = useState("");
  const [enlaceBoton, setEnlaceBoton] = useState("");
  const [textoBoton, setTextoBoton] = useState("");
  const [mostrarCompartir, setMostrarCompartir] = useState(true);
  const [activo, setActivo] = useState(true);

  // Estados de Imagen
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [imagenPreviewUrl, setImagenPreviewUrl] = useState("");
  const [imagenUrlExistente, setImagenUrlExistente] = useState("");

  // Estados de Documento PDF
  const [pdfArchivo, setPdfArchivo] = useState(null);
  const [pdfNombre, setPdfNombre] = useState("");
  const [pdfUrlExistente, setPdfUrlExistente] = useState("");

  // Feedback y loaders
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState({ open: false, mensaje: "", esError: false });
  const [modalBorrar, setModalBorrar] = useState({ open: false, id: null, titulo: "" });
  
  // Previsualización interactiva del Modal
  const [modalPreviewOpen, setModalPreviewOpen] = useState(false);

  const fileInputImageRef = useRef(null);
  const fileInputPdfRef = useRef(null);

  const mostrarToast = (msg, esError = false) => {
    setAlerta({ open: true, mensaje: msg, esError });
  };

  // Cargar lista de anuncios desde Firestore
  const cargarAnuncios = async () => {
    setCargandoLista(true);
    try {
      const q = query(
        collection(db, "configuracion", "anuncio_emergente", "historial"),
        orderBy("fechaCreacion", "desc")
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAnuncios(items);
    } catch (err) {
      console.error("Error al cargar anuncios:", err);
      mostrarToast("Error al cargar la lista de anuncios.", true);
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => {
    cargarAnuncios();
  }, []);

  const limpiarFormulario = () => {
    setEditandoId(null);
    setTitulo("");
    setSubtitulo("COMUNICADO OFICIAL");
    setMensajeTexto("");
    setEnlaceBoton("");
    setTextoBoton("");
    setMostrarCompartir(true);
    setActivo(true);
    setImagenArchivo(null);
    setImagenPreviewUrl("");
    setImagenUrlExistente("");
    setPdfArchivo(null);
    setPdfNombre("");
    setPdfUrlExistente("");
    if (fileInputImageRef.current) fileInputImageRef.current.value = "";
    if (fileInputPdfRef.current) fileInputPdfRef.current.value = "";
  };

  const handleSeleccionarImagen = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      mostrarToast("Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP).", true);
      return;
    }

    try {
      const webpFile = await convertirAWebp(file);
      setImagenArchivo(webpFile);
      setImagenPreviewUrl(URL.createObjectURL(webpFile));
    } catch (err) {
      console.error("Error al convertir imagen a WebP:", err);
      setImagenArchivo(file);
      setImagenPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSeleccionarPdf = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      mostrarToast("El archivo seleccionado debe ser un documento PDF (.pdf).", true);
      return;
    }

    setPdfArchivo(file);
    setPdfNombre(file.name);
  };

  const handleEliminarImagenSeleccionada = () => {
    setImagenArchivo(null);
    setImagenPreviewUrl("");
    setImagenUrlExistente("");
    if (fileInputImageRef.current) fileInputImageRef.current.value = "";
  };

  const handleEliminarPdfSeleccionado = () => {
    setPdfArchivo(null);
    setPdfNombre("");
    setPdfUrlExistente("");
    if (fileInputPdfRef.current) fileInputPdfRef.current.value = "";
  };

  // Guardar (Crear o Actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim()) {
      mostrarToast("El título del anuncio es obligatorio.", true);
      return;
    }

    if (!imagenArchivo && !imagenUrlExistente && !mensajeTexto.trim() && !pdfArchivo && !pdfUrlExistente) {
      mostrarToast("Debes añadir al menos una imagen, un texto informativo o un documento PDF al comunicado.", true);
      return;
    }

    setLoading(true);

    try {
      let finalImagenUrl = imagenUrlExistente;
      let finalPdfUrl = pdfUrlExistente;
      let finalPdfNombre = pdfNombre;

      // Subir nueva imagen si fue seleccionada
      if (imagenArchivo) {
        const nombreLimpio = imagenArchivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const rutaImagen = `noticias/anuncios/imagenes/${Date.now()}_${nombreLimpio}`;
        const storageRefImg = ref(storage, rutaImagen);
        await uploadBytes(storageRefImg, imagenArchivo);
        finalImagenUrl = await getDownloadURL(storageRefImg);
      }

      // Subir nuevo PDF si fue seleccionado
      if (pdfArchivo) {
        const nombreLimpio = pdfArchivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const rutaPdf = `noticias/anuncios/documentos/${Date.now()}_${nombreLimpio}`;
        const storageRefPdf = ref(storage, rutaPdf);
        await uploadBytes(storageRefPdf, pdfArchivo);
        finalPdfUrl = await getDownloadURL(storageRefPdf);
        finalPdfNombre = pdfArchivo.name;
      }

      // Si este anuncio se marca como ACTIVO, desactivamos los otros en el historial
      if (activo) {
        const batch = writeBatch(db);
        anuncios.forEach((item) => {
          if (item.id !== editandoId && item.activo) {
            batch.update(doc(db, "configuracion", "anuncio_emergente", "historial", item.id), { activo: false });
          }
        });
        await batch.commit();
      }

      const datosAnuncio = {
        titulo: titulo.trim(),
        subtitulo: subtitulo.trim(),
        mensaje: mensajeTexto.trim(),
        imagenUrl: finalImagenUrl,
        archivoPdfUrl: finalPdfUrl,
        archivoPdfNombre: finalPdfNombre,
        enlaceBoton: enlaceBoton.trim(),
        textoBoton: textoBoton.trim(),
        mostrarCompartir: !!mostrarCompartir,
        activo: !!activo,
        ultimaActualizacion: serverTimestamp()
      };

      let docIdGuardado = editandoId;

      if (editandoId) {
        await updateDoc(doc(db, "configuracion", "anuncio_emergente", "historial", editandoId), datosAnuncio);
        if (logActividad) {
          await logActividad("Modificó ventana emergente", { titulo: titulo.trim(), id: editandoId });
        }
        mostrarToast("¡Anuncio emergente actualizado con éxito!");
      } else {
        datosAnuncio.fechaCreacion = serverTimestamp();
        const docRef = await addDoc(collection(db, "configuracion", "anuncio_emergente", "historial"), datosAnuncio);
        docIdGuardado = docRef.id;
        if (logActividad) {
          await logActividad("Publicó nueva ventana emergente", { titulo: titulo.trim(), id: docRef.id });
        }
        mostrarToast("¡Anuncio emergente creado y guardado con éxito!");
      }

      // Sincronizar el documento principal que lee Home en tiempo real
      if (activo) {
        await setDoc(doc(db, "configuracion", "anuncio_emergente"), {
          ...datosAnuncio,
          id: docIdGuardado
        });
      } else if (editandoId) {
        // Si se editó y se puso inactivo, desactivamos el documento principal si coincidía
        await setDoc(doc(db, "configuracion", "anuncio_emergente"), {
          activo: false,
          ultimaActualizacion: serverTimestamp()
        });
      }

      limpiarFormulario();
      await cargarAnuncios();
    } catch (err) {
      console.error("Error guardando anuncio emergente:", err);
      mostrarToast("Error al guardar el anuncio: " + (err.message || "Error de servidor"), true);
    } finally {
      setLoading(false);
    }
  };

  // Cargar anuncio en modo edición
  const handleEditar = (item) => {
    setEditandoId(item.id);
    setTitulo(item.titulo || "");
    setSubtitulo(item.subtitulo || "COMUNICADO OFICIAL");
    setMensajeTexto(item.mensaje || "");
    setEnlaceBoton(item.enlaceBoton || "");
    setTextoBoton(item.textoBoton || "");
    setMostrarCompartir(item.mostrarCompartir !== false);
    setActivo(!!item.activo);
    setImagenUrlExistente(item.imagenUrl || "");
    setImagenPreviewUrl(item.imagenUrl || "");
    setImagenArchivo(null);
    setPdfUrlExistente(item.archivoPdfUrl || "");
    setPdfNombre(item.archivoPdfNombre || "");
    setPdfArchivo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cambiar estado activo/inactivo directamente desde la lista
  const handleToggleActivo = async (item) => {
    const nuevoEstado = !item.activo;
    try {
      if (nuevoEstado) {
        // Desactivar todos los demás primero en el historial
        const batch = writeBatch(db);
        anuncios.forEach((a) => {
          if (a.id !== item.id && a.activo) {
            batch.update(doc(db, "configuracion", "anuncio_emergente", "historial", a.id), { activo: false });
          }
        });
        batch.update(doc(db, "configuracion", "anuncio_emergente", "historial", item.id), { activo: true });
        await batch.commit();

        // Actualizar documento público
        await setDoc(doc(db, "configuracion", "anuncio_emergente"), {
          ...item,
          activo: true,
          ultimaActualizacion: serverTimestamp()
        });
      } else {
        await updateDoc(doc(db, "configuracion", "anuncio_emergente", "historial", item.id), { activo: false });
        await setDoc(doc(db, "configuracion", "anuncio_emergente"), {
          activo: false,
          ultimaActualizacion: serverTimestamp()
        });
      }

      if (logActividad) {
        await logActividad(`${nuevoEstado ? "Activó" : "Desactivó"} ventana emergente`, { titulo: item.titulo, id: item.id });
      }

      mostrarToast(`Anuncio ${nuevoEstado ? "activado para la portada web" : "desactivado"}.`);
      await cargarAnuncios();
    } catch (err) {
      console.error("Error al cambiar estado activo:", err);
      mostrarToast("Error al cambiar el estado del anuncio.", true);
    }
  };

  // Confirmar y Ejecutar Eliminación
  const confirmarEliminar = (item) => {
    setModalBorrar({ open: true, id: item.id, titulo: item.titulo });
  };

  const ejecutarEliminar = async () => {
    const { id, titulo: tituloBorrado } = modalBorrar;
    setModalBorrar({ open: false, id: null, titulo: "" });
    try {
      await deleteDoc(doc(db, "configuracion", "anuncio_emergente", "historial", id));
      
      // Si el eliminado estaba activo, desactivar documento público
      const anuncioEliminado = anuncios.find(a => a.id === id);
      if (anuncioEliminado?.activo) {
        await setDoc(doc(db, "configuracion", "anuncio_emergente"), {
          activo: false,
          ultimaActualizacion: serverTimestamp()
        });
      }

      if (logActividad) {
        await logActividad("Eliminó anuncio emergente", { id, titulo: tituloBorrado });
      }
      mostrarToast("Anuncio eliminado exitosamente.");
      if (editandoId === id) limpiarFormulario();
      await cargarAnuncios();
    } catch (err) {
      console.error("Error eliminando anuncio:", err);
      mostrarToast("Error al eliminar el anuncio.", true);
    }
  };

  // Datos para la previsualización interactiva exacta
  const datosPreview = {
    id: editandoId || "preview",
    titulo: titulo || "Título de ejemplo del comunicado",
    subtitulo: subtitulo || "COMUNICADO OFICIAL",
    mensaje: mensajeTexto || "Este es el contenido explicativo del comunicado o anuncio que saldrá en la ventana emergente.",
    imagenUrl: imagenPreviewUrl || imagenUrlExistente,
    archivoPdfUrl: pdfArchivo ? URL.createObjectURL(pdfArchivo) : pdfUrlExistente,
    archivoPdfNombre: pdfNombre || (pdfArchivo ? pdfArchivo.name : "documento_oficial.pdf"),
    enlaceBoton: enlaceBoton,
    textoBoton: textoBoton,
    mostrarCompartir: mostrarCompartir
  };

  return (
    <div className="animate-fade-in-up">
      {/* ALERTA TOAST */}
      <ToastAlert
        open={alerta.open}
        message={alerta.mensaje}
        isError={alerta.esError}
        onClose={() => setAlerta({ open: false, mensaje: "", esError: false })}
      />

      {/* DIÁLOGO DE CONFIRMACIÓN PARA BORRAR */}
      <ConfirmDialog
        open={modalBorrar.open}
        title="¿Eliminar anuncio emergente?"
        content={`¿Estás seguro de que deseas eliminar permanentemente "${modalBorrar.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={ejecutarEliminar}
        onCancel={() => setModalBorrar({ open: false, id: null, titulo: "" })}
      />

      {/* MODAL DE PREVISUALIZACIÓN IDÉNTICO AL REAL */}
      {modalPreviewOpen && (
        <AnuncioEmergenteModal
          previewData={datosPreview}
          isManualOpen={modalPreviewOpen}
          onManualClose={() => setModalPreviewOpen(false)}
        />
      )}

      {/* BOTÓN REGRESAR AL DASHBOARD */}
      <button 
        onClick={() => { limpiarFormulario(); onVolver(); }} 
        className="mb-8 flex items-center gap-2 text-gray-500 font-medium hover:text-main-blue transition-colors cursor-pointer group"
      >
        <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:shadow border border-gray-100 transition-all">
          <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-main-blue" />
        </div>
        Regresar al menú principal
      </button>

      {/* HEADER DE LA SECCIÓN */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Megaphone className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-main-blue tracking-tight">
              Ventana Emergente (Popups de Anuncios y PDF)
            </h1>
          </div>
          <p className="text-gray-500 text-sm md:text-base">
            Publica comunicados oficiales, afiches promocionales o documentos PDF que saldrán en una ventana emergente en la portada web.
          </p>
        </div>

        {/* BOTÓN PREVISUALIZAR */}
        <button
          type="button"
          onClick={() => setModalPreviewOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white border border-gray-200 hover:border-main-blue text-main-blue font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
        >
          <Eye className="w-4 h-4 text-main-blue" />
          <span>Previsualizar Modal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {editandoId ? "Editar Comunicado Emergente" : "Crear Nuevo Comunicado Emergente"}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Completa los campos del anuncio. Recuerda que solo habrá un anuncio activo a la vez en el sitio web.
                </p>
              </div>

              {editandoId && (
                <div className="flex items-center gap-2">
                  <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                    MODO EDICIÓN
                  </span>
                  <button
                    onClick={limpiarFormulario}
                    className="text-xs text-gray-500 hover:text-main-red underline cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SWITCH DE ACTIVACIÓN INMEDIATA */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-blue-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-main-blue">Estado en el Sitio Web</h3>
                  <p className="text-xs text-gray-500">
                    {activo ? "Este comunicado se mostrará a los visitantes en la portada web." : "Guardado como borrador (inactivo)."}
                  </p>
                </div>
                <FormControlLabel
                  control={
                    <Switch
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={<span className={`text-xs font-bold ${activo ? "text-green-600" : "text-gray-400"}`}>{activo ? "ACTIVO" : "INACTIVO"}</span>}
                />
              </div>

              {/* TÍTULO Y SUBTÍTULO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <AdminTextField
                    label="Título del Anuncio o Comunicado"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Pronunciamiento oficial sobre Derechos Humanos"
                    required
                  />
                </div>
                <div>
                  <AdminTextField
                    label="Etiqueta / Subtítulo"
                    value={subtitulo}
                    onChange={(e) => setSubtitulo(e.target.value)}
                    placeholder="Ej: COMUNICADO OFICIAL"
                  />
                </div>
              </div>

              {/* TEXTO / MENSAJE */}
              <div>
                <AdminTextField
                  label="Mensaje o Contenido del Comunicado (Opcional)"
                  value={mensajeTexto}
                  onChange={(e) => setMensajeTexto(e.target.value)}
                  placeholder="Redacta el texto que describe el anuncio o comunicado..."
                  multiline
                  rows={4}
                />
              </div>

              {/* SECCIÓN DE IMAGEN / AFICHE */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                    <ImageIcon className="w-5 h-5 text-main-blue" />
                    <span>Afiche o Imagen Destacada (Opcional)</span>
                  </div>
                  {(imagenPreviewUrl || imagenUrlExistente) && (
                    <button
                      type="button"
                      onClick={handleEliminarImagenSeleccionada}
                      className="text-xs text-main-red hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Quitar imagen
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {(imagenPreviewUrl || imagenUrlExistente) ? (
                    <div className="relative w-36 h-28 rounded-xl overflow-hidden border border-gray-300 bg-white shadow-xs shrink-0">
                      <img
                        src={imagenPreviewUrl || imagenUrlExistente}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-36 h-28 rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 shrink-0">
                      <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                      <span className="text-[10px]">Sin imagen</span>
                    </div>
                  )}

                  <div className="w-full space-y-2">
                    <input
                      type="file"
                      ref={fileInputImageRef}
                      accept="image/*"
                      onChange={handleSeleccionarImagen}
                      className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-main-blue file:text-white hover:file:bg-main-blue/90 cursor-pointer"
                    />
                    <p className="text-[11px] text-gray-500">
                      Formatos admitidos: JPG, PNG, WebP. Se optimizará y comprimirá automáticamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE DOCUMENTO PDF */}
              <div className="p-5 rounded-2xl border-2 border-red-100 bg-red-50/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-main-red font-bold text-sm">
                    <FileText className="w-5 h-5" />
                    <span>Documento PDF Oficial (Opcional)</span>
                  </div>
                  {(pdfArchivo || pdfUrlExistente) && (
                    <button
                      type="button"
                      onClick={handleEliminarPdfSeleccionado}
                      className="text-xs text-main-red hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Quitar PDF
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {(pdfArchivo || pdfUrlExistente) && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-red-200">
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-5 h-5 text-main-red shrink-0" />
                        <span className="text-xs font-bold text-gray-800 truncate">
                          {pdfNombre || (pdfArchivo ? pdfArchivo.name : "Documento PDF cargado")}
                        </span>
                      </div>
                      {pdfUrlExistente && (
                        <a
                          href={pdfUrlExistente}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-main-blue hover:underline flex items-center gap-1 font-semibold shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Abrir PDF
                        </a>
                      )}
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputPdfRef}
                    accept="application/pdf,.pdf"
                    onChange={handleSeleccionarPdf}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-main-red file:text-white hover:file:bg-main-red/90 cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500">
                    Al adjuntar un documento PDF, la ventana emergente activará automáticamente un <strong>visor integrado</strong> de lectura con opciones de descarga y pantalla completa.
                  </p>
                </div>
              </div>

              {/* BOTÓN DE ACCIÓN / ENLACE EXTERNO */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-white space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-600">
                  Botón de Acción Principal (CTA Opcional)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminTextField
                    label="Texto del botón"
                    value={textoBoton}
                    onChange={(e) => setTextoBoton(e.target.value)}
                    placeholder="Ej: Inscribirse al curso / Ver detalles"
                  />
                  <AdminTextField
                    label="Enlace de destino (URL)"
                    value={enlaceBoton}
                    onChange={(e) => setEnlaceBoton(e.target.value)}
                    placeholder="Ej: /cursos/nombre-curso o https://..."
                  />
                </div>
              </div>

              {/* SWITCH DE COMPARTIR EN REDES SOCIALES */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-main-red" />
                  <span className="text-xs md:text-sm font-bold text-gray-700">
                    Habilitar botones para compartir en redes sociales (WhatsApp, X, Facebook, LinkedIn)
                  </span>
                </div>
                <Switch
                  checked={mostrarCompartir}
                  onChange={(e) => setMostrarCompartir(e.target.checked)}
                  color="primary"
                />
              </div>

              {/* BOTÓN SUBMIT */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  fullWidth
                  sx={{
                    py: 1.8,
                    borderRadius: "16px",
                    fontWeight: 800,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    bgcolor: "#1D3557",
                    "&:hover": { bgcolor: "#15263F" }
                  }}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <CircularProgress size={20} color="inherit" />
                      <span>Guardando y subiendo archivos...</span>
                    </div>
                  ) : (
                    <span>{editandoId ? "Actualizar Anuncio Emergente" : "Guardar y Publicar Anuncio"}</span>
                  )}
                </Button>

                {editandoId && (
                  <Button
                    type="button"
                    onClick={limpiarFormulario}
                    variant="outlined"
                    sx={{
                      py: 1.8,
                      borderRadius: "16px",
                      fontWeight: 700,
                      textTransform: "none",
                      color: "#6B7280",
                      borderColor: "#D1D5DB"
                    }}
                  >
                    Cancelar Edición
                  </Button>
                )}
              </div>
            </form>
          </section>
        </div>

        {/* COLUMNA DERECHA: HISTORIAL / LISTA DE ANUNCIOS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">Historial de Anuncios</h3>
              <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-full">
                {anuncios.length} total
              </span>
            </div>

            {cargandoLista ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <CircularProgress size={30} thickness={4} sx={{ color: "#1D3557" }} />
                <span className="text-xs text-gray-400 font-semibold">Cargando anuncios...</span>
              </div>
            ) : anuncios.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs space-y-2">
                <Megaphone className="w-8 h-8 mx-auto opacity-30" />
                <p>No hay comunicados o anuncios registrados.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                {anuncios.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 ${
                      item.activo
                        ? "border-green-300 bg-green-50/30 shadow-xs"
                        : "border-gray-200 bg-gray-50/50 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.activo ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}>
                        {item.activo ? "ACTIVO EN WEB" : "INACTIVO"}
                      </span>

                      {/* Iconos de contenido */}
                      <div className="flex items-center gap-1.5 text-gray-400">
                        {item.imagenUrl && <ImageIcon className="w-3.5 h-3.5 text-blue-500" title="Contiene imagen" />}
                        {item.archivoPdfUrl && <FileText className="w-3.5 h-3.5 text-red-500" title="Contiene PDF" />}
                      </div>
                    </div>

                    <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 mb-1">
                      {item.titulo}
                    </h4>

                    {item.subtitulo && (
                      <p className="text-[11px] text-gray-500 font-medium truncate mb-2">
                        {item.subtitulo}
                      </p>
                    )}

                    {/* Acciones de la tarjeta */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleActivo(item)}
                        className={`text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          item.activo ? "text-amber-600 hover:text-amber-700" : "text-green-600 hover:text-green-700"
                        }`}
                        title={item.activo ? "Desactivar de la web" : "Activar para la web"}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{item.activo ? "Desactivar" : "Activar"}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditar(item)}
                          className="p-1.5 text-gray-400 hover:text-main-blue hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmarEliminar(item)}
                          className="p-1.5 text-gray-400 hover:text-main-red hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
