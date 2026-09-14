let lista = [];

let ganadores = JSON.parse(localStorage.getItem("ganadores")) || [];

let sorteos = JSON.parse(localStorage.getItem("sorteos")) || [];

// ============================================================
// CARGAR ARCHIVO
// ============================================================

document
    .getElementById("archivo")
    .addEventListener("change", function (e) {
        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (e) {
            const participantesOriginales = e.target.result
                .split(/\r?\n/)
                .map((x) => x.trim())
                .filter((x) => x.length > 0);

            // Detectar cuántos participantes del archivo
            // ya fueron ganadores
            const ganadoresAnteriores =
                participantesOriginales.filter((item) =>
                    ganadores.includes(item)
                );

            // Excluir ganadores anteriores
            lista = participantesOriginales.filter(
                (item) => !ganadores.includes(item)
            );

            actualizarEstado();

            alert(
                `Archivo cargado correctamente.\n\n` +
                `Participantes en el archivo: ${participantesOriginales.length}\n` +
                `Ganadores anteriores excluidos: ${ganadoresAnteriores.length}\n` +
                `Participantes disponibles: ${lista.length}`
            );
        };

        reader.readAsText(file);
    });


// ============================================================
// SORTEAR
// ============================================================

function sortear() {
    const cantidad = parseInt(
        document.getElementById("cantidad").value
    );

    const btn =
        document.getElementById("botonSortear");

    const countdownDiv =
        document.getElementById("cuenta-regresiva");


    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Por favor, ingresa una cantidad válida.");
        return;
    }


    if (lista.length < cantidad) {
        alert(
            `No hay suficientes participantes disponibles.\n\n` +
            `Participantes disponibles: ${lista.length}\n` +
            `Cantidad solicitada: ${cantidad}`
        );

        return;
    }


    let segundos = 5;

    countdownDiv.textContent = segundos;

    btn.disabled = true;


    const interval = setInterval(() => {
        segundos--;

        countdownDiv.textContent =
            segundos > 0 ? segundos : "";


        if (segundos === 0) {
            clearInterval(interval);

            ejecutarSorteo(cantidad);

            btn.disabled = false;
        }
    }, 1000);
}


// ============================================================
// EJECUTAR SORTEO
// ============================================================

function ejecutarSorteo(cantidad) {
    let nuevosGanadores = [];

    for (let i = 0; i < cantidad; i++) {
        const indice = Math.floor(
            Math.random() * lista.length
        );

        const ganador =
            lista.splice(indice, 1)[0];

        nuevosGanadores.push(ganador);

        ganadores.push(ganador);
    }

    // Guardamos todos los ganadores para evitar que vuelvan a salir
    localStorage.setItem(
        "ganadores",
        JSON.stringify(ganadores)
    );

    // Obtenemos el nombre del premio
    const premio = document
        .getElementById("premio")
        .value
        .trim();

    // Guardamos este grupo de ganadores asociado al premio
    sorteos.push({
        premio: premio,
        ganadores: nuevosGanadores
    });

    localStorage.setItem(
        "sorteos",
        JSON.stringify(sorteos)
    );

    mostrarGanadores(nuevosGanadores);

    actualizarContador();
}


// ============================================================
// MOSTRAR GANADORES
// ============================================================

function mostrarGanadores(listaGanadores) {
    const div =
        document.getElementById("ganadores");


    div.innerHTML =
        "<h3>Ganadores sorteados:</h3><ul>" +
        listaGanadores
            .map((g) => `<li>${g}</li>`)
            .join("") +
        "</ul>";


    const ul = div.querySelector("ul");


    if (ganadores.length > 10) {
        ul.classList.add("dos-columnas");
    } else {
        ul.classList.remove("dos-columnas");
    }
}


// ============================================================
// ACTUALIZAR CONTADOR
// ============================================================

function actualizarContador() {
    document.getElementById(
        "contador"
    ).textContent =
        `Ganadores hasta ahora: ${ganadores.length}`;

    actualizarEstado();
}


// ============================================================
// ACTUALIZAR ESTADO
// ============================================================

function actualizarEstado() {
    document.getElementById(
        "participantesDisponibles"
    ).textContent = lista.length;


    document.getElementById(
        "ganadoresGuardados"
    ).textContent = ganadores.length;


    document.getElementById(
        "botonDescargar"
    ).textContent =
        `Descargar ganadores (${ganadores.length})`;


    actualizarAvisoGanadores();
}


// ============================================================
// AVISO DE GANADORES GUARDADOS
// ============================================================

function actualizarAvisoGanadores() {
    const aviso =
        document.getElementById("avisoGanadores");


    if (ganadores.length === 0) {
        aviso.style.display = "none";
        aviso.innerHTML = "";

        return;
    }


    aviso.style.display = "block";


    aviso.innerHTML = `
    ⚠️ Hay
    <strong>${ganadores.length}</strong>
    ganadores guardados actualmente en este navegador.

    <br />

    Si estás comenzando un sorteo nuevo,
    utilizá
    <strong>
      “Nuevo sorteo / Borrar ganadores”
    </strong>
    antes de cargar los participantes.
  `;
}


// ============================================================
// REINICIAR GANADORES
// ============================================================

function reiniciar() {
    if (ganadores.length === 0) {
        alert(
            "No hay ganadores guardados para borrar."
        );

        return;
    }

    const confirmar = confirm(
        `⚠️ ATENCIÓN\n\n` +
        `Hay ${ganadores.length} ganadores guardados.\n\n` +
        `Si continuás, se borrarán todos los ganadores ` +
        `guardados en este navegador.\n\n` +
        `Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    localStorage.removeItem("ganadores");
    localStorage.removeItem("sorteos");

    ganadores = [];
    sorteos = [];

    lista = [];

    document.getElementById(
        "ganadores"
    ).innerHTML = "";

    document.getElementById(
        "archivo"
    ).value = "";

    actualizarContador();

    alert(
        "Nuevo sorteo iniciado.\n\n" +
        "Los ganadores anteriores fueron " +
        "eliminados correctamente."
    );
}


// ============================================================
// DESCARGAR GANADORES
// ============================================================

function descargarGanadores() {
    if (sorteos.length === 0) {
        alert("No hay ganadores para descargar.");

        return;
    }

    const confirmar = confirm(
        `Se van a descargar ` +
        `${ganadores.length} ganadores.\n\n` +
        `¿Querés continuar?`
    );

    if (!confirmar) return;

    let contenido = "";

    sorteos.forEach((sorteo) => {
        contenido += "================================\n";
        contenido += `${sorteo.premio}\n`;
        contenido += "================================\n\n";

        contenido += sorteo.ganadores.join("\n");

        contenido += "\n\n";
    });

    const blob = new Blob(
        [contenido],
        {
            type: "text/plain;charset=utf-8",
        }
    );

    const enlace =
        document.createElement("a");

    enlace.href =
        URL.createObjectURL(blob);

    enlace.download =
        "ganadores.txt";

    enlace.click();

    URL.revokeObjectURL(
        enlace.href
    );
}

// ============================================================
// INICIALIZAR
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {
        actualizarEstado();
    }
);