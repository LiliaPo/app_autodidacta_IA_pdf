document.addEventListener('DOMContentLoaded', () => {
    const app = {
        pages: ['home', 'resumen', 'test', 'progreso'],
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
            // Añadir este nuevo event listener
            document.getElementById('reiniciar-progreso').addEventListener('click', () => this.reiniciarProgreso());
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
            if (!tema) {
                alert('Por favor, introduce un tema antes de generar el resumen.');
                return;
            }
            // Mostrar indicador de carga
            const resumenDiv = document.getElementById('resumen');
            resumenDiv.innerHTML = '<div class="loader"></div>'; // Indicador de carga
            this.showPage('resumen');

            try {
                const response = await fetch('/resumen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tema })
                });
                const data = await response.json();
                // Usar marked para convertir markdown a HTML
                resumenDiv.innerHTML = marked.parse(data.resumen);
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
            
            // Mostrar indicador de carga
            const testDiv = document.getElementById('test');
            testDiv.innerHTML = '<div class="loader"></div>'; // Indicador de carga
            this.showPage('test');

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
                if (!data.test) {
                    throw new Error('No se recibieron datos del test');
                }
                console.log('Datos del test recibidos:', data); // Para depuración
                this.preguntas = this.parsearPreguntas(data.test);
                if (this.preguntas.length === 0) {
                    throw new Error('No se pudieron parsear las preguntas del test');
                }
                this.preguntaActual = 0;
                this.respuestasCorrectas = 0;
                this.mostrarPregunta();
            } catch (error) {
                console.error('Error al generar el test:', error);
                alert('Hubo un error al generar el test: ' + error.message);
            }
        },
        parsearPreguntas: function(textoTest) {
            if (!textoTest) {
                console.error('El texto del test está vacío o es undefined');
                return [];
            }
            console.log('Texto del test recibido:', textoTest); // Para depuración

            const preguntasTexto = textoTest.split(/Pregunta \d+:/g).filter(texto => texto.trim() !== '');
            console.log('Preguntas separadas:', preguntasTexto); // Para depuración

            const preguntas = preguntasTexto.map((preguntaTexto, index) => {
                const lineas = preguntaTexto.trim().split('\n');
                console.log(`Pregunta ${index + 1} líneas:`, lineas); // Para depuración

                if (lineas.length < 6) {
                    console.error(`Formato de pregunta incorrecto para la pregunta ${index + 1}:`, preguntaTexto);
                    return null;
                }

                const pregunta = `Pregunta ${index + 1}: ${lineas[0].trim()}`;
                const opciones = lineas.slice(1, 5).map(opcion => opcion.trim());
                const respuestaCorrecta = lineas[5].split(':')[1]?.trim() || '';

                // Asegurarse de que hay exactamente 4 opciones
                if (opciones.length !== 4) {
                    console.error(`La pregunta ${index + 1} no tiene 4 opciones:`, opciones);
                    return null;
                }

                return { pregunta, opciones, respuestaCorrecta };
            }).filter(pregunta => pregunta !== null);
            
            console.log('Preguntas parseadas:', preguntas); // Para depuración
            
            if (preguntas.length === 0) {
                throw new Error('No se pudo parsear ninguna pregunta válida del test');
            }
            
            return preguntas;
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
                    <button id="siguiente" style="display: none;">Siguiente Pregunta</button>
                `;
                document.querySelectorAll('.opcion').forEach(btn => {
                    btn.addEventListener('click', (e) => this.seleccionarRespuesta(e));
                });
                document.getElementById('siguiente').addEventListener('click', () => this.siguientePregunta());
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

            document.getElementById('siguiente').style.display = 'block';
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
                // Añadir el botón de reiniciar progreso
                html += '<button id="reiniciar-progreso">Reiniciar Progreso</button>';
                progresoDiv.innerHTML = html;
                
                // Añadir el event listener al botón
                document.getElementById('reiniciar-progreso').addEventListener('click', () => this.reiniciarProgreso());
            }
        },
        reiniciarProgreso: function() {
            if (confirm('¿Estás seguro de que quieres reiniciar todo tu progreso? Esta acción no se puede deshacer.')) {
                localStorage.removeItem('progreso');
                this.mostrarProgreso(); // Actualizar la vista de progreso
                alert('Tu progreso ha sido reiniciado.');
            }
        }
    };

    app.init();
});
