const audio = document.getElementById('reproductor');
const vinilo = document.getElementById('vinilo-container');
const discoFisico = document.getElementById('disco-fisico');
const iconPlay = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');

// Variables para el análisis de audio
let audioCtx, analyser, dataArray, source;

export function configurarReproductor(url, color, emoji) {
    audio.src = url;
    audio.play();

    // Inicializar el analizador de ritmo si no existe
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 64;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    vinilo.classList.add('active');
    discoFisico.classList.add('girar');
    document.getElementById('etiqueta-color').style.backgroundColor = color;
    document.getElementById('emoji-disco').innerText = emoji;
    
    actualizarInterfazPlay(true);
}

// Función para obtener la intensidad actual del ritmo
export function obtenerIntensidadRitmo() {
    if (!analyser) return 0;
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    return (sum / dataArray.length) / 255; // Devuelve un valor entre 0 y 1
}

export function togglePlay() {
    if (audio.paused) {
        audio.play();
        discoFisico.classList.add('girar');
        actualizarInterfazPlay(true);
    } else {
        audio.pause();
        discoFisico.classList.remove('girar');
        actualizarInterfazPlay(false);
    }
}

export function actualizarInterfazPlay(isPaused) {
    iconPlay.classList.toggle('hidden', isPaused);
    iconPause.classList.toggle('hidden', !isPaused);
}