var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var path = require('path')
var get_net_worth= require(path.resolve(__dirname,'commodity')).get_net_worth

var teamSchema = new Schema({
  _id :String,
  password:String,
  commodities : Schema.Types.Mixed,
  sets : {
    type : [Number],
    default : [0,0,0]
  },
  net_worth : Number
},{ collection:'teams'});

teamSchema.pre('save',function(next){
  var commodities = this.commodities
  this.net_worth = get_net_worth(commodities)
  next()
})


var Team = mongoose.model('Team', teamSchema);

// make this available to our users in our Node applications
module.exports = Team;
