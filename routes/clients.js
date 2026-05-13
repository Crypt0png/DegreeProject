const router = require('express').Router();
const db = require('../db/init');
const { auth, checkRole } = require('../middleware/auth');

// просмотр — все авторизованные
router.get('/', auth, (req, res) => {
    db.all(`SELECT * FROM clients`, [], (err, rows) => {
        res.json(rows);
    });
});

// создание — worker + admin
router.post('/', auth, checkRole(['admin', 'worker']), (req, res) => {
    const { company_name, phone, email } = req.body;

    db.run(
        `INSERT INTO clients (company_name, phone, email) VALUES (?, ?, ?)`,
        [company_name, phone, email],
        function (err) {
            if (err) return res.status(500).json(err);
            res.json({ id: this.lastID });
        }
    );
});

// удаление — только admin
router.delete('/:id', auth, checkRole(['admin']), (req, res) => {
    db.run(`DELETE FROM clients WHERE id = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ ok: true });
    });
});

module.exports = router;