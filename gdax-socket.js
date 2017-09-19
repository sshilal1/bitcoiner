/*******
We can use a websocket for real time data updates...

However, I still need to figure out the validity of trades,
this socket structure seems to return all types of changes
with real-time updates
******/

const Gdax = require('gdax');
const websocket = new Gdax.WebsocketClient(['ETH-USD']);
const fs = require('fs');

websocket.on('message', data => {
	if (data.type == 'received') {
		var match = /(\d\d)(:\d\d:\d\d)/g.exec(data.time);
		var hours = parseInt(match[1]) - 4;
		var time = hours.toString() + match[2];
		//console.log('ETH-USD: $' + data.price)
		//console.log(data.remaining_size + ' $' + data.price + ' ' + time);
		//console.log(data);
	}
	console.log(data);
	fs.appendFile('message.txt', JSON.stringify(data), (err) => {
	  if (err) throw err;
	});
});
websocket.on('error', err => { /* handle error */ });
websocket.on('close', () => { console.log("closing..."); });