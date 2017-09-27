const request = require("request-promise");

var markets = {};
var ticks = {};

var bittrexClient = function(dailyVolume) {

	this.getTicker = function(market,callback) {
		var uri = 'https://bittrex.com/api/v1.1/public/getticker?market=' + market;
		request(uri, function(err, res, data) {
			callback(JSON.parse(data));
		})
	}

	this.getMarketSummaries = function(btcValue,callback) {
		request('https://bittrex.com/api/v1.1/public/getmarketsummaries')
		.then( function(data) {
			var json = JSON.parse(data);
			for (var market of json.result) {
				// If BTC market, lets report volume in BTC
				var volume = market.MarketName.startsWith("BTC") ? (market.BaseVolume * btcValue) : (market.BaseVolume);
				// If market volume is more than our requested, lets add this market to our query
				if (volume > dailyVolume) {
					markets[market.MarketName] = {
						name: market.MarketName,
						start: market.Last,
						last: market.Last
					}
				}
			}
		})
		.then( function() {
			callback(markets);
		})
	}

	this.getLatestTicks = function(btcValue,callback) {
		request('https://bittrex.com/api/v1.1/public/getmarketsummaries')
		.then( function(data) {
			var json = JSON.parse(data);
			for (var market of json.result) {
				// If BTC market, lets report volume in BTC
				var volume = market.MarketName.startsWith("BTC") ? (market.BaseVolume * btcValue) : (market.BaseVolume);
				// If market volume is more than our requested, lets add this market to our query
				if (volume > dailyVolume) {
					ticks[market.MarketName] = {
						last: market.Last
					}
				}
			}
		})
		.then( function() {
			callback(ticks);
		})
	}
}

module.exports = { bittrexClient };
