// src/components/PidaChat.jsx
import { useState, useRef, useEffect, useMemo } from "react";
import pidaImg from "../assets/IRENE-80.webp"; 
import { functions } from "../firebase/config";
import { httpsCallable } from "firebase/functions";

// Importaciones de MUI
import { Paper, InputBase, IconButton, Tooltip, Button, Zoom } from '@mui/material';

// IMPORTACIÓN PARA i18n
import { useTranslation } from 'react-i18next';

export default function PidaChat() {
  const { t } = useTranslation(); 

  const MENSAJE_INICIAL = useMemo(() => ({ 
    text: t('irene.saludo_inicial', '¡Hola! Soy IRENE, asistente virtual de IIRESODH. ¿En qué te puedo ayudar hoy?'), 
    isBot: true 
  }), [t]);

  const [isOpen, setIsOpen] = useState(false);
  
  // MEMORIA: Inicializamos leyendo de sessionStorage
  const [mensajes, setMensajes] = useState(() => {
    const chatGuardado = sessionStorage.getItem("pidaChatHistorial");
    return chatGuardado ? JSON.parse(chatGuardado) : [MENSAJE_INICIAL];
  });
  
  const [input, setInput] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Guardamos cada actualización del chat
  useEffect(() => {
    sessionStorage.setItem("pidaChatHistorial", JSON.stringify(mensajes));
  }, [mensajes]);

  // Si cambia el idioma y el chat solo tiene el saludo inicial, actualizamos el saludo
  useEffect(() => {
    if (mensajes.length === 1 && mensajes[0].isBot) {
      setMensajes([MENSAJE_INICIAL]);
    }
  }, [MENSAJE_INICIAL]);

  // Auto-scroll al fondo
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes, escribiendo, isOpen]);

  // Auto-focus en el input
  useEffect(() => {
    if (isOpen && !escribiendo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [escribiendo, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  // Funciones para el Modal Interno
  const solicitarReinicio = () => setMostrarConfirmacion(true);
  
  const confirmarReinicio = () => {
    setMensajes([MENSAJE_INICIAL]);
    sessionStorage.removeItem("pidaChatHistorial");
    setMostrarConfirmacion(false);
  };

  const cancelarReinicio = () => setMostrarConfirmacion(false);

  // Formatear Negritas y URLs clicables
  const formatearMensaje = (texto) => {
    if (!texto) return "";
    
    // Esta expresión regular separa el texto cada vez que encuentra una URL (http/https) o texto en **negrita**
    const regex = /(https?:\/\/[^\s]+|\*\*.*?\*\*)/g;
    const partes = texto.split(regex);
    
    return partes.map((parte, i) => {
      if (parte.startsWith('**') && parte.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-900">{parte.slice(2, -2)}</strong>;
      }
      if (parte.match(/^https?:\/\//)) {
        return (
          <a 
            key={i} 
            href={parte} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-main-red hover:text-light-blue underline font-semibold break-all transition-colors"
          >
            {parte}
          </a>
        );
      }
      return <span key={i}>{parte}</span>;
    });
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const textoUsuario = input.trim();
    const historialParaEnviar = mensajes.slice(1);

    const nuevoMensaje = { text: textoUsuario, isBot: false };
    setMensajes((prev) => [...prev, nuevoMensaje]);
    setInput("");
    setEscribiendo(true);

    try {
      const charlarConPida = httpsCallable(functions, 'chatPida');
      const resultado = await charlarConPida({ 
        mensaje: textoUsuario,
        historial: historialParaEnviar 
      });
      
      setMensajes((prev) => [...prev, { text: resultado.data.respuesta, isBot: true }]);
    } catch (error) {
      console.error("Error consultando a PIDA:", error);
      setMensajes((prev) => [...prev, { text: t('irene.error_mensaje', 'Ups, tuve un pequeño mareo en mis circuitos. ¿Puedes intentar de nuevo?'), isBot: true }]);
    } finally {
      setEscribiendo(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* BOTÓN FLOTANTE (TOGGLE) CON MUI */}
      {!isOpen && (
        <Tooltip title={t('irene.tooltip_abrir', 'Chatea con IRENE')} placement="left" arrow TransitionComponent={Zoom}>
          <Paper 
            component="button"
            onClick={toggleChat}
            elevation={4}
            aria-label="Abrir asistente IRENE"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 96,
              height: 64,
              borderRadius: 50,
              bgcolor: 'white',
              border: '1px solid #f3f4f6',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 15px -3px rgba(185, 47, 50, 0.25)' // Sombra roja suave
              }
            }}
          >
            <img src={pidaImg} alt="PIDA Bot" className="w-12 h-12 object-contain mt-1 drop-shadow-sm" />
          </Paper>
        </Tooltip>
      )}

      {/* VENTANA DE CHAT */}
      {isOpen && (
        <Paper 
          elevation={12} 
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            width: { xs: 320, sm: 384 },
            maxHeight: '75vh',
            borderRadius: '16px',
            overflow: 'hidden',
            animation: 'fadeInUp 0.3s ease-out forwards',
            '@keyframes fadeInUp': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            }
          }}
        >
          {/* MODAL DE CONFIRMACIÓN INTERNO (Mantiene confinamiento para no romper el widget) */}
          {mostrarConfirmacion && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-blue-50 text-main-red rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('irene.modal_titulo', '¿Empezar de cero?')}</h3>
              <p className="text-sm text-gray-500 mb-6">
                {t('irene.modal_desc', 'IRENE olvidará la conversación actual y comenzarán una nueva.')}
              </p>
              <div className="flex gap-3 w-full">
                <Button 
                  onClick={cancelarReinicio} 
                  variant="outlined" 
                  color="inherit" 
                  fullWidth 
                  sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, py: 1 }}
                >
                  {t('irene.btn_cancelar', 'Cancelar')}
                </Button>
                <Button 
                  onClick={confirmarReinicio} 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, py: 1, boxShadow: 'none' }}
                >
                  {t('irene.btn_reiniciar', 'Sí, reiniciar')}
                </Button>
              </div>
            </div>
          )}

          {/* CABECERA */}
          <div className="bg-main-red p-4 flex items-center justify-between text-white shadow-md z-10 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-white/20">
                <img src={pidaImg} alt="PIDA Avatar" className="w-8 h-8 object-contain mt-1" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">IRENE</h3>
                <p className="text-xs text-white/80">Asistente Virtual IIRESODH</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Tooltip title={t('irene.tooltip_reiniciar', 'Reiniciar conversación')} arrow>
                <IconButton 
                  onClick={solicitarReinicio} 
                  size="small"
                  aria-label="Reiniciar chat"
                  sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.2)' } }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                </IconButton>
              </Tooltip>
              
              <Tooltip title={t('irene.tooltip_cerrar', 'Cerrar chat')} arrow>
                <IconButton 
                  onClick={toggleChat} 
                  size="small"
                  aria-label="Cerrar chat"
                  sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {/* ÁREA DE MENSAJES */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3 min-h-75 custom-scrollbar">
            {mensajes.map((msg, index) => (
              <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-line ${
                  msg.isBot 
                    ? 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm leading-relaxed' 
                    : 'bg-main-red text-white rounded-tr-sm leading-relaxed'
                }`}>
                  {formatearMensaje(msg.text)}
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

          {/* FORMULARIO DE ENVÍO CON MUI */}
          <Paper
            component="form"
            onSubmit={handleEnviar}
            elevation={0}
            sx={{
              p: 1.5, 
              display: 'flex', 
              gap: 1, 
              alignItems: 'center',
              borderTop: '1px solid #F3F4F6', 
              borderRadius: 0, 
              bgcolor: 'white'
            }}
          >
            <InputBase
              inputRef={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('irene.input_placeholder', 'Escribe tu mensaje aquí...')}
              disabled={escribiendo}
              sx={{
                flex: 1, 
                bgcolor: '#F9FAFB', 
                border: '1px solid #E5E7EB',
                borderRadius: '12px', 
                px: 2, 
                py: 1, 
                fontSize: '0.875rem',
                fontFamily: '"Work Sans", sans-serif',
                transition: 'all 0.2s ease-in-out',
                '&.Mui-focused': { 
                  bgcolor: 'white', 
                  borderColor: '#B92F32', 
                  boxShadow: '0 0 0 2px rgba(185, 47, 50, 0.1)' 
                }
              }}
            />
            <IconButton
              type="submit"
              disabled={!input.trim() || escribiendo}
              color="secondary" 
              sx={{
                bgcolor: 'secondary.main', 
                color: 'white', 
                borderRadius: '12px', 
                p: 1.5,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#9B2527', transform: 'scale(1.05)' },
                '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' }
              }}
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </IconButton>
          </Paper>
        </Paper>
      )}
    </div>
  );
}