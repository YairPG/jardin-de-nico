import { canciones } from './modules/playlist.js';
import { configurarReproductor, togglePlay, obtenerIntensidadRitmo } from './modules/player.js';
import { cambiarAmbiente, crearLluviaEmojis } from './modules/visuals.js';
import { cargarLetraExterna, actualizarLyrics, resetIndice } from './modules/lyrics-engine.js';
import { configurarPantallaInicio, actualizarUIControles } from './modules/ui-manager.js';

const audio = document.getElementById('reproductor');
const scrollContainer = document.getElementById('lyrics-scroll');
const progressBar = document.getElementById('progress-bar');
const volumeSlider = document.getElementById('volume-slider');
const caja = document.getElementById('caja-dinamica');
const overlay = document.getElementById('visualizer-overlay');

configurarPantallaInicio();

async function iniciar(id) {
    const data = canciones[id];
    if (!data) return;
    
    // --- Efecto Retroiluminado ---
    document.querySelectorAll('.btn-song').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.id === id);
    });
    
    const lyrics = await cargarLetraExterna(data.archivoLrc);
    scrollContainer.innerHTML = ''; 
    scrollContainer.style.transform = `translateY(0px)`;
    resetIndice();

    lyrics.forEach((frase, index) => {
        const p = document.createElement('p');
        p.className = 'lyric-line';
        p.id = `line-${index}`;
        p.innerText = frase.text;
        scrollContainer.appendChild(p);
    });

    configurarReproductor(data.url, data.color, data.emojis[0]);
    cambiarAmbiente(data);
    crearLluviaEmojis(data.emojis);
    actualizarUIControles(data.titulo);
}

// FIX: Función de ritmo estabilizada
function animarRitmo() {
    requestAnimationFrame(animarRitmo);
    const intensidad = obtenerIntensidadRitmo();
    
    if (caja) {
        // Reducimos el factor de escala a 0.05 para evitar desplazamientos bruscos
        caja.style.transform = `scale(${1 + intensidad * 0.05})`; 
    }
    
    if (overlay) {
        overlay.style.backgroundColor = `rgba(255, 255, 255, ${intensidad * 0.2})`;
    }
}
animarRitmo();

audio.addEventListener('timeupdate', () => {
    progressBar.value = (audio.currentTime / audio.duration) * 100 || 0;
    actualizarLyrics(audio.currentTime, scrollContainer);
});

document.querySelectorAll('.btn-song').forEach(btn => {
    btn.addEventListener('click', () => iniciar(btn.dataset.id));
});

document.getElementById('btn-play-pause').addEventListener('click', togglePlay);

volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value / 100;
});

progressBar.addEventListener('input', () => {
    audio.currentTime = (progressBar.value * audio.duration) / 100;
});