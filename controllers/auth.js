const jwt = require('jsonwebtoken');
const User = require("../models/user");

module.exports = app => {

    // INDEX :: SIGNED-IN, PORTFOLIO PAGE
    app.get('/', (req,res) => {
        var currentUser = req.user;
        User.findOne({username: req.user})
            .then(user => {
               Stock.find().populate('quote')
            {
            res.render('portfolio', {user: currentUser});
                });
            });
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

    // RESGISTER POST ROUTE
    app.post("/register", (req, res) => {
      // Create User and JWT
      const user = new User(req.body);
      console.log(req.body)

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

});
