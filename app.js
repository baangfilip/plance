var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
/* LOGIN MODULES */ 
var methodOverride = require('method-override');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');
/* END LOGIN MODULES */ 

var advLogger = require('./logger.js').logg("Startup");

// Database
/*
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/gostat", {native_parser:true});
*/

var routes = require('./routes/index');
var list = require('./routes/list');
var item = require('./routes/item');
var project = require('./routes/project');
var user = require('./routes/user');
var group = require('./routes/group');


var app = express();

var app = require('express')();
var server = require('http').createServer(app);
/* socket io */
var io = require('socket.io').listen(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


/* LOGIN USE */ 
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: 'secret-change-me', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());
// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});
/* END LOGIN USE */

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Enables CORS
var enableCORS = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
 
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
 
 
// enable CORS!
//app.use(enableCORS);
//--------------


app.use('/', routes);
app.use('/list', list);
app.use('/item', item);
app.use('/project', project);
app.use('/user', user);
app.use('/group', group);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
  require('logger').logg("Error: " + err.status + " " + err.message, req);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  require('logger').logg("Error: " + err.status + " " + err + " " + err.message, req);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
  require('logger').logg("Error: " + err.status + " " + err + " " + err.message, req);
});

module.exports = app;
