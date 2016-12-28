var express = require('express');
var router = express.Router();
var Team = require('../models/team')
var Proposal = require('../models/proposal')
var commodity_list = require('../models/commoditylist')
var mongoose = require('mongoose');
/* GET home page. */
var auth  = function(req,res,next){
  if(req.session && req.session.teamid){
    next()
  }else{
    res.redirect('/team/login')
  }
}

router.get('/',auth,function(req,res,next){
  var render_data = {}
  render_data.commodity = commodity_list
  res.render('proposal',render_data)
});
router.get('/get/:proposal_id',auth,function(req,res,next){
  Proposal.findById(req.params.proposal_id,function(err,proposal){
    if(err){
      console.log(err);
      res.send(err)
    }
    res.send(proposal)
  })
});

var validate = function(hasobj,reqobj){
  for(var i=0;i<commodity_list.length;i++){
    key = commodity_list[i]
    if(reqobj[key] > hasobj[key]){
      return false
    }
  }
  return true
}
var get_comm = function(obj,s){
  var comm = {}
  for(var i=0;i<commodity_list.length;i++){
    key = commodity_list[i];
    if(obj[s+'_'+key]){
      comm[key] = obj[s+'_'+key]
    }else{
      comm[key]=0
    }
  }
  return comm
}
var validate_commodity = function(commodities){
  allzero = true
  for(var i=0;i<commodity_list.length;i++){
    key = commodity_list[i];
    if(commodities[key]>0){
      allzero=false
    }
    if(commodities[key]<0){
      return false
    }
  }
  if(allzero){
    return false
  }else{
    return true
  }
}
router.post('/create',auth, function(req, res, next) {
  if(!req.body.to){
    res.send("Not Enough Information Given")
  }
  give_comm = get_comm(req.body,'give');
  want_comm = get_comm(req.body,'want');
  if(!validate_commodity(give_comm) || !validate_commodity(want_comm)){
    res.send("Invalid Proposal")
  }
  Team.findById(req.session.teamid,function(err,from_team){
    if(err){
      console.log(err);
      res.send(err)
    }
    if(validate(from_team.commodities , give_comm)){
      proposal = new Proposal({
        to:req.body.to,
        by :req.session.teamid,
        give_commodities : give_comm,
        want_commodities : want_comm
      })
      proposal.save(function(err,proposal){
        if(err){
          console.log(err);
          res.send(err)
        }
        res.send(proposal)
      })
    }else{
      res.send("You dont have that much")
    }
  });
});

router.get('/:proposal_id/accept',auth,function(req,res,next){
  Team.findById(req.session.teamid,function(err,to_team){
    if(err){
      console.log(err);
      res.send(err);
    }
    Proposal.findOne({_id : req.params.proposal_id,valid:true},function(err,proposal){
      if(err){
        console.log(err);
        res.send(err)
      }
      if(!proposal){
        res.send("There is no such proposal")
      }else{
        if(proposal.to != req.session.teamid){
          console.log(proposal.to);
          res.send("This Proposal is not for you !")
        }else{
          Team.findById(proposal.by,function(err,from_team){
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
                for(var i=0;i<commodity_list.length;i++){
                  comm = commodity_list[i]
                  to_comm[comm] = parseInt(to_comm[comm]) - parseInt(want_comm[comm])
                  by_comm[comm] = parseInt(by_comm[comm]) + parseInt(want_comm[comm])
                  to_comm[comm] = parseInt(to_comm[comm]) + parseInt(give_comm[comm])
                  by_comm[comm] = parseInt(by_comm[comm]) - parseInt(give_comm[comm])
                }
                to_team.commodities = to_comm
                from_team.commodities = by_comm
                to_team_id = to_team._id
                from_team_id = from_team._id
                delete to_team._id
                delete from_team._id
                Team.findOneAndUpdate({_id:to_team_id},to_team,function(err,to_team){
                  if(err){
                    console.log(err);
                    res.send(err)
                  }else{
                    Team.findOneAndUpdate({_id:from_team_id},from_team,function(err,from_team){
                      if(err){
                        console.log(err);
                        res.send(err)
                      }else{
                        res.redirect('/dashboard')
                      }
                    })
                  }
                })
              })
            }else{
              res.send("You dont have that much or requester doesnt have that much")
            }
          })
        }
      }
    });
  });
});

router.get('/:proposal_id/reject',function(req,res,next){
  Team.findById(req.session.teamid,function(err,to_team){
    if(err){
      console.log(err);
      res.send(err);
    }
    Proposal.findOne({_id : req.params.proposal_id,valid:true},function(err,proposal){
      if(err){
        console.log(err);
        res.send(err)
      }
      if(!proposal){
        res.send("Done")
      }else{
        if(proposal.to!=req.session.teamid){
          res.send("This proposal isn't for you")
        }else{
          Proposal.findOneAndUpdate({'_id' : proposal._id},{$set:{'valid' : false}},function(err,proposal){
            if(err){
              console.log(err);
              res.send(err)
            }else{
              res.send("Done")
            }
          })
        }
      }
    });
  });
});
module.exports = router;
