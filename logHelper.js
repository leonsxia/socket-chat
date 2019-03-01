function LogHelper() {
    // private members
    var logs = {
        server: '[Server]: ',
        router: '[Router]: ',
        request_handler: '[RequestHandler]: ',
        socket_handler: '[SocketHandler]: '
    };

    return {
        tags: logs
    }
    // this.tags = logs;
};

module.exports = LogHelper;