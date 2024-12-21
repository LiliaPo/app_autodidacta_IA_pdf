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
            const isDocumentMode = localStorage.getItem('isDocumentMode') === 'true';
            const documentContent = localStorage.getItem('currentDocument');
            const filename = document.getElementById('tema').value;

            if (isDocumentMode) {
                if (!documentContent) {
                    alert('No hay ningún documento seleccionado para estudiar.');
                    return;
                }
                try {
                    const response = await fetch('/api/resumen', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            tema: documentContent,
                            isDocument: true,
                            filename: filename
                        })
                    });
                    const data = await response.json();
                    document.getElementById('resumen').innerHTML = `
                        <h3>Resumen del documento: ${filename}</h3>
                        ${data.resumen}
                    `;
                    this.showPage('resumen');
                } catch (error) {
                    console.error('Error al generar el resumen:', error);
                    alert('Error al generar el resumen: ' + error.message);
                }
            } else {
                const tema = localStorage.getItem('tema');
                if (!tema) {
                    alert('Por favor, introduce un tema antes de generar el resumen.');
                    return;
                }
                try {
                    const response = await fetch('/api/resumen', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tema })
                    });
                    const data = await response.json();
                    document.getElementById('resumen').innerHTML = `<p>${data.resumen}</p>`;
                    this.showPage('resumen');
                } catch (error) {
                    console.error('Error al generar el resumen:', error);
                    alert('Error al generar el resumen: ' + error.message);
                }
            }
        },
        generarTest: async function() {
            const isDocumentMode = localStorage.getItem('isDocumentMode') === 'true';
            const documentContent = localStorage.getItem('currentDocument');
            const filename = document.getElementById('tema').value;

            if (isDocumentMode) {
                if (!documentContent) {
                    alert('No hay ningún documento seleccionado para estudiar.');
                    return;
                }
                try {
                    const response = await fetch('/api/test', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            tema: documentContent,
                            isDocument: true,
                            filename: filename
                        })
                    });
                    const data = await response.json();
                    if (!data.test) {
                        throw new Error('No se recibieron datos del test');
                    }
                    this.preguntas = this.parsearPreguntas(data.test);
                    this.preguntaActual = 0;
                    this.respuestasCorrectas = 0;
                    this.mostrarPregunta();
                    this.showPage('test');
                } catch (error) {
                    console.error('Error al generar el test:', error);
                    alert('Error al generar el test: ' + error.message);
                }
            } else {
                const tema = localStorage.getItem('tema');
                const dificultad = localStorage.getItem('dificultad');
                if (!tema || !dificultad) {
                    alert('Por favor, introduce un tema y selecciona una dificultad antes de generar el test.');
                    return;
                }
                try {
                    const response = await fetch('/api/test', {
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
                    this.preguntas = this.parsearPreguntas(data.test);
                    if (this.preguntas.length === 0) {
                        throw new Error('No se pudieron parsear las preguntas del test');
                    }
                    this.preguntaActual = 0;
                    this.respuestasCorrectas = 0;
                    this.mostrarPregunta();
                    this.showPage('test');
                } catch (error) {
                    console.error('Error al generar el test:', error);
                    alert('Hubo un error al generar el test: ' + error.message);
                }
            }
        },
        parsearPreguntas: function(textoTest) {
            if (!textoTest) {
                console.error('El texto del test está vacío o es undefined');
                return [];
            }

            const preguntasTexto = textoTest.split(/Pregunta \d+:/g).filter(texto => texto.trim() !== '');

            const preguntas = preguntasTexto.map((preguntaTexto, index) => {
                const lineas = preguntaTexto.trim().split('\n');

                if (lineas.length < 6) {
                    console.error(`Formato de pregunta incorrecto para la pregunta ${index + 1}:`, preguntaTexto);
                    return null;
                }

                const pregunta = `Pregunta ${index + 1}: ${lineas[0].trim()}`;
                const opciones = lineas.slice(1, 5).map(opcion => opcion.trim());
                const respuestaCorrecta = lineas[5].split(':')[1]?.trim() || '';

                if (opciones.length !== 4) {
                    console.error(`La pregunta ${index + 1} no tiene 4 opciones:`, opciones);
                    return null;
                }

                return { pregunta, opciones, respuestaCorrecta };
            }).filter(pregunta => pregunta !== null);
            
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

    // Manejo de archivos
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');

    fileInput.addEventListener('change', (e) => {
        fileList.innerHTML = '';
        Array.from(e.target.files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
            fileList.appendChild(fileItem);
        });
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        Array.from(fileInput.files).forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                alert('Archivos subidos correctamente');
                fileList.innerHTML = '';
                fileInput.value = '';
                
                // Recargar la lista de documentos inmediatamente
                await loadDocuments();
            } else {
                throw new Error('Error al subir los archivos');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al subir los archivos: ' + error.message);
        }
    });

    // Gestión de documentos
    const documentsListElement = document.getElementById('documents-list');

    // Definir funciones en el scope global
    window.studyDocument = async function(docId) {
        try {
            const response = await fetch(`/api/files/${docId}/content`);
            if (response.ok) {
                const { content } = await response.json();
                
                // Obtener el nombre del archivo
                const docElement = document.querySelector(`[data-id="${docId}"]`);
                const filename = docElement.querySelector('span').textContent;
                
                // Guardar en localStorage
                localStorage.setItem('currentDocument', content);
                localStorage.setItem('currentDocumentId', docId);
                localStorage.setItem('isDocumentMode', 'true');
                localStorage.removeItem('tema'); // Limpiar tema anterior
                
                // Actualizar el campo de tema
                const temaInput = document.getElementById('tema');
                temaInput.value = filename;
                temaInput.disabled = true;
                
                // Ocultar botones de dificultad
                document.getElementById('dificultad').style.display = 'none';
                
                // Modificar el texto de los botones
                document.getElementById('generar-resumen').textContent = 'Analizar y Resumir Documento';
                document.getElementById('generar-test').textContent = 'Crear Test del Documento';
                
                // Actualizar las funciones
                window.app.generarResumen = async function() {
                    const documentContent = localStorage.getItem('currentDocument');
                    const filename = document.getElementById('tema').value;

                    if (!documentContent) {
                        alert('No hay ningún documento seleccionado para estudiar.');
                        return;
                    }

                    try {
                        console.log('Enviando contenido del documento:', documentContent.substring(0, 100) + '...'); // Debug

                        const response = await fetch('/api/resumen', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                tema: documentContent,
                                isDocument: true,
                                filename: filename,
                                prompt: `Analiza y resume el siguiente documento: ${filename}\n\nContenido del documento:\n${documentContent}`
                            })
                        });

                        if (!response.ok) {
                            throw new Error(`Error en la petición: ${response.status}`);
                        }

                        const data = await response.json();
                        document.getElementById('resumen').innerHTML = `
                            <h3>Resumen del documento: ${filename}</h3>
                            ${data.resumen}
                        `;
                        this.showPage('resumen');
                    } catch (error) {
                        console.error('Error completo al generar el resumen:', error);
                        alert('Error al generar el resumen. Por favor, intenta de nuevo.');
                    }
                };

                window.app.generarTest = async function() {
                    const documentContent = localStorage.getItem('currentDocument');
                    const filename = document.getElementById('tema').value;

                    if (!documentContent) {
                        alert('No hay ningún documento seleccionado para estudiar.');
                        return;
                    }

                    try {
                        console.log('Enviando contenido del documento para test:', documentContent.substring(0, 100) + '...'); // Debug

                        const response = await fetch('/api/test', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                tema: documentContent,
                                isDocument: true,
                                filename: filename,
                                prompt: `Genera un test de comprensión sobre este documento: ${filename}\n\nContenido del documento:\n${documentContent}`
                            })
                        });

                        if (!response.ok) {
                            throw new Error(`Error en la petición: ${response.status}`);
                        }

                        const data = await response.json();
                        if (!data.test) {
                            throw new Error('No se recibieron datos del test');
                        }

                        this.preguntas = this.parsearPreguntas(data.test);
                        this.preguntaActual = 0;
                        this.respuestasCorrectas = 0;
                        this.mostrarPregunta();
                        this.showPage('test');
                    } catch (error) {
                        console.error('Error completo al generar el test:', error);
                        alert('Error al generar el test. Por favor, intenta de nuevo.');
                    }
                };

                alert('Documento seleccionado. Puedes generar un resumen o test sobre su contenido.');
            }
        } catch (error) {
            console.error('Error al cargar contenido:', error);
            alert('Error al cargar el documento');
        }
    };

    window.deleteDocument = async function(docId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) return;

        try {
            const response = await fetch(`/api/files/${docId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Recargar la lista usando la función del scope global
                window.loadDocuments();
                alert('Documento eliminado correctamente');
            } else {
                throw new Error('Error al eliminar el documento');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el documento');
        }
    };

    // También mover loadDocuments al scope global
    window.loadDocuments = async function() {
        try {
            const response = await fetch('/api/files');
            if (response.ok) {
                const documents = await response.json();
                const documentsListElement = document.getElementById('documents-list');
                
                if (documents.length === 0) {
                    documentsListElement.innerHTML = '<p class="no-documents">No hay documentos subidos</p>';
                    return;
                }

                documentsListElement.innerHTML = documents
                    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                    .map(doc => `
                        <div class="document-item" data-id="${doc._id}">
                            <span>${doc.filename}</span>
                            <div class="document-actions">
                                <button class="document-button study" onclick="studyDocument('${doc._id}')">
                                    Estudiar
                                </button>
                                <button class="document-button delete" onclick="deleteDocument('${doc._id}')">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    `).join('');
            }
        } catch (error) {
            console.error('Error al cargar documentos:', error);
            document.getElementById('documents-list').innerHTML = 
                '<p class="error-message">Error al cargar los documentos</p>';
        }
    };

    // Iniciar carga de documentos
    window.loadDocuments();

    // Añadir función para resetear la interfaz cuando se vuelve al modo tema libre
    function resetToFreeMode() {
        const temaInput = document.getElementById('tema');
        temaInput.value = '';
        temaInput.disabled = false;
        document.getElementById('dificultad').style.display = 'flex';
        document.getElementById('generar-resumen').textContent = 'Generar Resumen';
        document.getElementById('generar-test').textContent = 'Generar Test';
        localStorage.removeItem('currentDocument');
        localStorage.removeItem('currentDocumentId');
        localStorage.removeItem('isDocumentMode');
    }

    // Modificar el evento click de los botones "volver"
    document.querySelectorAll('.volver').forEach(btn => {
        btn.addEventListener('click', () => {
            if (localStorage.getItem('isDocumentMode')) {
                resetToFreeMode();
            }
            app.showPage('home');
        });
    });
});