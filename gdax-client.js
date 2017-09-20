/*******
PUBLIC ENDPOINTS
We throttle public endpoints by IP: 3 requests per second, up to 6 requests per second in bursts.

PRIVATE ENDPOINTS
We throttle private endpoints by user ID: 5 requests per second, up to 10 requests per second in bursts.

NO LIMIT TO NUMBER OF TRADES
******/

const Gdax = require('gdax');
const api = require('./api');

const apiURI = 'https://api.gdax.com';
const callback = (err, response, data) => { console.log(data) }; 

const authedClient = new Gdax.AuthenticatedClient(api.gdax.key, api.gdax.secret, api.gdax.pass, apiURI);
//authedClient.getAccounts(callback);

const buyParams = {
  'price': '4027.4', // USD
  'size': '.01',  // BTC
  'product_id': 'BTC-USD',
};
//authedClient.buy(buyParams, callback);

//authedClient.getOrders(callback);
//authedClient.cancelAllOrders({product_id: 'BTC-USD'}, callback);

//authedClient.getProducts(callback);
//authedClient.getCurrencies(callback);



//btcClient.getProductTicker(callback);
//ethClient.getProductTicker(callback);
//ltcClient.getProductTicker(callback);

var authClient = function(interval) {

	const btcClient = new Gdax.PublicClient('BTC-USD');
	const ethClient = new Gdax.PublicClient('ETH-USD');
	const ltcClient = new Gdax.PublicClient('LTC-USD');

	this.returnData = function(d) { return d; };

	this.listenTicks = function(interval) {
		setInterval(function() {
			btcClient.getProductTicker(function(err, response, data) {
				var respStr ='"BTC-USD" BID: $' + data.bid + ', ASK: $' + data.ask;
				console.log(respStr);
			});
			ethClient.getProductTicker(function(err, response, data) {
				var respStr ='"ETH-USD" BID: $' + data.bid + ', ASK: $' + data.ask;
				console.log(respStr);
			});
			ltcClient.getProductTicker(function(err, response, data) {
				var respStr ='"LTC-USD" BID: $' + data.bid + ', ASK: $' + data.ask;
				console.log(respStr);
			});
		},interval);
	}

	this.getBtcOrders = function() {
		btcClient.getProductOrderBook(function(err, response, data) {
			//console.log(data);
			letsReturn(data);
		});
	}

	this.getBtcProducts = function() {
		btcClient.getProducts()
			.then(data => {
				letsReturn(data);
			})
			.catch(error => {
				return error;
			})
	}
}

module.exports = { authClient };