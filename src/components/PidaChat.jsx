// src/components/PidaChat.jsx
import { useState, useRef, useEffect } from "react";
import pidaImg from "../assets/PIDA_bot.webp"; 
import { functions } from "../firebase/config";
import { httpsCallable } from "firebase/functions";

export default function PidaChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [mensajes, setMensajes] = useState([
    { text: "¡Hola! Soy PIDA, el asistente virtual de IIRESODH. ¿En qué te puedo ayudar hoy?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes, escribiendo, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const textoUsuario = input.trim();
    
    // 1. Clonamos el historial actual sin el saludo inicial para no confundir a la IA
    const historialParaEnviar = mensajes.slice(1);

    // 2. Agregamos el mensaje del usuario a la pantalla
    const nuevoMensaje = { text: textoUsuario, isBot: false };
    setMensajes((prev) => [...prev, nuevoMensaje]);
    setInput("");
    setEscribiendo(true);

    // 3. CONEXIÓN REAL CON PIDA (FIREBASE -> GEMINI)
    try {
      const charlarConPida = httpsCallable(functions, 'chatPida');
      const resultado = await charlarConPida({ 
        mensaje: textoUsuario,
        historial: historialParaEnviar 
      });
      
      setMensajes((prev) => [...prev, { text: resultado.data.respuesta, isBot: true }]);
    } catch (error) {
      console.error("Error consultando a PIDA:", error);
      setMensajes((prev) => [...prev, { text: "Ups, tuve un pequeño mareo en mis circuitos. ¿Puedes intentar de nuevo?", isBot: true }]);
    } finally {
      setEscribiendo(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button 
          onClick={toggleChat}
          className="relative group flex flex-col items-center justify-center w-24 h-16 bg-white rounded-full shadow-2xl hover:shadow-main-red/30 hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden p-2"
          aria-label="Abrir asistente PIDA"
        >
          <img src={pidaImg} alt="PIDA Bot" className="w-12 h-12 object-contain mt-1 drop-shadow-sm" />
          <div className="absolute inset-0 bg-linear-to-tr from-main-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      )}

      {isOpen && (
        <div className="flex flex-col w-80 sm:w-96 max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up">
          <div className="bg-main-red p-4 flex items-center justify-between text-white shadow-md z-10 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-white/20">
                <img src={pidaImg} alt="PIDA Avatar" className="w-8 h-8 object-contain mt-1" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">PIDA</h3>
                <p className="text-xs text-white/80">Asistente Virtual IIRESODH</p>
              </div>
            </div>
            <button onClick={toggleChat} className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer" aria-label="Cerrar chat">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3 min-h-75 custom-scrollbar">
            {mensajes.map((msg, index) => (
              <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-line ${
                  msg.isBot 
                    ? 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm' 
                    : 'bg-main-blue text-white rounded-tr-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {escribiendo && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleEnviar} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje aquí..." 
              className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-main-red/20 focus:border-main-red transition-all duration-200"
            />
            <button 
              type="submit"
              disabled={!input.trim() || escribiendo}
              className="bg-main-red text-white p-2.5 rounded-xl hover:bg-red-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer flex items-center justify-center shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}