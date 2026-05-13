const express = require('express');
const cors = require('cors');
const { auth } = require('./middleware/auth');
const app = express();
const authRouter = require('./routes/auth');

const db = require('./db/init');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/auth', require('./routes/auth'));
app.use('/orders', require('./routes/orders'));
app.use('/clients', require('./routes/clients'));

app.get('/seed', async (req, res) => {

    const bcrypt = require('bcryptjs');

    const hash = await bcrypt.hash('1234', 10);

    db.run(`
        INSERT INTO users (username, password, role)
        VALUES (?, ?, ?)
    `, ['admin', hash, 'admin']);

    res.json({ ok: true });
});

app.get('/api/dashboard', auth, (req, res) => {

    const sql = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Новый' THEN 1 ELSE 0 END) as newOrders,
            SUM(CASE WHEN status = 'Готов' THEN 1 ELSE 0 END) as doneOrders,
            SUM(CASE WHEN status = 'В работе' THEN 1 ELSE 0 END) as inProgress
        FROM orders
    `;

    db.get(sql, [], (err, row) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(row);
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});