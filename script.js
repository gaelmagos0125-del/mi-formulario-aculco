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

// Control de carga asíncrona de la plantilla base
let imagenCargadaExitosamente = false;
const imgBase = new Image();

// Habilitamos CORS de manera explícita en la imagen
imgBase.crossOrigin = "anonymous"; 

// SOLUCIÓN CORS: Usamos un redireccionador seguro para que Imgur no bloquee el canvas en GitHub Pages
imgBase.src = 'https://images.weserv.nl/?url=i.imgur.com/uR2T7O4.png'; 

imgBase.onload = () => {
    canvas.width = imgBase.width;
    canvas.height = imgBase.height;
    imagenCargadaExitosamente = true;
};

imgBase.onerror = () => {
    console.error("No se pudo cargar la imagen del formulario. Compruebe la conexión o políticas de CORS.");
};

// Llenado dinámico de selectores
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

// Navegación multipaso
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

// Visibilidad del campo "Testigos"
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

// Procesamiento de texto considerando saltos de línea reales (Enter)
function obtenerLineasTexto(texto, maxCaracteres) {
    const parrafos = texto.split('\n');
    let lineasFinales = [];

    parrafos.forEach(parrafo => {
        const palabras = parrafo.split(' ');
        let lineaActual = '';

        palabras.forEach(palabra => {
            if ((lineaActual + palabra).length <= maxCaracteres) {
                lineaActual += (lineaActual === '' ? '' : ' ') + palabra;
            } else {
                lineasFinales.push(lineaActual);
                lineaActual = palabra;
            }
        });
        if (lineaActual !== '') lineasFinales.push(lineaActual);
        if (parrafo === '') lineasFinales.push(''); 
    });

    return lineasFinales;
}

// Dibujado sobre el Canvas y exportación segura a Imagen
function generarImagenImpresion() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgBase, 0, 0);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 26px Arial';

    // 1. Tipo de Trámite
    const tipoTramite = document.getElementById('tipo_tramite').value;
    if (tipoTramite === 'QUEJA') ctx.fillText('X', 270, 83);
    if (tipoTramite === 'DENUNCIA') ctx.fillText('X', 570, 83);
    if (tipoTramite === 'SUGERENCIA') ctx.fillText('X', 863, 83);

    // 2. ¿Cómo presentó su queja?
    const formaPres = document.getElementById('forma_presentacion').value;
    if (formaPres === 'PERSONAL') ctx.fillText('X', 158, 192);
    if (formaPres === 'TELEFONO') ctx.fillText('X', 351, 192);
    if (formaPres === 'BUZON') ctx.fillText('X', 158, 260);
    if (formaPres === 'CORREO') ctx.fillText('X', 351, 260);

    // 3. Datos del Solicitante
    ctx.font = '19px Courier New';
    ctx.fillText(document.getElementById('sol_nombre').value || '', 560, 172);
    ctx.fillText(document.getElementById('sol_domicilio').value || '', 560, 203);
    ctx.fillText(document.getElementById('sol_colonia').value || '', 560, 235);
    ctx.fillText(document.getElementById('sol_municipio').value || '', 560, 266);
    ctx.fillText(document.getElementById('sol_estado').value || '', 755, 266);
    ctx.fillText(document.getElementById('sol_telefono').value || '', 560, 292);
    ctx.fillText(document.getElementById('sol_correo').value || '', 560, 321);

    // 4. ¿Contra quién presenta?
    ctx.fillText(document.getElementById('den_nombre').value || 'N/A', 280, 385);
    ctx.fillText(document.getElementById('den_cargo').value || 'N/A', 280, 415);
    ctx.fillText(document.getElementById('den_area').value || 'N/A', 280, 448);
    ctx.fillText(document.getElementById('den_municipio').value || 'Aculco', 280, 492);

    // 5. Hechos fecha y lugar
    const fecha = document.getElementById('hechos_fecha').value;
    ctx.fillText(fecha ? fecha.split('-').reverse().join('/') : '', 690, 385);
    ctx.fillText(document.getElementById('hechos_hora').value || '', 690, 425);
    ctx.fillText(document.getElementById('hechos_lugar').value || '', 690, 478);

    // 6. Descripción de Hechos
    const desc = document.getElementById('hechos_descripcion').value || '';
    const lineasDeDescripcion = obtenerLineasTexto(desc, 82); 
    let yStart = 552;
    
    const maxLineasPermitidas = 8; 
    const lineasARenderizar = lineasDeDescripcion.slice(0, maxLineasPermitidas);

    lineasARenderizar.forEach(linea => {
        ctx.fillText(linea, 65, yStart);
        yStart += 22; 
    });

    // 7. Pruebas
    ctx.font = 'bold 26px Arial';
    document.querySelectorAll('.prueba-check:checked').forEach(cb => {
        const val = cb.value;
        if (val === 'FOTOGRAFIAS') ctx.fillText('X', 202, 750);
        if (val === 'VIDEOS') ctx.fillText('X', 202, 775);
        if (val === 'DOCUMENTOS') ctx.fillText('X', 202, 801);
        if (val === 'AUDIOS') ctx.fillText('X', 174, 826);
    });

    // 8. Testigos
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

    // El evento onload se asegura de que la imagen en base64 se cargue en el DOM antes de imprimir
    printImage.onload = () => {
        window.print();
        
        // Restaurar botón
        btnImprimir.innerHTML = 'Imprimir Documento <i class="fa-solid fa-print"></i>';
        btnImprimir.disabled = false;
    };

    // Asignar el base64 a la imagen del print-area
    printImage.src = canvas.toDataURL('image/png');
}

// Ejecución segura del flujo de impresión
btnImprimir.addEventListener('click', () => {
    if (!imagenCargadaExitosamente) {
        alert("La plantilla del formulario aún se está descargando. Por favor, intente de nuevo en un segundo.");
        return;
    }
    
    btnImprimir.innerHTML = 'Generando... <i class="fa-solid fa-spinner fa-spin"></i>';
    btnImprimir.disabled = true;

    try {
        generarImagenImpresion();
    } catch (error) {
        console.error("Error al generar imagen de impresión:", error);
        alert("Hubo un problema al renderizar el documento.");
        btnImprimir.innerHTML = 'Imprimir Documento <i class="fa-solid fa-print"></i>';
        btnImprimir.disabled = false;
    }
});

// Sanitización de entradas en tiempo real
document.addEventListener("DOMContentLoaded", () => {
    const camposNombres = ['sol_nombre', 'den_nombre', 'testigo_nombre'];
    const camposTelefonos = ['sol_telefono', 'testigo_telefono'];

    camposNombres.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            });
        }
    });

    camposTelefonos.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '');
            });
        }
    });
});
