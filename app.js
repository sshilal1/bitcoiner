var express = require('express');
var app = express();
var http = require('http').Server(app);
var GdaxTicker = require('./gdax-client.js');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile('index.html', { root : __dirname });
})

var client = new GdaxTicker.authClient(2000);

app.get('/data', function(req, res) {
	var orders = client.getBtcOrders();
	console.log("orders: ",orders);
	res.send(orders);
})

http.listen(3000, function(){
	console.log('listening on *:3000');
});