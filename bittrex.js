const request = require("request-promise");

var markets = [];
var dailyVolume = 1000000;
var btcValue;

request('https://bittrex.com/api/v1.1/public/getticker?market=usdt-btc')
.then( function(data) {
	var btc = JSON.parse(data);
	btcValue = btc.result.Last;
	console.log("Btc Value:", btcValue);
})
.then(function() {
	request('https://bittrex.com/api/v1.1/public/getmarketsummaries')
	.then( function(data) {
		var json = JSON.parse(data);
		for (var market of json.result) {
			if (market.MarketName.startsWith("BTC")) {
				var volum = market.BaseVolume * btcValue;
			}
			else {
				var volum = market.BaseVolume;
			}
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
