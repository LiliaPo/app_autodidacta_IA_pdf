document.addEventListener('DOMContentLoaded', () => {
    const app = {
        pages: ['home', 'resumen', 'test', 'progreso'],
        preguntas: [],
        preguntaActual: 0,
        respuestasCorrectas: 0,

        init: function() {
            this.bindEvents();
            this.showPage('home');
        },

        bindEvents: function() {
            document.querySelectorAll('.dificultad-btn').forEach(btn => {
                btn.addEventListener('click', () => this.setDificultad(btn.dataset.dificultad));
            });
            document.getElementById('tema').addEventListener('input', (e) => localStorage.setItem('tema', e.target.value));
            document.getElementById('generar-resumen').addEventListener('click', () => this.generarResumen());
            document.getElementById('generar-test').addEventListener('click', () => this.generarTest());
            document.getElementById('ver-progreso').addEventListener('click', () => this.showPage('progreso'));
            document.querySelectorAll('.volver').forEach(btn => {
                btn.addEventListener('click', () => this.showPage('home'));
            });
        },

        showPage: function(pageId) {
            this.pages.forEach(page => {
                document.getElementById(`${page}-page`).style.display = page === pageId ? 'block' : 'none';
            });
            if (pageId === 'progreso') this.mostrarProgreso();
        },

        setDificultad: function(dificultad) {
            localStorage.setItem('dificultad', dificultad);
            document.querySelectorAll('.dificultad-btn').forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.dificultad === dificultad);
            });
        },

        generarResumen: async function() {
            const tema = localStorage.getItem('tema');
            const dificultad = localStorage.getItem('dificultad');
            if (!tema || !dificultad) {
                alert('Por favor, introduce un tema y selecciona una dificultad antes de generar el resumen.');
                return;
            }
            try {
                const response = await fetch('/resumen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tema, dificultad })
                });
                const data = await response.json();
                document.getElementById('resumen').innerHTML = `
                    <h3>Resumen de ${tema} (Dificultad: ${dificultad})</h3>
                    <p>${data.resumen}</p>
                `;
                this.showPage('resumen');
            } catch (error) {
                console.error('Error al generar el resumen:', error);
                alert('Hubo un error al generar el resumen: ' + error.message);
            }
        },

        generarTest: async function() {
            const tema = localStorage.getItem('tema');
            const dificultad = localStorage.getItem('dificultad');
            if (!tema || !dificultad) {
                alert('Por favor, introduce un tema y selecciona una dificultad antes de generar el test.');
                return;
            }
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
                this.preguntas = this.parsearPreguntas(data.test);
                
                this.preguntaActual = 0;
                this.respuestasCorrectas = 0;
                this.mostrarPregunta();
                this.showPage('test');
            } catch (error) {
                console.error('Error al generar el test:', error);
                alert('Hubo un error al generar el test: ' + error.message);
            }
        },

        parsearPreguntas: function(textoTest) {
            const preguntasTexto = textoTest.split(/Pregunta \d+:/g).filter(texto => texto.trim() !== '');
            return preguntasTexto.map((preguntaTexto, index) => {
                const lineas = preguntaTexto.trim().split('\n');
                return {
                    pregunta: `Pregunta ${index + 1}: ${lineas[0].trim()}`,
                    opciones: lineas.slice(1, 5).map(opcion => opcion.trim()),
                    respuestaCorrecta: lineas[5].split(':')[1]?.trim() || ''
                };
            });
        },

        mostrarPregunta: function() {
            const testDiv = document.getElementById('test');
            if (this.preguntaActual < this.preguntas.length) {
                const pregunta = this.preguntas[this.preguntaActual];
                testDiv.innerHTML = `
                    <h3>${pregunta.pregunta}</h3>
                    <div class="opciones">
                        ${pregunta.opciones.map((opcion, index) => `
                            <button class="opcion" data-index="${index}">${opcion}</button>
                        `).join('')}
                    </div>
                `;
                document.querySelectorAll('.opcion').forEach(btn => {
                    btn.addEventListener('click', (e) => this.seleccionarRespuesta(e));
                });
            } else {
                this.mostrarResultado();
            }
        },

        seleccionarRespuesta: function(event) {
            const opcionSeleccionada = event.target;
            const pregunta = this.preguntas[this.preguntaActual];
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
                this.respuestasCorrectas++;
            }

            const testDiv = document.getElementById('test');
            testDiv.innerHTML += `
                <button id="siguiente">Siguiente Pregunta</button>
            `;
            document.getElementById('siguiente').addEventListener('click', () => this.siguientePregunta());
        },

        siguientePregunta: function() {
            this.preguntaActual++;
            this.mostrarPregunta();
        },

        mostrarResultado: function() {
            const testDiv = document.getElementById('test');
            const total = this.preguntas.length;
            const porcentaje = (this.respuestasCorrectas / total) * 100;
            testDiv.innerHTML = `
                <h2>Test completado</h2>
                <p>Has acertado ${this.respuestasCorrectas} de ${total} preguntas (${porcentaje.toFixed(2)}%)</p>
                <button class="volver">Volver a Inicio</button>
            `;
            document.querySelector('.volver').addEventListener('click', () => this.showPage('home'));

            // Guardar progreso
            const progreso = JSON.parse(localStorage.getItem('progreso') || '[]');
            progreso.push({
                tema: localStorage.getItem('tema'),
                dificultad: localStorage.getItem('dificultad'),
                porcentaje: porcentaje
            });
            localStorage.setItem('progreso', JSON.stringify(progreso));
        },

        mostrarProgreso: function() {
            const progresoDiv = document.getElementById('progreso');
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
    };

    app.init();
});
