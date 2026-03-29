import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { signOut } from "firebase/auth";
import { auth, db, storage, functions } from "../firebase/config";
import { collection, addDoc, updateDoc, serverTimestamp, doc, deleteDoc, getDocs, query, orderBy, Timestamp, limit, startAfter, endBefore, limitToLast } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";

import logoColor from "../assets/Logo_Oficiale_200w-trim.png";

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

export default function AdminPanel() {
  const navigate = useNavigate(); 
  
  const [vistaActiva, setVistaActiva] = useState("inicio");

  const [titulo, setTitulo] = useState("");
  const [resumen, setResumen] = useState("");
  const [contenido, setContenido] = useState("");
  const [fechaPersonalizada, setFechaPersonalizada] = useState(""); 
  
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

  const [modalBorrar, setModalBorrar] = useState({ isOpen: false, id: null, titulo: "" });

  const [primerDoc, setPrimerDoc] = useState(null);
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [hayMas, setHayMas] = useState(true);
  const ITEMS_POR_PAGINA = 10;

  const contenidoPreviewRef = useRef(null);
  const [showReadMoreWarning, setShowReadMoreWarning] = useState(false);

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

  const obtenerColeccionActiva = () => {
    if (vistaActiva === "articulos") return "articulos_academicos";
    if (vistaActiva === "libros") return "libros";
    return "noticias";
  };

  const cargarItemsBatch = async (consulta, direccion) => {
    try {
      const querySnapshot = await getDocs(consulta);
      if (!querySnapshot.empty) {
        setPrimerDoc(querySnapshot.docs[0]);
        setUltimoDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const q = query(collection(db, coleccion), orderBy("fechaPublicacion", "desc"), limit(ITEMS_POR_PAGINA));
    cargarItemsBatch(q, "inicio");
  };

  const paginaSiguiente = () => {
    if (!ultimoDoc) return;
    const coleccion = obtenerColeccionActiva();
    const q = query(collection(db, coleccion), orderBy("fechaPublicacion", "desc"), startAfter(ultimoDoc), limit(ITEMS_POR_PAGINA));
    cargarItemsBatch(q, "sig");
  };

  const paginaAnterior = () => {
    if (!primerDoc) return;
    const coleccion = obtenerColeccionActiva();
    const q = query(collection(db, coleccion), orderBy("fechaPublicacion", "desc"), endBefore(primerDoc), limitToLast(ITEMS_POR_PAGINA));
    cargarItemsBatch(q, "ant");
  };

  useEffect(() => {
    if (vistaActiva !== "inicio") {
      cargarItems();
    }
  }, [vistaActiva]);

  useEffect(() => {
    return () => {
      if (mainImagePreviewUrl && mainImagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(mainImagePreviewUrl);
      }
    };
  }, [mainImagePreviewUrl]);

  useEffect(() => {
    const checkOverflow = () => {
      if (contenidoPreviewRef.current) {
        const { scrollHeight, clientHeight } = contenidoPreviewRef.current;
        setShowReadMoreWarning(scrollHeight > clientHeight + 2);
      }
    };
    checkOverflow();
  }, [contenido, vistaActiva]);

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
    setTitulo(item.titulo);
    setResumen(item.resumen || "");
    setContenido(item.contenido || "");

    if (item.fechaPublicacion) {
      const date = item.fechaPublicacion.toDate();
      const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setFechaPersonalizada(localISOTime);
    }

    if (vistaActiva === "libros") {
      setPrecio(item.precio || "");
      setPrecioMXN(item.precioMXN || ""); // NUEVO
      setAutor(item.autor || ""); 
      setArchivoLibroAnterior(item.archivoLibroUrl || null);
      setRutaStorageAnterior(item.rutaStorage || null);
    }

    setImagenPrincipalAnterior(item.imagenPrincipalUrl || null);
    setMainImagePreviewUrl(item.imagenPrincipalUrl || null); 
    setCarruselExistente(item.imagenesCarruselUrls || []);
    setImagenesCarrusel([]); 
    setArchivosAdjuntos([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setTitulo("");
    setResumen("");
    setContenido("");
    setFechaPersonalizada("");
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
    setMensaje("Operación cancelada. Formulario en blanco.");
    setTimeout(() => setMensaje(""), 3000);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    setMensaje(editandoId ? "Actualizando información..." : "Publicando contenido...");

    try {
      const carpeta = vistaActiva === "articulos" ? "articulos" : (vistaActiva === "libros" ? "libros" : "noticias");
      
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
      
      const slugGenerado = generarSlug(titulo);
      const coleccion = obtenerColeccionActiva();

      const datos = {
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
      } else if (vistaActiva === "libros") {
        datos.precio = parseFloat(precio) || 0;
        datos.precioMXN = parseFloat(precioMXN) || 0; // NUEVO
        datos.autor = autor; 
        datos.archivoLibroUrl = finalArchivoLibroUrl;
        
        if (rutaStorageLibro) {
          datos.rutaStorage = rutaStorageLibro;
        } else if (rutaStorageAnterior) {
          datos.rutaStorage = rutaStorageAnterior;
        }
      }

      if (editandoId) {
        await updateDoc(doc(db, coleccion, editandoId), datos);
        setMensaje("¡Contenido actualizado con éxito!");
      } else {
        await addDoc(collection(db, coleccion), datos);
        setMensaje("¡Contenido publicado con éxito!");
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

  const inputEstilos = "w-full border border-gray-200 bg-gray-50 p-3.5 text-base rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue transition-all duration-200";

  return (
    <main className="min-h-screen bg-gray-50/50 font-sans relative overflow-hidden">
      
      {modalBorrar.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-main-red"></div>
            <div className="w-16 h-16 bg-red-50 text-main-red rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar publicación?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">
              Estás a punto de borrar permanentemente:<br/>
              <strong className="text-gray-800 font-bold block mt-2 text-base line-clamp-2">"{modalBorrar.titulo}"</strong>
              <span className="block mt-4 text-xs font-semibold text-main-red uppercase tracking-wider">Esta acción no se puede deshacer</span>
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setModalBorrar({ isOpen: false, id: null, titulo: "" })} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors cursor-pointer">Cancelar</button>
              <button onClick={ejecutarBorrado} className="flex-1 bg-main-red hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm cursor-pointer">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

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
            <nav className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8" aria-label="Departamentos administrativos">
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
            </nav>
          </section>
        )}

        {(vistaActiva === "comunicaciones" || vistaActiva === "articulos" || vistaActiva === "libros") && (
          <div className="animate-fade-in-up">
            <button onClick={() => { limpiarFormulario(); setVistaActiva("inicio"); }} className="mb-8 flex items-center gap-2 text-gray-500 font-medium hover:text-main-blue transition-colors cursor-pointer group">
              <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:shadow border border-gray-100 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </div>
              Regresar al menú
            </button>

            {mensaje && (
              <div className={`fixed top-24 right-6 z-40 p-4 rounded-xl shadow-lg font-medium flex items-center gap-3 animate-fade-in-up border max-w-sm ${mensaje.includes("Error") ? "bg-white border-red-200 text-main-red" : "bg-white border-green-200 text-green-700"}`}>
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  {mensaje.includes("Error") 
                    ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  }
                </svg>
                <span className="text-sm">{mensaje}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <section className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100" aria-labelledby="form-title">
                  <header className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 id="form-title" className={`text-2xl md:text-3xl font-bold tracking-tight ${editandoId ? 'text-main-red' : 'text-gray-800'}`}>
                        {editandoId ? "Editando Publicación" : (vistaActiva === "libros" ? "Registrar Nuevo Libro" : "Crear Nueva Publicación")}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Módulo: {vistaActiva === "comunicaciones" ? "Noticias institucionales" : (vistaActiva === "articulos" ? "Artículos de investigación" : "Tienda Editorial")}</p>
                    </div>
                    {editandoId && <span className="bg-red-50 text-main-red text-xs font-bold px-3 py-1 rounded-full border border-red-100">MODO EDICIÓN</span>}
                  </header>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className={vistaActiva === "libros" ? "md:col-span-1" : "md:col-span-2"}>
                        <label htmlFor="input-titulo" className="block text-sm font-semibold text-gray-700 mb-1.5">{vistaActiva === "articulos" ? "Título del Artículo" : (vistaActiva === "libros" ? "Título del Libro" : "Título de la Noticia")} *</label>
                        <input id="input-titulo" type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputEstilos} placeholder="Ej: Nueva alianza internacional..." />
                      </div>

                      {vistaActiva === "libros" && (
                        <div className="md:col-span-1">
                          <label htmlFor="input-precio" className="block text-sm font-semibold text-gray-700 mb-1.5">Precio (USD) *</label>
                          <input id="input-precio" type="number" step="0.01" required value={precio} onChange={(e) => setPrecio(e.target.value)} className={inputEstilos} placeholder="Ej: 25.00" />
                        </div>
                      )}

                      <div className="md:col-span-1">
                        <label htmlFor="input-fecha" className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha (Opcional)</label>
                        <input id="input-fecha" type="datetime-local" value={fechaPersonalizada} onChange={(e) => setFechaPersonalizada(e.target.value)} className={`${inputEstilos} text-sm`} />
                      </div>
                    </div>

                    {/* NUEVA FILA DE CAMPOS PARA LIBROS (AUTOR Y PRECIO MXN) */}
                    {vistaActiva === "libros" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="input-autor" className="block text-sm font-semibold text-gray-700 mb-1.5">Autor del Libro *</label>
                          <input id="input-autor" type="text" required value={autor} onChange={(e) => setAutor(e.target.value)} className={inputEstilos} placeholder="Ej: Fabián Salvioli" />
                        </div>
                        <div>
                          <label htmlFor="input-preciomxn" className="block text-sm font-semibold text-gray-700 mb-1.5">Precio (MXN para México) *</label>
                          <input id="input-preciomxn" type="number" step="0.01" required value={precioMXN} onChange={(e) => setPrecioMXN(e.target.value)} className={inputEstilos} placeholder="Ej: 500.00" />
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-end mb-1.5">
                        <label htmlFor="input-resumen" className="block text-sm font-semibold text-gray-700">Resumen corto *</label>
                        <button type="button" onClick={handleAutoResumen} disabled={generandoResumen} className="text-xs font-semibold text-main-blue hover:text-light-blue bg-blue-50 hover:bg-blue-100 py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50">
                          {generandoResumen ? "Generando..." : "✨ Auto-completar con IA"}
                        </button>
                      </div>
                      <textarea id="input-resumen" required maxLength="250" value={resumen} onChange={(e) => setResumen(e.target.value)} className={inputEstilos} rows="2" placeholder="Un párrafo breve para atraer al lector..." />
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
                          <label htmlFor="input-doc" className={`text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold shadow-sm cursor-pointer transition-colors whitespace-nowrap ${subiendoArchivo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {subiendoArchivo ? "Subiendo..." : "+ Subir archivo"}
                          </label>
                          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleSubirDocumento} className="sr-only" id="input-doc" />
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
                      <label htmlFor="input-contenido" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        {vistaActiva === "libros" ? "Descripción Larga" : "Cuerpo del texto"} *
                      </label>
                      <textarea id="input-contenido" required value={contenido} onChange={(e) => setContenido(e.target.value)} className={inputEstilos} rows="12" placeholder={vistaActiva === "libros" ? "Índice o descripción del libro..." : "Escribe o pega el desarrollo de la publicación aquí..."} />
                    </div>

                    {vistaActiva === "comunicaciones" && contenido.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-inner">
                        <p className="flex text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 items-center gap-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> Simulación en Portada (Espacio Visible)
                        </p>
                        <div ref={contenidoPreviewRef} className="text-gray-600 text-sm md:text-base font-light leading-relaxed noticia-content max-h-80 overflow-hidden bg-white p-5 rounded-lg border border-gray-100" dangerouslySetInnerHTML={{ __html: formatearTextoConLinksYHashtags(contenido) }} />
                        <div className="mt-3" role="status">
                          {showReadMoreWarning 
                            ? <p className="text-main-red font-bold text-sm">⚠️ El texto superó el límite visible de la tarjeta. Verán "Leer más".</p> 
                            : <p className="text-green-600 font-bold text-sm">✓ El texto cabe perfectamente en la tarjeta inicial.</p>
                          }
                        </div>
                      </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-sm font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Archivos Multimedia</h3>
                      
                      <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
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
                            <input type="file" accept="image/*" required={!editandoId && !imagenPrincipalAnterior} onChange={handleSeleccionPrincipal} className="sr-only" id="input-p" />
                            <label htmlFor="input-p" className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium cursor-pointer inline-block hover:bg-gray-50 transition-colors shadow-sm">Examinar archivos...</label>
                            <p className="text-xs text-gray-400 mt-2">Formatos recomendados: JPG, PNG. Se optimizará a WebP.</p>
                          </div>
                        </div>
                      </div>

                      {vistaActiva === "comunicaciones" && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Galería / Carrusel</label>
                          <input type="file" accept="image/*" multiple onChange={handleAgregarImagenes} className="sr-only" id="input-c" />
                          <label htmlFor="input-c" className="text-sm bg-white border border-dashed border-gray-300 text-main-blue w-full text-center py-4 rounded-lg font-medium cursor-pointer block hover:bg-blue-50 transition-colors mb-4">+ Cargar múltiples imágenes</label>
                          
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
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                      <button type="button" onClick={limpiarFormulario} className="w-full sm:w-1/3 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 font-semibold py-3.5 rounded-xl transition-colors cursor-pointer border border-transparent">Cancelar</button>
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
                        <article key={n.id} className={`group flex flex-col p-4 rounded-xl border transition-all duration-200 cursor-default ${editandoId === n.id ? 'bg-red-50 border-main-red shadow-sm' : 'bg-white border-gray-100 hover:border-main-blue/30 hover:shadow-sm'}`}>
                          <div className="flex gap-3 items-start mb-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                              {n.imagenPrincipalUrl ? <img src={n.imagenPrincipalUrl} className="w-full h-full object-cover" alt="Miniatura" /> : <span className="text-[10px] font-bold text-gray-400">TXT</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug" title={n.titulo}>{n.titulo}</h3>
                              <p className="text-[10px] text-gray-400 mt-1 truncate">/{vistaActiva === "articulos" ? "articulos-academicos" : (vistaActiva === "libros" ? "libros" : "noticias")}/{n.slug || n.id}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full">
                            <button onClick={() => handleEditarItem(n)} className="flex-1 bg-white border border-gray-200 text-gray-600 hover:text-main-blue hover:border-main-blue hover:bg-blue-50 py-1.5 rounded-lg text-xs font-semibold transition-colors">Editar</button>
                            <button onClick={() => pedirConfirmacionBorrado(n.id, n.titulo)} className="px-3 bg-white border border-gray-200 text-gray-400 hover:text-main-red hover:border-main-red hover:bg-red-50 py-1.5 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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
      </div>
    </main>
  );
}