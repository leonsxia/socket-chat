var logHelper = require('./logHelper'),
    lh = new logHelper();

function httpRoute(app, express, handle) {
    // console.log(lh.tags.router + "About to route a request for " + pathname);
    app.use('/', express.static(__dirname + '/www'));
    for (var i in handle) {
        app.get(i, handle[i]);
    };
    // app.get('/', handle['/']);
    // app.get('/show', handle['/show']);
};

function socketRoute(io, users, socketController) {
    var socket_controller = new socketController();
    socket_controller.init(io, users).route();
};
  
  exports.http_route = httpRoute;
  exports.socket_route = socketRoute;