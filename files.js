var dir = './logs'; // your directory
var fs = require('fs');
var myFile;

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
	myFile = files[0]
	console.log(myFile);
}); 