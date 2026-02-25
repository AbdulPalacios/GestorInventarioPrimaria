const API_URL = "https://localhost:7082/api"; 

// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('usernameInput');
const btnLogin = document.getElementById('btnLogin');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalText = btnLogin.innerText;
    btnLogin.disabled = true;
    btnLogin.innerText = "Verificando...";
    errorMessage.classList.add('hidden');

    const usuario = usernameInput.value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    try {
        const response = await fetch(`${API_URL}/Auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({username: usuario, password: password})
        });

        if (response.ok) {
            const data = await response.json();
            
            // Guardar sesión
            localStorage.setItem('usuarioSesion', JSON.stringify(data));
            
            // Éxito visual (Temporal)
            btnLogin.style.backgroundColor = "#10b981";
            btnLogin.innerText = "¡Inicio de sesión exitoso!";
            
            setTimeout(() => {
                localStorage.setItem('usuarioSesion', JSON.stringify(data));
                window.location.href = 'dashboard.html';
            }, 500);

        } else {
            const err = await response.json();
            showError(err.mensaje || "Error de inicio de sesión");
        }

    } catch (error) {
        console.error(error);
        showError("Error de conexión con el servidor.");
    } finally {
        // Restaurar botón si falló
        if (btnLogin.innerText !== "¡Éxito!") {
            btnLogin.disabled = false;
            btnLogin.innerText = originalText;
        }
    }
});

function showError(msg) {
    errorMessage.classList.remove('hidden');
    errorText.textContent = msg;
}

function abrirModal() { document.getElementById('modalRegistro').style.display = 'flex'; }
function cerrarModal() { document.getElementById('modalRegistro').style.display = 'none'; }

async function registrarNuevoAdmin() {
    const datos = {
        nombre: document.getElementById('regNombre').value,
        username: document.getElementById('regUser').value,
        password: document.getElementById('regPass').value,
        codigoMaestro: document.getElementById('regCodigo').value
    };

    try {
        const response = await fetch(`${API_URL}/Auth/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const res = await response.json();
        if (response.ok) {
            alert("✅ " + res.mensaje);
            cerrarModal();
            document.getElementById('registroForm').reset();
        } else {
            alert("❌ " + res.mensaje);
        }
    } catch (error) { alert("Error de conexión"); }
}