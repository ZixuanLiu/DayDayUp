/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public/'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

//mongoose.connect('mongodb://cabc22da-166e-438e-af1d-9398a362f2aa:32c2777b-d8d1-4ab7-9efc-e71df60a69af@192.155.243.9:10126/db');
//mongoose.connect('mongodb://tester:abc123@ds021166.mlab.com:21166/playground');
mongoose.connect('mongodb://kathy789:FANNAO456!@ds111178.mlab.com:11178/daydayup');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

var port = process.env.PORT || 8070;
var router = express.Router();

app.use(session({ secret: 'DayDayUp' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

// app.set('view engine', 'ejs');
// app.use(express.static('app/images'));

// require('./app/scripts/app.js')(app, passport); // google login
 require('./lib/password.js')(passport); //authentication api


router.use(function(req,res,next){
  console.log("Test.");
  next();
});

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

//Pages used now are just for Test

router.route('/') //main page
  .get(function(req, res) {
      res.render('../public/index.ejs');//redirect to the main page
  });
var path = require('path');
router.route('/login') //login page
  .get(function(req, res) {

      // render the page and pass in any flash data if it exists
      res.render('../public/login.ejs', { message: req.flash('loginMessage') });
      //res.render(path.join(__dirname +  '/public/login.html'), { message: req.flash('loginMessage') });
      //res.sendFile(path.join(__dirname +  '/public/login.html'), { message: req.flash('loginMessage') } );
      //res.sendFile(path.join(__dirname +  '/public/login.html'), { message: 'I am here'} );
    })


  .post(passport.authenticate('local-login', {
          successRedirect : '/index', // redirect to the secure profile section
          failureRedirect : '/login', // redirect back to the signup page if there is an error
          failureFlash : true // allow flash messages
        })
  );

router.route('/signup') //signup page
  .get(function(req, res) {

      // render the page and pass in any flash data if it exists
      res.render('../public/signup.ejs', { message: req.flash('signupMessage') });
            console.log(req.flash);
  })

  .post(passport.authenticate('local-signup', {
      successRedirect : '/index', // redirect to the secure profile section
      failureRedirect : '/signup', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
      })
    );

router.route('/index') //profile page
  .get(isLoggedIn, function(req, res) {
      res.render('../public/index.ejs', {
          user : req.user // get the user out of session and pass to template
      });
  });

// router.route('/logout') //logout page
//   .get(function(req, res) {
//       req.logout();
//       res.redirect('/');
//   });


app.use('/', router);
//app.use('/login', router);

// var server = app.listen(port, function () {
//   console.log('Listening at port ' + port);
// });






// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
