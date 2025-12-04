const db = require('../../database');
const crypto = require('crypto');


const create = (user, done)  =>{
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);

    // Insert first_name, last_name, email, hashed password and salt into the users table
    const sql = 'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)';
    const values = [user.first_name, user.last_name, user.email, hash, salt.toString('hex')];
    db.run(sql, values, function (err) {
        return done(err, this ? this.lastID : null);
    });
};

const findByEmail = (email, done) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
        return done(err, row || null);
    });
};

const findByToken = (session_token, done) => {
    const sql = 'SELECT user_id FROM users WHERE session_token = ?';
    db.get(sql, [session_token], (err, row) => {
        return done(err, row || null);
    });
};

const getHash = function(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 256, 'sha256').toString('hex');
};

const authenticateUser = (email, password, done) => {
    const sql = 'SELECT user_id, password, salt FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
        if (err || !row){
                console.log("AUTH 1", err, row);
                return done(true); // return error = true (failed auth)
            }else{

                if(row.salt == null){
                    row.salt = '';
                }

                let salt = Buffer.from(row.salt, 'hex');

                if (row.password === getHash(password, salt)){
                    return done(false, row.user_id);
                }else{
                    console.log("failed passwd check");
                    return done(true); // failed password check
                }

            }
        }
    );
};

const getToken = function(user_id, done) {
    db.get(
        'SELECT session_token from users WHERE user_id = ?',
        [user_id],
        function(err, row) {
            if (row && row.session_token) {
                return done(null, row.session_token);
            }else {
                return done(null, null);
            }
        }
    );
};

const setToken = function(user_id,done) {
    let session_token = crypto.randomBytes(16).toString('hex');
    db.run(
        'UPDATE users SET session_token = ? WHERE user_id = ?',
        [session_token, user_id],
        function(err) {return done(err, session_token)}
    );
};


const removeToken = (session_token, done) => {
  db.run(
    'UPDATE users SET session_token = NULL WHERE session_token = ?',
    [session_token],
    function(err) {
      if (err) return done(err);
      return done(null, this.changes);
    }
  );
};

const getUserById = (user_id, done) => {  
const sql = 'SELECT * FROM users WHERE user_id = ?';
    db.get(sql, [user_id], (err, row) => {
        if (err) return done(err);
        return done(null, row);
    });
};

module.exports = {
    create: create,
    findByEmail: findByEmail,
    findByToken: findByToken,
    getHash: getHash,
    authenticateUser: authenticateUser,
    getToken: getToken,
    setToken: setToken,
    removeToken: removeToken,
    getUserById: getUserById
};