document.addEventListener('DOMContentLoaded', () => {
    const testDiv = document.getElementById('test');
    const evaluarBtn = document.getElementById('evaluar');
    const resultadoDiv = document.getElementById('resultado');

    const tema = localStorage.getItem('tema');
    const dificultad = localStorage.getItem('dificultad');

    if (tema && dificultad) {
        generarTest(tema, dificultad);
    } else {
        alert('No se ha especificado un tema o dificultad. Volviendo a la página principal.');
        window.location.href = 'index.html';
    }

    async function generarTest(tema, dificultad) {
        try {
            const response = await fetch('/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tema, dificultad })
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            testDiv.innerHTML = `<h2>Test de ${tema} (${dificultad})</h2>${data.test}`;
            evaluarBtn.style.display = 'block';
        } catch (error) {
            console.error('Error al generar el test:', error);
            alert('Hubo un error al generar el test: ' + error.message);
        }
    }

    if (evaluarBtn) {
        evaluarBtn.addEventListener('click', () => {
            const preguntas = testDiv.querySelectorAll('li');
            let correctas = 0;
            preguntas.forEach(pregunta => {
                const opciones = pregunta.querySelectorAll('input[type="radio"]');
                const seleccionada = Array.from(opciones).find(opcion => opcion.checked);
                if (seleccionada && seleccionada.value === 'correcta') {
                    correctas++;
                }
            });
            const total = preguntas.length;
            const porcentaje = (correctas / total) * 100;
            resultadoDiv.innerHTML = `<h2>Resultado</h2><p>Has acertado ${correctas} de ${total} preguntas (${porcentaje.toFixed(2)}%)</p>`;
            
            // Guardar progreso
            const progreso = JSON.parse(localStorage.getItem('progreso') || '[]');
            progreso.push({
                tema: localStorage.getItem('tema'),
                dificultad: localStorage.getItem('dificultad'),
                porcentaje: porcentaje
            });
            localStorage.setItem('progreso', JSON.stringify(progreso));
        });
    }
});
