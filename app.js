var express = require('express');
var app = express();
var http = require('http').Server(app);
var xl = require('excel4node');

var GdaxClient = require('./gdax-client.js');
var Bittrex = require('./bittrex.js');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile('index.html', { root : __dirname });
})

/***
GDAX
****/
var gdaxClient = new GdaxClient.authClient(2000);

app.get('/btcOrders', function(req, res) {
	gdaxClient.getBtcOrders(function(data) { res.send(data) });
})
app.get('/accounts', function(req, res) {
	gdaxClient.getAccounts(function(data) { res.send(data) });
})

/******
BITTREX
*******/
// Start a few clients to compare
var recordInterval = 60000 * 5; // 5 minutes
var bittrexClient = new Bittrex.bittrexClient(1000000,10,25);
var bcTen = {};

setInterval(function() {
	bittrexClient.getTicker('usdt-btc', function(data) {
		bcTen.btcValue = data.result.Last;
		bittrexClient.getMarketSummaries(bcTen.btcValue, function(markets) {
			if (!bcTen.markets)
			for (let m=0; m<markets.length; m++) {

			}
			bittrexClient.getPercentIncrease(markets, function(updatedMarkets) {
				bcTen.markets = updatedMarkets;
			})
		})
	})
	console.log(bcTen.markets);
}, 1000);





app.get('/ticker', function(req,res) {
	bittrexClientTen.getTicker('usdt-btc', function(data) {
		res.send(data);
	})
})

app.get('/print', function(req,res) {
	// Create a new instance of a Workbook class 
	var wb = new xl.Workbook();
	var ws = wb.addWorksheet('Sheet 1');

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