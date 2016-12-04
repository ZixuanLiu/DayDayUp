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

var multer = require("multer");
var upload = multer({dest: 'public/DayDayUp_files'});
var fs = require('fs');
var multipart = require('connect-multiparty');

var multipartMiddleware = multipart();


mongoose.connect('mongodb://kathy789:FANNAO456!@ds111178.mlab.com:11178/daydayup');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser({uploadDir:'/path/to/temporary/directory/to/store/uploaded/files'}));

var port = process.env.VCAP_APP_PORT || 8070;
var router = express.Router();

app.use(session({ secret: 'DayDayUp' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

app.set('view engine', 'ejs');

require('./lib/password.js')(passport);


router.use(function(req,res,next){
  console.log("Test.");
  next();
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the login page
    res.redirect('/login');
}

//Pages used now are just for Test

router.route('/') //main page
  .get(function(req, res) {
      res.redirect('/home');  
  });

var path = require('path');
router.route('/login') //login page
  .get(function(req, res) {

      // render the page and pass in any flash data if it exists
      res.render('../public/login.ejs', { message: req.flash('loginMessage') });
   
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
        Schedule.find({creator: req.user._id})
        .exec((error, schedule) => {
            if (error) {
                console.log(error);
                res.end('error');
            }
            res.render('../public/schedule.ejs', {
             user : req.user,
             schedules: schedule
          }); 
        });
  })
  .post(function(req, res) {
      var newSchedule = new Schedule();
      newSchedule.creator = req.user._id; 
      newSchedule.title = req.body.title;
      newSchedule.descrip = req.body.descrip;
      // set lastupdate for schedule
      newSchedule.lastUpdate = new Date();
      newSchedule.createdBy = newSchedule.lastupdate;
      newSchedule.score = 0;

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


        Schedule.findOne({'_id': req.params.id})
        .populate({path: 'posts',
            populate:{
              path: 'comments',
              model: 'comment'
            }
          })
        .exec((err, schedule) => {
            if (err) {
                res.end('error');
            }
             // remove all the post of this schedule
            for (var i = 0 ; i < schedule.posts.length; i++) {
                for(var j = 0; j < schedule.posts[i].comments.length; i++){
                    schedule.posts[i].comments[j].remove(function(err) {
                      if (err)
                        res.end('error');
                    });
                }
                schedule.posts[i].remove(function(err) {
                    if (err)
                        res.end('error');
                });
            }
           
            schedule.remove(function(err) {
               if (err) {
                res.end('error');
            }  
            }); 
            res.redirect('/schedule');  
        })

    });


var Post = require("./lib/post");
// routes for post page
router.route('/schedule/:id')
  .get(isLoggedIn,function(req, res) {
        Schedule.findOne({ '_id': req.params.id })
        .populate({path: 'posts',
            populate:{
              path: 'comments',
              model: 'comment',
              populate:{
                path: 'creator'
              }
            }
          })
        .exec((error, schedule) => {
            if (error) {
                console.log(error);
                res.end('error');
            }
          
          res.render('../public/detail.ejs', {
              user : req.user,
              schedules: schedule
           }); 
        });
  })
  .post( multipartMiddleware, function(req, res) {
      Schedule.findOne({ '_id': req.params.id })
        .exec((error, schedule) => {
            if (error) {
                console.log(error);
                res.end('error');
            }
          var isUpload = false;
          var tempPath = req.files.image.path,
              targetPath = path.resolve('./public/images/' + req.files.image.name);
          if (path.extname(req.files.image.name).toLowerCase() === '.jpg') {
              fs.rename(tempPath, targetPath, function(err) {
                  if (err) throw err;
                  console.log("Upload completed!");
              });
              isUpload = true;
          } else {
              fs.unlink(tempPath, function (err) {
                  if (err) throw err;
                  console.error("Only .jpg files are allowed!");
              });
          };

           var newPost = new Post();
            newPost.content = req.body.content; 
            if(isUpload == true){
              newPost.imagePath = '../images/' + req.files.image.name;
              console.log(newPost.imagePath);
            }
            else{
              newPost.imagePath = "empty";
            }
            newPost.save(function(err) {
                if (err) 
                  console.log("failed to save post" + err);
            });

            // calculte the time difference
            
            var diff = new DateDiff(new Date(), schedule.lastUpdate);
            var diffminutes = diff.minutes();  // set up minutes for testing, later we will change for hours.
            /*
            // method2 : moment.js also works , but not simple as DateDiff above.
            var startTime = moment(schedule.lastUpdate).format("YYYY-M-DD HH:mm:ss");
            console.log("startTime : " + startTime);
            var endTime = moment(new Date()).format("YYYY-M-DD HH:mm:ss");
            console.log("endTime: " + endTime);
            var diffminutes = moment(endTime).diff(startTime, 'minutes');
            console.log("diffminutes: " + diffminutes);
            */
            if (diffminutes < 3) {  // modify 3 minutes to 24 hours later.

                schedule.score ++;
            }
            else {
                // may be send message to user: your score has been reset to zero.

                schedule.score = 0;
            }
            // update lastUpdate time for the current schedule
            schedule.lastUpdate = new Date();
            //console.log("score: " + schedule.score);
            
            schedule.posts.push(newPost);
            schedule.save(function(err) {
                if (err) 
                console.log("fail to push schedule" + err);
            }); 
            res.redirect('/schedule/' + req.params.id);
        });
  }); 
/*
router.route("/uploads/fullsize/:file") 
.get(function(req, res) {

  file = req.params.file;
  var img = fs.readFileSync(__dirname + "/public/images/" + file);
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
  res.send("<html> <img src=\"" + img + "\"></html>");

});

*/

// set up routes for home page
var User = require("./lib/user");
router.route('/home')
  .get(function(req, res) {

    // list all the schedules with the first 2 maximum score.
    Schedule.find({})
    .sort({score: -1})
    .limit(5)
    .populate('creator')
    .exec((err, schedule) => {
        if(err) {
            res.end('error');
        }
  
        var logIn = false;
        if (req.isAuthenticated()){
          logIn = true;
          res.render("../public/index.ejs", {
            schedules: schedule,
            logIn: logIn,
            user : req.user
         });
        }
        else{
          res.render("../public/index.ejs", {
            schedules: schedule,
            logIn: logIn

         });
        }
    });
});


router.route('/home/:id')
    .get(function(req, res) {
        Schedule.findOne({ '_id': req.params.id })
        .populate({path: 'posts',
            populate:{
              path: 'comments',
              model: 'comment',
              populate:{
                path: 'creator'
              }
            }
          })
        .populate('creator')
        //.populate('posts.comments')
        .exec((error, schedule) => {
            if (error) {
                console.log(error);
                res.end('error');
            }
            var logIn = false;
            if (req.isAuthenticated()){
              logIn = true;
              res.render("../public/viewDetail.ejs", {
                schedules: schedule,
                logIn: logIn,
                user : req.user
             });
            }
            else{
              res.render("../public/viewDetail.ejs", {
                schedules: schedule,
                logIn: logIn
             });
            }
          });
      });
var Comment = require("./lib/comment");
router.route('/comment/:sid/:pid')
.post(function(req, res) {
      Post.findOne({ '_id': req.params.pid })
        .exec((error, post) => {
            if (error) {
                console.log(error);
                res.end('error');
            }
            var newComment = new Comment();
            newComment.content = req.body.content; 
            newComment.creator = req.user._id;
            newComment.save(function(err) {
                if (err) 
                  console.log("failed to save comment" + err);
            });

            post.comments.push(newComment);
            post.save(function(err) {
                if (err) 
                console.log("fail to push post" + err);
            }); 
            if(req.body.isSame.toString() === "true"){
              res.redirect('/schedule/' + req.params.sid);
            }
            else{
              res.redirect('/home/' + req.params.sid);
            }
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






