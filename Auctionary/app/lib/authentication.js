const users = require('../models/user.server.models.js');

const isAuthenticated = function(req, res, next) {
    const session_token = req.get('X-Authorization');
    if (!session_token) {
        return res.status(401).json({ error_message: 'unauthorised user' });
    }

    users.findByToken(session_token, (err, row) => {
        if (err) return res.status(500).json({ error_message: 'authentication error' });
        if (!row) return res.status(401).json({ error_message: 'unauthorised user' });

        req.user_id = row.user_id;
        req.session_token = session_token;
        return next();
    });
};

const optionalAuthentication = function(req, res, next) {
    const session_token = req.get('X-Authorization');
    if (!session_token) {
        return next(); 
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
