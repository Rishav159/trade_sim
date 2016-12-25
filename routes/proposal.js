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


var validate = function(hasobj,reqobj){
  console.log("Has");
  console.log(hasobj);
  console.log("Required");
  console.log(reqobj);
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


module.exports = router;
