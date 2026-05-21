const API_TICKETS = 'https://help-center-voltixa.onrender.com/api/tickets';
const API_USERS = 'https://help-center-voltixa.onrender.com/api/users';

let filtroEstadoActual = 'todos';
let filtroPrioridadActual = 'todos';

// Obtener token siempre actualizado
function getHeaders() {
    const token = localStorage.getItem('token');

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Cargar tickets
async function cargarTickets() {

    try {

        const response = await fetch(API_TICKETS, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();

        console.log("RESPUESTA TICKETS:", result);

        const tickets = Array.isArray(result)
            ? result
            : (Array.isArray(result.data) ? result.data : []);

        let html = `
            <h2 class="titulo-seccion">
                Lista de Tickets
            </h2>

            <div class="filtro-container">

                <label for="filtroEstado">
                    <strong>Filtrar por estado:</strong>
                </label>

                <select id="filtroEstado">

                    <option value="todos">Todos</option>
                    <option value="abierto">Abiertos</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="cerrado">Cerrados</option>

                </select>

                <label for="filtroPrioridad">
                    <strong>Filtrar por prioridad:</strong>
                </label>

                <select id="filtroPrioridad">

                    <option value="todos">Todas</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>

                </select>

            </div>
        `;

        if (tickets.length === 0) {

            html += '<p>No hay tickets disponibles</p>';

        } else {

            // Aplicar filtro
            let ticketsFiltrados = tickets;

            if (filtroEstadoActual !== 'todos') {

                ticketsFiltrados = ticketsFiltrados.filter(ticket =>
                    ticket.estado === filtroEstadoActual
                );
            }

            if (filtroPrioridadActual !== 'todos') {

            ticketsFiltrados = ticketsFiltrados.filter(ticket =>
                ticket.prioridad?.toLowerCase() === filtroPrioridadActual
            );
}
            // Agrupar por estado
            const estados = {};

            ticketsFiltrados.forEach(ticket => {

                const estado = ticket.estado || 'Sin estado';

                if (!estados[estado]) {
                    estados[estado] = [];
                }

                estados[estado].push(ticket);
            });

            // Recorrer estados
            for (const estado in estados) {

                html += `
                    <div class="estado-section">
                        <h2 class="estado-titulo">
                            Estado: ${estado}
                        </h2>

                        <div class="tickets-grid">
                `;

                // Agrupar por prioridad dentro del estado
                const prioridades = {
                    alta: [],
                    media: [],
                    baja: []
                };

                estados[estado].forEach(ticket => {

                    const prioridad = (ticket.prioridad || 'baja').toLowerCase();

                    if (prioridades[prioridad]) {
                        prioridades[prioridad].push(ticket);
                    } else {
                        prioridades.baja.push(ticket);
                    }
                });

                // Mostrar tickets por prioridad
                for (const prioridad in prioridades) {

                    if (prioridades[prioridad].length > 0) {

                        html += `
                            <div class="prioridad-container">

                                <h3 class="prioridad-titulo prioridad-${prioridad}">
                                    Prioridad: ${prioridad.toUpperCase()}
                                </h3>
                        `;

                        prioridades[prioridad].forEach(ticket => {

                            let colorPrioridad = '#28a745';

                            if (prioridad === 'alta') {
                                colorPrioridad = '#dc3545';
                            }

                            if (prioridad === 'media') {
                                colorPrioridad = '#ffc107';
                            }

                            if (prioridad === 'baja') {
                                colorPrioridad = '#28a745';
                            }

                            html += `
                                <div class="card"
                                     style="border-left: 8px solid ${colorPrioridad};">

                                    <h3>${ticket.titulo || 'Sin título'}</h3>

                                    <p>
                                        <strong>Descripción:</strong>
                                        ${ticket.descripcion || 'Sin descripción'}
                                    </p>

                                    <p>
                                            <strong>Estado actual:</strong>
                                        </p>

                                        <select id="estado-${ticket.id}" class="estado-select">

                                            <option value="abierto"
                                                ${ticket.estado === 'abierto' ? 'selected' : ''}>
                                                Abierto
                                            </option>

                                            <option value="en_proceso"
                                                ${ticket.estado === 'en_proceso' ? 'selected' : ''}>
                                                En Proceso
                                            </option>

                                            <option value="cerrado"
                                                ${ticket.estado === 'cerrado' ? 'selected' : ''}>
                                                Cerrado
                                            </option>

                                        </select>

                                        <button
                                            class="btn-guardar"
                                            onclick="guardarEstado(${ticket.id})">

                                            Guardar Estado

                                        </button>

                                   <p>
                                    <strong>Prioridad actual:</strong>
                                </p>

                                <select id="prioridad-${ticket.id}" class="estado-select">

                                    <option value="alta"
                                    ${ticket.prioridad?.toLowerCase() === 'alta' ? 'selected' : ''}>
                                    Alta
                                    </option>

                                    <option value="media"
                                    ${ticket.prioridad?.toLowerCase() === 'media' ? 'selected' : ''}>
                                    Media
                                    </option>

                                    <option value="baja"
                                    ${ticket.prioridad?.toLowerCase() === 'baja' ? 'selected' : ''}>
                                    Baja
                                    </option>

                                </select>

                                <button
                                    class="btn-guardar"
                                    onclick="guardarPrioridad(${ticket.id})">

                                    Guardar Prioridad

                                </button>

                                    <p>
                                        <strong>Usuario:</strong>
                                        ${ticket.usuario_id || 'No disponible'}
                                    </p>

                                    <p>
                                        <strong>Fecha:</strong>
                                        ${
                                            ticket.fecha_creacion
                                            ? new Date(ticket.fecha_creacion).toLocaleString()
                                            : 'Sin fecha'
                                        }
                                    </p>

                                </div>
                            `;
                        });

                        html += `</div>`;
                    }
                }

                html += `
                        </div>
                    </div>
                `;
            }
        }

        document.getElementById('contenido').innerHTML = html;

        const filtro = document.getElementById('filtroEstado');

            const filtroPrioridad =
            document.getElementById('filtroPrioridad');

        if (filtro) {

            filtro.value = filtroEstadoActual;

            filtro.addEventListener('change', (e) => {

                filtroEstadoActual = e.target.value;

                cargarTickets();
            });
        }

        if (filtroPrioridad) {

                filtroPrioridad.value = filtroPrioridadActual;

                filtroPrioridad.addEventListener('change', (e) => {

                    filtroPrioridadActual = e.target.value;

                    cargarTickets();
                });
        }

    } catch (error) {

        console.error('Error cargando tickets:', error);

        document.getElementById('contenido').innerHTML =
            '<p>Error al cargar tickets</p>';
    }
}

// Cargar usuarios
async function cargarUsuarios() {

    try {

        const response = await fetch(API_USERS, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();

        console.log("RESPUESTA USUARIOS:", result);

        const usuarios = Array.isArray(result)
            ? result
            : (Array.isArray(result.data) ? result.data : []);

        let html = `
            <h2 class="titulo-seccion">
                👤 Lista de Usuarios
            </h2>

            <div class="usuarios-grid">
        `;

        if (usuarios.length === 0) {

            html += '<p>No hay usuarios disponibles</p>';

        } else {

            usuarios.forEach(user => {

                let colorRol = '#2563eb'; // Azul por defecto = técnico

                if (user.rol === 'admin') {
                    colorRol = '#dc2626'; // Rojo
                }

                if (user.rol === 'usuario') {
                    colorRol = '#28a745'; // Verde
                }

                html += `
                    <div class="usuario-card"
                         style="border-left: 8px solid ${colorRol};">

                        <h3>${user.nombre}</h3>

                        <p>
                            <strong>ID:</strong>
                            ${user.id}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            ${user.email}
                        </p>

                        <p>
                    
                        <strong>Rol actual:</strong>
                        </p>

                        <select
                            id="rol-${user.id}"
                            class="estado-select">

                            <option value="usuario"
                                ${user.rol === 'usuario' ? 'selected' : ''}>
                                Usuario
                            </option>

                            <option value="tecnico"
                                ${user.rol === 'tecnico' ? 'selected' : ''}>
                                Técnico
                            </option>

                            <option value="admin"
                                ${user.rol === 'admin' ? 'selected' : ''}>
                                Admin
                            </option>

                        </select>

                        <button
                            class="btn-guardar"
                            onclick="guardarRol(${user.id})">

                            Guardar Rol

                        </button>

                    </div>
                `;
            });
        }

        html += `</div>`;

        document.getElementById('contenido').innerHTML = html;

    } catch (error) {

        console.error('Error cargando usuarios:', error);

        document.getElementById('contenido').innerHTML =
            '<p>Error al cargar usuarios</p>';
    }
}

async function guardarEstado(id) {

    const estado = document.getElementById(`estado-${id}`).value;

    try {

        const response = await fetch(
            `https://help-center-voltixa.onrender.com/api/tickets/${id}/estado`,
            {
                method: 'PUT',

                headers: getHeaders(),

                body: JSON.stringify({ estado })
            }
        );

        if (!response.ok) {
            throw new Error('No se pudo actualizar el estado');
        }

        const data = await response.json();

        alert(data.message);

        cargarTickets();

    } catch (error) {

        console.error('Error actualizando estado:', error);

        alert('Error al actualizar estado');

    }
}

async function guardarPrioridad(id) {

    const prioridad =
        document.getElementById(`prioridad-${id}`).value;

    try {

        const response = await fetch(
            `https://help-center-voltixa.onrender.com/api/tickets/${id}`,
            {
                method: 'PUT',

                headers: getHeaders(),

                body: JSON.stringify({ prioridad })
            }
        );

        if (!response.ok) {
            throw new Error('No se pudo actualizar prioridad');
        }

        const data = await response.json();

        alert(data.message);

        cargarTickets();

    } catch (error) {

        console.error(error);

        alert('Error actualizando prioridad');
    }
}


// Guardar rol de usuario
async function guardarRol(id) {

    const rol =
        document.getElementById(`rol-${id}`).value;

    try {

        const response = await fetch(
            `https://help-center-voltixa.onrender.com/api/users/${id}/rol`,
            {
                method: 'PUT',

                headers: getHeaders(),

                body: JSON.stringify({ rol })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error actualizando rol');
        }

        alert(data.message);

        cargarUsuarios();

    } catch (error) {

        console.error(error);

        alert('Error actualizando rol');
    }
}