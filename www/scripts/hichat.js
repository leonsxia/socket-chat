$(function() {
    var hichat = new HiChat();
    hichat.init();
})

var HiChat = function() {
    this.socket = null;
};

HiChat.prototype = {
    init: function() {
        var that = this;
        // this.socket = io.connect();
        this.socket = io();
        this.socket.on('connect', function() {
            $('#info').text('get yourself a nickname :)');
            $('#nickWrapper').css({'display': 'block'});
            $('#nicknameInput').focus();
        });

        $('#loginBtn').on('click', function() {
            var nickname = $('#nicknameInput').val();
            if (nickname.trim().length != 0) {                
                that.socket.emit('login', nickname);
            } else {
                $('#nicknameInput').focus();
            };
        });

        this.socket.on('nickExisted', function() {
            $('#info').text('nickname is taken, choose another pls');
        });

        this.socket.on('loginSuccess', function() {
            $('title').text('hichat | ' + $('#nicknameInput').val());
            $('#loginWrapper').css({'display': 'none'});
            $('#messageInput').focus();
        });
    }
};