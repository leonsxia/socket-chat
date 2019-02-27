var logHelper = require('./logHelper');
var lh = new logHelper();

function start(req, res) {
    console.log(lh.request_handler + "Request handler 'start' was called.");
    app.use('/', express.static(__dirname + '/www'));
    res.sendFile(__dirname + '/www/index.html');
}

exports.start = start;