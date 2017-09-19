const coinbase = require('coinbase');
const api = require('./api');

const apiURI = 'https://api.gdax.com';
const coinbaseURI = 'https://api.coinbase.com/v2/users/:' + api.acctId;

var client   = new coinbase.Client({'apiKey': api.key, 'apiSecret': api.secret});

client.getAccounts({}, function(err, accounts) {
  accounts.forEach(function(acct) {
    console.log('my bal: ' + acct.balance.amount + ' for ' + acct.name);
  });
});
