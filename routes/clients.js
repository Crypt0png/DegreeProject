const router = require('express').Router();

const db = require('../db/init');

router.get('/', (req, res) => {

    db.all(`SELECT * FROM clients`, [], (err, rows) => {

        res.json(rows);

    });

});

router.post('/', (req, res) => {

    const {
        company_name,
        phone,
        email
    } = req.body;

    db.run(
        `INSERT INTO clients
        (company_name, phone, email)
        VALUES (?, ?, ?)`,
        [company_name, phone, email],
        function(err) {

            res.json({
                id: this.lastID
            });

        }
    );

});

module.exports = router;