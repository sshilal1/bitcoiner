var fs = require('fs');
const xl = require('excel4node');
var arr = require('./logs/market-history_b30__10.31.117_14.39.33.json');

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
myArr.sort(function(a,b) { return b.change - a.change});

printData();

function printData() {
	var wb = new xl.Workbook();
	var ws = wb.addWorksheet('Sheet 1');

	var totalticks = arr.length;
	for (let j=0; j<totalticks; j++) {
		ws.cell((j+2),1).string(arr[j].time); // write times to the left
	}

	for (let i=0; i<totalticks; i++) {
		for (let q=0; q<10; q++) {
			var myMarket = myArr[q];
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
