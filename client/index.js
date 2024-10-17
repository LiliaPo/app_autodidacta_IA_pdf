document.addEventListener('DOMContentLoaded', () => {
    const temaInput = document.getElementById('tema');
    let dificultadSeleccionada = localStorage.getItem('dificultad') || 'fácil';

    const dificultadBtns = document.querySelectorAll('.dificultad-btn');
    dificultadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dificultadSeleccionada = btn.dataset.dificultad;
            localStorage.setItem('dificultad', dificultadSeleccionada);
            dificultadBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    temaInput.addEventListener('input', () => {
        localStorage.setItem('tema', temaInput.value);
    });

    const generarTestBtn = document.getElementById('generar-test');
    generarTestBtn.addEventListener('click', () => {
        const tema = temaInput.value;
        if (tema) {
            localStorage.setItem('tema', tema);
            window.location.href = 'test.html';
        } else {
            alert('Por favor, introduce un tema antes de generar el test.');
        }
    });

    const generarResumenBtn = document.querySelector('button[onclick="location.href=\'resumen.html\'"]');
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
});
