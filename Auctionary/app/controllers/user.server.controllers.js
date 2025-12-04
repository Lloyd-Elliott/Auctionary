const user = require('../models/user.server.models.js');
const core = require('../models/core.server.models.js');
const Joi = require('joi');

const createUser = (req, res) => {
  // Password must be 8-30 chars and include at least one lower, one upper, one digit and one special char
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,30}$/;

  const schema = Joi.object({
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().min(2).max(100).required(),
    password: Joi.string().pattern(passwordPattern).required(),
    email: Joi.string().email().required()
  });

  const { error, value } = schema.validate(req.body, { allowUnknown: false });
  if (error) { return res.status(400).json({ error_message: error.details[0].message }); };
  
  user.findByEmail(value.email, (err, existingUser) => {
  if (err) { return res.status(500).send({ message: 'Error checking existing user' }); }
  if (existingUser) { return res.status(400).json({ error_message: 'User with this email already exists' }); }

    
    user.create(value, (err, userId) => {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT' || /UNIQUE/i.test(err.message || '')) {
          return res.status(400).json({ error_message: 'User with this email already exists' });
        }
        return res.status(400).json({ error_message: 'Error creating user' });
      }
      return res.status(201).json({ user_id: userId });
    });
  });
}



const getUserById = (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (Number.isNaN(userId)) return res.status(404).send({ message: 'invalid id' });

  user.getUserById(userId, (err, userRow) => {
    if (err) return res.sendStatus(500);
    if (!userRow) return res.sendStatus(404);

    // assemble selling, bidding_on, auctions_ended
    core.getItemsByCreator(userId, (err1, selling) => {
      if (err1) return res.sendStatus(500);

      core.getItemsUserBids(userId, (err2, bidding_on) => {
        if (err2) return res.sendStatus(500);

        const nowTs = Date.now();
        core.getEndedAuctionsByCreator(userId, nowTs, (err3, auctions_ended) => {
          if (err3) return res.sendStatus(500);

          const result = {
            user_id: userRow.user_id,
            first_name: userRow.first_name,
            last_name: userRow.last_name,
            selling: selling || [],
            bidding_on: bidding_on || [],
            auctions_ended: auctions_ended || []
          };

          return res.status(200).json(result);
        });
      });
    });
  });
};

const userLogin = (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  const { error, value } = schema.validate(req.body, { allowUnknown: false });
  if (error) {
    console.log('Validation error:', error.details[0].message);
    return res.status(400).send({ error_message: error.details[0].message });
  }else{
    let email = req.body.email;
    let password = req.body.password;

    user.authenticateUser(email, password, function(err, user_id){
      if(err){
        console.log('Authentication error:', err);
        res.status(400).json({ error_message: 'Invalid email or password' } );
      } else{
        user.getToken(user_id, function(err,session_token){
          if(session_token){
            return res.status(200).send({user_id:user_id, session_token:session_token});
          } else{
              user.setToken(user_id, function(err, session_token){
                  if (err) return res.status(500).json({ error: 'Error setting token' })
                  res.status(200).send({user_id: user_id, session_token: session_token});
          });
        }
      });
      }
    });
  }
}



const userLogout = (req, res) => {
  const session_token = req.get('X-Authorization');

  if (!session_token) {
    return res.status(401).json({ error: 'Missing session token' });
  }

  user.findByToken(session_token, (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to verify token' });
    if (!row) return res.status(401).json({ error: 'Invalid token' });

    user.removeToken(session_token, function(err, changes) {
      if (err) {
        return res.status(500).json({ error: 'Failed to log out' });
      }
      return res.status(200).json({ message: 'Logout successful' });
    });
  });
};







module.exports = {
  createUser: createUser,
  getUserById: getUserById,
  userLogin: userLogin,
  userLogout: userLogout
};


