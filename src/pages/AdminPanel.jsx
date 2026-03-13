// src/pages/AdminPanel.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { signOut } from "firebase/auth";
import { auth, db, storage, functions } from "../firebase/config";
import { collection, addDoc, updateDoc, serverTimestamp, doc, deleteDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";

// Importamos el logo oficial recortado en formato PNG
import logoColor from "../assets/Logo_Oficial_200w-trim.png";

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

  // Función para autogenerar resumen utilizando Google Gemini vía Cloud Functions
  const handleAutoResumen = async () => {
    if (!contenido || contenido.trim().length < 20) {
      setMensaje("Escribe el contenido de la noticia antes de generar un resumen.");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    setGenerandoResumen(true);
    setMensaje("Consultando a Gemini...");
    
    try {
      const generarResumen = httpsCallable(functions, 'generarResumenGemini');
      const resultado = await generarResumen({ contenido });
      
      if (resultado.data && resultado.data.resumen) {
        setResumen(resultado.data.resumen);
        setMensaje("✨ Resumen inteligente generado.");
      } else {
        throw new Error("Respuesta de IA no válida.");
      }
    } catch (error) {
      console.error("Error al generar resumen:", error);
      setMensaje("Error al conectar con Gemini. Verifica el despliegue de la función.");
    } finally {
      setGenerandoResumen(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  // Lógica para cargar los datos en el formulario para editar
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
    setMensaje(editandoId ? "Actualizando noticia..." : "Publicando noticia...");

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
      console.error("Error al procesar: ", error);
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
              <button onClick={cancelarEdicion} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded transition-colors">
                Cancelar Edición
              </button>
            )}
          </div>
          
          {mensaje && (
            <div className={`p-4 rounded mb-6 font-bold ${mensaje.includes("éxito") ? "bg-green-100 text-green-700" : "bg-blue-100 text-main-blue"}`}>
              {mensaje}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-main-blue font-bold mb-2">Título de la Noticia</label>
                <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-light-blue" />
              </div>

              <div className="md:col-span-2 bg-basic-beige p-4 rounded border border-pale-blue">
                <label className="block text-main-blue font-bold mb-1">Fecha y Hora de Publicación (Opcional)</label>
                <input type="datetime-local" value={fechaPersonalizada} onChange={(e) => setFechaPersonalizada(e.target.value)} className="w-full md:w-1/2 border border-gray-300 p-3 rounded bg-white" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-main-blue font-bold">Resumen para Portada</label>
                <button type="button" onClick={handleAutoResumen} disabled={generandoResumen} className="text-xs bg-main-blue text-white hover:bg-light-blue font-bold py-2 px-4 rounded-full transition-colors disabled:opacity-50 flex items-center gap-2">
                  {generandoResumen ? "Generando..." : "✨ Generar con IA"}
                </button>
              </div>
              <textarea required maxLength="250" value={resumen} onChange={(e) => setResumen(e.target.value)} className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-light-blue" rows="2" />
            </div>

            <div>
              <label className="block text-main-blue font-bold mb-2">Contenido Completo</label>
              <textarea required value={contenido} onChange={(e) => setContenido(e.target.value)} className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-light-blue" rows="12" />
              
              <div className="mt-4 bg-gray-50 p-5 rounded border border-gray-200 shadow-inner">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Simulación en Portada Principal</label>
                <div ref={contenidoPreviewRef} className="text-gray-600 text-lg font-light leading-relaxed noticia-content max-h-80 overflow-hidden bg-white p-5 rounded" dangerouslySetInnerHTML={{ __html: contenido || "Escribe para previsualizar..." }} />
                <div className="mt-4">
                  {showReadMoreWarning ? (
                    <p className="text-main-red font-bold text-sm">⚠️ El texto superó el límite. Se mostrará botón de "Leer más".</p>
                  ) : (
                    <p className="text-green-600 font-bold text-sm">✓ El texto cabe perfectamente.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 bg-basic-beige p-6 rounded border-2 border-pale-blue">
              <div>
                <label className="block text-main-blue font-bold mb-2 text-lg">Imagen Principal</label>
                <input type="file" accept="image/*" required={!editandoId && !imagenPrincipalAnterior} onChange={handleSeleccionPrincipal} className="sr-only" id="input-principal" />
                <label htmlFor="input-principal" className="inline-block bg-main-blue hover:bg-light-blue text-white font-bold py-2 px-6 rounded cursor-pointer shadow-md mb-4">Seleccionar Imagen Principal</label>
                {mainImagePreviewUrl && <img src={mainImagePreviewUrl} alt="Preview" className="max-h-60 rounded shadow-md mx-auto block" />}
              </div>
              
              <div className="border-t-2 border-pale-blue pt-6">
                <label className="block text-main-blue font-bold mb-2 text-lg">Imágenes Carrusel</label>
                <input type="file" accept="image/*" multiple onChange={handleAgregarImagenes} className="sr-only" id="input-carrusel" />
                <label htmlFor="input-carrusel" className="inline-block bg-light-blue hover:bg-main-blue text-white font-bold py-2 px-6 rounded cursor-pointer shadow-md mb-4">+ Agregar Múltiples Imágenes</label>
                
                <div className="grid grid-cols-1 gap-3">
                  {carruselExistente.map((url, index) => (
                    <div key={`old-${index}`} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                      <img src={url} className="h-20 w-auto rounded" alt="Existente" />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => moverImagenExistente(index, -1)} disabled={index === 0} className="px-3 py-1 bg-main-blue text-white rounded">↑</button>
                        <button type="button" onClick={() => moverImagenExistente(index, 1)} disabled={index === carruselExistente.length - 1} className="px-3 py-1 bg-main-blue text-white rounded">↓</button>
                        <button type="button" onClick={() => eliminarImagenExistente(index)} className="px-3 py-1 bg-bright-red text-white rounded">X</button>
                      </div>
                    </div>
                  ))}
                  {imagenesCarrusel.map((file, index) => (
                    <div key={`new-${index}`} className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200">
                      <img src={URL.createObjectURL(file)} className="h-20 w-auto rounded" alt="Nueva" />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => moverImagenNueva(index, -1)} disabled={index === 0} className="px-3 py-1 bg-main-blue text-white rounded">↑</button>
                        <button type="button" onClick={() => moverImagenNueva(index, 1)} disabled={index === imagenesCarrusel.length - 1} className="px-3 py-1 bg-main-blue text-white rounded">↓</button>
                        <button type="button" onClick={() => eliminarImagenNueva(index)} className="px-3 py-1 bg-bright-red text-white rounded">X</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-main-blue hover:bg-light-blue text-white font-bold py-4 rounded shadow-lg disabled:opacity-50 text-lg uppercase tracking-wider transition-all">
              {loading ? "Procesando..." : (editandoId ? "Actualizar Noticia" : "Publicar Noticia")}
            </button>
          </form>
        </div>

        {/* SECCIÓN DE GESTIÓN DE NOTICIAS PUBLICADAS (RESTAURADA) */}
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border-t-4 border-main-blue">
          <h2 className="text-2xl font-bold text-main-blue mb-6 border-b pb-2">Gestionar Noticias Publicadas</h2>
          {listaNoticias.length === 0 ? (
            <p className="text-light-blue">No hay noticias registradas.</p>
          ) : (
            <div className="space-y-4">
              {listaNoticias.map((noticia) => (
                <div key={noticia.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded border border-gray-200 gap-4 hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={noticia.imagenPrincipalUrl} alt="Mini" className="w-16 h-16 object-cover rounded shadow-sm border border-gray-300" />
                    <div>
                      <h3 className="font-bold text-main-blue line-clamp-1">{noticia.titulo}</h3>
                      <p className="text-xs text-gray-500">
                        {noticia.fechaPublicacion ? new Date(noticia.fechaPublicacion.toDate()).toLocaleString() : "Sin fecha"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditarNoticia(noticia)} className="bg-transparent border-2 border-main-blue text-main-blue hover:bg-main-blue hover:text-white px-4 py-2 rounded font-bold transition-all text-sm">
                      Editar
                    </button>
                    <button onClick={() => handleBorrarNoticia(noticia.id, noticia.titulo)} className="bg-transparent border-2 border-bright-red text-bright-red hover:bg-bright-red hover:text-white px-4 py-2 rounded font-bold transition-all text-sm">
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