var express = require('express');
var app = express();
var http = require('http').Server(app);
var GdaxClient = require('./gdax-client.js');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile('index.html', { root : __dirname });
})

var client = new GdaxClient.authClient(2000);

app.get('/btcOrders', function(req, res) {
	client.getBtcOrders(function(data) { res.send(data) });
})
app.get('/accounts', function(req, res) {
	client.getAccounts(function(data) { res.send(data) });
})

http.listen(3000, function(){
	console.log('listening on *:3000');
});