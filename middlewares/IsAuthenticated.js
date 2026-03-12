const jwt = require('jsonwebtoken');

exports.check = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Invalid authorization format' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};