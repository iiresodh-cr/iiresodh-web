# Flujo de Trabajo y Despliegue de IIRESODH-WEB

## Regla Estricta de Despliegue
- **NUNCA** sugerir ni ejecutar comandos manuales de despliegue en local como `firebase deploy`.
- El despliegue se gestiona de forma automatizada mediante **GitHub Actions**:
  1. Los cambios se prueban y se hace commit/push a la rama **`develop`**.
  2. GitHub Actions procesa el despliegue automático del entorno `develop`.
  3. El usuario se encarga manualmente de hacer merge de `develop` hacia **`main`** para el pase a producción.
