const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/init');

const SECRET = 'super_secret_key';

// РЕГИСТРАЦИЯ
router.post('/register', async (req, res) => {

    const { username, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (username, password, role)
         VALUES (?, ?, ?)`,
        [username, hash, 'manager'],
        function (err) {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({ message: 'User created' });
        }
    );
});

// ЛОГИН
router.post('/login', (req, res) => {

    const { username, password } = req.body;

    db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        async (err, user) => {

            if (!user) {
                return res.status(401).json({ message: 'Wrong credentials' });
            }

            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return res.status(401).json({ message: 'Wrong credentials' });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                SECRET,
                { expiresIn: '2h' }
            );

            res.json({ token });
        }
    );
});

module.exports = router;