var express = require('express'),
        app = express(),
        router = app.Router(),
        port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, function () {

});
