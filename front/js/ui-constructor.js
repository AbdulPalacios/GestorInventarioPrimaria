document.addEventListener('DOMContentLoaded', () => {
    construirInterfaz();
});

function construirInterfaz() {
    const wrapper = document.querySelector('.dashboard-wrapper');
    if (!wrapper) return;

    // 1. Inyectar Sidebar
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <i class="fas fa-school"></i>
            <span>Gestor Primaria Benito Juarez</span>
        </div>
        <nav class="menu">
            <a href="dashboard.html" id="nav-inicio"><i class="fas fa-chart-line"></i> Inicio</a>
            <a href="alumnos.html" id="nav-alumnos"><i class="fas fa-user-graduate"></i> Alumnos</a>
            <a href="materiales.html" id="nav-materiales"><i class="fas fa-book"></i> Inventario</a>
            <a href="prestamos.html" id="nav-prestamos"><i class="fas fa-hand-holding"></i> Préstamos</a>
            <a href="personal.html" id="nav-personal"><i class="fas fa-user-shield"></i> Personal</a>
        </nav>
        <div class="sidebar-footer">
            <button onclick="cerrarSesion()" class="btn-logout">
                <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
        </div>
    `;

    // Insertar el sidebar al inicio del wrapper
    wrapper.prepend(sidebar);

    // 2. Marcar la página activa
    const path = window.location.pathname;
    const pagina = path.split("/").pop();
    
    if (pagina.includes('dashboard')) document.getElementById('nav-inicio').classList.add('active');
    if (pagina.includes('alumnos')) document.getElementById('nav-alumnos').classList.add('active');
    if (pagina.includes('materiales')) document.getElementById('nav-materiales').classList.add('active');
    if (pagina.includes('prestamos')) document.getElementById('nav-prestamos').classList.add('active');
    if (pagina.includes('personal')) document.getElementById('nav-personal').classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    
    const sesionStr = localStorage.getItem('usuarioSesion');
    let rol = null;

    if (sesionStr) {
        const sesionObj = JSON.parse(sesionStr);
        rol = sesionObj.rol; 
    }

    // 2. Si NO es Admin, eliminamos los botones de gestión
    if (rol !== 'Admin') {
        // Eliminar el botón de "Registrar Nuevo Personal"
        const btnNuevo = document.querySelector('.btn-verde'); 
        if (btnNuevo) btnNuevo.remove();
        
        // Eliminar botones de la tabla (Editar, Borrar y el botón rojo antiguo)
        // Usamos .remove() en lugar de display='none' para que no quede rastro en el HTML
        document.querySelectorAll('.btn-editar, .btn-volver, .btn-rojo').forEach(b => b.remove());
    }
});