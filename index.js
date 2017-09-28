var Bittrex = require('./bittrex.js');
/****************
// --------------
Begin Application
// --------------
*****************/
var bittrexApi = new Bittrex.bittrexApi();
var myMarkets = [];

// Initial gather
bittrexApi.getMarketSummaries(function(markets) {
	for (var market of markets) {
		var obj = {
			name: market.MarketName,
			start: market.Last,
			last: market.Last,
			time: market.TimeStamp
		}
		myMarkets.push(obj);
	}

	for (let i=0; i<3; i++) {
		console.log(myMarkets[i]);
	}
})

// Interval Query
setInterval(function() {
	bittrexApi.getMarketSummaries(function(markets) {
		for (var market of markets) {
			for (var mymarket of myMarkets) {
				if (mymarket.name === market.MarketName) {
					var result = (((market.Last - mymarket.start) * 100)/market.Last).toFixed(2);
					mymarket.change = result;
					mymarket.last = market.Last;
					mymarket.time = market.TimeStamp;
				}
			}
		}
		myMarkets.sort(function(a,b) { return b.change - a.change});
		console.log("Query: ")
		for (let i=0; i<3; i++) {
			// Here we want to create the date and time of the
			console.log(myMarkets[i]);
		}
	})
},3000);