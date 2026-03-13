// src/pages/AdminPanel.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { signOut } from "firebase/auth";
import { auth, db, storage, functions } from "../firebase/config";
import { collection, addDoc, updateDoc, serverTimestamp, doc, deleteDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";

// Importamos el logo oficial recortado en formato PNG
import logoColor from "../assets/Logo_Oficiale_200w-trim.png";

export default function AdminPanel() {
  const navigate = useNavigate(); 
  
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

  // Referencia y estado para la simulación de límite de texto
  const contenidoPreviewRef = useRef(null);
  const [showReadMoreWarning, setShowReadMoreWarning] = useState(false);

  const handleLogout = () => {
    navigate("/"); 
    setTimeout(() => {
      signOut(auth).catch((error) => console.error("Error al cerrar sesión:", error));
    }, 100);
  };

  const cargarNoticias = async () => {
    try {
      const q = query(collection(db, "noticias"), orderBy("fechaPublicacion", "desc"));
      const querySnapshot = await getDocs(q);
      const noticiasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setListaNoticias(noticiasData);
    } catch (error) {
      console.error("Error al cargar noticias:", error);
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

  // Efecto dinámico para revisar si el texto sobrepasa el límite del inicio
  useEffect(() => {
    const checkOverflow = () => {
      if (contenidoPreviewRef.current) {
        const { scrollHeight, clientHeight } = contenidoPreviewRef.current;
        setShowReadMoreWarning(scrollHeight > clientHeight + 2);
      }
    };
    
    checkOverflow();
    const timeoutId = setTimeout(checkOverflow, 50);
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [contenido]);

  // Función para autogenerar resumen conectándose al Backend (Cloud Functions)
  const handleAutoResumen = async () => {
    if (!contenido || contenido.trim().length < 10) {
      setMensaje("Debes escribir un poco más de contenido en la noticia para generar un resumen.");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    setGenerandoResumen(true);
    
    try {
      // Llamamos a la Cloud Function de manera segura (incluye auth token automáticamente)
      const generarResumenGemini = httpsCallable(functions, 'generarResumenGemini');
      const resultado = await generarResumenGemini({ contenido });
      
      if (resultado.data && resultado.data.resumen) {
        setResumen(resultado.data.resumen);
        setMensaje("¡Resumen generado con Inteligencia Artificial!");
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error) {
      console.error("Error al contactar a la Cloud Function:", error);
      setMensaje("Hubo un error al generar el resumen. Verifica la consola.");
    } finally {
      setGenerandoResumen(false);
      setTimeout(() => setMensaje(""), 4000);
    }
  };

  const handleEditarNoticia = (noticia) => {
    setEditandoId(noticia.id);
    setTitulo(noticia.titulo);
    setResumen(noticia.resumen);
    setContenido(noticia.contenido || noticia.contenidoHTML || noticia.cuerpo || "");

    if (noticia.fechaPublicacion) {
      const date = noticia.fechaPublicacion.toDate();
      const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setFechaPersonalizada(localISOTime);
    } else {
      setFechaPersonalizada("");
    }

    setImagenPrincipalAnterior(noticia.imagenPrincipalUrl);
    setMainImagePreviewUrl(noticia.imagenPrincipalUrl); 
    setImagenPrincipal(null); 

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
    setImagenPrincipalAnterior(null);
    setMainImagePreviewUrl(null);
    setImagenPrincipal(null);
    setCarruselExistente([]);
    setImagenesCarrusel([]);
    setMensaje("Edición cancelada.");
    setTimeout(() => setMensaje(""), 3000);
  };

  const handleBorrarNoticia = async (id, tituloNoticia) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente:\n"${tituloNoticia}"?`);
    if (confirmar) {
      try {
        await deleteDoc(doc(db, "noticias", id));
        if (editandoId === id) cancelarEdicion(); 
        setMensaje("Noticia eliminada correctamente.");
        setTimeout(() => setMensaje(""), 3000);
        cargarNoticias(); 
      } catch (error) {
        console.error("Error al borrar:", error);
      }
    }
  };

  const handleSeleccionPrincipal = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenPrincipal(file);
      setMainImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAgregarImagenes = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImagenesCarrusel((prev) => [...prev, ...files]);
      e.target.value = ""; 
    }
  };

  const moverImagenNueva = (index, direccion) => {
    const nuevas = [...imagenesCarrusel];
    if (direccion === -1 && index > 0) [nuevas[index], nuevas[index - 1]] = [nuevas[index - 1], nuevas[index]];
    else if (direccion === 1 && index < nuevas.length - 1) [nuevas[index], nuevas[index + 1]] = [nuevas[index + 1], nuevas[index]];
    setImagenesCarrusel(nuevas);
  };
  const eliminarImagenNueva = (index) => {
    const nuevas = [...imagenesCarrusel];
    nuevas.splice(index, 1);
    setImagenesCarrusel(nuevas);
  };

  const moverImagenExistente = (index, direccion) => {
    const existentes = [...carruselExistente];
    if (direccion === -1 && index > 0) [existentes[index], existentes[index - 1]] = [existentes[index - 1], existentes[index]];
    else if (direccion === 1 && index < existentes.length - 1) [existentes[index], existentes[index + 1]] = [existentes[index + 1], existentes[index]];
    setCarruselExistente(existentes);
  };
  const eliminarImagenExistente = (index) => {
    const existentes = [...carruselExistente];
    existentes.splice(index, 1);
    setCarruselExistente(existentes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imagenPrincipal && !imagenPrincipalAnterior) {
      setMensaje("Por favor, sube una imagen principal.");
      return;
    }

    setLoading(true);
    setMensaje(editandoId ? "Actualizando noticia..." : "Subiendo imágenes y publicando...");

    try {
      let imagenPrincipalUrlFinal = imagenPrincipalAnterior;
      if (imagenPrincipal) { 
        const mainImageRef = ref(storage, `noticias/${Date.now()}_${imagenPrincipal.name}`);
        await uploadBytes(mainImageRef, imagenPrincipal);
        imagenPrincipalUrlFinal = await getDownloadURL(mainImageRef);
      }

      const nuevasUrlsCarrusel = [];
      for (let i = 0; i < imagenesCarrusel.length; i++) {
        const file = imagenesCarrusel[i];
        const carruselRef = ref(storage, `noticias/carrusel/${Date.now()}_${file.name}`);
        await uploadBytes(carruselRef, file);
        const url = await getDownloadURL(carruselRef);
        nuevasUrlsCarrusel.push(url);
      }
      
      const urlsCarruselFinal = [...carruselExistente, ...nuevasUrlsCarrusel];

      let fechaParaGuardar;
      if (fechaPersonalizada) {
        fechaParaGuardar = Timestamp.fromDate(new Date(fechaPersonalizada));
      } else {
        fechaParaGuardar = serverTimestamp(); 
      }

      const datosNoticia = {
        titulo,
        resumen,
        contenido,
        imagenPrincipalUrl: imagenPrincipalUrlFinal,
        imagenesCarruselUrls: urlsCarruselFinal,
        fechaPublicacion: fechaParaGuardar,
        activa: true
      };

      if (editandoId) {
        await updateDoc(doc(db, "noticias", editandoId), datosNoticia);
        setMensaje("¡Noticia actualizada con éxito!");
      } else {
        await addDoc(collection(db, "noticias"), datosNoticia);
        setMensaje("¡Noticia publicada con éxito!");
      }

      setTimeout(() => setMensaje(""), 3000);
      setEditandoId(null);
      setTitulo("");
      setResumen("");
      setContenido("");
      setFechaPersonalizada("");
      setImagenPrincipal(null);
      setMainImagePreviewUrl(null);
      setImagenPrincipalAnterior(null);
      setImagenesCarrusel([]);
      setCarruselExistente([]);
      
      cargarNoticias(); 

    } catch (error) {
      console.error("Error al publicar/actualizar: ", error);
      setMensaje("Hubo un error al procesar la noticia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-basic-beige">
      <header className="bg-white p-5 shadow-sm border-b border-gray-200 flex justify-between items-center px-8">
        <img src={logoColor} alt="Logo IIRESODH" className="h-12 md:h-14 w-auto object-contain" />
        <button onClick={handleLogout} className="bg-main-red hover:bg-bright-red text-white px-6 py-2 rounded-full font-bold transition-colors shadow-sm">
          Cerrar Sesión
        </button>
      </header>

      <main className="p-8">
        <div className={`max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 ${editandoId ? 'border-main-red' : 'border-main-blue'}`}>
          <h1 className="text-3xl font-extrabold text-main-blue">Panel Administrativo</h1>
          <p className="text-light-blue">{editandoId ? "Modo Edición: Actualizando registro existente" : "Gestión y Publicación de Noticias IIRESODH"}</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mb-12 border-t-4 border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className={`text-2xl font-bold ${editandoId ? 'text-main-red' : 'text-main-blue'}`}>
              {editandoId ? "Editar Noticia" : "Crear Nueva Noticia"}
            </h2>
            {editandoId && (
              <span className="bg-main-red text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                Modo Edición
              </span>
            )}
          </div>
          
          {mensaje && (
            <div className={`p-4 rounded mb-6 font-bold ${mensaje.includes("éxito") || mensaje.includes("eliminada") ? "bg-green-100 text-green-700" : "bg-blue-100 text-main-blue"}`}>
              {mensaje}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-main-blue font-bold mb-2">Título de la Noticia</label>
                <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-light-blue" placeholder="Ej. Nuevo acuerdo..." />
              </div>

              <div className="md:col-span-2 bg-basic-beige p-4 rounded border border-pale-blue">
                <label className="block text-main-blue font-bold mb-1">Fecha y Hora de Publicación (Opcional)</label>
                <p className="text-xs text-light-blue mb-3">Si dejas este campo en blanco, se usará la fecha y hora exacta de este momento.</p>
                <input type="datetime-local" value={fechaPersonalizada} onChange={(e) => setFechaPersonalizada(e.target.value)} className="w-full md:w-1/2 border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-light-blue bg-white" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-main-blue font-bold">Resumen (Para la portada de noticias)</label>
                
                <button 
                  type="button" 
                  onClick={handleAutoResumen} 
                  disabled={generandoResumen}
                  className="flex items-center gap-2 text-xs bg-main-blue text-white hover:bg-light-blue font-bold py-2 px-4 rounded-full transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generandoResumen ? (
                    <>
                      <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generando IA...
                    </>
                  ) : (
                    <>✨ Generar con IA</>
                  )}
                </button>
              </div>
              <textarea required maxLength="200" value={resumen} onChange={(e) => setResumen(e.target.value)} className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-light-blue" rows="2" placeholder="Texto corto..."></textarea>
            </div>

            <div>
              <label className="block text-main-blue font-bold mb-2">Contenido Completo</label>
              <textarea required value={contenido} onChange={(e) => setContenido(e.target.value)} className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-light-blue" rows="12" placeholder="Todo el desarrollo..."></textarea>
              
              <div className="mt-4 bg-gray-50 p-5 rounded border border-gray-200 shadow-inner">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Simulación del espacio en Portada Principal (Aproximado)</label>
                
                <div 
                  ref={contenidoPreviewRef}
                  className="text-gray-600 text-lg font-light leading-relaxed noticia-content max-h-80 overflow-hidden border border-dashed border-pale-blue bg-white p-5 rounded"
                  dangerouslySetInnerHTML={{ __html: contenido || "<span class='text-gray-400 italic'>Escribe el contenido arriba para ver cómo encaja en la portada...</span>" }}
                />
                
                <div className="mt-4">
                  {showReadMoreWarning ? (
                    <p className="text-main-red font-bold text-sm flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                      <span>⚠️ El texto superó el límite visible. En la portada aparecerá cortado con el botón <strong>"Leer noticia completa &rarr;"</strong>.</span>
                    </p>
                  ) : (
                    <p className="text-green-600 font-bold text-sm flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      <span>✓ El texto cabe perfectamente. No será necesario el botón de <strong>"Leer noticia completa"</strong> en la portada.</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 bg-basic-beige p-6 rounded border-2 border-pale-blue">
              <div>
                <label className="block text-main-blue font-bold mb-2 text-lg">
                  Imagen Principal {editandoId ? "(Sube una nueva solo si quieres reemplazarla)" : "(Obligatoria)"}
                </label>
                
                <input type="file" accept="image/*" required={!editandoId && !imagenPrincipalAnterior} onChange={handleSeleccionPrincipal} className="sr-only" id="input-principal" />
                
                <label htmlFor="input-principal" className="inline-block bg-main-blue hover:bg-light-blue text-white font-bold py-2 px-6 rounded cursor-pointer transition-colors shadow-md mb-4">
                  Seleccionar Imagen Principal
                </label>
                
                {mainImagePreviewUrl && (
                  <div className="block relative border border-gray-300 rounded-lg overflow-hidden shadow-md bg-white max-w-sm">
                    <img src={mainImagePreviewUrl} alt="Vista previa principal" className="max-h-80 w-auto object-contain mx-auto" />
                    <div className="bg-main-blue text-white p-2 text-xs truncate text-center">
                      {imagenPrincipal ? imagenPrincipal.name : "Imagen Actual"}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t-2 border-pale-blue pt-6">
                <label className="block text-main-blue font-bold mb-2 text-lg">Imágenes Carrusel (Opcional)</label>
                <p className="text-sm text-light-blue mb-4">Agrega imágenes adicionales para la galería de la noticia. Se mostrarán en el orden de abajo.</p>
                
                <input type="file" accept="image/*" multiple onChange={handleAgregarImagenes} className="sr-only" id="input-carrusel" />
                <label htmlFor="input-carrusel" className="inline-block bg-light-blue hover:bg-main-blue text-white font-bold py-2 px-6 rounded cursor-pointer transition-colors shadow-md mb-2">
                  + Agregar Imágenes (Puedes seleccionar varias)
                </label>
                
                {carruselExistente.length > 0 && (
                  <div className="mt-4 flex flex-col gap-4">
                    <p className="text-xs font-bold text-bright-red uppercase">Imágenes Actuales (Ya subidas)</p>
                    {carruselExistente.map((url, index) => (
                      <div key={`old-${index}`} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 gap-4">
                        <div className="flex items-center gap-6 w-3/4">
                          <img src={url} alt="preview viejo" className="h-32 w-auto max-w-48 object-contain rounded border border-gray-200 shadow-sm shrink-0 bg-white" />
                          <span className="text-sm text-gray-500 font-medium">Imagen Existente</span>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => moverImagenExistente(index, -1)} disabled={index === 0} className="px-4 py-3 bg-main-blue hover:bg-light-blue text-white rounded text-sm disabled:opacity-30 font-extrabold shadow-sm">↑</button>
                          <button type="button" onClick={() => moverImagenExistente(index, 1)} disabled={index === carruselExistente.length - 1} className="px-4 py-3 bg-main-blue hover:bg-light-blue text-white rounded text-sm disabled:opacity-30 font-extrabold shadow-sm">↓</button>
                          <button type="button" onClick={() => eliminarImagenExistente(index)} className="px-4 py-3 bg-bright-red hover:bg-main-red text-white rounded text-sm ml-2 font-extrabold shadow-sm">X</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {imagenesCarrusel.length > 0 && (
                  <div className="mt-6 flex flex-col gap-4 border-t border-pale-blue pt-4">
                    <p className="text-xs font-bold text-green-600 uppercase">Nuevas Imágenes (Pendientes de subir)</p>
                    {imagenesCarrusel.map((file, index) => (
                      <div key={`new-${index}`} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-green-200 gap-4">
                        <div className="flex items-center gap-6 w-3/4">
                          <img src={URL.createObjectURL(file)} alt="preview nuevo" className="h-32 w-auto max-w-48 object-contain rounded border border-gray-200 shadow-sm shrink-0" />
                          <span className="text-sm text-gray-700 font-bold line-clamp-2">{file.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => moverImagenNueva(index, -1)} disabled={index === 0} className="px-4 py-3 bg-main-blue hover:bg-light-blue text-white rounded text-sm disabled:opacity-30 font-extrabold shadow-sm">↑</button>
                          <button type="button" onClick={() => moverImagenNueva(index, 1)} disabled={index === imagenesCarrusel.length - 1} className="px-4 py-3 bg-main-blue hover:bg-light-blue text-white rounded text-sm disabled:opacity-30 font-extrabold shadow-sm">↓</button>
                          <button type="button" onClick={() => eliminarImagenNueva(index)} className="px-4 py-3 bg-bright-red hover:bg-main-red text-white rounded text-sm ml-2 font-extrabold shadow-sm">X</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={loading} className={`flex-1 ${editandoId ? 'bg-main-red hover:bg-bright-red' : 'bg-main-blue hover:bg-light-blue'} text-white font-bold py-4 px-4 rounded transition-colors disabled:opacity-50 text-lg shadow-md`}>
                {loading ? "Procesando..." : (editandoId ? "Actualizar Noticia" : "Publicar Noticia")}
              </button>
              
              {editandoId && (
                <button type="button" onClick={cancelarEdicion} disabled={loading} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-4 px-8 rounded transition-colors disabled:opacity-50 text-lg shadow-md">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-main-blue mb-6 border-b pb-2">Gestionar Noticias Publicadas</h2>
          
          {listaNoticias.length === 0 ? (
            <p className="text-light-blue">No hay noticias publicadas.</p>
          ) : (
            <div className="space-y-4">
              {listaNoticias.map((noticia) => (
                <div key={noticia.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded border border-gray-200 gap-4">
                  <div className="flex items-center gap-4">
                    <img src={noticia.imagenPrincipalUrl} alt="Miniatura" className="w-16 h-16 object-cover rounded shadow-sm border border-gray-300" />
                    <div>
                      <h3 className="font-bold text-main-blue line-clamp-1">{noticia.titulo}</h3>
                      <p className="text-xs text-gray-500">
                        {noticia.fechaPublicacion ? new Date(noticia.fechaPublicacion.toDate()).toLocaleString() : "Sin fecha"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditarNoticia(noticia)}
                      className="bg-transparent border-2 border-main-blue text-main-blue hover:bg-main-blue hover:text-white px-4 py-2 rounded font-bold transition-colors text-sm w-full sm:w-auto"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleBorrarNoticia(noticia.id, noticia.titulo)}
                      className="bg-transparent border-2 border-bright-red text-bright-red hover:bg-bright-red hover:text-white px-4 py-2 rounded font-bold transition-colors text-sm w-full sm:w-auto"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}