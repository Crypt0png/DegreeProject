const jwt = require('jsonwebtoken');

const SECRET = 'super_secret_key';

function auth(req, res, next) {

    const header = req.headers.authorization;

    if (!header) return res.status(401).json({ message: 'No token' });

    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

function checkRole(roles) {

    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'No access' });
        }

        next();
    };
}

module.exports = { auth, checkRole };