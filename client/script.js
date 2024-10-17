document.addEventListener('DOMContentLoaded', () => {
    const temaInput = document.getElementById('tema');
    const obtenerResumenBtn = document.getElementById('obtener-resumen');
    const resumenDiv = document.getElementById('resumen');
    const testOptionsDiv = document.getElementById('test-options');
    const dificultadSelect = document.getElementById('dificultad');
    const generarTestBtn = document.getElementById('generar-test');
    const testDiv = document.getElementById('test');
    const evaluarBtn = document.getElementById('evaluar');
    const resultadoDiv = document.getElementById('resultado');

    obtenerResumenBtn.addEventListener('click', async () => {
        const tema = temaInput.value;
        if (!tema) return;

        const response = await fetch('/resumen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tema })
        });
        const data = await response.json();
        resumenDiv.innerHTML = `<h2>Resumen</h2><p>${data.resumen}</p>`;
        testOptionsDiv.style.display = 'block';
    });

    generarTestBtn.addEventListener('click', async () => {
        const tema = temaInput.value;
        const dificultad = dificultadSelect.value;
        if (!tema) return;

        const response = await fetch('/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tema, dificultad })
        });
        const data = await response.json();
        testDiv.innerHTML = `<h2>Test</h2>${data.test}`;
        evaluarBtn.style.display = 'block';
    });

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
    });
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