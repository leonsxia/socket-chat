$(function() { 
    var hichat = new HiChat();
    hichat.init();
})

var HiChat = function() {
    this.socket = null;
    this.typing = false;
    this.nickname = null;
    this.connected = false;
    this.firstLogin = true;
    this.color = '#000';
    this.lastTypingTime;
    this.FADE_TIME = 250; // ms
    this.TYPING_TIMER_LENGTH = 400; // ms
};

HiChat.prototype = {
    init: function() {
        var that = this;
        // this.socket = io.connect();
        this.socket = io();
        this.socket.on('connect', function() {
            $('.info').text('Get yourself a nickname :)');
            $('.nickWrapper').show();
            $('.nicknameInput').focus();            
        });

        $('.loginWrapper').on('click', function() {
            $('.nicknameInput').focus();  
        });

        $('.sendBtn').on('click', function() {
            var $messageInput = $('.messageInput'),
                msg = $messageInput.val();
            $messageInput.val('').focus();
            if (msg.trim().length > 0) {
                that.socket.emit('postMsg', { message: msg, color: that.color }); // emit 'postMsg' event to server
                that._addChatMessage({nickname: 'me', message: msg, color: that.color});
            }
        });

        $('.sendImage').on('change', function() {
            var $this = $(this);
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
                    that.socket.emit('postImg', { stream: e.target.result, color: that.color });
                };
                reader.readAsDataURL(file);
            };            
        });

        this._initalEmoji();

        // get color
        $('.colorStyle').on('change', function () {
            that.color = $(this).val();
        });

        $('.emoji').on('click', function(e) {
            $('.emojiWrapper').css({'display': 'block'});
            e.stopPropagation();
        });

        $('body').on('click', function(e) {
            var $emojiwrapper = $('.emojiWrapper');
            if (e.target != $emojiwrapper) {
                $emojiwrapper.css({'display': 'none'});
            }
        });

        $('.emojiWrapper > img').on('click', function() {
            var $this = $(this),
                $messageInput = $('.messageInput');
            $messageInput.focus().val($messageInput.val() + '[emoji:' + $this.attr('title') +']');
        });

        $('.clearBtn').on('click', function() {
            $('.historyArea > p').remove();
        });

        $('.hideLog').on('click', function() {
            var $this = $(this);
            if ($this.attr('title') === 'hide log') {
                $('.historyArea > p.log').fadeOut(that.FADE_TIME);
                $this.val('show log').attr('title', 'show log');
            } else {
                $('.historyArea > p.log').fadeIn(that.FADE_TIME);
                $this.val('hide log').attr('title', 'hide log');
            }
            
        });

        $('.nicknameInput').on('keyup', function(e) {
            var $this = $(this);
            if (e.keyCode == 13) {  // enter key
                reg = /^[\u4E00-\u9FA5a-zA-Z0-9_-]{2,16}$/;
                that._initData();   // get nickname from input once, stored in local var
                if (reg.test(that.nickname)) {                
                    that.socket.emit('login', { nickname: that.nickname, isReconnected: false }); // emit 'login' event to server
                } else {
                    $('.info').text('nickname must be 2-16 charactor, including a-z/A-Z/中文/0-9/_/-');
                    $this.focus();
                };
            }
        });

        $('.messageInput').on('keyup', function(e) {
            var $messageInput = $('.messageInput'),
                msg = $messageInput.val();
            if (e.keyCode == 13 && msg.trim().length > 0 && that.connected) {
                $messageInput.val('');
                that.socket.emit('postMsg', { message: msg, color: that.color });
                that._addChatMessage({ nickname: 'me', message: msg, color: that.color });
            }
        });

        $('.messageInput').on('input', function() {
            that._updateTyping();
        });

        this.socket.on('disconnect', function() {
            that.connected = false;
            that._log({ nickname: 'system', message: 'you have been disconnected', color: '#888' });
        });
        
        this.socket.on('reconnect', function() {
            that._initData();
            that.connected = true;
            that._log({ nickname: 'system', message: 'you have been reconnected', color: '#888' });
            that.socket.emit('login', { nickname: that.nickname, isReconnected: true });
        });

        this.socket.on('nickExisted', function() {
            $('.info').text('nickname is taken, choose another pls');
        });

        this.socket.on('loginSuccess', function(data) {
            that.connected = true;
            $('title').text('hichat | ' + that.nickname);
            $('.loginWrapper').fadeOut(300);
            if (that.firstLogin) {
                $('.historyArea > p').remove();
                that._log({ nickname: 'system', message: 'Welcome ' + that.nickname, color: '#888' });
                that._updateBanner(data);
                that.firstLogin = false;
            }
            $('.messageInput').focus();
        });

        this.socket.on('loginAgain', function(data) {
            that._updateBanner(data);
        });

        this.socket.on('system', function(data) {
            if (data.nickname !== null) {
                var msg = data.nickname + (data.status.indexOf('login') > -1 ? 
                (data.status === 'login' ? ' joined' : ' rejoined') : ' left');                         
                that._updateBanner(data);
                that._log({ nickname: 'system', message: msg, color: '#888' }) ;
            }            
        });

        this.socket.on('newMsg', function(data) {
            that._addChatMessage(data);
        });

        this.socket.on('newImg', function(data) {
            that._addImg(data);
        });

        this.socket.on('typing', function(data) {
            that._addChatTyping(data);
        });

        this.socket.on('stopTyping', function(data) {
            that._removeChatTyping(data);
        });
    },

    _addMessageElement: function(el, options) {
        var $el = $(el),
            $container = $('.historyArea');
        options = options || {};

        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (options.fade) {
            $el.hide().fadeIn(this.FADE_TIME);
        }
        $container.append($el).scrollTop($container[0].scrollHeight);
    },

    _log: function(data) {
        var date = new Date().toTimeString().substr(0, 8),
            $msgToDisplay = $('<p/>').addClass('log')
            .append('-[' + data.nickname + '] ' + '<span class="timespan">(' + date + '): </span>' + data.message + '-')
            .css('color', data.color);
        this._addMessageElement($msgToDisplay);
    },

    _addChatMessage: function(data, options) {
        var $typingMessages = this._getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var $msgToDisplay = $('<p class="message"/>'),
            date = new Date().toTimeString().substr(0, 8),
            typingClass = data.typing ? 'typing' : '';
        data.message = data.typing ? data.message : this._addEmoji(data.message);   // if not typing, show emoji
        $msgToDisplay.append('<b>[' + data.nickname + ']</b> ' + (data.typing ? '' : '<span class="timespan">(' + date + '): </span>') + data.message)        
        .data('nickname', data.nickname)
        .addClass(typingClass);

        if (data.typing) {
            $msgToDisplay.find('b').css({'color': data.color || '#000'});
        } else {
            $msgToDisplay.css({'color': data.color || '#000'});
        }

        this._addMessageElement($msgToDisplay, options);
    },

    _addImg: function(data) {
        var date = new Date().toTimeString().substr(0, 8),
        $msgToDisplay = $('<p/>');
        $msgToDisplay.addClass('img')
        .append('<b>[' + data.nickname + ']</b> ' + '<span class="timespan">(' + date + '): </span> </br>' + 
        '<a href="/show?src=' + data.src + '" target="_blank"><img src="' + data.src + '"/></a>')
        .find('b').css('color', data.color);
        this._addMessageElement($msgToDisplay);
    },

    _addChatTyping: function(data) {
        data.typing = true;
        data.message = 'is typing';
        this._addChatMessage(data);
    },

    _removeChatTyping: function(data) {
        this._getTypingMessages(data).fadeOut(function() {
            $(this).remove();
        });
    },

    _getTypingMessages: function(data) {
        return $('.typing.message').filter(function (i) {
            return $(this).data('nickname') === data.nickname;
        });
    },

    _updateTyping: function() {
        var that = this;
        if (this.connected) {
            if (!this.typing) {
                this.typing = true;
                this.socket.emit('typing', { color: this.color });
            }
            this.lastTypingTime = (new Date()).getTime();

            setTimeout(function() {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - that.lastTypingTime;
                if (timeDiff >= that.TYPING_TIMER_LENGTH && that.typing) {
                    that.socket.emit('stopTyping');
                    that.typing = false;
                } 
            }, this.TYPING_TIMER_LENGTH);
        }
    },

    _initalEmoji: function() {
        var $emojiWrapper = $('.emojiWrapper');
        for (var i = 69; i > 0; i--) {
            var $emojiItem = $('<img>');
            $emojiItem.attr('src', '../content/emoji/' + i + '.gif');
            $emojiItem.attr('title', i);
            $emojiWrapper.append($emojiItem);
        }
    },

    _addEmoji: function(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = $('.emojiWrapper > img').length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result =  result.replace(match[0], '<img class="emoji-item" src="../content/emoji/' + emojiIndex + '.gif" />');
            };
        };

        return result;
    },

    _updateBanner: function(data) {
        $('.status').text(data.userCount + (data.userCount > 1 ? ' users' : ' user') + ' online');
    },

    _initData: function() {
        this.nickname = $('.nicknameInput').val();
        this.color = $('.colorStyle').val();
    }
};