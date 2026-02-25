document.addEventListener("DOMContentLoaded", async () => {
    // 1. Datos del usuario (del localStorage)
    const usuarioSesion = localStorage.getItem('usuarioSesion');
    if (usuarioSesion) {
        const usuarioObj = JSON.parse(usuarioSesion);
        const saludoElem = document.getElementById('nombreUsuarioSaludo');
        if(saludoElem) saludoElem.innerText = usuarioObj.nombre; 
    }

    // 2. Llamada a la API
    try {
        const response = await fetch('https://localhost:7082/api/dashboard/resumen');
        if (response.ok) {
            const data = await response.json();
            
            // ¡OJO! Revisa si tu API devuelve Mayúsculas o Minúsculas. 
            // Según tu DashboardController.cs, son Mayúsculas:
            const elemAlumnos = document.getElementById('lblTotalAlumnos');
            const elemTitulos = document.getElementById('lblTotalTitulos');
            const elemPrestamos = document.getElementById('lblPrestamos');

            if(elemAlumnos) elemAlumnos.innerText = data.alumnos || data.Alumnos || 0;
            if(elemTitulos) elemTitulos.innerText = data.titulos || data.Titulos || 0;
            if(elemPrestamos) elemPrestamos.innerText = data.prestamos || data.Prestamos || 0;

        }
    } catch (error) {
        console.error("Error al conectar con el Dashboard:", error);
    }
});