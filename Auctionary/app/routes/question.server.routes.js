const questions = require('../controllers/question.server.controllers.js');
const { isAuthenticated } = require('../lib/authentication');

module.exports = function (app) {
	app.route('/item/:itemId/question')
		.get(questions.getQuestionsByItem);

	// asking a question requires authentication
	app.route('/item/:itemId/question')
		.post(isAuthenticated, questions.askQuestion);

	// answering a question requires authentication
	app.route('/question/:questionId')
		.post(isAuthenticated, questions.answerQuestion);

};



    