// need to pass in the winston log so we can write with it

class bittrexActions {

	constructor() {
		super();
	}

	buyMarket() {
		console.log("buying market");
	}

	sellMarket() {
		console.log("selling market");
	}
}

module.exports = {bittrexActions};