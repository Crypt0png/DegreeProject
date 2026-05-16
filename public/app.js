const token = localStorage.getItem('token');

if (!token && !location.pathname.includes('login')) {
    window.location.href = '/login.html';
}

// Декодируем роль из JWT без библиотек
function getRole() {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
    } catch {
        return null;
    }
}

const role = getRole();

// Все заказы храним в памяти чтобы фильтровать без запросов
let allOrders = [];

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

// Загружаем клиентов в select формы создания
async function loadClientsSelect() {
    const res = await fetch('/clients', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const clients = await res.json();

    const select = document.getElementById('client_id');
    if (!select) return;

    select.innerHTML = '<option value="">— Без клиента —</option>';
    clients.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.company_name}</option>`;
    });
}

// Рендерим строки таблицы из массива
function renderOrders(orders) {
    const tbody = document.querySelector('#ordersTable tbody');
    tbody.innerHTML = '';

    if (!orders.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#6b7280; padding:32px;">Заказов не найдено</td></tr>`;
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        const cls = statusClass(order.status);

        const statusCell = role === 'analyst'
            ? `<span class="status-badge ${cls}">${order.status}</span>`
            : `<select class="status-select ${cls}" onchange="updateStatus(${order.id}, this)">
                <option ${order.status === 'Новый'    ? 'selected' : ''}>Новый</option>
                <option ${order.status === 'В работе' ? 'selected' : ''}>В работе</option>
                <option ${order.status === 'Готов'    ? 'selected' : ''}>Готов</option>
                <option ${order.status === 'Отменён'  ? 'selected' : ''}>Отменён</option>
               </select>`;

        const deleteBtn = role === 'admin'
            ? `<button class="btn btn-danger" onclick="deleteOrder(${order.id})">Удалить</button>`
            : '—';

        row.innerHTML = `
            <td class="cell-id">#${order.id}</td>
            <td>${order.title}</td>
            <td>${order.description || '—'}</td>
            <td>${order.client_name || '—'}</td>
            <td>${statusCell}</td>
            <td>${deleteBtn}</td>
        `;

        tbody.appendChild(row);
    });
}

// Фильтр по статусу — работает на клиенте без запросов
function filterOrders() {
    const filterEl = document.getElementById('statusFilter');
    const selected = filterEl.value;

    // Обновляем цвет самого select фильтра
    filterEl.className = 'status-filter ' + (selected ? statusClass(selected) : '');

    const filtered = selected
        ? allOrders.filter(o => o.status === selected)
        : allOrders;

    renderOrders(filtered);
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

    allOrders = data;
    filterOrders(); // рендерим с учётом текущего фильтра
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

async function createOrder() {
    const title       = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const client_id   = document.getElementById('client_id').value || null;

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
        body: JSON.stringify({ title, description, status: 'Новый', client_id })
    });

    document.getElementById('title').value       = '';
    document.getElementById('description').value = '';
    document.getElementById('client_id').value   = '';

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
    selectEl.className = 'status-select ' + statusClass(status);

    await fetch(`/orders/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ status })
    });

    // Обновляем локально чтобы фильтр не сбрасывался
    const order = allOrders.find(o => o.id === id);
    if (order) order.status = status;

    loadDashboard();
}

async function loadDashboard() {
    const res = await fetch('/api/dashboard', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();

    document.getElementById('total').innerText    = data.total      ?? 0;
    document.getElementById('new').innerText      = data.newOrders  ?? 0;
    document.getElementById('progress').innerText = data.inProgress ?? 0;
    document.getElementById('done').innerText     = data.doneOrders ?? 0;
}

function applyRoleUI() {
    if (role === 'analyst') {
        const formSection = document.querySelector('.section:nth-child(2)');
        if (formSection) formSection.style.display = 'none';
    }

    const usersLink = document.getElementById('usersLink');
    if (usersLink && role === 'admin') {
        usersLink.style.display = 'inline-block';
    }
}

loadOrders();
loadDashboard();
loadClientsSelect();
applyRoleUI();