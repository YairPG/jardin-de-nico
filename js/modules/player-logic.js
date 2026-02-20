let listaIds = [];
let indiceActual = -1;
let modo = 'natural'; // 'natural', 'aleatorio', 'repetir'

export function actualizarListaReproduccion(ids) {
    listaIds = ids;
}

export function setModo(nuevoModo) {
    modo = nuevoModo;
}

export function obtenerSiguiente(idActual) {
    indiceActual = listaIds.indexOf(idActual);
    if (modo === 'repetir') return idActual;
    
    if (modo === 'aleatorio') {
        let nuevoIndice;
        do {
            nuevoIndice = Math.floor(Math.random() * listaIds.length);
        } while (nuevoIndice === indiceActual && listaIds.length > 1);
        return listaIds[nuevoIndice];
    }

    // Modo Natural
    const siguiente = indiceActual + 1;
    return siguiente < listaIds.length ? listaIds[siguiente] : listaIds[0];
}

export function obtenerAnterior(idActual) {
    indiceActual = listaIds.indexOf(idActual);
    const anterior = indiceActual - 1;
    return anterior >= 0 ? listaIds[anterior] : listaIds[listaIds.length - 1];
}