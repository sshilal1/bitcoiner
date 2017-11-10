const fs = require('fs');
const jsonlines = require('jsonlines');
const _ = require('lodash');
var parser = jsonlines.parse();

var amountshown = 10;
var filename = 'b30__11.1.117_11.45.30';

var arr = require('./logs/market-history_' + filename + '.json');
var reportpath = './logs/' + filename + '_report.log';
var fields = ['time'];

// --------------
// First, lets search the report for any bought markets
// --------------
fs.readFile(reportpath, 'utf8', function (err, data) {
	if (err) throw err;
	parser.write(data);
	// --------------
	// Then, we must grab the last query and sort
	// --------------
	var arrlen = arr.length;
	var lastquery = arr[arrlen-1];
	var sortedquery = [];
	for (var market in lastquery) {
		var obj = {
			name : market,
			change : lastquery[market]
		}
		sortedquery.push(obj);
	}
	sortedquery.sort(function(a,b) { return b.change - a.change });
	// --------------
	// Now that we have sorted, lets grab top 10
	// --------------
	var sortlen = sortedquery.length;
	for (let t=1; t < amountshown + 1; t++) {
		fields.push(sortedquery[t].name)
	}
	// --------------
	// Using Lodash, clear out doubles
	// --------------
	fields = _.uniq(fields);
	// --------------
	// Next, we build our header string
	// --------------
	var header = "";
	var found = 0;
	for (var field of fields) {
		header += field;
		found++;
		if (found < fields.length) {
			header += ',';
		}
	}
	// --------------
	// Write header to file
	// --------------
	fs.appendFileSync('testing.csv', `${header}\n`);
	// --------------
	// Go through loop and write rest to file
	// --------------
	for (let i=0; i<arrlen; i++) {
		var linestring = "";
		var found = 0;
		for (var field of fields) {
			linestring += arr[i][field];
			found++;
			if (found < fields.length) {
				linestring += ',';
			}
		}
		fs.appendFileSync('testing.csv', `${linestring}\n`);
	}
	// --------------
	// --------------
});

parser.on('data', function (data) {
	var regex = /(BTC-\w+)/g;
	var match = regex.exec(data.message);
	if (match != null) {
		fields.push(match[0]);
	}
})
// --------------
// --------------