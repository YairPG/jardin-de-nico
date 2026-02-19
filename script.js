let audioCtx, analyser, dataArray, source;
const reproductor = document.getElementById('reproductor');
const vinilo = document.getElementById('vinilo-container');
const discoFisico = document.getElementById('disco-fisico');
const etiqueta = document.getElementById('etiqueta-color');
const emojiDisco = document.getElementById('emoji-disco');
const overlay = document.getElementById('visualizer-overlay');
const caja = document.getElementById('caja-dinamica');

// Nuevas variables para los controles
const controlesMusica = document.getElementById('controles-musica');
const btnPlayPause = document.getElementById('btn-play-pause');
const iconPlay = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');
const progressBar = document.getElementById('progress-bar');
const volumeSlider = document.getElementById('volume-slider');

let emojisActuales = ['🌼'];
let intensidadRitmo = 0;

const ambientes = {
    'disename': { fondo: '#fdfcf0', color: '#d2b48c', titulo: 'Diséñame', emojis: ['✍️', '📜', '🎨'], frase: 'Te dibujé en mis sueños...' },
    'besos': { fondo: '#2d0a0a', color: '#ff4d4d', titulo: 'Besos en Guerra', emojis: ['🔥', '💣', '❤️'], frase: 'Nadie sale ileso del amor.', dark: true },
    'triste': { fondo: '#1a1a2e', color: '#486581', titulo: 'Canción Triste', emojis: ['📺', '☁️', '💔'], frase: 'Recuerdos que no se van.', dark: true },
    'ordinary': { fondo: '#eef2f3', color: '#4a90e2', titulo: 'Ordinary', emojis: ['✨', '💎', '🌟'], frase: 'Haces todo extraordinario.' },
    'gone': { fondo: '#fffcf5', color: '#ffa500', titulo: 'Gone Gone Gone', emojis: ['🎸', '🏹', '🧡'], frase: 'I would do it all for you.' },
    'carry': { fondo: '#f8f9fa', color: '#adb5bd', titulo: 'Carry You Home', emojis: ['🏠', '🕯️', '🫂'], frase: 'Estaré ahí para llevarte a casa.' }
};

// --- LÓGICA DE CONTROLES ---
reproductor.addEventListener('timeupdate', () => {
    const porcentaje = (reproductor.currentTime / reproductor.duration) * 100;
    progressBar.value = porcentaje || 0;
});

progressBar.addEventListener('input', () => {
    reproductor.currentTime = (progressBar.value * reproductor.duration) / 100;
});

volumeSlider.addEventListener('input', () => {
    reproductor.volume = volumeSlider.value / 100;
});

btnPlayPause.addEventListener('click', () => {
    if (reproductor.paused) {
        reproductor.play();
        actualizarIcono(true);
        discoFisico.classList.add('girar');
    } else {
        reproductor.pause();
        actualizarIcono(false);
        discoFisico.classList.remove('girar');
    }
});

function actualizarIcono(estaReproduciendo) {
    if (estaReproduciendo) {
        iconPlay.classList.add('hidden');
        iconPause.classList.remove('hidden');
    } else {
        iconPlay.classList.remove('hidden');
        iconPause.classList.add('hidden');
    }
}

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    source = audioCtx.createMediaElementSource(reproductor);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    renderFrame();
}

function renderFrame() {
    requestAnimationFrame(renderFrame);
    if (!analyser) return;
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for(let i=0; i<dataArray.length; i++) sum += dataArray[i];
    intensidadRitmo = (sum / dataArray.length) / 255;
    overlay.style.backgroundColor = `rgba(255, 255, 255, ${intensidadRitmo * 0.4})`;
    caja.style.transform = `scale(${1 + intensidadRitmo * 0.12})`;
}

function reproducir(url, tipo) {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    // Mostrar controles al iniciar música
    controlesMusica.classList.remove('oculto');
    controlesMusica.classList.add('visible');

    const data = ambientes[tipo];
    emojisActuales = data.emojis;
    
    document.querySelectorAll('.cajita').forEach(c => c.classList.remove('activa'));
    const btn = document.getElementById(`btn-${tipo}`);
    btn.classList.add('activa');
    btn.style.setProperty('--glow-color', data.color);

    if (data.dark) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');

    etiqueta.style.backgroundColor = data.color;
    emojiDisco.innerText = emojisActuales[0];
    reproductor.src = url;
    reproductor.play();
    actualizarIcono(true);

    vinilo.classList.add('active');
    discoFisico.classList.add('girar');
    document.body.style.background = data.fondo;
    document.getElementById('titulo-musica').innerText = data.titulo;
    document.getElementById('subtitulo-musica').innerText = data.frase;
}

document.getElementById('btn-entrar').addEventListener('click', () => {
    document.getElementById('pantalla-inicio').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('pantalla-inicio').classList.add('hidden');
        document.getElementById('contenido-principal').classList.remove('hidden');
    }, 600);
});

function crearParticula() {
    if (reproductor.paused) return;
    const p = document.createElement('div');
    p.className = 'emoji-particula';
    p.innerText = emojisActuales[Math.floor(Math.random() * emojisActuales.length)];
    p.style.left = Math.random() * 100 + "vw";
    p.style.top = "-50px";
    document.body.appendChild(p);
    let pos = -50;
    let vel = 2 + (intensidadRitmo * 12);
    function caer() {
        pos += vel;
        p.style.top = pos + "px";
        if (pos < window.innerHeight) requestAnimationFrame(caer);
        else p.remove();
    }
    caer();
}
setInterval(crearParticula, 500);