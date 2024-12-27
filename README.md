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
