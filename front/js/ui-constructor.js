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
            <span>Gestor Primaria</span>
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