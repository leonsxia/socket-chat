var server = require('./server'),
    router = require('./router'),
    requestHandlers = require('./requestHandlers'),
    socketHandlers = require('./socketHandlers');

var handle = {
    '/': requestHandlers.start,
    '/start': requestHandlers.start,
    '/show': requestHandlers.show
};

server.start(router.route, router.socket_route, handle, socketHandlers);