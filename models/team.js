var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var teamSchema = new Schema({
  _id :String,
  password:String,
  commodities : Schema.Types.Mixed,
  sets : {
    type : [Number],
    default : [0,0,0]
  }
},{ collection:'teams'});




var Team = mongoose.model('Team', teamSchema);

// make this available to our users in our Node applications
module.exports = Team;
