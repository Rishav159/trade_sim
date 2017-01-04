var express = require('express');
var router = express.Router();
var commodity_list = require('../models/commodity').list
var base_prices = require('../models/commodity').base_prices
var get_net_worth = require('../models/commodity').get_net_worth
var Team = require('../models/team')
var Proposal = require('../models/proposal')
var jsonfile = require('jsonfile')
var timer = jsonfile.readFileSync('./timer/timer.json');
/* GET home page. */
var auth  = function(req,res,next){
  if(req.session && req.session.teamid){
    next()
  }else{
    if(req.session.teamid=='government'){
      next()
    }else{
      res.redirect('/team/login')
    }
  }
}
var checkTimer = function(req,res,next){
  end_time = timer.end_time
  now = new Date()
  remaining = Date.parse(end_time) - Date.parse(now);
  if(remaining<=0){
    res.redirect('/dashboard?error=true&msg='+'Timer Expired')
  }else{
    next()
  }
}
router.get('/', function(req, res, next) {
  res.redirect('/team/login');
});
router.post('/set_timer',auth,function(req,res,next){
  if(!req.body.minutes || !req.body.seconds || req.body.text || req.body.seconds > 60){
    if(req.session.teamid!='government'){
      res.redirect('/dashboard?error=true&msg=' + 'Unauthorized')
    }else{
      end_time = new Date()
      end_time.setTime(end_time.getTime() + (req.body.minutes*60*1000) + (req.body.seconds*1000))
      timer = {
        text : req.body.text,
        end_time : end_time
      }
      jsonfile.writeFile('./timer/timer.json',timer,function(err){
        if(err){
          console.log(err);
          res.send(err)
        }else{
          res.redirect('/dashboard?msg='+ 'Timer Set')
        }
      });
    }
  }else{
    res.redirect('/dashboard?error=true&msg=' + 'Invalid Timer')
  }
});
router.get('/dashboard',auth,function(req,res,next){
  Team.findById(req.session.teamid,function(err,team){
    if(err){
      console.log(err);
      res.send(err)
    }
    render_data ={}
    render_data['team'] = team
    render_data['base_prices'] = base_prices
    render_data['commodity_list'] = commodity_list
    render_data.timer = timer
    res.render('dashboard',render_data)
  })
})
router.get('/leaderboards',auth,function(req,res,next){
  var render_data = {}
  render_data.commodity_list = commodity_list;
  render_data.base_prices = base_prices;
  if(req.session.teamid == 'government'){
    render_data.team = {}
    render_data.team._id = 'government'
    Team.find({_id : {$ne : 'government'}}).sort([['sets',-1],['net_worth', -1]]).exec(function(err,teams){
      if(err){
        console.log(err);
        res.send(err)
      }else{
        render_data.teams = teams
        render_data.team = {}
        render_data.team._id = req.session.teamid
        render_data.timer = timer
        res.render('leaderboards',render_data)
      }
    });
  }else{
    res.status(403).send("Access Denied")
  }
})
router.get('/bird_eye',auth,function(req,res,next){
  var render_data = {}
  render_data.commodity_list = commodity_list;
  render_data.base_prices = base_prices;
  if(req.session.teamid == 'government'){
    render_data.team = {}
    render_data.team._id = 'government'
    Team.find({_id : {$ne : 'government'}}).sort([['sets',-1],['net_worth', -1]]).exec(function(err,teams){
      if(err){
        console.log(err);
        res.send(err)
      }else{
        render_data.teams=teams
        Proposal.find({status:"Accepted"},function(err,proposals){
          if(err){
            console.log(err);
            res.send(err)
          }else{
            render_data.proposals = proposals
            render_data.timer = timer
            res.render('bird_eye',render_data)
          }
        });
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
          render_data.team = team
          render_data.proposals = proposals
          render_data.commodity_list = commodity_list
          render_data.timer = timer
          res.render('logs',render_data)
        }
      })
    }
  })
});
module.exports = router;
