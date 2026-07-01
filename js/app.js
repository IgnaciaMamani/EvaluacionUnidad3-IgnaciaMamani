const formulario = document.querySelector("#formulario-inscripcion");

const nombreInput = document.querySelector("#nombre");
const correoInput = document.querySelector("#correo");
const confirmarCorreoInput = document.querySelector("#confirmar-correo");
const edadInput = document.querySelector("#edad");
const tallerSelect = document.querySelector("#taller");

const botonGuardar = document.querySelector("#boton-guardar");
const mensajeFormulario = document.querySelector("#mensaje-formulario");

const busquedaInput = document.querySelector("#busqueda");
const listaParticipantes = document.querySelector("#lista-participantes");
const sinParticipantes = document.querySelector("#sin-participantes");
const totalParticipantes = document.querySelector("#total-participantes");

const campos = [
    nombreInput,
    correoInput,
    confirmarCorreoInput,
    edadInput,
    tallerSelect
];

let participantes = [];
let participanteEditandoId = null;

function mostrarError(campo, mensaje) {
    campo.classList.add("invalido");

    const elementoError = document.querySelector(
        `#error-${campo.id}`
    );

    elementoError.textContent = mensaje;
}

function limpiarError(campo) {
    campo.classList.remove("invalido");

    const elementoError = document.querySelector(
        `#error-${campo.id}`
    );

    elementoError.textContent = "";
}

function validarFormulario() {
    let esValido = true;

    campos.forEach((campo) => limpiarError(campo));

    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    const confirmarCorreo = confirmarCorreoInput.value.trim();
    const edad = Number(edadInput.value);
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nombre === "") {
        mostrarError(nombreInput, "El nombre es obligatorio.");
        esValido = false;
    } else if (nombre.length < 3) {
        mostrarError(
            nombreInput,
            "El nombre debe tener al menos 3 caracteres."
        );
        esValido = false;
    }

    if (correo === "") {
        mostrarError(correoInput, "El correo es obligatorio.");
        esValido = false;
    } else if (!formatoCorreo.test(correo)) {
        mostrarError(
            correoInput,
            "Ingresa un correo electrónico válido."
        );
        esValido = false;
    }

    if (confirmarCorreo === "") {
        mostrarError(
            confirmarCorreoInput,
            "Debes confirmar el correo."
        );
        esValido = false;
    } else if (confirmarCorreo !== correo) {
        mostrarError(
            confirmarCorreoInput,
            "Los correos no coinciden."
        );
        esValido = false;
    }

    if (edadInput.value === "") {
        mostrarError(edadInput, "La edad es obligatoria.");
        esValido = false;
    } else if (
        !Number.isInteger(edad) ||
        edad < 16 ||
        edad > 100
    ) {
        mostrarError(
            edadInput,
            "La edad debe estar entre 16 y 100 años."
        );
        esValido = false;
    }

    if (tallerSelect.value === "") {
        mostrarError(tallerSelect, "Selecciona un taller.");
        esValido = false;
    }

    return esValido;
}

function guardarParticipantes() {
    localStorage.setItem(
        "participantes",
        JSON.stringify(participantes)
    );
}

function cargarParticipantes() {
    try {
        const datosGuardados = JSON.parse(
            localStorage.getItem("participantes")
        );

        participantes = Array.isArray(datosGuardados)
            ? datosGuardados
            : [];
    } catch (error) {
        participantes = [];
        localStorage.removeItem("participantes");

        console.warn(
            "No se pudieron recuperar los participantes.",
            error
        );
    }
}

function obtenerNombreTaller(valor) {
    const talleres = {
        "programacion-web": "Programación web",
        "diseno-digital": "Diseño digital",
        "marketing-digital": "Marketing digital"
    };

    return talleres[valor] ?? "Taller no disponible";
}

function crearTarjetaParticipante(participante) {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("tarjeta-participante");

    const nombre = document.createElement("h3");
    nombre.textContent = participante.nombre;

    const correo = document.createElement("p");
    correo.textContent = `Correo: ${participante.correo}`;

    const edad = document.createElement("p");
    edad.textContent = `Edad: ${participante.edad} años`;

    const taller = document.createElement("p");
    taller.textContent =
        `Taller: ${obtenerNombreTaller(participante.taller)}`;

    const acciones = document.createElement("div");
    acciones.classList.add("acciones-tarjeta");

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.classList.add("boton-editar");
    botonEditar.dataset.accion = "editar";
    botonEditar.dataset.id = participante.id;
    botonEditar.textContent = "Editar";

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.classList.add("boton-eliminar");
    botonEliminar.dataset.accion = "eliminar";
    botonEliminar.dataset.id = participante.id;
    botonEliminar.textContent = "Eliminar";

    acciones.append(botonEditar, botonEliminar);

    tarjeta.append(
        nombre,
        correo,
        edad,
        taller,
        acciones
    );

    return tarjeta;
}

function renderizarParticipantes(
    lista = participantes
) {
    listaParticipantes.replaceChildren();

    const listaVacia = lista.length === 0;

    sinParticipantes.hidden = !listaVacia;

    if (listaVacia) {
        sinParticipantes.textContent =
            participantes.length === 0
                ? "Todavía no existen participantes registrados."
                : "No se encontraron participantes.";
    }

    lista.forEach((participante) => {
        const tarjeta = crearTarjetaParticipante(participante);
        listaParticipantes.append(tarjeta);
    });

    totalParticipantes.textContent = participantes.length;
}

function mostrarMensaje(texto, tipo) {
    mensajeFormulario.textContent = texto;
    mensajeFormulario.className =
        `mensaje-formulario ${tipo}`;
}

function limpiarEstadoFormulario() {
    campos.forEach((campo) => limpiarError(campo));

    participanteEditandoId = null;
    botonGuardar.textContent = "Guardar participante";
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    mensajeFormulario.textContent = "";

    if (!validarFormulario()) {
        mostrarMensaje(
            "Corrige los campos marcados.",
            "error"
        );
        return;
    }

    const correoNormalizado =
        correoInput.value.trim().toLowerCase();

    const correoRepetido = participantes.some(
        (participante) =>
            participante.correo === correoNormalizado &&
            participante.id !== participanteEditandoId
    );

    if (correoRepetido) {
        mostrarError(
            correoInput,
            "Este correo ya está registrado."
        );
        mostrarMensaje(
            "No se pudo guardar el participante.",
            "error"
        );
        return;
    }

    const esEdicion = participanteEditandoId !== null;

    const participante = {
        id: participanteEditandoId ?? Date.now().toString(),
        nombre: nombreInput.value.trim(),
        correo: correoNormalizado,
        edad: Number(edadInput.value),
        taller: tallerSelect.value
    };

    if (esEdicion) {
        participantes = participantes.map(
            (participanteActual) =>
                participanteActual.id === participanteEditandoId
                    ? participante
                    : participanteActual
        );
    } else {
        participantes.push(participante);
    }

    guardarParticipantes();
    renderizarParticipantes();

    formulario.reset();
    limpiarEstadoFormulario();

    mostrarMensaje(
        esEdicion
            ? "Participante actualizado correctamente."
            : "Participante registrado correctamente.",
        "exito"
    );
});
function editarParticipante(id) {
    const participante = participantes.find(
        (elemento) => elemento.id === id
    );

    if (!participante) {
        return;
    }

    nombreInput.value = participante.nombre;
    correoInput.value = participante.correo;
    confirmarCorreoInput.value = participante.correo;
    edadInput.value = participante.edad;
    tallerSelect.value = participante.taller;

    participanteEditandoId = participante.id;
    botonGuardar.textContent = "Actualizar participante";

    campos.forEach((campo) => limpiarError(campo));

    mostrarMensaje(
        "Edita los datos y guarda los cambios.",
        "exito"
    );

    formulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    nombreInput.focus();
}

function eliminarParticipante(id) {
    const participante = participantes.find(
        (elemento) => elemento.id === id
    );

    if (!participante) {
        return;
    }

    const confirmarEliminacion = window.confirm(
        `¿Deseas eliminar a ${participante.nombre}?`
    );

    if (!confirmarEliminacion) {
        return;
    }

    participantes = participantes.filter(
        (elemento) => elemento.id !== id
    );

    guardarParticipantes();
    renderizarParticipantes();

    if (participanteEditandoId === id) {
        formulario.reset();
        limpiarEstadoFormulario();
    }

    mostrarMensaje(
        "Participante eliminado correctamente.",
        "exito"
    );
}

listaParticipantes.addEventListener("click", (evento) => {
    const boton = evento.target.closest(
        "button[data-accion]"
    );

    if (!boton) {
        return;
    }

    const { accion, id } = boton.dataset;

    if (accion === "editar") {
        editarParticipante(id);
    }

    if (accion === "eliminar") {
        eliminarParticipante(id);
    }
});

[
    nombreInput,
    correoInput,
    confirmarCorreoInput,
    edadInput
].forEach((campo) => {
    campo.addEventListener("input", () => {
        limpiarError(campo);
        mensajeFormulario.textContent = "";
    });
});

tallerSelect.addEventListener("change", () => {
    limpiarError(tallerSelect);
    mensajeFormulario.textContent = "";
});

busquedaInput.addEventListener("input", () => {
    const termino = busquedaInput.value
        .trim()
        .toLowerCase();

    const resultados = participantes.filter(
        (participante) =>
            participante.nombre
                .toLowerCase()
                .includes(termino) ||
            participante.correo.includes(termino) ||
            obtenerNombreTaller(participante.taller)
                .toLowerCase()
                .includes(termino)
    );

    renderizarParticipantes(resultados);
});

document
    .querySelector("#boton-limpiar")
    .addEventListener("click", () => {
        limpiarEstadoFormulario();
        mensajeFormulario.textContent = "";
        mensajeFormulario.className =
            "mensaje-formulario";
    });

cargarParticipantes();
renderizarParticipantes();