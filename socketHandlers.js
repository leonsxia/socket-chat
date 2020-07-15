var fs = require('fs'),    
    logHelper = require('./logHelper'),
    lh = new logHelper();

function SocketHandler() {
    // private properties
    var _self = this;
    var _users = null;
    var _io = null;
    // private properties

    this.init = function(io, users) { 
        _users = users;
        _io = io;
        // this.users = users;
        this.io = io;
    };

    this.login = function(data) {
        var socket = this;
        if (_users.indexOf(data.nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            // socket.userIndex = _users.length; // for disconnection broadcasting
            socket.nickname = data.nickname;
            socket.haslogin = true;
            _users.push(data.nickname);
            socket.emit('loginSuccess', { userCount: _users.length }); // emit current client
            if (!data.isReconnected) {
                socket.broadcast.emit('system', { nickname: data.nickname, userCount: _users.length, status: 'login' }); // emit all clients except current client
                console.log(lh.tags.socket_handler + 'Event "login" called for user [' + socket.nickname + '] signing in.');
            } else {
                socket.broadcast.emit('system', { nickname: data.nickname, userCount: _users.length, status: 'relogin' }); // emit all clients except current client
                _io.emit('loginAgain', { userCount: _users.length });
                console.log(lh.tags.socket_handler + 'Event "relogin" called for user [' + socket.nickname + '] resigning in.');
            }
        };
    };

    this.disconnect = function() {
        var socket = this;
        if (socket.haslogin) {
            socket.haslogin = false;
            var userIndex = -1;
            for (i = 0; i < _users.length; i++) {
                if (_users[i] === socket.nickname) {
                    userIndex = i;
                }
            }
            _users.splice(userIndex, 1);
            _io.emit('system', { nickname: socket.nickname, userCount: _users.length, status: 'logout' }); // emit all clients
            _io.emit('stopTyping', { nickname: socket.nickname });
            console.log(lh.tags.socket_handler + 'Event "disconnect" called for user [' + socket.nickname + '] signing off.');
        }
    };

    this.postMsg =  function(data) {
        var socket = this;
        socket.broadcast.emit('newMsg', { nickname: socket.nickname, message: data.message, color: data.color }); // emit all clients except current client
    };

    this.postImg = function(data) {
        var socket = this;
        var date = new Date().toTimeString().substr(0, 8).replace(/:/g, '_');
        var des_file = __dirname + '/www/tmp/tmp_' + date + '.jpg';
        var src = '../tmp/tmp_' + date + '.jpg';
        var base64Data = data.stream.replace(/^data:image\/\w+;base64,/, '');
        var dataBuffer = Buffer.from(base64Data, 'base64');
        fs.writeFile(des_file, dataBuffer, function (err) {
            if( err ) {
                console.log( err );
            }
        });
        _io.emit('newImg', { nickname: socket.nickname, src: src, color: data.color });
    };

    this.typing = function(data) {
        var socket = this;
        socket.broadcast.emit('typing', { nickname: socket.nickname, color: data.color });
    };

    this.stopTyping = function() {
        var socket = this;
        socket.broadcast.emit('stopTyping', { nickname: socket.nickname });
    };

    this.socketHandlers = {
        'login': this.login,
        'disconnect': this.disconnect,
        'postMsg': this.postMsg,
        'postImg': this.postImg,
        'typing': this.typing,
        'stopTyping': this.stopTyping
    } 

    // public function
    // return {
    //     init: this.init,
    //     socketHandlers: this.socketHandlers   
    // };    
};

module.exports = SocketHandler;