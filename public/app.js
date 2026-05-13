const token = localStorage.getItem('token');

if (!token && !location.pathname.includes('login')) {
    window.location.href = '/login.html';
}

// Маппинг статуса → CSS-класс
function statusClass(status) {
    const map = {
        'Новый':    'status-new',
        'В работе': 'status-progress',
        'Готов':    'status-done',
        'Отменён':  'status-cancel',
    };
    return map[status] || '';
}

async function loadOrders() {
    const res = await fetch('/orders', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();

    if (!Array.isArray(data)) {
        console.error("НЕ МАССИВ:", data);
        return;
    }

    const tbody = document.querySelector('#ordersTable tbody');
    tbody.innerHTML = '';

    data.forEach(order => {
        const row = document.createElement('tr');
        const cls = statusClass(order.status);

        row.innerHTML = `
            <td class="cell-id">#${order.id}</td>
            <td>${order.title}</td>
            <td>${order.description || '—'}</td>
            <td>
                <select class="status-select ${cls}"
                        onchange="updateStatus(${order.id}, this)">
                    <option ${order.status === 'Новый'    ? 'selected' : ''}>Новый</option>
                    <option ${order.status === 'В работе' ? 'selected' : ''}>В работе</option>
                    <option ${order.status === 'Готов'    ? 'selected' : ''}>Готов</option>
                    <option ${order.status === 'Отменён'  ? 'selected' : ''}>Отменён</option>
                </select>
            </td>
            <td>
                <button class="btn btn-danger" onclick="deleteOrder(${order.id})">Удалить</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

async function createOrder() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!title) {
        alert('Введите название заказа');
        return;
    }

    await fetch('/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ title, description, status: 'Новый', client_id: 1 })
    });

    document.getElementById('title').value = '';
    document.getElementById('description').value = '';

    loadOrders();
    loadDashboard();
}

async function deleteOrder(id) {
    if (!confirm('Удалить заказ #' + id + '?')) return;

    await fetch(`/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    loadOrders();
    loadDashboard();
}

async function updateStatus(id, selectEl) {
    const status = selectEl.value;

    // Обновляем класс сразу без перезагрузки
    selectEl.className = 'status-select ' + statusClass(status);

    await fetch(`/orders/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ status })
    });

    loadDashboard();
}

async function loadDashboard() {
    const res = await fetch('/api/dashboard', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();

    document.getElementById('total').innerText    = data.total    ?? 0;
    document.getElementById('new').innerText      = data.newOrders ?? 0;
    document.getElementById('progress').innerText = data.inProgress ?? 0;
    document.getElementById('done').innerText     = data.doneOrders ?? 0;
}

loadOrders();
loadDashboard();