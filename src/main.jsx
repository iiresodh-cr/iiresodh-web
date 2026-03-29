import React from 'react'
import ReactDOM from 'react-dom/client'
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