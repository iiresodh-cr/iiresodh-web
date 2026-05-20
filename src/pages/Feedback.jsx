// src/pages/Feedback.jsx
import { useState, useEffect } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import PageHeader from "../components/PageHeader";

// UI Components
import AdminTextField from "../components/ui/AdminTextField";
import ToastAlert from "../components/ui/ToastAlert";
import { Button, Paper } from "@mui/material";

export default function Feedback() {
  const [nombre, setNombre] = useState("");
  const [observacion, setObservacion] = useState("");
  const [listaFeedback, setListaFeedback] = useState([]);
  const [estadoEnvio, setEstadoEnvio] = useState("idle");

  // Escuchar las observaciones en tiempo real
  useEffect(() => {
    const q = query(collection(db, "feedback_qa"), orderBy("fecha", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedbacks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListaFeedback(feedbacks);
    });

    return () => unsubscribe();
  }, []);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !observacion.trim()) return;

    setEstadoEnvio("enviando");
    try {
      await addDoc(collection(db, "feedback_qa"), {
        nombre: nombre.trim(),
        observacion: observacion.trim(),
        fecha: serverTimestamp(),
        estado: "Pendiente" 
      });
      
      setEstadoEnvio("exito");
      setObservacion(""); 
      setTimeout(() => setEstadoEnvio("idle"), 4000);
    } catch (error) {
      console.error("Error al guardar feedback:", error);
      setEstadoEnvio("error");
      setTimeout(() => setEstadoEnvio("idle"), 4000);
    }
  };

  // NUEVA FUNCIÓN: Cambiar de Pendiente a Cumplido
  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "Cumplido" ? "Pendiente" : "Cumplido";
    try {
      const docRef = doc(db, "feedback_qa", id);
      await updateDoc(docRef, { estado: nuevoEstado });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  // Formatear la fecha
  const formatearFecha = (timestamp) => {
    if (!timestamp) return "Justo ahora...";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('es-CR', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  return (
    <main className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden">
      <PageHeader 
        titulo="QA & Feedback Interno" 
        subtitulo="Ayúdanos a pulir los detalles antes del lanzamiento oficial." 
      />

      <div className="relative grow pb-20">
        <div className="bg-watermark" aria-hidden="true"></div>

        <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* FORMULARIO DE ENVÍO */}
            <div className="lg:col-span-5 sticky top-24">
              <div className="mb-6">
                <span className="text-main-red font-black tracking-[0.2em] uppercase text-xs mb-2 block">
                  Reportar Detalle
                </span>
                <h2 className="text-3xl font-black text-main-blue tracking-tight">
                  Nueva Observación
                </h2>
              </div>

              <Paper elevation={0} className="bg-gray-50 border border-gray-100 p-8 shadow-xl" sx={{ borderRadius: '24px' }}>
                <form onSubmit={handleEnviar} className="flex flex-col gap-6">
                  <AdminTextField 
                    label="Tu Nombre" 
                    placeholder="Ej. Carlos, Equipo Legal..."
                    required 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                  />
                  <AdminTextField 
                    label="¿Qué detalle encontraste?" 
                    placeholder="Ej. En la página de Litigio, el botón de 'Ver más' está roto en celular..."
                    required 
                    multiline 
                    rows={5} 
                    value={observacion} 
                    onChange={(e) => setObservacion(e.target.value)} 
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={estadoEnvio === "enviando"} 
                    sx={{ 
                      py: 1.5, 
                      borderRadius: '12px', 
                      fontWeight: 'bold', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em',
                      bgcolor: '#B92F32',
                      '&:hover': { bgcolor: '#9B2527' }
                    }}
                  >
                    {estadoEnvio === "enviando" ? "Guardando..." : "Enviar Observación"}
                  </Button>
                </form>
              </Paper>

              <ToastAlert open={estadoEnvio === "exito"} message="¡Observación registrada!" isError={false} onClose={() => setEstadoEnvio("idle")} />
              <ToastAlert open={estadoEnvio === "error"} message="Error de conexión." isError={true} onClose={() => setEstadoEnvio("idle")} />
            </div>

            {/* MURO DE OBSERVACIONES */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="mb-6 flex justify-between items-end border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-main-blue">
                  Registro del Equipo ({listaFeedback.length})
                </h3>
              </div>

              {listaFeedback.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-3xl p-12 text-center">
                  <p className="text-gray-400 font-medium text-lg">Aún no hay observaciones reportadas. ¡Todo parece perfecto!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {listaFeedback.map((item) => {
                    // Determinar colores según el estado
                    const esCumplido = item.estado === "Cumplido";
                    const colorBoton = esCumplido 
                      ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" 
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200";

                    return (
                      <div key={item.id} className={`bg-white border ${esCumplido ? 'border-green-100 opacity-60' : 'border-gray-100'} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all animate-fade-in-up`}>
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${esCumplido ? 'bg-green-50 text-green-600' : 'bg-main-blue/10 text-main-blue'}`}>
                              {item.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="block font-bold text-main-blue leading-none mb-1">{item.nombre}</span>
                              <span className="text-xs text-gray-400 font-medium">{formatearFecha(item.fecha)}</span>
                            </div>
                          </div>
                          
                          {/* ETIQUETA INTERACTIVA */}
                          <button 
                            onClick={() => toggleEstado(item.id, item.estado || "Pendiente")}
                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full cursor-pointer transition-colors border ${colorBoton}`}
                            title="Haz clic para cambiar el estado"
                          >
                            {item.estado || "Pendiente"}
                          </button>
                        </div>
                        <p className={`text-gray-700 font-light text-sm md:text-base whitespace-pre-wrap ml-13 ${esCumplido ? 'line-through text-gray-400' : ''}`}>
                          {item.observacion}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}