// src/pages/AdminPanel.jsx
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

const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  let procesado = texto.replace(/\[([^\]]+)\]\((https?:\/\/[^\s<]+)\)/g, (match, textoEnlace, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red hover:text-main-blue font-bold underline transition-colors pointer-events-auto">${textoEnlace}</a>`;
  });
  const partes = procesado.split(/(<[^>]+>)/g);
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 0) {
      let parte = partes[i].replace(/(https?:\/\/[^\s<]+)/g, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red hover:text-main-blue font-bold underline transition-colors pointer-events-auto">${url}</a>`;
      });
      parte = parte.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (hashtag) => {
        const termino = hashtag.substring(1); 
        return `<a href="/buscar?q=${termino}" class="text-light-blue hover:text-main-red font-bold transition-colors pointer-events-auto">${hashtag}</a>`;
      });
      // SOLUCIÓN INTEGRAL: Traduce los "Enter" del teclado en saltos de línea de HTML
      parte = parte.replace(/\n/g, '<br />');
      partes[i] = parte;
    }
  }
  return partes.join('');
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

  // PAGINACIÓN
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
    return vistaActiva === "articulos" ? "articulos_academicos" : "noticias";
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
    setMensaje("Operación cancelada. Formulario en blanco.");
    setTimeout(() => setMensaje(""), 3000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBorrarItem = async (id, tituloItem) => {
    if (window.confirm(`¿Eliminar permanentemente "${tituloItem}"?`)) {
      try {
        const coleccion = obtenerColeccionActiva();
        await deleteDoc(doc(db, coleccion, id));
        cargarItems(); 
      } catch (error) {
        console.error("Error al borrar:", error);
      }
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
        setMensaje("Optimizando imagen...");
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
    const files = Array.from(e.target.files);
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

  const moverImagenNueva = (index, direccion) => {
    const nuevas = [...imagenesCarrusel];
    if (direccion === -1 && index > 0) [nuevas[index], nuevas[index - 1]] = [nuevas[index - 1], nuevas[index]];
    else if (direccion === 1 && index < nuevas.length - 1) [nuevas[index], nuevas[index + 1]] = [nuevas[index + 1], nuevas[index]];
    setImagenesCarrusel(nuevas);
  };

  const moverImagenExistente = (index, direccion) => {
    const existentes = [...carruselExistente];
    if (direccion === -1 && index > 0) [existentes[index], existentes[index - 1]] = [existentes[index - 1], existentes[index]];
    else if (direccion === 1 && index < existentes.length - 1) [existentes[index], existentes[index + 1]] = [existentes[index + 1], existentes[index]];
    setCarruselExistente(existentes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(editandoId ? "Actualizando información..." : "Publicando contenido...");

    try {
      const carpeta = vistaActiva === "articulos" ? "articulos" : "noticias";
      let finalPrincipalUrl = imagenPrincipalAnterior;
      
      if (imagenPrincipal) {
        const refImg = ref(storage, `${carpeta}/${Date.now()}_${imagenPrincipal.name}`);
        await uploadBytes(refImg, imagenPrincipal);
        finalPrincipalUrl = await getDownloadURL(refImg);
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
        imagenesCarruselUrls: vistaActiva === "comunicaciones" ? [...carruselExistente, ...nuevasUrls] : [],
        fechaPublicacion: fechaPersonalizada ? Timestamp.fromDate(new Date(fechaPersonalizada)) : serverTimestamp(),
        activa: true
      };

      if (editandoId) {
        await updateDoc(doc(db, coleccion, editandoId), datos);
        setMensaje("¡Contenido actualizado!");
      } else {
        await addDoc(collection(db, coleccion), datos);
        setMensaje("¡Contenido publicado!");
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
    <div className="min-h-screen bg-basic-beige">
      <header className="bg-white p-5 shadow-sm border-b border-gray-200 flex justify-between items-center px-8">
        <img src={logoColor} alt="Logo IIRESODH" className="h-12 md:h-14 w-auto object-contain" />
        <button onClick={handleLogout} className="bg-main-red hover:bg-bright-red text-white px-6 py-2 rounded-full font-bold shadow-sm transition-colors">
          Cerrar Sesión
        </button>
      </header>

      <main className="p-8 max-w-6xl mx-auto">
        
        {vistaActiva === "inicio" && (
          <div className="bg-white p-8 md:p-12 rounded-lg shadow-md border-t-4 border-main-blue animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-extrabold text-main-blue mb-4">Panel de Control Principal</h1>
            <p className="text-gray-600 mb-10 text-lg">Seleccione el área departamental que desea administrar.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <button onClick={() => setVistaActiva("comunicaciones")} className="bg-gray-50 border border-gray-200 p-8 rounded-xl hover:shadow-lg hover:border-main-red transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer">
                <svg className="w-14 h-14 text-main-blue group-hover:text-main-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 8h8M8 12h8M8 16h4"></path>
                </svg>
                <h2 className="text-xl font-bold text-main-blue group-hover:text-main-red transition-colors">Comunicaciones</h2>
                <p className="text-sm text-gray-500 text-center">Gestión de noticias y comunicados</p>
              </button>

              <button onClick={() => setVistaActiva("articulos")} className="bg-gray-50 border border-gray-200 p-8 rounded-xl hover:shadow-lg hover:border-main-red transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer">
                <svg className="w-14 h-14 text-main-blue group-hover:text-main-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <h2 className="text-xl font-bold text-main-blue group-hover:text-main-red transition-colors">Artículos Académicos</h2>
                <p className="text-sm text-gray-500 text-center">Publicación de investigaciones y ensayos</p>
              </button>

              <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl opacity-60 flex flex-col items-center justify-center gap-4 cursor-not-allowed">
                <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                <h2 className="text-xl font-bold text-gray-500">Litigios Activos</h2>
                <p className="text-sm text-gray-400 text-center">Próximamente</p>
              </div>
            </div>
          </div>
        )}

        {(vistaActiva === "comunicaciones" || vistaActiva === "articulos") && (
          <div className="animate-fade-in-up">
            
            <button 
              onClick={() => {
                limpiarFormulario();
                setVistaActiva("inicio");
              }} 
              className="mb-6 flex items-center gap-2 text-main-blue font-bold hover:text-main-red transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Volver al Panel Principal
            </button>

            <div className={`bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 ${editandoId ? 'border-main-red' : 'border-main-blue'}`}>
              <h1 className="text-3xl font-extrabold text-main-blue">
                {vistaActiva === "comunicaciones" ? "Departamento de Comunicaciones" : "Repositorio Académico"}
              </h1>
              <p className="text-light-blue">
                {editandoId 
                  ? "Modo Edición Activo" 
                  : (vistaActiva === "comunicaciones" ? "Gestión de Noticias" : "Publicación de Artículos")}
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md mb-12 border-t-4 border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className={`text-2xl font-bold ${editandoId ? 'text-main-red' : 'text-main-blue'}`}>
                  {editandoId ? "Editar Contenido" : "Crear Nueva Entrada"}
                </h2>
              </div>
              
              {mensaje && <div className={`p-4 rounded mb-6 font-bold ${mensaje.includes("¡") || mensaje.includes("PIDA") || mensaje.includes("Optimizando") ? "bg-green-100 text-green-700" : "bg-blue-100 text-main-blue"}`}>{mensaje}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-main-blue font-bold mb-2">
                      {vistaActiva === "articulos" ? "Título del Artículo" : "Título de la Noticia"}
                    </label>
                    <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-light-blue" />
                  </div>
                  <div className="md:col-span-2 bg-basic-beige p-4 rounded border border-pale-blue">
                    <label className="block text-main-blue font-bold mb-1">Fecha de Publicación (Opcional)</label>
                    <input type="datetime-local" value={fechaPersonalizada} onChange={(e) => setFechaPersonalizada(e.target.value)} className="w-full md:w-1/2 border border-gray-300 p-3 rounded bg-white" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-main-blue">Resumen para Portada</label>
                    <button type="button" onClick={handleAutoResumen} disabled={generandoResumen} className="text-xs bg-main-blue text-white hover:bg-light-blue font-bold py-2 px-4 rounded-full disabled:opacity-50 transition-colors">
                      {generandoResumen ? "Consultando a PIDA..." : "✨ Generar con PIDA"}
                    </button>
                  </div>
                  <textarea required maxLength="250" value={resumen} onChange={(e) => setResumen(e.target.value)} className="w-full border border-gray-300 p-3 rounded" rows="2" />
                </div>

                {vistaActiva === "comunicaciones" && (
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <label className="flex items-center text-main-blue font-bold mb-2">
                      📁 Generador de Enlaces para Documentos (PDF, DOCX, XLSX)
                    </label>
                    <p className="text-sm text-gray-500 mb-4">Sube un archivo aquí para obtener un enlace corto y pegarlo dentro de tu texto.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleSubirDocumento} className="sr-only" id="input-doc" />
                      <label htmlFor="input-doc" className={`bg-white border-2 border-main-blue text-main-blue px-6 py-2 rounded font-bold cursor-pointer inline-block hover:bg-main-blue hover:text-white transition-colors ${subiendoArchivo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {subiendoArchivo ? "Subiendo..." : "Subir Archivo"}
                      </label>
                    </div>

                    {archivosAdjuntos.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {archivosAdjuntos.map((archivo, index) => (
                          <div key={index} className="flex justify-between items-center bg-white p-3 rounded border shadow-sm">
                            <span className="text-sm font-medium text-gray-700 truncate mr-4">{archivo.nombre}</span>
                            <button type="button" onClick={() => copiarEnlaceDocumento(archivo.nombre, archivo.url)} className="bg-light-blue hover:bg-main-blue text-white text-xs font-bold py-1.5 px-3 rounded transition-colors shrink-0">
                              Copiar Enlace
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="flex items-center text-main-blue font-bold mb-2">
                    Contenido Completo 
                    {vistaActiva === "comunicaciones" && (
                      <span className="text-xs font-normal text-light-blue ml-3 bg-blue-50 px-2 py-1 rounded">
                        (Pega aquí los enlaces generados arriba 📁)
                      </span>
                    )}
                  </label>
                  
                  {/* RESTAURADO A TEXTAREA SIMPLE */}
                  <textarea 
                    required 
                    value={contenido} 
                    onChange={(e) => setContenido(e.target.value)} 
                    className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-light-blue" 
                    rows="12" 
                    placeholder="Escribe el contenido aquí o pega el texto y tablas desde Word/Excel..." 
                  />
                  
                  {vistaActiva === "comunicaciones" && (
                    <div className="mt-4 bg-gray-50 p-5 rounded border border-gray-200 shadow-inner">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Simulación en Portada</label>
                      <div ref={contenidoPreviewRef} className="text-gray-600 text-lg font-light leading-relaxed noticia-content max-h-80 overflow-hidden bg-white p-5 rounded" dangerouslySetInnerHTML={{ __html: formatearTextoConLinksYHashtags(contenido) || "Vista previa..." }} />
                      <div className="mt-4">{showReadMoreWarning ? <p className="text-main-red font-bold text-sm">⚠️ El texto superó el límite visible.</p> : <p className="text-green-600 font-bold text-sm">✓ El texto cabe perfectamente.</p>}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 bg-basic-beige p-6 rounded border-2 border-pale-blue">
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    required={vistaActiva === "comunicaciones" && !editandoId && !imagenPrincipalAnterior} 
                    onChange={handleSeleccionPrincipal} 
                    className="sr-only" 
                    id="input-p" 
                  />
                  <label htmlFor="input-p" className="bg-main-blue text-white px-6 py-2 rounded font-bold cursor-pointer inline-block shadow-md hover:bg-light-blue transition-colors">
                    {vistaActiva === "articulos" ? "Adjuntar Imagen (Opcional)" : "Seleccionar Imagen Principal"}
                  </label>
                  
                  {mainImagePreviewUrl && (
                    <div className="mt-2 bg-white p-3 rounded border inline-block max-w-full">
                      <img src={mainImagePreviewUrl} alt="Preview" className="max-h-60 rounded shadow-sm block object-contain mx-auto" />
                      <p className="text-sm text-gray-600 font-medium text-center mt-3 truncate px-2" title={imagenPrincipal ? imagenPrincipal.name : extraerNombreDesdeUrl(mainImagePreviewUrl)}>
                        {imagenPrincipal ? imagenPrincipal.name : extraerNombreDesdeUrl(mainImagePreviewUrl)}
                      </p>
                    </div>
                  )}

                  {vistaActiva === "comunicaciones" && (
                    <>
                      <input type="file" accept="image/*" multiple onChange={handleAgregarImagenes} className="sr-only" id="input-c" />
                      <label htmlFor="input-c" className="bg-light-blue text-white px-6 py-2 rounded font-bold cursor-pointer inline-block mt-4 shadow-md hover:bg-main-blue transition-colors">+ Cargar Carrusel (Múltiple)</label>
                      
                      <div className="grid gap-3">
                        {carruselExistente.map((url, i) => (
                          <div key={`old-${i}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-3 rounded border gap-4">
                            <div className="flex items-center gap-4 overflow-hidden w-full sm:w-auto">
                              <img src={url} className="h-20 w-24 object-cover rounded shadow-sm shrink-0" alt="Existente" />
                              <span className="text-sm font-medium text-gray-600 truncate" title={extraerNombreDesdeUrl(url)}>
                                {extraerNombreDesdeUrl(url)}
                              </span>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto justify-end shrink-0">
                              <button type="button" onClick={() => moverImagenExistente(i, -1)} disabled={i === 0} className="px-3 py-1 bg-main-blue hover:bg-light-blue transition-colors text-white rounded disabled:opacity-50">↑</button>
                              <button type="button" onClick={() => moverImagenExistente(i, 1)} disabled={i === carruselExistente.length - 1} className="px-3 py-1 bg-main-blue hover:bg-light-blue transition-colors text-white rounded disabled:opacity-50">↓</button>
                              <button type="button" onClick={() => setCarruselExistente(prev => prev.filter((_, idx) => idx !== i))} className="px-3 py-1 bg-bright-red hover:bg-red-700 transition-colors text-white rounded">X</button>
                            </div>
                          </div>
                        ))}
                        {imagenesCarrusel.map((f, i) => (
                          <div key={`new-${i}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-green-50 p-3 rounded border border-green-200 gap-4">
                            <div className="flex items-center gap-4 overflow-hidden w-full sm:w-auto">
                              <img src={URL.createObjectURL(f)} className="h-20 w-24 object-cover rounded shadow-sm shrink-0" alt="Nueva" />
                              <span className="text-sm font-medium text-green-700 truncate" title={f.name}>
                                {f.name} <span className="text-xs text-green-600 ml-1 font-bold">(Nueva)</span>
                              </span>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto justify-end shrink-0">
                              <button type="button" onClick={() => moverImagenNueva(i, -1)} disabled={i === 0} className="px-3 py-1 bg-main-blue hover:bg-light-blue transition-colors text-white rounded disabled:opacity-50">↑</button>
                              <button type="button" onClick={() => moverImagenNueva(i, 1)} disabled={i === imagenesCarrusel.length - 1} className="px-3 py-1 bg-main-blue hover:bg-light-blue transition-colors text-white rounded disabled:opacity-50">↓</button>
                              <button type="button" onClick={() => setImagenesCarrusel(prev => prev.filter((_, idx) => idx !== i))} className="px-3 py-1 bg-bright-red hover:bg-red-700 transition-colors text-white rounded">X</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button type="button" onClick={limpiarFormulario} className="w-1/3 bg-gray-200 hover:bg-gray-300 text-main-blue font-bold py-4 rounded uppercase tracking-widest transition-all">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="w-2/3 bg-main-blue hover:bg-light-blue text-white font-bold py-4 rounded uppercase tracking-widest transition-all shadow-lg">
                    {loading ? "Procesando..." : (editandoId ? "Actualizar Contenido" : "Publicar Contenido")}
                  </button>
                </div>

              </form>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-main-blue">
              <h2 className="text-2xl font-bold text-main-blue mb-6 border-b pb-2">
                Gestionar {vistaActiva === "comunicaciones" ? "Noticias" : "Artículos"} Publicados
              </h2>
              <div className="space-y-4">
                {listaItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay contenido publicado en esta sección.</p>
                ) : (
                  listaItems.map((n) => (
                    <div key={n.id} className="flex items-center justify-between bg-gray-50 p-4 rounded border hover:bg-white transition-colors">
                      <div className="flex items-center gap-4">
                        {n.imagenPrincipalUrl ? (
                          <img src={n.imagenPrincipalUrl} className="w-12 h-12 object-cover rounded shadow-sm shrink-0" alt="Thumbnail" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center shrink-0">
                            <span className="text-gray-400 text-xs">TXT</span>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <h3 className="font-bold text-main-blue line-clamp-1">{n.titulo}</h3>
                          <span className="text-xs text-light-blue font-medium mt-1">
                            URL: /{vistaActiva === "articulos" ? "articulos-academicos" : "noticias"}/{n.slug || n.id}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditarItem(n)} className="border-2 border-main-blue text-main-blue px-4 py-1 rounded font-bold text-sm hover:bg-main-blue hover:text-white transition-all">Editar</button>
                        <button onClick={() => handleBorrarItem(n.id, n.titulo)} className="border-2 border-bright-red text-bright-red px-4 py-1 rounded font-bold text-sm hover:bg-bright-red hover:text-white transition-all">Borrar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {listaItems.length > 0 && (
                <div className="mt-12 flex items-center justify-center gap-8">
                  <button 
                    onClick={paginaAnterior}
                    disabled={paginaActual === 1 || loading}
                    className={`px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest transition-all ${
                      paginaActual === 1 || loading 
                      ? 'text-gray-300 cursor-not-allowed border border-gray-200' 
                      : 'text-main-blue hover:bg-main-blue hover:text-white border border-main-blue cursor-pointer'
                    }`}
                  >
                    &larr; Anterior
                  </button>

                  <span className="text-main-blue font-black text-lg">
                    {paginaActual}
                  </span>

                  <button 
                    onClick={paginaSiguiente}
                    disabled={!hayMas || loading}
                    className={`px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest transition-all ${
                      !hayMas || loading 
                      ? 'text-gray-300 cursor-not-allowed border border-gray-200' 
                      : 'text-main-blue hover:bg-main-blue hover:text-white border border-main-blue cursor-pointer'
                    }`}
                  >
                    Siguiente &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}