const logDir = 'logs';
const fs = require('fs');
const _ = require('lodash');
const winston = require('winston');

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir);
}

class log {
	constructor(bt) {
		var d = new Date()
		var time = `${d.getHours().toString().padStart(2,0)}.${d.getMinutes().toString().padStart(2,0)}.${d.getSeconds().toString().padStart(2,0)}`;
		this.filename = 'b'+bt+'__'+(d.getMonth()+1)+'.'+d.getDate()+'.'+d.getYear()+'_'+time;
	}

	// create the log file
	create(name) {
		var logType = name ? (`_${name}.log`) : '.log';
		var filename = this.filename;
		var tsFormat = () => (new Date()).toLocaleString();

		console.log("Creating log file: ", filename);

		this.logger = new (winston.Logger)({
			transports: [
				new (winston.transports.File)({
					filename: `${logDir}/${filename}${logType}`,
					timestamp: tsFormat,
				})
			]
		})
	}

	write(message) {
		this.logger.info(message);
	}

	printLeaders(markets,leaders) {
		var longLeaderString = "Leaders: ";
		for (let i=0; i<leaders; i++) {			
			var leaderStr = `${markets[i].change}% - ${markets[i].name}`;	
			{ longLeaderString += leaderStr + " | "; }
		}
		this.logger.info(longLeaderString);
	}

	printBought(markets,purchases) {
		if (purchases.length > 0) {
			var purchaseStr = "Bought : ";
			for (var purchase in purchases) {
				purchaseStr += `${purchases[purchase].change}% - ${purchases[purchase].name} | `;
			}
			this.logger.info(purchaseStr);
		}
	}
}

class consoleLog {
	constructor(bt) {
		var d = new Date()
		var time = `${d.getHours().toString().padStart(2,0)}.${d.getMinutes().toString().padStart(2,0)}.${d.getSeconds().toString().padStart(2,0)}`;
		this.filename = 'b'+bt+'__'+(d.getMonth()+1)+'.'+d.getDate()+'.'+d.getYear()+'_'+time;
	}

	// create the log file
	create(name) {
		var logType = name ? (`_${name}.log`) : '.log';
		var filename = this.filename;
		var tsFormat = () => (new Date()).toLocaleString();

		console.log("Creating log file: ", filename);

		this.logger = new (winston.Logger)({
			transports: [
				new (winston.transports.Console)({
					colorize: true,
					level: 'info'
				}),
				new (winston.transports.File)({
					filename: `${logDir}/${filename}.log`,
					timestamp: tsFormat,
				})
			]
		})
	}

	write(message) {
		this.logger.info(message);
	}

	printLeaders(markets,leaders) {
		var longLeaderString = "Leaders: ";
		for (let i=0; i<leaders; i++) {			
			var leaderStr = `${markets[i].change}% - ${markets[i].name}`;	
			{ longLeaderString += leaderStr + " | "; }
		}
		this.logger.info(longLeaderString);
	}

	printBought(markets,purchases) {
		if (purchases.length > 0) {
			var purchaseStr = "Bought : ";
			for (var purchase in purchases) {
				purchaseStr += `${purchases[purchase].change}% - ${purchases[purchase].name} | `;
			}
			this.logger.info(purchaseStr);
		}
	}

}

function printBought(logger,markets,purchases) {

}

module.exports = {log, consoleLog};