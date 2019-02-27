var logHelper = require('./logHelper'),
    lh = new logHelper();

function start(req, res) {
    console.log(lh.request_handler + "Request handler 'start' was called.");    
    res.sendFile(__dirname + '/www/index.html');
};

exports.start = start;