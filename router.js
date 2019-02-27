var logHelper = require('./logHelper');
var lh = new logHelper();

function route(handle, pathname, app, express, req, res) {
    console.log(lh.tags.router + "About to route a request for " + pathname);
    if (typeof handle[pathname] === 'function') {
        var handler = handle[pathname];
        app.get(pathname, handler);
        // handle[pathname](app, express, req, res);
    } else {
        console.log(lh.tags.router + "No request handler found for " + pathname);
        res.writeHead(404, {"Content-Type": "text/html"});
        res.write("404 Not found");
        res.end();
    }
  }
  
  exports.route = route;