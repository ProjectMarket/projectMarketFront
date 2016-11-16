var express = require('express'),
	app = express(),
	port = process.env.PORT || 8080;

app.get('/', function(req, res) {
	res.sendFile(__dirname+'/index.html');
});

app.listen(port, function() {

});