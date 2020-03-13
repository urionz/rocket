(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"ostrio:cookies":{"cookies.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ostrio_cookies/cookies.js                                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  Cookies: () => Cookies
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let HTTP;
let WebApp;

if (Meteor.isServer) {
  WebApp = require('meteor/webapp').WebApp;
} else {
  HTTP = require('meteor/http').HTTP;
}

const NoOp = () => {};

const urlRE = /\/___cookie___\/set/;
const rootUrl = Meteor.isServer ? process.env.ROOT_URL : window.__meteor_runtime_config__.ROOT_URL || window.__meteor_runtime_config__.meteorEnv.ROOT_URL || false;
const mobileRootUrl = Meteor.isServer ? process.env.MOBILE_ROOT_URL : window.__meteor_runtime_config__.MOBILE_ROOT_URL || window.__meteor_runtime_config__.meteorEnv.MOBILE_ROOT_URL || false;
const helpers = {
  isUndefined(obj) {
    return obj === void 0;
  },

  isArray(obj) {
    return Array.isArray(obj);
  },

  clone(obj) {
    if (!this.isObject(obj)) return obj;
    return this.isArray(obj) ? obj.slice() : Object.assign({}, obj);
  }

};
const _helpers = ['Number', 'Object', 'Function'];

for (let i = 0; i < _helpers.length; i++) {
  helpers['is' + _helpers[i]] = function (obj) {
    return Object.prototype.toString.call(obj) === '[object ' + _helpers[i] + ']';
  };
}
/*
 * @url https://github.com/jshttp/cookie/blob/master/index.js
 * @name cookie
 * @author jshttp
 * @license
 * (The MIT License)
 *
 * Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
 * Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


const decode = decodeURIComponent;
const encode = encodeURIComponent;
const pairSplitRegExp = /; */;
/*
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
/*
 * @function
 * @name tryDecode
 * @param {String} str
 * @param {Function} d
 * @summary Try decoding a string using a decoding function.
 * @private
 */

const tryDecode = (str, d) => {
  try {
    return d(str);
  } catch (e) {
    return str;
  }
};
/*
 * @function
 * @name parse
 * @param {String} str
 * @param {Object} [options]
 * @return {Object}
 * @summary
 * Parse a cookie header.
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 * @private
 */


const parse = (str, options) => {
  if (typeof str !== 'string') {
    throw new Meteor.Error(404, 'argument str must be a string');
  }

  const obj = {};
  const opt = options || {};
  let val;
  let key;
  let eqIndx;
  str.split(pairSplitRegExp).forEach(pair => {
    eqIndx = pair.indexOf('=');

    if (eqIndx < 0) {
      return;
    }

    key = pair.substr(0, eqIndx).trim();
    key = tryDecode(unescape(key), opt.decode || decode);
    val = pair.substr(++eqIndx, pair.length).trim();

    if (val[0] === '"') {
      val = val.slice(1, -1);
    }

    if (void 0 === obj[key]) {
      obj[key] = tryDecode(val, opt.decode || decode);
    }
  });
  return obj;
};
/*
 * @function
 * @name antiCircular
 * @param data {Object} - Circular or any other object which needs to be non-circular
 * @private
 */


const antiCircular = _obj => {
  const object = helpers.clone(_obj);
  const cache = new Map();
  return JSON.stringify(object, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.get(value)) {
        return void 0;
      }

      cache.set(value, true);
    }

    return value;
  });
};
/*
 * @function
 * @name serialize
 * @param {String} name
 * @param {String} val
 * @param {Object} [options]
 * @return { cookieString: String, sanitizedValue: Mixed }
 * @summary
 * Serialize data into a cookie header.
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 * serialize('foo', 'bar', { httpOnly: true }) => "foo=bar; httpOnly"
 * @private
 */


const serialize = function (key, val) {
  let opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  let name;

  if (!fieldContentRegExp.test(key)) {
    name = escape(key);
  } else {
    name = key;
  }

  let sanitizedValue = val;
  let value = val;

  if (!helpers.isUndefined(value)) {
    if (helpers.isObject(value) || helpers.isArray(value)) {
      const stringified = antiCircular(value);
      value = encode("JSON.parse(".concat(stringified, ")"));
      sanitizedValue = JSON.parse(stringified);
    } else {
      value = encode(value);

      if (value && !fieldContentRegExp.test(value)) {
        value = escape(value);
      }
    }
  } else {
    value = '';
  }

  const pairs = ["".concat(name, "=").concat(value)];

  if (helpers.isNumber(opt.maxAge)) {
    pairs.push("Max-Age=".concat(opt.maxAge));
  }

  if (opt.domain && typeof opt.domain === 'string') {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new Meteor.Error(404, 'option domain is invalid');
    }

    pairs.push("Domain=".concat(opt.domain));
  }

  if (opt.path && typeof opt.path === 'string') {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new Meteor.Error(404, 'option path is invalid');
    }

    pairs.push("Path=".concat(opt.path));
  } else {
    pairs.push('Path=/');
  }

  opt.expires = opt.expires || opt.expire || false;

  if (opt.expires === Infinity) {
    pairs.push('Expires=Fri, 31 Dec 9999 23:59:59 GMT');
  } else if (opt.expires instanceof Date) {
    pairs.push("Expires=".concat(opt.expires.toUTCString()));
  } else if (opt.expires === 0) {
    pairs.push('Expires=0');
  } else if (helpers.isNumber(opt.expires)) {
    pairs.push("Expires=".concat(new Date(opt.expires).toUTCString()));
  }

  if (opt.httpOnly) {
    pairs.push('HttpOnly');
  }

  if (opt.secure) {
    pairs.push('Secure');
  }

  if (opt.firstPartyOnly) {
    pairs.push('First-Party-Only');
  }

  if (opt.sameSite) {
    pairs.push('SameSite');
  }

  return {
    cookieString: pairs.join('; '),
    sanitizedValue
  };
};

const isStringifiedRegEx = /JSON\.parse\((.*)\)/;
const isTypedRegEx = /false|true|null|undefined/;

const deserialize = string => {
  if (typeof string !== 'string') {
    return string;
  }

  if (isStringifiedRegEx.test(string)) {
    let obj = string.match(isStringifiedRegEx)[1];

    if (obj) {
      try {
        return JSON.parse(decode(obj));
      } catch (e) {
        console.error('[ostrio:cookies] [.get()] [deserialize()] Exception:', e, string, obj);
        return string;
      }
    }

    return string;
  } else if (isTypedRegEx.test(string)) {
    return JSON.parse(string);
  }

  return string;
};
/*
 * @locus Anywhere
 * @class __cookies
 * @param opts {Object} - Options (configuration) object
 * @param opts._cookies {Object|String} - Current cookies as String or Object
 * @param opts.TTL {Number|Boolean} - Default cookies expiration time (max-age) in milliseconds, by default - session (false)
 * @param opts.runOnServer {Boolean} - Expose Cookies class to Server
 * @param opts.response {http.ServerResponse|Object} - This object is created internally by a HTTP server
 * @param opts.allowQueryStringCookies {Boolean} - Allow passing Cookies in a query string (in URL). Primary should be used only in Cordova environment
 * @param opts.allowedCordovaOrigins {Regex|Boolean} - [Server] Allow setting Cookies from that specific origin which in Meteor/Cordova is localhost:12XXX (^http://localhost:12[0-9]{3}$)
 * @summary Internal Class
 */


class __cookies {
  constructor(opts) {
    this.TTL = opts.TTL || false;
    this.response = opts.response || false;
    this.runOnServer = opts.runOnServer || false;
    this.allowQueryStringCookies = opts.allowQueryStringCookies || false;
    this.allowedCordovaOrigins = opts.allowedCordovaOrigins || false;

    if (this.allowedCordovaOrigins === true) {
      this.allowedCordovaOrigins = /^http:\/\/localhost:12[0-9]{3}$/;
    }

    this.originRE = new RegExp("^https?://(".concat(rootUrl ? rootUrl : '').concat(mobileRootUrl ? '|' + mobileRootUrl : '', ")$"));

    if (helpers.isObject(opts._cookies)) {
      this.cookies = opts._cookies;
    } else {
      this.cookies = parse(opts._cookies);
    }
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name get
   * @param {String} key  - The name of the cookie to read
   * @param {String} _tmp - Unparsed string instead of user's cookies
   * @summary Read a cookie. If the cookie doesn't exist a null value will be returned.
   * @returns {String|void}
   */


  get(key, _tmp) {
    const cookieString = _tmp ? parse(_tmp) : this.cookies;

    if (!key || !cookieString) {
      return void 0;
    }

    if (cookieString.hasOwnProperty(key)) {
      return deserialize(cookieString[key]);
    }

    return void 0;
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name set
   * @param {String}  key   - The name of the cookie to create/overwrite
   * @param {String}  value - The value of the cookie
   * @param {Object}  opts  - [Optional] Cookie options (see readme docs)
   * @summary Create/overwrite a cookie.
   * @returns {Boolean}
   */


  set(key, value) {
    let opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (key && !helpers.isUndefined(value)) {
      if (helpers.isNumber(this.TTL) && opts.expires === undefined) {
        opts.expires = new Date(+new Date() + this.TTL);
      }

      const {
        cookieString,
        sanitizedValue
      } = serialize(key, value, opts);
      this.cookies[key] = sanitizedValue;

      if (Meteor.isClient) {
        document.cookie = cookieString;
      } else if (this.response) {
        this.response.setHeader('Set-Cookie', cookieString);
      }

      return true;
    }

    return false;
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name remove
   * @param {String} key    - The name of the cookie to create/overwrite
   * @param {String} path   - [Optional] The path from where the cookie will be
   * readable. E.g., "/", "/mydir"; if not specified, defaults to the current
   * path of the current document location (string or null). The path must be
   * absolute (see RFC 2965). For more information on how to use relative paths
   * in this argument, see: https://developer.mozilla.org/en-US/docs/Web/API/document.cookie#Using_relative_URLs_in_the_path_parameter
   * @param {String} domain - [Optional] The domain from where the cookie will
   * be readable. E.g., "example.com", ".example.com" (includes all subdomains)
   * or "subdomain.example.com"; if not specified, defaults to the host portion
   * of the current document location (string or null).
   * @summary Remove a cookie(s).
   * @returns {Boolean}
   */


  remove(key) {
    let path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';
    let domain = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    if (key && this.cookies.hasOwnProperty(key)) {
      const {
        cookieString
      } = serialize(key, '', {
        domain,
        path,
        expires: new Date(0)
      });
      delete this.cookies[key];

      if (Meteor.isClient) {
        document.cookie = cookieString;
      } else if (this.response) {
        this.response.setHeader('Set-Cookie', cookieString);
      }

      return true;
    } else if (!key && this.keys().length > 0 && this.keys()[0] !== '') {
      const keys = Object.keys(this.cookies);

      for (let i = 0; i < keys.length; i++) {
        this.remove(keys[i]);
      }

      return true;
    }

    return false;
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name has
   * @param {String} key  - The name of the cookie to create/overwrite
   * @param {String} _tmp - Unparsed string instead of user's cookies
   * @summary Check whether a cookie exists in the current position.
   * @returns {Boolean}
   */


  has(key, _tmp) {
    const cookieString = _tmp ? parse(_tmp) : this.cookies;

    if (!key || !cookieString) {
      return false;
    }

    return cookieString.hasOwnProperty(key);
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name keys
   * @summary Returns an array of all readable cookies from this location.
   * @returns {[String]}
   */


  keys() {
    if (this.cookies) {
      return Object.keys(this.cookies);
    }

    return [];
  }
  /*
   * @locus Client
   * @memberOf __cookies
   * @name send
   * @param cb {Function} - Callback
   * @summary Send all cookies over XHR to server.
   * @returns {void}
   */


  send() {
    let cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : NoOp;

    if (Meteor.isServer) {
      cb(new Meteor.Error(400, 'Can\'t run `.send()` on server, it\'s Client only method!'));
    }

    if (this.runOnServer) {
      let path = "".concat(window.__meteor_runtime_config__.ROOT_URL_PATH_PREFIX || window.__meteor_runtime_config__.meteorEnv.ROOT_URL_PATH_PREFIX || '', "/___cookie___/set");
      let query = '';

      if (Meteor.isCordova && this.allowQueryStringCookies) {
        const cookiesKeys = this.keys();
        const cookiesArray = [];

        for (let i = 0; i < cookiesKeys.length; i++) {
          const {
            sanitizedValue
          } = serialize(cookiesKeys[i], this.get(cookiesKeys[i]));
          const pair = "".concat(cookiesKeys[i], "=").concat(sanitizedValue);

          if (!cookiesArray.includes(pair)) {
            cookiesArray.push(pair);
          }
        }

        if (cookiesArray.length) {
          path = Meteor.absoluteUrl('___cookie___/set');
          query = "?___cookies___=".concat(encodeURIComponent(cookiesArray.join('; ')));
        }
      }

      HTTP.get("".concat(path).concat(query), {
        beforeSend(xhr) {
          xhr.withCredentials = true;
          return true;
        }

      }, cb);
    } else {
      cb(new Meteor.Error(400, 'Can\'t send cookies on server when `runOnServer` is false.'));
    }

    return void 0;
  }

}
/*
 * @function
 * @locus Server
 * @summary Middleware handler
 * @private
 */


const __middlewareHandler = (request, response, opts) => {
  let _cookies = {};

  if (opts.runOnServer) {
    if (request.headers && request.headers.cookie) {
      _cookies = parse(request.headers.cookie);
    }

    return new __cookies({
      _cookies,
      TTL: opts.TTL,
      runOnServer: opts.runOnServer,
      response,
      allowQueryStringCookies: opts.allowQueryStringCookies
    });
  }

  throw new Meteor.Error(400, 'Can\'t use middleware when `runOnServer` is false.');
};
/*
 * @locus Anywhere
 * @class Cookies
 * @param opts {Object}
 * @param opts.TTL {Number} - Default cookies expiration time (max-age) in milliseconds, by default - session (false)
 * @param opts.auto {Boolean} - [Server] Auto-bind in middleware as `req.Cookies`, by default `true`
 * @param opts.handler {Function} - [Server] Middleware handler
 * @param opts.runOnServer {Boolean} - Expose Cookies class to Server
 * @param opts.allowQueryStringCookies {Boolean} - Allow passing Cookies in a query string (in URL). Primary should be used only in Cordova environment
 * @param opts.allowedCordovaOrigins {Regex|Boolean} - [Server] Allow setting Cookies from that specific origin which in Meteor/Cordova is localhost:12XXX (^http://localhost:12[0-9]{3}$)
 * @summary Main Cookie class
 */


class Cookies extends __cookies {
  constructor() {
    let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    opts.TTL = helpers.isNumber(opts.TTL) ? opts.TTL : false;
    opts.runOnServer = opts.runOnServer !== false ? true : false;
    opts.allowQueryStringCookies = opts.allowQueryStringCookies !== true ? false : true;

    if (Meteor.isClient) {
      opts._cookies = document.cookie;
      super(opts);
    } else {
      opts._cookies = {};
      super(opts);
      opts.auto = opts.auto !== false ? true : false;
      this.opts = opts;
      this.handler = helpers.isFunction(opts.handler) ? opts.handler : false;
      this.onCookies = helpers.isFunction(opts.onCookies) ? opts.onCookies : false;

      if (opts.runOnServer && !Cookies.isLoadedOnServer) {
        Cookies.isLoadedOnServer = true;

        if (opts.auto) {
          WebApp.connectHandlers.use((req, res, next) => {
            if (urlRE.test(req._parsedUrl.path)) {
              const matchedCordovaOrigin = !!req.headers.origin && this.allowedCordovaOrigins && this.allowedCordovaOrigins.test(req.headers.origin);
              const matchedOrigin = matchedCordovaOrigin || !!req.headers.origin && this.originRE.test(req.headers.origin);

              if (matchedOrigin) {
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
              }

              const cookiesArray = [];
              let cookiesObject = {};

              if (matchedCordovaOrigin && opts.allowQueryStringCookies && req.query.___cookies___) {
                cookiesObject = parse(decodeURIComponent(req.query.___cookies___));
              } else if (req.headers.cookie) {
                cookiesObject = parse(req.headers.cookie);
              }

              const cookiesKeys = Object.keys(cookiesObject);

              if (cookiesKeys.length) {
                for (let i = 0; i < cookiesKeys.length; i++) {
                  const {
                    cookieString
                  } = serialize(cookiesKeys[i], cookiesObject[cookiesKeys[i]]);

                  if (!cookiesArray.includes(cookieString)) {
                    cookiesArray.push(cookieString);
                  }
                }

                if (cookiesArray.length) {
                  res.setHeader('Set-Cookie', cookiesArray);
                }
              }

              helpers.isFunction(this.onCookies) && this.onCookies(__middlewareHandler(req, res, opts));
              res.writeHead(200);
              res.end('');
            } else {
              req.Cookies = __middlewareHandler(req, res, opts);
              helpers.isFunction(this.handler) && this.handler(req.Cookies);
              next();
            }
          });
        }
      }
    }
  }
  /*
   * @locus Server
   * @memberOf Cookies
   * @name middleware
   * @summary Get Cookies instance into callback
   * @returns {void}
   */


  middleware() {
    if (!Meteor.isServer) {
      throw new Meteor.Error(500, '[ostrio:cookies] Can\'t use `.middleware()` on Client, it\'s Server only!');
    }

    return (req, res, next) => {
      helpers.isFunction(this.handler) && this.handler(__middlewareHandler(req, res, this.opts));
      next();
    };
  }

}

if (Meteor.isServer) {
  Cookies.isLoadedOnServer = false;
}
/* Export the Cookies class */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/ostrio:cookies/cookies.js");

/* Exports */
Package._define("ostrio:cookies", exports);

})();

//# sourceURL=meteor://💻app/packages/ostrio_cookies.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb3N0cmlvOmNvb2tpZXMvY29va2llcy5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJDb29raWVzIiwiTWV0ZW9yIiwibGluayIsInYiLCJIVFRQIiwiV2ViQXBwIiwiaXNTZXJ2ZXIiLCJyZXF1aXJlIiwiTm9PcCIsInVybFJFIiwicm9vdFVybCIsInByb2Nlc3MiLCJlbnYiLCJST09UX1VSTCIsIndpbmRvdyIsIl9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18iLCJtZXRlb3JFbnYiLCJtb2JpbGVSb290VXJsIiwiTU9CSUxFX1JPT1RfVVJMIiwiaGVscGVycyIsImlzVW5kZWZpbmVkIiwib2JqIiwiaXNBcnJheSIsIkFycmF5IiwiY2xvbmUiLCJpc09iamVjdCIsInNsaWNlIiwiT2JqZWN0IiwiYXNzaWduIiwiX2hlbHBlcnMiLCJpIiwibGVuZ3RoIiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiZGVjb2RlIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiZW5jb2RlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwicGFpclNwbGl0UmVnRXhwIiwiZmllbGRDb250ZW50UmVnRXhwIiwidHJ5RGVjb2RlIiwic3RyIiwiZCIsImUiLCJwYXJzZSIsIm9wdGlvbnMiLCJFcnJvciIsIm9wdCIsInZhbCIsImtleSIsImVxSW5keCIsInNwbGl0IiwiZm9yRWFjaCIsInBhaXIiLCJpbmRleE9mIiwic3Vic3RyIiwidHJpbSIsInVuZXNjYXBlIiwiYW50aUNpcmN1bGFyIiwiX29iaiIsIm9iamVjdCIsImNhY2hlIiwiTWFwIiwiSlNPTiIsInN0cmluZ2lmeSIsInZhbHVlIiwiZ2V0Iiwic2V0Iiwic2VyaWFsaXplIiwibmFtZSIsInRlc3QiLCJlc2NhcGUiLCJzYW5pdGl6ZWRWYWx1ZSIsInN0cmluZ2lmaWVkIiwicGFpcnMiLCJpc051bWJlciIsIm1heEFnZSIsInB1c2giLCJkb21haW4iLCJwYXRoIiwiZXhwaXJlcyIsImV4cGlyZSIsIkluZmluaXR5IiwiRGF0ZSIsInRvVVRDU3RyaW5nIiwiaHR0cE9ubHkiLCJzZWN1cmUiLCJmaXJzdFBhcnR5T25seSIsInNhbWVTaXRlIiwiY29va2llU3RyaW5nIiwiam9pbiIsImlzU3RyaW5naWZpZWRSZWdFeCIsImlzVHlwZWRSZWdFeCIsImRlc2VyaWFsaXplIiwic3RyaW5nIiwibWF0Y2giLCJjb25zb2xlIiwiZXJyb3IiLCJfX2Nvb2tpZXMiLCJjb25zdHJ1Y3RvciIsIm9wdHMiLCJUVEwiLCJyZXNwb25zZSIsInJ1bk9uU2VydmVyIiwiYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMiLCJhbGxvd2VkQ29yZG92YU9yaWdpbnMiLCJvcmlnaW5SRSIsIlJlZ0V4cCIsIl9jb29raWVzIiwiY29va2llcyIsIl90bXAiLCJoYXNPd25Qcm9wZXJ0eSIsInVuZGVmaW5lZCIsImlzQ2xpZW50IiwiZG9jdW1lbnQiLCJjb29raWUiLCJzZXRIZWFkZXIiLCJyZW1vdmUiLCJrZXlzIiwiaGFzIiwic2VuZCIsImNiIiwiUk9PVF9VUkxfUEFUSF9QUkVGSVgiLCJxdWVyeSIsImlzQ29yZG92YSIsImNvb2tpZXNLZXlzIiwiY29va2llc0FycmF5IiwiaW5jbHVkZXMiLCJhYnNvbHV0ZVVybCIsImJlZm9yZVNlbmQiLCJ4aHIiLCJ3aXRoQ3JlZGVudGlhbHMiLCJfX21pZGRsZXdhcmVIYW5kbGVyIiwicmVxdWVzdCIsImhlYWRlcnMiLCJhdXRvIiwiaGFuZGxlciIsImlzRnVuY3Rpb24iLCJvbkNvb2tpZXMiLCJpc0xvYWRlZE9uU2VydmVyIiwiY29ubmVjdEhhbmRsZXJzIiwidXNlIiwicmVxIiwicmVzIiwibmV4dCIsIl9wYXJzZWRVcmwiLCJtYXRjaGVkQ29yZG92YU9yaWdpbiIsIm9yaWdpbiIsIm1hdGNoZWRPcmlnaW4iLCJjb29raWVzT2JqZWN0IiwiX19fY29va2llc19fXyIsIndyaXRlSGVhZCIsImVuZCIsIm1pZGRsZXdhcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7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QU9BUyxZQUFVLEdBQUc7QUFDWCxRQUFJLENBQUN6SixNQUFNLENBQUNLLFFBQVosRUFBc0I7QUFDcEIsWUFBTSxJQUFJTCxNQUFNLENBQUM4QyxLQUFYLENBQWlCLEdBQWpCLEVBQXNCLDJFQUF0QixDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxDQUFDZ0csR0FBRCxFQUFNQyxHQUFOLEVBQVdDLElBQVgsS0FBb0I7QUFDekI5SCxhQUFPLENBQUN1SCxVQUFSLENBQW1CLEtBQUtELE9BQXhCLEtBQW9DLEtBQUtBLE9BQUwsQ0FBYUosbUJBQW1CLENBQUNVLEdBQUQsRUFBTUMsR0FBTixFQUFXLEtBQUszQyxJQUFoQixDQUFoQyxDQUFwQztBQUNBNEMsVUFBSTtBQUNMLEtBSEQ7QUFJRDs7QUF0RjZCOztBQXlGaEMsSUFBSWhKLE1BQU0sQ0FBQ0ssUUFBWCxFQUFxQjtBQUNuQk4sU0FBTyxDQUFDNEksZ0JBQVIsR0FBMkIsS0FBM0I7QUFDRDtBQUVELDhCIiwiZmlsZSI6Ii9wYWNrYWdlcy9vc3RyaW9fY29va2llcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG5sZXQgSFRUUDtcbmxldCBXZWJBcHA7XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgV2ViQXBwID0gcmVxdWlyZSgnbWV0ZW9yL3dlYmFwcCcpLldlYkFwcDtcbn0gZWxzZSB7XG4gIEhUVFAgPSByZXF1aXJlKCdtZXRlb3IvaHR0cCcpLkhUVFA7XG59XG5cbmNvbnN0IE5vT3AgID0gKCkgPT4ge307XG5jb25zdCB1cmxSRSA9IC9cXC9fX19jb29raWVfX19cXC9zZXQvO1xuY29uc3Qgcm9vdFVybCA9IE1ldGVvci5pc1NlcnZlciA/IHByb2Nlc3MuZW52LlJPT1RfVVJMIDogKHdpbmRvdy5fX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLlJPT1RfVVJMIHx8IHdpbmRvdy5fX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLm1ldGVvckVudi5ST09UX1VSTCB8fCBmYWxzZSk7XG5jb25zdCBtb2JpbGVSb290VXJsID0gTWV0ZW9yLmlzU2VydmVyID8gcHJvY2Vzcy5lbnYuTU9CSUxFX1JPT1RfVVJMIDogKHdpbmRvdy5fX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLk1PQklMRV9ST09UX1VSTCB8fCB3aW5kb3cuX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5tZXRlb3JFbnYuTU9CSUxFX1JPT1RfVVJMIHx8IGZhbHNlKTtcblxuY29uc3QgaGVscGVycyA9IHtcbiAgaXNVbmRlZmluZWQob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9LFxuICBpc0FycmF5KG9iaikge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KG9iaik7XG4gIH0sXG4gIGNsb25lKG9iaikge1xuICAgIGlmICghdGhpcy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHJldHVybiB0aGlzLmlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogT2JqZWN0LmFzc2lnbih7fSwgb2JqKTtcbiAgfVxufTtcbmNvbnN0IF9oZWxwZXJzID0gWydOdW1iZXInLCAnT2JqZWN0JywgJ0Z1bmN0aW9uJ107XG5mb3IgKGxldCBpID0gMDsgaSA8IF9oZWxwZXJzLmxlbmd0aDsgaSsrKSB7XG4gIGhlbHBlcnNbJ2lzJyArIF9oZWxwZXJzW2ldXSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0ICcgKyBfaGVscGVyc1tpXSArICddJztcbiAgfTtcbn1cblxuLypcbiAqIEB1cmwgaHR0cHM6Ly9naXRodWIuY29tL2pzaHR0cC9jb29raWUvYmxvYi9tYXN0ZXIvaW5kZXguanNcbiAqIEBuYW1lIGNvb2tpZVxuICogQGF1dGhvciBqc2h0dHBcbiAqIEBsaWNlbnNlXG4gKiAoVGhlIE1JVCBMaWNlbnNlKVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMi0yMDE0IFJvbWFuIFNodHlsbWFuIDxzaHR5bG1hbkBnbWFpbC5jb20+XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUgRG91Z2xhcyBDaHJpc3RvcGhlciBXaWxzb24gPGRvdWdAc29tZXRoaW5nZG91Zy5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXG4gKiBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbiAqICdTb2Z0d2FyZScpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbiAqIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbiAqIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xuICogcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG4gKiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbiAqIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuICogRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4gKiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuXG4gKiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWVxuICogQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCxcbiAqIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFXG4gKiBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiAqL1xuY29uc3QgZGVjb2RlID0gZGVjb2RlVVJJQ29tcG9uZW50O1xuY29uc3QgZW5jb2RlID0gZW5jb2RlVVJJQ29tcG9uZW50O1xuY29uc3QgcGFpclNwbGl0UmVnRXhwID0gLzsgKi87XG5cbi8qXG4gKiBSZWdFeHAgdG8gbWF0Y2ggZmllbGQtY29udGVudCBpbiBSRkMgNzIzMCBzZWMgMy4yXG4gKlxuICogZmllbGQtY29udGVudCA9IGZpZWxkLXZjaGFyIFsgMSooIFNQIC8gSFRBQiApIGZpZWxkLXZjaGFyIF1cbiAqIGZpZWxkLXZjaGFyICAgPSBWQ0hBUiAvIG9icy10ZXh0XG4gKiBvYnMtdGV4dCAgICAgID0gJXg4MC1GRlxuICovXG5jb25zdCBmaWVsZENvbnRlbnRSZWdFeHAgPSAvXltcXHUwMDA5XFx1MDAyMC1cXHUwMDdlXFx1MDA4MC1cXHUwMGZmXSskLztcblxuLypcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgdHJ5RGVjb2RlXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBkXG4gKiBAc3VtbWFyeSBUcnkgZGVjb2RpbmcgYSBzdHJpbmcgdXNpbmcgYSBkZWNvZGluZyBmdW5jdGlvbi5cbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IHRyeURlY29kZSA9IChzdHIsIGQpID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZChzdHIpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufTtcblxuLypcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgcGFyc2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBzdW1tYXJ5XG4gKiBQYXJzZSBhIGNvb2tpZSBoZWFkZXIuXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gY29va2llIGhlYWRlciBzdHJpbmcgaW50byBhbiBvYmplY3RcbiAqIFRoZSBvYmplY3QgaGFzIHRoZSB2YXJpb3VzIGNvb2tpZXMgYXMga2V5cyhuYW1lcykgPT4gdmFsdWVzXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBwYXJzZSA9IChzdHIsIG9wdGlvbnMpID0+IHtcbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDQsICdhcmd1bWVudCBzdHIgbXVzdCBiZSBhIHN0cmluZycpO1xuICB9XG4gIGNvbnN0IG9iaiA9IHt9O1xuICBjb25zdCBvcHQgPSBvcHRpb25zIHx8IHt9O1xuICBsZXQgdmFsO1xuICBsZXQga2V5O1xuICBsZXQgZXFJbmR4O1xuXG4gIHN0ci5zcGxpdChwYWlyU3BsaXRSZWdFeHApLmZvckVhY2goKHBhaXIpID0+IHtcbiAgICBlcUluZHggPSBwYWlyLmluZGV4T2YoJz0nKTtcbiAgICBpZiAoZXFJbmR4IDwgMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBrZXkgPSBwYWlyLnN1YnN0cigwLCBlcUluZHgpLnRyaW0oKTtcbiAgICBrZXkgPSB0cnlEZWNvZGUodW5lc2NhcGUoa2V5KSwgKG9wdC5kZWNvZGUgfHwgZGVjb2RlKSk7XG4gICAgdmFsID0gcGFpci5zdWJzdHIoKytlcUluZHgsIHBhaXIubGVuZ3RoKS50cmltKCk7XG4gICAgaWYgKHZhbFswXSA9PT0gJ1wiJykge1xuICAgICAgdmFsID0gdmFsLnNsaWNlKDEsIC0xKTtcbiAgICB9XG4gICAgaWYgKHZvaWQgMCA9PT0gb2JqW2tleV0pIHtcbiAgICAgIG9ialtrZXldID0gdHJ5RGVjb2RlKHZhbCwgKG9wdC5kZWNvZGUgfHwgZGVjb2RlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG9iajtcbn07XG5cbi8qXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIGFudGlDaXJjdWxhclxuICogQHBhcmFtIGRhdGEge09iamVjdH0gLSBDaXJjdWxhciBvciBhbnkgb3RoZXIgb2JqZWN0IHdoaWNoIG5lZWRzIHRvIGJlIG5vbi1jaXJjdWxhclxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgYW50aUNpcmN1bGFyID0gKF9vYmopID0+IHtcbiAgY29uc3Qgb2JqZWN0ID0gaGVscGVycy5jbG9uZShfb2JqKTtcbiAgY29uc3QgY2FjaGUgID0gbmV3IE1hcCgpO1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqZWN0LCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICBpZiAoY2FjaGUuZ2V0KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuICAgICAgY2FjaGUuc2V0KHZhbHVlLCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9KTtcbn07XG5cbi8qXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHNlcmlhbGl6ZVxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEByZXR1cm4geyBjb29raWVTdHJpbmc6IFN0cmluZywgc2FuaXRpemVkVmFsdWU6IE1peGVkIH1cbiAqIEBzdW1tYXJ5XG4gKiBTZXJpYWxpemUgZGF0YSBpbnRvIGEgY29va2llIGhlYWRlci5cbiAqIFNlcmlhbGl6ZSB0aGUgYSBuYW1lIHZhbHVlIHBhaXIgaW50byBhIGNvb2tpZSBzdHJpbmcgc3VpdGFibGUgZm9yXG4gKiBodHRwIGhlYWRlcnMuIEFuIG9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHNwZWNpZmllZCBjb29raWUgcGFyYW1ldGVycy5cbiAqIHNlcmlhbGl6ZSgnZm9vJywgJ2JhcicsIHsgaHR0cE9ubHk6IHRydWUgfSkgPT4gXCJmb289YmFyOyBodHRwT25seVwiXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBzZXJpYWxpemUgPSAoa2V5LCB2YWwsIG9wdCA9IHt9KSA9PiB7XG4gIGxldCBuYW1lO1xuXG4gIGlmICghZmllbGRDb250ZW50UmVnRXhwLnRlc3Qoa2V5KSkge1xuICAgIG5hbWUgPSBlc2NhcGUoa2V5KTtcbiAgfSBlbHNlIHtcbiAgICBuYW1lID0ga2V5O1xuICB9XG5cbiAgbGV0IHNhbml0aXplZFZhbHVlID0gdmFsO1xuICBsZXQgdmFsdWUgPSB2YWw7XG4gIGlmICghaGVscGVycy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICBpZiAoaGVscGVycy5pc09iamVjdCh2YWx1ZSkgfHwgaGVscGVycy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgY29uc3Qgc3RyaW5naWZpZWQgPSBhbnRpQ2lyY3VsYXIodmFsdWUpO1xuICAgICAgdmFsdWUgPSBlbmNvZGUoYEpTT04ucGFyc2UoJHtzdHJpbmdpZmllZH0pYCk7XG4gICAgICBzYW5pdGl6ZWRWYWx1ZSA9IEpTT04ucGFyc2Uoc3RyaW5naWZpZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IGVuY29kZSh2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgJiYgIWZpZWxkQ29udGVudFJlZ0V4cC50ZXN0KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZSA9IGVzY2FwZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gJyc7XG4gIH1cblxuICBjb25zdCBwYWlycyA9IFtgJHtuYW1lfT0ke3ZhbHVlfWBdO1xuXG4gIGlmIChoZWxwZXJzLmlzTnVtYmVyKG9wdC5tYXhBZ2UpKSB7XG4gICAgcGFpcnMucHVzaChgTWF4LUFnZT0ke29wdC5tYXhBZ2V9YCk7XG4gIH1cblxuICBpZiAob3B0LmRvbWFpbiAmJiB0eXBlb2Ygb3B0LmRvbWFpbiA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoIWZpZWxkQ29udGVudFJlZ0V4cC50ZXN0KG9wdC5kb21haW4pKSB7XG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwNCwgJ29wdGlvbiBkb21haW4gaXMgaW52YWxpZCcpO1xuICAgIH1cbiAgICBwYWlycy5wdXNoKGBEb21haW49JHtvcHQuZG9tYWlufWApO1xuICB9XG5cbiAgaWYgKG9wdC5wYXRoICYmIHR5cGVvZiBvcHQucGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoIWZpZWxkQ29udGVudFJlZ0V4cC50ZXN0KG9wdC5wYXRoKSkge1xuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDQsICdvcHRpb24gcGF0aCBpcyBpbnZhbGlkJyk7XG4gICAgfVxuICAgIHBhaXJzLnB1c2goYFBhdGg9JHtvcHQucGF0aH1gKTtcbiAgfSBlbHNlIHtcbiAgICBwYWlycy5wdXNoKCdQYXRoPS8nKTtcbiAgfVxuXG4gIG9wdC5leHBpcmVzID0gb3B0LmV4cGlyZXMgfHwgb3B0LmV4cGlyZSB8fCBmYWxzZTtcbiAgaWYgKG9wdC5leHBpcmVzID09PSBJbmZpbml0eSkge1xuICAgIHBhaXJzLnB1c2goJ0V4cGlyZXM9RnJpLCAzMSBEZWMgOTk5OSAyMzo1OTo1OSBHTVQnKTtcbiAgfSBlbHNlIGlmIChvcHQuZXhwaXJlcyBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICBwYWlycy5wdXNoKGBFeHBpcmVzPSR7b3B0LmV4cGlyZXMudG9VVENTdHJpbmcoKX1gKTtcbiAgfSBlbHNlIGlmIChvcHQuZXhwaXJlcyA9PT0gMCkge1xuICAgIHBhaXJzLnB1c2goJ0V4cGlyZXM9MCcpO1xuICB9IGVsc2UgaWYgKGhlbHBlcnMuaXNOdW1iZXIob3B0LmV4cGlyZXMpKSB7XG4gICAgcGFpcnMucHVzaChgRXhwaXJlcz0keyhuZXcgRGF0ZShvcHQuZXhwaXJlcykpLnRvVVRDU3RyaW5nKCl9YCk7XG4gIH1cblxuICBpZiAob3B0Lmh0dHBPbmx5KSB7XG4gICAgcGFpcnMucHVzaCgnSHR0cE9ubHknKTtcbiAgfVxuXG4gIGlmIChvcHQuc2VjdXJlKSB7XG4gICAgcGFpcnMucHVzaCgnU2VjdXJlJyk7XG4gIH1cblxuICBpZiAob3B0LmZpcnN0UGFydHlPbmx5KSB7XG4gICAgcGFpcnMucHVzaCgnRmlyc3QtUGFydHktT25seScpO1xuICB9XG5cbiAgaWYgKG9wdC5zYW1lU2l0ZSkge1xuICAgIHBhaXJzLnB1c2goJ1NhbWVTaXRlJyk7XG4gIH1cblxuICByZXR1cm4geyBjb29raWVTdHJpbmc6IHBhaXJzLmpvaW4oJzsgJyksIHNhbml0aXplZFZhbHVlIH07XG59O1xuXG5jb25zdCBpc1N0cmluZ2lmaWVkUmVnRXggPSAvSlNPTlxcLnBhcnNlXFwoKC4qKVxcKS87XG5jb25zdCBpc1R5cGVkUmVnRXggPSAvZmFsc2V8dHJ1ZXxudWxsfHVuZGVmaW5lZC87XG5jb25zdCBkZXNlcmlhbGl6ZSA9IChzdHJpbmcpID0+IHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuXG4gIGlmIChpc1N0cmluZ2lmaWVkUmVnRXgudGVzdChzdHJpbmcpKSB7XG4gICAgbGV0IG9iaiA9IHN0cmluZy5tYXRjaChpc1N0cmluZ2lmaWVkUmVnRXgpWzFdO1xuICAgIGlmIChvYmopIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRlY29kZShvYmopKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW29zdHJpbzpjb29raWVzXSBbLmdldCgpXSBbZGVzZXJpYWxpemUoKV0gRXhjZXB0aW9uOicsIGUsIHN0cmluZywgb2JqKTtcbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfSBlbHNlIGlmIChpc1R5cGVkUmVnRXgudGVzdChzdHJpbmcpKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2Uoc3RyaW5nKTtcbiAgfVxuICByZXR1cm4gc3RyaW5nO1xufTtcblxuLypcbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQGNsYXNzIF9fY29va2llc1xuICogQHBhcmFtIG9wdHMge09iamVjdH0gLSBPcHRpb25zIChjb25maWd1cmF0aW9uKSBvYmplY3RcbiAqIEBwYXJhbSBvcHRzLl9jb29raWVzIHtPYmplY3R8U3RyaW5nfSAtIEN1cnJlbnQgY29va2llcyBhcyBTdHJpbmcgb3IgT2JqZWN0XG4gKiBAcGFyYW0gb3B0cy5UVEwge051bWJlcnxCb29sZWFufSAtIERlZmF1bHQgY29va2llcyBleHBpcmF0aW9uIHRpbWUgKG1heC1hZ2UpIGluIG1pbGxpc2Vjb25kcywgYnkgZGVmYXVsdCAtIHNlc3Npb24gKGZhbHNlKVxuICogQHBhcmFtIG9wdHMucnVuT25TZXJ2ZXIge0Jvb2xlYW59IC0gRXhwb3NlIENvb2tpZXMgY2xhc3MgdG8gU2VydmVyXG4gKiBAcGFyYW0gb3B0cy5yZXNwb25zZSB7aHR0cC5TZXJ2ZXJSZXNwb25zZXxPYmplY3R9IC0gVGhpcyBvYmplY3QgaXMgY3JlYXRlZCBpbnRlcm5hbGx5IGJ5IGEgSFRUUCBzZXJ2ZXJcbiAqIEBwYXJhbSBvcHRzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzIHtCb29sZWFufSAtIEFsbG93IHBhc3NpbmcgQ29va2llcyBpbiBhIHF1ZXJ5IHN0cmluZyAoaW4gVVJMKS4gUHJpbWFyeSBzaG91bGQgYmUgdXNlZCBvbmx5IGluIENvcmRvdmEgZW52aXJvbm1lbnRcbiAqIEBwYXJhbSBvcHRzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2lucyB7UmVnZXh8Qm9vbGVhbn0gLSBbU2VydmVyXSBBbGxvdyBzZXR0aW5nIENvb2tpZXMgZnJvbSB0aGF0IHNwZWNpZmljIG9yaWdpbiB3aGljaCBpbiBNZXRlb3IvQ29yZG92YSBpcyBsb2NhbGhvc3Q6MTJYWFggKF5odHRwOi8vbG9jYWxob3N0OjEyWzAtOV17M30kKVxuICogQHN1bW1hcnkgSW50ZXJuYWwgQ2xhc3NcbiAqL1xuY2xhc3MgX19jb29raWVzIHtcbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIHRoaXMuVFRMID0gb3B0cy5UVEwgfHwgZmFsc2U7XG4gICAgdGhpcy5yZXNwb25zZSA9IG9wdHMucmVzcG9uc2UgfHwgZmFsc2U7XG4gICAgdGhpcy5ydW5PblNlcnZlciA9IG9wdHMucnVuT25TZXJ2ZXIgfHwgZmFsc2U7XG4gICAgdGhpcy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcyA9IG9wdHMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMgfHwgZmFsc2U7XG4gICAgdGhpcy5hbGxvd2VkQ29yZG92YU9yaWdpbnMgPSBvcHRzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2lucyB8fCBmYWxzZTtcblxuICAgIGlmICh0aGlzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2lucyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5hbGxvd2VkQ29yZG92YU9yaWdpbnMgPSAvXmh0dHA6XFwvXFwvbG9jYWxob3N0OjEyWzAtOV17M30kLztcbiAgICB9XG5cbiAgICB0aGlzLm9yaWdpblJFID0gbmV3IFJlZ0V4cChgXmh0dHBzPzpcXC9cXC8oJHtyb290VXJsID8gcm9vdFVybCA6ICcnfSR7bW9iaWxlUm9vdFVybCA/ICgnfCcgKyBtb2JpbGVSb290VXJsKSA6ICcnfSkkYCk7XG5cbiAgICBpZiAoaGVscGVycy5pc09iamVjdChvcHRzLl9jb29raWVzKSkge1xuICAgICAgdGhpcy5jb29raWVzID0gb3B0cy5fY29va2llcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb29raWVzID0gcGFyc2Uob3B0cy5fY29va2llcyk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBfX2Nvb2tpZXNcbiAgICogQG5hbWUgZ2V0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgIC0gVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0byByZWFkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBfdG1wIC0gVW5wYXJzZWQgc3RyaW5nIGluc3RlYWQgb2YgdXNlcidzIGNvb2tpZXNcbiAgICogQHN1bW1hcnkgUmVhZCBhIGNvb2tpZS4gSWYgdGhlIGNvb2tpZSBkb2Vzbid0IGV4aXN0IGEgbnVsbCB2YWx1ZSB3aWxsIGJlIHJldHVybmVkLlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfHZvaWR9XG4gICAqL1xuICBnZXQoa2V5LCBfdG1wKSB7XG4gICAgY29uc3QgY29va2llU3RyaW5nID0gX3RtcCA/IHBhcnNlKF90bXApIDogdGhpcy5jb29raWVzO1xuICAgIGlmICgha2V5IHx8ICFjb29raWVTdHJpbmcpIHtcbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuXG4gICAgaWYgKGNvb2tpZVN0cmluZy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXR1cm4gZGVzZXJpYWxpemUoY29va2llU3RyaW5nW2tleV0pO1xuICAgIH1cblxuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIF9fY29va2llc1xuICAgKiBAbmFtZSBzZXRcbiAgICogQHBhcmFtIHtTdHJpbmd9ICBrZXkgICAtIFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdG8gY3JlYXRlL292ZXJ3cml0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gIHZhbHVlIC0gVGhlIHZhbHVlIG9mIHRoZSBjb29raWVcbiAgICogQHBhcmFtIHtPYmplY3R9ICBvcHRzICAtIFtPcHRpb25hbF0gQ29va2llIG9wdGlvbnMgKHNlZSByZWFkbWUgZG9jcylcbiAgICogQHN1bW1hcnkgQ3JlYXRlL292ZXJ3cml0ZSBhIGNvb2tpZS5cbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqL1xuICBzZXQoa2V5LCB2YWx1ZSwgb3B0cyA9IHt9KSB7XG4gICAgaWYgKGtleSAmJiAhaGVscGVycy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIGlmIChoZWxwZXJzLmlzTnVtYmVyKHRoaXMuVFRMKSAmJiBvcHRzLmV4cGlyZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvcHRzLmV4cGlyZXMgPSBuZXcgRGF0ZSgrbmV3IERhdGUoKSArIHRoaXMuVFRMKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgY29va2llU3RyaW5nLCBzYW5pdGl6ZWRWYWx1ZSB9ID0gc2VyaWFsaXplKGtleSwgdmFsdWUsIG9wdHMpO1xuICAgICAgdGhpcy5jb29raWVzW2tleV0gPSBzYW5pdGl6ZWRWYWx1ZTtcbiAgICAgIGlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llU3RyaW5nO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnJlc3BvbnNlKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2Uuc2V0SGVhZGVyKCdTZXQtQ29va2llJywgY29va2llU3RyaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIF9fY29va2llc1xuICAgKiBAbmFtZSByZW1vdmVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleSAgICAtIFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdG8gY3JlYXRlL292ZXJ3cml0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAgIC0gW09wdGlvbmFsXSBUaGUgcGF0aCBmcm9tIHdoZXJlIHRoZSBjb29raWUgd2lsbCBiZVxuICAgKiByZWFkYWJsZS4gRS5nLiwgXCIvXCIsIFwiL215ZGlyXCI7IGlmIG5vdCBzcGVjaWZpZWQsIGRlZmF1bHRzIHRvIHRoZSBjdXJyZW50XG4gICAqIHBhdGggb2YgdGhlIGN1cnJlbnQgZG9jdW1lbnQgbG9jYXRpb24gKHN0cmluZyBvciBudWxsKS4gVGhlIHBhdGggbXVzdCBiZVxuICAgKiBhYnNvbHV0ZSAoc2VlIFJGQyAyOTY1KS4gRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRvIHVzZSByZWxhdGl2ZSBwYXRoc1xuICAgKiBpbiB0aGlzIGFyZ3VtZW50LCBzZWU6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9kb2N1bWVudC5jb29raWUjVXNpbmdfcmVsYXRpdmVfVVJMc19pbl90aGVfcGF0aF9wYXJhbWV0ZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiAtIFtPcHRpb25hbF0gVGhlIGRvbWFpbiBmcm9tIHdoZXJlIHRoZSBjb29raWUgd2lsbFxuICAgKiBiZSByZWFkYWJsZS4gRS5nLiwgXCJleGFtcGxlLmNvbVwiLCBcIi5leGFtcGxlLmNvbVwiIChpbmNsdWRlcyBhbGwgc3ViZG9tYWlucylcbiAgICogb3IgXCJzdWJkb21haW4uZXhhbXBsZS5jb21cIjsgaWYgbm90IHNwZWNpZmllZCwgZGVmYXVsdHMgdG8gdGhlIGhvc3QgcG9ydGlvblxuICAgKiBvZiB0aGUgY3VycmVudCBkb2N1bWVudCBsb2NhdGlvbiAoc3RyaW5nIG9yIG51bGwpLlxuICAgKiBAc3VtbWFyeSBSZW1vdmUgYSBjb29raWUocykuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKi9cbiAgcmVtb3ZlKGtleSwgcGF0aCA9ICcvJywgZG9tYWluID0gJycpIHtcbiAgICBpZiAoa2V5ICYmIHRoaXMuY29va2llcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjb25zdCB7IGNvb2tpZVN0cmluZyB9ID0gc2VyaWFsaXplKGtleSwgJycsIHtcbiAgICAgICAgZG9tYWluLFxuICAgICAgICBwYXRoLFxuICAgICAgICBleHBpcmVzOiBuZXcgRGF0ZSgwKVxuICAgICAgfSk7XG5cbiAgICAgIGRlbGV0ZSB0aGlzLmNvb2tpZXNba2V5XTtcbiAgICAgIGlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llU3RyaW5nO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnJlc3BvbnNlKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2Uuc2V0SGVhZGVyKCdTZXQtQ29va2llJywgY29va2llU3RyaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoIWtleSAmJiB0aGlzLmtleXMoKS5sZW5ndGggPiAwICYmIHRoaXMua2V5cygpWzBdICE9PSAnJykge1xuICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY29va2llcyk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5yZW1vdmUoa2V5c1tpXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBfX2Nvb2tpZXNcbiAgICogQG5hbWUgaGFzXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgIC0gVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0byBjcmVhdGUvb3ZlcndyaXRlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBfdG1wIC0gVW5wYXJzZWQgc3RyaW5nIGluc3RlYWQgb2YgdXNlcidzIGNvb2tpZXNcbiAgICogQHN1bW1hcnkgQ2hlY2sgd2hldGhlciBhIGNvb2tpZSBleGlzdHMgaW4gdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKi9cbiAgaGFzKGtleSwgX3RtcCkge1xuICAgIGNvbnN0IGNvb2tpZVN0cmluZyA9IF90bXAgPyBwYXJzZShfdG1wKSA6IHRoaXMuY29va2llcztcbiAgICBpZiAoIWtleSB8fCAhY29va2llU3RyaW5nKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvb2tpZVN0cmluZy5oYXNPd25Qcm9wZXJ0eShrZXkpO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBfX2Nvb2tpZXNcbiAgICogQG5hbWUga2V5c1xuICAgKiBAc3VtbWFyeSBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCByZWFkYWJsZSBjb29raWVzIGZyb20gdGhpcyBsb2NhdGlvbi5cbiAgICogQHJldHVybnMge1tTdHJpbmddfVxuICAgKi9cbiAga2V5cygpIHtcbiAgICBpZiAodGhpcy5jb29raWVzKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5jb29raWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIENsaWVudFxuICAgKiBAbWVtYmVyT2YgX19jb29raWVzXG4gICAqIEBuYW1lIHNlbmRcbiAgICogQHBhcmFtIGNiIHtGdW5jdGlvbn0gLSBDYWxsYmFja1xuICAgKiBAc3VtbWFyeSBTZW5kIGFsbCBjb29raWVzIG92ZXIgWEhSIHRvIHNlcnZlci5cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBzZW5kKGNiID0gTm9PcCkge1xuICAgIGlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICAgIGNiKG5ldyBNZXRlb3IuRXJyb3IoNDAwLCAnQ2FuXFwndCBydW4gYC5zZW5kKClgIG9uIHNlcnZlciwgaXRcXCdzIENsaWVudCBvbmx5IG1ldGhvZCEnKSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucnVuT25TZXJ2ZXIpIHtcbiAgICAgIGxldCBwYXRoID0gYCR7d2luZG93Ll9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uUk9PVF9VUkxfUEFUSF9QUkVGSVggfHwgd2luZG93Ll9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18ubWV0ZW9yRW52LlJPT1RfVVJMX1BBVEhfUFJFRklYIHx8ICcnfS9fX19jb29raWVfX18vc2V0YDtcbiAgICAgIGxldCBxdWVyeSA9ICcnO1xuXG4gICAgICBpZiAoTWV0ZW9yLmlzQ29yZG92YSAmJiB0aGlzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzKSB7XG4gICAgICAgIGNvbnN0IGNvb2tpZXNLZXlzID0gdGhpcy5rZXlzKCk7XG4gICAgICAgIGNvbnN0IGNvb2tpZXNBcnJheSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvb2tpZXNLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgeyBzYW5pdGl6ZWRWYWx1ZSB9ID0gc2VyaWFsaXplKGNvb2tpZXNLZXlzW2ldLCB0aGlzLmdldChjb29raWVzS2V5c1tpXSkpO1xuICAgICAgICAgIGNvbnN0IHBhaXIgPSBgJHtjb29raWVzS2V5c1tpXX09JHtzYW5pdGl6ZWRWYWx1ZX1gO1xuICAgICAgICAgIGlmICghY29va2llc0FycmF5LmluY2x1ZGVzKHBhaXIpKSB7XG4gICAgICAgICAgICBjb29raWVzQXJyYXkucHVzaChwYWlyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29va2llc0FycmF5Lmxlbmd0aCkge1xuICAgICAgICAgIHBhdGggPSBNZXRlb3IuYWJzb2x1dGVVcmwoJ19fX2Nvb2tpZV9fXy9zZXQnKTtcbiAgICAgICAgICBxdWVyeSA9IGA/X19fY29va2llc19fXz0ke2VuY29kZVVSSUNvbXBvbmVudChjb29raWVzQXJyYXkuam9pbignOyAnKSl9YDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBIVFRQLmdldChgJHtwYXRofSR7cXVlcnl9YCwge1xuICAgICAgICBiZWZvcmVTZW5kKHhocikge1xuICAgICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9LCBjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNiKG5ldyBNZXRlb3IuRXJyb3IoNDAwLCAnQ2FuXFwndCBzZW5kIGNvb2tpZXMgb24gc2VydmVyIHdoZW4gYHJ1bk9uU2VydmVyYCBpcyBmYWxzZS4nKSk7XG4gICAgfVxuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cbn1cblxuLypcbiAqIEBmdW5jdGlvblxuICogQGxvY3VzIFNlcnZlclxuICogQHN1bW1hcnkgTWlkZGxld2FyZSBoYW5kbGVyXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBfX21pZGRsZXdhcmVIYW5kbGVyID0gKHJlcXVlc3QsIHJlc3BvbnNlLCBvcHRzKSA9PiB7XG4gIGxldCBfY29va2llcyA9IHt9O1xuICBpZiAob3B0cy5ydW5PblNlcnZlcikge1xuICAgIGlmIChyZXF1ZXN0LmhlYWRlcnMgJiYgcmVxdWVzdC5oZWFkZXJzLmNvb2tpZSkge1xuICAgICAgX2Nvb2tpZXMgPSBwYXJzZShyZXF1ZXN0LmhlYWRlcnMuY29va2llKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IF9fY29va2llcyh7XG4gICAgICBfY29va2llcyxcbiAgICAgIFRUTDogb3B0cy5UVEwsXG4gICAgICBydW5PblNlcnZlcjogb3B0cy5ydW5PblNlcnZlcixcbiAgICAgIHJlc3BvbnNlLFxuICAgICAgYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXM6IG9wdHMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXNcbiAgICB9KTtcbiAgfVxuXG4gIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAwLCAnQ2FuXFwndCB1c2UgbWlkZGxld2FyZSB3aGVuIGBydW5PblNlcnZlcmAgaXMgZmFsc2UuJyk7XG59O1xuXG4vKlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAY2xhc3MgQ29va2llc1xuICogQHBhcmFtIG9wdHMge09iamVjdH1cbiAqIEBwYXJhbSBvcHRzLlRUTCB7TnVtYmVyfSAtIERlZmF1bHQgY29va2llcyBleHBpcmF0aW9uIHRpbWUgKG1heC1hZ2UpIGluIG1pbGxpc2Vjb25kcywgYnkgZGVmYXVsdCAtIHNlc3Npb24gKGZhbHNlKVxuICogQHBhcmFtIG9wdHMuYXV0byB7Qm9vbGVhbn0gLSBbU2VydmVyXSBBdXRvLWJpbmQgaW4gbWlkZGxld2FyZSBhcyBgcmVxLkNvb2tpZXNgLCBieSBkZWZhdWx0IGB0cnVlYFxuICogQHBhcmFtIG9wdHMuaGFuZGxlciB7RnVuY3Rpb259IC0gW1NlcnZlcl0gTWlkZGxld2FyZSBoYW5kbGVyXG4gKiBAcGFyYW0gb3B0cy5ydW5PblNlcnZlciB7Qm9vbGVhbn0gLSBFeHBvc2UgQ29va2llcyBjbGFzcyB0byBTZXJ2ZXJcbiAqIEBwYXJhbSBvcHRzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzIHtCb29sZWFufSAtIEFsbG93IHBhc3NpbmcgQ29va2llcyBpbiBhIHF1ZXJ5IHN0cmluZyAoaW4gVVJMKS4gUHJpbWFyeSBzaG91bGQgYmUgdXNlZCBvbmx5IGluIENvcmRvdmEgZW52aXJvbm1lbnRcbiAqIEBwYXJhbSBvcHRzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2lucyB7UmVnZXh8Qm9vbGVhbn0gLSBbU2VydmVyXSBBbGxvdyBzZXR0aW5nIENvb2tpZXMgZnJvbSB0aGF0IHNwZWNpZmljIG9yaWdpbiB3aGljaCBpbiBNZXRlb3IvQ29yZG92YSBpcyBsb2NhbGhvc3Q6MTJYWFggKF5odHRwOi8vbG9jYWxob3N0OjEyWzAtOV17M30kKVxuICogQHN1bW1hcnkgTWFpbiBDb29raWUgY2xhc3NcbiAqL1xuY2xhc3MgQ29va2llcyBleHRlbmRzIF9fY29va2llcyB7XG4gIGNvbnN0cnVjdG9yKG9wdHMgPSB7fSkge1xuICAgIG9wdHMuVFRMID0gaGVscGVycy5pc051bWJlcihvcHRzLlRUTCkgPyBvcHRzLlRUTCA6IGZhbHNlO1xuICAgIG9wdHMucnVuT25TZXJ2ZXIgPSAob3B0cy5ydW5PblNlcnZlciAhPT0gZmFsc2UpID8gdHJ1ZSA6IGZhbHNlO1xuICAgIG9wdHMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMgPSAob3B0cy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcyAhPT0gdHJ1ZSkgPyBmYWxzZSA6IHRydWU7XG5cbiAgICBpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG4gICAgICBvcHRzLl9jb29raWVzID0gZG9jdW1lbnQuY29va2llO1xuICAgICAgc3VwZXIob3B0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdHMuX2Nvb2tpZXMgPSB7fTtcbiAgICAgIHN1cGVyKG9wdHMpO1xuICAgICAgb3B0cy5hdXRvID0gKG9wdHMuYXV0byAhPT0gZmFsc2UpID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICAgIHRoaXMuaGFuZGxlciA9IGhlbHBlcnMuaXNGdW5jdGlvbihvcHRzLmhhbmRsZXIpID8gb3B0cy5oYW5kbGVyIDogZmFsc2U7XG4gICAgICB0aGlzLm9uQ29va2llcyA9IGhlbHBlcnMuaXNGdW5jdGlvbihvcHRzLm9uQ29va2llcykgPyBvcHRzLm9uQ29va2llcyA6IGZhbHNlO1xuXG4gICAgICBpZiAob3B0cy5ydW5PblNlcnZlciAmJiAhQ29va2llcy5pc0xvYWRlZE9uU2VydmVyKSB7XG4gICAgICAgIENvb2tpZXMuaXNMb2FkZWRPblNlcnZlciA9IHRydWU7XG4gICAgICAgIGlmIChvcHRzLmF1dG8pIHtcbiAgICAgICAgICBXZWJBcHAuY29ubmVjdEhhbmRsZXJzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICAgIGlmICh1cmxSRS50ZXN0KHJlcS5fcGFyc2VkVXJsLnBhdGgpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG1hdGNoZWRDb3Jkb3ZhT3JpZ2luID0gISFyZXEuaGVhZGVycy5vcmlnaW5cbiAgICAgICAgICAgICAgICAmJiB0aGlzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2luc1xuICAgICAgICAgICAgICAgICYmIHRoaXMuYWxsb3dlZENvcmRvdmFPcmlnaW5zLnRlc3QocmVxLmhlYWRlcnMub3JpZ2luKTtcbiAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlZE9yaWdpbiA9IG1hdGNoZWRDb3Jkb3ZhT3JpZ2luXG4gICAgICAgICAgICAgICAgfHwgKCEhcmVxLmhlYWRlcnMub3JpZ2luICYmIHRoaXMub3JpZ2luUkUudGVzdChyZXEuaGVhZGVycy5vcmlnaW4pKTtcblxuICAgICAgICAgICAgICBpZiAobWF0Y2hlZE9yaWdpbikge1xuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCByZXEuaGVhZGVycy5vcmlnaW4pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgY29va2llc0FycmF5ID0gW107XG4gICAgICAgICAgICAgIGxldCBjb29raWVzT2JqZWN0ID0ge307XG4gICAgICAgICAgICAgIGlmIChtYXRjaGVkQ29yZG92YU9yaWdpbiAmJiBvcHRzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzICYmIHJlcS5xdWVyeS5fX19jb29raWVzX19fKSB7XG4gICAgICAgICAgICAgICAgY29va2llc09iamVjdCA9IHBhcnNlKGRlY29kZVVSSUNvbXBvbmVudChyZXEucXVlcnkuX19fY29va2llc19fXykpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlcS5oZWFkZXJzLmNvb2tpZSkge1xuICAgICAgICAgICAgICAgIGNvb2tpZXNPYmplY3QgPSBwYXJzZShyZXEuaGVhZGVycy5jb29raWUpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgY29va2llc0tleXMgPSBPYmplY3Qua2V5cyhjb29raWVzT2JqZWN0KTtcbiAgICAgICAgICAgICAgaWYgKGNvb2tpZXNLZXlzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29va2llc0tleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHsgY29va2llU3RyaW5nIH0gPSBzZXJpYWxpemUoY29va2llc0tleXNbaV0sIGNvb2tpZXNPYmplY3RbY29va2llc0tleXNbaV1dKTtcbiAgICAgICAgICAgICAgICAgIGlmICghY29va2llc0FycmF5LmluY2x1ZGVzKGNvb2tpZVN0cmluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29va2llc0FycmF5LnB1c2goY29va2llU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY29va2llc0FycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignU2V0LUNvb2tpZScsIGNvb2tpZXNBcnJheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaGVscGVycy5pc0Z1bmN0aW9uKHRoaXMub25Db29raWVzKSAmJiB0aGlzLm9uQ29va2llcyhfX21pZGRsZXdhcmVIYW5kbGVyKHJlcSwgcmVzLCBvcHRzKSk7XG5cbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCgyMDApO1xuICAgICAgICAgICAgICByZXMuZW5kKCcnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcS5Db29raWVzID0gX19taWRkbGV3YXJlSGFuZGxlcihyZXEsIHJlcywgb3B0cyk7XG4gICAgICAgICAgICAgIGhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLmhhbmRsZXIpICYmIHRoaXMuaGFuZGxlcihyZXEuQ29va2llcyk7XG4gICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQG1lbWJlck9mIENvb2tpZXNcbiAgICogQG5hbWUgbWlkZGxld2FyZVxuICAgKiBAc3VtbWFyeSBHZXQgQ29va2llcyBpbnN0YW5jZSBpbnRvIGNhbGxiYWNrXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgbWlkZGxld2FyZSgpIHtcbiAgICBpZiAoIU1ldGVvci5pc1NlcnZlcikge1xuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig1MDAsICdbb3N0cmlvOmNvb2tpZXNdIENhblxcJ3QgdXNlIGAubWlkZGxld2FyZSgpYCBvbiBDbGllbnQsIGl0XFwncyBTZXJ2ZXIgb25seSEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBoZWxwZXJzLmlzRnVuY3Rpb24odGhpcy5oYW5kbGVyKSAmJiB0aGlzLmhhbmRsZXIoX19taWRkbGV3YXJlSGFuZGxlcihyZXEsIHJlcywgdGhpcy5vcHRzKSk7XG4gICAgICBuZXh0KCk7XG4gICAgfTtcbiAgfVxufVxuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gIENvb2tpZXMuaXNMb2FkZWRPblNlcnZlciA9IGZhbHNlO1xufVxuXG4vKiBFeHBvcnQgdGhlIENvb2tpZXMgY2xhc3MgKi9cbmV4cG9ydCB7IENvb2tpZXMgfTtcbiJdfQ==
