document.addEventListener('DOMContentLoaded', () => {
    cargarInventario();

    // Evaluamos los permisos para el Formulario de Nuevo Material
    const sesion = JSON.parse(localStorage.getItem('usuarioSesion')) || {};
    const rol = sesion.rol;

    // Si NO es Admin y NO es de Inventario, le escondemos el formulario
    if (rol !== 'Admin' && rol !== 'Inventario') {
        const formMaterial = document.getElementById('formMaterial');
        
        if (formMaterial) {
            // Buscamos la tarjeta blanca que envuelve al formulario y la ocultamos
            const tarjetaFormulario = formMaterial.closest('.card-accion');
            if (tarjetaFormulario) {
                tarjetaFormulario.style.display = 'none';
            }
        }
    }
});

async function cargarInventario() {
    const tabla = document.getElementById('tablaInventarioBody');
    
    const sesion = JSON.parse(localStorage.getItem('usuarioSesion')) || {};
    const rol = sesion.rol;
    const puedeEditar = rol === 'Admin' || rol === 'Inventario';

    try {
        const response = await fetch(`${API_URL}/Materiales`);
        const materiales = await response.json();
        tabla.innerHTML = '';

        materiales.forEach(m => {
            // ... (deja tu lógica del stock exacto como la tienes) ...
            const stock = m.stockDisponible;
            let estiloStock = ''; let aviso = '';
            if (m.categoria !== "Salón") {
                if (stock === 0) { estiloStock = "color:#dc2626; font-weight:bold; background:#fee2e2; padding:2px 5px; border-radius:4px;"; aviso = " ¡AGOTADO!"; } 
                else if (stock <= 3) { estiloStock = "color:#d97706; font-weight:bold;"; aviso = " (Poco)"; }
                else if (stock >= 4) { estiloStock = "color:#059669; font-weight:bold;"; aviso = " Suficiente"; }
            }

            // Inyectamos permisos
            const acciones = puedeEditar 
                ? `<button onclick="prepararEdicion(${m.id}, '${m.titulo.replace(/'/g, "\\'")}', '${m.categoria}', ${m.stockDisponible})" class="btn-azul"><i class="fas fa-edit"></i> Editar</button>
                   <button onclick="eliminarMaterial(${m.id})" class="btn-rojo"><i class="fa-solid fa-trash"></i> Eliminar</button>`
                : `<span style="color:gray; font-size:0.85rem;">Solo lectura</span>`;
        
            tabla.innerHTML += `
                <tr>
                    <td>${m.id}</td>
                    <td><strong>${m.titulo}</strong></td>
                    <td>${m.categoria}</td>
                    <td><span style="${estiloStock}">${stock}${aviso}</span></td>
                    <td>${acciones}</td>
                </tr>
            `;
        });
    } catch (error) { 
        console.error(error); 
        tabla.innerHTML = '<tr><td colspan="5">Error al cargar datos.</td></tr>';
    }
}

// FUNCIÓN PARA GUARDAR (CREAR O EDITAR)
async function guardarMaterial() {
    const id = document.getElementById('txtIdMaterial').value; // Campo oculto
    const titulo = document.getElementById('txtTitulo').value;
    const categoria = document.getElementById('selCategoria').value;
    const stock = document.getElementById('txtStock').value;

    if (!titulo || !stock) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const material = {
        id: id ? parseInt(id) : 0,
        titulo: titulo,
        categoria: categoria,
        stockDisponible: parseInt(stock)
    };

    // Si hay ID usamos PUT (editar), si no hay ID usamos POST (crear)
    const metodo = id ? 'PUT' : 'POST';
    const url = id 
        ? `${API_URL}/Materiales/${id}` 
        : `${API_URL}/Materiales`;

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(material)
        });

        if (response.ok) {
            Swal.fire({
                title: '¡Éxito!',
                text: id ? "Material actualizado con éxito" : "Material creado con éxito",
                icon: 'success',
                confirmButtonColor: '#27ae60',
                timer: 2000, // Se cierra solo en 2 segundos
                showConfirmButton: false
            });
            limpiarFormulario();
            cargarInventario(); // Recarga la tabla
        } else {
            const error = await response.text();
            alert("❌ Error al guardar: " + error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión con el servidor.");
    }
}

// FUNCIÓN PARA ELIMINAR
async function eliminarMaterial(id) {
    // 1. Lanzamos la alerta de confirmación
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: "El material será eliminado del inventario de forma permanente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c', // Rojo
        cancelButtonColor: '#94a3b8',  // Gris
        confirmButtonText: '<i class="fa-solid fa-trash"></i> Sí, eliminar',
        cancelButtonText: '<i class="fa-solid fa-xmark"></i> Cancelar'
    });

    // 2. Evaluamos si el usuario confirmó
    if (confirmacion.isConfirmed) {
        try {
            const response = await fetch(`${API_URL}/Materiales/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // 3. Alerta de éxito
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El material ha sido borrado correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#27ae60'
                });
                cargarInventario(); // Refrescamos la tabla
            } else {
                // El servidor podría responder que no se puede eliminar si hay préstamos activos
                const errorMsg = await response.text();
                Swal.fire({
                    title: 'No se pudo eliminar',
                    text: errorMsg,
                    icon: 'error',
                    confirmButtonColor: '#3498db'
                });
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
            Swal.fire('Error de conexión', 'No se pudo contactar con el servidor.', 'error');
        }
    }
}

// FILTRAR POR CATEGORÍA
function filtrarPorCategoria(categoria) {
    const inputBusqueda = document.getElementById('txtBuscarInv');
    inputBusqueda.value = categoria;
    
    const evento = new Event('input');
    inputBusqueda.dispatchEvent(evento);
}

function prepararEdicion(id, titulo, categoria, stock) {
    document.getElementById('txtIdMaterial').value = id;
    document.getElementById('txtTitulo').value = titulo;
    document.getElementById('selCategoria').value = categoria;
    document.getElementById('txtStock').value = stock;
    document.getElementById('tituloForm').innerHTML = `<i class="fas fa-edit"></i> Editando: ${titulo}`;
    document.getElementById('btnGuardar').innerHTML = `<i class="fas fa-check-circle"></i> Actualizar Cambios`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limpiarFormulario() {
    document.getElementById('formMaterial').reset();
    document.getElementById('txtIdMaterial').value = "";
    document.getElementById('tituloForm').innerText = "📚 Gestionar Material / Libro";
    document.getElementById('btnGuardar').innerText = "Guardar en Inventario";
}

document.getElementById('txtBuscarInv').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#tablaInventarioBody tr');
    rows.forEach(r => {
        r.style.display = r.innerText.toLowerCase().includes(term) ? '' : 'none';
    });
});