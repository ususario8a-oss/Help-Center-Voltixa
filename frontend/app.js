const API_URL = 'https://help-center-voltixa.onrender.com/api/tickets';
const LOGIN_URL = 'https://help-center-voltixa.onrender.com/api/auth/login';

function getHeaders() {
    const token = localStorage.getItem('token');

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function verificarToken() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Debes iniciar sesión');
        return false;
    }

    return true;
}

// Decodifica el payload del JWT para leer el rol
function obtenerRolDesdeToken(token) {
    try {
        if (!token || token.split('.').length !== 3) return null;

        const payloadBase64 = token.split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);

        return payload.rol || null;
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
}

// ==========================
// 📥 OBTENER TICKETS
// ==========================
async function obtenerTickets() {
    if (!verificarToken()) return;

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: getHeaders()
        });

        const data = await response.json();
        console.log(data);
        
        if (data && data.data && Array.isArray(data.data)) {
            mostrarTickets(data.data);
        } else {
            mostrarError("No se pudieron cargar los tickets");
        }
    } catch (error) {
        console.error('Error al obtener tickets:', error);
        mostrarError("Error de conexión");
    }
}

// ==========================
// 🖥️ MOSTRAR TICKETS
// ==========================
function mostrarTickets(tickets) {
    const lista = document.getElementById('listaTickets');
    if (!lista) return;

    lista.innerHTML = '';

    if (tickets.length === 0) {
        lista.innerHTML = '<li>No hay tickets disponibles</li>';
        return;
    }

    tickets.forEach(ticket => {

    let colorEstado = '#dc2626';

    if (
    ticket.estado?.toLowerCase() === 'en proceso' ||
    ticket.estado?.toLowerCase() === 'en_proceso'
    ) {
        colorEstado = '#f59e0b';
    }

    if (ticket.estado?.toLowerCase() === 'cerrado') {
        colorEstado = '#16a34a';
    }

    const li = document.createElement('li');

    li.innerHTML = `
        <strong>${ticket.titulo}</strong><br>

        Estado:
        <span style="
            background:${colorEstado};
            color:white;
            padding:4px 10px;
            border-radius:10px;
            font-size:12px;
            font-weight:bold;
        ">
            ${ticket.estado || 'abierto'}
        </span>

        <br><br>

        Fecha:
        ${
            ticket.fecha_creacion
            ? new Date(ticket.fecha_creacion).toLocaleString()
            : 'Sin fecha'
        }
    `;

    lista.appendChild(li);
});
}

// ==========================
// ❌ ERROR
// ==========================
function mostrarError(msg) {
    const lista = document.getElementById('listaTickets');
    if (!lista) return;

    lista.innerHTML = `<li style="color:red;">${msg}</li>`;
}

// ==========================
// 🚪 LOGOUT
// ==========================
function logout() {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Limpiar login
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    if (email) email.value = '';
    if (password) password.value = '';

    // Limpiar registro
    const registerEmail =
        document.getElementById('registerEmail');

    const registerPassword =
        document.getElementById('registerPassword');

    if (registerEmail) registerEmail.value = '';
    if (registerPassword) registerPassword.value = '';

    window.location.href = 'index.html';
}

// ==========================
// 🚀 INICIO
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formTicket');
    const mensaje = document.getElementById('mensaje');
    const loginForm = document.getElementById('loginForm');

    // CREAR TICKET
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!verificarToken()) return;

            const titulo = document.getElementById('titulo').value;
            const descripcion = document.getElementById('descripcion').value;
            const prioridad = 'baja';

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ titulo, descripcion, prioridad })
                });

                const data = await response.json();

                if (response.ok) {
                    if (mensaje) mensaje.textContent = '✅ Ticket creado';
                    form.reset();
                    obtenerTickets();
                } else {
                    if (mensaje) mensaje.textContent = '❌ ' + (data.error || 'Error');
                }
            } catch (error) {
                console.error(error);
                if (mensaje) mensaje.textContent = '❌ Error de conexión';
            }
        });
    }

    // LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(LOGIN_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                console.log("LOGIN RESPONSE:", data);

                if (response.ok) {
                    localStorage.setItem('token', data.token);

                    const rol = obtenerRolDesdeToken(data.token);

                    if (rol === 'admin') {

                 window.location.href = 'admin.html';

                        }
                        else if (rol === 'tecnico') {

                            window.location.href = 'tecnico.html';

                        }
                        else {

                            if (document.getElementById('loginSection')) {
                                document.getElementById('loginSection').style.display = 'none';
                            }

                            if (document.getElementById('appSection')) {
                                document.getElementById('appSection').style.display = 'block';
                            }

                            obtenerTickets();
                        }
                } else {
                    if (mensaje) mensaje.textContent = data.message || 'Error login';
                }
            } catch (error) {
                console.error(error);
                if (mensaje) mensaje.textContent = 'Error de conexión';
            }
        });
    }

    // AUTO LOGIN
    const token = localStorage.getItem('token');

                            if (token) {
                                const rol = obtenerRolDesdeToken(token);

                            if (
                            rol === 'admin' &&
                            !window.location.pathname.includes('admin.html')
                        ) {

                            window.location.href = 'admin.html';

                            return;
                        }

                        if (
                            rol === 'tecnico' &&
                            !window.location.pathname.includes('tecnico.html')
                        ) {

                            window.location.href = 'tecnico.html';

                            return;
                        }

        if (document.getElementById('loginSection')) {
            document.getElementById('loginSection').style.display = 'none';
        }

        if (document.getElementById('appSection')) {
            document.getElementById('appSection').style.display = 'block';
        }

        obtenerTickets();
    }
});


async function register() {

    const email =
        document.getElementById('registerEmail').value;

    const password =
        document.getElementById('registerPassword').value;

    try {

        const response = await fetch(
            'https://help-center-voltixa.onrender.com/api/users/register',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    nombre: email,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message);
        }

        alert('Usuario registrado correctamente');

        // Limpiar formulario
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';

    } catch (error) {

        console.error(error);

        alert(error.message || 'Error registrando usuario');
    }
}