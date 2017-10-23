var _ = require('lodash');
var historyFileName = './logs/market-history_10.22.117__b30s50c7__14-27-26.json';

var arr = require(historyFileName);

var ind = _.findIndex(arr, function(o) { return o.time == 50001; });
console.log(ind);

var loopamounts = ind+10;
for(i=ind; i<loopamounts; i++) {
	console.log(arr[i]['ETH-GNO'])
}