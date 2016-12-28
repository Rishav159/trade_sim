var express = require('express');
var router = express.Router();
var commodity_list = require('../models/commoditylist')
var Team = require('../models/team')
var sets = require('../models/sets')
/* GET home page. */
var auth  = function(req,res,next){
  console.log(req.session.teamid);
  if(req.session && req.session.teamid){
    next()
  }else{
    res.redirect('/team/login')
  }
}
var validate = function(hasobj,reqobj){
  for(var i=0;i<commodity_list.length;i++){
    key = commodity_list[i]
    if(reqobj[key] > hasobj[key]){
      return false
    }
  }
  return true
}

router.get('/', function(req, res, next) {
  res.send(sets)
});

router.get('/:id/submit',auth,function(req,res,next){
  Team.findById(req.session.teamid,function(err,team){
    if(err){
      console.log(err);
      res.send(err)
    }else{
      has_comm = team.commodities
      submit_comm = sets[req.params.id - 1]
      if(!validate(has_comm,submit_comm)){
        res.send("You do not have that much to submit")
      }else{
        for(var i=0;i<commodity_list.length;i++){
          comm = commodity_list[i]
          has_comm[comm] = has_comm[comm] - submit_comm[comm]
        }
        team.commodities = has_comm
        team.sets[req.params.id - 1]  = team.sets[req.params.id - 1] + 1
        teamid = team._id
        delete team._id
        Team.findOneAndUpdate({_id : teamid},team,function(err,team){
          if(err){
            console.log(err);
            res.send(err);
          }else{
            res.redirect('/dashboard')
          }
        })
      }
    }
  });
})
module.exports = router;
