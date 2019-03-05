var logHelper = require('./logHelper'),
    lh = new logHelper(),
    socketHandlers = require('./socketHandlers');

// inherits from SocketHandlers
function SocketController() {
    var _father = new socketHandlers();
    return {
        init: function(io, users) {            
            _father.init(io, users);
            return this;
        },
        route: function() {
            var that = this;
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

SocketController.prototype = {
    
};

module.exports = SocketController;