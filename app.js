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

bittrex.getmarketsummaries(function(data) {
	console.log(data.result);
})