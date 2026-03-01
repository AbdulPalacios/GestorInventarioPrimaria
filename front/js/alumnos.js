document.addEventListener('DOMContentLoaded', cargarAlumnos);

// CARGAR LISTA (Usa el endpoint: /api/Usuarios/alumnos)
async function cargarAlumnos() {
    const tabla = document.getElementById('tablaAlumnosBody');
    try {
        const response = await fetch('https://localhost:7082/api/Usuarios/alumnos');
        
        if (!response.ok) {
            throw new Error("Error al obtener alumnos");
        }

        const alumnos = await response.json();
        tabla.innerHTML = '';

        if (alumnos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay alumnos.</td></tr>';
            return;
        }

        alumnos.forEach(a => {
            tabla.innerHTML += `
                <tr>
                    <td><strong>${a.matricula}</strong></td>
                    <td>${a.nombre}</td>
                    <td>${a.grupo}</td>
                    <td style="text-align:center;">
                        <button onclick="eliminarAlumno(${a.id})" class="btn-rojo">🗑️ Eliminar</button>
                    </td>
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
    const nombre = document.getElementById('nombreAlumno').value.trim();
    const apellidos = document.getElementById('apellidoAlumno').value.trim();
    const grado = document.getElementById('gradoAlumno').value;
    const grupoLetra = document.getElementById('grupoLetra').value;
    
    const resultado = document.getElementById('resultadoRegistro');

    try {
        const response = await fetch('https://localhost:7082/api/Usuarios/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nombre: nombre,
                apellidos: apellidos,
                grupo: '${grado}${grupoLetra}'
            })
        });

        if (response.ok) {
            const data = await response.json();
            resultado.innerHTML = `<span style="color:green;">✅ ${data.mensaje}. Matrícula: ${data.matricula}</span>`;
            document.getElementById('formNuevoAlumno').reset();
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
        const response = await fetch(`https://localhost:7082/api/Usuarios/${id}`, {
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