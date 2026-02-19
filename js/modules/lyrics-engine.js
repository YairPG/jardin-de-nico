let lyricsActuales = [];
let ultimoIndice = -1;

export async function cargarLetraExterna(ruta) {
    try {
        const respuesta = await fetch(ruta);
        const textoLRC = await respuesta.text();
        lyricsActuales = parsearLRC(textoLRC);
        return lyricsActuales;
    } catch (error) {
        lyricsActuales = [{ t: 0, text: "Letra no disponible ✨" }];
        return lyricsActuales;
    }
}

function parsearLRC(lrcText) {
    const lineas = lrcText.split('\n');
    const resultado = [];
    const regExp = /\[(\d+):(\d+(\.\d+)?)\](.*)/;
    
    lineas.forEach(linea => {
        const match = regExp.exec(linea);
        if (match) {
            const min = parseFloat(match[1]);
            const sec = parseFloat(match[2]);
            const texto = match[4].trim();
            if (texto) resultado.push({ t: min * 60 + sec, text: texto });
        }
    });
    return resultado.sort((a, b) => a.t - b.t);
}

export function actualizarLyrics(tiempoActual, scrollContainer) {
    let indiceActual = -1;

    for (let i = 0; i < lyricsActuales.length; i++) {
        if (tiempoActual >= lyricsActuales[i].t) {
            indiceActual = i;
        }
    }

    if (indiceActual !== -1 && indiceActual !== ultimoIndice) {
        ultimoIndice = indiceActual;

        const lineas = scrollContainer.querySelectorAll('.lyric-line');
        lineas.forEach((linea, idx) => {
            linea.classList.toggle('active', idx === indiceActual);
        });

        const lineaActiva = document.getElementById(`line-${indiceActual}`);
        if (lineaActiva) {
            const contenedorHeight = 140; 
            const lineaHeight = lineaActiva.offsetHeight;
            
            // CORRECCIÓN: Restamos 40px extras al cálculo original para "subir" 
            // la línea activa a la zona superior del contenedor.
            const offset = -(lineaActiva.offsetTop - (contenedorHeight / 2) + (lineaHeight / 2) + 40);
            
            scrollContainer.style.transform = `translateY(${offset}px)`;
        }
    }
}

export function resetIndice() {
    ultimoIndice = -1;
}