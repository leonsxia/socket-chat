function LogHelper() {
    var logs = {
        server: '[Server]: ',
        router: '[Router]: ',
        request_handler: '[RequestHandler]: '
    };

    this.tags = logs;
};

module.exports = LogHelper;