var express = require('express');
var app = express();
var http = require('http');
var url = require('url');
var socket = require('socket.io');
var logHelper = require('./logHelper');
var lh = new logHelper();
var users = [];

function start(route, handle) {

    function onRequest(req, res) {
        var pathname = url.parse(req.url).pathname;
        console.log(lh.tags.server + "Request for " + pathname + " received.");
        route(handle, pathname, app, express, req, res);
    };

    // app.get('/', function (req, res) {
    //     res.sendFile(__dirname + '/www/index.html');
    // }); 

    var server = http.createServer(onRequest).listen(8080, function() {
        console.log(lh.tags.server + 'Listening on *:8080');
    });

    var io = socket(server);

    io.on('connection', function(socket) { // listen on connection event for incoming sockets
        socket.on('login', function(nickname) {
            if (users.indexOf(nickname) > -1) {
                socket.emit('nickExisted');
            } else {
                socket.userIndex = users.length; // for disconnection broadcasting
                socket.nickname = nickname;
                users.push(nickname);
                socket.emit('loginSuccess'); // emit current client
                io.emit('system', nickname, users.length, 'login'); // emit all clients
            };
        });

        // listen on disconnect event for client disconnect
        socket.on('disconnect', function() {
            users.splice(socket.userIndex, 1);
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout'); // emit all clients except current client
        });

        socket.on('postMsg', function(msg) {
            socket.broadcast.emit('newMsg', socket.nickname, msg); // emit all clients except current client
        });

        socket.on('img', function(imgData) {
            socket.broadcast.emit('newImg', socket.nickname, imgData);
        });
    });
}

exports.start = start;
