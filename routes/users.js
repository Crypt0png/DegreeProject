const router = require('express').Router();
const db = require('../db/init');
const bcrypt = require('bcryptjs');
const { auth, checkRole } = require('../middleware/auth');

// список пользователей — только admin
router.get('/', auth, checkRole(['admin']), (req, res) => {
    db.all(`SELECT id, username, role FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

// создание пользователя — только admin
router.post('/', auth, checkRole(['admin']), async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Заполните все поля' });
    }

    const validRoles = ['admin', 'worker', 'analyst'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Недопустимая роль' });
    }

    const hash = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
        [username, hash, role],
        function (err) {
            if (err) return res.status(500).json({ message: 'Пользователь уже существует' });
            res.json({ id: this.lastID });
        }
    );
});

// удаление пользователя — только admin
router.delete('/:id', auth, checkRole(['admin']), (req, res) => {
    db.run(`DELETE FROM users WHERE id = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ ok: true });
    });
});

module.exports = router;