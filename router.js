var logHelper = require('./logHelper'),
    lh = new logHelper();

function route(app, express, handle) {
    // console.log(lh.tags.router + "About to route a request for " + pathname);
    app.use('/', express.static(__dirname + '/www'));
    for (var i in handle) {
        app.get(i, handle[i]);
    };
    // app.get('/', handle['/']);
    // app.get('/show', handle['/show']);
};

function socketRoute(io, users, socketHandlers) {
    socketHandlers.prototype = {
        route: function() {
            var that = this;
            this.io.on('connection', function(socket) { // listen on connection event for incoming sockets
                socket.haslogin = false;
                socket.on('login', that.login);
        
                // listen on disconnect event for client disconnect
                socket.on('disconnect', that.disconnect);
        
                socket.on('postMsg', that.postMsg);
        
                socket.on('postImg', that.postImg);
            });
        }
    };

    var socket_handler = new socketHandlers(io, users);
    socket_handler.route();
};
  
  exports.route = route;
  exports.socket_route = socketRoute;