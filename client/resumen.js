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
            resumenDiv.innerHTML = `<h2>Resumen de ${tema}</h2><p>${data.resumen}</p>`;
        } catch (error) {
            console.error('Error al generar el resumen:', error);
            alert('Hubo un error al generar el resumen: ' + error.message);
        }
    }
});
