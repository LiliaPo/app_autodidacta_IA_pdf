document.addEventListener('DOMContentLoaded', () => {
    const temaInput = document.getElementById('tema');
    const resumenDiv = document.getElementById('resumen');
    const testDiv = document.getElementById('test');
    const evaluarBtn = document.getElementById('evaluar');
    const resultadoDiv = document.getElementById('resultado');
    const progresoDiv = document.getElementById('progreso');

    // Guardar tema y dificultad en localStorage
    const dificultadBtns = document.querySelectorAll('.dificultad-btn');
    dificultadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.setItem('dificultad', btn.dataset.dificultad);
        });
    });

    if (temaInput) {
        temaInput.addEventListener('input', () => {
            localStorage.setItem('tema', temaInput.value);
        });
    }

    // Funcionalidad para la página de resumen
    if (resumenDiv) {
        const tema = localStorage.getItem('tema');
        if (tema) {
            obtenerResumen(tema);
        }
    }

    // Funcionalidad para la página de test
    if (testDiv) {
        const tema = localStorage.getItem('tema');
        const dificultad = localStorage.getItem('dificultad');
        if (tema && dificultad) {
            generarTest(tema, dificultad);
        }
    }

    // Funcionalidad para la página de progreso
    if (progresoDiv) {
        mostrarProgreso();
    }

    async function obtenerResumen(tema) {
        const response = await fetch('/resumen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tema })
        });
        const data = await response.json();
        resumenDiv.innerHTML = `<h2>Resumen de ${tema}</h2><p>${data.resumen}</p>`;
    }

    async function generarTest(tema, dificultad) {
        const response = await fetch('/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tema, dificultad })
        });
        const data = await response.json();
        testDiv.innerHTML = `<h2>Test de ${tema} (${dificultad})</h2>${data.test}`;
        evaluarBtn.style.display = 'block';
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

    function mostrarProgreso() {
        const progreso = JSON.parse(localStorage.getItem('progreso') || '[]');
        if (progreso.length === 0) {
            progresoDiv.innerHTML = '<p>Aún no has realizado ningún test.</p>';
        } else {
            let html = '<ul>';
            progreso.forEach(p => {
                html += `<li>Tema: ${p.tema}, Dificultad: ${p.dificultad}, Resultado: ${p.porcentaje.toFixed(2)}%</li>`;
            });
            html += '</ul>';
            progresoDiv.innerHTML = html;
        }
    }
});

/*
fetch('https://api.groq.io/tu_endpoint', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer TU_API_KEY`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
*/
