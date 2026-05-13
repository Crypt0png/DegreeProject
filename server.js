const express = require('express');
const cors = require('cors');
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

app.listen(3000, () => {
    console.log('Server started on port 3000');
});