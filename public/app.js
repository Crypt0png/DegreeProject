async function loadOrders() {
    const res = await fetch('/orders');
    const orders = await res.json();
    const token = localStorage.getItem('token');

    const tbody = document.querySelector('#ordersTable tbody');
    tbody.innerHTML = '';

    orders.forEach(order => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.title}</td>
            <td>${order.description}</td>
            <td>
                <select onchange="updateStatus(${order.id}, this.value)">
                    <option ${order.status === 'Новый' ? 'selected' : ''}>Новый</option>
                    <option ${order.status === 'В работе' ? 'selected' : ''}>В работе</option>
                    <option ${order.status === 'Готов' ? 'selected' : ''}>Готов</option>
                    <option ${order.status === 'Отменён' ? 'selected' : ''}>Отменён</option>
                </select>
            </td>
            <td>
                <button onclick="deleteOrder(${order.id})">Удалить</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

async function createOrder() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    await fetch('/orders', {
        method: 'POST',
        headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
},
        body: JSON.stringify({
            title,
            description,
            status: 'Новый',
            client_id: 1
        })
    });

    loadOrders();
}

async function deleteOrder(id) {
    await fetch(`/orders/${id}`, {
        method: 'DELETE'
    });

    loadOrders();
}

async function updateStatus(id, status) {
    await fetch(`/orders/${id}`, {
        method: 'PUT',
        headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
},
        body: JSON.stringify({ status })
    });

    loadOrders();
}

loadOrders();