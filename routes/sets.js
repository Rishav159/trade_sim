var express = require('express');
var router = express.Router();
var commodity_list = require('../models/commodity').list
var base_prices = require('../models/commodity').base_prices
var get_net_worth = require('../models/commodity').get_net_worth
var Team = require('../models/team')
var sets = require('../models/sets')
var jsonfile = require('jsonfile')
var timer = jsonfile.readFileSync('./timer/timer.json');
/* GET home page. */
var auth  = function(req,res,next){
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

router.get('/', auth,function(req, res, next) {
  render_data = {}
  render_data.commodity_list = commodity_list
  render_data.base_prices = base_prices
  Team.findById(req.session.teamid,function(err,team){
    if(err){
      console.log(err);
      res.redirect('/sets?error=true&msg='+'Unexpected Error')
    }else{
      render_data.team = team
      render_data.sets = sets
      render_data.timer = timer
      res.render('sets',render_data)
    }
  });
});

router.get('/:id/submit',auth,function(req,res,next){
  Team.findById(req.session.teamid,function(err,team){
    if(err){
      console.log(err);
      res.redirect('/sets?error=true&msg='+'Unexpected Error')
    }else{
      has_comm = team.commodities
      submit_comm = sets[req.params.id - 1]
      if(!validate(has_comm,submit_comm)){
        res.redirect('/sets?error=true&msg='+'You do not have that much to submit')
      }else{
        for(var i=0;i<commodity_list.length;i++){
          comm = commodity_list[i]
          has_comm[comm] = has_comm[comm] - submit_comm[comm]
        }
        team.commodities = has_comm
        team.net_worth = get_net_worth(has_comm)
        team.sets[req.params.id - 1]  = team.sets[req.params.id - 1] + 1
        teamid = team._id
        delete team._id
        Team.findOneAndUpdate({_id : teamid},team,function(err,team){
          if(err){
            console.log(err);
            res.redirect('/sets?error=true&msg='+'Unexpected Error')
          }else{
            res.redirect('/sets?msg='+'Submitted successfully')
          }
        })
      }
    }
  });
})
module.exports = router;
