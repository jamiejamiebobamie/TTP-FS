const jwt = require('jsonwebtoken');
const User = require("../models/user");
const Stock = require("../models/stock");

const iex = require('iex-api');
const _fetch = require('isomorphic-fetch')

var mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});
// const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});

module.exports = app => {

    // INDEX :: SIGNED-IN, PORTFOLIO PAGE
    app.get('/', (req,res) => {
        console.log(currentUser)
        const client = new iex.IEXClient(_fetch)
        // console.log(client)
        client.stockKeyStats('AAPL')
        .then(company => console.log("hey" + company))

        var portfolioWorth;
        var currentUser = req.user;
        let money;
        let stocks;
        let stockKeys;
        let activated = true;
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
                    // portfolioWorth = user.portfolioWorth;
                    // activated = user.activated;
                    // console.log(":(" + user)
                    // console.log(":)" + activated)

                    money = user.money;
                    // stocks = user.stocks
                    // console.log(stocks_i)
                    // for (let i = 0; i < stocks_i; i++){
                    //     console.log(user.stocks)
                    //     console.log(user.stocks[stockKeys[i]])
                    // }
                    // for (let i = 0; i < user.stocks.length; i++){
                        // console.log(1,user, currentUser, stock)
                        Stock.findOneAndUpdate({owner: currentUser})

                        // symbol: { type: String, required: true, unique: true },
                        // quote: { type: Number, required: false },
                        // news: { type: String, required: false},
                        // shares : { type: Number, required: false},
                        // priceAtPurchase : { type: Number, required: false}

                        .then(stock => {
                            // console.log(stock)
                            if (stock) {
                                portfolioWorth = parseInt(stock.quantity) * parseInt(stock.priceNow)
                                if (parseInt(stock.priceNow) < parseInt(stock.priceAtStartOfDay) ) {
                                    stock.color = "red";
                                } else if (parseInt(stock.priceNow) > parseInt(stock.priceAtStartOfDay) ) {
                                    stock.color = "green";
                                } else {
                                    stock.color = "grey";
                                }
                                stock.value =  parseInt(stock.quantity) * parseInt(stock.priceNow)
                                // stock.save();

                                // symbol: { type: String, required: false, unique: false },
                                // priceAtPurchase: { type: Number, required: false, unique: false },
                                // news: { type: String, required: false, unique: false },
                                // quantity : { type: Number, required: false, unique: false },
                                // action: { type: String, required: false, unique: false },
                                // owner: { type: Schema.Types.ObjectId, ref: "User", unique: false, sparse: true },
                                // color: {type: String, required: false, unique: false },
                                // priceAtStartOfDay: { type: Number, required: false, unique: false },
                                // priceNow: {type: Number, required: false, unique: false },
                                // value: {type: Number, required: false, unique: false }

                                // console.log("here's your stock " + stock.color, stock.symbol, stock.quantity)
                            }
                            // Stock.find({owner: currentUser})

                            // symbol: { type: String, required: true, unique: true },
                            // quote: { type: Number, required: false },
                            // news: { type: String, required: false},
                            // shares : { type: Number, required: false},
                            // priceAtPurchase : { type: Number, required: false}

                            // .then(stock => {

                        //     for (let i = 0; i < user.stocks.length; i++){
                        //     console.log(2, user, stock)
                        //     stocks.push(stock)
                        // })
                    // })
                    // console.log("here's your stock " + user.stocks[0])
                    // Stock.find()//.populate('quote')
                   // console.log("it did not work " + stocks)
             res.render('portfolio', {currentUser, portfolioWorth, money, stock, activated});
            // });
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
      user.activated = true;
      console.log(user)

      email = req.body.email
      // console.log(email)
      const data = {
	         from: email,
	         to: email,
	         subject: 'Hello',
	         text: 'Testing some Mailgun awesomness!'
         };
         console.log(data)
    mailgun.messages().send(data, function (error, body) {
	          console.log(body);
              console.log("hi")
          });
          console.log("hey")
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
         console.log(currentUser)
         let activated;
         Users.findOneAndUpdate( { _id: currentUser } )
         .then(user => {
             user.activated = true
             user.save()
             activated = true
             res.render('/', currentUser, activated);
         });
     });
};
