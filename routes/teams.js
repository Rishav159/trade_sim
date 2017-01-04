var express = require('express');
var router = express.Router();
var Team = require('../models/team')

var path = require('path')
var commodity_list = require('../models/commodity').list
var jsonfile = require('jsonfile')
var timer = jsonfile.readFileSync('./timer/timer.json');
/* GET users listing. */
var auth  = function(req,res,next){
  if(req.session && req.session.teamid){
    next()
  }else{
    res.redirect('/team/login')
  }
}
var check_exist = function(id,callback){
  Team.findById(id,function(err,team){
    if(err){
      console.log(err);
    }else{
      callback(team)
    }
  });
}

router.get('/',auth, function(req, res, next) {
  res.redirect('/dashboard')
});
router.get('/logout',function(req,res,next){
  if(req.session){
    delete req.session['teamid']
  }
  res.redirect('/team/login?msg='+'Logged Out')
})

router.post('/signup',function(req,res,next){
  if(!req.body.id || !req.body.password){
    res.redirect('/team/login?error=true&msg='+'Not enough information given')
  }
  check_exist(req.body.id,function(team){
    if(team){
      res.redirect('/team/login?error=true&msg='+'Teamname already taken')
    }else{
      var new_team = new Team({
        _id : req.body.id,
        password : req.body.password,
        commodities : {}
      });
      for(var i=0;i<commodity_list.length;i++){
        new_team.commodities[commodity_list[i]] = 10
      }
      new_team.commodities['cash'] = 1000
      new_team.save(function(err,team){
        if(err){
          console.log(err);
          res.send(err)
        }
        res.redirect('/team/login?msg='+'Successfully Registered. Please login to continue')
      })
    }
  })
});


router.get('/login',function(req,res,next){
	res.sendFile(path.join(__dirname, '../public/signup.html'));
});
router.post('/login',function(req,res){
	if(!req.body.id || !req.body.password){
		res.redirect('/team/login?error=true&msg='+'Insufficient Field Values')
	}else{
		Team.findById(req.body.id,function(err,team){
			if(err){
				console.log(err);
				res.send(err);
			}
			if(!team){
  			res.redirect('/team/login?error=true&msg='+'Team is not registered')
			}
			else{
        if(team.password == req.body.password){
          req.session.teamid = team._id
          res.redirect('/dashboard?msg='+'Welcome')
        }else{
          res.redirect('/team/login?error=true&msg='+'Username or Password is wrong')
        }
			}
		});
	};
});
module.exports = router;
