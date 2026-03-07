document.addEventListener('DOMContentLoaded', () => {
    cargarAlumnos();

    //  Evaluamos los permisos para el Formulario de Registro
    const sesion = JSON.parse(localStorage.getItem('usuarioSesion')) || {};
    const rol = sesion.rol;

    // Si NO es Admin y NO es Secretaria, le escondemos el formulario
    if (rol !== 'Admin' && rol !== 'Secretaria') {
        const formRegistro = document.getElementById('formNuevoAlumno');
        
        if (formRegistro) {
            // Buscamos la "tarjeta" completa que envuelve al formulario para ocultarla toda
            const tarjetaRegistro = formRegistro.closest('.card-accion');
            
            if (tarjetaRegistro) {
                tarjetaRegistro.style.display = 'none';
            } else {
                // Por si acaso no encuentra la tarjeta, ocultamos al menos el formulario
                formRegistro.style.display = 'none'; 
            }
        }
    }
});

// CARGAR LISTA (Usa el endpoint: /api/Usuarios/alumnos)
async function cargarAlumnos() {
    const tabla = document.getElementById('tablaAlumnosBody');
    
    // 1. Obtenemos el rol para la seguridad visual
    const sesion = JSON.parse(localStorage.getItem('usuarioSesion')) || {};
    const rol = sesion.rol;
    const puedeEditar = rol === 'Admin' || rol === 'Secretaria';

    try {
        const response = await fetch(`${API_URL}/Usuarios/alumnos`);
        if (!response.ok) throw new Error("Error al obtener alumnos");

        const alumnos = await response.json();
        tabla.innerHTML = '';

        if (alumnos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay alumnos.</td></tr>';
            return;
        }

        alumnos.forEach(a => {
            // 2. LA MAGIA: Unimos Nombre y Apellidos (manejando nulos por si acaso)
            const nombre = a.nombre || "";
            const apellidos = a.apellidos || "";
            const nombreCompleto = `${nombre} ${apellidos}`.trim();

            // 3. Control de acceso para los botones
            const acciones = puedeEditar 
                ? `<button onclick="prepararEdicionAlumno(${a.id}, '${nombre.replace(/'/g, "\\'")}', '${apellidos.replace(/'/g, "\\'")}', '${a.grupo}')" class="btn-azul"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                   <button onclick="eliminarAlumno(${a.id})" class="btn-rojo"><i class="fa-solid fa-trash"></i> Eliminar</button>` 
                : `<span style="color:gray; font-size:0.85rem;">Solo lectura</span>`;

            tabla.innerHTML += `
                <tr>
                    <td><strong>${a.matricula}</strong></td>
                    <td>${nombreCompleto}</td>
                    <td>${a.grupo}</td>
                    <td style="text-align:center;">${acciones}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
        tabla.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Error de servidor. Revisa la base de datos.</td></tr>';
    }
}

// REGISTRAR (Usa el endpoint: /api/Usuarios/crear)
async function registrarAlumno() {
    const id = document.getElementById('txtIdAlumno').value; // Leemos el ID oculto
    const nombre = document.getElementById('nombreAlumno').value.trim();
    const apellidos = document.getElementById('apellidoAlumno').value.trim();
    const grado = document.getElementById('gradoAlumno').value;
    const grupoLetra = document.getElementById('grupoLetra').value;
    
    const resultado = document.getElementById('resultadoRegistro');

    // 🚀 LA MAGIA: Usamos tu variable global API_URL
    const url = id 
        ? `${API_URL}/Usuarios/editar-alumno/${id}` 
        : `${API_URL}/Usuarios/crear`;
        
    const metodo = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nombre: nombre,
                apellidos: apellidos,
                grupo: `${grado} ${grupoLetra}`
            })
        });

        if (response.ok) {
            const data = await response.json();
            resultado.innerHTML = `<span style="color:green;">✅ ${data.mensaje}</span>`;
            
            // Limpiamos y regresamos el diseño a "Modo Registro"
            document.getElementById('formNuevoAlumno').reset();
            document.getElementById('txtIdAlumno').value = "";
            document.querySelector('.card-header h2').innerHTML = `<i class="fas fa-user-plus"></i> Registrar Nuevo Alumno`;
            document.querySelector('#formNuevoAlumno button[type="submit"]').innerHTML = `<i class="fas fa-id-card"></i> Registrar y Generar Matrícula`;
            
            cargarAlumnos(); 
        } else {
            const errorMsg = await response.text();
            resultado.innerHTML = `<span style="color:red;">❌ Error: ${errorMsg}</span>`;
        }
    } catch (error) {
        resultado.innerHTML = `<span style="color:red;">⚠️ Error de conexión.</span>`;
    }
}

// ELIMINAR (Usa el endpoint: /api/Usuarios/{id})
async function eliminarAlumno(id) {
    if (!confirm("¿Estás seguro de eliminar a este alumno? Esta acción no se puede deshacer.")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/Usuarios/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("✅ Alumno eliminado correctamente.");
            cargarAlumnos(); // Refresca la tabla automáticamente
        } else {
            const errorText = await response.text();
            alert("❌ Error: " + errorText);
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error de conexión con el servidor.");
    }
}

// Actualizar alumno
function prepararEdicionAlumno(id, nombre, apellidos, grupoCompleto) {
    document.getElementById('txtIdAlumno').value = id;
    document.getElementById('nombreAlumno').value = nombre;
    document.getElementById('apellidoAlumno').value = apellidos;
    
    // Truco: Dividimos "6° A" por el espacio para llenar los select
    if(grupoCompleto) {
        const partes = grupoCompleto.split(" ");
        if(partes.length === 2) {
            document.getElementById('gradoAlumno').value = partes[0];
            document.getElementById('grupoLetra').value = partes[1];
        }
    }

    // Cambiamos los textos para indicar edición
    document.querySelector('.card-header h2').innerHTML = `<i class="fas fa-user-edit"></i> Editando: ${nombre}`;
    document.querySelector('#formNuevoAlumno button[type="submit"]').innerHTML = `<i class="fas fa-save"></i> Guardar Cambios`;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Escuchamos lo que el usuario escribe en tiempo real
document.getElementById('txtFiltrarAlumnos').addEventListener('input', function(e) {
    const textoBusqueda = e.target.value.toLowerCase();
    const filas = document.querySelectorAll('#tablaAlumnosBody tr');

    filas.forEach(fila => {
        const contenidoFila = fila.innerText.toLowerCase();
        
        if (contenidoFila.includes(textoBusqueda)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
});