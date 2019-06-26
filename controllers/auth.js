const jwt = require('jsonwebtoken');
const User = require("../models/user");
const Stock = require("../models/stock");

const iex = require('iex-api');
const _fetch = require('isomorphic-fetch')

var mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});

module.exports = app => {

    // INDEX :: SIGNED-IN, PORTFOLIO PAGE
    app.get('/', (req,res) => {
        request = require('request');
        var currentUser = req.user;

        let money;
        let stocks;
        let stockKeys;
        let activated = false;
        let current_info;
        let portfolioWorth = 0;
        let currentSum = 0;
        let currentWorth = 0;
        if (currentUser) {
            User.findOne({_id: currentUser})
                .then(user => {
                    activated = user.activated;
                    money = user.money;
                    currentWorth = user.portfolioWorth;
                        Stock.find({owner: currentUser})
                        .then(stocks => {
                            if (stocks != undefined || stocks.length != 0) {
                                let search_stocks = ""
                                for (let i = 0; i < stocks.length; i++){
                                    search_stocks += stocks[i].symbol + ","
                                }
                                console.log(search_stocks, stocks.length)
                                request("https://api.iextrading.com/1.0/tops?symbols="+search_stocks, function(error, response, body) {
                                    current_info = JSON.parse(body);
                                    console.log(current_info, current_info.length, search_stocks, stocks.length)
                                if (current_info.length > 0){
                                for (let i = 0; i < current_info.length; i++){
                                    stocks[i].priceNow = current_info[i].lastSalePrice
                                    stocks[i].value = stocks[i].quantity * stocks[i].priceNow
                                    stocks[i].value = Number((stocks[i].value).toFixed(2));
                                if (parseInt(stocks[i].priceNow) < parseInt(stocks[i].priceAtPurchase) ) {
                                    stocks[i].color = "red";
                                } else if (parseInt(stocks[i].priceNow) > parseInt(stocks[i].priceAtPurchase) ) {
                                    stocks[i].color = "green";
                                } else {
                                    stocks[i].color = "grey";
                                }
                                stocks[i].save()
                                currentSum += parseInt(stocks[i].value)
                                console.log('hi'+currentSum)
                            }
                            console.log('hello'+currentSum)
                            user.portfolioWorth = Number(parseInt(currentSum)).toFixed(2);
                            user.save()
                        } else {
                            portfolioWorth = 0;
                            for (let i = 0; i < stocks.length; i++){
                            portfolioWorth += parseInt(stocks[i].quantity) * parseInt(stocks[i].priceNow)
                        }
                        console.log("helloleje"+portfolioWorth)
                        user.portfolioWorth = Number(parseInt(portfolioWorth)).toFixed(2);
                        user.save()
                        }

            })}
             res.render('portfolio', {currentUser, currentWorth, money, stocks, activated});
            });
            });
        } else {
            res.render('sign-in', currentUser);
        }
     });

    // SIGN-IN GET ROUTE, LOGIN PAGE
     app.get('/sign-in', (req, res) => {
       res.render('sign-in');
     });

     // SIGN-IN POST ROUTE, LOG-OUT
     app.post("/sign-in", (req, res) => {
       const username = req.body.username;
       const password = req.body.password;
       // Find this user name
       User.findOne({ username }, "username password")
         .then(user => {
           if (!user) {
             // User not found
             return res.status(401).send({ message: "Wrong Username or Password" });
           }
           // Check the password
           user.comparePassword(password, (err, isMatch) => {
             if (!isMatch) {
               // Password does not match
               return res.status(401).send({ message: "Wrong Username or password" });
             }
             // Create a token
             const token = jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET, {
               expiresIn: "60 days"
             });
             // Set a cookie and redirect to root
             res.cookie("nToken", token, { maxAge: 900000, httpOnly: true });
             res.redirect("/");
           });
         })
         .catch(err => {
           console.log(err);
         });
     });

     // SIGN-OUT GET ROUTE
     app.get('/sign-out', (req, res) => {
       res.clearCookie('nToken');
       res.redirect('/sign-in');
     });

    // RESGISTER GET ROUTE
    app.get('/register', (req, res) => {
        var currentUser = req.user;
        if (currentUser) {
            res.redirect('/');
        } else {
            res.render('register');
        }
    });

    // RESGISTER POST ROUTE
    app.post("/register", (req, res) => {
      // Create User and JWT
      const user = new User(req.body);
      const link = 'http://localhost:13000/'+user._id+"/activate"
      // const link = "herokuapp.com/"
      user.money = 5000;
      user.portfolioWorth = 0;
      user.activated = false;
      email = req.body.email

      const data = {
	         from: email,
	         to: email,
	         subject: 'Validating your account!',
	         text: 'Click this link to validate your account with the stock app! \n' + link
         };

    mailgun.messages().send(data, function (error, body) {
	          console.log(body);
              console.log("hi")
          });
          user.save().then((user) => {
              var token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "60 days" });
              res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
              res.redirect('/');
              })
            .catch(err => {
              console.log(err.message);
              return res.status(400).send({ err: err });
            });
    });

    //ACTIVATE ACCOUNT ROUTE
     app.get('/:id/activate', (req, res) => {
         const currentUser = req.user
         let activated;
         User.findOneAndUpdate( { _id: currentUser } )
         .then(user => {
             user.activated = true
             user.save()
             activated = true
             res.redirect('/', currentUser, activated);
         });
     });
};
