// --------------------
// All native API calls
// --------------------
/**********************
PUBLIC
getmarkets
getcurrencies
getmarketsummaries
getticker: /options
getcandles: /options
getorderbook: /options
getmarketsummary: /options
getmarkethistory: /options

AUTHED
getbalances
buylimit: /options
selllimit: /options
buymarket: /options
sellmarket: /options
tradebuy: /options
tradesell: /options
cancel: /options
getopenorders: /options
getbalance: /options
getwithdrawalhistory: /options
getdepositaddress: /options
getdeposithistory: /options
getorderhistory: /options
getorder: /options
withdraw: /options

EXAMPLE W/ OPTIONS
bittrex.getmarkethistory( { market : 'BTC-LTC' }, function( data ) {
  console.log( data.result );
});
/**********************/
// --------------------
// --------------------
const bittrex = require('node-bittrex-api');
const api = require('./api');

bittrex.options({ 
	'apikey' : api.bittrex.key,
	'apisecret' : api.bittrex.secret
});

bittrex.getbalances(function(data) {
	console.log(data);
})

class bittrexApi {
	constructor() {
		this.markets = [];
	}

	getSummaries () {
		return new Promise((resolve, reject) => {
			bittrex.getmarketsummaries(function(data) {
				for (let market of data.result) {
					var obj = {
						name: market.MarketName,
						start: market.Last,
						last: market.Last,
						ask: market.Ask,
						low: market.Low
					}
					var newPctChange = (((market.Last - market.Low) * 100)/market.Last).toFixed(2);
					obj.change = newPctChange;
					this.markets.push(obj);
				}
				resolve(this.markets);
			})
		})
	}
}

async function awaitFunctionTest () {
	const api = new bittrexApi()
	var ourMarkets = await api.getSummaries();
	console.log(ourMarkets[0]);
}

awaitFunctionTest();