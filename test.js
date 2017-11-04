const bittrex = require('node-bittrex-api');
const api = require('./api');
bittrex.options({ 
	'apikey' : api.bittrex.key,
	'apisecret' : api.bittrex.secret
});

var options = {
	market: 'BTC-XVC',
	quantity: 20,
	rate: .00003256
}

//var uuid;
/*
bittrex.buylimit(options, function(data) {
	console.log(data);
	uuid = data.result.uuid;
	
	bittrex.getorder({uuid:uuid}, function(res) {
		console.log(res);
	});
});

bittrex.getorder({uuid:uuid}, function(res) {
		console.log(res);
	});
*/
bittrex.getorderhistory({market: 'BTC-XVC'},function(data) {
	var uuid = data.result.OrderUuid;
	console.log(uuid);

	bittrex.cancel({uuid: uuid}, function(dres) {
		console.log(dres);
	})
})

