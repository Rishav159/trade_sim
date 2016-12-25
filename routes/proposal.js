var express = require('express');
var router = express.Router();
var Commodity = require('../models/commodity')
var Team = require('../models/team')
var Proposal = require('../models/proposal')
var commoditylist = require('../models/commoditylist')
var mongoose = require('mongoose');
/* GET home page. */
var auth  = function(req,res,next){
  console.log(req.session.teamid);
  if(req.session && req.session.teamid){
    next()
  }else{
    res.redirect('/team/login')
  }
}

router.get('/',auth,function(req,res,next){
  var render_data = {}
  var commodity = new Commodity();
  var render_data = {}
  render_data.commodity = []
  for(var key in Commodity.schema.paths){
    if(key!= '__v' && key!='_id'){
      render_data.commodity.push(key)
    }
  }
  res.render('proposal',render_data)
});
router.get('/get/:proposal_id',auth,function(req,res,next){
  Proposal.findById(req.params.proposal_id).populate('want_commodities give_commodities')
          .exec(function(err,proposal){
    if(err){
      console.log(err);
      res.send(err)
    }
    res.send(proposal)
  })
});

var validate = function(hasobj,reqobj){
  for(var key in commoditylist){
    if(key != '__v' || key!='_id'){
      if(reqobj[key] > hasobj[key]){
        console.log(reqobj[key]);
        console.log( " > ");
        console.log(hasobj[key]);
        return false
      }
    }
  }
  return true
}
var get_comm = function(obj,s){
  var comm = new Commodity({
    cotton : (obj[s+'_'+'cotton'] || 0),
    gold : (obj[s+'_'+'gold'] || 0),
    silver : (obj[s+'_'+'silver'] || 0),
    iron : (obj[s+'_'+'iron'] || 0),
    diamond : (obj[s+'_'+'diamond'] || 0),
    aluminium : (obj[s+'_'+'aluminium'] || 0),
    cash :  (obj[s+'_'+'cash'] || 0)
  })
  return comm
}
router.post('/create',auth, function(req, res, next) {
  if(!req.body.to){
    res.send("Not Enough Information Given")
  }
  give_comm = get_comm(req.body,'give');
  want_comm = get_comm(req.body,'want');

  Team.findById(req.session.teamid).populate('commodities').exec(function(err,from_team){
    if(err){
      console.log(err);
      res.send(err)
    }
    if(validate(from_team.commodities , give_comm)){
      give_comm.save(function(err,give_comm){
        if(err){
          console.log(err);
          res.send(err)
        }
        want_comm.save(function(err,save_comm){
          if(err){
            console.log(err);
            res.send(err)
          }
          proposal = new Proposal({
            to:req.body.to,
            by :req.session.teamid,
            give_commodities : give_comm._id,
            want_commodities : want_comm._id
          })
          proposal.save(function(err,proposal){
            if(err){
              console.log(err);
              res.send(err)
            }
            res.send(proposal)
          })
        })
      })
    }else{
      res.send("You dont have that much")
    }
  });
});

router.get('/:proposal_id/accept',auth,function(req,res,next){
  console.log(req.session);
  Team.findById(req.session.teamid).populate('commodities').exec(function(err,to_team){
    if(err){
      console.log(err);
      res.send(err);
    }
    Proposal.findById(req.params.proposal_id).populate('want_commodities give_commodities')
              .exec(function(err,proposal){
      if(err){
        console.log(err);
        res.send(err)
      }
      Team.findById(proposal.by).populate('commodities').exec(function(err,from_team){
        if(proposal.to != req.session.teamid){
          res.send("This Proposal is not for you !")
        }
        if(false){
          res.send("This proposal is no longer valid")
        }
        to_comm = to_team.commodities;
        want_comm = proposal.want_commodities;
        give_comm = proposal.give_commodities;
        by_comm = from_team.commodities;
        if(validate(to_comm,want_comm) && validate(by_comm,give_comm)){
          Proposal.findOneAndUpdate({'_id' : proposal._id},{$set:{'valid' : false}},function(err,proposal){
            if(err){
              console.log(err);
              res.send(err)
            }
            console.log("Lenght of list is " + commoditylist);
            for(var i=0;i<commoditylist.length;i++){
              comm = commoditylist[i]
              console.log("Chaning "+comm);
              to_comm[comm] = to_comm[comm] - want_comm[comm]
              by_comm[comm] = by_comm[comm] + want_comm[comm]
              to_comm[comm] = to_comm[comm] + give_comm[comm]
              by_comm[comm] = by_comm[comm] - give_comm[comm]
            }
            to_comm = new Commodity(to_comm);
            by_comm = new Commodity(by_comm);
            console.log("After Changing , ");
            console.log("To comm");
            console.log(to_comm);
            console.log("By comm");
            console.log(by_comm);
            to_comm.save(function(err,to__comm){
              if(err){
                console.log(err);
                res.send(err)
              }
              console.log(to__comm);
              Team.findOneAndUpdate({'_id' : to_team._id},{$set : {'commodities' : to__comm._id}},function(err,tteam){
                if(err){
                    console.log(err);
                    res.send(err)
                }
                console.log(tteam);
                by_comm.save(function(err,by__comm){
                  if(err){
                    console.log(err);
                    res.send(err)
                  }
                  console.log(by__comm);
                  Team.findOneAndUpdate({'_id' : from_team._id},{$set : {'commodities' : by__comm._id}},function(err,bteam){
                    if(err){
                      console.log(err);
                      res.send(err)
                    }
                    console.log(bteam);
                    res.send("Updated Succesfully");
                  });
                })
              })
            })
          })
        }else{
          res.send("You dont have that much or requester doesnt have that much")
        }
      })
    });
  });
});
module.exports = router;
