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
                that.socket.emit('login', nickname); // emit 'login' event to server
            } else {
                $('#nicknameInput').focus();
            };
        });

        $('#sendBtn').on('click', function() {
            var $messageInput = $('#messageInput');
            var msg = $messageInput.val();
            $messageInput.val('').focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg); // emit 'postMsg' event to server
                that._displayNewMsg('me', msg);
            }
        });

        $('#sendImage').on('change', function() {
            var $this = $('#sendImage');
            if (this.files.length != 0) {
                var file = this.files[0];
                var reader = new FileReader();
                if (!reader) {
                    that._displayNewMsg('system', '!your browser does\'t support fileReader', 'red');
                    $this.val('');
                    return;
                };
            };

            reader.onload = function(e) {
                $this.val('');
                that.socket.emit('img', e.target.result);
                that._displayImage('me', e.target.result);
            };
            reader.readAsDataURL(file);
        });

        this.socket.on('nickExisted', function() {
            $('#info').text('nickname is taken, choose another pls');
        });

        this.socket.on('loginSuccess', function() {
            $('title').text('hichat | ' + $('#nicknameInput').val());
            $('#loginWrapper').css({'display': 'none'});
            $('#messageInput').focus();
        });

        this.socket.on('system', function(nickname, userCount, type) {
            var msg = nickname + (type == 'login' ? ' joined' : ' left');
            // $('#historyMsg').append('<p>' + msg + '</p>');
            that._displayNewMsg('system', msg, 'red');            
            $('#status').text(userCount + (userCount > 1 ? ' users' : ' user') + ' online');
        });

        this.socket.on('newMsg', function(user, msg) {
            that._displayNewMsg(user, msg);
        });

        this.socket.on('newImg', function(user, img) {
            that._displayImage(user, img);
        });
    },

    _displayNewMsg: function(user, msg, color) {
        var $msgToDisplay = $('<p></p>');
        var date = new Date().toTimeString().substr(0, 8);
        var $container = $('#historyMsg');
        $msgToDisplay.append(user + '<span class="timespan">(' + date + '): </span>' + msg).css({'color': color || '#000'});
        $container.append($msgToDisplay).scrollTop($container[0].scrollHeight);
    },

    _displayImage: function(user, imgData, color) {
        var $container = $('#historyMsg');
        var $msgToDisplay = $('<p></p>');
        var date = new Date().toTimeString().substr(0, 8);
        $msgToDisplay.append(user + '<span class="timespan">(' + date + '): </span> </br>' + 
            '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>');
        $container.append($msgToDisplay).scrollTop($container[0].scrollHeight);
    }
};