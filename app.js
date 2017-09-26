var express = require('express');
var app = express();
var http = require('http').Server(app);
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

http.listen(3000, function(){
	console.log('listening on *:3000');
});