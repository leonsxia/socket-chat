function LogHelper() {
    var logs = {
        server: '[Server]: ',
        router: '[Router]: ',
        request_handler: '[RequestHandler]: ',
        socket_handler: '[SocketHandler]: '
    };

    this.tags = logs;
};

module.exports = LogHelper;