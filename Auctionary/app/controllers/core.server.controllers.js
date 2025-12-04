const core = require('../models/core.server.models.js');
const Joi = require('joi');

const searchItem = (req, res) => {
  return res.sendStatus(500);
}  

const createItem = (req, res) => {
  const creator_id = req.user_id;

  const schema = Joi.object({
      name: Joi.string().min(1).max(100).required(),
      description: Joi.string().min(2).max(1000).required(),
      starting_bid: Joi.number().min(1).required(),
      start_date: Joi.date(),
      end_date: Joi.date().greater('now').required(),
    });

    

  const { error, value } = schema.validate(req.body, { allowUnknown: false, convert: true });
    if (error) {
      console.log('Validation failed:', error.details[0].message);
      console.log('Request body:', req.body);
      return res.status(400).json({ error_message: error.details[0].message });
    };

    value.creator_id = creator_id;
    if (value.start_date) {
      value.start_date = new Date(value.start_date).getTime();
    } else {
      value.start_date = Date.now();
    }
    value.end_date = new Date(value.end_date).getTime();

    core.createItem(value, (err, itemId) => {
        if (err) {
            console.error('DB insert error:', err && err.message ? err.message : err);
            return res.status(500).json({ error: 'Failed to create item' });
        }
        return res.status(201).json({ item_id: itemId, name: value.name});
    });
};



const placeBid = (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  if (Number.isNaN(itemId)) return res.status(400).json({ error_message: 'invalid item id' });

  const schema = Joi.object({
    amount: Joi.number().integer().min(1).required()
  });
  const { error, value } = schema.validate(req.body, { allowUnknown: false });
  if (error) return res.status(400).json({ error_message: error.details[0].message });

  const bidderId = req.user_id;

  core.getItemById(itemId, (err, item) => {
    if (err) return res.sendStatus(500);
    if (!item) return res.sendStatus(404);
    if (item.creator_id === bidderId) return res.sendStatus(403);

    core.getHighestBid(itemId, (err, highest) => {
      if (err) return res.sendStatus(500);
      const current = highest !== null ? highest : item.starting_bid;

      if (value.amount <= current) {
        return res.status(400).json({ error_message: 'Bid must be higher than current bid' });
      }

      core.addBid(itemId, bidderId, value.amount, (err) => {
        if (err) return res.sendStatus(500);
        return res.sendStatus(201);
      });
    });
  });
}

const getItemDetailsByID = (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  if (Number.isNaN(itemId)) return res.status(400).json({ error_message: 'invalid item id' });
 
  core.getItemDetailsByID(itemId, (err, itemDetails) => {
    if (err) return res.sendStatus(500);
    if (!itemDetails) return res.sendStatus(404);
    return res.status(200).json(itemDetails);
  });
}

const getBidsForItem = (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  if (Number.isNaN(itemId)) return res.status(400).json({ error_message: 'invalid item id' });

  core.getItemById(itemId, (err, item) => {
    if (err) return res.sendStatus(500);
    if (!item) return res.sendStatus(404);

    core.getBidsForItem(itemId, (err2, bids) => {
      if (err2) return res.sendStatus(500);
      return res.status(200).json(bids);
    });
  });
}

module.exports = {
  searchItem: searchItem,
  createItem: createItem,
  placeBid: placeBid,
  getItemDetailsByID: getItemDetailsByID,
  getBidsForItem: getBidsForItem
}