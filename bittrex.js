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

	this.getAverageTicker = function(market,callback) {
		var uri = 'https://bittrex.com/api/v1.1/public/getticker?market=' + market;
		var timesRun = 0;
		var ticks = [];
		var interval = setInterval(function(){
			timesRun += 1;
			if (timesRun === 3) {
				var sum = 0;
				for (var i = 0; i < ticks.length; i++) {
					sum += parseInt(ticks[i], 10);
				}
				var avg = sum / ticks.length;
				callback(avg);
				clearInterval(interval);
			}
			else {
				request(uri)
				.then(function(data) {
					var json = JSON.parse(data);
					ticks.push(json.result.Last);
				})
			}
		},1000)

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

var trexClient = function(logger,dailyVolume,buyThreshold,sellThreshold,interval) {
	var markets = [];
	var btcValue = 0;

	var BittrexClient = new bittrexClient(1000);

	// In here we have access to all the functions from the below class (which will rename and export differenctly)
	BittrexClient.getTicker('usdt-btc', function(data) {
		btcValue = data.result.Last;
		console.log(btcValue);
	});
}

var myclient = new trexClient();

module.exports = { bittrexClient };
