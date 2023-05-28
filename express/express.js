const http = require("http");
const url = require("url");
const querystring = require("querystring");
class express {
  constructor() {
    this._server = http.createServer(this._serverHandler);
    this._routes = { GET: {}, POST: {}, PUT: {}, DELETE: {} };
  }
  _getBody = (req) => {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        resolve(body);
      });
    });
  };
  _getParams = (req) => {
    // var params = this.params || {};
    // var body = this.body || {};
    // var query = this.query || {};

    // var args = arguments.length === 1
    //   ? 'name'
    //   : 'name, default';
    // deprecate('req.param(' + args + '): Use req.params, req.body, or req.query instead');

    // if (null != params[name] && params.hasOwnProperty(name)) return params[name];
    // if (null != body[name]) return body[name];
    // if (null != query[name]) return query[name];

    return defaultValue;
  };
  _serverHandler = async (req, res) => {
    const query = this._getQueries(req);

    const body = await this._getBody(req);
    req.body = JSON.parse(body);
    req.query = query;
    res.status = this._status.bind({ res });
    res.json = this._json.bind({ res });
    res.send = this._send.bind({ res });
    // }

    const method = req.method.toUpperCase();
    const path = req.url;

    const routeObject = this._getRouteObject(method, path);
    if (Object.entries(routeObject).length) {
      for (let i = 0; i < routeObject.handlers.length; i++) {
        let handler = routeObject.handlers[i];
        if (i === routeObject.handlers.length - 1) {
          handler(req, res);
          break;
        }
        const handlerExecution = new Promise((resolve, reject) => {
          const next = resolve;
          handler(req, res, next);
        });

        await handlerExecution;
      }
    } else {
      res.end("Cannot " + method + " " + path + "");
    }
  };

  _addRoute = (method, route, handlers) => {
    let routeObject = this._getRouteObject(method, route);
    routeObject.handlers = handlers;
  };
  _getRouteObject = (method, path) => {
    const route = this._routes[method];

    let routeObject = route;
    const urlParts = this._processUrl(path);
    console.log(urlParts.query);
    this._processUrl(path).urlParts.forEach((el) => {
      if (!routeObject[el]) {
        routeObject[el] = {};
      }

      routeObject = routeObject[el];
    });

    return routeObject;
  };

  // _processUrl = (path) => {
  //   if (path === "/") return ["/"];
  //   const urlParts = path.split("/").filter((part) => part.length !== 0);
  //   return urlParts;
  // };
  _processUrl = (path) => {
    const parsedUrl = url.parse(path);
    const { pathname, query } = parsedUrl;

    if (pathname === "/") return { urlParts: ["/"], query: {} };

    const urlParts = pathname.split("/").filter((part) => part.length !== 0);
    const parsedQuery = querystring.parse(query);

    return { urlParts, query: parsedQuery };
  };
  listen = (port, callback) => {
    this._server.listen(port, callback);
  };
  get = (route, ...handlers) => {
    this._addRoute("GET", route, handlers);
  };
  post = (route, ...handlers) => {
    this._addRoute("POST", route, handlers);
  };
  put = (route, ...handlers) => {
    this._addRoute("PUT", route, handlers);
  };
  delete = (route, ...handlers) => {
    this._addRoute("DELETE", route, handlers);
  };
  //write data to response
  _send(message) {
    this.res.write(message);
    this.res.end();
  }
  //write json data to response
  _json(message) {
    this.res.setHeader("Content-Type", "application/json");
    this.res.write(JSON.stringify(message));
    // res.end();
    this.res.end();
  }
  _status(status) {
    if (typeof status !== "number") throw new Error("Status must be a number");
    this.res.statusCode = status;
    return this.res;
  }
  _getQueries = (req) => {
    const parsedUrl = url.parse(req.url);
    const { query } = parsedUrl;
    const parsedQuery = querystring.parse(query);
    return parsedQuery;
  };
}

module.exports = express;
