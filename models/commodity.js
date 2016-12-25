var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var commSchema = new Schema({
  cotton : {type : Number , default : 10},
  gold :{type : Number , default : 10},
  silver : {type : Number , default : 10},
  iron : {type : Number , default : 10},
  diamond : {type : Number , default : 10},
  aluminium : {type : Number , default : 10},
  cash : {type : Number , default : 20000}
},{ collection:'commodities'});


var Commodity = mongoose.model('Commodity', commSchema);

// make this available to our users in our Node applications
module.exports = Commodity;
