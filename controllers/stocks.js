const Stock = require('../models/stock');
const User = require('../models/user');

module.exports = (app) => {

    // TRANSACTIONS GET ROUTE, SHOW TRANSACTIONS PAGE
        app.get('/transactions', (req, res) => {
            var currentUser = req.user;
            if (currentUser) {
            User.findOne({username: req.user})
                .then(user => {
                   Stock.find().populate('quote')
                {
                res.render('transactions', {currentUser});
                };
            });
            } else {
                res.render('sign-in', currentUser);
            }
        })
};
