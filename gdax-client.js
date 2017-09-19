/*******
PUBLIC ENDPOINTS
We throttle public endpoints by IP: 3 requests per second, up to 6 requests per second in bursts.

PRIVATE ENDPOINTS
We throttle private endpoints by user ID: 5 requests per second, up to 10 requests per second in bursts.
******/

const Gdax = require('gdax');
const api = require('./api');

const apiURI = 'https://api.gdax.com';
const callback = (err, response, data) => { console.log(data) }; 

const authedClient = new Gdax.AuthenticatedClient(api.gdax.key, api.gdax.secret, api.gdax.pass, apiURI);
//authedClient.getAccounts(callback);

const buyParams = {
  'price': '4027.4', // USD
  'size': '.01',  // BTC
  'product_id': 'BTC-USD',
};
//authedClient.buy(buyParams, callback);

authedClient.getOrders(callback);
//authedClient.cancelAllOrders({product_id: 'BTC-USD'}, callback);