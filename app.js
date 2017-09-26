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

var gdaxClient = new GdaxClient.authClient(2000);
var bittrexClient = new Bittrex.bittrexClient(60000,1000000,10,20);

app.get('/btcOrders', function(req, res) {
	gdaxClient.getBtcOrders(function(data) { res.send(data) });
})
app.get('/accounts', function(req, res) {
	gdaxClient.getAccounts(function(data) { res.send(data) });
})
app.get('/ticker', function(req,res) {
	bittrexClient.getTicker('usdt-btc', function(data) {
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