var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var users = [];

app.use('/', express.static(__dirname + '/www'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/www/index.html');
 })

server.listen(8080, function() {
    console.log('listening on *:8080');
});

io.on('connection', function(socket) { // listen on connection event for incoming sockets
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length; // for disconnection broadcasting
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess'); // emit current client
            io.sockets.emit('system', nickname, users.length, 'login'); // emit all clients
        };
    });

    // listen on disconnect event for client disconnect
    socket.on('disconnect', function() {
        users.splice(socket.userIndex, 1);
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });

    socket.on('postMsg', function(msg) {
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
});