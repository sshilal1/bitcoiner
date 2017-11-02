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

	buyMarket(market,timestamp,purchases) {
		market.bought = true;
		var purchaseStr = `Buying ${market.name} at ${market.change}%`;
		this.logger.write(purchaseStr);
		this.reporter.write(purchaseStr);
		purchases.push({
			name : market.name,
			amount : 1,
			price : market.last,
			time : timestamp,
			change : market.change
		})

		var buytime = `${hrs(timestamp.substring(0,2))}:${timestamp.substring(2,4)}:${timestamp.substring(4,6)}`;
		var content = `${buytime}  ${purchaseStr}`;

		this.sendEmail(`|**|*Bought ${market.name} *|**|`,content);
	}

	sellMarket(market,timestamp,purchases) {
		market.sold = true;
		var index = _.findIndex(purchases, function(o) { return o.name == market.name; });
		var purchase = purchases[index];

		var profit = (market.change - purchase.change).toFixed(2);
		this.logger.write(`Selling ${market.name} at ${market.change}%`);
		this.reporter.write(`Selling ${market.name} at ${market.change}%`);
		this.logger.write(`Profited ${profit}% from ${market.name}`);
		this.reporter.write(`Profited ${profit}% from ${market.name}`);

		var selltime = `${hrs(timestamp.substring(0,2))}:${timestamp.substring(2,4)}:${timestamp.substring(4,6)}\t\t`;
		var buytime = `${hrs(purchase.time.substring(0,2))}:${purchase.time.substring(2,4)}:${purchase.time.substring(4,6)}\t\t`;
		var content = `${buytime}Initial Buy at ${purchase.change}%\n${selltime}Sold ${market.name} at ${market.change}%\nProfited ${profit}%`;

		this.sendEmail(`|**|*Sold ${market.name} *|**|`,content);

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
	gradientSell(market,time,purchases) {
		var buy = parseInt(this.buy,10);

		if (market.change >= buy+10) {
			market.st = Math.max(market.st, buy);
		}
		if (market.change >= buy+20) {
			market.st = Math.max(market.st, (buy+10));
		}
		if (market.change >= buy+30) {
			market.st = Math.max(market.st, (buy+20));
		}
		if (market.change >= buy+40) {
			market.st = Math.max(market.st, (buy+35));
		}
		if (market.change >= buy+50) {
			market.st = Math.max(market.st, (buy+45));
		}
		if (market.change >= buy+60) {
			market.st = Math.max(market.st, (buy+55));
		}

		if ((market.change <= market.st) && market.bought && !market.sold) {
			this.sellMarket(market,time,purchases);
		}
	}

	updateSellThreshold(market) {
		console.log("updating st...");
		market.st = 20;
	}
}

module.exports = {bittrexActions};