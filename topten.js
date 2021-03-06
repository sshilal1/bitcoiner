var fs = require('fs');
const xl = require('excel4node');
const _ = require('lodash');
var jsonlines = require('jsonlines');

var filename = 'b30__11.2.117_09.31.23';

var reportpath = './logs/' + filename + '_report.log';
var arr = require('./logs/market-history_' + filename + '.json');

var bought = [];
var parser = jsonlines.parse();
var reportStr = '';

fs.readFile(reportpath, 'utf8', function (err, data) {
	if (err) throw err;
	parser.write(data);

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
	newArr = _.uniqBy(newArr, 'name');

	printData(newArr);
});

parser.on('data', function (data) {
	var regex = /(BTC-\w+)/g;
	var match = regex.exec(data.message);
	if (match != null) {
		//console.log(match[0]);
		bought.push(match[0]);
	}
})

function printData(newArr) {
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
	wb.write('./logs/' + filename + '_report.xlsx');
}