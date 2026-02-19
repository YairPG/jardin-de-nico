const overlay = document.getElementById('visualizer-overlay');

export function cambiarAmbiente(data) {
    // 1. Cambiar el fondo
    document.body.style.background = data.fondo;
    
    // 2. Gestionar el modo oscuro para las letras y botones
    // Si data.dark es true, se añade la clase; si es false, se quita.
    if (data.dark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

export function crearLluviaEmojis(emojis) {
    if (window.emojiInterval) clearInterval(window.emojiInterval);

    window.emojiInterval = setInterval(() => {
        const audio = document.getElementById('reproductor');
        if (!audio || audio.paused) return;

        const p = document.createElement('div');
        p.className = 'emoji-particula';
        p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        
        p.style.left = Math.random() * 100 + "vw";
        p.style.fontSize = (Math.random() * 20 + 20) + "px";
        
        // Aseguramos que los emojis estén sobre todo el contenido
        p.style.position = 'fixed';
        p.style.zIndex = '1000';
        
        document.body.appendChild(p);

        let pos = -50;
        let vel = 2 + Math.random() * 4;

        function caer() {
            pos += vel;
            p.style.top = pos + "px";
            
            if (pos < window.innerHeight) {
                requestAnimationFrame(caer);
            } else {
                p.remove();
            }
        }
        caer();
    }, 500);
}