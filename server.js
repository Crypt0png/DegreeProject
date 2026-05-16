const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { auth } = require('./middleware/auth');
const db = require('./db/init');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/auth',    require('./routes/auth'));
app.use('/orders',  require('./routes/orders'));
app.use('/clients', require('./routes/clients'));
app.use('/users',   require('./routes/users'));

app.get('/api/dashboard', auth, (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Новый'    THEN 1 ELSE 0 END) as newOrders,
            SUM(CASE WHEN status = 'Готов'    THEN 1 ELSE 0 END) as doneOrders,
            SUM(CASE WHEN status = 'В работе' THEN 1 ELSE 0 END) as inProgress
        FROM orders
    `;

    db.get(sql, [], (err, row) => {
        if (err) return res.status(500).json(err);
        res.json(row);
    });
});

// ── Первый запуск: создаём admin если база пустая ──────
async function createDefaultAdmin() {
    db.get(`SELECT COUNT(*) as count FROM users`, [], async (err, row) => {
        if (err || row.count > 0) return;

        const hash = await bcrypt.hash('admin', 10);

        db.run(
            `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
            ['admin', hash, 'admin'],
            () => {
                console.log('──────────────────────────────────────────');
                console.log('  Создан администратор по умолчанию:');
                console.log('  Логин:  admin');
                console.log('  Пароль: admin');
                console.log('  Смените пароль после первого входа!');
                console.log('──────────────────────────────────────────');
            }
        );
    });
}

app.listen(3000, () => {
    console.log('Server started on port 3000');
    createDefaultAdmin();
});