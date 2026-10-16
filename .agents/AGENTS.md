# REGLAS Y DIRECTRICES OBLIGATORIAS DEL PROYECTO

## 0. ARQUITECTURA GLOBAL DEL SITIO WEB Y CONTEXTO
- **PLATAFORMA INSTITUCIONAL AMPLIA:** El proyecto es un portal web institucional integral de gran envergadura (Home, Quiénes Somos, Equipo, Litigio Estratégico, Artículos Académicos, Informes Anuales, Noticias, Tienda, Incidencia, Página País, PIDA, AdminPanel, etc.).
- **AISLAMIENTO DE EVENTOS / LANDINGS PARTICULARES:** La página del Curso de Palermo (`CursoLanding.jsx`) es únicamente una landing page puntual para un evento particular. Cualquier cambio, ajuste o regla aplicada a este curso debe mantenerse estrictamente circunscrito a dicho evento y NO extrapolarse ni alterar las demás áreas, páginas o componentes globales del sitio web.

## 1. CONTROL ESTRICTO DE CAMBIOS Y APROBACIÓN PREVIA
- **PROHIBICIÓN TOTAL DE DECISIONES AUTÓNOMAS:** El asistente tiene estrictamente prohibido tomar decisiones de diseño, cambios de color, modificación de tipografías, alteración de componentes o cualquier cambio que no haya sido solicitado de forma explícita y literal por el usuario.
- **CONSULTA Y APROBACIÓN OBLIGATORIA:** Antes de implementar cualquier cambio colateral, alternativa de diseño o modificación adicional, se DEBE consultar primero al usuario y esperar su aprobación expresa.
- **ALCANCE QUIRÚRGICO:** Todas las modificaciones deben limitarse exclusivamente al elemento exacto que el usuario pidió cambiar, sin tocar, alterar ni "asumir" mejoras en otros elementos que no fueron objeto de la petición.

## 2. COMPONENTES Y DISEÑO
- Respetar los colores, tipografías, estilos y estructuras existentes de los componentes, títulos y tarjetas.
- Si el usuario solicita un ajuste sobre un elemento específico (por ejemplo, una imagen de fondo), NO modificar los textos, colores ni las tarjetas circundantes a menos que el usuario lo pida explícitamente.

## 3. REPOSITORIO Y DIRECTORIO ÚNICO DE TRABAJO (CRÍTICO)
- **UN SOLO REPOSITORIO LOCAL:** El único directorio de trabajo oficial del proyecto es el original completo:
  `C:\Users\durquilla\Documentos\PROYECTOS DESARROLLO\IIRESODH-WEB\iiresodh-web`
- Todas las lecturas, ediciones, comandos, despliegues y verificaciones deben realizarse única y exclusivamente dentro del repositorio oficial original.

## 4. ESTÁNDARES DE DISEÑO UI/UX Y ESTÉTICA INSTITUCIONAL
- **DISEÑO EJECUTIVO Y ACADÉMICO:** Tratar todos los componentes con nivel de diseño UI/UX senior acorde al prestigio de una institución académica jurídica internacional (IIRESODH / UNLP).
- **COLORES SOBRIOS, NO SATURADOS:** Evitar colores estridentes tipo "juguete", fluorescentes o hiper-saturados. Usar tonos armónicos, fondos limpios (base blanca o sutil matiz) y bordes finos de 1px con sombras suaves (`shadow-xs` / `hover:shadow-md`).
- **NO EMOJIS EN ELEMENTOS FORMALES:** No emplear emojis crudos en botones o encabezados de formularios; usar iconos vectoriales SVG estilizados y minimalistas.
- **PALETA DE LAS TARJETAS DE ADMISIÓN (CURSO PALERMO):**
  - **Manifestar Interés:** Verde bosque / esmeralda institucional sobrio (`#065f46`, hover `#047857`, borde fino `border-emerald-200/90`).
  - **Pagar e Inscribirme Ahora:** Celeste / azul cerúleo sobrio y confiable (`#0284c7`, hover `#0369a1`, borde fino `border-sky-200/90`, activo `ring-3 ring-sky-100`).

## 5. DIRECTRICES FUNCIONALES DE LA LANDING DE PALERMO
- **Admisión en 2 Etapas:**
  1. Paso 1 visible inicialmente (datos del participante).
  2. Dos opciones de acción: *Manifestar Interés* (confirmación y botón "Entendido" que regresa a la pestaña "Sobre el Curso") y *Pagar e Inscribirme Ahora* (despliega términos clickwrap, cuotas y pasarela de pago).
- **Contacto en Bloque Hero:**
  - Texto *"Solicita más información:"* acompañado de dos botones diferenciados: **WhatsApp** y **Email** hacia `cursos@iiresodh.org`.
- **Galería Multimedia:**
  - Ubicada antes del footer, horizontal, con visor Lightbox a pantalla completa y soporte de fotos y videos gestionables desde `AdminPanel.jsx`.
