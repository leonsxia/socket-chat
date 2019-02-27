var logHelper = require('./logHelper'),
    lh = new logHelper();

function route(app, express, handle) {
    // console.log(lh.tags.router + "About to route a request for " + pathname);
    app.use('/', express.static(__dirname + '/www'));
    app.get('/', handle['/']);
};

function socketRoute(io, users, socketHandlers) {
    var socket_handler = new socketHandlers(io, users);
    socket_handler.init();
};
  
  exports.route = route;
  exports.socket_route = socketRoute;