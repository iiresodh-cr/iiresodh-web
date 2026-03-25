// src/pages/AdminPanel.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { signOut } from "firebase/auth";
import { auth, db, storage, functions } from "../firebase/config";
import { collection, addDoc, updateDoc, serverTimestamp, doc, deleteDoc, getDocs, query, orderBy, Timestamp, limit, startAfter } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";

import logoColor from "../assets/Logo_Oficiale_200w-trim.png";

const generarSlug = (texto) => {
  if (!texto) return `noticia-${Math.random().toString(36).substring(2, 6)}`;
  
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
  
  return baseSlug ? `${baseSlug}-${randomCode}` : `noticia-${randomCode}`;
};

// NUEVA FUNCIÓN: Detecta URLs y también Hashtags (#)
const formatearTextoConLinksYHashtags = (texto) => {
  if (!texto) return "";
  const partes = texto.split(/(<[^>]+>)/g);
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 0) {
      // 1. Convertir URLs
      let procesado = partes[i].replace(/(https?:\/\/[^\s<]+)/g, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-main-red hover:text-main-blue font-bold underline transition-colors pointer-events-auto">${url}</a>`;
      });
      // 2. Convertir Hashtags (#)
      procesado = procesado.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, (hashtag) => {
        const termino = hashtag.substring(1); // Quita el '#' para la búsqueda
        return `<a href="/buscar?q=${termino}" class="text-light-blue hover:text-main-red font-bold transition-colors pointer-events-auto">${hashtag}</a>`;
      });
      partes[i] = procesado;
    }
  }
  return partes.join('');
};

// NUEVA FUNCIÓN: Convierte imágenes JPG/PNG a WebP en el navegador
const convertirAWebp = (file, calidad = 0.8) => {
  return new Promise((resolve, reject) => {
    // Si ya es webp, gif o svg, no lo tocamos
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
        
        // Exportar a WebP
        canvas.toBlob((blob) => {
          if (blob) {
            // Cambiamos la extensión del nombre original a .webp
            const nuevoNombre = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([blob], nuevoNombre, { type: 'image/webp' });
            resolve(webpFile);
          } else {
            reject(new Error("Error al convertir la imagen a WebP"));
          }
        }, 'image/webp', calidad);
      };
      img.onerror = () => reject(new Error("Error al cargar la imagen para convertirla"));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
};

export default function AdminPanel() {
  const navigate = useNavigate(); 
  
  // ESTADO PARA CONTROLAR LA VISTA ACTUAL (inicio o comunicaciones)
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

  const [loading, setLoading] = useState(false);
  const [generandoResumen, setGenerandoResumen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [listaNoticias, setListaNoticias] = useState([]);

  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [hayMas, setHayMas] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const NOTICIAS_POR_PAGINA = 10;

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
      return "Imagen existente";
    }
  };

  const cargarNoticias = async () => {
    try {
      const q = query(
        collection(db, "noticias"), 
        orderBy("fechaPublicacion", "desc"), 
        limit(NOTICIAS_POR_PAGINA)
      );
      const querySnapshot = await getDocs(q);
      const noticiasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setListaNoticias(noticiasData);

      if (querySnapshot.docs.length > 0) {
        setUltimoDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHayMas(querySnapshot.docs.length === NOTICIAS_POR_PAGINA);
      } else {
        setHayMas(false);
      }
    } catch (error) {
      console.error("Error al cargar noticias:", error);
    }
  };

  const cargarMasNoticias = async () => {
    if (!ultimoDoc) return;
    setCargandoMas(true);
    try {
      const q = query(
        collection(db, "noticias"), 
        orderBy("fechaPublicacion", "desc"), 
        startAfter(ultimoDoc),
        limit(NOTICIAS_POR_PAGINA)
      );
      const querySnapshot = await getDocs(q);
      const noticiasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setListaNoticias(prev => [...prev, ...noticiasData]);
      
      if (querySnapshot.docs.length > 0) {
        setUltimoDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHayMas(querySnapshot.docs.length === NOTICIAS_POR_PAGINA);
      } else {
        setHayMas(false);
      }
    } catch (error) {
      console.error("Error al cargar más noticias:", error);
    } finally {
      setCargandoMas(false);
    }
  };

  useEffect(() => {
    cargarNoticias();
  }, []);

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
      setMensaje("Escribe el contenido de la noticia antes de generar un resumen.");
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

  const handleEditarNoticia = (noticia) => {
    setEditandoId(noticia.id);
    setTitulo(noticia.titulo);
    setResumen(noticia.resumen);
    setContenido(noticia.contenido || "");

    if (noticia.fechaPublicacion) {
      const date = noticia.fechaPublicacion.toDate();
      const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setFechaPersonalizada(localISOTime);
    }

    setImagenPrincipalAnterior(noticia.imagenPrincipalUrl);
    setMainImagePreviewUrl(noticia.imagenPrincipalUrl); 
    setCarruselExistente(noticia.imagenesCarruselUrls || []);
    setImagenesCarrusel([]); 
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
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
  };

  const handleBorrarNoticia = async (id, titulo) => {
    if (window.confirm(`¿Eliminar permanentemente "${titulo}"?`)) {
      try {
        await deleteDoc(doc(db, "noticias", id));
        cargarNoticias(); 
      } catch (error) {
        console.error("Error al borrar:", error);
      }
    }
  };

  // MANEJADOR ACTUALIZADO: Convierte a WebP antes de guardar en estado
  const handleSeleccionPrincipal = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setMensaje("Optimizando imagen principal...");
        const webpFile = await convertirAWebp(file);
        setImagenPrincipal(webpFile);
        setMainImagePreviewUrl(URL.createObjectURL(webpFile));
        setMensaje(""); 
      } catch (error) {
        console.error("Error al procesar imagen principal:", error);
        setMensaje("Error al optimizar la imagen.");
        setTimeout(() => setMensaje(""), 3000);
      }
    }
  };

  // MANEJADOR ACTUALIZADO: Convierte a WebP antes de guardar en estado
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
        console.error("Error al procesar imágenes del carrusel:", error);
        setMensaje("Error al optimizar las imágenes del carrusel.");
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
    setMensaje(editandoId ? "Actualizando noticia..." : "Publicando noticia...");

    try {
      let finalPrincipalUrl = imagenPrincipalAnterior;
      if (imagenPrincipal) {
        const refImg = ref(storage, `noticias/${Date.now()}_${imagenPrincipal.name}`);
        await uploadBytes(refImg, imagenPrincipal);
        finalPrincipalUrl = await getDownloadURL(refImg);
      }

      const nuevasUrls = [];
      for (const file of imagenesCarrusel) {
        const refCar = ref(storage, `noticias/carrusel/${Date.now()}_${file.name}`);
        await uploadBytes(refCar, file);
        const url = await getDownloadURL(refCar);
        nuevasUrls.push(url);
      }
      
      const slugGenerado = generarSlug(titulo);

      const datos = {
        titulo, resumen, contenido,
        slug: slugGenerado, 
        imagenPrincipalUrl: finalPrincipalUrl,
        imagenesCarruselUrls: [...carruselExistente, ...nuevasUrls],
        fechaPublicacion: fechaPersonalizada ? Timestamp.fromDate(new Date(fechaPersonalizada)) : serverTimestamp(),
        activa: true
      };

      if (editandoId) {
        await updateDoc(doc(db, "noticias", editandoId), datos);
        setMensaje("¡Noticia actualizada!");
      } else {
        await addDoc(collection(db, "noticias"), datos);
        setMensaje("¡Noticia publicada!");
      }

      cancelarEdicion();
      cargarNoticias(); 
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
        
        {/* VISTA 1: DASHBOARD PRINCIPAL (Selección de Área) */}
        {vistaActiva === "inicio" && (
          <div className="bg-white p-8 md:p-12 rounded-lg shadow-md border-t-4 border-main-blue animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-extrabold text-main-blue mb-4">Panel de Control Principal</h1>
            <p className="text-gray-600 mb-10 text-lg">Seleccione el área departamental que desea administrar. Las opciones disponibles dependen de sus permisos de usuario.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Botón Departamento de Comunicaciones */}
              <button 
                onClick={() => setVistaActiva("comunicaciones")} 
                className="bg-gray-50 border border-gray-200 p-8 rounded-xl hover:shadow-lg hover:border-main-red transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer"
              >
                <svg className="w-14 h-14 text-main-blue group-hover:text-main-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 8h8M8 12h8M8 16h4"></path>
                </svg>
                <h2 className="text-xl font-bold text-main-blue group-hover:text-main-red transition-colors">Comunicaciones</h2>
                <p className="text-sm text-gray-500 text-center">Gestión y publicación de noticias institucionales</p>
              </button>

              {/* Botones Deshabilitados (Para el futuro) */}
              <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl opacity-60 flex flex-col items-center justify-center gap-4 cursor-not-allowed">
                <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <h2 className="text-xl font-bold text-gray-500">Cursos / Académico</h2>
                <p className="text-sm text-gray-400 text-center">Próximamente</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl opacity-60 flex flex-col items-center justify-center gap-4 cursor-not-allowed">
                <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                </svg>
                <h2 className="text-xl font-bold text-gray-500">Litigios Activos</h2>
                <p className="text-sm text-gray-400 text-center">Próximamente</p>
              </div>

            </div>
          </div>
        )}

        {/* VISTA 2: DEPARTAMENTO DE COMUNICACIONES (Gestión de Noticias) */}
        {vistaActiva === "comunicaciones" && (
          <div className="animate-fade-in-up">
            
            {/* Botón para regresar al panel principal */}
            <button 
              onClick={() => {
                cancelarEdicion();
                setVistaActiva("inicio");
              }} 
              className="mb-6 flex items-center gap-2 text-main-blue font-bold hover:text-main-red transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Volver al Panel Principal
            </button>

            <div className={`bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 ${editandoId ? 'border-main-red' : 'border-main-blue'}`}>
              <h1 className="text-3xl font-extrabold text-main-blue">Departamento de Comunicaciones</h1>
              <p className="text-light-blue">{editandoId ? "Modo Edición Activo" : "Gestión de Noticias"}</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md mb-12 border-t-4 border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className={`text-2xl font-bold ${editandoId ? 'text-main-red' : 'text-main-blue'}`}>
                  {editandoId ? "Editar Noticia" : "Crear Nueva Noticia"}
                </h2>
                {editandoId && <button onClick={cancelarEdicion} className="text-sm bg-gray-200 px-3 py-1 rounded font-bold hover:bg-gray-300 transition-colors">Cancelar Edición</button>}
              </div>
              
              {mensaje && <div className={`p-4 rounded mb-6 font-bold ${mensaje.includes("¡") || mensaje.includes("PIDA") || mensaje.includes("Optimizando") ? "bg-green-100 text-green-700" : "bg-blue-100 text-main-blue"}`}>{mensaje}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-main-blue font-bold mb-2">Título de la Noticia</label>
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

                <div>
                  <label className="flex items-center text-main-blue font-bold mb-2">
                    Contenido Completo 
                    <span className="text-xs font-normal text-light-blue ml-3 bg-blue-50 px-2 py-1 rounded">
                      (Soporta Emojis 🚀, Enlaces 🔗 y Hashtags #)
                    </span>
                  </label>
                  <textarea required value={contenido} onChange={(e) => setContenido(e.target.value)} className="w-full border border-gray-300 p-3 rounded" rows="12" />
                  <div className="mt-4 bg-gray-50 p-5 rounded border border-gray-200 shadow-inner">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Simulación en Portada</label>
                    <div ref={contenidoPreviewRef} className="text-gray-600 text-lg font-light leading-relaxed noticia-content max-h-80 overflow-hidden bg-white p-5 rounded" dangerouslySetInnerHTML={{ __html: formatearTextoConLinksYHashtags(contenido) || "Vista previa..." }} />
                    <div className="mt-4">{showReadMoreWarning ? <p className="text-main-red font-bold text-sm">⚠️ El texto superó el límite visible.</p> : <p className="text-green-600 font-bold text-sm">✓ El texto cabe perfectamente.</p>}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 bg-basic-beige p-6 rounded border-2 border-pale-blue">
                  <input type="file" accept="image/*" required={!editandoId && !imagenPrincipalAnterior} onChange={handleSeleccionPrincipal} className="sr-only" id="input-p" />
                  <label htmlFor="input-p" className="bg-main-blue text-white px-6 py-2 rounded font-bold cursor-pointer inline-block shadow-md hover:bg-light-blue transition-colors">Seleccionar Imagen Principal</label>
                  
                  {mainImagePreviewUrl && (
                    <div className="mt-2 bg-white p-3 rounded border inline-block max-w-full">
                      <img src={mainImagePreviewUrl} alt="Preview" className="max-h-60 rounded shadow-sm block object-contain mx-auto" />
                      <p className="text-sm text-gray-600 font-medium text-center mt-3 truncate px-2" title={imagenPrincipal ? imagenPrincipal.name : extraerNombreDesdeUrl(mainImagePreviewUrl)}>
                        {imagenPrincipal ? imagenPrincipal.name : extraerNombreDesdeUrl(mainImagePreviewUrl)}
                      </p>
                    </div>
                  )}

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
                </div>

                <button type="submit" disabled={loading} className="w-full bg-main-blue hover:bg-light-blue text-white font-bold py-4 rounded uppercase tracking-widest transition-all shadow-lg">
                  {loading ? "Procesando..." : (editandoId ? "Actualizar" : "Publicar")}
                </button>
              </form>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-main-blue">
              <h2 className="text-2xl font-bold text-main-blue mb-6 border-b pb-2">Gestionar Noticias Publicadas</h2>
              <div className="space-y-4">
                {listaNoticias.map((n) => (
                  <div key={n.id} className="flex items-center justify-between bg-gray-50 p-4 rounded border hover:bg-white transition-colors">
                    <div className="flex items-center gap-4">
                      <img src={n.imagenPrincipalUrl} className="w-12 h-12 object-cover rounded shadow-sm" alt="Thumbnail" />
                      <div className="flex flex-col">
                        <h3 className="font-bold text-main-blue line-clamp-1">{n.titulo}</h3>
                        <span className="text-xs text-light-blue font-medium mt-1">
                          URL: /noticias/{n.slug || n.id}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditarNoticia(n)} className="border-2 border-main-blue text-main-blue px-4 py-1 rounded font-bold text-sm hover:bg-main-blue hover:text-white transition-all">Editar</button>
                      <button onClick={() => handleBorrarNoticia(n.id, n.titulo)} className="border-2 border-bright-red text-bright-red px-4 py-1 rounded font-bold text-sm hover:bg-bright-red hover:text-white transition-all">Borrar</button>
                    </div>
                  </div>
                ))}
              </div>
              
              {hayMas && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={cargarMasNoticias} 
                    disabled={cargandoMas}
                    className="bg-pale-blue text-main-blue hover:bg-light-blue hover:text-white px-8 py-3 rounded-full font-bold transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {cargandoMas ? "Cargando..." : "Cargar más noticias ↓"}
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