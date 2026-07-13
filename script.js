const canvas = document.getElementById('formularioCanvas');
const ctx = canvas.getContext('2d');
const printImage = document.getElementById('print-image');

const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnImprimir = document.getElementById('btn-imprimir');

let faseActual = 1;
const totalFases = 4;

// Diccionario de Estados y Municipios para carga dinámica
const estadosMunicipios = {
    "Edo. de México": ["Aculco", "Toluca", "Atlacomulco", "Jilotepec", "Metepec", "Naucalpan", "Ecatepec", "Tlalnepantla"],
    "Ciudad de México": ["Álvaro Obregón", "Benito Juárez", "Coyoacán", "Cuauhtémoc", "Iztapalapa", "Miguel Hidalgo", "Tlalpan"],
    "Querétaro": ["Querétaro", "San Juan del Río", "Corregidora", "El Marqués", "Tequisquiapan", "Huimilpan"],
    "Hidalgo": ["Pachuca", "Tula de Allende", "Tulancingo", "Tizayuca", "Ixmiquilpan", "Huejutla"],
    "Michoacán": ["Morelia", "Uruapan", "Zamora", "Lázaro Cárdenas", "Zitácuaro"]
};

// Carga inicial asíncrona de la imagen
const imgBase = new Image();
imgBase.crossOrigin = "anonymous"; // Evita problemas de CORS al hacer toDataURL
imgBase.src = 'https://i.imgur.com/uR2T7O4.png'; 
imgBase.onload = () => {
    canvas.width = imgBase.width;
    canvas.height = imgBase.height;
};

// FUNCIÓN PARA LLENAR LOS SELECTS DINÁMICAMENTE
function inicializarEstadosYMunicipios() {
    const selectEstado = document.getElementById('sol_estado');
    const selectMunicipio = document.getElementById('sol_municipio');

    if (!selectEstado || !selectMunicipio) return;

    selectEstado.innerHTML = "";
    Object.keys(estadosMunicipios).forEach(estado => {
        const option = document.createElement('option');
        option.value = estado;
        option.textContent = estado;
        selectEstado.appendChild(option);
    });

    selectEstado.addEventListener('change', function() {
        actualizarMunicipios(this.value);
    });

    selectEstado.value = "Edo. de México";
    actualizarMunicipios("Edo. de México");
    selectMunicipio.value = "Aculco";
}

function actualizarMunicipios(estadoSeleccionado) {
    const selectMunicipio = document.getElementById('sol_municipio');
    if (!selectMunicipio) return;
    selectMunicipio.innerHTML = "";

    const municipios = estadosMunicipios[estadoSeleccionado] || [];
    municipios.forEach(municipio => {
        const option = document.createElement('option');
        option.value = municipio;
        option.textContent = municipio;
        selectMunicipio.appendChild(option);
    });
}

inicializarEstadosYMunicipios();

// NAVEGACIÓN ENTRE FASES
btnNext.addEventListener('click', () => {
    if (validarFaseActiva()) {
        if (faseActual < totalFases) cambiarFase(faseActual + 1);
    }
});

btnPrev.addEventListener('click', () => {
    if (faseActual > 1) cambiarFase(faseActual - 1);
});

function validarFaseActiva() {
    const inputsFase = document.querySelectorAll(`#phase-${faseActual} [required]`);
    for (let input of inputsFase) {
        if (!input.checkValidity()) {
            input.reportValidity();
            return false;
        }
    }
    return true;
}

function cambiarFase(nuevaFase) {
    document.getElementById(`phase-${faseActual}`).classList.remove('active-phase');
    document.getElementById(`step-${faseActual}`).classList.remove('active');

    faseActual = nuevaFase;

    document.getElementById(`phase-${faseActual}`).classList.add('active-phase');
    document.getElementById(`step-${faseActual}`).classList.add('active');

    btnPrev.disabled = (faseActual === 1);
    
    if (faseActual === totalFases) {
        btnNext.classList.add('hidden');
        btnImprimir.classList.remove('hidden');
    } else {
        btnNext.classList.remove('hidden');
        btnImprimir.classList.add('hidden');
    }
}

// CONTROL DINÁMICO DE VISIBILIDAD DE TESTIGOS
document.getElementById('hubo_testigos').addEventListener('change', function() {
    const camposTestigo = document.getElementById('campos-testigo');
    if (this.value === 'SI') {
        camposTestigo.classList.remove('hidden-conditional');
    } else {
        camposTestigo.classList.add('hidden-conditional');
        document.getElementById('testigo_nombre').value = '';
        document.getElementById('testigo_telefono').value = '';
        document.getElementById('testigo_domicilio').value = '';
    }
});

// FUNCIÓN AUXILIAR PARA PROCESAR EL TEXTO SIN ROMPER PALABRAS (Word Wrap)
function obtenerLineasTexto(texto, maxCaracteres) {
    const palabras = texto.split(' ');
    let lineas = [];
    let lineaActual = '';

    palabras.forEach(palabra => {
        if ((lineaActual + palabra).length <= maxCaracteres) {
            lineaActual += (lineaActual === '' ? '' : ' ') + palabra;
        } else {
            lineas.push(lineaActual);
            lineaActual = palabra;
        }
    });
    if (lineaActual !== '') lineas.push(lineaActual);
    return lineas;
}

// PROCESAMIENTO GRÁFICO DEL CANVAS
function generarImagenImpresion() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgBase, 0, 0);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 26px Arial';

    // 1. TIPO DE TRÁMITE
    const tipoTramite = document.getElementById('tipo_tramite').value;
    if (tipoTramite === 'QUEJA') ctx.fillText('X', 270, 83);
    if (tipoTramite === 'DENUNCIA') ctx.fillText('X', 570, 83);
    if (tipoTramite === 'SUGERENCIA') ctx.fillText('X', 863, 83);

    // 2. ¿CÓMO PRESENTÓ SU QUEJA?
    const formaPres = document.getElementById('forma_presentacion').value;
    if (formaPres === 'PERSONAL') ctx.fillText('X', 158, 192);
    if (formaPres === 'TELEFONO') ctx.fillText('X', 351, 192);
    if (formaPres === 'BUZON') ctx.fillText('X', 158, 260);
    if (formaPres === 'CORREO') ctx.fillText('X', 351, 260);

    // 3. DATOS DE LA PERSONA QUE PRESENTA
    ctx.font = '19px Courier New';
    ctx.fillText(document.getElementById('sol_nombre').value || '', 560, 172);
    ctx.fillText(document.getElementById('sol_domicilio').value || '', 560, 203);
    ctx.fillText(document.getElementById('sol_colonia').value || '', 560, 235);
    ctx.fillText(document.getElementById('sol_municipio').value || '', 560, 266);
    ctx.fillText(document.getElementById('sol_estado').value || '', 755, 266);
    ctx.fillText(document.getElementById('sol_telefono').value || '', 560, 292);
    ctx.fillText(document.getElementById('sol_correo').value || '', 560, 321);

    // 4. ¿CONTRA QUIÉN PRESENTA?
    ctx.fillText(document.getElementById('den_nombre').value || 'N/A', 280, 385);
    ctx.fillText(document.getElementById('den_cargo').value || 'N/A', 280, 415);
    ctx.fillText(document.getElementById('den_area').value || 'N/A', 280, 448);
    ctx.fillText(document.getElementById('den_municipio').value || 'Aculco', 280, 492);

    // 5. ¿CUÁNDO Y DÓNDE OCURRIERON?
    const fecha = document.getElementById('hechos_fecha').value;
    ctx.fillText(fecha ? fecha.split('-').reverse().join('/') : '', 690, 385);
    ctx.fillText(document.getElementById('hechos_hora').value || '', 690, 425);
    ctx.fillText(document.getElementById('hechos_lugar').value || '', 690, 478);

    // 6. DESCRIPCIÓN POR RENGLONES (Optimizado con Word Wrap)
    const desc = document.getElementById('hechos_descripcion').value || '';
    const lineasDeDescripcion = obtenerLineasTexto(desc, 85); // 85 para dar un margen seguro
    let yStart = 552;
    
    lineasDeDescripcion.forEach(linea => {
        ctx.fillText(linea, 65, yStart);
        yStart += 22; // Incrementado ligeramente a 22 para mejor legibilidad vertical
    });

    // 7. ¿CUENTA CON ALGUNA PRUEBA?
    ctx.font = 'bold 26px Arial';
    document.querySelectorAll('.prueba-check:checked').forEach(cb => {
        const val = cb.value;
        if (val === 'FOTOGRAFIAS') ctx.fillText('X', 202, 750);
        if (val === 'VIDEOS') ctx.fillText('X', 202, 775);
        if (val === 'DOCUMENTOS') ctx.fillText('X', 202, 801);
        if (val === 'AUDIOS') ctx.fillText('X', 174, 826);
    });

    // 8. ¿HUBO TESTIGOS?
    const testigos = document.getElementById('hubo_testigos').value;
    if (testigos === 'SI') {
        ctx.fillText('X', 442, 750); 
        ctx.font = '19px Courier New';
        ctx.fillText(document.getElementById('testigo_nombre').value || '', 460, 812);
        ctx.fillText(document.getElementById('testigo_telefono').value || '', 460, 838);
        ctx.fillText(document.getElementById('testigo_domicilio').value || '', 460, 864);
    } else {
        ctx.fillText('X', 515, 750); 
    }

    // Asignar resultado al elemento img para la ventana de impresión
    printImage.src = canvas.toDataURL('image/jpeg', 1.0);
}

// EJECUCIÓN SEGURA DE IMPRESIÓN
btnImprimir.addEventListener('click', () => {
    // Si la imagen no ha cargado del todo, forzar su carga antes de proceder
    if (!imgBase.complete) {
        imgBase.onload = () => {
            canvas.width = imgBase.width;
            canvas.height = imgBase.height;
            ejecutarFlujoImpresion();
        };
    } else {
        ejecutarFlujoImpresion();
    }
});

function ejecutarFlujoImpresion() {
    generarImagenImpresion();
    // Un pequeño retraso para asegurar que el navegador renderizó el src del printImage
    setTimeout(() => {
        window.print();
    }, 400);
}
