const db = require('../../database');

const askQuestion = (itemId, askedBy, questionText, done) => {
    const sql = `
        INSERT INTO questions 
            (item_id, asked_by, question)
        VALUES (?, ?, ?)`;
    const params = [itemId, askedBy, questionText];
    db.run(sql, params, function(err) {
        if (err) return done(err);
        return done(null, this.lastID);
    });
};

const getQuestionsByItem = (itemId, done) => {
    const sql = `
        SELECT q.question_id, q.item_id, q.asked_by, q.question AS question_text, q.answer AS answer_text, u.first_name, u.last_name
        FROM questions q
        JOIN users u ON q.asked_by = u.user_id
        WHERE q.item_id = ?
            ORDER BY q.question_id DESC
    `;
    db.all(sql, [itemId], (err, rows) => {
        if (err) return done(err);
        return done(null, rows || []);
    });
};



const getQuestionById = (questionId, done) => {
    const sql = `
        SELECT questions.*, items.creator_id
        FROM questions
        JOIN items ON questions.item_id = items.item_id
        WHERE questions.question_id = ?
    `;
    db.get(sql, [questionId], (err, row) => {
        if (err) return done(err);
        return done(null, row || null);
    });
};

const answerQuestion = (questionId, answerText, done) => {
    const sql = 'UPDATE questions SET answer = ? WHERE question_id = ?';
    db.run(sql, [answerText, questionId], function(err) {
        if (err) return done(err);
        return done(null, this.changes);
    });
};

module.exports = {
    askQuestion: askQuestion,
    getQuestionsByItem: getQuestionsByItem,
    getQuestionById: getQuestionById,
    answerQuestion: answerQuestion
};
