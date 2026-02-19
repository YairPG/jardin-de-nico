export function configurarPantallaInicio() {
    const btnEntrar = document.getElementById('btn-entrar');
    const pantallaInicio = document.getElementById('pantalla-inicio');
    const contenidoPrincipal = document.getElementById('contenido-principal');

    btnEntrar.addEventListener('click', () => {
        pantallaInicio.style.opacity = '0';
        setTimeout(() => {
            pantallaInicio.classList.add('hidden');
            contenidoPrincipal.classList.remove('hidden');
        }, 600);
    });
}

export function actualizarUIControles(titulo) {
    document.getElementById('titulo-musica').innerText = titulo;
    document.getElementById('controles-musica').classList.replace('oculto', 'visible');
}