var fs = require('fs');
var jsonlines = require('jsonlines');
var rerun = process.argv[2];

var filepath = '';
//-------------------
// find the file path
//-------------------
var dir = './logs'; // your directory
fs.readdir(dir, function(err, files){
	files = files.map(function (fileName) {
	return {
		name: fileName,
		time: fs.statSync(dir + '/' + fileName).mtime.getTime()
	};
	})
	.sort(function (a, b) {
		return b.time - a.time;
	})
	.filter(function (f) {
		return f.name.includes('report');
	})
	.map(function (v) {
		return v.name;
	})
	filepath = './logs/' + files[0];
	console.log(filepath);

	fs.readFile(filepath, 'utf8', function (err, data) {
	  if (err) throw err;
	  parser.write(data);
	  
	  /*fs.writeFile('test.txt',reportStr, function(error) {
	  	if (error) throw error;
	  })*/
	});
});
//-------------------

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

