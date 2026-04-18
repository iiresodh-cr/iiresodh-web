import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { signOut } from "firebase/auth";
import { auth, db, storage, functions } from "../firebase/config";
import { collection, addDoc, updateDoc, serverTimestamp, doc, deleteDoc, getDocs, query, orderBy, Timestamp, limit, startAfter, endBefore, limitToLast, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";

import logoColor from "../assets/Logo_Oficiale_200w-trim.png";

// Importación de los nuevos Wrappers de MUI
import AdminTextField from "../components/ui/AdminTextField";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ToastAlert from "../components/ui/ToastAlert";
// prettier-ignore
import { Button, Checkbox, FormControlLabel, Box, Chip, Select, MenuItem, FormControl, InputLabel, CircularProgress } from "@mui/material";

const generarSlug = (texto) => {
  if (!texto) return `item-${Math.random().toString(36).substring(2, 6)}`;
  
  const baseSlug = texto
    .toString()
    .normalize('NFD') 
    .replace(/[\u0300-\u036f]/g, '') 
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') 
    .replace(/[\s_-]+/g, '-') 
    .replace(/^-+|-+$/g, ''); 
  
  const randomCode = Math.random().toString(36).substring(2, 6);
  
  return baseSlug ? `${baseSlug}-${randomCode}` : `item-${randomCode}`;
};

// ==========================================
// NUEVO MOTOR DE LINKS (INFALIBLE)
// ==========================================
export const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  
  let procesado = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const linksGuardados = [];

  procesado = procesado.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, url) => {
    linksGuardados.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline wrap-break-words">${label}</a>`);
    return `__LINK_${linksGuardados.length - 1}__`; 
  });

  procesado = procesado.replace(/(https?:\/\/[^\s]+)/g, (match, url) => {
    if (url.includes("__LINK_")) return match; 
    const textoFijo = "clic aquí";
    linksGuardados.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red font-bold underline wrap-break-words">${textoFijo}</a>`);
    return `__LINK_${linksGuardados.length - 1}__`; 
  });

  procesado = procesado.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (match) => {
    const term = match.substring(1);
    return `<a href="/buscar?q=${term}" class="text-light-blue hover:text-main-red font-bold">${match}</a>`;
  });

  procesado = procesado.replace(/__LINK_(\d+)__/g, (match, i) => linksGuardados[i]);

  const parrafos = procesado.split(/\n\s*\n/);
  return parrafos.map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`).join('');
};

const convertirAWebp = (file, calidad = 0.8) => {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/webp' || file.type === 'image/gif' || file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const nuevoNombre = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([blob], nuevoNombre, { type: 'image/webp' });
            resolve(webpFile);
          } else {
            reject(new Error("Error al convertir la imagen a WebP"));
          }
        }, 'image/webp', calidad);
      };
      img.onerror = () => reject(new Error("Error al cargar la imagen"));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
};

// ==========================================
// CONFIGURACIÓN DE TAGS
// Para agregar más, simplemente escribe aquí:
// ==========================================
const TAGS_DISPONIBLES = [
  "Canadá", "México", "Guatemala", 
  "Costa Rica", "Colombia", "Institucional"
];

export default function AdminPanel() {
  const navigate = useNavigate(); 
  
  const [vistaActiva, setVistaActiva] = useState("inicio");

  const [titulo, setTitulo] = useState("");
  const [resumen, setResumen] = useState("");
  const [contenido, setContenido] = useState("");
  const [fechaPersonalizada, setFechaPersonalizada] = useState(""); 

  // NUEVOS ESTADOS PARA EQUIPO
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const [bio, setBio] = useState("");
  const [destacado, setDestacado] = useState(false);
  const [orden, setOrden] = useState(0);

  
  // NUEVOS ESTADOS PARA LIBROS
  const [precio, setPrecio] = useState("");
  const [precioMXN, setPrecioMXN] = useState(""); // NUEVO CAMPO MONEDA LOCAL
  const [autor, setAutor] = useState(""); 
  const [archivoLibro, setArchivoLibro] = useState(null);
  const [archivoLibroNombre, setArchivoLibroNombre] = useState("");
  const [archivoLibroAnterior, setArchivoLibroAnterior] = useState(null);
  const [rutaStorageAnterior, setRutaStorageAnterior] = useState(null);
  
  const [imagenPrincipal, setImagenPrincipal] = useState(null);
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState(null);
  const [imagenesCarrusel, setImagenesCarrusel] = useState([]);
  
  const [editandoId, setEditandoId] = useState(null);
  const [imagenPrincipalAnterior, setImagenPrincipalAnterior] = useState(null); 
  const [carruselExistente, setCarruselExistente] = useState([]); 

  const [archivosAdjuntos, setArchivosAdjuntos] = useState([]);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generandoResumen, setGenerandoResumen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [listaItems, setListaItems] = useState([]);
  // NUEVOS ESTADOS PARA COMUNICACIONES
  const [tagsSeleccionados, setTagsSeleccionados] = useState([]);
  const [persistente, setPersistente] = useState(false);

  // NUEVOS ESTADOS PARA ADMINISTRACIÓN WEB
  const [actividades, setActividades] = useState([]);
  const [cargandoActividades, setCargandoActividades] = useState(false);
  const [usuariosUnicos, setUsuariosUnicos] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState("todos");
  const [ordenActividad, setOrdenActividad] = useState("desc");


  const [modalBorrar, setModalBorrar] = useState({ isOpen: false, id: null, titulo: "" });

  const [primerDoc, setPrimerDoc] = useState(null);
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [hayMas, setHayMas] = useState(true);
  const ITEMS_POR_PAGINA = 10;  

  const handleLogout = () => {
    navigate("/"); 
    setTimeout(() => {
      signOut(auth).catch((error) => console.error("Error al cerrar sesión:", error));
    }, 100);
  };

  const extraerNombreDesdeUrl = (url) => {
    if (!url) return "";
    try {
      const decodedUrl = decodeURIComponent(url);
      const urlParts = decodedUrl.split('?')[0].split('/');
      const fileNameWithTimestamp = urlParts[urlParts.length - 1];
      const nameParts = fileNameWithTimestamp.split('_');
      if (nameParts.length > 1) {
        return nameParts.slice(1).join('_');
      }
      return fileNameWithTimestamp;
    } catch (error) {
      return "Archivo existente";
    }
  };

const cargarUsuariosUnicos = async () => {
  if (usuariosUnicos.length > 0) return; // No recargar si ya los tenemos
  try {
    const q = query(collection(db, "auditoria_actividad"));
    const snapshot = await getDocs(q);
    const emails = new Set(snapshot.docs.map(doc => doc.data().usuarioEmail));
    setUsuariosUnicos(Array.from(emails).sort());
  } catch (error) {
    console.error("Error cargando lista de usuarios:", error);
  }
};

const cargarActividades = async () => {
  setCargandoActividades(true);
  setMensaje("Cargando registros de actividad...");
  try {
    const constraints = [orderBy("timestamp", ordenActividad)];
    if (filtroUsuario !== "todos") {
      constraints.push(where("usuarioEmail", "==", filtroUsuario));
    }
    const q = query(collection(db, "auditoria_actividad"), ...constraints, limit(100));
    const snapshot = await getDocs(q);
    const acts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setActividades(acts);
    setMensaje(acts.length > 0 ? `Se cargaron ${acts.length} registros.` : "No se encontraron registros con los filtros aplicados.");
  } catch (error) {
    console.error("Error cargando actividades:", error);
    setMensaje("Error al cargar las actividades.");
  } finally {
    setCargandoActividades(false);
    setTimeout(() => setMensaje(""), 4000);
  }
};

useEffect(() => {
  if (vistaActiva === "adminWeb") {
    cargarUsuariosUnicos();
  }
}, [vistaActiva]);

  const obtenerColeccionActiva = () => {
    if (vistaActiva === "articulos") return "articulos_academicos";
    if (vistaActiva === "libros") return "libros";
    if (vistaActiva === "equipo") return "equipo";
    return "noticias";
  };

  const cargarItemsBatch = async (consulta, direccion) => {
  try {
    const querySnapshot = await getDocs(consulta);
    if (!querySnapshot.empty) {
      setPrimerDoc(querySnapshot.docs[0]);
      setUltimoDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      
      let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // ORDENAMIENTO LOCAL MEJORADO
      if (vistaActiva === "comunicaciones") {
        data.sort((a, b) => {
          // 1. Prioridad: ¿Es persistente? (Las fijadas van arriba)
          if (a.persistente && !b.persistente) return -1;
          if (!a.persistente && b.persistente) return 1;
          
          // 2. Segunda prioridad: Fecha de publicación (Las más recientes van primero)
          // Usamos .seconds de los Timestamp de Firebase para comparar con precisión
          const tiempoA = a.fechaPublicacion?.seconds || 0;
          const tiempoB = b.fechaPublicacion?.seconds || 0;
          
          return tiempoB - tiempoA;
        });
      }

      setListaItems(data);
      setHayMas(querySnapshot.docs.length === ITEMS_POR_PAGINA);

        if (direccion === "sig") setPaginaActual(prev => prev + 1);
        if (direccion === "ant") setPaginaActual(prev => prev - 1);
        if (direccion === "inicio") setPaginaActual(1);
      } else {
        if (direccion === "inicio") {
            setListaItems([]);
            setHayMas(false);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const cargarItems = () => {
    const coleccion = obtenerColeccionActiva();
    const orderByField = vistaActiva === 'equipo' ? 'orden' : 'fechaPublicacion';
    const orderByDirection = vistaActiva === 'equipo' ? 'asc' : 'desc';
    const q = query(collection(db, coleccion), orderBy(orderByField, orderByDirection), limit(ITEMS_POR_PAGINA));
    cargarItemsBatch(q, "inicio");
  };

  const paginaSiguiente = () => {
    if (!ultimoDoc) return;
    const coleccion = obtenerColeccionActiva();
    const orderByField = vistaActiva === 'equipo' ? 'orden' : 'fechaPublicacion';
    const orderByDirection = vistaActiva === 'equipo' ? 'asc' : 'desc';
    const q = query(collection(db, coleccion), orderBy(orderByField, orderByDirection), startAfter(ultimoDoc), limit(ITEMS_POR_PAGINA));
    cargarItemsBatch(q, "sig");
  };

  const paginaAnterior = () => {
    if (!primerDoc) return;
    const coleccion = obtenerColeccionActiva();
    const orderByField = vistaActiva === 'equipo' ? 'orden' : 'fechaPublicacion';
    const orderByDirection = vistaActiva === 'equipo' ? 'asc' : 'desc';
    const q = query(collection(db, coleccion), orderBy(orderByField, orderByDirection), endBefore(primerDoc), limitToLast(ITEMS_POR_PAGINA));
    cargarItemsBatch(q, "ant");
  };

  useEffect(() => {
    if (vistaActiva !== "inicio") {
      cargarItems();
    }
  }, [vistaActiva]);

  const handleAutoResumen = async () => {
    if (!contenido || contenido.trim().length < 20) {
      setMensaje("Escribe el contenido antes de generar un resumen.");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }
    setGenerandoResumen(true);
    setMensaje("Consultando a PIDA...");
    try {
      const generarResumen = httpsCallable(functions, 'generarResumenGemini');
      const resultado = await generarResumen({ contenido });
      if (resultado.data && resultado.data.resumen) {
        setResumen(resultado.data.resumen);
        setMensaje("✨ Resumen inteligente generado por PIDA.");
      } else {
        throw new Error("Respuesta de IA no válida.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("Error al conectar con PIDA.");
    } finally {
      setGenerandoResumen(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const handleEditarItem = (item) => {
    setEditandoId(item.id);

    if (vistaActiva === 'equipo') {
      // Cargar datos para el formulario de Equipo
      setNombre(item.nombre || "");
      setCargo(item.cargo || "");
      setBio(item.bio || "");
      setDestacado(item.destacado || false);
      setOrden(item.orden || 0);
      // Usar 'fotoUrl' para la imagen del equipo
      setMainImagePreviewUrl(item.fotoUrl || null);
      setImagenPrincipalAnterior(item.fotoUrl || null);
    } else {
      // Cargar datos para Comunicaciones, Artículos y Libros
      setTitulo(item.titulo || "");
      setResumen(item.resumen || "");
      setContenido(item.contenido || "");

      if (vistaActiva === "comunicaciones") {
        setTagsSeleccionados(item.tags || []);
        setPersistente(item.persistente || false);
        setCarruselExistente(item.imagenesCarruselUrls || []);
      }

      if (item.fechaPublicacion) {
        const date = item.fechaPublicacion.toDate();
        const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setFechaPersonalizada(localISOTime);
      }

      if (vistaActiva === "libros") {
        setPrecio(item.precio || "");
        setPrecioMXN(item.precioMXN || "");
        setAutor(item.autor || "");
        setArchivoLibroAnterior(item.archivoLibroUrl || null);
        setRutaStorageAnterior(item.rutaStorage || null);
      }
      
      // Usar 'imagenPrincipalUrl' para los demás
      setImagenPrincipalAnterior(item.imagenPrincipalUrl || null);
      setMainImagePreviewUrl(item.imagenPrincipalUrl || null);
    }

    // Limpiar campos de subida de archivos para evitar re-subidas accidentales
    setImagenesCarrusel([]); 
    setArchivosAdjuntos([]);
    setImagenPrincipal(null);
    setArchivoLibro(null);
    setArchivoLibroNombre("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setTitulo("");
    setResumen("");
    setContenido("");
    setFechaPersonalizada("");

    // Limpiar campos de equipo
    setNombre("");
    setCargo("");
    setBio("");
    setDestacado(false);
    setOrden(0);
    // Limpiar nuevos campos
    setTagsSeleccionados([]);
    setPersistente(false);
    setMainImagePreviewUrl(null);
    setImagenPrincipal(null);
    setImagenPrincipalAnterior(null);
    setCarruselExistente([]);
    setImagenesCarrusel([]);
    setArchivosAdjuntos([]);
    setPrecio("");
    setPrecioMXN(""); // NUEVO
    setAutor(""); 
    setArchivoLibro(null);
    setArchivoLibroNombre("");
    setArchivoLibroAnterior(null);
    setRutaStorageAnterior(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    limpiarFormulario();
    setMensaje("Operación cancelada. Formulario en blanco.");
    setTimeout(() => setMensaje(""), 3000);
  };

  const pedirConfirmacionBorrado = (id, tituloItem) => {
    setModalBorrar({ isOpen: true, id, titulo: tituloItem });
  };

  const ejecutarBorrado = async () => {
    if (!modalBorrar.id) return;
    try {
      const coleccion = obtenerColeccionActiva();
      await deleteDoc(doc(db, coleccion, modalBorrar.id));
      cargarItems(); 
      setMensaje("¡Contenido eliminado con éxito!");
    } catch (error) {
      console.error("Error al borrar:", error);
      setMensaje("Error al eliminar el contenido.");
    } finally {
      setModalBorrar({ isOpen: false, id: null, titulo: "" });
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const handleSubirDocumento = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendoArchivo(true);
    setMensaje("Subiendo documento...");
    try {
      const carpeta = vistaActiva === "articulos" ? "articulos" : "noticias";
      const refDoc = ref(storage, `${carpeta}/documentos/${Date.now()}_${file.name}`);
      await uploadBytes(refDoc, file);
      const url = await getDownloadURL(refDoc);

      setArchivosAdjuntos(prev => [...prev, { nombre: file.name, url }]);
      setMensaje("¡Documento subido con éxito!");
    } catch (error) {
      console.error("Error al subir documento:", error);
      setMensaje("Error al subir el documento.");
    } finally {
      setSubiendoArchivo(false);
      e.target.value = ""; 
      setTimeout(() => setMensaje(""), 4000);
    }
  };

  const copiarEnlaceDocumento = (nombre, url) => {
    const snippet = `[📄 Ver anexo: ${nombre}](${url})`;
    navigator.clipboard.writeText(snippet);
    setMensaje("¡Enlace copiado! Pégalo en el contenido.");
    setTimeout(() => setMensaje(""), 4000);
  };

  const handleSeleccionPrincipal = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setMensaje("Optimizando imagen a WebP...");
        const webpFile = await convertirAWebp(file);
        setImagenPrincipal(webpFile);
        setMainImagePreviewUrl(URL.createObjectURL(webpFile));
        setMensaje(""); 
      } catch (error) {
        console.error("Error al procesar imagen:", error);
        setMensaje("Error al optimizar la imagen.");
        setTimeout(() => setMensaje(""), 3000);
      }
    }
  };

  const handleAgregarImagenes = async (e) => {
    const files = Array.from(e.target.files).sort((a, b) => a.name.localeCompare(b.name));
    
    if (files.length > 0) {
      try {
        setMensaje("Optimizando imágenes para el carrusel...");
        const webpFiles = await Promise.all(files.map(file => convertirAWebp(file)));
        setImagenesCarrusel((prev) => [...prev, ...webpFiles]);
        e.target.value = ""; 
        setMensaje("");
      } catch (error) {
        console.error("Error al procesar imágenes:", error);
        setMensaje("Error al optimizar las imágenes.");
        setTimeout(() => setMensaje(""), 3000);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // VALIDACIÓN DE LÍMITE DE NOTICIAS PERSISTENTES
    if (vistaActiva === "comunicaciones" && persistente) {
      try {
        const qPersistentes = query(collection(db, "noticias"), where("persistente", "==", true));
        const snapPersistentes = await getDocs(qPersistentes);
        
        let cantidadFijas = snapPersistentes.docs.length;
        
        // Si estamos editando una noticia que YA estaba fijada, no la sumamos como nueva
        if (editandoId && snapPersistentes.docs.some(doc => doc.id === editandoId)) {
          cantidadFijas -= 1; 
        }

        if (cantidadFijas >= 3) {
          setMensaje("Error: Ya existen 3 noticias fijadas. Debes desmarcar alguna antes de fijar esta.");
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error verificando persistencia", error);
      }
    }

    setMensaje(editandoId ? "Actualizando información..." : "Publicando contenido...");

    try {
      const carpeta = vistaActiva === "articulos" ? "articulos" : (vistaActiva === "libros" ? "libros" : (vistaActiva === 'equipo' ? 'equipo' : "noticias"));
      
      // 1. Subir Portada (convertida a WebP)
      let finalPrincipalUrl = imagenPrincipalAnterior;
      if (imagenPrincipal) {
        const refImg = ref(storage, `${carpeta}/portadas/${Date.now()}_${imagenPrincipal.name}`);
        await uploadBytes(refImg, imagenPrincipal);
        finalPrincipalUrl = await getDownloadURL(refImg);
      }

      // 2. Subir Archivo PDF del Libro (Privado y seguro, sin sistema Link)
      let finalArchivoLibroUrl = archivoLibroAnterior;
      let rutaStorageLibro = null; 

      if (vistaActiva === "libros" && archivoLibro) {
        const rutaCompleta = `${carpeta}/archivos/${Date.now()}_${archivoLibro.name}`; 
        const refLibro = ref(storage, rutaCompleta);
        await uploadBytes(refLibro, archivoLibro);
        finalArchivoLibroUrl = await getDownloadURL(refLibro);
        rutaStorageLibro = rutaCompleta; 
      }

      const nuevasUrls = [];
      if (vistaActiva === "comunicaciones") {
        for (const file of imagenesCarrusel) {
          const refCar = ref(storage, `${carpeta}/carrusel/${Date.now()}_${file.name}`);
          await uploadBytes(refCar, file);
          const url = await getDownloadURL(refCar);
          nuevasUrls.push(url);
        }
      }
      
      const coleccion = obtenerColeccionActiva();
      let datos;

      if (vistaActiva === 'equipo') {
        datos = {
          nombre,
          cargo,
          orden: Number(orden || 0),
          destacado,
          fotoUrl: finalPrincipalUrl || null,
          bio: destacado ? bio : ""
        };
      } else {
        const slugGenerado = generarSlug(titulo);
        datos = {
          titulo, 
          resumen, 
          contenido,
          slug: slugGenerado, 
          imagenPrincipalUrl: finalPrincipalUrl || null,
          fechaPublicacion: fechaPersonalizada ? Timestamp.fromDate(new Date(fechaPersonalizada)) : serverTimestamp(),
          activa: true
        };

        if (vistaActiva === "comunicaciones") {
          datos.imagenesCarruselUrls = [...carruselExistente, ...nuevasUrls];
          datos.tags = tagsSeleccionados;
          datos.persistente = persistente;
        } else if (vistaActiva === "libros") {
          datos.precio = parseFloat(precio) || 0;
          datos.precioMXN = parseFloat(precioMXN) || 0;
          datos.autor = autor; 
          datos.archivoLibroUrl = finalArchivoLibroUrl;
          
          if (rutaStorageLibro) {
            datos.rutaStorage = rutaStorageLibro;
          } else if (rutaStorageAnterior) {
            datos.rutaStorage = rutaStorageAnterior;
          }
        }
      }

      if (editandoId) {
        await updateDoc(doc(db, coleccion, editandoId), datos);
        const mensajeExito = vistaActiva === 'equipo' ? "¡Miembro del equipo actualizado!" : "¡Contenido actualizado con éxito!";
        setMensaje(mensajeExito);
      } else {
        await addDoc(collection(db, coleccion), datos);
        const mensajeExito = vistaActiva === 'equipo' ? "¡Miembro del equipo agregado!" : "¡Contenido publicado con éxito!";
        setMensaje(mensajeExito);
      }

      limpiarFormulario();
      cargarItems(); 
    } catch (err) {
      console.error(err);
      setMensaje("Error en el proceso.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 font-sans relative overflow-hidden">
      
      <ConfirmDialog 
        open={modalBorrar.isOpen}
        title="¿Eliminar publicación?"
        content={`Estás a punto de borrar permanentemente: "${modalBorrar.titulo}". Esta acción no se puede deshacer.`}
        onCancel={() => setModalBorrar({ isOpen: false, id: null, titulo: "" })}
        onConfirm={ejecutarBorrado}
      />

      <div className="fixed inset-0 z-0 bg-watermark opacity-5 pointer-events-none" aria-hidden="true"></div>

      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 p-4 shadow-sm border-b border-gray-100 flex justify-between items-center px-6 md:px-10">
        <div className="flex items-center gap-4">
          <img src={logoColor} alt="Logo de IIRESODH" className="h-10 md:h-12 w-auto object-contain" />
          <span className="hidden md:inline-block border-l-2 border-gray-200 pl-4 text-gray-500 font-medium tracking-tight">Panel de Control</span>
        </div>
        <button onClick={handleLogout} className="text-sm md:text-base bg-white border border-gray-200 text-gray-700 hover:text-main-red hover:border-main-red hover:bg-red-50 px-5 py-2.5 rounded-full font-semibold shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Salir
        </button>
      </header>

      <div className="p-6 md:p-10 max-w-7xl mx-auto relative z-10">
        {vistaActiva === "inicio" && (
          <section className="animate-fade-in-up" aria-labelledby="admin-title">
            <div className="mb-10 text-center md:text-left">
              <h1 id="admin-title" className="text-3xl md:text-4xl font-bold text-main-blue tracking-tight mb-2">Bienvenido al Panel</h1>
              <p className="text-gray-500 text-lg">Selecciona el módulo que deseas administrar hoy.</p>
            </div>
            <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" aria-label="Departamentos administrativos">
              <button onClick={() => setVistaActiva("comunicaciones")} className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-main-blue/30 transition-all duration-300 flex flex-col items-center justify-center gap-5 group cursor-pointer text-center">
                <div className="p-4 bg-blue-50 text-main-blue rounded-2xl group-hover:bg-main-blue group-hover:text-white transition-colors duration-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 8h8M8 12h8M8 16h4"></path></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Comunicaciones</h2>
                  <p className="text-sm text-gray-500">Gestión de noticias y comunicados</p>
                </div>
              </button>
              
              <button onClick={() => setVistaActiva("articulos")} className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-main-red/30 transition-all duration-300 flex flex-col items-center justify-center gap-5 group cursor-pointer text-center">
                <div className="p-4 bg-red-50 text-main-red rounded-2xl group-hover:bg-main-red group-hover:text-white transition-colors duration-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Artículos Académicos</h2>
                  <p className="text-sm text-gray-500">Publicación de investigaciones</p>
                </div>
              </button>

              <button onClick={() => setVistaActiva("libros")} className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-green-500/30 transition-all duration-300 flex flex-col items-center justify-center gap-5 group cursor-pointer text-center">
                <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Tienda Editorial</h2>
                  <p className="text-sm text-gray-500">Venta de libros y manuales (PDF)</p>
                </div>
              </button>

              <button onClick={() => setVistaActiva("equipo")} className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-purple-500/30 transition-all duration-300 flex flex-col items-center justify-center gap-5 group cursor-pointer text-center">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Equipo de Trabajo</h2>
                  <p className="text-sm text-gray-500">Gestión de miembros y cargos</p>
                </div>
              </button>

              <button onClick={() => setVistaActiva("adminWeb")} className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-yellow-500/30 transition-all duration-300 flex flex-col items-center justify-center gap-5 group cursor-pointer text-center">
                <div className="p-4 bg-yellow-50 text-yellow-600 rounded-2xl group-hover:bg-yellow-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Administración Web</h2>
                  <p className="text-sm text-gray-500">Auditoría y configuraciones</p>
                </div>
              </button>
            </nav>
          </section>
        )}

        {(vistaActiva !== "inicio" && vistaActiva !== "adminWeb") && (
          <div className="animate-fade-in-up">
            <button onClick={() => { limpiarFormulario(); setVistaActiva("inicio"); }} className="mb-8 flex items-center gap-2 text-gray-500 font-medium hover:text-main-blue transition-colors cursor-pointer group">
              <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:shadow border border-gray-100 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </div>
              Regresar al menú
            </button>

            <ToastAlert 
              open={!!mensaje} 
              message={mensaje} 
              isError={mensaje.includes("Error")} 
              onClose={() => setMensaje("")} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <section className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100" aria-labelledby="form-title">
                  <header className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 id="form-title" className={`text-2xl md:text-3xl font-bold tracking-tight ${editandoId ? 'text-main-red' : 'text-gray-800'}`}>
                        {editandoId ? 
                          (vistaActiva === 'equipo' ? "Editando Miembro" : "Editando Publicación") : 
                          (vistaActiva === "libros" ? "Registrar Nuevo Libro" : (vistaActiva === 'equipo' ? "Agregar Miembro" : "Crear Nueva Publicación"))
                        }
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Módulo: {
                          vistaActiva === "comunicaciones" ? "Noticias institucionales" :
                          vistaActiva === "articulos" ? "Artículos de investigación" :
                          vistaActiva === "libros" ? "Tienda Editorial" :
                          "Equipo de Trabajo"
                        }
                      </p>
                    </div>
                    {editandoId && <span className="bg-red-50 text-main-red text-xs font-bold px-3 py-1 rounded-full border border-red-100">MODO EDICIÓN</span>}
                  </header>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* FORMULARIO PARA EQUIPO */}
                    {vistaActiva === 'equipo' && (<>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AdminTextField label="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        <AdminTextField label="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} required />
                      </div>
                      <AdminTextField label="Orden (número para ordenar)" type="number" value={orden} onChange={(e) => setOrden(e.target.value)} required />
                      <FormControlLabel control={<Checkbox checked={destacado} onChange={(e) => setDestacado(e.target.checked)} />} label="Miembro Destacado (Presidente)" />
                      {destacado && (
                        <AdminTextField label="Biografía (solo para miembro destacado)" multiline rows={8} value={bio} onChange={(e) => setBio(e.target.value)} />
                      )}
                    </>)}

                    {/* FORMULARIO PARA NOTICIAS, ARTÍCULOS Y LIBROS */}
                    {vistaActiva !== 'equipo' && (<>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className={vistaActiva === "libros" ? "md:col-span-1" : "md:col-span-2"}>
                        <AdminTextField 
                          label={vistaActiva === "articulos" ? "Título del Artículo" : (vistaActiva === "libros" ? "Título del Libro" : "Título de la Noticia")}
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          required
                          multiline={vistaActiva === 'comunicaciones'}
                          rows={2}
                          placeholder="Ej: Nueva alianza internacional..."
                        />
                      </div>

                      {vistaActiva === "libros" && (
                        <div className="md:col-span-1">
                          <AdminTextField 
                            label="Precio (USD)"
                            type="number"
                            step="0.01"
                            required
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                            placeholder="Ej: 25.00"
                          />
                        </div>
                      )}

                      <div className="md:col-span-1">
                        <AdminTextField 
                          label="Fecha (Opcional)"
                          type="datetime-local"
                          value={fechaPersonalizada}
                          onChange={(e) => setFechaPersonalizada(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </div>
                    </div>

                    {/* NUEVA FILA DE CAMPOS PARA LIBROS (AUTOR Y PRECIO MXN) */}
                    {vistaActiva === "libros" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <AdminTextField 
                            label="Autor del Libro"
                            value={autor}
                            onChange={(e) => setAutor(e.target.value)}
                            required
                            placeholder="Ej: Fabián Salvioli"
                          />
                        </div>
                        <div>
                          <AdminTextField 
                            label="Precio (MXN para México)"
                            type="number"
                            step="0.01"
                            required
                            value={precioMXN}
                            onChange={(e) => setPrecioMXN(e.target.value)}
                            placeholder="Ej: 500.00"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-end mb-1.5">
                        <div className="w-full flex justify-end">
                          <button type="button" onClick={handleAutoResumen} disabled={generandoResumen} className="text-xs font-semibold text-main-blue hover:text-light-blue bg-blue-50 hover:bg-blue-100 py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50 mb-2">
                            {generandoResumen ? "Generando..." : "✨ Auto-completar con PIDA"}
                          </button>
                        </div>
                      </div>
                      <AdminTextField 
                        label="Resumen corto"
                        required
                        multiline
                        rows={2}
                        value={resumen}
                        onChange={(e) => setResumen(e.target.value)}
                        placeholder="Un párrafo breve para atraer al lector..."
                        inputProps={{ maxLength: 250 }}
                      />
                    </div>

                    {vistaActiva === "comunicaciones" && (
                      <div className="bg-gray-50/80 p-5 rounded-xl border border-dashed border-gray-300">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                          <div>
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg> Adjuntar Documentos (Para enlazar)
                            </h3>
                            <p className="text-xs text-gray-500">Sube un archivo para copiar su enlace público.</p>
                          </div>
                          <label htmlFor="input-doc-adjunto" className={`text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold shadow-sm cursor-pointer transition-colors whitespace-nowrap ${subiendoArchivo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {subiendoArchivo ? "Subiendo..." : "+ Subir archivo"}
                          </label>
                          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleSubirDocumento} className="sr-only" id="input-doc-adjunto" />
                        </div>

                        {archivosAdjuntos.length > 0 && (
                          <ul className="space-y-2" aria-label="Documentos adjuntados">
                            {archivosAdjuntos.map((archivo, index) => (
                              <li key={index} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                                <span className="text-xs font-medium text-gray-600 truncate mr-3 flex items-center gap-2">
                                  <svg className="w-3.5 h-3.5 text-main-red" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg> {archivo.nombre}
                                </span>
                                <button type="button" onClick={() => copiarEnlaceDocumento(archivo.nombre, archivo.url)} className="text-[10px] uppercase tracking-wider bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1 px-2.5 rounded transition-colors shrink-0">Copiar Enlace</button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {vistaActiva === "libros" && (
                      <div className="bg-blue-50/50 p-5 rounded-xl border border-dashed border-blue-200">
                        <label className="block text-sm font-semibold text-main-blue mb-2">Archivo del Libro (PDF) *</label>
                        <p className="text-xs text-gray-500 mb-4">Este es el archivo real que se enviará automáticamente al comprador. No se generarán links públicos.</p>
                        
                        <input 
                          type="file" 
                          accept=".pdf" 
                          id="input-libro-pdf"
                          className="sr-only"
                          required={!editandoId && !archivoLibroAnterior}
                          onChange={(e) => {
                            if(e.target.files[0]) {
                              setArchivoLibro(e.target.files[0]);
                              setArchivoLibroNombre(e.target.files[0].name);
                            }
                          }}
                        />
                        <div className="flex items-center gap-3">
                          <label htmlFor="input-libro-pdf" className="inline-block bg-white border border-gray-300 text-main-blue px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                            Seleccionar PDF...
                          </label>
                          {(archivoLibroNombre || archivoLibroAnterior) && (
                            <span className="text-xs text-gray-600 font-medium truncate max-w-50 md:max-w-xs bg-white px-3 py-2 rounded-md border border-gray-200">
                              {archivoLibroNombre || "Archivo guardado (puedes reemplazarlo)"}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <AdminTextField 
                        label={vistaActiva === "libros" ? "Descripción Larga" : "Cuerpo del texto"}
                        required
                        multiline
                        rows={12}
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        placeholder={vistaActiva === "libros" ? "Índice o descripción del libro..." : "Escribe o pega el desarrollo de la publicación aquí..."}
                      />
                    </div></>
                    )}

                    {vistaActiva === 'comunicaciones' && (
                      <div className="mt-8">
                        <p className="flex text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 items-center gap-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> 
                          Simulación en Portada (Carrusel Home)
                        </p>
                        <div className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <article className="group relative w-full aspect-2/1 overflow-hidden bg-main-blue cursor-default">
                                <div
                                    className="absolute inset-0 w-full h-full bg-cover bg-top bg-no-repeat transition-transform duration-4000 group-hover:scale-105 bg-gray-200"
                                    style={{ backgroundImage: `url(${mainImagePreviewUrl || 'https://via.placeholder.com/800x600.png?text=Sin+Portada'})` }}
                                    role="img"
                                    aria-label={titulo || "Vista previa de la noticia"}
                                />

                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-1000"></div>
                                <div className="absolute bottom-6 left-6 right-auto w-[65%] h-[70%] p-6 bg-white/30 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/30 z-10 flex flex-col justify-end transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-main-blue/20">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {tagsSeleccionados.map(tag => (
                                            <span key={tag} className="bg-white/40 border border-white/50 text-main-blue text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">{tag}</span>
                                        ))}
                                    </div>
                                    <h3 className="text-3xl font-black text-main-blue mb-3 leading-[1.15] tracking-tight line-clamp-3 group-hover:text-main-red transition-colors" style={{ whiteSpace: 'pre-wrap' }}>
                                        {titulo || "Título de la noticia..."}
                                    </h3>
                                    <p className="text-gray-800 line-clamp-3 text-base font-medium leading-relaxed drop-shadow-sm mb-6">
                                        {resumen || "Resumen corto de la noticia..."}
                                    </p>
                                    <div className="text-main-red font-black flex items-center gap-2 uppercase text-xs tracking-[0.2em] group-hover:gap-4 transition-all">Leer artículo <span aria-hidden="true" className="text-lg leading-none">&rarr;</span></div>
                                </div>
                            </article>
                        </div>
                    </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-sm font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Archivos Multimedia</h3>
                      
                      <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3" id="portada-label">
                          {vistaActiva === "libros" ? "Portada del Libro" : "Portada principal"}
                        </label>
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          {mainImagePreviewUrl ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="relative group inline-block">
                                <img src={mainImagePreviewUrl} alt="Vista previa" className="h-28 w-40 object-cover rounded-lg shadow-sm border border-gray-100 block mx-auto" />
                                <button type="button" onClick={() => { setImagenPrincipal(null); setMainImagePreviewUrl(imagenPrincipalAnterior); }} className="absolute -top-2 -right-2 bg-white text-gray-700 rounded-full p-1 shadow hover:bg-red-50 hover:text-main-red opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                              </div>
                              <span className="text-xs text-gray-500 font-medium truncate max-w-40 text-center" title={imagenPrincipal ? imagenPrincipal.name : extraerNombreDesdeUrl(mainImagePreviewUrl)}>
                                {imagenPrincipal ? imagenPrincipal.name : extraerNombreDesdeUrl(mainImagePreviewUrl)}
                              </span>
                            </div>
                          ) : (
                            <div className="h-28 w-40 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                          )}
                          <div className="flex-1">
                            <input type="file" accept="image/*" required={!editandoId && !imagenPrincipalAnterior} onChange={handleSeleccionPrincipal} className="sr-only" id="input-portada-principal" aria-labelledby="portada-label" />
                            <label htmlFor="input-portada-principal" className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium cursor-pointer inline-block hover:bg-gray-50 transition-colors shadow-sm">Examinar archivos...</label>
                            <p className="text-xs text-gray-400 mt-2">Formatos recomendados: JPG, PNG. Se optimizará a WebP.</p>
                          </div>
                        </div>
                      </div>

                      {vistaActiva === "comunicaciones" && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Galería / Carrusel</label>
                          <input type="file" accept="image/*" multiple onChange={handleAgregarImagenes} className="sr-only" id="input-imagenes-carrusel" />
                          <label htmlFor="input-imagenes-carrusel" className="text-sm bg-white border border-dashed border-gray-300 text-main-blue w-full text-center py-4 rounded-lg font-medium cursor-pointer block hover:bg-blue-50 transition-colors mb-4">+ Cargar múltiples imágenes</label>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {carruselExistente.map((url, i) => (
                              <div 
                                key={`old-${i}`} 
                                className="flex flex-col bg-white p-2 rounded-lg border border-gray-100 shadow-sm gap-2"
                                draggable
                                onDragStart={(e) => { e.dataTransfer.setData('type', 'old'); e.dataTransfer.setData('index', i); }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (e.dataTransfer.getData('type') !== 'old') return;
                                  const from = parseInt(e.dataTransfer.getData('index'));
                                  if (from === i || isNaN(from)) return;
                                  const nuevas = [...carruselExistente];
                                  const [movida] = nuevas.splice(from, 1);
                                  nuevas.splice(i, 0, movida);
                                  setCarruselExistente(nuevas);
                                }}
                              >
                                <div className="relative group w-full h-24 rounded overflow-hidden cursor-move">
                                  <img src={url} className="w-full h-full object-cover" alt="Carrusel" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button type="button" onClick={() => setCarruselExistente(prev => prev.filter((_, idx) => idx !== i))} className="text-white hover:text-main-red"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                  </div>
                                </div>
                                <span className="text-[10px] font-medium text-gray-500 truncate text-center" title={extraerNombreDesdeUrl(url)}>{extraerNombreDesdeUrl(url)}</span>
                              </div>
                            ))}

                            {imagenesCarrusel.map((f, i) => (
                              <div 
                                key={`new-${i}`} 
                                className="flex flex-col bg-green-50 p-2 rounded-lg border border-green-200 shadow-sm gap-2"
                                draggable
                                onDragStart={(e) => { e.dataTransfer.setData('type', 'new'); e.dataTransfer.setData('index', i); }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (e.dataTransfer.getData('type') !== 'new') return;
                                  const from = parseInt(e.dataTransfer.getData('index'));
                                  if (from === i || isNaN(from)) return;
                                  const nuevas = [...imagenesCarrusel];
                                  const [movida] = nuevas.splice(from, 1);
                                  nuevas.splice(i, 0, movida);
                                  setImagenesCarrusel(nuevas);
                                }}
                              >
                                <div className="relative group w-full h-24 rounded overflow-hidden cursor-move">
                                  <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="Nueva carrusel" />
                                  <span className="absolute top-1 left-1 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Nueva</span>
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button type="button" onClick={() => setImagenesCarrusel(prev => prev.filter((_, idx) => idx !== i))} className="text-white hover:text-main-red"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                  </div>
                                </div>
                                <span className="text-[10px] font-medium text-green-700 truncate text-center" title={f.name}>{f.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* NUEVO BLOQUE: TAGS Y PERSISTENCIA */}
                    {vistaActiva === "comunicaciones" && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Clasificación y Visibilidad</h3>
                        
                        {/* Selector de Tags con MUI Chips */}
                        <div className="mb-6">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Etiquetas (Tags)</label>
                          <div className="flex flex-wrap gap-2">
                            {TAGS_DISPONIBLES.map(tag => {
                              const isSelected = tagsSeleccionados.includes(tag);
                              return (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  onClick={() => {
                                    setTagsSeleccionados(prev => 
                                      isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                                    );
                                  }}
                                  color={isSelected ? "primary" : "default"}
                                  variant={isSelected ? "filled" : "outlined"}
                                  sx={{ 
                                    fontWeight: 'bold', 
                                    borderRadius: '8px', // Le da un toque menos redondo y más moderno
                                    transition: 'all 0.2s ease',
                                    '&:hover': { 
                                      transform: 'scale(1.03)',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Checkbox de Persistencia */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={persistente}
                                onChange={(e) => setPersistente(e.target.checked)}
                                color="secondary" // Usa el color rojo definido en el ThemeProvider
                                sx={{
                                  '&.Mui-checked': {
                                    color: 'secondary.main', // Asegura el rojo institucional al estar marcado
                                  },
                                }}
                              />
                            }
                            label={
                              <Box>
                                <span className="text-sm font-bold text-gray-700 block">
                                  Fijar noticia en el Carrusel de Inicio (Máximo 3)
                                </span>
                                <span className="text-xs text-gray-400 font-normal">
                                  Las noticias fijadas siempre aparecerán de primeras en la portada.
                                </span>
                              </Box>
                            }
                            sx={{ 
                              m: 0, 
                              alignItems: 'flex-start',
                              '& .MuiFormControlLabel-label': { mt: 0.5 } 
                            }}
                          />
                        </div>
                      </div>
                    )}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                      <button type="button" onClick={handleCancel} className="w-full sm:w-1/3 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 font-semibold py-3.5 rounded-xl transition-colors cursor-pointer border border-transparent">Cancelar</button>
                      <button type="submit" disabled={loading} className={`w-full sm:w-2/3 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 cursor-pointer ${editandoId ? 'bg-main-red hover:bg-red-700' : 'bg-main-blue hover:bg-light-blue hover:shadow-md'} ${loading ? 'opacity-70 cursor-wait' : ''}`}>
                        {loading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {loading ? "Procesando..." : (editandoId ? "Actualizar Cambios" : "Publicar Ahora")}
                      </button>
                    </div>

                  </form>
                </section>
              </div>

              <div className="lg:col-span-4">
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-24">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg> Publicaciones Recientes
                  </h2>
                  <div className="space-y-3 max-h-150 overflow-y-auto custom-scrollbar pr-1">
                    {listaItems.length === 0 ? (
                      <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-500 font-medium">Bandeja vacía</p>
                      </div>
                    ) : (
                      listaItems.map((n) => (
                        <article key={n.id} className={`group flex flex-col p-4 rounded-xl border transition-all duration-200 cursor-default ${editandoId === n.id ? 'bg-red-50 border-main-red shadow-sm' : n.persistente ? 'bg-blue-50/30 border-main-blue/40 shadow-sm' : 'bg-white border-gray-100 hover:border-main-blue/30 hover:shadow-sm'}`}>
                          <div className="flex gap-3 items-start mb-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                              {(n.imagenPrincipalUrl || n.fotoUrl) ? <img src={n.imagenPrincipalUrl || n.fotoUrl} className="w-full h-full object-cover" alt="Miniatura" /> : <span className="text-[10px] font-bold text-gray-400">TXT</span>}
                              
                              {/* Nuevo: Ícono de pin para las persistentes */}
                              {n.persistente && (
                                <div className="absolute inset-0 bg-main-blue/20 flex items-center justify-center">
                                  <svg className="w-5 h-5 text-main-blue drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v4l2 2v2h-7v5l-1 1-1-1v-5H4v-2l2-2V4z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  {n.persistente && (
                                    <span className="text-[9px] font-black text-main-blue uppercase tracking-tighter bg-white px-1.5 py-0.5 rounded border border-main-blue/30 mt-0.5">
                                      Fijada
                                    </span>
                                  )}
                                  <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug" title={n.titulo || n.nombre}>{n.titulo || n.nombre}</h3>
                                </div>
                                <p className="text-[10px] text-gray-400 truncate">
                                  {vistaActiva === 'equipo' ? `Orden: ${n.orden} - ${n.cargo}` : `/${obtenerColeccionActiva()}/${n.slug || n.id}`}
                                </p>
                                
                                {/* Nuevo: Muestra de Tags si existen */}
                                {n.tags && n.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {n.tags.map(t => (
                                      <span key={t} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-sm uppercase font-bold">
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full">
                            <button onClick={() => handleEditarItem(n)} className="flex-1 bg-white border border-gray-200 text-gray-600 hover:text-main-blue hover:border-main-blue hover:bg-blue-50 py-1.5 rounded-lg text-xs font-semibold transition-colors">Editar</button>
                            <button onClick={() => pedirConfirmacionBorrado(n.id, n.titulo || n.nombre)} className="px-3 bg-white border border-gray-200 text-gray-400 hover:text-main-red hover:border-main-red hover:bg-red-50 py-1.5 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </div>

            </div>
          </div>
        )}

        {vistaActiva === "adminWeb" && (
          <div className="animate-fade-in-up">
            <button onClick={() => setVistaActiva("inicio")} className="mb-8 flex items-center gap-2 text-gray-500 font-medium hover:text-main-blue transition-colors cursor-pointer group">
              <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:shadow border border-gray-100 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </div>
              Regresar al menú
            </button>

            <section className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
              <header className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">
                  Auditoría de Actividad de Usuarios
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Revisa las últimas 100 acciones realizadas en el panel de control.
                </p>
              </header>

              <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-xl border">
                <FormControl size="small" fullWidth>
                  <InputLabel id="filtro-usuario-label">Usuario</InputLabel>
                  <Select
                    labelId="filtro-usuario-label"
                    value={filtroUsuario}
                    label="Usuario"
                    onChange={(e) => setFiltroUsuario(e.target.value)}
                  >
                    <MenuItem value="todos"><em>Todos los usuarios</em></MenuItem>
                    {usuariosUnicos.map(email => (
                      <MenuItem key={email} value={email}>{email}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel id="orden-actividad-label">Orden</InputLabel>
                  <Select
                    labelId="orden-actividad-label"
                    value={ordenActividad}
                    label="Orden"
                    onChange={(e) => setOrdenActividad(e.target.value)}
                  >
                    <MenuItem value="desc">Más recientes primero</MenuItem>
                    <MenuItem value="asc">Más antiguos primero</MenuItem>
                  </Select>
                </FormControl>

                <Button onClick={cargarActividades} variant="contained" disabled={cargandoActividades} sx={{ py: 1.5, px: 4, whiteSpace: 'nowrap' }}>
                  {cargandoActividades ? 'Cargando...' : 'Actividades'}
                </Button>
              </div>

              <div className="space-y-3">
                {cargandoActividades ? <div className="text-center py-10"><CircularProgress /></div> : actividades.length > 0 ? actividades.map(act => (<div key={act.id} className="p-4 rounded-lg bg-gray-50/70 border border-gray-100 flex justify-between items-center"><div><p className="font-bold text-main-blue">{act.accion}</p><p className="text-sm text-gray-600">{act.usuarioEmail}</p></div><p className="text-xs text-gray-400 font-medium">{act.timestamp?.toDate().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>)) : <p className="text-center text-gray-500 py-10">No hay actividades para mostrar. Presiona "Actividades" para empezar.</p>}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}