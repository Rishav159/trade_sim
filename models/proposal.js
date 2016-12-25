var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var propSchema = new Schema({
  by : {type:String , ref:'Team'},
  to : {type:String , ref:'Team'},
  give_commodities : {type:Schema.Types.ObjectId , ref:'Commodity'},
  want_commodities : {type:Schema.Types.ObjectId , ref:'Commodity'},
  valid : {type: Boolean , default : true}
},{ collection:'proposals'});


var Proposal = mongoose.model('Proposal', propSchema);

// make this available to our users in our Node applications
module.exports = Proposal;
