const db = require('../../database');

const createItem = (item, done) => {
    const sql = `
        INSERT INTO items 
            (name, description, starting_bid, start_date, end_date, creator_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
        item.name,
        item.description,
        item.starting_bid,
        item.start_date,
        item.end_date,
        item.creator_id
    ];

    db.run(sql, params, function(err) {
        if (err) return done(err);
        return done(null, this.lastID);
    });
};

const getItemById = (itemId, done) => {
    const sql = 'SELECT * FROM items WHERE item_id = ?';
    db.get(sql, [itemId], (err, row) => {
        if (err) return done(err);
        return done(null, row || null);
    });
};

const getHighestBid = (itemId, done) => {
    const sql = 'SELECT MAX(amount) as max_amount FROM bids WHERE item_id = ?';
    db.get(sql, [itemId], (err, row) => {
        if (err) return done(err);
        return done(null, row && row.max_amount ? row.max_amount : null);
    });
};

const addBid = (itemId, userId, amount, done) => {
    const timestamp = Date.now();
    const sql = 'INSERT INTO bids (item_id, user_id, amount, timestamp) VALUES (?, ?, ?, ?)';
    db.run(sql, [itemId, userId, amount, timestamp], function(err) {
        if (err) return done(err);
        return done(null, this.changes);
    });
};

const getBidsForItem = (itemId, done) => {
    const sql = `
        SELECT b.item_id, b.amount, b.timestamp, u.user_id, u.first_name, u.last_name
        FROM bids b
        JOIN users u ON b.user_id = u.user_id
        WHERE b.item_id = ?
        ORDER BY b.timestamp DESC
    `;
    db.all(sql, [itemId], (err, rows) => {
        if (err) return done(err);
        return done(null, rows || []);
    });
};

const getItemsByCreator = (creatorId, done) => {
    const sql = `
        SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name
        FROM items i
        JOIN users u ON i.creator_id = u.user_id
        WHERE i.creator_id = ?
        ORDER BY i.item_id ASC
    `;
    db.all(sql, [creatorId], (err, rows) => {
        if (err) return done(err);
        return done(null, rows || []);
    });
};

const getItemsUserBids = (userId, done) => {
    const sql = `
        SELECT DISTINCT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name
        FROM bids b
        JOIN items i ON b.item_id = i.item_id
        JOIN users u ON i.creator_id = u.user_id
        WHERE b.user_id = ?
        ORDER BY i.item_id ASC
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) return done(err);
        return done(null, rows || []);
    });
};

const getEndedAuctionsByCreator = (creatorId, date, done) => {
    const sql = `
        SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name
        FROM items i
        JOIN users u ON i.creator_id = u.user_id
        WHERE i.creator_id = ? AND i.end_date < ?
        ORDER BY i.item_id ASC
    `;
    db.all(sql, [creatorId, date], (err, rows) => {
        if (err) return done(err);
        return done(null, rows || []);
    });
};

const getItemDetailsByID = (itemId, done) => {
    const sql = `
        SELECT
            i.item_id,
            i.name,
            i.description,
            i.starting_bid,
            i.start_date,
            i.end_date,
            i.creator_id,
            cu.first_name AS first_name,
            cu.last_name  AS last_name,
            hb.max_amount AS current_bid,
            b.user_id    AS bidder_id,
            bu.first_name AS bidder_first_name,
            bu.last_name  AS bidder_last_name
        FROM items i
        LEFT JOIN users cu ON i.creator_id = cu.user_id
        LEFT JOIN (
            SELECT item_id, MAX(amount) AS max_amount
            FROM bids
            GROUP BY item_id
        ) hb ON hb.item_id = i.item_id
        LEFT JOIN bids b ON b.item_id = i.item_id AND b.amount = hb.max_amount
        LEFT JOIN users bu ON bu.user_id = b.user_id
        WHERE i.item_id = ?
    `;

    db.get(sql, [itemId], (err, row) => {
        if (err) return done(err);
        if (!row) return done(null, null);

        const result = {
            item_id: row.item_id,
            name: row.name,
            description: row.description,
            starting_bid: row.starting_bid,
            start_date: row.start_date,
            end_date: row.end_date,
            creator_id: row.creator_id,
            first_name: row.first_name || null,
            last_name: row.last_name || null,
            current_bid: row.current_bid !== null ? row.current_bid : row.starting_bid,
            current_bid_holder: row.bidder_id ? {
                user_id: row.bidder_id || null,
                first_name: row.bidder_first_name || null,
                last_name: row.bidder_last_name || null 
            } : null
        };

        return done(null, result);
    });
};

const searchItems = (options, done) => {
    const { q, status, userId, limit, offset } = options;
    
    let sql = '';
    let params = [];
    
    if (status === 'BID') {
        // Items user has bid on
        sql = `
            SELECT DISTINCT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name
            FROM items i
            JOIN users u ON i.creator_id = u.user_id
            WHERE i.item_id IN (SELECT item_id FROM bids WHERE user_id = ?)
        `;
        params.push(userId);
        
        if (q) {
            sql += ` AND (i.name LIKE ? OR i.description LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }
    } else if (status === 'OPEN') {
        // Items user created that haven't ended
        sql = `
            SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name
            FROM items i
            JOIN users u ON i.creator_id = u.user_id
            WHERE i.creator_id = ? AND i.end_date > ?
        `;
        params.push(userId, Date.now());
        
        if (q) {
            sql += ` AND (i.name LIKE ? OR i.description LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }
    } else if (status === 'ARCHIVE') {
        // Items user created that have ended
        sql = `
            SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name
            FROM items i
            JOIN users u ON i.creator_id = u.user_id
            WHERE i.creator_id = ? AND i.end_date <= ?
        `;
        params.push(userId, Date.now());
        
        if (q) {
            sql += ` AND (i.name LIKE ? OR i.description LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }
    } else {
        // All items (no status filter)
        sql = `
            SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name
            FROM items i
            JOIN users u ON i.creator_id = u.user_id
        `;
        
        if (q) {
            sql += ` WHERE (i.name LIKE ? OR i.description LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }
    }
    
    sql += ` ORDER BY i.item_id ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    db.all(sql, params, (err, rows) => {
        if (err) return done(err);
        return done(null, rows || []);
    });
};

module.exports = {
    createItem: createItem,
    getItemById: getItemById,
    getItemDetailsByID: getItemDetailsByID,
    getBidsForItem: getBidsForItem,
    getItemsByCreator: getItemsByCreator,
    getItemsUserBids: getItemsUserBids,
    getEndedAuctionsByCreator: getEndedAuctionsByCreator,
    getHighestBid: getHighestBid,
    addBid: addBid,
    searchItems: searchItems
};

