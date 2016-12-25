var express = require('express');
var router = express.Router();
var Team = require('../models/team')
var Commodity = require('../models/commodity')
var path = require('path')
/* GET users listing. */

var check_exist = function(id,callback){
  Team.findById(id,function(err,team){
    if(err){
      console.log(err);
    }else{
      callback(team)
    }
  });
}

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/signup',function(req,res,next){
  console.log("Signup Page Requested");
  res.sendFile(path.join(__dirname, '../public/signup.html'));
});

router.post('/signup',function(req,res,next){
  console.log("A team is trying to register");
  if(!req.body.id || !req.body.password){
    res.send("Not enough Information")
  }
  check_exist(req.body.id,function(team){
    if(team){
      res.send("Team already exists");
    }else{
      var comm = new Commodity();
      console.log(comm);
      comm.save(function(err,commodity){
        if(err){
          console.log(err);
          res.send(err)
        }
        var team = new Team({
          _id : req.body.id,
          password : req.body.password,
          commodities : commodity._id
        });
        team.save(function(err,team){
          if(err){
            console.log(err);
            res.send(err)
          }
          res.send("Team succesfully Signed Up")
        })
      })
    }
  })
});


router.get('/login',function(req,res,next){
  console.log("Login Page Requested");
	res.sendFile(path.join(__dirname, '../public/login.html'));
});
router.post('/login',function(req,res){
	console.log("A team is trying to login");
	if(!req.body.id || !req.body.password){
		  res.status(502).send('Insufficient field values');
	}else{
		Team.findById(req.body.id,function(err,team){
			if(err){
				console.log(err);
				res.send(err);
			}
			if(!team){
				res.send("Not registered");
			}
			else{
        if(team.password == req.body.password){
          req.session.teamid = team._id
          res.send("You are now logged in")
        }else{
          res.send("Wrong Password")
        }
			}
		});
	};
});
module.exports = router;
