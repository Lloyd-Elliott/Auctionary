const Joi = require('joi');
const core = require('../controllers/core.server.controllers.js');
const { isAuthenticated, optionalAuthentication } = require('../lib/authentication');

module.exports = function (app) {
    
    app.route('/search')
        .get(optionalAuthentication, core.searchItem);

    app.route('/item')
        .post(isAuthenticated,core.createItem);

    app.route('/item/:itemId')
        .get(core.getItemDetailsByID);

    app.route('/item/:itemId/bid')
        .post(isAuthenticated, core.placeBid);

    app.route('/item/:itemId/bid')
        .get(core.getBidsForItem);
}