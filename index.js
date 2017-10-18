// --------------
// User variables
// --------------
var buyThreshold = process.argv[2] || 30;
var sellThreshold = process.argv[3] || 50;
var ceilingThreshold = process.argv[4] || 7;
var lossThreshold = process.argv[5] || 10;
var reRun = process.argv[6] || false;
//var lowOrStart = process.argv[5] || "start";
// --------------
var xl = require('excel4node');
var jsonfile = require('jsonfile');
var _ = require('lodash');
const bittrex = require('node-bittrex-api');
const api = require('./api');
bittrex.options({ 
	'apikey' : api.bittrex.key,
	'apisecret' : api.bittrex.secret
});

// --------------------
// Setup Logging
// --------------------
const logDir = 'logs';
const fs = require('fs');
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir);
}

const tsFormat = () => (new Date()).toLocaleString();
var d = new Date();
var filename = (d.getMonth()+1)+'.'+d.getDate()+'.'+d.getYear()+'__b'+buyThreshold+'s'+sellThreshold+'c'+ceilingThreshold+'__'+d.getHours()+'-'+d.getMinutes()+'-'+d.getSeconds();
var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
		new (winston.transports.Console)({
			colorize: true,
			level: 'info'
		}),
    new (winston.transports.File)({
			filename: `${logDir}/${filename}.log`,
			timestamp: tsFormat,
		})
	]
});
var reporter = new (winston.Logger)({
	transports: [
		new (winston.transports.File)({
			filename: `${logDir}/${filename}__report.log`,
			timestamp: tsFormat,
		})
	]
})
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
// --------------
// Initial gather
// --------------
if (!reRun) {
	bittrex.getmarketsummaries(function(markets) {

		var d = new Date();
		var timestamp = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
		timestampHash["1"] = timestamp;

		for (var market of markets.result) {
			var obj = {
				name: market.MarketName,
				start: market.Last,
				last: market.Last,
				ask: market.Ask,
				low: market.Low,
				top: 0,
				st: false,
				bought: false,
				sold: false
			}
			// st = sell threshold
			myMarkets.push(obj);
			marketHistory[market.MarketName] = [];
			marketHistory[market.MarketName].push({t:1,v:market.Last});
		}
	})
	// -------------
	// Interval Query
	// --------------
	var minutesToRecordAfterBuying = 30;
	var msAfterBuying = minutesToRecordAfterBuying * 60000;
	setInterval(function() {
		iteration++;
		bittrex.getmarketsummaries(function(markets) {

			var d = new Date();
			var timestamp = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
			var msTime = d.getTime();
			timestampHash[iteration.toString()] = timestamp;

			if (markets) {
				for (var market of markets.result) {
					for (var mymarket of myMarkets) {
						if (mymarket.name === market.MarketName) {
							var newPctChange = (((market.Last - mymarket["start"]) * 100)/market.Last).toFixed(2);
							var twenty4HrCHange = (((market.Last - mymarket["low"]) * 100)/market.Last).toFixed(2);
							if (newPctChange > mymarket.change) { mymarket.top = newPctChange; }
							mymarket.change = newPctChange;
							mymarket.last = market.Last;
							mymarket.ask = market.Ask;
							mymarket.low = market.Low;
							marketHistory[mymarket.name].push({t:iteration,v:mymarket.last});

							for (var purchase of purchases) {
								if (purchase.name === mymarket.name) {
									reportOn(newPctChange,mymarket);
									purchase.change = newPctChange;
									var purchaseTime = parseInt(purchase.time,10);
									if ((purchaseTime + msAfterBuying) < msTime) {
										reporter.info(`${minutesToRecordAfterBuying} minutes have gone by since we bought ${purchase.name}... currently at ${newPctChange}%`);
									}
								}
							}

							var floatPctChange = parseFloat(newPctChange,10);
							var ceilingDip = parseFloat(mymarket.top,10) - parseFloat(mymarket.change,10);
							var buyDip = (buyThreshold - floatPctChange).toFixed(2);

							if (floatPctChange > sellThreshold) {
								mymarket.st = true;
							}

							if ((floatPctChange > buyThreshold) && !mymarket.bought) {
								mymarket.bought = true;
								buyMarket(mymarket,msTime);
								//asyncKickOffBuy(mymarket,msTime);
								// Here we should be spinning off a separate async function to watch this
							}

							else if (mymarket.st && (ceilingDip > ceilingThreshold) && mymarket.bought && !mymarket.sold) {
								reporter.info(`${ceilingDip} crossing ceiling threshold dip of ${ceilingThreshold}%, selling for gains...`);
								sellMarket(mymarket,timestamp);
							}

							else if ((buyDip > lossThreshold) && mymarket.bought && !mymarket.sold) {
								reporter.info(`${mymarket.name} at ${newPctChange}% crossing lossThreshold dip of ${lossThreshold}% (${buyDip}%), cutting losses...`);
								sellMarket(mymarket,timestamp);
							}
						}
					}
				}
				myMarkets.sort(function(a,b) { return b.change - a.change});
				purchases.sort(function(a,b) { return b.change - a.change});
				console.log(`Time: ${timestamp}`);

				// Leaders interval
				var longLeaderString = "Leaders: ";
				for (let i=0; i<5; i++) {			
					var leaderStr = `${myMarkets[i].change}% - ${myMarkets[i].name}`;	
					if (i<3) { longLeaderString += leaderStr + " | "; }
				}
				logger.info(longLeaderString);

				// Bought interval
				if (purchases.length > 0) {
					var purchaseStr = "Bought : ";
					for (var purchase in purchases) {
						purchaseStr += `${purchases[purchase].change}% - ${purchases[purchase].name} | `;
					}
					logger.info(purchaseStr);
				}
			}
			else {
				logger.info("No Query at " +timestamp);
			}
		})
	},5000);
}

else {
	var file = "10.18.117__b30s50c7__13-57-28_history.json";
	jsonfile.readFile(file, function(err, obj) {

		var mfirstQuery = obj[0];
		for (var thing in mfirstQuery) {
			if (thing != 'time') {
				var myObj = {
					name: thing,
					start: mfirstQuery[thing],
					last: mfirstQuery[thing],
					top: 0,
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
			console.log("loop no:", iteration);
			var markets = [];

			for (var row in query) {
				if (row != 'time') {
					var obj = {
						MarketName : row,
						Last : query[row]
					}				
					markets.push(obj);
				}
			}

			for (var market of markets) {
				for (var mymarket of myMarkets) {
					if (mymarket.name === market.MarketName) {
						var newPctChange = (((market.Last - mymarket["start"]) * 100)/market.Last).toFixed(2);
						var twenty4HrCHange = (((market.Last - mymarket["low"]) * 100)/market.Last).toFixed(2);
						if (newPctChange > mymarket.change) { mymarket.top = newPctChange; }
						mymarket.change = newPctChange;
						mymarket.last = market.Last;

						for (var purchase of purchases) {
							if (purchase.name === mymarket.name) {
								reportOn(newPctChange,mymarket);
								purchase.change = newPctChange;
							}
						}

						var floatPctChange = parseFloat(newPctChange,10);
						var ceilingDip = parseFloat(mymarket.top,10) - parseFloat(mymarket.change,10);
						var buyDip = (buyThreshold - floatPctChange).toFixed(2);

						if (floatPctChange > sellThreshold) {
							mymarket.st = true;
						}

						if ((floatPctChange > buyThreshold) && !mymarket.bought) {
							mymarket.bought = true;
							buyMarket(mymarket,msTime);
						}

						else if (mymarket.st && (ceilingDip > ceilingThreshold) && mymarket.bought && !mymarket.sold) {
							reporter.info(`${ceilingDip} crossing ceiling threshold dip of ${ceilingThreshold}%, selling for gains...`);
							sellMarket(mymarket,timestamp);
						}

						else if ((buyDip > lossThreshold) && mymarket.bought && !mymarket.sold) {
							reporter.info(`${mymarket.name} at ${newPctChange}% crossing lossThreshold dip of ${lossThreshold}% (${buyDip}%), cutting losses...`);
							sellMarket(mymarket,timestamp);
						}
					}
				}
			}
			myMarkets.sort(function(a,b) { return b.change - a.change});
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
		reporter.info(`${market.name} Crossing 5% gain from ${oldchange}% to ${newchange}%`);
	}
	else if (newchange <= dip5 && oldchange >= dip5) {
		reporter.info(`${market.name} Dipping 5% loss from ${oldchange}% to ${newchange}%`);
	}
	else if (oldchange <= cross10 && newchange >= cross10) {
		reporter.info(`${market.name} Crossing 10% gain from ${oldchange}% to ${newchange}%`);
	}
	else if (newchange <= dip10 && oldchange >= dip10) {
		reporter.info(`${market.name} Dipping 10% loss from ${oldchange}% to ${newchange}%`);
	}
}
// -------------
// Percent difference
// -------------
function pdiff(first,second) {
	var firstN = parseFloat(first,10);
	var secondN = parseFloat(second,10);
	var answer = (((firstN - secondN) * 100) / ((firstN + secondN) / 2)).toFixed(2);
	return parseFloat(answer,10);
}
// -------------
// Buy function
// -------------
function buyMarket(market,msTime,amount) {
	// Will eventually require padding (check next few seconds to make sure correct buy and not a fluke)
	logger.info(`Buying ${market.name} at ${market.change}%`);
	reporter.info(`Buying ${market.name} at ${market.change}%`);
	purchases.push({
		name : market.name,
		amount : 1,
		price : market.last,
		time : msTime,
		change : market.change
	})
}

function asyncKickOffBuy(market,ms) {
	reporter.info(`Buying ${market.name} at ${market.change}%`);
	var timer = setInterval(buyish, 5000);
	var sold = false;
	function buyish() {
		if (sold) {
			clearInterval(timer);
			return;
		}
		bittrex.getticker( { market : market.name } ,function(data) {
			console.log(`Watching ${market.name}...`);
			console.log(data.result.Last);
		})
	}
}
// -------------
// Sell function
// -------------
function sellMarket(market, time) {
	logger.info(`Selling ${market.name} at ${market.change}%`);
	reporter.info(`Selling ${market.name} at ${market.change}%`);
	for (let p=0; p<purchases.length; p++) {
		if (purchases[p].name == market.name) {
			for (var mymarket of myMarkets) {
				if (mymarket.name == market.name) {
					mymarket.sold = true;
					reporter.info(`Current Value: ${market.last}, Bought at: ${purchases[p].price}`);
					reporter.info(`MyCurrt Value: ${mymarket.last}, Bought at: ${purchases[p].price}`);
					var profit = pdiff(market.last, purchases[p].price);
					//var profit = ((market.last - purchases[p].price) * 100 / market.last).toFixed(2);
					logger.info(`Profited ${profit}% from ${mymarket.name}`);
					reporter.info(`Profited ${profit}% from ${mymarket.name}`);
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
			if (typeof(ticker) != undefined) {
				query[name] = ticker.v;
			}
			else {
				query[name] = null;
			}
		}
		topMarketsJson.push(query);
	}

	var historyname = 'b'+buyThreshold+'s'+sellThreshold+'c'+ceilingThreshold+'l'+lossThreshold;

	jsonfile.writeFileSync(`${filename}_history.json`, topMarketsJson);
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