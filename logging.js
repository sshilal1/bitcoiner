const logDir = 'logs';
const fs = require('fs');
const winston = require('winston');

// need to further modulate
class log {
	constructor(bt,st,ct,lt) {
		var d = new Date()
		var time = `${d.getHours().toString().padStart(2,0)}.${d.getMinutes().toString().padStart(2,0)}.${d.getSeconds().toString().padStart(2,0)}`;
		this.filename = ('b'+bt+'s'+st+'c'+ct+'l'+lt+'_'+d.getMonth()+1)+'.'+d.getDate()+'.'+d.getYear()+'_'+time;
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
}

module.exports = {log};

/*
var logger = new (winston.Logger)({
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
});*/