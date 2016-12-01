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
var timediff  = require("timediff");
var DateDiff = require("date-diff");
var moment = require("moment");
//mongoose.connect('mongodb://cabc22da-166e-438e-af1d-9398a362f2aa:32c2777b-d8d1-4ab7-9efc-e71df60a69af@192.155.243.9:10126/db');
//mongoose.connect('mongodb://tester:abc123@ds021166.mlab.com:21166/playground');
mongoose.connect('mongodb://kathy789:FANNAO456!@ds111178.mlab.com:11178/daydayup');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

var port = process.env.VCAP_APP_PORT || 8070;
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


//schedule section : include add schedule and remove schedule.
// add schedule
var Schedule = require("./lib/schedule");
router.route('/schedule') //profile page
  .get(isLoggedIn, function(req, res) {
        Schedule.find({creator: req.user._id}, (err, schedule) => {
          if(err){
            console.log(err);
            res.end('error');
          }
          res.render('../public/schedule.ejs', {
             user : req.user,
             schedules: schedule
          }); 
        });
  })
  .post(function(req, res) {
      console.log(req.user.local.email);
      var newSchedule = new Schedule();
      newSchedule.creator = req.user._id; 
      console.log("user id:" + req.user._id);
      newSchedule.title = req.body.title;
      newSchedule.descrip = req.body.descrip;
      console.log( "title : "+ req.body.title);
      // set lastupdate for schedule
      newSchedule.lastUpdate = new Date();
      newSchedule.score = 0;

      console.log("lastUpdate: " + newSchedule.lastUpdate);
      newSchedule.save(function(err) {
          if (err) 
            console.log(err);
      });

      req.user.local.schedules.push(newSchedule);
      req.user.save(function(err) {
          if (err) 
          console.log(err);
      }); 
      res.redirect('/schedule');
  }); 

// remove schedule 
router.route('/schedule/remove/:id')
    .post(function(req, res) {
        // remove all the post of this schedule
        //console.log("remove schedule id: " + req.params.id);
       Schedule.update({"_id": req.params.id},{ $set: { posts : [] } }, function(error){
             if (error) {
                console.log(error);
                res.end('error');
            }
         });
     
        // remove this schedule for users' schedule list
        Schedule.findOne({'_id': req.params.id}, function(err, schedule) {
            if (err) {
                res.end('error');
            }
            //console.log(schedule);
            schedule.remove(function(err) {
               if (err) {
                res.end('error');
            }  
            }) 
            res.redirect('/schedule');  
        })

    });



//router.route('/schedule/:title')
var Post = require("./lib/post");
// routes for post page
router.route('/schedule/:id')
  .get(function(req, res) {
         Schedule.findOne({ '_id': req.params.id })
         .populate('posts')
         .populate('creator')
        .exec((error, schedule) => {
            if (error) {
                console.log(error);
                res.end('error');
            }
            console.log(schedule);
            console.log('user is' + schedule.creator.local.email);
           res.render('../public/detail.ejs', {
              user : req.user,
              schedules: schedule
           }); 
        });
  })
  .post(function(req, res) {
      Schedule.findOne({ '_id': req.params.id })
        .exec((error, schedule) => {
            if (error) {
                console.log(error);
                res.end('error');
            }
            //console.log("schedule is: " + schedule);
            var newPost = new Post();
            newPost.content = req.body.content; 
            //newPost.date = Date.now;
            console.log( "Post : "+ newPost);

            newPost.save(function(err) {
                if (err) 
                  console.log("failed to save post" + err);
            });

            // calculte the time difference
            
            var diff = new DateDiff(new Date(), schedule.lastUpdate);
            var diffminutes = diff.minutes();  // set up minutes for testing, later we will change for hours.
            
            console.log("diff minutes: " + diffminutes);
            /*
            // method2 : moment.js also works , but not simple as DateDiff above.
            var startTime = moment(schedule.lastUpdate).format("YYYY-M-DD HH:mm:ss");
            console.log("startTime : " + startTime);
            var endTime = moment(new Date()).format("YYYY-M-DD HH:mm:ss");
            console.log("endTime: " + endTime);
            var diffminutes = moment(endTime).diff(startTime, 'minutes');
            console.log("diffminutes: " + diffminutes);
            */
            if (diffminutes < 3) {

                schedule.score ++;
            }
            else {
                // may be send message to user: your score has been reset to zero.

                schedule.score = 0;
            }
            // update lastUpdate time for the current schedule
            schedule.lastUpdate = new Date();
            console.log("score: " + schedule.score);
            
            schedule.posts.push(newPost);
            schedule.save(function(err) {
                if (err) 
                console.log("fail to push schedule" + err);
            }); 
            res.redirect('/schedule/' + req.params.id);
        });
  }); 





router.route('/logout') //logout page
  .get(function(req, res) {
      req.logOut();
      res.redirect('/login');
  });



app.use('/', router);






// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});






