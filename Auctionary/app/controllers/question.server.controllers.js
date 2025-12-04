const Joi = require('joi');
const questions = require('../models/question.server.models.js');
const users = require('../models/user.server.models.js');
const core = require('../models/core.server.models.js');


const askQuestion = (req, res) => {
    const itemId = parseInt(req.params.itemId, 10);
    const userId = req.user_id;
    const schema = Joi.object({
        question_text: Joi.string().required()
    });
    const { error, value } = schema.validate(req.body, { allowUnknown: false });
    if (error) {
        console.log('Validation error:', error.details[0].message);
        return res.status(400).json({ error_message: error.details[0].message });
    }
    core.getItemById(itemId, (err, item) => {
        if (err) return res.sendStatus(500);
        if (!item) return res.status(404).json({ error_message: 'Item not found' });
        if (item.creator_id === userId) {
            return res.status(403).json({ error_message: 'Cannot ask question on your own item' });
        }

        questions.askQuestion(itemId, userId, value.question_text, (err, questionId) => {
            if (err) {
                console.error('Error asking question:', err && err.message ? err.message : err);
                return res.status(500).json({ error_message: 'Error asking question' });
            }
            return res.status(200).json({ question_id: questionId });
        });
    });
};

const getQuestionsByItem = (req, res) => {
    const itemId = parseInt(req.params.itemId, 10);
    if (Number.isNaN(itemId)) return res.status(400).json({ error_message: 'invalid item id' });
    core.getItemById(itemId, (err, item) => {
        if (err) return res.sendStatus(500);
        if (!item) return res.sendStatus(404);

        questions.getQuestionsByItem(itemId, (err2, rows) => {
            if (err2) return res.sendStatus(500);
            return res.status(200).json(rows || []);
        });
    });
};

const answerQuestion = (req, res) => {
    const questionId = parseInt(req.params.questionId, 10);
    if (Number.isNaN(questionId)) return res.status(400).json({ error_message: 'invalid question id' });

    const schema = Joi.object({
        answer_text: Joi.string().max(1000).required()
    });
    const { error, value } = schema.validate(req.body, { allowUnknown: false });
    if (error) return res.status(400).json({ error_message: error.details[0].message });

    // check question exists and get creator id
    questions.getQuestionById(questionId, (err, qrow) => {
        if (err) return res.sendStatus(500);
        if (!qrow) return res.sendStatus(404);

        const userId = req.user_id;
        if (qrow.creator_id !== userId) return res.sendStatus(403);

        questions.answerQuestion(questionId, value.answer_text, (err2, changes) => {
            if (err2) return res.sendStatus(500);
            return res.sendStatus(200);
        });
    });
};

module.exports = {
    askQuestion: askQuestion,
    getQuestionsByItem: getQuestionsByItem,
    answerQuestion: answerQuestion
};