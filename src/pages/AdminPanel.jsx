// src/pages/AdminPanel.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { signOut } from "firebase/auth";
import { auth, db, storage } from "../firebase/config";
import { collection, addDoc, updateDoc, serverTimestamp, doc, deleteDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import logo from "../assets/logo.png";

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
  const [mensaje, setMensaje] = useState("");
  const [listaNoticias, setListaNoticias] = useState([]);

  // --- LÓGICA DE CERRAR SESIÓN ARREGLADA ---
  const handleLogout = () => {
    // 1. Primero navegamos fuera de la ruta protegida hacia el inicio
    navigate("/"); 
    
    // 2. Le damos a React 100 milisegundos para cambiar de página antes de destruir la sesión
    setTimeout(() => {
      signOut(auth).catch((error) => console.error("Error al cerrar sesión:", error));
    }, 100);
  };
  // ------------------------------------------

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

  const handleEditarNoticia = (noticia) => {
    setEditandoId(noticia.id);
    setTitulo(noticia.titulo);
    setResumen(noticia.resumen);
    setContenido(noticia.contenido);

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

  const handleAgregarImagen = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenesCarrusel([...imagenesCarrusel, file]);
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
    <div className="min-h-screen bg-[#F1FAEE]">
      <header className="bg-[#1D3557] p-5 shadow-md flex justify-between items-center px-8">
        <img src={logo} alt="Logo IIRESODH" className="h-[50px] md:h-[60px] w-auto max-w-[330px]" />
        <button onClick={handleLogout} className="bg-[#E63946] hover:bg-[#B92F32] text-white px-5 py-2 rounded font-bold transition-colors shadow-sm">
          Cerrar Sesión
        </button>
      </header>

      <main className="p-8">
        <div className={`max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 ${editandoId ? 'border-[#B92F32]' : 'border-[#1D3557]'}`}>
          <h1 className="text-3xl font-extrabold text-[#1D3557]">Panel Administrativo</h1>
          <p className="text-[#457B9D]">{editandoId ? "Modo Edición: Actualizando registro existente" : "Gestión y Publicación de Noticias IIRESODH"}</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mb-12 border-t-4 border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className={`text-2xl font-bold ${editandoId ? 'text-[#B92F32]' : 'text-[#1D3557]'}`}>
              {editandoId ? "Editar Noticia" : "Crear Nueva Noticia"}
            </h2>
            {editandoId && (
              <span className="bg-[#B92F32] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                Modo Edición
              </span>
            )}
          </div>
          
          {mensaje && (
            <div className={`p-4 rounded mb-6 font-bold ${mensaje.includes("éxito") || mensaje.includes("eliminada") ? "bg-green-100 text-green-700" : "bg-blue-100 text-[#1D3557]"}`}>
              {mensaje}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[#1D3557] font-bold mb-2">Título de la Noticia</label>
                <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#457B9D]" placeholder="Ej. Nuevo acuerdo..." />
              </div>

              <div className="md:col-span-2 bg-[#F1FAEE] p-4 rounded border border-[#A8DADC]">
                <label className="block text-[#1D3557] font-bold mb-1">Fecha y Hora de Publicación (Opcional)</label>
                <p className="text-xs text-[#457B9D] mb-3">Si dejas este campo en blanco, se usará la fecha y hora exacta de este momento.</p>
                <input type="datetime-local" value={fechaPersonalizada} onChange={(e) => setFechaPersonalizada(e.target.value)} className="w-full md:w-1/2 border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#457B9D] bg-white" />
              </div>
            </div>

            <div>
              <label className="block text-[#1D3557] font-bold mb-2">Resumen (Para la portada)</label>
              <textarea required maxLength="200" value={resumen} onChange={(e) => setResumen(e.target.value)} className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#457B9D]" rows="2" placeholder="Texto corto..."></textarea>
            </div>

            <div>
              <label className="block text-[#1D3557] font-bold mb-2">Contenido Completo</label>
              <textarea required value={contenido} onChange={(e) => setContenido(e.target.value)} className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#457B9D]" rows="12" placeholder="Todo el desarrollo..."></textarea>
            </div>

            <div className="grid grid-cols-1 gap-6 bg-[#F1FAEE] p-6 rounded border-2 border-[#A8DADC]">
              <div>
                <label className="block text-[#1D3557] font-bold mb-2 text-lg">
                  Imagen Principal {editandoId ? "(Sube una nueva solo si quieres reemplazarla)" : "(Obligatoria)"}
                </label>
                <input type="file" accept="image/*" required={!editandoId && !imagenPrincipalAnterior} onChange={handleSeleccionPrincipal} className="w-full text-sm mb-4" />
                
                {mainImagePreviewUrl && (
                  <div className="inline-block relative border border-gray-300 rounded-lg overflow-hidden shadow-md bg-white">
                    <img src={mainImagePreviewUrl} alt="Vista previa principal" className="max-h-80 w-auto object-contain" />
                    <div className="bg-[#1D3557] text-white p-2 text-xs truncate text-center">
                      {imagenPrincipal ? imagenPrincipal.name : "Imagen Actual"}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t-2 border-[#A8DADC] pt-6">
                <label className="block text-[#1D3557] font-bold mb-2 text-lg">Imágenes Carrusel (Opcional)</label>
                <p className="text-sm text-[#457B9D] mb-4">Agrega imágenes adicionales para la galería de la noticia. Se mostrarán en el orden de abajo.</p>
                
                <input type="file" accept="image/*" onChange={handleAgregarImagen} className="hidden" id="input-carrusel" />
                <label htmlFor="input-carrusel" className="inline-block bg-[#457B9D] hover:bg-[#1D3557] text-white font-bold py-2 px-6 rounded cursor-pointer transition-colors shadow-md mb-2">
                  + Agregar Nueva Imagen
                </label>
                
                {carruselExistente.length > 0 && (
                  <div className="mt-4 flex flex-col gap-4">
                    <p className="text-xs font-bold text-[#E63946] uppercase">Imágenes Actuales (Ya subidas)</p>
                    {carruselExistente.map((url, index) => (
                      <div key={`old-${index}`} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 gap-4">
                        <div className="flex items-center gap-6 w-3/4">
                          <img src={url} alt="preview viejo" className="h-32 w-auto max-w-[12rem] object-contain rounded border border-gray-200 shadow-sm flex-shrink-0 bg-white" />
                          <span className="text-sm text-gray-500 font-medium">Imagen Existente</span>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => moverImagenExistente(index, -1)} disabled={index === 0} className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded text-sm disabled:opacity-30 font-extrabold">↑</button>
                          <button type="button" onClick={() => moverImagenExistente(index, 1)} disabled={index === carruselExistente.length - 1} className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded text-sm disabled:opacity-30 font-extrabold">↓</button>
                          <button type="button" onClick={() => eliminarImagenExistente(index)} className="px-4 py-3 bg-[#E63946] hover:bg-[#B92F32] text-white rounded text-sm ml-2 font-extrabold">X</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {imagenesCarrusel.length > 0 && (
                  <div className="mt-6 flex flex-col gap-4 border-t border-[#A8DADC] pt-4">
                    <p className="text-xs font-bold text-green-600 uppercase">Nuevas Imágenes (Pendientes de subir)</p>
                    {imagenesCarrusel.map((file, index) => (
                      <div key={`new-${index}`} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-green-200 gap-4">
                        <div className="flex items-center gap-6 w-3/4">
                          <img src={URL.createObjectURL(file)} alt="preview nuevo" className="h-32 w-auto max-w-[12rem] object-contain rounded border border-gray-200 shadow-sm flex-shrink-0" />
                          <span className="text-sm text-gray-700 font-bold line-clamp-2">{file.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => moverImagenNueva(index, -1)} disabled={index === 0} className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded text-sm disabled:opacity-30 font-extrabold">↑</button>
                          <button type="button" onClick={() => moverImagenNueva(index, 1)} disabled={index === imagenesCarrusel.length - 1} className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded text-sm disabled:opacity-30 font-extrabold">↓</button>
                          <button type="button" onClick={() => eliminarImagenNueva(index)} className="px-4 py-3 bg-[#E63946] hover:bg-[#B92F32] text-white rounded text-sm ml-2 font-extrabold">X</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={loading} className={`flex-1 ${editandoId ? 'bg-[#B92F32] hover:bg-[#E63946]' : 'bg-[#1D3557] hover:bg-[#457B9D]'} text-white font-bold py-4 px-4 rounded transition-colors disabled:opacity-50 text-lg shadow-md`}>
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
          <h2 className="text-2xl font-bold text-[#1D3557] mb-6 border-b pb-2">Gestionar Noticias Publicadas</h2>
          
          {listaNoticias.length === 0 ? (
            <p className="text-[#457B9D]">No hay noticias publicadas.</p>
          ) : (
            <div className="space-y-4">
              {listaNoticias.map((noticia) => (
                <div key={noticia.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded border border-gray-200 gap-4">
                  <div className="flex items-center gap-4">
                    <img src={noticia.imagenPrincipalUrl} alt="Miniatura" className="w-16 h-16 object-cover rounded shadow-sm border border-gray-300" />
                    <div>
                      <h3 className="font-bold text-[#1D3557] line-clamp-1">{noticia.titulo}</h3>
                      <p className="text-xs text-gray-500">
                        {noticia.fechaPublicacion ? new Date(noticia.fechaPublicacion.toDate()).toLocaleString() : "Sin fecha"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditarNoticia(noticia)}
                      className="bg-transparent border-2 border-[#1D3557] text-[#1D3557] hover:bg-[#1D3557] hover:text-white px-4 py-2 rounded font-bold transition-colors text-sm w-full sm:w-auto"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleBorrarNoticia(noticia.id, noticia.titulo)}
                      className="bg-transparent border-2 border-[#E63946] text-[#E63946] hover:bg-[#E63946] hover:text-white px-4 py-2 rounded font-bold transition-colors text-sm w-full sm:w-auto"
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