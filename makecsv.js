const fs = require('fs');

var filename = 'b30__11.1.117_11.45.30';
var arr = require('./logs/market-history_' + filename + '.json');
var fields = ['time'];
var amountshown = 10;

// --------------
// First, we must grab the last query and sort (bc)
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
// Then, we build our header string
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
