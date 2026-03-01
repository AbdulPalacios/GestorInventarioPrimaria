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

function abrirModal() {
    document.getElementById('modalNuevoPersonal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalNuevoPersonal').style.display = 'none';
    document.getElementById('formRegistroPersonal').reset();
    document.getElementById('regId').value = ''; // ¡Vital! Borramos el ID oculto
    
    // Restauramos el diseño a "Modo Nuevo Usuario" por defecto
    document.querySelector('.modal-header h3').innerHTML = '<i class="fas fa-user-shield" style="color: #0d6efd;"></i> Nuevo Integrante';
    document.querySelector('.btn-guardar-azul').innerHTML = '<i class="fas fa-save"></i> Registrar Usuario';
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

async function guardarNuevoPersonal() {
    // 1. Recolectamos todos los datos, ¡incluyendo el ID oculto!
    const id = document.getElementById('regId').value; 
    const nombre = document.getElementById('regNombre').value.trim();
    const apellidos = document.getElementById('regApellidos').value.trim();
    const username = document.getElementById('regUser').value.trim();
    const pass = document.getElementById('regPass').value.trim();
    const rol = document.getElementById('regRol').value;

    // 2. Validación: Si es nuevo, la contraseña es obligatoria. Si es edición, no.
    if (!nombre || !apellidos || !username || !rol) {
        alert("Por favor, llena todos los campos obligatorios.");
        return;
    }
    if (!id && !pass) {
        alert("La contraseña es obligatoria para registrar un usuario nuevo.");
        return;
    }

    // 3. Preparamos el paquete de datos
    const datosUsuario = {
        nombre: nombre,
        apellidos: apellidos,
        username: username,
        passwordHash: pass, // Si está vacía en edición, tu backend en C# ya sabe que debe ignorarla
        rol: rol
    };

    try {
        // 4. Decidimos la estrategia: ¿POST (Crear) o PUT (Editar)?
        let url = 'https://localhost:7082/api/Usuarios/crear-personal';
        let metodo = 'POST';

        if (id) { // Si el input oculto tiene un número, entonces estamos editando
            url = `https://localhost:7082/api/Usuarios/editar-personal/${id}`;
            metodo = 'PUT';
        }

        // 5. Enviamos la petición al servidor
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUsuario)
        });

        if (response.ok) {
            const data = await response.json();
            alert(`✅ ${data.mensaje}`); // Mensaje de éxito
            
            cerrarModal(); // Escondemos y limpiamos
            cargarPersonal(); // Refrescamos la tabla para ver los cambios
            
        } else {
            const errorMsg = await response.text();
            alert(`❌ Error: ${errorMsg}`);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("⚠️ Error de conexión con el servidor.");
    }
}

document.addEventListener('DOMContentLoaded', cargarPersonal);

// Función para abrir el modal y llenarlo con los datos del usuario
async function abrirModalEditar(id) {
    try {
        // 1. Buscamos los datos de esa persona en la base de datos
        const response = await fetch(`https://localhost:7082/api/Usuarios/${id}`);
        
        if (!response.ok) throw new Error("No se pudo obtener la información del usuario");
        
        const usuario = await response.json();

        // 2. Llenamos el formulario automáticamente
        document.getElementById('regId').value = usuario.id; // Guardamos el ID en el input oculto
        document.getElementById('regNombre').value = usuario.nombre;
        document.getElementById('regApellidos').value = usuario.apellidos;
        document.getElementById('regUser').value = usuario.username;
        document.getElementById('regRol').value = usuario.rol;
        
        // Dejamos la contraseña en blanco por seguridad
        document.getElementById('regPass').value = ''; 

        // 3. Cambiamos los textos del modal para que diga "Editar" en vez de "Nuevo"
        document.querySelector('.modal-header h3').innerHTML = '<i class="fas fa-user-edit" style="color: #ffc107;"></i> Editar Integrante';
        document.querySelector('.btn-guardar-azul').innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';

        // 4. Mostramos el modal
        document.getElementById('modalNuevoPersonal').style.display = 'flex';

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al cargar los datos para editar.");
    }
}