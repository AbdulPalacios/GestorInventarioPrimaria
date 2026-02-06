// 1. VERIFICAR SEGURIDAD (¿Está logueado?)
const usuarioGuardado = localStorage.getItem('usuarioSesion');

if (!usuarioGuardado) {
    // Si no hay usuario guardado, lo mandamos al login
    window.location.href = 'index.html';
} else {
    // Si sí hay usuario, convertimos el texto JSON a Objeto JS
    const usuario = JSON.parse(usuarioGuardado);

    // 2. CARGAR DATOS EN PANTALLA
    document.getElementById('welcomeMessage').textContent = `Hola, ${usuario.nombre}`;
    document.getElementById('userRole').textContent = `Rol: ${usuario.rol}`;
}

// 3. BOTÓN CERRAR SESIÓN
document.getElementById('btnLogout').addEventListener('click', () => {
    // Borramos la "galleta"
    localStorage.removeItem('usuarioSesion');
    // Redirigimos al login
    window.location.href = 'index.html';
});