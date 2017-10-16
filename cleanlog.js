var fs = require('fs');
var jsonlines = require('jsonlines')

var filepath = './logs/10.2.117__b5s10c2__16-3-15.log';

var parser = jsonlines.parse();
var reportStr = '';

parser.on('data', function (data) {
	var time = data.timestamp.substring(data.timestamp.length - 8);
	reportStr += time + ' --- ' + data.message + '\n';
  console.log(time + ' --- ' + data.message);
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