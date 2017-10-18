var fs = require('fs');
var jsonlines = require('jsonlines');

var rerun = process.argv[2];

var filepath = './logs/10.18.117__b3s5c2__15-28-53__report.log';

var parser = jsonlines.parse();
var reportStr = '';

parser.on('data', function (data) {
	if (rerun == 'rerun') {
		var regex = /(.+) timestamp:(.*)/g;
		var match = regex.exec(data.message);
		var time = match[2];
		var message = match[1];
		reportStr += time + ' --- ' + message + '\n';
	  console.log(time + ' --- ' + message);
	}
	else {
		var time = data.timestamp.substring(data.timestamp.length - 8);
		reportStr += time + ' --- ' + data.message + '\n';
	  console.log(time + ' --- ' + data.message);
	}
})

parser.on('end', function () {
  console.log('No more data');
})

fs.readFile(filepath, 'utf8', function (err, data) {
  if (err) throw err;
  parser.write(data);
  fs.writeFile('test.txt',reportStr, function(error) {
  	if (error) throw error;
  })
});