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
// Start a few clients to compare
var recordInterval = 60000 * 5; // 5 minutes
var bittrexClient = new Bittrex.bittrexClient(7000000,10,25);
var bcTen = {
	btcValue : 0,
	markets : {}
}

// Initial gather
bittrexClient.getTicker('usdt-btc', function(data) {
	bcTen.btcValue = data.result.Last;
	bittrexClient.getMarketSummaries(bcTen.btcValue, function(markets) {
		bcTen.markets = markets;
		console.log(bcTen.markets);
	})
})

// Interval query
setInterval(function() {
	bittrexClient.getTicker('usdt-btc', function(data) {
		// Set BTC price
		bcTen.btcValue = data.result.Last;
		bittrexClient.getLatestTicks(bcTen.btcValue, function(ticks) {
			for (var market in ticks) {
				// Calc % Increase
				bcTen.markets[market].change = pDiff(bcTen.markets[market]);
				// Set new Last
				bcTen.markets[market].last = ticks[market].last;
			}
		})
	})
	console.log(bcTen.markets);
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
	    },
	    numberFormat: '$#,##0.00; ($#,##0.00); -'
	});
	 
	// Set value of cell A1 to 100 as a number type styled with paramaters of style 
	ws.cell(1,1).number(100).style(style);

	wb.write('Report.xlsx');
})

http.listen(3000, function(){
	console.log('listening on *:3000');
});