class bittrexActions {

	constructor(logger,reporter) {
		this.logger = logger;
		this.reporter = reporter;
	}

	buyMarket(market,timestamp,amount) {
		this.logger.write(`Buying ${market.name} at ${market.change}%`);
		this.reporter.write(`Buying ${market.name} at ${market.change}%`);
		return {
			name : market.name,
			amount : 1,
			price : market.last,
			time : timestamp,
			change : market.change
		}
	}

	sellMarket(market,timestamp,purchase) {
		var profit = market.change - purchase.change;
		this.logger.write(`Selling ${market.name} at ${market.change}%`);
		this.reporter.write(`Selling ${market.name} at ${market.change}%`);
		this.logger.write(`Profited ${profit}% from ${market.name}`);
		this.reporter.write(`Profited ${profit}% from ${market.name}`);
	}
}

module.exports = {bittrexActions};