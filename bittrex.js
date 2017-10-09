var request = require('request-promise');
var assign = require('object-assign');
var hmac_sha512 = require('./lib/hmac-sha512.js');

const api = require('./api');

var default_request_options = {
	method: 'GET',
	agent: false,
	headers: {
		'User-Agent': 'Mozilla/4.0 (compatible; Node Bittrex API)',
		'Content-type': 'application/json'
	}
};

class bittrexApi {
	constructor() {
		this.markets = [];
		this.baseUrl = 'https://bittrex.com/api/v1.1';
		this.apikey = api.bittrex.key;
		this.secret = api.bittrex.secret;
	}

	getmarketsummaries () {
		var uri = this.baseUrl + '/public/getmarketsummaries';
		var op = assign({}, default_request_options);
		op.uri = uri;

		request(uri)
		.then(function(data) {
			var json = JSON.parse(data);
			console.log(json.result);
		})
	}

	getbalances () {
		var nonce = new Date().getTime();
		var uri = this.baseUrl + '/account/getbalances?apikey=' + this.apikey + '&nonce=' + nonce;
		var op = assign({}, default_request_options);
		op.headers.apisign = hmac_sha512.HmacSHA512(uri, this.secret); // setting the HMAC hash `apisign` http header
    op.uri = uri;

    request(op)
	    .then(function(data) {
	    	var json = JSON.parse(data);
	    	console.log(json.result);
	    })
	}
}

async function awaitFunctionTest () {
	const api = new bittrexApi()
	var ourMarkets = await api.getbalances();
	var summaries = await api.getmarketsummaries();
	//console.log(ourMarkets[0]);
}
awaitFunctionTest();