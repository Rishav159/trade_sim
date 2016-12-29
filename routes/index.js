var express = require('express');
var router = express.Router();
var commodity_list = require('../models/commodity').list
var base_prices = require('../models/commodity').base_prices
var get_net_worth = require('../models/commodity').get_net_worth
var Team = require('../models/team')
var Proposal = require('../models/proposal')
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
  res.redirect('/team/login');
});

router.get('/dashboard',auth,function(req,res,next){
  console.log("Dashboard Get request ");
  Team.findById(req.session.teamid,function(err,team){
    if(err){
      console.log(err);
      res.send(err)
    }
    render_data ={}
    render_data['team'] = team
    render_data['base_prices'] = base_prices
    render_data['commodity_list'] = commodity_list
    res.render('dashboard',render_data)
  })
})
router.get('/leaderboards',auth,function(req,res,next){
  var render_data = {}
  render_data.commodity_list = commodity_list;
  render_data.base_prices = base_prices;
  if(req.session.teamid == 'government'){
    render_data.team = {}
    render_data.team._id = 'Government'
    Team.find().sort([['sets',-1],['net_worth', -1]]).exec(function(err,teams){
      if(err){
        console.log(err);
        res.send(err)
      }else{
        render_data.teams = teams
        res.render('leaderboards',render_data)
      }
    });
  }else{
    res.status(403).send("Access Denied")
  }
})
router.get('/logs',auth,function(req,res,next){
  var render_data = {}
  Team.findById(req.session.teamid,function(err,team){
    if(err){
      console.log(err);
      res.redirect('/dashboard?error=true&msg='+'Unexpected Error')
    }else{
      Proposal.find({
        $and:[
          {'status':"Accepted"},
          {$or:[
            {'to':team._id},
            {'by':team._id}
          ]}
        ]
        }).sort({_id : -1}).exec(function(err,proposals){
        if(err){
          console.log(err);
          res.redirect('/dashboard?error=true&msg='+'Unexpected Error');
        }else{
          console.log(proposals);
          render_data.team = team
          render_data.proposals = proposals
          render_data.commodity_list = commodity_list
          res.render('logs',render_data)
        }
      })
    }
  })
})
module.exports = router;
