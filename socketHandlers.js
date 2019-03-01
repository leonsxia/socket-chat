var fs = require('fs'),    
    logHelper = require('./logHelper'),
    lh = new logHelper();

function SocketHandler() {
    var _self = this;
    var _users = null;
    var _io = null;

    this.init = function(io, users) { 
        _users = users;
        _io = io;
        this.users = users;
        this.io = io
    };

    this.login = function(nickname) {
        var socket = this;
        if (_users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = _users.length; // for disconnection broadcasting
            socket.nickname = nickname;
            socket.haslogin = true;
            _users.push(nickname);
            socket.emit('loginSuccess'); // emit current client
            _io.emit('system', nickname, _users.length, 'login'); // emit all clients
            console.log(lh.tags.socket_handler + 'Event "login" called for user [' + socket.nickname + '] signing in.');
        };
    };

    this.disconnect = function() {
        var socket = this;
        if (socket.haslogin) {
            _users.splice(socket.userIndex, 1);
            socket.broadcast.emit('system', socket.nickname, _users.length, 'logout'); // emit all clients except current client
            console.log(lh.tags.socket_handler + 'Event "disconnect" called for user [' + socket.nickname + '] signing off.');
        }
    };

    this.postMsg =  function(msg, color) {
        var socket = this;
        socket.broadcast.emit('newMsg', socket.nickname, msg, color); // emit all clients except current client
    };

    this.postImg = function(imgData) {
        var socket = this;
        var date = new Date().toTimeString().substr(0, 8).replace(/:/g, '_');
        var des_file = __dirname + '/www/tmp/tmp_' + date + '.jpg';
        var src = '../tmp/tmp_' + date + '.jpg';
        var base64Data = imgData.replace(/^data:image\/\w+;base64,/, '');
        var dataBuffer = Buffer.from(base64Data, 'base64');
        fs.writeFile(des_file, dataBuffer, function (err) {
            if( err ) {
                console.log( err );
            }
        });
        _io.emit('newImg', socket.nickname, src);
    };

    this.socketHandlers = {
        'login': this.login,
        'disconnect': this.disconnect,
        'postMsg': this.postMsg,
        'postImg': this.postImg
    } 

    // public function
    return {
        init: this.init,
        login: this.login,
        disconnect: this.disconnect,
        postMsg: this.postMsg,
        postImg: this.postImg,
        socketHandlers: this.socketHandlers    
    };    
};

module.exports = SocketHandler;