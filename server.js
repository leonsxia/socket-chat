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

io.on('connection', function(socket) {
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
        };
    });
});