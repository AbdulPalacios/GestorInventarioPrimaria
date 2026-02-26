const API_URL = "https://localhost:7082/api";

async function cargarPersonal() {
    try {
        const response = await fetch(`${API_URL}/Usuarios/personal`);
        const personal = await response.json();
        
        const tabla = document.getElementById('tablaPersonal');
        tabla.innerHTML = "";

        personal.forEach(p => {
            // Usamos las clases nuevas: 'usuario-tag' y los iconos de FontAwesome
            tabla.innerHTML += `
                <tr>
                    <td><strong>#${p.matricula}</strong></td>
                    <td>${p.nombre || p.username}</td>
                    <td><span class="usuario-tag">@${p.username}</span></td>
                    <td>
                        <button onclick="eliminarAdmin(${p.id}, '${p.nombre || p.username}')" class="btn-volver" style="padding: 8px 15px; font-size: 0.85rem;">
                            <i class="fas fa-user-minus"></i> Borrar Acceso
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar personal:", error);
        document.getElementById('tablaPersonal').innerHTML = `
            <tr><td colspan="4" style="text-align:center; color:red;">Error al conectar con el servidor</td></tr>
        `;
    }
}

async function eliminarAdmin(id, nombre) {
    const confirmacion = confirm(`⚠️ ¿Estás seguro de eliminar a "${nombre}"? \nEsta acción le quitará el acceso al sistema de inmediato.`);

    if (confirmacion) {
        try {
            const response = await fetch(`${API_URL}/Usuarios/eliminar-personal/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("🗑️ Usuario eliminado correctamente.");
                cargarPersonal(); 
            } else {
                const error = await response.json();
                alert("❌ Error: " + (error.mensaje || "No se pudo eliminar"));
            }
        } catch (error) {
            console.error("Error al conectar:", error);
            alert("No se pudo conectar con el servidor.");
        }
    }
}

document.addEventListener('DOMContentLoaded', cargarPersonal);