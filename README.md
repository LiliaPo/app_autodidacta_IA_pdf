# Learnify AI - Asistente de Estudio Interactivo

## Descripción
Learnify AI es una aplicación web que permite a los usuarios analizar documentos y generar resúmenes y tests de comprensión utilizando inteligencia artificial. La aplicación puede procesar diferentes tipos de documentos (PDF, Word, texto plano) y generar contenido educativo personalizado.

## Características Principales
- 📄 Procesamiento de múltiples formatos de documento
- 📝 Generación de resúmenes inteligentes
- ✍️ Creación de tests de comprensión
- 🎯 Análisis de contenido adaptativo
- 📊 Seguimiento del progreso

## Requisitos Previos
- Node.js (v14 o superior)
- MongoDB
- Cuenta en Groq AI (para la API de IA)

## Configuración del Entorno
1. Clonar el repositorio
2. Crear archivo `.env` en la raíz del proyecto con:
env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/app_nova
GROQ_API_KEY=tu_api_key_de_groq

## Instalación
bash
Instalar dependencias
npm install
Compilar el proyecto
npm run build
Iniciar en modo desarrollo
npm run dev
Iniciar en modo producción
npm start

## Estructura del Proyecto
README.md
app_nova/
├��─ backend/
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── services/
│ │ └── types/
├── frontend/
│ └── public/
│ ├── js/
│ └── styles/
└── uploads/

## Uso
1. Acceder a `http://localhost:3000`
2. Subir un documento o introducir un tema
3. Seleccionar la acción deseada (resumen o test)
4. Esperar la generación del contenido

## Limitaciones
- Tamaño máximo de archivo: 50MB
- Formatos soportados: PDF, DOCX, TXT
- Rate limits de la API de Groq: 5000 tokens/minuto

## Solución de Problemas
- Si aparece "Request is not eligible for file upload", verificar el formato del archivo
- Si hay errores de rate limit, esperar unos segundos y reintentar
- Para problemas con MongoDB, verificar la conexión y credenciales

## Contribuir
1. Fork del repositorio
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

