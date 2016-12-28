var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var propSchema = new Schema({
  by : {type:String , ref:'Team'},
  to : {type:String , ref:'Team'},
  give_commodities : Schema.Types.Mixed,
  want_commodities : Schema.Types.Mixed,
  valid : {type: Boolean , default : true},
  status : {type:String , default : "Pending"}
},{ collection:'proposals'});


var Proposal = mongoose.model('Proposal', propSchema);

// make this available to our users in our Node applications
module.exports = Proposal;
