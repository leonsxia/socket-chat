var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    logHelper = require('./logHelper'),
    lh = new logHelper(),
    users = [];

function start(route, socket_route, handle, socketHandlers) {

    route(app, express, handle);
    socket_route(io, users, socketHandlers);

    server.listen(8080, function() {
        console.log(lh.tags.server + 'Listening on *:8080');
    });
}

exports.start = start;
