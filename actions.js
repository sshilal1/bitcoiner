const _ = require('lodash');
const nodemailer = require('nodemailer');

var hrs = function(hours) {
	var thours = parseInt(hours,10);
	return thours > 12 ? thours - 12 : thours;
}

class bittrexActions {

	constructor(logger,reporter,buythreshold) {
		this.buy = buythreshold;
		this.logger = logger;
		this.reporter = reporter;
		this.transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: "hearth.bitcoiner.bot@gmail.com",
				pass: "ilovehearthstone"
			}
		})
	}

	sendEmail(subject,content) {
		var options = {
			from: "hearth.bitcoiner.bot@gmail.com",
			to: "shilale45@gmail.com,jbraines20@gmail.com,jonathanpstudwell@gmail.com,justin.c.coppola@gmail.com",
			subject: subject,
			text: content
		};

		this.transporter.sendMail(options, (err,data) => {
			if (err) { this.logger.write(err); }
			else { this.logger.write("Email sent: " + data.response); }
		})
	}

	buyMarket(market,timestamp,purchases,rerun) {
		market.bought = true;	
		var buytime = `${hrs(timestamp.substring(0,2))}:${timestamp.substring(2,4)}:${timestamp.substring(4,6)}`;
		var content = `${buytime}  ${purchaseStr}`;

		if (!rerun) {
			var purchaseStr = `Buying ${market.name} at ${market.change}%`;
		}
		else {
			var purchaseStr = `Buying ${market.name} at ${market.change}% timestamp:${buytime}`;
		}

		this.logger.write(purchaseStr);
		this.reporter.write(purchaseStr);

		purchases.push({
			name : market.name,
			amount : 1,
			price : market.last,
			time : timestamp,
			change : market.change
		})

		//this.sendEmail(`|**|*Bought ${market.name} *|**|`,content);
	}

	sellMarket(market,timestamp,purchases,rerun) {
		market.sold = true;
		var index = _.findIndex(purchases, function(o) { return o.name == market.name; });
		var purchase = purchases[index];
		var profit = (market.change - purchase.change).toFixed(2);
		var selltime = `${hrs(timestamp.substring(0,2))}:${timestamp.substring(2,4)}:${timestamp.substring(4,6)}\t\t`;
		var buytime = `${hrs(purchase.time.substring(0,2))}:${purchase.time.substring(2,4)}:${purchase.time.substring(4,6)}\t\t`;
		var content = `${buytime}Initial Buy at ${purchase.change}%\n${selltime}Sold ${market.name} at ${market.change}%\nProfited ${profit}%`;

		if (!rerun) {
			var sellStr = `Selling ${market.name} at ${market.change}%`;
			var profitStr = `Profited ${profit}% from ${market.name}`;
		}
		else {
			var sellStr = `Selling ${market.name} at ${market.change}% timestamp:${selltime}`;
			var profitStr = `Profited ${profit}% from ${market.name} timestamp:${selltime}`;
		}

		this.logger.write(sellStr);
		this.reporter.write(sellStr);
		this.logger.write(profitStr);
		this.reporter.write(profitStr);

		//this.sendEmail(`|**|*Sold ${market.name} *|**|`,content);

		purchases.splice(index,1);
	}

	// **********************
	// **** SELL METHODS ****
	// **********************

	// This method is a sample and just checks if the market is bought, if so, we will sell it
	testSell(market,time,purchases) {
		if (market.bought) {
			this.sellMarket(market,time,purchases);
		}
	}

	// This method uses a gradient scale to set a threshold, then checks for dips less than that threshold
	gradientSell(market,time,purchases,verbose) {
		var buy = parseInt(this.buy,10);

		if (market.change >= buy+10) {
			if (verbose) { this.reporter.write(`Hit buy+10: ${market.change}% - Buy: ${buy} - b+10: ${buy+10}`); }
			market.st = Math.max(market.st, buy);
		}
		if (market.change >= buy+20) {
			if (verbose) { this.reporter.write(`Hit buy+20: ${market.change}% - Buy: ${buy} - b+20: ${buy+20}`); }
			market.st = Math.max(market.st, (buy+10));
		}
		if (market.change >= buy+30) {
			if (verbose) { this.reporter.write(`Hit buy+30: ${market.change}% - Buy: ${buy} - b+30: ${buy+30}`); }
			market.st = Math.max(market.st, (buy+20));
		}
		if (market.change >= buy+40) {
			if (verbose) { this.reporter.write(`Hit buy+40: ${market.change}% - Buy: ${buy} - b+40: ${buy+40}`); }
			market.st = Math.max(market.st, (buy+35));
		}
		if (market.change >= buy+50) {
			if (verbose) { this.reporter.write(`Hit buy+50: ${market.change}% - Buy: ${buy} - b+50: ${buy+50}`); }
			market.st = Math.max(market.st, (buy+45));
		}
		if (market.change >= buy+60) {
			if (verbose) { this.reporter.write(`Hit buy+60: ${market.change}% - Buy: ${buy} - b+60: ${buy+60}`); }
			market.st = Math.max(market.st, (buy+55));
		}

		if ((market.change <= market.st) && market.bought && !market.sold) {
			if (verbose) { this.reporter.write(`Threshold: ${market.st}, ${market.change}%`); }
			this.sellMarket(market,time,purchases);
		}
	}

	updateSellThreshold(market) {
		console.log("updating st...");
		market.st = 20;
	}
}

module.exports = {bittrexActions};