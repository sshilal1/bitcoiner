const buyThreshold = .5;
const recordInterval = 60000 * 5; // 5 minutes

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
/*********
HELPER FNs
**********/
// Finds the percent increase
function pDiff(market) {
	var first = market.start;
	var second = market.last;
	var result = (((first - second) * 100)/first);
	return result.toFixed(3);
}

/******
BITTREX
*******/
var bittrexClient = new Bittrex.bittrexClient(1000000);
var runner = {
	btcValue : 0,
	markets : {},
	notes: []
}

// Initial gather
bittrexClient.getTicker('usdt-btc', function(data) {
	runner.btcValue = data.result.Last;
	bittrexClient.getMarketSummaries(runner.btcValue, function(markets) {
		runner.markets = markets;
		console.log(runner.markets);
		console.log("Monitoring " + Object.keys(runner.markets).length + " markets");
	})
})

// Interval query
setInterval(function() {
	bittrexClient.getTicker('usdt-btc', function(data) {
		
		// Set BTC price
		runner.btcValue = data.result.Last;
		
		bittrexClient.getLatestTicks(runner.btcValue, function(ticks) {
			for (var market in ticks) {
				
				// Calc % Increase
				runner.markets[market].change = pDiff(runner.markets[market]);

				// If greater than threshold, buy
				if (runner.markets[market].change > buyThreshold) {
					var logStr = "Buying " + runner.markets[market].name + " at " + runner.markets[market].last;
					runner.notes.push(logStr);
				}
				
				// Set new Last
				runner.markets[market].last = ticks[market].last;
			}
		})
	})
	//console.log(runner.markets);
	console.log(runner.notes);
}, 3000);

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
	console.log('listening on *:3000');
});