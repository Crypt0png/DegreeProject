async function loadOrders() {

    const res = await fetch('/orders');

    const orders = await res.json();

    const list = document.getElementById('orders');

    list.innerHTML = '';

    orders.forEach(order => {

        const li = document.createElement('li');

        li.innerText =
            `${order.title} | ${order.status}`;

        list.appendChild(li);

    });

}

async function createOrder() {

    const title =
        document.getElementById('title').value;

    const description =
        document.getElementById('description').value;

    await fetch('/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
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

loadOrders();