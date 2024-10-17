document.addEventListener('DOMContentLoaded', () => {
    const temaInput = document.getElementById('tema');
    const testContainer = document.getElementById('test-container');
    const testDiv = document.getElementById('test');
    const evaluarBtn = document.getElementById('evaluar');
    const resultadoDiv = document.getElementById('resultado');
    const resumenDiv = document.getElementById('resumen');

    let dificultadSeleccionada = localStorage.getItem('dificultad') || 'fácil';

    // Guardar tema y dificultad en localStorage
    const dificultadBtns = document.querySelectorAll('.dificultad-btn');
    dificultadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dificultadSeleccionada = btn.dataset.dificultad;
            localStorage.setItem('dificultad', dificultadSeleccionada);
            dificultadBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    if (temaInput) {
        temaInput.addEventListener('input', () => {
            localStorage.setItem('tema', temaInput.value);
        });
    }

    const generarTestBtn = document.getElementById('generar-test');
    if (generarTestBtn) {
        generarTestBtn.addEventListener('click', () => {
            const tema = temaInput.value;
            if (tema) {
                localStorage.setItem('tema', tema);
                window.location.href = 'test.html';
            } else {
                alert('Por favor, introduce un tema antes de generar el test.');
            }
        });
    }

    // Si estamos en la página de test, generamos el test automáticamente
    if (window.location.pathname.includes('test.html')) {
        const tema = localStorage.getItem('tema');
        const dificultad = localStorage.getItem('dificultad');
        if (tema && dificultad) {
            generarTest(tema, dificultad);
        } else {
            alert('No se ha especificado un tema o dificultad. Volviendo a la página principal.');
            window.location.href = 'index.html';
        }
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

    // Código para generar resúmenes
    const generarResumenBtn = document.querySelector('button[onclick="location.href=\'resumen.html\'"]');
    if (generarResumenBtn) {
        generarResumenBtn.onclick = (e) => {
            e.preventDefault();
            const tema = temaInput.value;
            if (tema) {
                localStorage.setItem('tema', tema);
                window.location.href = 'resumen.html';
            } else {
                alert('Por favor, introduce un tema antes de generar el resumen.');
            }
        };
    }

    // Si estamos en la página de resumen, generamos el resumen automáticamente
    if (window.location.pathname.includes('resumen.html')) {
        const tema = localStorage.getItem('tema');
        if (tema) {
            generarResumen(tema);
        } else {
            alert('No se ha especificado un tema. Volviendo a la página principal.');
            window.location.href = 'index.html';
        }
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
