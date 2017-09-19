const Gdax = require('gdax');

const product = 'ETH-USD';
const api = 'https://api.gdax.com';
const publicClient = new Gdax.PublicClient(product, api);

var sample = {
	trade_id: 11054329,
  price: '289.37000000',
  size: '22.29620345',
  bid: '289.37',
  ask: '289.38',
  volume: '301367.52246152',
  time: '2017-09-19T02:16:24.475000Z'
};

const callback = (err, response, data) => { console.log(data); };

//publicClient.getProducts(callback);
//publicClient.getProductOrderBook(callback);
//publicClient.getProductOrderBook({'level': 1}, callback);
//publicClient.getProductTrades(callback);
