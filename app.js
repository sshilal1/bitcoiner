// --------------------
// User input variables
// --------------------
// Percent increase threshold to BUY at
const buyThreshold = 1;
// Percent increase threshold to SELL at
const sellThreshold = 4;
// How often to check ticks, default 3 seconds (3000 ms)
const recordInterval = 3000;
// How many times to loop during sanity check
const sanityLoops = 4;
// How many seconds (ms) between loop during sanity check
const sanityMs = 1000;
// --------------------
// --------------------
var express = require('express');
var app = express();
var http = require('http').Server(app);
var xl = require('excel4node');

var Bittrex = require('./bittrex.js');

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
	res.sendFile('index.html', { root : __dirname });
})
app.get('/ticker', function(req,res) {
	bittrexClientTen.getTicker('usdt-btc', function(data) {
		res.send(data);
	})
})
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
			timestamp: tsFormat,
			colorize: true,
			level: 'info'
		}),
    new (winston.transports.File)({
			filename: `${logDir}/${filename}.log`,
			timestamp: tsFormat,
		})
	]
});
/*********
HELPER FNs
**********/
// Finds the percent increase
function pDiff(market) {
	var first = market.start;
	var second = market.last;
	var result = (((first - second) * 100)/first);
	return result.toFixed(2);
}

function buying(market) {
	// Lets do a sanity check for few seconds make sure it wasnt a fluke
	var timesRun = 0;
	var sanity = false;
	var ticks = [];

	runner.notes[market.name] = [];
	runner.notes[market.name].push("Checking sanity for buying " + market.name);
	var interval = setInterval(function(){
		timesRun += 1;
		if(timesRun === sanityLoops){
			if (checkSanity(market.start,ticks)) {
				var logStr = "Buying at " + market.last + ": " + market.change + "% change";
				logger.log('info', logStr);
				runner.notes[market.name].push(logStr);
				runner.bought.push(market.name);
			}
			else {
				console.log("Not buying, was a fluke");
			}

			clearInterval(interval);
		}
		else {
			bittrexApi.getTicker(market.name, function(data) {
				ticks.push(data.result.Last);
				console.log(`Ticks for ${market.name}`, ticks);
			})
		}
	}, sanityMs);
}

function checkSanity(start,ticks) {
	var sum = 0;
	for (var i = 0; i < ticks.length; i++) {
		sum += parseInt(ticks[i], 10);
	}
	var avg = sum / ticks.length;
	var change = (((start - avg) * 100)/start).toFixed(2);
	if (change > buyThreshold) {
		return true;
	}
	else { return false; }
}

function selling(market) {
	runner.notes[market.name] = [];
	runner.notes[market.name].push("Selling at " + market.last + ": " + market.change + "% change");
}

function monitorChange() {
	setInterval(function() {
		if (runner.bought.length != 0) {
			var monitor = {};
			for (var marketname of runner.bought) {
				monitor[marketname] = {
					last : runner.markets[marketname].last,
					change : runner.markets[marketname].change
				}
			}
			logger.log('info', monitor);
		}
	},1000);
}
/****************
// --------------
Begin Application
// --------------
*****************/
var bittrexApi = new Bittrex.bittrexClient(1000000);
var runner = {
	btcValue : 0,
	markets : {},
	notes: {},
	bought: []
}

// Initial gather
bittrexApi.getTicker('usdt-btc', function(data) {
	runner.btcValue = data.result.Last;
	bittrexApi.getMarketSummaries(runner.btcValue, function(markets) {
		runner.markets = markets;
		logger.log('info', runner.markets);
		logger.log('info', "Monitoring " + Object.keys(runner.markets).length + " markets");
	})
})

setInterval(function() {
	bittrexApi.getAverageTicker('usdt-btc', function(data) {
		console.log("Average BTC: ", data);
	})
},5000);

/*
// Interval query
setInterval(function() {
	bittrexApi.getTicker('usdt-btc', function(data) {
		// Set BTC price
		runner.btcValue = data.result.Last;
		
		bittrexApi.getLatestTicks(runner.btcValue, function(ticks) {
			for (var market in ticks) {
				
				// Calc % Increase
				runner.markets[market].change = pDiff(runner.markets[market]);
				// Set new Last
				runner.markets[market].last = ticks[market].last;

				var m = runner.markets[market];
				if (m.change > buyThreshold) {

					// If havent bought yet, lets buy
					if (!runner.notes[m.name]) {
						buying(m);
					}
					// If we have bought, lets see if we should sell
					else {
						if (m.change > sellThreshold) {
							selling(m);
						}
					}
				}
			}
		})
	})
	//logger.log('info', runner.markets);
	//logger.log('info', runner.notes);
}, recordInterval);

// Kick off monitor function
monitorChange();
*/

app.get('/print', function(req,res) {
	// Create a new instance of a Workbook class 
	var wb = new xl.Workbook();
	var ws = wb.addWorksheet('Test1');

	// Create a reusable style 
	var style = wb.createStyle({
	    font: {
	        color: '#FF0800',
	        size: 12
	    }
	});

	// Set value of cell A1 to 100 as a number type styled with paramaters of style 
	ws.cell(1,1).number(100).style(style);

	wb.write('Report.xlsx');
})

http.listen(3000, function(){
	logger.log('info', 'listening on *:3000');
});