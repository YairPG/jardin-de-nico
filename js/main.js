import { supabase } from './modules/supabase-client.js';
import { configurarReproductor, togglePlay, obtenerIntensidadRitmo } from './modules/player.js';
import { cambiarAmbiente, crearLluviaEmojis } from './modules/visuals.js';
import { actualizarLyrics, resetIndice, cargarLetrasDesdeTexto } from './modules/lyrics-engine.js';
import { actualizarUIControles } from './modules/ui-manager.js';
import { obtenerSiguiente, obtenerAnterior, setModo, actualizarListaReproduccion } from './modules/player-logic.js';

const audio = document.getElementById('reproductor');
const scrollContainer = document.getElementById('lyrics-scroll');
const progressBar = document.getElementById('progress-bar');
const volumeSlider = document.getElementById('volume-slider');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const sleepTimerSelect = document.getElementById('sleep-timer');
const caja = document.getElementById('caja-dinamica');
const overlay = document.getElementById('visualizer-overlay');

// Nuevas referencias para el ciclo de modos
const btnMode = document.getElementById('btn-mode-cycle');
const pathMode = document.getElementById('path-mode');

let todasLasCanciones = {};
let cancionActualId = null;
let timerApagado = null;
let modoIndex = 0; // 0: Natural, 1: Aleatorio, 2: Repetir

// Iconos para el ciclo de modos (Paths SVG)
const ICON_PATHS = [
    "M5 12h14M15 8l4 4-4 4", // Flecha derecha (Natural)
    "M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.45 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z", // Shuffle
    "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" // Repeat
];

// --- UTILIDADES ---
function formatearTiempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

// --- CARGA DE DATOS ---
async function cargarCancionesNube() {
    try {
        const { data, error } = await supabase.from('canciones').select('*');
        if (error) throw error;
        if (data) {
            data.forEach(c => {
                todasLasCanciones[c.id] = {
                    id: c.id,
                    titulo: c.titulo,
                    artista: c.artista,
                    url: c.url_audio,
                    portada: c.url_portada,
                    lrcDirecto: c.lrc_content, 
                    emojis: [c.emoji || '🎵'],
                    color: c.color_tema || "#4a90e2"
                };
            });
            actualizarListaReproduccion(Object.keys(todasLasCanciones));
        }
    } catch (err) {
        console.error("Error Supabase:", err.message);
    } finally {
        renderizarPlaylist();
    }
}

function renderizarPlaylist() {
    const contenedor = document.getElementById('lista-canciones');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    Object.keys(todasLasCanciones).forEach(id => {
        const cancion = todasLasCanciones[id];
        const item = document.createElement('div');
        item.className = 'song-item';
        item.dataset.id = id;
        item.innerHTML = `
            <span class="song-emoji">${cancion.emojis[0]}</span>
            <div class="song-info">
                <span class="song-name">${cancion.titulo}</span>
                <span class="song-artist">${cancion.artista}</span>
            </div>
        `;
        item.addEventListener('click', () => iniciar(id));
        contenedor.appendChild(item);
    });
}

function parsearLRC(texto) {
    if (!texto) return [{ t: 0, text: "Letra no disponible ✨" }];
    const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
    return texto.split('\n').map(linea => {
        const match = regex.exec(linea);
        if (match) {
            const tiempo = parseInt(match[1]) * 60 + parseInt(match[2]) + (parseInt(match[3]) > 99 ? match[3] / 1000 : match[3] / 100);
            return { t: tiempo, text: match[4].trim() };
        }
        return null;
    }).filter(l => l && l.text).sort((a, b) => a.t - b.t);
}

// --- CONTROLADOR DE REPRODUCCIÓN ---
async function iniciar(id) {
    const data = todasLasCanciones[id];
    if (!data) return;
    cancionActualId = id;
    
    document.querySelectorAll('.song-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.id === id);
    });
    
    scrollContainer.innerHTML = ''; 
    scrollContainer.style.transform = `translateY(0px)`;
    cargarLetrasDesdeTexto(data.lrcDirecto); 
    resetIndice();

    parsearLRC(data.lrcDirecto).forEach((frase, index) => {
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

// --- EVENTOS Y CONTROLES ---

// Ciclo de Modos (Botón Izquierdo)
btnMode.onclick = () => {
    modoIndex = (modoIndex + 1) % 3;
    pathMode.setAttribute('d', ICON_PATHS[modoIndex]);
    
    const modos = ['natural', 'aleatorio', 'repetir'];
    setModo(modos[modoIndex]);
    
    // Feedback visual de color
    btnMode.style.fill = modoIndex === 0 ? "#777" : "var(--primary)";
};

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
        timeCurrent.innerText = formatearTiempo(audio.currentTime);
        timeTotal.innerText = formatearTiempo(audio.duration);
        actualizarLyrics(audio.currentTime, scrollContainer);
    }
});

audio.addEventListener('ended', () => {
    if (sleepTimerSelect.value === 'end') {
        audio.pause();
        sleepTimerSelect.value = "0";
    } else {
        iniciar(obtenerSiguiente(cancionActualId));
    }
});

// Temporizador
sleepTimerSelect.addEventListener('change', () => {
    if (timerApagado) clearTimeout(timerApagado);
    const valor = sleepTimerSelect.value;
    if (valor !== '0' && valor !== 'end') {
        timerApagado = setTimeout(() => {
            audio.pause();
            alert("Música apagada por el temporizador 😴");
        }, parseInt(valor) * 60000);
    }
});

// Botones de Navegación
document.getElementById('btn-play-pause').onclick = togglePlay;
document.getElementById('btn-next').onclick = () => iniciar(obtenerSiguiente(cancionActualId));
document.getElementById('btn-prev').onclick = () => iniciar(obtenerAnterior(cancionActualId));

volumeSlider.oninput = () => audio.volume = volumeSlider.value / 100;
progressBar.oninput = () => {
    if (audio.duration) audio.currentTime = (progressBar.value * audio.duration) / 100;
};

function animarRitmo() {
    requestAnimationFrame(animarRitmo);
    const intensidad = obtenerIntensidadRitmo();
    if (caja) caja.style.transform = `scale(${1 + intensidad * 0.05})`; 
    if (overlay) overlay.style.backgroundColor = `rgba(255, 255, 255, ${intensidad * 0.2})`;
}

// Iniciar App
cargarCancionesNube();
animarRitmo();