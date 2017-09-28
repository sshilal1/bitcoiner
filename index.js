var xl = require('excel4node');
var Bittrex = require('./bittrex.js');
var bittrexApi = new Bittrex.bittrexApi();
// --------------
// User variables
// --------------
const watchThreshold = 2;
const buyThreshold = 5;
/****************
// --------------
Begin Application
// --------------
*****************/
// Array of all markets were monioring, populated on initial query
var myMarkets = [];
// Array of markets were watching, based on crossing watch threshold
var watchers = [];
// Array of bought markets, amnt, price, and time
var purchases = [];
// Hash table of the history of all ticks for all markets during execution
var marketHistory = {};
// Hash of timestamps (1=12:45, 2=12:48)
var timestampHash = {};
// --------------
// Initial gather
// --------------
bittrexApi.getMarketSummaries(function(markets) {

	var d = new Date();
	var timestamp = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
	timestampHash["1"] = timestamp;

	for (var market of markets) {
		var obj = {
			name: market.MarketName,
			start: market.Last,
			last: market.Last,
			ask: market.Ask
		}
		myMarkets.push(obj);
		marketHistory[market.MarketName] = [];
		marketHistory[market.MarketName].push({t:1,v:market.Last});
	}
})
// -------------
// Interval Query
// --------------
var iteration = 0;
setInterval(function() {
	iteration++;
	bittrexApi.getMarketSummaries(function(markets) {

		var d = new Date();
		var timestamp = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
		timestampHash[iteration.toString()] = timestamp;

		for (var market of markets) {
			for (var mymarket of myMarkets) {
				if (mymarket.name === market.MarketName) {
					var result = (((market.Last - mymarket.start) * 100)/market.Last).toFixed(2);
					mymarket.change = result;
					mymarket.last = market.Last;
					marketHistory[mymarket.name].push({t:iteration,v:mymarket.last});
					
					if (result > watchThreshold && !watchers.includes(mymarket.name)) {
						console.log("Now watching ", mymarket.name);
						watchers.push(mymarket.name);
					}

					if (result > buyThreshold && !bought[mymarket.name]) {
						buyMarket(mymarket,timestamp);
					}
				}
			}
		}
		myMarkets.sort(function(a,b) { return b.change - a.change});

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
	})
},2000);
// -------------
// Buy function
// -------------
function buyMarket(market,time,amount) {
	// Will eventually require padding (check next few seconds to make sure correct buy and not a fluke)
	console.log(`Time: ${time} - Buying ${market.name} at ${market.last}`);
	purchases.push({
		name : market.name,
		amount : amount,
		price : market.last,
		time : time
	})
}
// -------------
// Sell function
// -------------

// -------------
// Print function, writes to excel
// -------------
function printData() {
	var wb = new xl.Workbook();
	var ws = wb.addWorksheet('Sheet 1');

	var style = wb.createStyle({
		font: {
			color: '#FF0800',
			size: 12
		}
	});

	for (var t in timestampHash) {
		var row = parseInt(t,10) + 1;
		ws.cell(row,1).string(timestampHash[t]).style(style);
	}

	var marketCount = 1;
	for (var market in marketHistory) {
		marketCount++;
		ws.cell(1,marketCount).string(market).style(style);

		for (var tick of marketHistory[market]) {
			var time = tick.t + 1;
			ws.cell(time,marketCount).number(tick.v).style(style);
		}
	}
	wb.write('report.xlsx');
}
// -------------
// Print at node close
// -------------
var keypress = require('keypress');
// make `process.stdin` begin emitting "keypress" events 
keypress(process.stdin);
// listen for the "keypress" event 
process.stdin.on('keypress', function (ch, key) {
	console.log('got "keypress"', key);
	if (key && key.name == 'p') {
		printData();
	}
	if (key && key.ctrl && key.name == 'c') {
		process.exit();
	}
});
process.stdin.setRawMode(true);