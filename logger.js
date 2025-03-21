var fs = require('fs');
var logDirectory = "./logs";
var logDate = "";

getClientAddress = function (req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
};

var createLogFile = function(situation, date, UTCDateTime){
	var fileExist;
	fs.access(logDirectory + '/'+date+'-log.txt', fs.F_OK, function(err) {
	  fileExist = !err;
	});
	if(fileExist){
		fs.writeFile(logDirectory + '/'+date+'-log.txt', "[" + UTCDateTime + ']: Logfile created on ' + situation + '\r\n', function (err) {
		  if (err) return console.log("Couldnt write files: " + err);
		  console.log('Writing logfile');
		});
	}
	logDate = date;
	/* Make sure we can read and write the log file */
	var rwaccess = "rwaccess";
	fs.access(logDirectory + '/'+date+'-log.txt', fs.R_OK | fs.W_OK, function(err) {
	 (err ? rwaccess = 'no access!' : rwaccess = 'can read/write');
	});
	console.log("Logging: " + rwaccess);
};

var logg = function(info, req){	
	var UTCDateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	fs.appendFile(checkLogDate(), "[" + UTCDateTime + ']: ' + info + (req? ', by: [' + getClientAddress(req) + ']': '') +'\r\n', function (err) {
		if (err) {
  			console.log('ERROR log not saved to: ' + 'logs/'+logDate+'-log.txt');
			throw err;
		}
  		console.log('Logg updated to: ' + 'logs/'+logDate+'-log.txt');
	});
};

var checkLogDate = function(){
	var UTCDateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var today = UTCDateTime.substring(0, 10);
	if(logDate != today)
		createLogFile("Running", today, UTCDateTime);
	return logDirectory + '/'+today+'-log.txt';
};

exports.logg = logg;