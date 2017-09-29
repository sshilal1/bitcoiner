// --------------
// User variables
// --------------
var buyThreshold = process.argv[2];
var sellThreshold = process.argv[3];
var lowOrStart = process.argv[4] || "start";
// --------------
var xl = require('excel4node');
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
var filename = (d.getMonth()+1)+'.'+d.getDate()+'.'+d.getYear()+'_'+d.getHours()+'-'+d.getMinutes()+'-'+d.getSeconds()
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
// --------------
// Initial gather
// --------------
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
			bought: false,
			sold: false
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
	bittrex.getmarketsummaries(function(markets) {

		var d = new Date();
		var timestamp = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
		timestampHash[iteration.toString()] = timestamp;

		for (var market of markets.result) {
			for (var mymarket of myMarkets) {
				if (mymarket.name === market.MarketName) {
					var result = (((market.Last - mymarket[lowOrStart]) * 100)/market.Last).toFixed(2);
					mymarket.change = result;
					mymarket.last = market.Last;
					marketHistory[mymarket.name].push({t:iteration,v:mymarket.last});

					for (var purchase of purchases) {
						if (purchase.name === mymarket.name) {
							purchase.change = result;
						}
					}

					if ((parseFloat(result,10) > buyThreshold) && !mymarket.bought) {
						buyMarket(mymarket,timestamp);
					}

					else if ((parseFloat(result,10) > sellThreshold) && mymarket.bought && !mymarket.sold) {
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
	})
},2000);
// -------------
// -------------
// -------------
// -------------
// HELPER FUNCTIONS
// -------------
// -------------
// -------------
// -------------
// Buy function
// -------------
function buyMarket(market,time,amount) {
	// Will eventually require padding (check next few seconds to make sure correct buy and not a fluke)
	logger.info(`Buying ${market.name} at ${market.change}%`);
	for (let m=0; m<myMarkets.length; m++) {
		if (myMarkets[m].name === market.name) {
			myMarkets[m].bought = true;
		}
	}
	purchases.push({
		name : market.name,
		amount : 1,
		price : market.last,
		time : time,
		change : market.change
	})
}
// -------------
// Sell function
// -------------
function sellMarket(market, time) {
	logger.info(`Selling ${market.name} at ${market.change}%`);
	for (let p=0; p<purchases.length; p++) {
		if (purchases[p].name == market.name) {
			for (var mymarket of myMarkets) {
				if (mymarket.name == market.name) {
					mymarket.sold = true;
					var profit = ((mymarket.last - purchases[p].price) * 100 / mymarket.last).toFixed(2);
					logger.info(`Profited ${profit}% from ${mymarket.name}`);
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
keypress(process.stdin);
process.stdin.on('keypress', function (ch, key) {
	if (key && key.name == 'p') {
		printData();
	}
	if (key && key.ctrl && key.name == 'c') {
		process.exit();
	}
});
process.stdin.setRawMode(true);