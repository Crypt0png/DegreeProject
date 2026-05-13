const router = require('express').Router();
const db = require('../db/init');
const auth = require('../middleware/auth');

// GET all orders
router.get('/', auth, (req, res) => {
    db.all(`SELECT * FROM orders`, [], (err, rows) => {
        res.json(rows);
    });
});

// CREATE order
router.post('/', auth, (req, res) => {
    const { title, description, status, client_id } = req.body;

    db.run(
        `INSERT INTO orders (title, description, status, client_id)
         VALUES (?, ?, ?, ?)`,
        [title, description, status, client_id],
        function (err) {
            res.json({ id: this.lastID });
        }
    );
});

// DELETE order
router.delete('/:id', auth, (req, res) => {
    db.run(
        `DELETE FROM orders WHERE id = ?`,
        [req.params.id],
        function (err) {
            res.json({ deleted: true });
        }
    );
});

// UPDATE status
router.put('/:id', auth, (req, res) => {
    const { status } = req.body;

    db.run(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [status, req.params.id],
        function (err) {
            res.json({ updated: true });
        }
    );
});

module.exports = router;