var express = require('express');
var router = express.Router();
var Team = require('../models/team')
var Proposal = require('../models/proposal')
var commodity_list = require('../models/commodity').list
var base_prices = require('../models/commodity').base_prices
var get_net_worth = require('../models/commodity').get_net_worth
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
  Team.findById(req.session.teamid,function(err,team){
    if(err){
      console.log(err);
      res.redirect('/proposal?error=true&msg='+'Unexpected Error')
    }else{
      render_data.team = team
      render_data.commodity_list = commodity_list
      render_data.base_prices = base_prices
      Proposal.find({to:req.session.teamid,valid:true},function(err,proposals){
        if(err){
          console.log(err);
          res.redirect('/proposal?error=true&msg='+'Unexpected Error')
        }else{
          render_data.proposals = proposals
          res.render('proposal',render_data)
        }
      });
    }
  });
});
router.get('/create',auth,function(req,res,next){
  var render_data = {}
  render_data.commodity = commodity_list
  Team.find({},function(err,teams){
    if(err){
      console.log(err);
      res.redirect('/proposal/create?error=true&msg='+'Unexpected Error')
    }else{
      render_data.teams = teams
      render_data.team = {}
      render_data.team._id = req.session.teamid
      render_data.commodity_list = commodity_list
      res.render('new_proposal',render_data)
    }
  })
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
    res.redirect('/proposal/create?error=true&msg='+'Not Enough Information Given')
  }
  give_comm = get_comm(req.body,'give');
  want_comm = get_comm(req.body,'want');
  if(!validate_commodity(give_comm) || !validate_commodity(want_comm)){
    res.redirect('/proposal/create?error=true&msg='+'Invalid Proposal')
  }
  Team.findById(req.session.teamid,function(err,from_team){
    if(err){
      console.log(err);
      res.redirect('/proposal/create?error=true&msg='+'Unexpected Error')
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
          res.redirect('/proposal/create?error=true&msg='+'Unexpected Error')
        }
        res.redirect('/dashboard?msg='+'Proposal sent');
      })
    }else{
      res.redirect('/proposal/create?error=true&msg='+'You do not have the required stock to make that request')
    }
  });
});

router.get('/:proposal_id/accept',auth,function(req,res,next){
  Team.findById(req.session.teamid,function(err,to_team){
    if(err){
      console.log(err);
      res.redirect('/proposal?error=true&msg='+'Unexpected Error')
    }
    Proposal.findOne({_id : req.params.proposal_id,valid:true},function(err,proposal){
      if(err){
        console.log(err);
        res.redirect('/proposal?error=true&msg='+'Unexpected Error')
      }
      if(!proposal){
        res.redirect('/proposal?error=true&msg='+'This Proposal does not exist !')
      }else{
        if(proposal.to != req.session.teamid){
          console.log(proposal.to);
          res.redirect('/proposal?error=true&msg='+'This Proposal is not for you !')
        }else{
          Team.findById(proposal.by,function(err,from_team){
            to_comm = to_team.commodities;
            want_comm = proposal.want_commodities;
            give_comm = proposal.give_commodities;
            by_comm = from_team.commodities;
            if(validate(to_comm,want_comm) && validate(by_comm,give_comm)){
              Proposal.findOneAndUpdate({'_id' : proposal._id},{$set:{'valid' : false,'status':'Accepted'}},function(err,proposal){
                if(err){
                  console.log(err);
                  res.redirect('/proposal?error=true&msg='+'Unexpected Error')
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
                to_team.net_worth = get_net_worth(to_comm)
                from_team.net_worth = get_net_worth(by_comm)
                to_team_id = to_team._id
                from_team_id = from_team._id
                delete to_team._id
                delete from_team._id
                Team.findOneAndUpdate({_id:to_team_id},to_team,function(err,to_team){
                  if(err){
                    console.log(err);
                    res.redirect('/proposal?error=true&msg='+'Unexpected Error')
                  }else{
                    Team.findOneAndUpdate({_id:from_team_id},from_team,function(err,from_team){
                      if(err){
                        console.log(err);
                        res.redirect('/proposal?error=true&msg='+'Unexpected Error')
                      }else{
                        res.redirect('/dashboard?msg='+'Requested Accepted')
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
      res.redirect('/proposal?error=true&msg='+'Unexpected Error')
    }
    Proposal.findOne({_id : req.params.proposal_id,valid:true},function(err,proposal){
      if(err){
        console.log(err);
      res.redirect('/proposal?error=true&msg='+'Unexpected Error')
      }
      if(!proposal){
        res.redirect('/proposal?msg='+'Requested Rejected')
      }else{
        if(proposal.to!=req.session.teamid){
          res.redirect('/proposal?error=true&msg='+'This request is not for you !')
        }else{
          Proposal.findOneAndUpdate({'_id' : proposal._id},{$set:{'valid' : false,'status':'Rejected'}},function(err,proposal){
            if(err){
              console.log(err);
              res.redirect('/proposal?error=true&msg='+'Unexpected Error')
            }else{
              res.redirect('/proposal?msg='+'Requested Rejected')
            }
          })
        }
      }
    });
  });
});
module.exports = router;
