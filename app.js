var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var mongoose = require('mongoose')

var routes = require('./routes/index');
var teams = require('./routes/teams');
var proposal = require('./routes/proposal');
var sets = require('./routes/sets')
var app = express();
var Team = require('./models/team')
var commodity_list = require('./models/commodity')['list']
var jsonfile = require('jsonfile')
var timer = jsonfile.readFileSync('./timer/timer.json');
mongoose.connect('mongodb://localhost/trade_sim');
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
    console.log("connection established to db");
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my_trade_sim',
  resave: false,
  saveUninitialized: true
}))



app.use('/team', teams);
app.use('/proposal',proposal);
app.use('/sets',sets)
app.use('/', routes);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
});

Team.findById('government',function(err,team){
  if(err){
    console.log(err);
  }else{
    if(!team){
      var gov = new Team({
        _id : 'government',
        password : 'admin',
        commodities : {}
      });
      for(var i=0;i<commodity_list.length;i++){
        gov.commodities[commodity_list[i]] = 500
      }
      gov.commodities['cash'] = 10000000
      gov.save(function(err,team){
        if(err){
          console.log(err);
        }
        console.log("Government account created");
      })
    }else{
      console.log("Government already Created");
    }
  }
})
module.exports = app;
