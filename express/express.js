const http = require("http");

class express {
  constructor() {
    this._server = http.createServer(this.serverHandler);
    this._routes = { GET: {}, POST: {}, PUT: {}, DELETE: {} };
  }
  _getBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        resolve(body);
      });
    });
  }
  async _serverHandler(req, res) {
    const body = await this._getBody(req);
    res.send = this._send.bind({ res });
    res.json = this._json.bind({ res });
    res.status = this._status.bind({ res });
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
  }

  _getRouteObject(method, path) {
    const route = this._routes[method];
    console.log(path);
    let routeObject = route;
    this._processUrl(path).forEach((el) => {
      if (!routeObject[el]) {
        routeObject[el] = {};
      }

      routeObject = routeObject[el];
    });
    return routeObject;
  }

  _processUrl(path) {
    console.log(path);
    if (path === "/") return ["/"];
    const urlParts = path.split("/").filter((part) => part.length !== 0);
    return urlParts;
    // const params = {};
    // const path = urlParts
    //   .map((part) => {
    //     if (part.startsWith(":")) {
    //       params[part.slice(1)] = null;
    //       return "(\\w+)";
    //     }
    //     return part;
    //   })
    //   .join("/");

    // return { path, params };
  }
  _addRoute = (method, route, handlers) => {
    const routeObject = this._getRouteObject(method, route);

    routeObject.handlers = handlers;
  };

  listen(port, callback) {
    this._server.listen(port, callback);
  }
  get(route, ...handlers) {
    this._addRoute("GET", route, handlers);
  }
  post(route, ...handlers) {
    this._addRoute("POST", route, handlers);
  }
  _send(message) {
    this.res.send(message);
  }
  _json(message) {
    this.res.write(JSON.stringify(message));
  }
  _status(status) {
    this.res.statusCode = status;
  }
}

module.exports = express;
