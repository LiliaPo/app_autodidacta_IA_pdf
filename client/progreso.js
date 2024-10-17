document.addEventListener('DOMContentLoaded', () => {
    const progresoDiv = document.getElementById('progreso');
    mostrarProgreso();

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
