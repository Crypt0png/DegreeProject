const router = require('express').Router();

const db = require('../db/init');

router.get('/', (req, res) => {

    db.all(`SELECT * FROM orders`, [], (err, rows) => {

        res.json(rows);

    });

});

router.post('/', (req, res) => {

    const {
        title,
        description,
        status,
        client_id
    } = req.body;

    db.run(
        `INSERT INTO orders
        (title, description, status, client_id)
        VALUES (?, ?, ?, ?)`,
        [title, description, status, client_id],
        function(err) {

            res.json({
                id: this.lastID
            });

        }
    );

});

module.exports = router;