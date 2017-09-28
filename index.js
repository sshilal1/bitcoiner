var Bittrex = require('./bittrex.js');

const watchThreshold = 2;
/****************
// --------------
Begin Application
// --------------
*****************/
var bittrexApi = new Bittrex.bittrexApi();
var myMarkets = [];
var watchers = [];
var marketHistory = {};
var timestampHash = {};
/*
marketHistory = {
	"btc-usdt" : [ {t=1, v=4232}, {t=2, v=4232}, {t=3, v=4262} ],
	"eth-usdt" : [342,573,451]
}
*/

// Initial gather
bittrexApi.getMarketSummaries(function(markets) {

	var d = new Date();
	var timestamp = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
	timestampHash["1"] = timestamp;

	for (var market of markets) {
		var obj = {
			name: market.MarketName,
			start: market.Last,
			last: market.Last
		}
		myMarkets.push(obj);
		marketHistory[market.MarketName] = [];
		marketHistory[market.MarketName].push({t:1,v:market.Last});
	}
})
// -------------

// Interval Query
var iteration = 0;
setInterval(function() {
	iteration++;
	bittrexApi.getMarketSummaries(function(markets) {
		for (var market of markets) {
			for (var mymarket of myMarkets) {
				if (mymarket.name === market.MarketName) {
					var result = (((market.Last - mymarket.start) * 100)/market.Last).toFixed(2);
					mymarket.change = result;
					mymarket.last = market.Last;
					
					if (result > watchThreshold && !watchers.includes(mymarket.name)) {
						console.log("Now watching ", mymarket.name);
						watchers.push(mymarket.name);
					}
				}
			}
		}
		myMarkets.sort(function(a,b) { return b.change - a.change});

		var d = new Date();
		var timestamp = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
		timestampHash[iteration.toString()] = timestamp;

		console.log(`\nTime: ${timestamp}\nLeaders:`);

		for (let i=0; i<5; i++) {			
			var leaderStr = `${myMarkets[i].change}% - ${myMarkets[i].name}`;
			console.log(leaderStr);
		}

		var watcherStr = "";
		for (var watcher of watchers) {
			watcherStr += `${watcher}, `;
		}
		console.log(`Watching: ${watcherStr}`);
		console.log(timestampHash);
	})
},3000);
// -------------

// Sell function, writes stock info to excel sheet