// Lista completa de personas
const nombresCompletos = [
    "Nelson Edgardo Hernandez Hernandez - CH AMSS",
    "Ariel Alfredo Elias Alvarez - CH AMSS",
    "Fernanda Estefania Peña Valladares - CH APLAN",
    "Astrid Hillary Campos de Jimenez -CH AMSS"
];


// Capturar elementos del DOM
const form = document.getElementById('attendanceForm');
const tableBody = document.querySelector('#attendanceTable tbody');
const searchNameInput = document.getElementById('searchName'); // Barra de búsqueda para el historial
const showAbsencesButton = document.getElementById('showAbsencesButton'); // Botón de mostrar ausencias
const absenceDateInput = document.getElementById('absenceDate'); // Campo de selección de fecha de ausencias
const absencesTableBody = document.getElementById('absencesTableBody'); // Cuerpo de la tabla para mostrar ausencias
const downloadXlsxButton = document.getElementById('downloadXlsx'); // Botón para descargar Excel
const downloadAbsencesXlsxButton = document.getElementById('downloadAbsencesXlsx'); // Botón para descargar ausencias en Excel

function loadFromLocalStorage() {
    const storedData = localStorage.getItem('attendanceRecords');
    if (storedData) {
        const records = JSON.parse(storedData);
        // Si algún registro no tiene fecha/hora de entrada o salida, lo podemos corregir aquí
        records.forEach(record => {
            // Asegurarse de que se carga correctamente el formato de los registros
            const { nombre, horaEntrada, fechaEntrada, horaSalida, fechaSalida, botonDeshabilitado } = record;
            addRowToTable(nombre, horaEntrada || '', fechaEntrada || '', horaSalida || '', fechaSalida || '', botonDeshabilitado || false);
        });
    }
}

// Función para filtrar registros por fecha seleccionada (usando fecha de entrada)
function filtrarPorFecha(fechaSeleccionada) {
    tableBody.innerHTML = ''; // Limpiar la tabla antes de mostrar los registros filtrados

    const storedData = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

    // Filtrar los registros que coincidan con la fecha de entrada seleccionada
    const registrosFiltrados = storedData.filter(record => formatearFecha(record.fechaEntrada) === formatearFecha(fechaSeleccionada));

    // Mostrar solo los registros filtrados
    registrosFiltrados.forEach(record => {
        addRowToTable(record.nombre, record.horaEntrada, record.fechaEntrada, record.horaSalida, record.fechaSalida, record.botonDeshabilitado);
    });

    if (registrosFiltrados.length === 0) {
        // Si no hay registros para la fecha seleccionada, mostrar un mensaje
        tableBody.innerHTML = '<tr><td colspan="6">No hay registros para la fecha seleccionada.</td></tr>';
    }
}

// Función para restaurar el historial completo sin filtro
function limpiarFiltro() {
    tableBody.innerHTML = ''; // Limpiar la tabla
    loadFromLocalStorage(); // Cargar todos los registros nuevamente
}

// Evento para el botón de filtrar por fecha
const filterButton = document.getElementById('filterButton');
filterButton.addEventListener('click', function () {
    const filterDate = document.getElementById('filterDate').value;

    // Validar que haya una fecha seleccionada
    if (!filterDate) {
        alert('Por favor, selecciona una fecha.');
        return;
    }

    // Filtrar los registros por la fecha seleccionada
    filtrarPorFecha(filterDate);
});

// Evento para el botón de limpiar filtro
const clearFilterButton = document.getElementById('clearFilterButton');
clearFilterButton.addEventListener('click', limpiarFiltro);

// Función para guardar registros en LocalStorage
function saveToLocalStorage(records) {
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
}

// Función para añadir una nueva fila a la tabla
function addRowToTable(nombre, horaEntrada, fechaEntrada, horaSalida = '', fechaSalida = '', botonDeshabilitado = false) {
    const newRow = document.createElement('tr');

    // Mostrar hora de salida (si está disponible)
    const horaSalidaTd = document.createElement('td');
    horaSalidaTd.textContent = horaSalida || '';

    // Mostrar fecha de salida (si está disponible)
    const fechaSalidaTd = document.createElement('td');
    fechaSalidaTd.textContent = fechaSalida || '';  // Mostrar vacío si no hay fecha de salida aún

    const botonSalida = document.createElement('button');
    botonSalida.textContent = 'Salida';
    botonSalida.classList.add('btn', 'btn-primary');
    botonSalida.disabled = botonDeshabilitado;  // Deshabilitar el botón si ya se presionó

    // Si el botón ya está deshabilitado, cambiar el estilo
    if (botonDeshabilitado) {
        botonSalida.style.backgroundColor = 'blue';
        botonSalida.style.color = 'white';
    }

    // Evento click para registrar la salida
    botonSalida.addEventListener('click', function () {
        const now = new Date();
        const horaSalida = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const fechaSalida = formatearFecha(now);

        // Actualizar celdas con hora y fecha de salida
        horaSalidaTd.textContent = horaSalida;
        fechaSalidaTd.textContent = fechaSalida;

        // Deshabilitar el botón de salida
        botonSalida.disabled = true;
        botonSalida.style.backgroundColor = 'blue';
        botonSalida.style.color = 'white';

        // Actualizar el almacenamiento local
        const storedData = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        const updatedRecords = storedData.map(record => {
            if (record.nombre === nombre && record.fechaEntrada === fechaEntrada) {
                record.horaSalida = horaSalida;
                record.fechaSalida = fechaSalida;
                record.botonDeshabilitado = true;
            }
            return record;
        });
        saveToLocalStorage(updatedRecords);
    });

    // Crear fila en la tabla
    newRow.innerHTML = `
        <td>${nombre}</td>
        <td>${horaEntrada}</td>
        <td>${fechaEntrada}</td>
    `;
    newRow.appendChild(horaSalidaTd);
    newRow.appendChild(fechaSalidaTd);

    // Añadir botón de acción
    const accionTd = document.createElement('td');
    accionTd.appendChild(botonSalida);
    newRow.appendChild(accionTd);

    // Añadir la nueva fila al cuerpo de la tabla
    tableBody.appendChild(newRow);
}

// Función para formatear la fecha a "YYYY-MM-DD" (para uniformidad en la comparación)
function formatearFecha(fecha) {
    const dateObj = new Date(fecha);
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Añadir cero si es necesario
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Función para mostrar ausencias para todas las fechas en el historial
function mostrarAusenciasParaTodosLosDias() {
    // Limpiar la tabla de ausencias
    absencesTableBody.innerHTML = '';

    // Cargar los registros desde LocalStorage
    const storedData = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

    // Obtener todas las fechas únicas en las que hay registros en el historial de asistencia
    const fechasUnicas = [...new Set(storedData.map(record => record.fechaEntrada))];

    // Iterar sobre cada fecha única y obtener las ausencias para cada fecha
    fechasUnicas.forEach(fecha => {
        // Filtrar los registros que coincidan con la fecha
        const registrosDelDia = storedData.filter(record => formatearFecha(record.fechaEntrada) === formatearFecha(fecha));

        // Obtener los nombres de las personas que asistieron en esa fecha
        const asistentesFecha = registrosDelDia.map(record => record.nombre.trim().toLowerCase());

        // Normalizar los nombres completos para comparación
        const nombresNormalizados = nombresCompletos.map(nombre => nombre.trim().toLowerCase());

        // Obtener la lista de ausentes comparando con los asistentes
        const ausentes = nombresNormalizados.filter(nombre => !asistentesFecha.includes(nombre));

        // Mostrar ausencias en la tabla HTML por fecha
        ausentes.forEach(ausente => {
            const nombreOriginal = nombresCompletos.find(n => n.trim().toLowerCase() === ausente); // Recuperar el nombre original
            const newRow = document.createElement('tr');
            newRow.innerHTML = `<td>${nombreOriginal}</td><td>${fecha}</td>`;
            absencesTableBody.appendChild(newRow);
        });

        // Si todos asistieron en esa fecha, mostrar un mensaje indicándolo
        if (ausentes.length === 0) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `<td colspan="2">Todas las personas asistieron el día ${fecha}.</td>`;
            absencesTableBody.appendChild(newRow);
        }
    });

    // Si no hay fechas registradas, mostrar un mensaje
    if (fechasUnicas.length === 0) {
        absencesTableBody.innerHTML = '<tr><td colspan="2">No hay registros de asistencia en el historial.</td></tr>';
    }
}

// Función para descargar la lista de ausencias en Excel
function descargarAusenciasExcel() {
    const wb = XLSX.utils.book_new(); // Crear un nuevo libro de Excel
    const ws_data = [['Nombre', 'Fecha de Ausencia']]; // Encabezados

    const rows = absencesTableBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const columns = rows[i].getElementsByTagName('td');
        ws_data.push([columns[0].textContent, columns[1].textContent]);
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data); // Convertir los datos en hoja de Excel
    XLSX.utils.book_append_sheet(wb, ws, 'Ausencias'); // Añadir la hoja al libro
    XLSX.writeFile(wb, 'ausencias.xlsx'); // Guardar el archivo Excel
}

// Función para limpiar las ausencias
function limpiarAusencias() {
    absencesTableBody.innerHTML = '';
}

// Función para descargar el historial de asistencia en Excel
function descargarExcel() {
    const wb = XLSX.utils.book_new(); // Crear un nuevo libro de Excel
    const ws_data = [['Nombre', 'Hora de Entrada', 'Fecha de Entrada', 'Hora de Salida', 'Fecha de Salida']]; // Encabezados

    const rows = tableBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const columns = rows[i].getElementsByTagName('td');
        ws_data.push([columns[0].textContent, columns[1].textContent, columns[2].textContent, columns[3].textContent, columns[4].textContent]);
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data); // Convertir los datos en hoja de Excel
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia'); // Añadir la hoja al libro
    XLSX.writeFile(wb, 'reporte_asistencia.xlsx'); // Guardar el archivo Excel
}

// Función para descargar el historial de asistencia y ausencias en un archivo Excel consolidado
function descargarConsolidadoExcel() {
    const wb = XLSX.utils.book_new(); // Crear un nuevo libro de Excel

    // --- Hoja 1: Historial de Asistencia ---
    const asistenciaData = [['Nombre', 'Hora de Entrada', 'Fecha de Entrada', 'Hora de Salida', 'Fecha de Salida']]; // Encabezados
    const attendanceRows = tableBody.getElementsByTagName('tr');
    for (let i = 0; i < attendanceRows.length; i++) {
        const columns = attendanceRows[i].getElementsByTagName('td');
        asistenciaData.push([columns[0].textContent, columns[1].textContent, columns[2].textContent, columns[3].textContent, columns[4].textContent]);
    }
    const asistenciaSheet = XLSX.utils.aoa_to_sheet(asistenciaData); // Convertir datos a hoja de Excel
    XLSX.utils.book_append_sheet(wb, asistenciaSheet, 'Asistencia'); // Añadir la hoja al libro

    // --- Hoja 2: Ausencias ---
    const ausenciasData = [['Nombre', 'Fecha de Ausencia']]; // Encabezados
    const ausenciasRows = absencesTableBody.getElementsByTagName('tr');
    for (let i = 0; i < ausenciasRows.length; i++) {
        const columns = ausenciasRows[i].getElementsByTagName('td');
        ausenciasData.push([columns[0].textContent, columns[1].textContent]);
    }
    const ausenciasSheet = XLSX.utils.aoa_to_sheet(ausenciasData); // Convertir datos a hoja de Excel
    XLSX.utils.book_append_sheet(wb, ausenciasSheet, 'Ausencias'); // Añadir la hoja al libro

    // Descargar el archivo consolidado
    XLSX.writeFile(wb, 'reporte_consolidado.xlsx');
}

// Evento para capturar el registro de asistencia
form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Obtener el nombre ingresado o seleccionado
    const nombreInput = document.getElementById('nombre');
    const nombre = nombreInput.value;

    if (!nombre) {
        alert('Por favor, seleccione o escriba un nombre válido');
        return;
    }

    // Obtener la fecha y hora actuales
    const now = new Date();
    const horaEntrada = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const fechaEntrada = formatearFecha(now);  // Obtener la fecha de entrada

    // Añadir la nueva fila a la tabla
    addRowToTable(nombre, horaEntrada, fechaEntrada);

    // Guardar los datos en LocalStorage
    const storedData = localStorage.getItem('attendanceRecords')
        ? JSON.parse(localStorage.getItem('attendanceRecords'))
        : [];
    storedData.push({ nombre, horaEntrada, fechaEntrada, horaSalida: '', fechaSalida: '', botonDeshabilitado: false });
    saveToLocalStorage(storedData);

    // Limpiar el formulario
    form.reset();
});

// Función para buscar por nombre en el historial de asistencia
searchNameInput.addEventListener('input', function () {
    const filter = searchNameInput.value.toLowerCase(); // Obtener el valor de la búsqueda
    const rows = tableBody.getElementsByTagName('tr'); // Obtener las filas del historial de asistencia

    for (let i = 0; i < rows.length; i++) {
        const nombre = rows[i].getElementsByTagName('td')[0].textContent.toLowerCase(); // Obtener el nombre de cada fila
        if (nombre.indexOf(filter) > -1) {
            rows[i].style.display = ''; // Mostrar la fila si coincide
        } else {
            rows[i].style.display = 'none'; // Ocultar la fila si no coincide
        }
    }
});

// Mostrar ausencias cuando se presiona el botón
showAbsencesButton.addEventListener('click', mostrarAusenciasParaTodosLosDias);

// Limpiar ausencias cuando se presiona el botón de limpiar
clearAbsencesButton.addEventListener('click', limpiarAusencias);

// Descargar Excel
downloadXlsxButton.addEventListener('click', descargarExcel);

// Descargar ausencias en Excel
downloadAbsencesXlsxButton.addEventListener('click', descargarAusenciasExcel);

// Capturar el evento del nuevo botón de consolidado
const downloadConsolidadoButton = document.getElementById('downloadConsolidadoXlsx');
downloadConsolidadoButton.addEventListener('click', descargarConsolidadoExcel);

// Capturar el botón para alternar el modo oscuro
const toggleDarkModeButton = document.getElementById('toggleDarkMode');

// PIN de administrador (cámbialo por el que desees)
const adminPin = "221322"; // Cambia este PIN por el que quieras

// Obtener referencias a los elementos del DOM
const deleteHistoryButton = document.getElementById('deleteHistoryButton');
const pinModal = document.getElementById('pinModal');
const adminPinInput = document.getElementById('adminPinInput');
const confirmPinButton = document.getElementById('confirmPinButton');
const cancelPinButton = document.getElementById('cancelPinButton');
const pinError = document.getElementById('pinError');

// Función para abrir el modal del PIN
deleteHistoryButton.addEventListener('click', function () {
    pinModal.style.display = 'block';
    adminPinInput.value = ''; // Limpiar el campo de PIN
    pinError.style.display = 'none'; // Ocultar el error de PIN
});

// Función para cerrar el modal del PIN sin hacer nada
cancelPinButton.addEventListener('click', function () {
    pinModal.style.display = 'none';
});

// Función para verificar el PIN y borrar el historial si es correcto
confirmPinButton.addEventListener('click', function () {
    const enteredPin = adminPinInput.value;

    // Verificar si el PIN es correcto
    if (enteredPin === adminPin) {
        // Borrar historial
        tableBody.innerHTML = ''; // Limpiar la tabla de asistencia
        localStorage.removeItem('attendanceRecords'); // Eliminar del LocalStorage

        alert('Historial de asistencias eliminado correctamente.');

        // Cerrar el modal
        pinModal.style.display = 'none';
    } else {
        // Mostrar error si el PIN es incorrecto
        pinError.style.display = 'block';
    }
});

// Cerrar el modal si se hace clic fuera de él
window.onclick = function (event) {
    if (event.target === pinModal) {
        pinModal.style.display = 'none';
    }
};

// Función para alternar entre modo claro y oscuro
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode'); // Alternar la clase 'dark-mode'

    // Guardar la preferencia del usuario en localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        toggleDarkModeButton.textContent = 'Desactivar Modo Oscuro';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        toggleDarkModeButton.textContent = 'Activar Modo Oscuro';
    }
}

// Verificar si el usuario ya había activado el modo oscuro
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    toggleDarkModeButton.textContent = 'Desactivar Modo Oscuro';
}

// Agregar el evento de clic al botón
toggleDarkModeButton.addEventListener('click', toggleDarkMode);

// Cargar registros existentes al cargar la página
window.onload = function () {
    loadFromLocalStorage();
};