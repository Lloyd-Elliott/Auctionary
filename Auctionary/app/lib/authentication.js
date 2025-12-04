const users = require('../models/user.server.models.js');

// Middleware: validates X-Authorization session token and sets req.user_id
const isAuthenticated = function(req, res, next) {
    const session_token = req.get('X-Authorization');
    if (!session_token) {
        return res.status(401).json({ error_message: 'unauthorised user' });
    }

    // findByToken returns the user row for a given session token
    users.findByToken(session_token, (err, row) => {
        if (err) return res.status(500).json({ error_message: 'authentication error' });
        if (!row) return res.status(401).json({ error_message: 'unauthorised user' });

        req.user_id = row.user_id;
        req.session_token = session_token;
        return next();
    });
};

// Middleware: optionally validates X-Authorization, sets req.user_id if present, but continues if not
const optionalAuthentication = function(req, res, next) {
    const session_token = req.get('X-Authorization');
    if (!session_token) {
        return next(); // No token, just continue without setting user_id
    }

    users.findByToken(session_token, (err, row) => {
        if (err) return res.status(500).json({ error_message: 'authentication error' });
        if (row) {
            req.user_id = row.user_id;
            req.session_token = session_token;
        }
        return next();
    });
};

module.exports = {
    isAuthenticated: isAuthenticated,
    optionalAuthentication: optionalAuthentication
};
