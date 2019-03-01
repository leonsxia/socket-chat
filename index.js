var server = require('./server'),
    router = require('./router'),
    requestHandlers = require('./requestHandlers'),
    socketController = require('./socketController');

var httphandle = {
    '/': requestHandlers.start,
    '/start': requestHandlers.start,
    '/show': requestHandlers.show
};

server.start(router.http_route, router.socket_route, httphandle, socketController);