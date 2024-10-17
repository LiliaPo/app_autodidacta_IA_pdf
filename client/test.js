document.addEventListener('DOMContentLoaded', () => {
    const testDiv = document.getElementById('test');
    const resultadoDiv = document.getElementById('resultado');

    let preguntas = [];
    let preguntaActual = 0;
    let respuestasCorrectas = 0;

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
            preguntas = parsearPreguntas(data.test);
            mostrarPregunta();
        } catch (error) {
            console.error('Error al generar el test:', error);
            alert('Hubo un error al generar el test: ' + error.message);
        }
    }

    function parsearPreguntas(textoTest) {
        const preguntasTexto = textoTest.split('\n\n');
        return preguntasTexto.map(preguntaTexto => {
            const lineas = preguntaTexto.split('\n');
            return {
                pregunta: lineas[0],
                opciones: lineas.slice(1, 5),
                respuestaCorrecta: lineas[5].split(': ')[1].trim()
            };
        });
    }

    function mostrarPregunta() {
        if (preguntaActual < preguntas.length) {
            const pregunta = preguntas[preguntaActual];
            testDiv.innerHTML = `
                <h3>${pregunta.pregunta}</h3>
                <div class="opciones">
                    ${pregunta.opciones.map((opcion, index) => `
                        <button class="opcion" data-index="${index}">${opcion}</button>
                    `).join('')}
                </div>
            `;

            document.querySelectorAll('.opcion').forEach(btn => {
                btn.addEventListener('click', seleccionarRespuesta);
            });
        } else {
            mostrarResultado();
        }
    }

    function seleccionarRespuesta(event) {
        const opcionSeleccionada = event.target;
        const pregunta = preguntas[preguntaActual];
        const opcionCorrecta = pregunta.opciones.findIndex(opcion => 
            opcion.startsWith(pregunta.respuestaCorrecta)
        );

        document.querySelectorAll('.opcion').forEach(btn => {
            btn.disabled = true;
            if (btn === opcionSeleccionada) {
                btn.classList.add(btn.dataset.index == opcionCorrecta ? 'correcta' : 'incorrecta');
            }
            if (btn.dataset.index == opcionCorrecta) {
                btn.classList.add('correcta');
            }
        });

        if (opcionSeleccionada.dataset.index == opcionCorrecta) {
            respuestasCorrectas++;
        }

        testDiv.innerHTML += `
            <button id="siguiente">Siguiente Pregunta</button>
        `;

        document.getElementById('siguiente').addEventListener('click', () => {
            preguntaActual++;
            mostrarPregunta();
        });
    }

    function mostrarResultado() {
        const total = preguntas.length;
        const porcentaje = (respuestasCorrectas / total) * 100;
        testDiv.innerHTML = `
            <h2>Test completado</h2>
            <p>Has acertado ${respuestasCorrectas} de ${total} preguntas (${porcentaje.toFixed(2)}%)</p>
            <button onclick="location.href='index.html'">Volver a Inicio</button>
        `;

        // Guardar progreso
        const progreso = JSON.parse(localStorage.getItem('progreso') || '[]');
        progreso.push({
            tema: localStorage.getItem('tema'),
            dificultad: localStorage.getItem('dificultad'),
            porcentaje: porcentaje
        });
        localStorage.setItem('progreso', JSON.stringify(progreso));
    }
});
