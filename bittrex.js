const request = require("request-promise");

var markets = [];
var dailyVolume = 1000000;
var btcValue;
/*
// First, lets initialize the value of bitcoin
request('https://bittrex.com/api/v1.1/public/getticker?market=usdt-btc')
.then( function(data) {
	var btc = JSON.parse(data);
	btcValue = btc.result.Last;
	console.log("Btc Value:", btcValue);
})
// Then, lets get all markets
.then(function() {
	request('https://bittrex.com/api/v1.1/public/getmarketsummaries')
	.then( function(data) {
		var json = JSON.parse(data);
		for (var market of json.result) {
			// If BTC market, lets report volume in BTC
			if (market.MarketName.startsWith("BTC")) {
				var volum = market.BaseVolume * btcValue;
			}
			else {
				var volum = market.BaseVolume;
			}
			// If market volume is more than our requested, lets add this market to our query
			if (volum > dailyVolume) {
				var obj = {
					name: market.MarketName,
					volume: volum,
					last: market.Last
				};
				markets.push(obj);
			}
		}
	})
	.then( function() {
		markets.sort(function(a,b) { return b.volume - a.volume })
		console.log(markets);
	})
})
*/
var bittrexClient = function(interval,dailyVolume,buyThreshold,sellThreshold) {

	this.getTicker = function(market,callback) {
		var uri = 'https://bittrex.com/api/v1.1/public/getticker?market=' + market;
		request(uri, function(err, res, data) {
			callback(JSON.parse(data));
		})
	}
}

module.exports = { bittrexClient };
