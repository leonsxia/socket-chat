var logHelper = require('./logHelper'),
    lh = new logHelper(),
    socketHandlers = require('./socketHandlers');

function SocketController() {
    // var _father = new socketHandlers();
    socketHandlers.call(this); // add socketHandlers properties to SocketController
    this.version = '0.1';
    var _father = this; // private property _father refers to this SocketController, this property pass to the return object
    return {
        init: function(io, users) {            
            _father.init(io, users);
            return this;
        },
        route: function() {
            _father.io.on('connection', function(socket) { // listen on connection event for incoming sockets
                socket.haslogin = false;
                var handlers = _father.socketHandlers;
                for (var i in handlers) {
                    socket.on(i, handlers[i]);
                };
            });
        }
    };
};

module.exports = SocketController;