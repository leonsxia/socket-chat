$(function() { 
    var hichat = new HiChat();
    hichat.init();
})

var HiChat = function() {
    this.typing = false;
    this.socket = null;
};

HiChat.prototype = {
    init: function() {
        var that = this;
        // this.socket = io.connect();
        this.socket = io();
        this.socket.on('connect', function() {
            $('#info').text('Get yourself a nickname :)');
            $('#nickWrapper').css({'display': 'block'});
            $('#nicknameInput').focus();            
        });

        $('#loginWrapper').on('click', function() {
            $('#nicknameInput').focus();  
        });

        // $('#loginBtn').on('click', function() {
        //     var nickname = $('#nicknameInput').val();
        //     if (nickname.trim().length != 0) {                
        //         that.socket.emit('login', nickname); // emit 'login' event to server
        //     } else {
        //         $('#nicknameInput').focus();
        //     };
        // });

        $('#sendBtn').on('click', function() {
            var $messageInput = $('#messageInput'),
                msg = $messageInput.val(),
                color = $('#colorStyle').val();
            $messageInput.val('').focus();
            if (msg.trim().length > 0) {
                that.socket.emit('postMsg', msg, color); // emit 'postMsg' event to server
                that._displayNewMsg('me', msg, color);
            }
        });

        $('#sendImage').on('change', function() {
            var $this = $('#sendImage');
            if (this.files.length != 0) {
                var file = this.files[0],
                     reg =  /^(image\/)(jpg|jpeg|gif|jpeg|png)$/i,
                     reader = new FileReader();
                if (!reg.test(file.type)) {
                    alert('pls select image.');
                    that._displayNewMsg('system', 'pls select image.', 'red');
                    $this.val('');
                    return;
                }

                if (!reader) {
                    that._displayNewMsg('system', 'your browser does\'t support fileReader.', 'red');
                    $this.val('');
                    return;
                };

                reader.onload = function(e) {
                    $this.val('');
                    that.socket.emit('postImg', e.target.result);
                    // that._displayImage('me', e.target.result);
                };
                reader.readAsDataURL(file);
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

        this.socket.on('system', function(nickname, userCount, type) {
            var msg = nickname + (type == 'login' ? ' joined' : ' left');
            // $('#historyMsg').append('<p>' + msg + '</p>');
            that._displayNewMsg('system', msg, 'red');            
            $('#status').text(userCount + (userCount > 1 ? ' users' : ' user') + ' online');
        });

        this.socket.on('newMsg', function(user, msg, color) {
            that._displayNewMsg(user, msg, color);
        });

        this.socket.on('newImg', function(user, src) {
            that._displayImage(user, src);
        });

        this._initalEmoji();

        $('#emoji').on('click', function(e) {
            $('#emojiWrapper').css({'display': 'block'});
            e.stopPropagation();
        });

        $('body').on('click', function(e) {
            var $emojiwrapper = $('#emojiWrapper');
            if (e.target != $emojiwrapper) {
                $emojiwrapper.css({'display': 'none'});
            }
        });

        $('#emojiWrapper > img').on('click', function() {
            var $this = $(this),
                $messageInput = $('#messageInput');
            $messageInput.focus().val($messageInput.val() + '[emoji:' + $this.attr('title') +']');
        });

        $('#clearBtn').on('click', function() {
            $('#historyMsg > p').remove();
        });

        $('#nicknameInput').on('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickname = $('#nicknameInput').val();
                if (nickname.trim().length != 0) {                
                    that.socket.emit('login', nickname); // emit 'login' event to server
                } else {
                    $('#nicknameInput').focus();
                };
            }
        });

        $('#messageInput').on('keyup', function(e) {
            var $messageInput = $('#messageInput'),
                msg = $messageInput.val(),
                color = $('#colorStyle').val();
            if (e.keyCode == 13 && msg.trim().length > 0) {
                $messageInput.val('');
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
            }
        });
    },

    _displayNewMsg: function(user, msg, color) {
        var $msgToDisplay = $('<p></p>'),
            date = new Date().toTimeString().substr(0, 8),
            $container = $('#historyMsg'),
            msg = this._showEmoji(msg);
        $msgToDisplay.append('<b>[' + user + ']</b>' + '<span class="timespan">(' + date + '): </span>' + msg).css({'color': color || '#000'});
        $container.append($msgToDisplay).scrollTop($container[0].scrollHeight);
    },

    _displayImage: function(user, src) {
        var $container = $('#historyMsg'),
            $msgToDisplay = $('<p></p>'),
            date = new Date().toTimeString().substr(0, 8);
        $msgToDisplay.append(user + '<span class="timespan">(' + date + '): </span> </br>' + 
            '<a href="/show?src=' + src + '" target="_blank"><img src="' + src + '"/></a>');
        $container.append($msgToDisplay).scrollTop($container[0].scrollHeight);
    },

    _initalEmoji: function() {
        var $emojiWrapper = $('#emojiWrapper');
        for (var i = 69; i > 0; i--) {
            var $emojiItem = $('<img>');
            $emojiItem.attr('src', '../content/emoji/' + i + '.gif');
            $emojiItem.attr('title', i);
            $emojiWrapper.append($emojiItem);
        }
    },

    _showEmoji: function(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = $('#emojiWrapper > img').length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result =  result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
            };
        };

        return result;
    }
};