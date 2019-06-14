const dotenv = require('dotenv').config();

var cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const express = require('express');
const app = express();

app.use(cookieParser()); // Add this after you initialize express.

const exphbs = require('express-handlebars');

const mongoose = require('mongoose');

// Set db
const db = require('./data/database');

//middleware for JSON data
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

//middleware for putting something when you post it
const methodOverride = require('method-override');

// Use Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var checkAuth = (req, res, next) => {
  console.log("Checking authentication");
  if (typeof req.cookies.nToken === "undefined" || req.cookies.nToken === null) {
    req.user = null;
  } else {
    var token = req.cookies.nToken;
    var decodedToken = jwt.decode(token, { complete: true }) || {};
    req.user = decodedToken.payload;
  }

  next();
};
app.use(checkAuth);

const User = require('./models/user.js');
const auth = require('./controllers/auth.js')(app);

const port = process.env.PORT || 13000;

// passport.use(new PinterestStrategy({
//         clientID: process.env.PINTEREST_APP_ID,
//         clientSecret: process.env.PINTEREST_APP_SECRET,
//         scope: ['read_public', 'read_relationships'],
//         callbackURL: "https://localhost:13000/auth/pinterest/callback",
//         state: true
//     },
//     function(process.env.A_TOKEN, refreshToken, process.env.PINTEREST_USERNAME, done) {
//         User.findOrCreate({ pinterestId: profile.id }, function (err, user) {
//             return done(err, user);
//         });
//     }
// ));


// INDEX
    app.get('/', (req, res) => {
        PDK.init({
            appId: process.env.PINTEREST_APP_ID, // Change this
            cookie: true
        });
        console.log(PDK)
        var currentUser = req.user;
        process.env.A_TOKEN
        res.render('main', {currentUser});
        })


// Add after body parser initialization!
app.use(expressValidator());

//must come below const app, but before routes
app.use(bodyParser.urlencoded({ extended: true }));

// override with POST having ?_method=DELETE or ?_method=PUT
app.use(methodOverride('_method'))

app.use(express.static('public'));

// //heroku database.
mongoose.connect((process.env.MONGODB_URI || 'mongodb://localhost/pinterest'), { useNewUrlParser: true });

// local host database
// mongoose.connect('mongodb://localhost/pinterest');

//views middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.listen(port);

module.exports = app;
