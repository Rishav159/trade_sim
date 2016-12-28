var express = require('express');
var router = express.Router();
var commodity_list = require('../models/commodity').list
var Team = require('../models/team')
/* GET home page. */
var auth  = function(req,res,next){
  console.log(req.session.teamid);
  if(req.session && req.session.teamid){
    next()
  }else{
    res.redirect('/team/login')
  }
}
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/dashboard',auth,function(req,res,next){
  console.log("Dashboard Get request ");
  Team.findById(req.session.teamid,function(err,team){
    if(err){
      console.log(err);
      res.send(err)
    }
    console.log(team);
    res.send(team)
  })
})
router.get('/leaderboards',function(req,res,next){
  Team.find().sort([['sets',-1],['net_worth', -1]]).exec(function(err,teams){
    if(err){
      console.log(err);
      res.send(err)
    }else{
      res.send(teams)
    }
  });
})
module.exports = router;
