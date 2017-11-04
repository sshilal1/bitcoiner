// --------------
// User variables
// --------------
var buyThreshold = process.argv[2] || 30;
var reRun = process.argv[3] || false;
buyThreshold = parseInt(buyThreshold,10);
// --------------
const xl = require('excel4node');
const jsonfile = require('jsonfile');
const _ = require('lodash');
const fs = require('fs');
const bittrex = require('node-bittrex-api');
const api = require('./api');
bittrex.options({ 
	'apikey' : api.bittrex.key,
	'apisecret' : api.bittrex.secret
});

var dontBuyThese = [];
// --------------------
// Setup Logging
// --------------------
const logging = require('./lib/logging');

var logger = new logging.consoleLog(buyThreshold);
logger.create();

var reporter = new logging.log(buyThreshold);
var errorlogs = new logging.log(buyThreshold);
reporter.create('report');
errorlogs.create('error');
// --------------------
// Setup Actions
// --------------------
const actions = require('./actions');
var action = new actions.bittrexActions(logger,reporter,buyThreshold);
/****************
// --------------
Begin Application
// --------------
*****************/
// Array of all markets were monioring, populated on initial query
var myMarkets = [];
// Array of bought markets, amnt, price, and time
var purchases = [];
// Hash table of the history of all ticks for all markets during execution
var marketHistory = {};
// Hash of timestamps (1=12:45, 2=12:48)
var timestampHash = {};
// Iteration Count, need for both execution types
var iteration = 0;
// History file name'
var d = new Date()
var time = `${d.getHours().toString().padStart(2,0)}.${d.getMinutes().toString().padStart(2,0)}.${d.getSeconds().toString().padStart(2,0)}`;
var filename = 'b'+buyThreshold+'__'+(d.getMonth()+1)+'.'+d.getDate()+'.'+d.getYear()+'_'+time;
var historyFileName = './logs/market-history_' + filename + '.json';
var btcPrice;
// --------------
// Initial gather
// --------------
if (!reRun) {
	bittrex.getmarketsummaries(function(markets) {

		var d = new Date();
		var timestamp = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
		timestampHash["1"] = timestamp;

		var timestampnum = `${d.getHours().toString().padStart(2,0)}${d.getMinutes().toString().padStart(2,0)}${d.getSeconds().toString().padStart(2,0)}`;
		var historyArray = [];
		var initObj = {
			time : timestampnum
		}

		for (var market of markets.result) {

			if (market.MarketName == 'USDT-BTC') {
				btcPrice = market.Last;
			}

			if (!(market.MarketName.includes('ETH') || market.MarketName.includes('USDT'))) {
				var pctChange = pdiff(market.Last, market.PrevDay);
				
				if (pctChange > buyThreshold+5 || dontBuyThese.includes(market.MarketName)) { 
					neverbuy = true;
				}
				else {
					neverbuy = false;
				}
				
				var obj = {
					name: market.MarketName,
					start: market.Last,
					last: market.Last,
					ask: market.Ask,
					low: market.Low,
					neverbuy: neverbuy,
					st: (buyThreshold-10),
					count: 100,
					bought: false,
					sold: false
				}
				myMarkets.push(obj);
			}
		}

		// Currently just writing empty array on first query.
		fs.writeFile(historyFileName, JSON.stringify(historyArray), (err) => {
			if (err) throw err;
		})
	})
	// -------------
	// Interval Query
	// --------------
	var minutesToRecordAfterBuying = 30;
	var msAfterBuying = minutesToRecordAfterBuying * 60000;
	setInterval(function() {
		bittrex.getmarketsummaries(function(markets) {			

			if (markets) {

				var rank = 0;
				var d = new Date();
				var timestamp = `${d.getHours().toString().padStart(2,0)}${d.getMinutes().toString().padStart(2,0)}${d.getSeconds().toString().padStart(2,0)}`;		
				var tick = {
					time : timestamp
				}

				myMarkets.sort(function(a,b) { return b.change - a.change});
				purchases.sort(function(a,b) { return b.change - a.change});

				for (var market of markets.result) {

					if (market.MarketName == 'USDT-BTC') {
						btcPrice = market.Last;
					}

					for (var mymarket of myMarkets) {
						if (!(market.MarketName.includes('ETH') || market.MarketName.includes('USDT'))) {
							if (mymarket.name === market.MarketName) {
								
								rank++;
								var pctChange = pdiff(market.Last, market.PrevDay);
								var floatPctChange = parseFloat(pctChange,10);
								var jumper = (mymarket.change < buyThreshold-1) && (floatPctChange > buyThreshold+1);

								mymarket.change = floatPctChange;
								mymarket.ask = market.Ask;
								mymarket.low = market.Low;
								mymarket.last = market.Last;
								mymarket.price = (market.Last * btcPrice);

								// Anything that we have not bought, that rises above 40 (buy+10), dont ever
								//action.checkNeverBuy(mymarket,rank);

								if (mymarket.bought) {
									action.tieredSell(mymarket,timestamp,purchases);
								}

								// If the top 2 coins
								if (rank < 20) {
									if ((floatPctChange > buyThreshold-1) && (floatPctChange < buyThreshold+1) && !mymarket.bought && !mymarket.neverbuy) {
										action.buyMarket(mymarket,timestamp,purchases);
									}
									else if (jumper && !mymarket.bought) {
										logger.write(`Jumper set for ${mymarket.name}`);
										action.buyMarket(mymarket,timestamp,purchases);
									}
								}
							}
							tick[market.MarketName] = pdiff(market.Last, market.PrevDay);
						}
					}
				}
				
				console.log(`Time: ${hrs(timestamp.substring(0,2))}:${timestamp.substring(2,4)}:${timestamp.substring(4,6)}\t\t`);
				// Leaders interval
				logger.printLeaders(myMarkets,3);
				// Bought interval
				logger.printBought(myMarkets,purchases);

				// Write data to history file
				var arr = require(historyFileName);
				arr.push(tick);
				fs.writeFile(historyFileName, JSON.stringify(arr), (err) => {
					if (err) throw err;
				});

			}

			else {
				logger.write("No Query at " +timestamp);
			}

		})
	}, 5000);
}

else {
	var file = "./logs/market-history_b30__11.4.117_00.35.54.json";
	jsonfile.readFile(file, function(err, obj) {

		// Populate myMarkets array
		var mfirstQuery = obj[0];
		for (var thing in mfirstQuery) {
			if (thing != 'time') {
				var myObj = {
					name: thing,
					change: mfirstQuery[thing],
					st: false,
					count: 100,
					bought: false,
					sold: false
				}
				myMarkets.push(myObj);
			}
		}

		// Main Loop
		for (var query of obj) {

			// Initial variable sets/clears
			var markets = [];
			var timestamp;
			var rank = 0;

			// Populate markets so its as if it were coming from bittrex api
			for (var row in query) {
				if (row != 'time') {
					var obj = {
						MarketName : row,
						Change : query[row]
					}				
					markets.push(obj);
				}
				// Record timestamp for this query
				else {
					timestamp = query[row];
				}
			}

			myMarkets.sort(function(a,b) { return b.change - a.change});
			purchases.sort(function(a,b) { return b.change - a.change});

			for (var mymarket of myMarkets) {
				for (var market of markets) {
					if (mymarket.name === market.MarketName) {
						
						rank++;
						var pctChange = market.Change;
						var floatPctChange = parseFloat(pctChange,10);
						var jumper = (mymarket.change < buyThreshold-1) && (floatPctChange > buyThreshold+1);

						mymarket.change = pctChange;

						// Anything that we have not bought, that rises above 40 (buy+10), dont ever
						//action.checkNeverBuy(mymarket,rank);

						if (mymarket.bought) {
							action.tieredSell(mymarket,timestamp,purchases,false,true);
						}

						// If the top 2 coins
						if (rank < 3) {
							if ((floatPctChange > buyThreshold-1) && (floatPctChange < buyThreshold+1) && !mymarket.bought && !mymarket.neverbuy) {
								action.buyMarket(mymarket,timestamp,purchases,true);
							}
							else if (jumper && !mymarket.bought) {
								logger.write(`Jumper set for ${mymarket.name}`);
								action.buyMarket(mymarket,timestamp,purchases,true);
							}
						}
					}
				}
			}

			/*// Leaders interval
			var longLeaderString = "Leaders: ";
			for (let i=0; i<5; i++) {			
				var leaderStr = `${myMarkets[i].change}% - ${myMarkets[i].name}`;	
				if (i<3) { longLeaderString += leaderStr + " | "; }
			}
			logger.write(longLeaderString);

			// Bought interval
			if (purchases.length > 0) {
				var purchaseStr = "Bought : ";
				for (var purchase in purchases) {
					purchaseStr += `${purchases[purchase].change}% - ${purchases[purchase].name} | `;
				}
				logger.write(purchaseStr);
			}*/
		}
	})
}
// -------------
// -------------
// -------------
// -------------
// HELPER FUNCTIONS
// -------------
// -------------
// -------------
// -------------
// Percent difference
// -------------
function pdiff(first,second) {
	var firstN = parseFloat(first,10);
	var secondN = parseFloat(second,10);
	var answer = (((firstN / secondN) - 1) * 100).toFixed(2);
	return parseFloat(answer,10);
}
// -------------
// Hours Conversion
// -------------
var hrs = function(hours) {
	var thours = parseInt(hours,10);
	return thours > 12 ? thours - 12 : thours;
}
// -------------
// -------------