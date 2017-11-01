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
			if (!(market.MarketName.includes('ETH') || market.MarketName.includes('USDT'))) {
				var pctChange = pdiff(market.Last, market.PrevDay);
				if (pctChange > buyThreshold+5) { neverbuy = true; }
				else { neverbuy = false; }
				var obj = {
					name: market.MarketName,
					start: market.Last,
					last: market.Last,
					ask: market.Ask,
					low: market.Low,
					neverbuy: neverbuy,
					st: (buyThreshold-10),
					bought: false,
					sold: false
				}
				myMarkets.push(obj);

				//initObj[market.MarketName] = market.Last
			}
		}

		//historyArray.push(initObj);

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
				
				var thisobj = {
					time : timestamp
				}

				myMarkets.sort(function(a,b) { return b.change - a.change});
				purchases.sort(function(a,b) { return b.change - a.change});

				for (var mymarket of myMarkets) {
					for (var market of markets.result) {
						if (!(market.MarketName.includes('ETH') || market.MarketName.includes('USDT'))) {
							if (mymarket.name === market.MarketName) {
								rank++;
								var pctChange = pdiff(market.Last, market.PrevDay);

								mymarket.change = twenty4HrChange;
								mymarket.ask = market.Ask;
								mymarket.low = market.Low;

								var jumper = (mymarket.last < buyThreshold-1) && (mymarket.Last > buyThreshold+1);
								mymarket.last = market.Last;
								
								var floatPct24Change = parseFloat(twenty4HrChange,10);


								// If the top 2 coins
								if (rank < 3) {
									if ((floatPct24Change > buyThreshold-1) && (floatPct24Change < buyThreshold+1) && !mymarket.bought && !mymarket.neverbuy) {
										action.buyMarket(mymarket,timestamp,purchases);
									}
									else if (jumper) {
										logger.write(`Jumper set for ${mymarket.name}`);
										action.buyMarket(mymarket,timestamp,purchases);
									}
								}

								action.gradientSell(mymarket,timestamp,purchases);
							}
							thisobj[market.MarketName] = pdiff(market.Last, market.PrevDay);
						}
					}
				}
				
				console.log(`Time: ${hrs(timestamp.substring(0,2))}:${timestamp.substring(2,4)}:${timestamp.substring(4,6)}\t\t`);

				// Leaders interval
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
				}

				// Write data to history file
				var arr = require(historyFileName);
				arr.push(thisobj);
				fs.writeFile(historyFileName, JSON.stringify(arr), (err) => {
					if (err) throw err;
				});

			}
			else {
				logger.write("No Query at " +timestamp);
			}
		})
	},1000);
}

else {
	var file = "./logs/market-history_10.24.117__b30s50c7__23-39-42.json";
	jsonfile.readFile(file, function(err, obj) {

		var mfirstQuery = obj[0];
		for (var thing in mfirstQuery) {
			if (thing != 'time') {
				var myObj = {
					name: thing,
					start: mfirstQuery[thing],
					last: mfirstQuery[thing],
					st: false,
					bought: false,
					sold: false
				}
				myMarkets.push(myObj);
			}
		}

		for (var query of obj) {
			iteration++;
			// Here is main loop
			//console.log("loop no:", iteration);
			var markets = [];
			var timestamp;

			for (var row in query) {
				if (row != 'time') {
					var obj = {
						MarketName : row,
						Last : query[row]
					}				
					markets.push(obj);
				}
				else {
					timestamp = query[row];
				}
			}

			for (var market of markets) {
				for (var mymarket of myMarkets) {
					if (mymarket.name === market.MarketName) {
						var newPctChange = pdiff(market.Last, mymarket["start"]);
						if (newPctChange > mymarket.change) { mymarket.top = newPctChange; }
						mymarket.change = newPctChange;
						mymarket.last = market.Last;

						var floatPctChange = parseFloat(newPctChange,10);
						var ceilingDip = parseFloat(mymarket.top,10) - parseFloat(mymarket.change,10);
						var buyDip = parseFloat((buyThreshold - floatPctChange).toFixed(2));

						if (floatPctChange > sellThreshold) {
							mymarket.st = true;
						}

						if ((floatPctChange > buyThreshold) && !mymarket.bought) {
							mymarket.bought = true;
							buyMarket(mymarket,timestamp);
						}

						else if (mymarket.st && (ceilingDip > ceilingThreshold) && mymarket.bought && !mymarket.sold) {
							sellMarket(mymarket,timestamp);
						}

						else if ((buyDip > lossThreshold) && mymarket.bought && !mymarket.sold) {
							sellMarket(mymarket,timestamp);
						}
					}
				}
			}
			myMarkets.sort(function(a,b) { return b.change - a.change});

			// Leaders interval
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
			}
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
// Reporter function for purchases
// -------------
function reportOn(newchange,market) {
	var cross5 = parseInt(buyThreshold,10) + 5;
	var cross10 = parseInt(buyThreshold,10) - 10;
	var dip5 = parseInt(buyThreshold,10) - 5;
	var dip10 = parseInt(buyThreshold,10) - 10;
	var oldchange = market.change;

	if (oldchange <= cross5 && newchange >= cross5) {
		reporter.write(`${market.name} Crossing 5% gain from ${oldchange}% to ${newchange}%`);
	}
	else if (newchange <= dip5 && oldchange >= dip5) {
		reporter.write(`${market.name} Dipping 5% loss from ${oldchange}% to ${newchange}%`);
	}
	else if (oldchange <= cross10 && newchange >= cross10) {
		reporter.write(`${market.name} Crossing 10% gain from ${oldchange}% to ${newchange}%`);
	}
	else if (newchange <= dip10 && oldchange >= dip10) {
		reporter.write(`${market.name} Dipping 10% loss from ${oldchange}% to ${newchange}%`);
	}
}
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
// Buy function
// -------------
function buyMarket(market,msTime,amount) {
	// Will eventually require padding (check next few seconds to make sure correct buy and not a fluke)
	logger.write(`Buying ${market.name} at ${market.change}%`);
	reporter.write(`Buying ${market.name} at ${market.change}%`);
	purchases.push({
		name : market.name,
		amount : 1,
		price : market.last,
		time : msTime,
		change : market.change
	})
}
// -------------
// Hours Conversion
// -------------
var hrs = function(hours) {
	var thours = parseInt(hours,10);
	return thours > 12 ? thours - 12 : thours;
}
// -------------
// Sell function
// -------------
function sellMarket(market, time) {
	logger.write(`Selling ${market.name} at ${market.change}%`);
	reporter.write(`Selling ${market.name} at ${market.change}%`);
	for (let p=0; p<purchases.length; p++) {
		if (purchases[p].name == market.name) {
			for (var mymarket of myMarkets) {
				if (mymarket.name == market.name) {
					mymarket.sold = true;
					var profit = pdiff(market.last, purchases[p].price);
					//var profit = ((market.last - purchases[p].price) * 100 / market.last).toFixed(2);
					logger.write(`Profited ${profit}% from ${mymarket.name}`);
					reporter.write(`Profited ${profit}% from ${mymarket.name}`);
				}
			}
			purchases.splice(p,1);
		}
	}
}
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
	for (let i=0; i<10; i++) {
		var myMarket = myMarkets[i];

		for (var market in marketHistory) {
			if (market == myMarket.name) {
				marketCount++;
				ws.cell(1,marketCount).string(market).style(style);

				for (var tick of marketHistory[market]) {
					var time = tick.t + 1;
					ws.cell(time,marketCount).number(tick.v);
				}
			}
		}
	}
	wb.write('report.xlsx');
}
function printJson() {

	var topMarketsJson = [];
	var tickCounts = _.size(marketHistory['USDT-BTC']);

	for (let j=1; j<tickCounts; j++) {
		var query = {
			time: timestampHash[j]
		};
		for (let i=0; i<10; i++) {
			var name = myMarkets[i].name;
			var ticker = _.find(marketHistory[name], function(o) {return o.t == j} );
			//errorlogs.write(`j:${j} ticker:${ticker.toString()}`);

			if (typeof(ticker) != undefined) {
				query[name] = ticker.v;
			}
			else {
				query[name] = null;
			}
		}
		topMarketsJson.push(query);
	}

	var historyname = 'b'+buyThreshold;

	jsonfile.writeFileSync(`${historyname}_history.json`, topMarketsJson);
}
// -------------
// Print at node close
// -------------
var keypress = require('keypress');
keypress(process.stdin);
process.stdin.on('keypress', function (ch, key) {
	if (key && key.name == 'p') {
		printData();
	}
	if (key && key.name == 'r') {
		printJson();
	}
	if (key && key.ctrl && key.name == 'c') {
		process.exit();
	}
});
process.stdin.setRawMode(true);