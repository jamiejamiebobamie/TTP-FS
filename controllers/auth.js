const jwt = require('jsonwebtoken');
const User = require("../models/user");
const Stock = require("../models/stock");

module.exports = app => {

    // INDEX :: SIGNED-IN, PORTFOLIO PAGE
    app.get('/', (req,res) => {
        var portfolioWorth;
        var currentUser = req.user;
        let money;
        // let testStock;
        // let user = currentUser;
        // let stock;
        // console.log(currentUser)
        if (currentUser) {
            User.findOne({_id: currentUser})
                .then(user => {
                    // testStock = new Stock({symbol: 'AAPL', quote:1.00, shares: 30, priceAtPurchase:1.00, owner:user});
                    // testStock.save();
                    // user.stocks.push(testStock);
                    // user.save();
                    portfolioWorth = user.portfolioWorth;
                    money = user.money;
                    // for (let i = 0; i < user.stocks.length; i++){
                        // console.log(1,user, currentUser, stock)
                        Stock.findOne({owner: currentUser}).populate('quote')

                        // symbol: { type: String, required: true, unique: true },
                        // quote: { type: Number, required: false },
                        // news: { type: String, required: false},
                        // shares : { type: Number, required: false},
                        // priceAtPurchase : { type: Number, required: false}

                        .then(stock => {
                            console.log(2, user, stock)
                        //     stocks.push(stock)
                        // })
                    // })
                    // console.log("here's your stock " + user.stocks[0])
                    // Stock.find()//.populate('quote')
                   // console.log("it did not work " + stocks)
             res.render('portfolio', {currentUser, portfolioWorth, stock, money});
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
            res.render('register', currentUser);
        }
    });

    // const StockSchema = new Schema({
    //   symbol: { type: String, required: true, unique: true },
    //   quote: { type: Number, required: false },
    //   news: { type: String, required: false},
    //   shares : { type: Number, required: false},
    //   priceAtPurchase : { type: Number, required: false}
    // });

    // RESGISTER POST ROUTE
    app.post("/register", (req, res) => {
      // Create User and JWT
      const user = new User(req.body);
      user.money = 5000;
      user.portfolioWorth = 0;
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

};
