const http = require("http");
const url = require("url");
const querystring = require("querystring");
const path = require("path");
const { deprecate } = require("util");
class express {
  constructor() {
    this._server = http.createServer(this._serverHandler);
    this._routes = { GET: {}, POST: {}, PUT: {}, DELETE: {}, USE: {} };
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
  _serverHandler = async (req, res) => {
    const query = this._getQueries(req);

    const body = await this._getBody(req);
    req.headers = this._getHeaders(req);
    // req.headers = req.headers;
    req.body = JSON.parse(body);
    req.query = query;

    res.sendFile = this._sendFile.bind({ res });
    res.status = this._status.bind({ res });
    res.json = this._json.bind({ res });

    res.send = this._send.bind({ res });

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
    if (method === "USE") {
      let routeObject = this._routes[method];
      routeObject.handlers = handlers;
    } else {
      let routeObject = this._getRouteObject(method, route);
      routeObject.handlers = handlers;
    }
  };
  _getRouteObject = (method, path) => {
    const route = this._routes[method];

    let routeObject = route;
    const urlParts = this._processUrl(path);

    this._processUrl(path).urlParts.forEach((el) => {
      if (!routeObject[el]) {
        routeObject[el] = {};
      }

      routeObject = routeObject[el];
    });

    return routeObject;
  };
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

  // use = (...handlers) => {
  //   if (this.req) {
  //     this.req.method = "use";
  //   }
  //   this._addRoute("USE", "*", handlers);
  // };
  //write data to response
  _send(message) {
    this.res.write(message);
    // console.log("this.res", this.res);
    this.res.end();
    // return this.res
  }
  //write json data to response
  _json(message) {
    this.res.setHeader("Content-Type", "application/json");
    this.res.write(JSON.stringify(message));
    this.res.end();

    // return this.res;
  }
  _status(status) {
    if (typeof status !== "number") throw new Error("Status must be a number");
    this.res.statusCode = status;
    return this.res;
  }

  _sendFile = (path) => {
    console.log("path", path);
    if (typeof path !== "string") throw new Error("Path must be a string");
    const fs = require("fs");
    const file = fs.readFileSync(path);
    const contentType = this._getContentType(path);
    console.log("contentType", this.res);

    // this.res.writeHead(200, { "Content-Type": contentType });
    this.res.writeHead(200, "Content-Type", contentType);

    this.res.end(file);
  };
  _getContentType(filePath) {
    const extname = path.extname(filePath).toLowerCase();

    if (extname === ".html") {
      return "text/html";
    } else if (extname === ".txt") {
      return "text/txt";
    } else if (extname === ".js") {
      return "text/javascript";
    } else if (extname === ".png") {
      return "image/png";
    } else if (extname === ".jpg" || extname === ".jpeg") {
      return "image/jpeg";
    } else {
      return "application/octet-stream";
    }
  }
  _getQueries = (req) => {
    const parsedUrl = url.parse(req.url);
    const { query } = parsedUrl;
    const parsedQuery = querystring.parse(query);
    return parsedQuery;
  };
  _getHeaders = (req) => {
    const { headers } = req;
    return headers;
  };
}

module.exports = express;
