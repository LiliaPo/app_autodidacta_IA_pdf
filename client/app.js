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
            document.getElementById('evaluar').addEventListener('click', () => this.evaluarTest());
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
            if (!tema) {
                alert('Por favor, introduce un tema antes de generar el resumen.');
                return;
            }
            try {
                const response = await fetch('/resumen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tema })
                });
                const data = await response.json();
                document.getElementById('resumen').innerHTML = `<p>${data.resumen}</p>`;
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
                document.getElementById('test').innerHTML = data.test;
                document.getElementById('evaluar').style.display = 'block';
                this.showPage('test');
            } catch (error) {
                console.error('Error al generar el test:', error);
                alert('Hubo un error al generar el test: ' + error.message);
            }
        },
        evaluarTest: function() {
            const preguntas = document.querySelectorAll('#test li');
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
            document.getElementById('resultado').innerHTML = `<p>Has acertado ${correctas} de ${total} preguntas (${porcentaje.toFixed(2)}%)</p>`;
            
            const progreso = JSON.parse(localStorage.getItem('progreso') || '[]');
            progreso.push({
                tema: localStorage.getItem('tema'),
                dificultad: localStorage.getItem('dificultad'),
                porcentaje: porcentaje
            });
            localStorage.setItem('progreso', JSON.stringify(progreso));
        },
        mostrarProgreso: function() {
            const progreso = JSON.parse(localStorage.getItem('progreso') || '[]');
            const progresoDiv = document.getElementById('progreso');
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
