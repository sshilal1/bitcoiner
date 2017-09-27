/*******
PUBLIC ENDPOINTS
We throttle public endpoints by IP: 3 requests per second, up to 6 requests per second in bursts.

PRIVATE ENDPOINTS
We throttle private endpoints by user ID: 5 requests per second, up to 10 requests per second in bursts.

NO LIMIT TO NUMBER OF TRADES
******/

/***
GDAX
****/
var gdaxClient = new GdaxClient.authClient(2000);

app.get('/btcOrders', function(req, res) {
	gdaxClient.getBtcOrders(function(data) { res.send(data) });
})
app.get('/accounts', function(req, res) {
	gdaxClient.getAccounts(function(data) { res.send(data) });
})
/**********
FROM APP.JS
***********/

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

var authClient = function(interval) {

	const btcClient = new Gdax.PublicClient('BTC-USD');
	const ethClient = new Gdax.PublicClient('ETH-USD');
	const ltcClient = new Gdax.PublicClient('LTC-USD');
	const authedClient = new Gdax.AuthenticatedClient(api.gdax.key, api.gdax.secret, api.gdax.pass, apiURI);

	btcClient.getCoinbaseAccounts

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

	this.getAccounts = function(callback) {
		authedClient.getAccounts(function(err, response, data) {
			callback(data);
		});
	}
	this.getAccount = function(callback) {
		authedClient.getAccount(api.acctId, function(err, response, data) {
			callback(data);
		});
	}
	this.getAccountHistory = function(callback) {
		authedClient.getAccountHistory(api.acctId, function(err, response, data) {
			callback(data);
		});
	}
	this.getAccountHolds = function(callback) {
		authedClient.getAccountHolds(api.acctId, function(err, response, data) {
			callback(data);
		});
	}
	this.getOrders = function(callback) {
		authedClient.getOrders(function(err, response, data) {
			callback(data);
		});
	}
	// reqs order id from getOrders
	const orderID = 'd50ec984-77a8-460a-b958-66f114b0de9b';
	this.getOrder = function(callback) {
		authedClient.getOrder(orderID, function(err, response, data) {
			callback(data);
		});
	}
	this.getBtcOrders = function(callback) {
		btcClient.getProductOrderBook(function(err, response, data) {
			callback(data);
		});
	}
}

module.exports = { authClient };