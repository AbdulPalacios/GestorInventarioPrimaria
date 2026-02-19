// Variable global para recordar con quién estamos trabajando
let matriculaActual = "";
let paginaActualHistorial = 1;

/**
 * 1. CARGAR DATOS DEL ALUMNO (Se llama al seleccionar de la lista o al buscar)
 * @param {string} matriculaOpcional - Permite pasar la matrícula directamente
 */
async function cargarAlumno(matriculaOpcional = null) {
    const inputBusqueda = document.getElementById('txtBusquedaAlumno');
    const panel = document.getElementById('panelOperaciones');
    const infoDiv = document.getElementById('infoAlumno');
    const lblMatricula = document.getElementById('lblMatriculaActiva');
    const tabla = document.getElementById('tablaPendientes');

    // Si pasamos matrícula por parámetro la usamos, si no, la leemos del input
    if (matriculaOpcional) {
        matriculaActual = matriculaOpcional;
    } else {
        matriculaActual = inputBusqueda.value.trim();
    }

    if (!matriculaActual) return;

    // UI: Estado de carga
    infoDiv.style.display = 'block';
    lblMatricula.innerText = "Buscando...";
    tabla.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';

    try {
        const response = await fetch(`https://localhost:7082/api/Prestamos/pendientes/${matriculaActual}`);

        if (response.status === 404) {
            alert("❌ Alumno no encontrado o matrícula incorrecta.");
            lblMatricula.innerText = "No encontrado";
            bloquearPanel(true);
            return;
        }

        if (!response.ok) throw new Error("Error en el servidor");

        const listaPrestamos = await response.json();

        // Éxito: Actualizamos la UI
        lblMatricula.innerText = matriculaActual;
        infoDiv.style.backgroundColor = "#e0f2fe"; // Azul claro
        bloquearPanel(false);

        renderizarTabla(listaPrestamos);

        // Foco automático al buscador de materiales para ahorrar tiempo
        const inputMat = document.getElementById('txtBusquedaMaterial');
        if(inputMat) inputMat.focus();

    } catch (error) {
        console.error(error);
        alert("Error de conexión con la API");
    }
}

/**
 * 2. REALIZAR PRÉSTAMO (POST)
 */
async function realizarPrestamo() {
    const materialId = document.getElementById('txtMaterialId').value;
    const msgDiv = document.getElementById('msgPrestamo');
    const inputNombreMat = document.getElementById('txtBusquedaMaterial');

    if (!materialId) return alert("Por favor, selecciona un material de la lista");

    msgDiv.innerText = "Procesando...";
    msgDiv.style.color = "blue";

    try {
        const response = await fetch('https://localhost:7082/api/Prestamos/registrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                matriculaAlumno: matriculaActual,
                materialId: parseInt(materialId)
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Limpiar campos de material
            document.getElementById('txtMaterialId').value = "";
            if(inputNombreMat) inputNombreMat.value = "";
            
            msgDiv.innerText = `✅ Prestado: ${data.material}`;
            msgDiv.style.color = "green";

            // Recargar deudas del alumno automáticamente
            cargarAlumno(matriculaActual); 
        } else {
            msgDiv.innerText = data.mensaje || "Error al prestar";
            msgDiv.style.color = "red";
        }
    } catch (error) {
        console.error(error);
        msgDiv.innerText = "Error de red";
    }

    cargarHistorial();
}

/**
 * 3. DEVOLVER MATERIAL (PUT)
 */
async function devolverMaterial(idReserva) {
    if (!confirm("¿Confirmar devolución? El stock aumentará.")) return;

    try {
        const response = await fetch(`https://localhost:7082/api/Prestamos/devolver/${idReserva}`, {
            method: 'PUT'
        });

        if (response.ok) {
            alert("✅ Material devuelto correctamente");
            cargarAlumno(matriculaActual);
        } else {
            alert("No se pudo procesar la devolución");
        }
    } catch (error) {
        console.error(error);
        alert("Error al conectar");
    }

    cargarHistorial();
}

// --- FUNCIONES DE APOYO Y AUTOCOMPLETADO ---

function renderizarTabla(lista) {
    const tabla = document.getElementById('tablaPendientes');
    tabla.innerHTML = '';

    if (lista.length === 0) {
        tabla.innerHTML = '<tr><td colspan="3" style="text-align:center; color:green;">¡Limpio! No debe nada 🎉</td></tr>';
        return;
    }

    lista.forEach(item => {
    const hoy = new Date();
    const fechaLimite = new Date(item.fechaFin.split('/').reverse().join('-'));
    const esAtrasado = hoy > fechaLimite;

        const fila = `
            <tr style="${esAtrasado ? 'background-color: #fef2f2;' : ''}">
                <td><strong>${item.material}</strong></td>
                <td style="color: ${esAtrasado ? '#dc2626' : 'inherit'}; font-weight: ${esAtrasado ? 'bold' : 'normal'}">
                    ${item.fechaFin} ${esAtrasado ? '⚠️ ATRASADO' : ''}
                </td>
                <td>
                    <button onclick="devolverMaterial(${item.idReserva})" class="btn-rojo">Devolver</button>
                </td>
            </tr>
        `;
        tabla.innerHTML += fila;
    });
}

function bloquearPanel(bloqueado) {
    const panel = document.getElementById('panelOperaciones');
    if (!panel) return;
    panel.style.opacity = bloqueado ? "0.5" : "1";
    panel.style.pointerEvents = bloqueado ? "none" : "all";
}

// --- BUSCADOR DE MATERIALES ---
const inputBusquedaMat = document.getElementById('txtBusquedaMaterial');
const listaSugMat = document.getElementById('listaSugerencias');
const inputIdOculto = document.getElementById('txtMaterialId');

if (inputBusquedaMat) {
    inputBusquedaMat.addEventListener('input', async (e) => {
        const texto = e.target.value;
        if (texto.length < 2) {
            listaSugMat.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`https://localhost:7082/api/Materiales/buscar?termino=${texto}`);
            const materiales = await response.json();

            if (materiales.length > 0) {
                listaSugMat.innerHTML = '';
                materiales.forEach(m => {
                    const item = document.createElement('div');
                    item.className = "sugerencia-item"; // Puedes darle estilos en CSS
                    item.style.padding = '10px';
                    item.style.cursor = 'pointer';
                    item.style.borderBottom = '1px solid #eee';
                    item.innerHTML = `<strong>${m.titulo}</strong> <br> <small>${m.categoria} - Disp: ${m.stockDisponible}</small>`;
                    
                    item.onclick = () => {
                        inputBusquedaMat.value = m.titulo;
                        inputIdOculto.value = m.id;
                        listaSugMat.style.display = 'none';
                    };
                    listaSugMat.appendChild(item);
                });
                listaSugMat.style.display = 'block';
            } else {
                listaSugMat.style.display = 'none';
            }
        } catch (error) { console.error("Error buscando material:", error); }
    });
}

// --- BUSCADOR DE ALUMNOS ---
const inputBusquedaAlum = document.getElementById('txtBusquedaAlumno');
const listaSugAlum = document.getElementById('listaSugerenciasAlumno');

if (inputBusquedaAlum) {
    inputBusquedaAlum.addEventListener('input', async (e) => {
        const texto = e.target.value;
        if (texto.length < 3) {
            listaSugAlum.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`https://localhost:7082/api/Usuarios/buscar?termino=${texto}`);
            const usuarios = await response.json();

            if (usuarios.length > 0) {
                listaSugAlum.innerHTML = '';
                usuarios.forEach(u => {
                    const item = document.createElement('div');
                    item.style.padding = '10px';
                    item.style.cursor = 'pointer';
                    item.style.borderBottom = '1px solid #eee';
                    item.innerHTML = `<strong>${u.nombre}</strong> <br> <small>Mat: ${u.matricula} - ${u.grupo}</small>`;
                    
                    item.onclick = () => {
                        inputBusquedaAlum.value = u.nombre;
                        matriculaActual = u.matricula;

                        document.getElementById('lblNombreAlumnoActivo').innerText = u.nombre;
                        document.getElementById('lblMatriculaActiva').innerText = u.matricula;
                        
                        cargarAlumno(u.matricula); // Carga automática
                        listaSugAlum.style.display = 'none';
                    };
                    listaSugAlum.appendChild(item);
                });
                listaSugAlum.style.display = 'block';
            } else {
                listaSugAlum.style.display = 'none';
            }
        } catch (error) { console.error("Error buscando alumno:", error); }
    });
}

// Cerrar listas si se hace clic fuera
document.addEventListener('click', (e) => {
    if (listaSugMat && e.target !== inputBusquedaMat) listaSugMat.style.display = 'none';
    if (listaSugAlum && e.target !== inputBusquedaAlum) listaSugAlum.style.display = 'none';
});

// Cargar historial al abrir la página
document.addEventListener('DOMContentLoaded', cargarHistorial);

async function cargarHistorial() {
    paginaActualHistorial = 1; // Reiniciamos a la página 1
    const tabla = document.getElementById('tablaHistorial');
    tabla.innerHTML = '<tr><td colspan="4" style="text-align:center;">Cargando...</td></tr>';

    await traerDatosHistorial(false); // false significa "no es carga extra, es limpieza"
}

async function traerDatosHistorial(esCargaExtra = false) {
    const tabla = document.getElementById('tablaHistorial');
    
    try {
        const response = await fetch(`https://localhost:7082/api/Prestamos/historial?pagina=${paginaActualHistorial}&cantidad=10`);
        const datos = await response.json();

        if (!esCargaExtra) tabla.innerHTML = ''; // Si no es carga extra, limpiamos la tabla

        if (datos.length === 0 && esCargaExtra) {
            alert("Ya no hay más registros para mostrar.");
            return;
        }

        datos.forEach(h => {
            const hoy = new Date();
            const fechaVencimiento = new Date(h.fechaVencimiento);
            
            let estiloFila = "";
            let badgeEstado = "";

            if (h.estado === "Activo") {
                // ¿Ya se pasó de la fecha límite?
                if (hoy > fechaVencimiento) {
                    // ROJO: Atrasado 🚩
                    estiloFila = "background-color: #fef2f2; color: #991b1b; border-left: 5px solid #dc2626;";
                    badgeEstado = `<span style="font-weight:bold;">⚠️ ATRASADO</span>`;
                } else {
                    // NARANJA: Pendiente (a tiempo) 📖
                    estiloFila = "background-color: #fff7ed; color: #9a3412; border-left: 5px solid #f97316;";
                    badgeEstado = `<span style="font-weight:bold;">Pendiente</span>`;
                }
            } else {
                // BLANCO/GRIS: Devuelto ✅
                badgeEstado = `<span class="estado-devuelto">Devuelto</span>`;
            }

            const fila = `
                <tr style="${estiloFila}">
                    <td>${h.alumno}</td>
                    <td>${h.material}</td>
                    <td>${h.fecha}</td>
                    <td>
                        ${badgeEstado}
                        ${h.estado === "Activo" ? 
                            `<button onclick="renovarPrestamo(${h.idReserva})" title="Renovar 7 días" style="border:none; background:none; cursor:pointer; margin-left:10px; font-size:1.2rem;">🕒</button>` 
                            : ''}
                    </td>
                </tr>
            `;
            tabla.innerHTML += fila;
        });

        // Añadimos (o movemos al final) el botón de "Cargar más"
        actualizarBotonCargarMas(datos.length);
        filtrarDeudores();

    } catch (error) {
        console.error("Error historial:", error);
    }
}

async function renovarPrestamo(id) {
    if (!confirm("¿Deseas dar 7 días más de plazo para este material?")) return;

    try {
        const response = await fetch(`https://localhost:7082/api/Prestamos/renovar/${id}`, {
            method: 'PUT'
        });

        if (response.ok) {
            const res = await response.json();
            alert("✅ Plazo extendido con éxito.");
            cargarHistorial();
        } else {
            alert("No se pudo renovar el préstamo.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function filtrarDeudores() {
    const mostrarSoloDeudores = document.getElementById('chkSoloDeudores').checked;
    const filas = document.querySelectorAll('#tablaHistorial tr');

    filas.forEach(fila => {
        const esAtrasado = fila.innerHTML.includes('⚠️ ATRASADO');
        const esPendiente = fila.innerHTML.includes('Pendiente');

        if (mostrarSoloDeudores) {
            // Si el checkbox está marcado, mostramos la fila si cumple cualquiera de las dos
            if (esAtrasado || esPendiente) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none'; 
            }
        } else {
            // Si no está marcado, mostramos todo el historial (incluyendo devueltos)
            fila.style.display = '';
        }
    });
}

function actualizarBotonCargarMas(cantidadRecibida) {
    // Eliminamos el botón viejo si existe
    const botonViejo = document.getElementById('filaCargarMas');
    if (botonViejo) botonViejo.remove();

    // Solo mostramos el botón si recibimos 10 registros (lo que indica que podría haber más)
    if (cantidadRecibida === 10) {
        const tabla = document.getElementById('tablaHistorial');
        const botonHTML = `
            <tr id="filaCargarMas">
                <td colspan="4" style="text-align: center; padding: 15px;">
                    <button onclick="cargarSiguientePagina()" class="btn-azul" style="font-size: 0.8rem;">
                        ⬇️ Cargar más registros
                    </button>
                </td>
            </tr>
        `;
        tabla.innerHTML += botonHTML;
    }
}

function cargarSiguientePagina() {
    paginaActualHistorial++;
    traerDatosHistorial(true);
}