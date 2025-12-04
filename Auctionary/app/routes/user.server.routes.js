const users = require('../controllers/user.server.controllers.js');
const { isAuthenticated } = require('../lib/authentication');

module.exports = function (app) {
    app.route('/users')
        .post(users.createUser);

    app.route('/users/:userId')
        .get(users.getUserById);

    app.route('/login')
        .post(users.userLogin);

    app.route('/logout')
        .post(isAuthenticated, users.userLogout);
}