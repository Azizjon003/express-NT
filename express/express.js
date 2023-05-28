const http = require("http");

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
  _serverHandler = async (req, res) => {
    const body = await this._getBody(req);
    req.body = body;
    // console.log(req);
    // if (res.send) {
    res.status = this._status.bind({ res });
    res.json = this._json.bind({ res });
    res.send = this._send.bind({ res });
    // }


    
    const method = req.method.toUpperCase();
    const path = req.url;

    const routeObject = this._getRouteObject(method, path);
    console.log(routeObject);
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
    // console.log(method, path);
    const route = this._routes[method];

    let routeObject = route;
    this._processUrl(path).forEach((el) => {
      // console.log(el);
      if (!routeObject[el]) {
        routeObject[el] = {};
      }

      routeObject = routeObject[el];
    });

    return routeObject;
  };

  _processUrl = (path) => {
    // console.log(path);
    if (path === "/") return ["/"];
    const urlParts = path.split("/").filter((part) => part.length !== 0);
    return urlParts;
  };

  listen = (port, callback) => {
    this._server.listen(port, callback);
  };
  get = (route, ...handlers) => {
    this._addRoute("GET", route, handlers);
  };
  post = (route, ...handlers) => {
    // console.log(route, handlers);
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
    if(typeof status !== "number") throw new Error("Status must be a number");
    this.res.statusCode = status;
    return this.res;
  }
}

module.exports = express;
