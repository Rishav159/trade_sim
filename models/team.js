var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var teamSchema = new Schema({
  _id :String,
  password:String,
  commodities : {type:Schema.Types.ObjectId , ref:'Commodity'}
},{ collection:'teams'});




var Team = mongoose.model('Team', teamSchema);

// make this available to our users in our Node applications
module.exports = Team;
