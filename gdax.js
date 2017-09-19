const Gdax = require('gdax');
const api = require('./api');

const apiURI = 'https://api.gdax.com';
const callback = (err, response, data) => { console.log(data) }; 

const authedClient = new Gdax.AuthenticatedClient(api.gdax.key, api.gdax.secret, api.gdax.pass, apiURI);
authedClient.getAccounts(callback);