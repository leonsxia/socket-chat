var server = require('./server'),
    router = require('./router'),
    requestHandlers = require('./requestHandlers'),
    socketHandlers = require('./socketHandlers');

var handle = {
    '/': requestHandlers.start,
    '/start': requestHandlers.start,
    '/show': requestHandlers.show
};

// var socket_handle = {
//     'login': socketHandlers.login,
//     'disconnect': socketHandlers.disconnect,
//     'postMsg': socketHandlers.postMsg,
//     'postImg': socketHandlers.postImg
// };

server.start(router.route, router.socket_route, handle, socketHandlers);