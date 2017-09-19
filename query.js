const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient('ETH-USD','https://api.gdax.com');

publicClient.getProducts(function(err,response,data) {
	//console.log(data);
});

publicClient.getCurrencies(function(err,response,data) {
	//console.log(data);
});

publicClient.getProduct24HrStats(function(err,response,data) {
	//console.log(data);
});

publicClient.getProductOrderBook({'level': 1}, function(err,response,data) {
	//console.log(data);
});

publicClient.getProductTicker(function(err,response,data) {
	console.log(data);
});
