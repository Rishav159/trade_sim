var express = require('express');
var router = express.Router();
var Team = require('../models/team')

var path = require('path')
var commodity_list = require('../models/commodity').list
/* GET users listing. */
var auth  = function(req,res,next){
  console.log(req.session.teamid);
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
  res.redirect('/team/login')
})
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
        res.send("Team succesfully Signed Up")
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
          res.redirect('/dashboard')
        }else{
          res.send("Wrong Password")
        }
			}
		});
	};
});
module.exports = router;
