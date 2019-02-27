var logHelper = require('./logHelper'),
    lh = new logHelper();

var SocketHandler = function(io, users) {
    this.users = users;
    this.io = io;
}

SocketHandler.prototype = {
    init: function() {
        var that = this;
        this.io.on('connection', function(socket) { // listen on connection event for incoming sockets
            socket.on('login', function(nickname) {
                if (that.users.indexOf(nickname) > -1) {
                    socket.emit('nickExisted');
                } else {
                    socket.userIndex = that.users.length; // for disconnection broadcasting
                    socket.nickname = nickname;
                    that.users.push(nickname);
                    socket.emit('loginSuccess'); // emit current client
                    that.io.emit('system', nickname, that.users.length, 'login'); // emit all clients
                };
            });
    
            // listen on disconnect event for client disconnect
            socket.on('disconnect', function() {
                that.users.splice(socket.userIndex, 1);
                socket.broadcast.emit('system', socket.nickname, that.users.length, 'logout'); // emit all clients except current client
            });
    
            socket.on('postMsg', function(msg) {
                socket.broadcast.emit('newMsg', socket.nickname, msg); // emit all clients except current client
            });
    
            socket.on('img', function(imgData) {
                socket.broadcast.emit('newImg', socket.nickname, imgData);
            });
        });
    }
};

function login(nickname) {
    if (users.indexOf(nickname) > -1) {
        socket.emit('nickExisted');
    } else {
        socket.userIndex = users.length; // for disconnection broadcasting
        socket.nickname = nickname;
        users.push(nickname);
        socket.emit('loginSuccess'); // emit current client
        io.emit('system', nickname, users.length, 'login'); // emit all clients
    };
};

function disconnect() {
    users.splice(socket.userIndex, 1);
    socket.broadcast.emit('system', socket.nickname, users.length, 'logout'); // emit all clients except current client
};

function postMsg() {
    users.splice(socket.userIndex, 1);
    socket.broadcast.emit('system', socket.nickname, users.length, 'logout'); // emit all clients except current client
}

function postImg() {
    users.splice(socket.userIndex, 1);
    socket.broadcast.emit('system', socket.nickname, users.length, 'logout'); // emit all clients except current client
}

module.exports = SocketHandler;