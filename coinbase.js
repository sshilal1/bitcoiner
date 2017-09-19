const coinbase = require('coinbase');

const apiURI = 'https://api.gdax.com';
const coinbaseURI = 'https://api.coinbase.com/v2/users/:' + accountID;

var client   = new coinbase.Client({'apiKey': key, 'apiSecret': b64secret});

client.getAccounts({}, function(err, accounts) {
  accounts.forEach(function(acct) {
    console.log('my bal: ' + acct.balance.amount + ' for ' + acct.name);
  });
});
