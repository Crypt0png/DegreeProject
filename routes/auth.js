const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/init');

const SECRET = 'super_secret_key';

// РЕГИСТРАЦИЯ ЗАКРЫТА — пользователей создаёт только admin через /users
// router.post('/register', ...)

// ЛОГИН
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        async (err, user) => {
            if (!user) {
                return res.status(401).json({ message: 'Неверный логин или пароль' });
            }

            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return res.status(401).json({ message: 'Неверный логин или пароль' });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role },
                SECRET,
                { expiresIn: '8h' }
            );

            res.json({ token });
        }
    );
});

module.exports = router;