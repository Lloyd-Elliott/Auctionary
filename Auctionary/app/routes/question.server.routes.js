const questions = require('../controllers/question.server.controllers.js');
const { isAuthenticated } = require('../lib/authentication');

module.exports = function (app) {
	app.route('/item/:itemId/question')
		.get(questions.getQuestionsByItem);

	app.route('/item/:itemId/question')
		.post(isAuthenticated, questions.askQuestion);

	app.route('/question/:questionId')
		.post(isAuthenticated, questions.answerQuestion);

};



    