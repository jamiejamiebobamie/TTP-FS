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
                    console.log(transactions, user, user.transactions)
                    transactions = user.transactions;
                //    Stock.find().populate('quote')
                // {
                res.render('transactions', {currentUser, transactions});
            });
            // });
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
                // let newStockBool = true;
                // console.log(req.body.qty, req.body.ticker, req.body)
                if (currentUser) {
                User.findOne({_id: req.user})
                    .then(user => {
                        // for (let i = 0; i < user.stocks.length; i++) {
                        //     if (ticker == user.stocks[i].symbol) {
                        //         // stock.shares = parseInt(stock.shares) + parseInt(quantity)
                        //         user.stocks[i].quantity = parseInt(user.stocks[i].quantity) + parseInt(quantity);
                        //         newStockBool = false;
                        //         user.save()
                        //         break;
                        //     }
                        // }
                        // if (newStockBool){
                        // }
                        // console.log(user.ownedStockSymbols)
                        // user.ownedStockSymbols.push(ticker)
                        console.log(user)
                        // user.save()
                    // console.log(user.money)
                       Stock.findOne( {symbol: ticker, owner: user} )
                       .then(stock => {
                           request = require('request');
                           request("https://api.iextrading.com/1.0/tops?symbols="+ticker, function(error, response, body) {
                            info = JSON.parse(body)
                            console.log(info);
                               valid_stock = JSON.parse(body).length
                               console.log(valid_stock);
                        if (valid_stock){
                            console.log(true)

                           moneyAfterPurchase = user.money - (30 * quantity) // need to call to api to get quote
                           // console.log(moneyAfterPurchase)
                           if (moneyAfterPurchase > 0){
                               if (stock){
                                   stock.quantity = parseInt(stock.quantity) + parseInt(quantity)
                                   stock.save();
                               } else {
                                  newStock = new Stock({symbol: ticker, quantity: quantity, owner:user, priceAtPurchase: info[0].lastSalePrice, priceAtStartOfDay: info[0].lastSalePrice, priceNow: info[0].lastSalePrice, color:"grey"});
                                  newStock.save();
                                  console.log("newStock " + newStock+ " price at purchase " + newStock.priceAtPurchase)
                                  user.stocks.push(newStock);
                                      }
                               new_transaction = {symbol: ticker, priceAtPurchase: info[0].lastSalePrice, quantity: quantity}
                               user.transactions.push(new_transaction)
                               user.money = moneyAfterPurchase;
                               user.save();
                               console.log(user.transactions)
                          }
                      }
                        });
                        });
                    });
                        res.redirect('/');
                    // };
                    } else {
                    res.redirect('/register');
                }
            })
};
