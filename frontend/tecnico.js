const API_TICKETS = 'https://help-center-voltixa.onrender.com/api/tickets';

let filtroEstadoActual = 'todos';
let filtroPrioridadActual = 'todos';

// Obtener token
function getHeaders() {

    const token = localStorage.getItem('token');

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Logout
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

        const result = await response.json();

        const tickets = Array.isArray(result)
            ? result
            : result.data || [];

        let html = `

            <h2 class="titulo-seccion">
                Tickets
            </h2>

            <div class="filtro-container">

                <label>
                    Filtrar por estado:
                </label>

                <select id="filtroEstado">

                    <option value="todos">Todos</option>
                    <option value="abierto">Abiertos</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="cerrado">Cerrados</option>

                </select>

                <label>
                    Filtrar por prioridad:
                </label>

                <select id="filtroPrioridad">

                    <option value="todos">Todas</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>

                </select>

            </div>
        `;

        let ticketsFiltrados = tickets;

        if (filtroEstadoActual !== 'todos') {

            ticketsFiltrados = tickets.filter(ticket =>
                ticket.estado === filtroEstadoActual
            );
        }

        if (filtroPrioridadActual !== 'todos') {

            ticketsFiltrados = ticketsFiltrados.filter(ticket =>
                ticket.prioridad?.toLowerCase() === filtroPrioridadActual
            );
        }

        html += `<div class="tickets-grid">`;

        ticketsFiltrados.forEach(ticket => {
            
            let colorEstado = '#dc2626';

            let colorPrioridad = '#28a745';

            if (ticket.prioridad?.toLowerCase() === 'alta') {
                colorPrioridad = '#dc3545';
            }

            if (ticket.prioridad?.toLowerCase() === 'media') {
                colorPrioridad = '#ffc107';
            }

                        if (
                            ticket.estado?.toLowerCase() === 'en proceso' ||
                            ticket.estado?.toLowerCase() === 'en_proceso'
                        ) {
                            colorEstado = '#f59e0b';
                        }

                        if (ticket.estado?.toLowerCase() === 'cerrado') {
                            colorEstado = '#16a34a';
                        }

            html += `

                <div class="card"
                style="border-left: 8px solid ${colorPrioridad};">

                    <h3>${ticket.titulo}</h3>

                    <p>
                        ${ticket.descripcion}
                    </p>

                    <p>
                        <strong>Estado actual:</strong>

                        <span style="
                            background:${colorEstado};
                            color:white;
                            padding:4px 10px;
                            border-radius:10px;
                            font-size:12px;
                            font-weight:bold;
                            margin-left:10px;
                        ">
                            ${ticket.estado}
                        </span>
                        </p>

                        <p>
                        <strong>Prioridad:</strong>

                        <span style="
                            background:${colorPrioridad};
                            color:white;
                            padding:4px 10px;
                            border-radius:10px;
                            font-size:12px;
                            font-weight:bold;
                            margin-left:10px;
                        ">
                            ${ticket.prioridad || 'baja'}
                        </span>
                    </p>

                    <select
                        id="estado-${ticket.id}"
                        class="estado-select">

                        <option value="abierto"
                            ${ticket.estado === 'abierto' ? 'selected' : ''}>
                            Abierto
                        </option>

                        <option value="en_proceso"
                            ${ticket.estado === 'en_proceso' ? 'selected' : ''}>
                            En proceso
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

                </div>
            `;
        });

        html += `</div>`;

        document.getElementById('contenido').innerHTML = html;

        const filtro = document.getElementById('filtroEstado');
        const filtroPrioridad =
            document.getElementById('filtroPrioridad');

        filtro.value = filtroEstadoActual;

        filtro.addEventListener('change', (e) => {

            filtroEstadoActual = e.target.value;

            cargarTickets();
        });

            filtroPrioridad.value = filtroPrioridadActual;

            filtroPrioridad.addEventListener('change', (e) => {

                filtroPrioridadActual = e.target.value;

                cargarTickets();
            });

    } catch (error) {

        console.error(error);

        document.getElementById('contenido').innerHTML =
            '<p>Error cargando tickets</p>';
    }
}

// Guardar estado
async function guardarEstado(id) {

    const estado =
        document.getElementById(`estado-${id}`).value;

    try {

        const response = await fetch(
            `https://help-center-voltixa.onrender.com/api/tickets/${id}/estado`,
            {
                method: 'PUT',

                headers: getHeaders(),

                body: JSON.stringify({ estado })
            }
        );

        const data = await response.json();

        alert(data.message);

        cargarTickets();

    } catch (error) {

        console.error(error);

        alert('Error actualizando estado');
    }
}

cargarTickets();