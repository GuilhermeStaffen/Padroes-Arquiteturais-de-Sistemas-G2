const API_URL = '/api';
let currentUser = null;
let currentToken = null;
let currentTicketId = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
        currentToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showSection('login-section');
    }

    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = '';

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Erro no login');

            currentToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', currentToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            document.getElementById('username').value = '';
            showDashboard();
        } catch (err) {
            errorEl.textContent = err.message;
        }
    });

    document.getElementById('create-ticket-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('ticket-title').value;
        const description = document.getElementById('ticket-desc').value;

        try {
            const res = await fetch(`${API_URL}/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify({ title, description, userId: currentUser.id })
            });
            
            if (res.ok) {
                document.getElementById('ticket-title').value = '';
                document.getElementById('ticket-desc').value = '';
                showDashboard();
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao criar ticket');
            }
        } catch (err) {
            console.error(err);
        }
    });

    document.getElementById('add-comment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('comment-content').value;

        try {
            const res = await fetch(`${API_URL}/tickets/${currentTicketId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify({ userId: currentUser.id, content })
            });

            if (res.ok) {
                document.getElementById('comment-content').value = '';
                loadTicketDetails(currentTicketId);
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao adicionar comentário');
            }
        } catch (err) {
            console.error(err);
        }
    });
}

function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';

    const userInfo = document.getElementById('user-info');
    if (sectionId === 'login-section') {
        userInfo.style.display = 'none';
    } else {
        userInfo.style.display = 'flex';
        userInfo.style.alignItems = 'center';
        document.getElementById('current-user').textContent = `Olá, ${currentUser?.username}`;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    currentToken = null;
    showSection('login-section');
}

function showDashboard() {
    showSection('dashboard-section');
    loadTickets();
}

function showCreateTicketForm() {
    showSection('create-ticket-section');
}

async function loadTickets() {
    try {
        const res = await fetch(`${API_URL}/tickets`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (res.status === 401) return logout();
        
        const tickets = await res.json();
        const container = document.getElementById('tickets-list');
        container.innerHTML = '';

        if (tickets.length === 0) {
            container.innerHTML = '<p>Nenhum ticket encontrado.</p>';
            return;
        }

        tickets.forEach(ticket => {
            const date = new Date(ticket.createdAt).toLocaleString();
            const div = document.createElement('div');
            div.className = 'ticket-card';
            div.onclick = () => loadTicketDetails(ticket.id);
            div.innerHTML = `
                <div class="ticket-header">
                    <h3>${escapeHtml(ticket.title)}</h3>
                    <span class="status ${ticket.status}">${ticket.status}</span>
                </div>
                <p style="color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem;">Criado em ${date}</p>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadTicketDetails(id) {
    currentTicketId = id;
    showSection('ticket-details-section');
    const container = document.getElementById('ticket-details-content');
    container.innerHTML = 'Carregando...';

    try {
        const res = await fetch(`${API_URL}/tickets/${id}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (res.status === 401) return logout();

        const ticket = await res.json();
        const date = new Date(ticket.createdAt).toLocaleString();
        
        let statusSelectHtml = '';
        if (currentUser.isAdmin) {
            statusSelectHtml = `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                    <label><strong>Alterar Status (Admin):</strong></label>
                    <select id="status-select" onchange="updateTicketStatus('${ticket.id}', this.value)" style="padding: 0.5rem; margin-left: 0.5rem; border-radius: 4px; border: 1px solid #d1d5db; background: white;">
                        <option value="OPEN" ${ticket.status === 'OPEN' ? 'selected' : ''}>OPEN</option>
                        <option value="IN_PROGRESS" ${ticket.status === 'IN_PROGRESS' ? 'selected' : ''}>IN_PROGRESS</option>
                        <option value="CLOSED" ${ticket.status === 'CLOSED' ? 'selected' : ''}>CLOSED</option>
                    </select>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="ticket-header" style="margin-bottom: 1rem;">
                <h2>${escapeHtml(ticket.title)}</h2>
                <span class="status ${ticket.status}">${ticket.status}</span>
            </div>
            <p><strong>Criado por:</strong> ${escapeHtml(ticket.userId)} em ${date}</p>
            <div style="margin-top: 1rem; background: #f9fafb; padding: 1rem; border-radius: 4px; white-space: pre-wrap; border: 1px solid #e5e7eb;">${escapeHtml(ticket.description)}</div>
            ${statusSelectHtml}
        `;

        const commentsContainer = document.getElementById('comments-list');
        commentsContainer.innerHTML = '';
        
        if (ticket.comments && ticket.comments.length > 0) {
            ticket.comments.forEach(comment => {
                const cDate = new Date(comment.createdAt).toLocaleString();
                const div = document.createElement('div');
                div.className = 'comment';
                div.innerHTML = `
                    <div class="comment-meta"><strong>${escapeHtml(comment.userId)}</strong> em ${cDate}</div>
                    <div>${escapeHtml(comment.content).replace(/\n/g, '<br>')}</div>
                `;
                commentsContainer.appendChild(div);
            });
        } else {
            commentsContainer.innerHTML = '<p>Nenhum comentário ainda.</p>';
        }

    } catch (err) {
        container.innerHTML = '<p class="error">Erro ao carregar detalhes do ticket.</p>';
        console.error(err);
    }
}

async function updateTicketStatus(id, status) {
    try {
        const res = await fetch(`${API_URL}/tickets/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ status })
        });
        
        if (!res.ok) {
            const data = await res.json();
            alert(data.error || 'Erro ao atualizar status');
        } else {
            loadTicketDetails(id); // Reload
        }
    } catch (err) {
        console.error(err);
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}