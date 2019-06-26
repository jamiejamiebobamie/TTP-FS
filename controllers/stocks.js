const Stock = require('../models/stock');
const User = require('../models/user');

module.exports = (app) => {

    // TRANSACTIONS GET ROUTE, SHOW TRANSACTIONS PAGE
        app.get('/transactions', (req, res) => {
            var currentUser = req.user;
            let transactions;
            if (currentUser) {
            User.findOne({_id: req.user})
                .then(user => {
                    transactions = user.transactions;
                res.render('transactions', {currentUser, transactions});
            });
            } else {
                res.render('sign-in', currentUser);
            }
        })

        // TRANSACTIONS GET ROUTE, SHOW TRANSACTIONS PAGE
            app.post('/buy', (req, res) => {
                var currentUser = req.user;
                let quantity = Math.ceil(req.body.qty)
                let ticker = req.body.ticker.toUpperCase()
                let moneyAfterPurchase;
                let newStock;
                let new_transaction;
                let valid_stock;
                if (currentUser) {
                User.findOne({_id: req.user})
                    .then(user => {
                       Stock.findOne( {symbol: ticker, owner: user} )
                       .then(stock => {
                           request = require('request');
                           request("https://api.iextrading.com/1.0/tops?symbols="+ticker, function(error, response, body) {
                            info = JSON.parse(body)
                            console.log(info)
                               valid_stock = JSON.parse(body).length
                        if (valid_stock){
                           moneyAfterPurchase = user.money - (info[0].lastSalePrice * quantity) // need to call to api to get quote
                           if (moneyAfterPurchase > 0){
                               if (stock){
                                   stock.quantity = parseInt(stock.quantity) + parseInt(quantity)
                                   stock.save();
                               } else {
                                  newStock = new Stock({symbol: ticker, quantity: quantity, owner:user, priceAtPurchase: info[0].lastSalePrice, priceAtStartOfDay: info[0].lastSalePrice, priceNow: info[0].lastSalePrice, color:"grey"});
                                  newStock.save();
                                  user.stocks.push(newStock);
                                      }
                               new_transaction = {symbol: ticker, priceAtPurchase: info[0].lastSalePrice, quantity: quantity}
                               user.transactions.push(new_transaction)
                               user.money = Number(parseInt(moneyAfterPurchase)).toFixed(2);
                               user.save();
                          }
                      }
                        });
                        });
                    });
                        res.redirect('/');
                    } else {
                    res.redirect('/register');
                }
            })
};
