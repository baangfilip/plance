var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var session = require('express-session');
var _ = require('underscore');

var userDAO = require('../dao/userDAO');
var groupDAO = require('../dao/groupDAO');
var projectDAO = require('../dao/projectDAO');
var encryption = require('../logic/encryption');
var mailer = require('../logic/mailer');
var resetpassword = require('../logic/resetpassword');
var rightsmanagement = require('../logic/rightsmanagement');
var langSV = require('../lang/sv');
var langEN = require('../lang/en');

function getLang(req){
  var lang = req.headers["accept-language"].match(/[a-zA-z\-]{2,10}/g) || [];
  if(lang[0].indexOf("sv") != -1){lang=langSV}else{lang=langEN}
  return lang;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var lang = getLang(req);
  res.render('index', { title: lang.Project, user: req.user, lang: lang });
});

router.get('/loginFailure', function(req, res) {
    res.status(401).json({message: 'Login Failed', success: false});
});

router.get('/loginSuccess', function(req, res) {
    res.status(200).json({message:'Login success', success: true, user: req.user});
});

router.get('/createaccount', function(req, res){
  var lang = getLang(req);
  res.render('createaccount', { title: lang.CreateAccount, lang: lang, user: req.user});
});

router.post('/resetpassword', function(req, res){
  var lang = getLang(req);
  userDAO.getUserByName(req.body.username, function(err, result){
    var user = result[0];
    if(user != null){
      var url = req.protocol + '://' + req.get('host');
      resetpassword.CreateResetPasswordLink(user.id, url, function(link){
        mailer.sendEmail("resetPassword", lang.ResetPassword.ResetPassword, user.email, user.username, link, lang, function(status){
          if(status == true)
            res.status(200).json({message: lang.ResetPassword.Success, success: true});
          else
            res.status(500).json({message: lang.ResetPassword.Failed, success: false, error: status});
        });
      });
    }else{
      res.status(403).json({message: lang.ResetPassword.FailedNoUserFound, success: false });
    }
  });
});

router.get('/resetpassword/:userid/:token', function(req, res){
  var lang = getLang(req);
  var token = req.param("token");
  var userid = req.param("userid");
  var url = req.protocol + '://' + req.get('host');
  resetpassword.isValidToken(token, userid, url, false, function(valid){
    if(valid != 1){
      res.render('error', { title: lang.ResetPassword.ResetPassword, lang: lang, message: lang.InvalidToken, success: false});
    }else{
      //token is valid, let the user reset his/her password
      res.render('resetpassword', {title: lang.ResetPassword.ResetPassword, lang: lang, token: token, userid: userid});
    }
  });
});

/* GET profile page. */
router.get('/profile', ensureAuthenticated, function(req, res, next) { //use to preload, no need for ajax then... which is best?
  var lang = getLang(req);
  res.render('profile', { title: lang.UserProfile, lang: lang, user: req.user});
});

//displays our signup page
router.get('/signin', function(req, res, next){
  res.render('signin', {title: 'Signin', user: req.user });
});

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
router.post('/login', passport.authenticate('local-signin', { 
  successRedirect: '/loginSuccess',
  failureRedirect: '/loginFailure'
  })
);

router.post('/createaccount', passport.authenticate('local-signup', { 
  successRedirect: '/loginSuccess',
  failureRedirect: '/loginFailure'
  })
);

/* GET page pages. */
router.get('/p/:projectid', function(req, res, next) {
  //preload project to find out if loginrequired (public attr) if login isnt required let guest se but dont touch..
  projectDAO.getProjectByID(req.param("projectid"), function(err, projects){
    project = projects[0];
    var rights = rightsmanagement.projectrightsmanager(project, req);
    if(rights.allowedToOpen){
      res.render('project', {title: project.name, readonly: rights.readonly, user: req.user, project: project, lang: getLang(req)});
    }else{
      res.render('index', {title: 'Signin first', user: req.user, lang: getLang(req)});
    }
  })
});

//logs user out of site, deleting them from the session, and returns to homepage
router.get('/logout', function(req, res){
  req.logout();
  var lang = getLang(req);
  res.redirect(req.get('referer'));
});


//===============PASSPORT=================
// Use the LocalStrategy within Passport to login/”signin” users.
//If no information provided it doesnt continue..... lol
passport.use('local-signin', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
  	console.log("local-signin i started");
    var user;
    userDAO.getUserByName(username, function (err, items) {
  	  user = items[0];
  	  if(user != null){
  		  console.log("FOUND USER");
        if (encryption.isValid(user.password, user.salt, password)) {
          console.log("Password match!=)");
          user.salt = "";
          user.password = "";
  				req.session.success = 'You are successfully logged in ' + user.username + '!';
          		done(null, user);
  			}else{
  				console.log("Passwords did not match: " + username);
  				req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
          		done(null, null);
  			}
  		}else{
  			console.log("User wasnt found, lol: " + username);
  			req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
          	done(null, user);
  		}
  	});
  }
));
// Use the LocalStrategy within Passport to register/"signup" users.
passport.use('local-signup', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    var user = null;
    var salt = encryption.createSalt();
    var encryptedPassword = encryption.hashPassword(req.body.password, salt);
    var data = {
      "username" : req.body.username,
      "password" : encryptedPassword,
      "email"    : req.body.email,
      "salt"     : salt
    };
    userDAO.addUser(data, function(err, result){
      groupDAO.connectUserToGroup(result.insertId, 1, 0, function(error, groupresult){
        userDAO.getUserByID(result.insertId, function(error, users){
          user = users[0];
          if (user) {
            console.log("REGISTERED: " + user.username);
            req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
            done(null, user);
          }
          if (!user) {
            console.log("COULD NOT REGISTER");
            req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
            done(null, null);
          }
        });
      });
    });
  }
));
// index.js/
//===============PASSPORT=================
// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) { return next(); }
  req.session.error = 'Please sign in!';
  res.redirect('/');
}
module.exports = router;
