var express = require('express');
var router = express.Router();
var Commodity = require('../models/commodity')
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
  Team.findById(req.session.teamid).populate('commodities').exec(function(err,team){
    if(err){
      console.log(err);
      res.send(err)
    }
    console.log(team);
    res.send(team)
  })
})
module.exports = router;
