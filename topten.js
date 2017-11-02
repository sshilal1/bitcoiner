var fs = require('fs');
const xl = require('excel4node');
var arr = require('./logs/market-history_b30__11.1.117_23.22.17.json');
var bought = ['BTC-SYNX','BTC-PART'];

var amountToShow = 10;
var i_show = amountToShow - 1;

var myArr = [];

var arrlen = arr.length;
var lastquery = arr[arrlen-1];

for (var market in lastquery) {
	if (market != 'time') {
		var obj = {
			name : market,
			change : lastquery[market]
		}
		myArr.push(obj);
	}
}

myArr.sort(function(a,b) { return b.change - a.change });

var finArr = [];
var myarrlen = myArr.length;
for (let p=i_show; p<myarrlen; p++) {
	for (var mark of bought) {
		if (myArr[p].name == mark) {
			finArr.push(myArr[p]);
		}
	}
}

var newArr = myArr.slice(0,amountToShow);
newArr = newArr.concat(finArr);

/*for (let k=0; k<newArr.length; k++) {
	console.log(newArr[k].name);
}*/

printData();

function printData() {
	var wb = new xl.Workbook();
	var ws = wb.addWorksheet('Sheet 1');

	var totalticks = arr.length;
	for (let j=0; j<totalticks; j++) {
		ws.cell((j+2),1).string(arr[j].time); // write times to the left
	}

	for (let i=0; i<totalticks; i++) {
		for (let q=0; q<newArr.length; q++) {
			var myMarket = newArr[q];
			ws.cell(1,(q+2)).string(myMarket.name); // write names to top

			for (var market in arr[i]) {
				if (market == myMarket.name) {
					ws.cell((i+2),(q+2)).number(arr[i][market]);
				}
			}
		}
	}
	wb.write('report.xlsx');
}