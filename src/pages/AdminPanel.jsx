// src/pages/AdminPanel.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { signOut } from "firebase/auth";
import { auth, db, storage, functions } from "../firebase/config";
import { collection, addDoc, updateDoc, serverTimestamp, doc, deleteDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";

// CORRECCIÓN PROFESIONAL: Nombre exacto según el sistema de archivos
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

  // Referencia para simulación de desbordamiento de texto
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

  // Efecto dinámico para revisar límite de texto en portada
  useEffect(() => {
    const checkOverflow = () => {
      if (contenidoPreviewRef.current) {
        const { scrollHeight, clientHeight } = contenidoPreviewRef.current;
        setShowReadMoreWarning(scrollHeight > clientHeight + 2);
      }
    };
    checkOverflow();
  }, [contenido]);

  // Invocación a Gemini vía Cloud Functions
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
      console.error("Error:", error);
      setMensaje("Error al conectar con Gemini.");
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

  const handleSeleccionPrincipal = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenPrincipal(file);
      setMainImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAgregarImagenes = (e) => {
    const files = Array.from(e.target.files);
    setImagenesCarrusel((prev) => [...prev, ...files]);
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
        nuevasUrls.push(await getDownloadURL(refCar));
      }
      const datos = {
        titulo, resumen, contenido,
        imagenPrincipalUrl: finalPrincipalUrl,
        imagenesCarruselUrls: [...carruselExistente, ...nuevasUrls],
        fechaPublicacion: fechaPersonalizada ? Timestamp.fromDate(new Date(fechaPersonalizada)) : serverTimestamp(),
        activa: true
      };
      if (editandoId) await updateDoc(doc(db, "noticias", editandoId), datos);
      else await addDoc(collection(db, "noticias"), datos);
      
      cancelarEdicion();
      cargarNoticias();
      setMensaje("Proceso completado con éxito.");
    } catch (err) {
      console.error(err);
      setMensaje("Error al procesar la noticia.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-basic-beige">
      <header className="bg-white p-5 shadow-sm border-b border-gray-200 flex justify-between items-center px-8">
        <img src={logoColor} alt="Logo IIRESODH" className="h-12 md:h-14 w-auto object-contain" />
        <button onClick={handleLogout} className="bg-main-red hover:bg-bright-red text-white px-6 py-2 rounded-full font-bold shadow-sm">
          Cerrar Sesión
        </button>
      </header>

      <main className="p-8">
        <div className={`max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 ${editandoId ? 'border-main-red' : 'border-main-blue'}`}>
          <h1 className="text-3xl font-extrabold text-main-blue">Panel Administrativo</h1>
          <p className="text-light-blue">{editandoId ? "Modo Edición Activo" : "Gestión de Noticias"}</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mb-12 border-t-4 border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className={`text-2xl font-bold ${editandoId ? 'text-main-red' : 'text-main-blue'}`}>
              {editandoId ? "Editar Noticia" : "Crear Nueva Noticia"}
            </h2>
            {editandoId && <button onClick={cancelarEdicion} className="text-sm bg-gray-200 px-3 py-1 rounded font-bold">Cancelar Edición</button>}
          </div>
          
          {mensaje && <div className={`p-4 rounded mb-6 font-bold ${mensaje.includes("éxito") ? "bg-green-100 text-green-700" : "bg-blue-100 text-main-blue"}`}>{mensaje}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full border p-3 rounded" placeholder="Título de la noticia" />
            <input type="datetime-local" value={fechaPersonalizada} onChange={(e) => setFechaPersonalizada(e.target.value)} className="w-full md:w-1/2 border p-3 rounded" />
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-main-blue">Resumen</label>
                <button type="button" onClick={handleAutoResumen} disabled={generandoResumen} className="text-xs bg-main-blue text-white px-4 py-2 rounded-full font-bold">
                  {generandoResumen ? "Generando..." : "✨ Generar con IA"}
                </button>
              </div>
              <textarea required value={resumen} onChange={(e) => setResumen(e.target.value)} className="w-full border p-3 rounded" rows="2" />
            </div>

            <textarea required value={contenido} onChange={(e) => setContenido(e.target.value)} className="w-full border p-3 rounded" rows="12" placeholder="Contenido completo..." />

            <div className="mt-4 bg-gray-50 p-5 rounded border border-gray-200 shadow-inner">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Simulación en Portada</label>
              <div ref={contenidoPreviewRef} className="text-gray-600 text-lg font-light leading-relaxed noticia-content max-h-80 overflow-hidden bg-white p-5 rounded" dangerouslySetInnerHTML={{ __html: contenido || "Escribe para previsualizar..." }} />
              <div className="mt-4">{showReadMoreWarning ? <p className="text-main-red font-bold text-sm">⚠️ Texto excedido.</p> : <p className="text-green-600 font-bold text-sm">✓ Texto encaja.</p>}</div>
            </div>

            <div className="grid grid-cols-1 gap-6 bg-basic-beige p-6 rounded border-2 border-pale-blue">
              <input type="file" accept="image/*" onChange={handleSeleccionPrincipal} className="sr-only" id="input-p" />
              <label htmlFor="input-p" className="bg-main-blue text-white px-6 py-2 rounded font-bold cursor-pointer inline-block">Seleccionar Imagen Principal</label>
              {mainImagePreviewUrl && <img src={mainImagePreviewUrl} alt="Preview" className="max-h-60 rounded shadow-md mx-auto block" />}

              <input type="file" accept="image/*" multiple onChange={handleAgregarImagenes} className="sr-only" id="input-c" />
              <label htmlFor="input-c" className="bg-light-blue text-white px-6 py-2 rounded font-bold cursor-pointer inline-block mt-4">+ Cargar Carrusel (Múltiple)</label>
              
              <div className="grid gap-3">
                {carruselExistente.map((url, i) => (
                  <div key={i} className="flex items-center justify-between bg-white p-2 rounded border">
                    <img src={url} className="h-16 rounded" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => moverImagenExistente(i, -1)} className="px-3 py-1 bg-main-blue text-white rounded">↑</button>
                      <button type="button" onClick={() => moverImagenExistente(i, 1)} className="px-3 py-1 bg-main-blue text-white rounded">↓</button>
                      <button type="button" onClick={() => setCarruselExistente(prev => prev.filter((_, idx) => idx !== i))} className="px-3 py-1 bg-bright-red text-white rounded">X</button>
                    </div>
                  </div>
                ))}
                {imagenesCarrusel.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-green-50 p-2 rounded border">
                    <img src={URL.createObjectURL(f)} className="h-16 rounded" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => moverImagenNueva(i, -1)} className="px-3 py-1 bg-main-blue text-white rounded">↑</button>
                      <button type="button" onClick={() => moverImagenNueva(i, 1)} className="px-3 py-1 bg-main-blue text-white rounded">↓</button>
                      <button type="button" onClick={() => setImagenesCarrusel(prev => prev.filter((_, idx) => idx !== i))} className="px-3 py-1 bg-bright-red text-white rounded">X</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-main-blue text-white font-bold py-4 rounded uppercase tracking-widest transition-all">
              {loading ? "Procesando..." : (editandoId ? "Actualizar" : "Publicar")}
            </button>
          </form>
        </div>

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border-t-4 border-main-blue">
          <h2 className="text-2xl font-bold text-main-blue mb-6 border-b pb-2">Gestión de Noticias</h2>
          <div className="space-y-4">
            {listaNoticias.map((n) => (
              <div key={n.id} className="flex items-center justify-between bg-gray-50 p-4 rounded border">
                <div className="flex items-center gap-4">
                  <img src={n.imagenPrincipalUrl} className="w-12 h-12 object-cover rounded" />
                  <h3 className="font-bold text-main-blue line-clamp-1">{n.titulo}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditarNoticia(n)} className="border-2 border-main-blue text-main-blue px-4 py-1 rounded font-bold text-sm">Editar</button>
                  <button onClick={() => handleBorrarNoticia(n.id, n.titulo)} className="border-2 border-bright-red text-bright-red px-4 py-1 rounded font-bold text-sm">Borrar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}