const router = require('express').Router();
const db = require('../db/init');
const { auth, checkRole } = require('../middleware/auth');

// просмотр — все роли
router.get('/', auth, (req, res) => {
    db.all(`SELECT * FROM orders`, [], (err, rows) => {
        res.json(rows);
    });
});

// создание — worker + admin
router.post('/', auth, checkRole(['admin', 'worker']), (req, res) => {

    const { title, description, status, client_id } = req.body;

    db.run(
        `INSERT INTO orders (title, description, status, client_id)
         VALUES (?, ?, ?, ?)`,
        [title, description, status, client_id],
        function () {
            res.json({ id: this.lastID });
        }
    );
});

// удаление — только admin
router.delete('/:id', auth, checkRole(['admin']), (req, res) => {

    db.run(`DELETE FROM orders WHERE id = ?`, [req.params.id]);

    res.json({ ok: true });
});

// статус — worker + admin
router.put('/:id', auth, checkRole(['admin', 'worker']), (req, res) => {

    db.run(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [req.body.status, req.params.id]
    );

    res.json({ ok: true });
});

module.exports = router;