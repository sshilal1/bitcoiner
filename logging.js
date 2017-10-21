
const logDir = 'logs';
const fs = require('fs');
const winston = require('winston');


// need to further modulate
class mylog {
	constructor(bt,st,ct,lt) {
		var d = new Date()
		var time = `${d.getHours().toString().padStart(2,0)}.${d.getMinutes().toString().padStart(2,0)}.${d.getSeconds().toString().padStart(2,0)}`;
		this.filename = ('b'+bt+'s'+st+'c'+ct+'l'+lt+'_'+d.getMonth()+1)+'.'+d.getDate()+'.'+d.getYear()+'_'+time;
	}

	// create the log file
	create() {

	}

	// everytime we want to write to the file
	write(str) {

	}
}

module.exports = {mylog};
