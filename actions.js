const _ = require('lodash');

class bittrexActions {

	constructor(logger,reporter) {
		this.logger = logger;
		this.reporter = reporter;
	}

	buyMarket(market,timestamp,purchases) {
		market.bought = true;
		this.logger.write(`Buying ${market.name} at ${market.change}%`);
		this.reporter.write(`Buying ${market.name} at ${market.change}%`);
		purchases.push({
			name : market.name,
			amount : 1,
			price : market.last,
			time : timestamp,
			change : market.change
		})
	}

	sellMarket(market,timestamp,purchases) {
		market.sold = true;
		var index = _.findIndex(purchases, function(o) { return o.name == market.name; });
		var purchase = purchases[index];

		var profit = market.change - purchase.change;
		this.logger.write(`Selling ${market.name} at ${market.change}%`);
		this.reporter.write(`Selling ${market.name} at ${market.change}%`);
		this.logger.write(`Profited ${profit}% from ${market.name}`);
		this.reporter.write(`Profited ${profit}% from ${market.name}`);

		purchases.splice(index,1);
	}

	updateSellThreshold(market) {
		console.log("updating st...");
		market.st = 20;
	}
}

module.exports = {bittrexActions};