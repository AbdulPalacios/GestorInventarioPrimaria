document.addEventListener("DOMContentLoaded", async () => {
    
    // Verificar si hay sesión
    const usuarioSesion = localStorage.getItem('usuarioSesion');
    if (!usuarioSesion) {
        window.location.href = 'index.html';
        return;
    }

    // Saludar al usuario
    const usuarioObj = JSON.parse(usuarioSesion);
    // Busca si tienes un elemento para el nombre, si no, ignora esta línea
    const saludoElem = document.getElementById('nombreUsuarioSaludo');
    if(saludoElem) saludoElem.innerText = usuarioObj.nombre; 

    // Obtener los números reales de la Base de Datos
    try {
        const response = await fetch('https://localhost:7082/api/dashboard/resumen');
        
        if (response.ok) {
            const data = await response.json();
            
            document.getElementById('lblTotalAlumnos').innerText = data.alumnos || 0;
            document.getElementById('lblTotalTitulos').innerText = data.titulos || 0;
            document.getElementById('lblPrestamos').innerText = data.prestamos || 0;
            
            console.log("Datos actualizados correctamente del servidor.");
        } else {
            console.error("Error al obtener datos del dashboard");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
});