const express = require('express');
const cors = require('cors');

const app = express();

require('./db/init');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/auth', require('./routes/auth'));
app.use('/orders', require('./routes/orders'));
app.use('/clients', require('./routes/clients'));

app.listen(3000, () => {
    console.log('Server started on port 3000');
});