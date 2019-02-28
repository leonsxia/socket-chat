var logHelper = require('./logHelper'),
    lh = new logHelper();

function start(req, res) {
    console.log(lh.tags.request_handler + 'Request handler "start" was called.');    
    res.sendFile(__dirname + '/www/index.html');
};

function show(req, res) {
    console.log(lh.tags.request_handler + 'Request handler "show" was called.');  
    res.send('<img src=' + req.query.src + '>');
}

exports.start = start;
exports.show = show;