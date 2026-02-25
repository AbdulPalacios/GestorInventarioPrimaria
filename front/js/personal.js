const API_URL = "https://localhost:7082/api";

async function cargarPersonal() {
    try {
        const response = await fetch(`${API_URL}/Usuarios/personal`);
        const personal = await response.json();
        
        const tabla = document.getElementById('tablaPersonal');
        tabla.innerHTML = "";

        personal.forEach(p => {
            tabla.innerHTML += `
                <tr>
                    <td>${p.matricula}</td>
                    <td>${p.nombre || p.username}</td> <td>@${p.username}</td>
                    <td>
                        <button onclick="eliminarAdmin(${p.id}, '${p.nombre || p.username}')" class="btn-rojo">
                            🗑️ Borrar Acceso
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar personal:", error);
    }
}

async function eliminarAdmin(id, nombre) {
    // MENSAJE DE ADVERTENCIA
    const confirmacion = confirm(`⚠️ ¿Estás seguro de eliminar a "${nombre}"? \nEsta acción le quitará el acceso al sistema de inmediato.`);

    if (confirmacion) {
        try {
            const response = await fetch(`${API_URL}/Usuarios/eliminar-personal/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("🗑️ Usuario eliminado.");
                cargarPersonal(); // Recarga la tabla automáticamente
            } else {
                const error = await response.json();
                alert("❌ Error: " + error.mensaje);
            }
        } catch (error) {
            console.error("Error al conectar:", error);
            alert("No se pudo conectar con el servidor.");
        }
    }
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', cargarPersonal);