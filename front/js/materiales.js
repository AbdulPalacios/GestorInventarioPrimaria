document.addEventListener('DOMContentLoaded', cargarInventario);

async function cargarInventario() {
    const tabla = document.getElementById('tablaInventarioBody');
    try {
        const response = await fetch('https://localhost:7082/api/Materiales');
        const materiales = await response.json();
        tabla.innerHTML = '';

        materiales.forEach(m => {
            tabla.innerHTML += `
                <tr>
                    <td>${m.id}</td>
                    <td><strong>${m.titulo}</strong></td>
                    <td>${m.categoria}</td>
                    <td>${m.stockDisponible}</td>
                    <td>
                        <button onclick="prepararEdicion(${JSON.stringify(m).replace(/"/g, '&quot;')})" class="btn-azul">✏️</button>
                        <button onclick="eliminarMaterial(${m.id})" class="btn-rojo">🗑️</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) { console.error(error); }
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
        ? `https://localhost:7082/api/Materiales/${id}` 
        : 'https://localhost:7082/api/Materiales';

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(material)
        });

        if (response.ok) {
            alert(id ? "✅ Material actualizado con éxito" : "✅ Material creado con éxito");
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
    if (!confirm("¿Estás seguro de eliminar este material del inventario?")) {
        return;
    }

    try {
        const response = await fetch(`https://localhost:7082/api/Materiales/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("✅ Material eliminado.");
            cargarInventario();
        } else {
            // El servidor podría responder que no se puede eliminar si hay préstamos activos
            const errorMsg = await response.text();
            alert("❌ No se puede eliminar: " + errorMsg);
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error de red.");
    }
}

function prepararEdicion(m) {
    document.getElementById('txtIdMaterial').value = m.id;
    document.getElementById('txtTitulo').value = m.titulo;
    document.getElementById('selCategoria').value = m.categoria;
    document.getElementById('txtStock').value = m.stockDisponible;
    
    document.getElementById('tituloForm').innerText = "✏️ Editando: " + m.titulo;
    document.getElementById('btnGuardar').innerText = "Actualizar Cambios";
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