const bittrex = require('node-bittrex-api');
const fs = require('fs');

bittrex.getmarketsummaries(function(markets) {

	var d = new Date();
	var timestampi = `${d.getHours().toString().padStart(2,0)}${d.getMinutes().toString().padStart(2,0)}${d.getSeconds().toString().padStart(2,0)}`;

	var count = 0;
	var wholeArr = [];
	var init = {
		time : timestampi
	}
	for (var market of markets.result) {
		if (count < 10) {
			init[market.MarketName] = market.Last;
			count++;
		}
	}
	wholeArr.push(init);

	fs.writeFile("write.json", JSON.stringify(wholeArr), (err) => {
		if (err) throw err;
	})

})

setInterval(function() {
	bittrex.getmarketsummaries(function(markets) {
		var d = new Date();
		var timestamp = `${d.getHours().toString().padStart(2,0)}${d.getMinutes().toString().padStart(2,0)}${d.getSeconds().toString().padStart(2,0)}`;

		var count = 0;
		var obj = {
			time : timestamp
		}
		for (var market of markets.result) {
			if (count < 10) {
				obj[market.MarketName] = market.Last;
				count++;
			}
		}

		var arr = require('./write.json');
		arr.push(obj);
		fs.writeFile("write.json", JSON.stringify(arr), (err) => {
			if (err) throw err;
			console.log("wrote data at ", timestamp);
		})
	})
},3000);