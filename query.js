const Gdax = require('gdax');

const product = 'ETH-USD';
const api = 'https://api.gdax.com';
const publicClient = new Gdax.PublicClient(product, api);

var sample = {
	trade_id: 11054329,
  price: '289.37000000',
  size: '22.29620345',
  bid: '289.37',
  ask: '289.38',
  volume: '301367.52246152',
  time: '2017-09-19T02:16:24.475000Z'
};

setInterval(function() {
	var pc = new Gdax.PublicClient('ETH-USD','https://api.gdax.com').getProductTicker(function(err,response,data) {
		var respStr ='"' + product + '" BID: $' + data.bid + ', ASK: $' + data.ask;
		console.log(respStr);
	})
},4000);
