var list = [
  'cash',
  'iron',
  'gold',
  'aluminium',
  'silver',
  'diamond',
  'cotton'
];
var base_prices = {
  'cash' : 1,
  'iron' : 200,
  'gold' : 500,
  'aluminium' : 200,
  'silver' : 400,
  'diamond' : 600,
  'cotton' : 150
}
var get_net_worth = function(commodities){
  var net_worth = 0
  for(var i =0;i<list.length;i++){
    comm = list[i]
    base_price = base_prices[comm]
    net_worth = net_worth + base_price*commodities[comm]
  }
  return net_worth
}
module.exports = {list : list , base_prices : base_prices , get_net_worth : get_net_worth}
