var _ = require('lodash');
var historyFileName = './logs/market-history_10.22.117__b30s50c7__14-27-26.json';

var arr = require(historyFileName);

var ind = _.findIndex(arr, function(o) { return o.time == 50001; });
console.log(ind);

var loopamounts = ind+10;
for(i=ind; i<loopamounts; i++) {
	console.log(arr[i]['ETH-GNO'])
}

function findData(name, starttime, range, filename) {

	var arr = require(filename);

	var index = _.findIndex(arr, function(o) { return o.time == 50001; });

	var loops = index+range;

	for (let i=index; i<loops; i++) {
		var iteration = arr[i];
		var percent = 46;

		var returnStr = `${name} - ${percent}% - (${iteration[name]})`;

		console.log(returnStr);
	}
}