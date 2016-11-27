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
    res.redirect('/login');
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
          successRedirect : '/schedule', // redirect to the secure profile section
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
      successRedirect : '/schedule', // redirect to the secure profile section
      failureRedirect : '/signup', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
      })
    );




var Schedule = require("./lib/schedule");
router.route('/schedule$') //profile page
  .get(isLoggedIn, function(req, res) {
        Schedule.find({creator: req.user._id}, (err, schedule) => {
          if(err){
            console.log(err);
            res.end('error');
          }
          console.log("enter find");
          console.log(schedule);
          res.render('../public/schedule.ejs', {
             user : req.user,
             schedules: schedule
          }); 
        });
      // res.render('../public/schedule.ejs', {
      //     user : req.user ,
      //     schedules: []// get the user out of session and pass to template
      // });
  })
  .post(function(req, res) {
      console.log(req.user.local.email);
      var newSchedule = new Schedule();
      newSchedule.creator = req.user._id; 
      console.log("user id:" + req.user._id);
      newSchedule.title = req.body.title;
      newSchedule.descrip = req.body.descrip;
      console.log( "title : "+ req.body.title);

      newSchedule.save(function(err) {
          if (err) 
            console.log(err);
      });

      req.user.local.schedules.push(newSchedule);
      req.user.save(function(err) {
          if (err) 
          console.log(err);
      });
      // Schedule.find({creator: newSchedule.creator}, (err, schedule) => {
      //   if(err){
      //     console.log(err);
      //     res.end('error');
      //   }
      //   console.log("enter find");
      //   console.log(schedule);
      //   res.render('../public/schedule.ejs', {
      //      user : req.user,
      //      schedules: schedule
      //   }); 
      res.redirect('/schedule');
      // });
     // console.log(myschedules);
      // res.render('../public/schedule.ejs', {
      //      user : req.user,
      //      schedules: myschedules
      // });    
  }); 
//

router.route('/schedule/:title')
  .get(function(req, res) {
      console.log(req.params.title);
      res.send(req.params.title);
  });

router.route('/logout') //logout page
  .get(function(req, res) {
      req.logOut();
      res.redirect('/login');
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

/*
// after user log in, go to user's homepage
router.route('/schedule')
   .get(function(req, res)) {
      // check the r
   }

*/






// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});






