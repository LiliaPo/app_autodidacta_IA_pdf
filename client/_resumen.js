import { marked } from 'marked'; // Importar la biblioteca marked

document.addEventListener('DOMContentLoaded', () => {
    const resumenDiv = document.getElementById('resumen');
    const tema = localStorage.getItem('tema');

    if (tema) {
        generarResumen(tema);
    } else {
        alert('No se ha especificado un tema. Volviendo a la página principal.');
        window.location.href = 'index.html';
    }

    async function generarResumen(tema) {
        try {
            const response = await fetch('/resumen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tema })
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            // Convertir el texto Markdown a HTML
            //const textMarkdown = "#Título\nTexto en **negrita**"
            const htmlContent = marked(data.resumen); // Convertir Markdown a HTML
            resumenDiv.innerHTML = htmlContent; // Insertar el HTML en el div
        } catch (error) {
            console.error('Error al generar el resumen:', error);
            alert('Hubo un error al generar el resumen: ' + error.message);
        }
    }
});
