import React from 'react'
import ReactDOM from 'react-dom/client'

// Fuentes autoalojadas (Work Sans)
import '@fontsource/work-sans/300.css'
import '@fontsource/work-sans/400.css'
import '@fontsource/work-sans/500.css'
import '@fontsource/work-sans/600.css'
import '@fontsource/work-sans/700.css'
import '@fontsource/work-sans/800.css'

import App from './App.jsx'
import './index.css' // <-- Tailwind carga al final

// Importaciones de MUI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { StyledEngineProvider } from '@mui/material/styles';

// Creamos el tema institucional de IIRESODH
const iiresodhTheme = createTheme({
  palette: {
    primary: { main: '#1D3557' }, // main-blue
    secondary: { main: '#B92F32' }, // main-red
    info: { main: '#457B9D' }, // light-blue
  },
  typography: {
    fontFamily: '"Work Sans", sans-serif',
  },
  shape: {
    borderRadius: 12, 
  },
});

// IMPORTAR CONFIGURACIÓN DE IDIOMAS AQUÍ
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* injectFirst asegura que Tailwind pueda sobrescribir a MUI si es necesario */}
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={iiresodhTheme}>
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>,
)