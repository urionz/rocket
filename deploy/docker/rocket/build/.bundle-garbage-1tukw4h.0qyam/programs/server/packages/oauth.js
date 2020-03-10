(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var Log = Package.logging.Log;
var URL = Package.url.URL;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var OAuth, OAuthTest, Oauth;

var require = meteorInstall({"node_modules":{"meteor":{"oauth":{"oauth_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/oauth/oauth_server.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let url;
module.link("url", {
  default(v) {
    url = v;
  }

}, 0);
OAuth = {};
OAuthTest = {};
RoutePolicy.declare('/_oauth/', 'network');
const registeredServices = {}; // Internal: Maps from service version to handler function. The
// 'oauth1' and 'oauth2' packages manipulate this directly to register
// for callbacks.

OAuth._requestHandlers = {}; // Register a handler for an OAuth service. The handler will be called
// when we get an incoming http request on /_oauth/{serviceName}. This
// handler should use that information to fetch data about the user
// logging in.
//
// @param name {String} e.g. "google", "facebook"
// @param version {Number} OAuth version (1 or 2)
// @param urls   For OAuth1 only, specify the service's urls
// @param handleOauthRequest {Function(oauthBinding|query)}
//   - (For OAuth1 only) oauthBinding {OAuth1Binding} bound to the appropriate provider
//   - (For OAuth2 only) query {Object} parameters passed in query string
//   - return value is:
//     - {serviceData:, (optional options:)} where serviceData should end
//       up in the user's services[name] field
//     - `null` if the user declined to give permissions
//

OAuth.registerService = (name, version, urls, handleOauthRequest) => {
  if (registeredServices[name]) throw new Error("Already registered the ".concat(name, " OAuth service"));
  registeredServices[name] = {
    serviceName: name,
    version,
    urls,
    handleOauthRequest
  };
}; // For test cleanup.


OAuthTest.unregisterService = name => {
  delete registeredServices[name];
};

OAuth.retrieveCredential = (credentialToken, credentialSecret) => OAuth._retrievePendingCredential(credentialToken, credentialSecret); // The state parameter is normally generated on the client using
// `btoa`, but for tests we need a version that runs on the server.
//


OAuth._generateState = (loginStyle, credentialToken, redirectUrl) => {
  return Buffer.from(JSON.stringify({
    loginStyle: loginStyle,
    credentialToken: credentialToken,
    redirectUrl: redirectUrl
  })).toString('base64');
};

OAuth._stateFromQuery = query => {
  let string;

  try {
    string = Buffer.from(query.state, 'base64').toString('binary');
  } catch (e) {
    Log.warn("Unable to base64 decode state from OAuth query: ".concat(query.state));
    throw e;
  }

  try {
    return JSON.parse(string);
  } catch (e) {
    Log.warn("Unable to parse state from OAuth query: ".concat(string));
    throw e;
  }
};

OAuth._loginStyleFromQuery = query => {
  let style; // For backwards-compatibility for older clients, catch any errors
  // that result from parsing the state parameter. If we can't parse it,
  // set login style to popup by default.

  try {
    style = OAuth._stateFromQuery(query).loginStyle;
  } catch (err) {
    style = "popup";
  }

  if (style !== "popup" && style !== "redirect") {
    throw new Error("Unrecognized login style: ".concat(style));
  }

  return style;
};

OAuth._credentialTokenFromQuery = query => {
  let state; // For backwards-compatibility for older clients, catch any errors
  // that result from parsing the state parameter. If we can't parse it,
  // assume that the state parameter's value is the credential token, as
  // it used to be for older clients.

  try {
    state = OAuth._stateFromQuery(query);
  } catch (err) {
    return query.state;
  }

  return state.credentialToken;
};

OAuth._isCordovaFromQuery = query => {
  try {
    return !!OAuth._stateFromQuery(query).isCordova;
  } catch (err) {
    // For backwards-compatibility for older clients, catch any errors
    // that result from parsing the state parameter. If we can't parse
    // it, assume that we are not on Cordova, since older Meteor didn't
    // do Cordova.
    return false;
  }
}; // Checks if the `redirectUrl` matches the app host.
// We export this function so that developers can override this
// behavior to allow apps from external domains to login using the
// redirect OAuth flow.


OAuth._checkRedirectUrlOrigin = redirectUrl => {
  const appHost = Meteor.absoluteUrl();
  const appHostReplacedLocalhost = Meteor.absoluteUrl(undefined, {
    replaceLocalhost: true
  });
  return redirectUrl.substr(0, appHost.length) !== appHost && redirectUrl.substr(0, appHostReplacedLocalhost.length) !== appHostReplacedLocalhost;
};

const middleware = (req, res, next) => {
  // Make sure to catch any exceptions because otherwise we'd crash
  // the runner
  try {
    const serviceName = oauthServiceName(req);

    if (!serviceName) {
      // not an oauth request. pass to next middleware.
      next();
      return;
    }

    const service = registeredServices[serviceName]; // Skip everything if there's no service set by the oauth middleware

    if (!service) throw new Error("Unexpected OAuth service ".concat(serviceName)); // Make sure we're configured

    ensureConfigured(serviceName);
    const handler = OAuth._requestHandlers[service.version];
    if (!handler) throw new Error("Unexpected OAuth version ".concat(service.version));
    handler(service, req.query, res);
  } catch (err) {
    // if we got thrown an error, save it off, it will get passed to
    // the appropriate login call (if any) and reported there.
    //
    // The other option would be to display it in the popup tab that
    // is still open at this point, ignoring the 'close' or 'redirect'
    // we were passed. But then the developer wouldn't be able to
    // style the error or react to it in any way.
    if (req.query.state && err instanceof Error) {
      try {
        // catch any exceptions to avoid crashing runner
        OAuth._storePendingCredential(OAuth._credentialTokenFromQuery(req.query), err);
      } catch (err) {
        // Ignore the error and just give up. If we failed to store the
        // error, then the login will just fail with a generic error.
        Log.warn("Error in OAuth Server while storing pending login result.\n" + err.stack || err.message);
      }
    } // close the popup. because nobody likes them just hanging
    // there.  when someone sees this multiple times they might
    // think to check server logs (we hope?)
    // Catch errors because any exception here will crash the runner.


    try {
      OAuth._endOfLoginResponse(res, {
        query: req.query,
        loginStyle: OAuth._loginStyleFromQuery(req.query),
        error: err
      });
    } catch (err) {
      Log.warn("Error generating end of login response\n" + (err && (err.stack || err.message)));
    }
  }
}; // Listen to incoming OAuth http requests


WebApp.connectHandlers.use(middleware);
OAuthTest.middleware = middleware; // Handle /_oauth/* paths and extract the service name.
//
// @returns {String|null} e.g. "facebook", or null if this isn't an
// oauth request

const oauthServiceName = req => {
  // req.url will be "/_oauth/<service name>" with an optional "?close".
  const i = req.url.indexOf('?');
  let barePath;
  if (i === -1) barePath = req.url;else barePath = req.url.substring(0, i);
  const splitPath = barePath.split('/'); // Any non-oauth request will continue down the default
  // middlewares.

  if (splitPath[1] !== '_oauth') return null; // Find service based on url

  const serviceName = splitPath[2];
  return serviceName;
}; // Make sure we're configured


const ensureConfigured = serviceName => {
  if (!ServiceConfiguration.configurations.findOne({
    service: serviceName
  })) {
    throw new ServiceConfiguration.ConfigError();
  }
};

const isSafe = value => {
  // This matches strings generated by `Random.secret` and
  // `Random.id`.
  return typeof value === "string" && /^[a-zA-Z0-9\-_]+$/.test(value);
}; // Internal: used by the oauth1 and oauth2 packages


OAuth._renderOauthResults = (res, query, credentialSecret) => {
  // For tests, we support the `only_credential_secret_for_test`
  // parameter, which just returns the credential secret without any
  // surrounding HTML. (The test needs to be able to easily grab the
  // secret and use it to log in.)
  //
  // XXX only_credential_secret_for_test could be useful for other
  // things beside tests, like command-line clients. We should give it a
  // real name and serve the credential secret in JSON.
  if (query.only_credential_secret_for_test) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    res.end(credentialSecret, 'utf-8');
  } else {
    const details = {
      query,
      loginStyle: OAuth._loginStyleFromQuery(query)
    };

    if (query.error) {
      details.error = query.error;
    } else {
      const token = OAuth._credentialTokenFromQuery(query);

      const secret = credentialSecret;

      if (token && secret && isSafe(token) && isSafe(secret)) {
        details.credentials = {
          token: token,
          secret: secret
        };
      } else {
        details.error = "invalid_credential_token_or_secret";
      }
    }

    OAuth._endOfLoginResponse(res, details);
  }
}; // This "template" (not a real Spacebars template, just an HTML file
// with some ##PLACEHOLDER##s) communicates the credential secret back
// to the main window and then closes the popup.


OAuth._endOfPopupResponseTemplate = Assets.getText("end_of_popup_response.html");
OAuth._endOfRedirectResponseTemplate = Assets.getText("end_of_redirect_response.html"); // Renders the end of login response template into some HTML and JavaScript
// that closes the popup or redirects at the end of the OAuth flow.
//
// options are:
//   - loginStyle ("popup" or "redirect")
//   - setCredentialToken (boolean)
//   - credentialToken
//   - credentialSecret
//   - redirectUrl
//   - isCordova (boolean)
//

const renderEndOfLoginResponse = options => {
  // It would be nice to use Blaze here, but it's a little tricky
  // because our mustaches would be inside a <script> tag, and Blaze
  // would treat the <script> tag contents as text (e.g. encode '&' as
  // '&amp;'). So we just do a simple replace.
  const escape = s => {
    if (s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#x27;").replace(/\//g, "&#x2F;");
    } else {
      return s;
    }
  }; // Escape everything just to be safe (we've already checked that some
  // of this data -- the token and secret -- are safe).


  const config = {
    setCredentialToken: !!options.setCredentialToken,
    credentialToken: escape(options.credentialToken),
    credentialSecret: escape(options.credentialSecret),
    storagePrefix: escape(OAuth._storageTokenPrefix),
    redirectUrl: escape(options.redirectUrl),
    isCordova: !!options.isCordova
  };
  let template;

  if (options.loginStyle === 'popup') {
    template = OAuth._endOfPopupResponseTemplate;
  } else if (options.loginStyle === 'redirect') {
    template = OAuth._endOfRedirectResponseTemplate;
  } else {
    throw new Error("invalid loginStyle: ".concat(options.loginStyle));
  }

  const result = template.replace(/##CONFIG##/, JSON.stringify(config)).replace(/##ROOT_URL_PATH_PREFIX##/, __meteor_runtime_config__.ROOT_URL_PATH_PREFIX);
  return "<!DOCTYPE html>\n".concat(result);
}; // Writes an HTTP response to the popup window at the end of an OAuth
// login flow. At this point, if the user has successfully authenticated
// to the OAuth server and authorized this app, we communicate the
// credentialToken and credentialSecret to the main window. The main
// window must provide both these values to the DDP `login` method to
// authenticate its DDP connection. After communicating these vaues to
// the main window, we close the popup.
//
// We export this function so that developers can override this
// behavior, which is particularly useful in, for example, some mobile
// environments where popups and/or `window.opener` don't work. For
// example, an app could override `OAuth._endOfPopupResponse` to put the
// credential token and credential secret in the popup URL for the main
// window to read them there instead of using `window.opener`. If you
// override this function, you take responsibility for writing to the
// request and calling `res.end()` to complete the request.
//
// Arguments:
//   - res: the HTTP response object
//   - details:
//      - query: the query string on the HTTP request
//      - credentials: { token: *, secret: * }. If present, this field
//        indicates that the login was successful. Return these values
//        to the client, who can use them to log in over DDP. If
//        present, the values have been checked against a limited
//        character set and are safe to include in HTML.
//      - error: if present, a string or Error indicating an error that
//        occurred during the login. This can come from the client and
//        so shouldn't be trusted for security decisions or included in
//        the response without sanitizing it first. Only one of `error`
//        or `credentials` should be set.


OAuth._endOfLoginResponse = (res, details) => {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  let redirectUrl;

  if (details.loginStyle === 'redirect') {
    redirectUrl = OAuth._stateFromQuery(details.query).redirectUrl;
    const appHost = Meteor.absoluteUrl();

    if (OAuth._checkRedirectUrlOrigin(redirectUrl)) {
      details.error = "redirectUrl (".concat(redirectUrl) + ") is not on the same host as the app (".concat(appHost, ")");
      redirectUrl = appHost;
    }
  }

  const isCordova = OAuth._isCordovaFromQuery(details.query);

  if (details.error) {
    Log.warn("Error in OAuth Server: " + (details.error instanceof Error ? details.error.message : details.error));
    res.end(renderEndOfLoginResponse({
      loginStyle: details.loginStyle,
      setCredentialToken: false,
      redirectUrl,
      isCordova
    }), "utf-8");
    return;
  } // If we have a credentialSecret, report it back to the parent
  // window, with the corresponding credentialToken. The parent window
  // uses the credentialToken and credentialSecret to log in over DDP.


  res.end(renderEndOfLoginResponse({
    loginStyle: details.loginStyle,
    setCredentialToken: true,
    credentialToken: details.credentials.token,
    credentialSecret: details.credentials.secret,
    redirectUrl,
    isCordova
  }), "utf-8");
};

const OAuthEncryption = Package["oauth-encryption"] && Package["oauth-encryption"].OAuthEncryption;

const usingOAuthEncryption = () => OAuthEncryption && OAuthEncryption.keyIsLoaded(); // Encrypt sensitive service data such as access tokens if the
// "oauth-encryption" package is loaded and the oauth secret key has
// been specified.  Returns the unencrypted plaintext otherwise.
//
// The user id is not specified because the user isn't known yet at
// this point in the oauth authentication process.  After the oauth
// authentication process completes the encrypted service data fields
// will be re-encrypted with the user id included before inserting the
// service data into the user document.
//


OAuth.sealSecret = plaintext => {
  if (usingOAuthEncryption()) return OAuthEncryption.seal(plaintext);else return plaintext;
}; // Unencrypt a service data field, if the "oauth-encryption"
// package is loaded and the field is encrypted.
//
// Throws an error if the "oauth-encryption" package is loaded and the
// field is encrypted, but the oauth secret key hasn't been specified.
//


OAuth.openSecret = (maybeSecret, userId) => {
  if (!Package["oauth-encryption"] || !OAuthEncryption.isSealed(maybeSecret)) return maybeSecret;
  return OAuthEncryption.open(maybeSecret, userId);
}; // Unencrypt fields in the service data object.
//


OAuth.openSecrets = (serviceData, userId) => {
  const result = {};
  Object.keys(serviceData).forEach(key => result[key] = OAuth.openSecret(serviceData[key], userId));
  return result;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"pending_credentials.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/oauth/pending_credentials.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
//
// When an oauth request is made, Meteor receives oauth credentials
// in one browser tab, and temporarily persists them while that
// tab is closed, then retrieves them in the browser tab that
// initiated the credential request.
//
// _pendingCredentials is the storage mechanism used to share the
// credential between the 2 tabs
//
// Collection containing pending credentials of oauth credential requests
// Has key, credential, and createdAt fields.
OAuth._pendingCredentials = new Mongo.Collection("meteor_oauth_pendingCredentials", {
  _preventAutopublish: true
});

OAuth._pendingCredentials._ensureIndex('key', {
  unique: 1
});

OAuth._pendingCredentials._ensureIndex('credentialSecret');

OAuth._pendingCredentials._ensureIndex('createdAt'); // Periodically clear old entries that were never retrieved


const _cleanStaleResults = () => {
  // Remove credentials older than 1 minute
  const timeCutoff = new Date();
  timeCutoff.setMinutes(timeCutoff.getMinutes() - 1);

  OAuth._pendingCredentials.remove({
    createdAt: {
      $lt: timeCutoff
    }
  });
};

const _cleanupHandle = Meteor.setInterval(_cleanStaleResults, 60 * 1000); // Stores the key and credential in the _pendingCredentials collection.
// Will throw an exception if `key` is not a string.
//
// @param key {string}
// @param credential {Object}   The credential to store
// @param credentialSecret {string} A secret that must be presented in
//   addition to the `key` to retrieve the credential
//


OAuth._storePendingCredential = function (key, credential) {
  let credentialSecret = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  check(key, String);
  check(credentialSecret, Match.Maybe(String));

  if (credential instanceof Error) {
    credential = storableError(credential);
  } else {
    credential = OAuth.sealSecret(credential);
  } // We do an upsert here instead of an insert in case the user happens
  // to somehow send the same `state` parameter twice during an OAuth
  // login; we don't want a duplicate key error.


  OAuth._pendingCredentials.upsert({
    key
  }, {
    key,
    credential,
    credentialSecret,
    createdAt: new Date()
  });
}; // Retrieves and removes a credential from the _pendingCredentials collection
//
// @param key {string}
// @param credentialSecret {string}
//


OAuth._retrievePendingCredential = function (key) {
  let credentialSecret = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  check(key, String);

  const pendingCredential = OAuth._pendingCredentials.findOne({
    key,
    credentialSecret
  });

  if (pendingCredential) {
    OAuth._pendingCredentials.remove({
      _id: pendingCredential._id
    });

    if (pendingCredential.credential.error) return recreateError(pendingCredential.credential.error);else return OAuth.openSecret(pendingCredential.credential);
  } else {
    return undefined;
  }
}; // Convert an Error into an object that can be stored in mongo
// Note: A Meteor.Error is reconstructed as a Meteor.Error
// All other error classes are reconstructed as a plain Error.
// TODO: Can we do this more simply with EJSON?


const storableError = error => {
  const plainObject = {};
  Object.getOwnPropertyNames(error).forEach(key => plainObject[key] = error[key]); // Keep track of whether it's a Meteor.Error

  if (error instanceof Meteor.Error) {
    plainObject['meteorError'] = true;
  }

  return {
    error: plainObject
  };
}; // Create an error from the error format stored in mongo


const recreateError = errorDoc => {
  let error;

  if (errorDoc.meteorError) {
    error = new Meteor.Error();
    delete errorDoc.meteorError;
  } else {
    error = new Error();
  }

  Object.getOwnPropertyNames(errorDoc).forEach(key => error[key] = errorDoc[key]);
  return error;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"oauth_common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/oauth/oauth_common.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
OAuth._storageTokenPrefix = "Meteor.oauth.credentialSecret-";

OAuth._redirectUri = (serviceName, config, params, absoluteUrlOptions) => {
  // XXX COMPAT WITH 0.9.0
  // The redirect URI used to have a "?close" query argument.  We
  // detect whether we need to be backwards compatible by checking for
  // the absence of the `loginStyle` field, which wasn't used in the
  // code which had the "?close" argument.
  // This logic is duplicated in the tool so that the tool can do OAuth
  // flow with <= 0.9.0 servers (tools/auth.js).
  const query = config.loginStyle ? null : "close"; // Clone because we're going to mutate 'params'. The 'cordova' and
  // 'android' parameters are only used for picking the host of the
  // redirect URL, and not actually included in the redirect URL itself.

  let isCordova = false;
  let isAndroid = false;

  if (params) {
    params = _objectSpread({}, params);
    isCordova = params.cordova;
    isAndroid = params.android;
    delete params.cordova;
    delete params.android;

    if (Object.keys(params).length === 0) {
      params = undefined;
    }
  }

  if (Meteor.isServer && isCordova) {
    const url = Npm.require('url');

    let rootUrl = process.env.MOBILE_ROOT_URL || __meteor_runtime_config__.ROOT_URL;

    if (isAndroid) {
      // Match the replace that we do in cordova boilerplate
      // (boilerplate-generator package).
      // XXX Maybe we should put this in a separate package or something
      // that is used here and by boilerplate-generator? Or maybe
      // `Meteor.absoluteUrl` should know how to do this?
      const parsedRootUrl = url.parse(rootUrl);

      if (parsedRootUrl.hostname === "localhost") {
        parsedRootUrl.hostname = "10.0.2.2";
        delete parsedRootUrl.host;
      }

      rootUrl = url.format(parsedRootUrl);
    }

    absoluteUrlOptions = _objectSpread({}, absoluteUrlOptions, {
      // For Cordova clients, redirect to the special Cordova root url
      // (likely a local IP in development mode).
      rootUrl
    });
  }

  return URL._constructUrl(Meteor.absoluteUrl("_oauth/".concat(serviceName), absoluteUrlOptions), query, params);
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"deprecated.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/oauth/deprecated.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// XXX COMPAT WITH 0.8.0
Oauth = OAuth;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/oauth/oauth_server.js");
require("/node_modules/meteor/oauth/pending_credentials.js");
require("/node_modules/meteor/oauth/oauth_common.js");
require("/node_modules/meteor/oauth/deprecated.js");

/* Exports */
Package._define("oauth", {
  OAuth: OAuth,
  OAuthTest: OAuthTest,
  Oauth: Oauth
});

})();

//# sourceURL=meteor://💻app/packages/oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2F1dGgvb2F1dGhfc2VydmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vYXV0aC9wZW5kaW5nX2NyZWRlbnRpYWxzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vYXV0aC9vYXV0aF9jb21tb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29hdXRoL2RlcHJlY2F0ZWQuanMiXSwibmFtZXMiOlsidXJsIiwibW9kdWxlIiwibGluayIsImRlZmF1bHQiLCJ2IiwiT0F1dGgiLCJPQXV0aFRlc3QiLCJSb3V0ZVBvbGljeSIsImRlY2xhcmUiLCJyZWdpc3RlcmVkU2VydmljZXMiLCJfcmVxdWVzdEhhbmRsZXJzIiwicmVnaXN0ZXJTZXJ2aWNlIiwibmFtZSIsInZlcnNpb24iLCJ1cmxzIiwiaGFuZGxlT2F1dGhSZXF1ZXN0IiwiRXJyb3IiLCJzZXJ2aWNlTmFtZSIsInVucmVnaXN0ZXJTZXJ2aWNlIiwicmV0cmlldmVDcmVkZW50aWFsIiwiY3JlZGVudGlhbFRva2VuIiwiY3JlZGVudGlhbFNlY3JldCIsIl9yZXRyaWV2ZVBlbmRpbmdDcmVkZW50aWFsIiwiX2dlbmVyYXRlU3RhdGUiLCJsb2dpblN0eWxlIiwicmVkaXJlY3RVcmwiLCJCdWZmZXIiLCJmcm9tIiwiSlNPTiIsInN0cmluZ2lmeSIsInRvU3RyaW5nIiwiX3N0YXRlRnJvbVF1ZXJ5IiwicXVlcnkiLCJzdHJpbmciLCJzdGF0ZSIsImUiLCJMb2ciLCJ3YXJuIiwicGFyc2UiLCJfbG9naW5TdHlsZUZyb21RdWVyeSIsInN0eWxlIiwiZXJyIiwiX2NyZWRlbnRpYWxUb2tlbkZyb21RdWVyeSIsIl9pc0NvcmRvdmFGcm9tUXVlcnkiLCJpc0NvcmRvdmEiLCJfY2hlY2tSZWRpcmVjdFVybE9yaWdpbiIsImFwcEhvc3QiLCJNZXRlb3IiLCJhYnNvbHV0ZVVybCIsImFwcEhvc3RSZXBsYWNlZExvY2FsaG9zdCIsInVuZGVmaW5lZCIsInJlcGxhY2VMb2NhbGhvc3QiLCJzdWJzdHIiLCJsZW5ndGgiLCJtaWRkbGV3YXJlIiwicmVxIiwicmVzIiwibmV4dCIsIm9hdXRoU2VydmljZU5hbWUiLCJzZXJ2aWNlIiwiZW5zdXJlQ29uZmlndXJlZCIsImhhbmRsZXIiLCJfc3RvcmVQZW5kaW5nQ3JlZGVudGlhbCIsInN0YWNrIiwibWVzc2FnZSIsIl9lbmRPZkxvZ2luUmVzcG9uc2UiLCJlcnJvciIsIldlYkFwcCIsImNvbm5lY3RIYW5kbGVycyIsInVzZSIsImkiLCJpbmRleE9mIiwiYmFyZVBhdGgiLCJzdWJzdHJpbmciLCJzcGxpdFBhdGgiLCJzcGxpdCIsIlNlcnZpY2VDb25maWd1cmF0aW9uIiwiY29uZmlndXJhdGlvbnMiLCJmaW5kT25lIiwiQ29uZmlnRXJyb3IiLCJpc1NhZmUiLCJ2YWx1ZSIsInRlc3QiLCJfcmVuZGVyT2F1dGhSZXN1bHRzIiwib25seV9jcmVkZW50aWFsX3NlY3JldF9mb3JfdGVzdCIsIndyaXRlSGVhZCIsImVuZCIsImRldGFpbHMiLCJ0b2tlbiIsInNlY3JldCIsImNyZWRlbnRpYWxzIiwiX2VuZE9mUG9wdXBSZXNwb25zZVRlbXBsYXRlIiwiQXNzZXRzIiwiZ2V0VGV4dCIsIl9lbmRPZlJlZGlyZWN0UmVzcG9uc2VUZW1wbGF0ZSIsInJlbmRlckVuZE9mTG9naW5SZXNwb25zZSIsIm9wdGlvbnMiLCJlc2NhcGUiLCJzIiwicmVwbGFjZSIsImNvbmZpZyIsInNldENyZWRlbnRpYWxUb2tlbiIsInN0b3JhZ2VQcmVmaXgiLCJfc3RvcmFnZVRva2VuUHJlZml4IiwidGVtcGxhdGUiLCJyZXN1bHQiLCJfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fIiwiUk9PVF9VUkxfUEFUSF9QUkVGSVgiLCJPQXV0aEVuY3J5cHRpb24iLCJQYWNrYWdlIiwidXNpbmdPQXV0aEVuY3J5cHRpb24iLCJrZXlJc0xvYWRlZCIsInNlYWxTZWNyZXQiLCJwbGFpbnRleHQiLCJzZWFsIiwib3BlblNlY3JldCIsIm1heWJlU2VjcmV0IiwidXNlcklkIiwiaXNTZWFsZWQiLCJvcGVuIiwib3BlblNlY3JldHMiLCJzZXJ2aWNlRGF0YSIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwiX3BlbmRpbmdDcmVkZW50aWFscyIsIk1vbmdvIiwiQ29sbGVjdGlvbiIsIl9wcmV2ZW50QXV0b3B1Ymxpc2giLCJfZW5zdXJlSW5kZXgiLCJ1bmlxdWUiLCJfY2xlYW5TdGFsZVJlc3VsdHMiLCJ0aW1lQ3V0b2ZmIiwiRGF0ZSIsInNldE1pbnV0ZXMiLCJnZXRNaW51dGVzIiwicmVtb3ZlIiwiY3JlYXRlZEF0IiwiJGx0IiwiX2NsZWFudXBIYW5kbGUiLCJzZXRJbnRlcnZhbCIsImNyZWRlbnRpYWwiLCJjaGVjayIsIlN0cmluZyIsIk1hdGNoIiwiTWF5YmUiLCJzdG9yYWJsZUVycm9yIiwidXBzZXJ0IiwicGVuZGluZ0NyZWRlbnRpYWwiLCJfaWQiLCJyZWNyZWF0ZUVycm9yIiwicGxhaW5PYmplY3QiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwiZXJyb3JEb2MiLCJtZXRlb3JFcnJvciIsIl9vYmplY3RTcHJlYWQiLCJfcmVkaXJlY3RVcmkiLCJwYXJhbXMiLCJhYnNvbHV0ZVVybE9wdGlvbnMiLCJpc0FuZHJvaWQiLCJjb3Jkb3ZhIiwiYW5kcm9pZCIsImlzU2VydmVyIiwiTnBtIiwicmVxdWlyZSIsInJvb3RVcmwiLCJwcm9jZXNzIiwiZW52IiwiTU9CSUxFX1JPT1RfVVJMIiwiUk9PVF9VUkwiLCJwYXJzZWRSb290VXJsIiwiaG9zdG5hbWUiLCJob3N0IiwiZm9ybWF0IiwiVVJMIiwiX2NvbnN0cnVjdFVybCIsIk9hdXRoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUlBLEdBQUo7QUFBUUMsTUFBTSxDQUFDQyxJQUFQLENBQVksS0FBWixFQUFrQjtBQUFDQyxTQUFPLENBQUNDLENBQUQsRUFBRztBQUFDSixPQUFHLEdBQUNJLENBQUo7QUFBTTs7QUFBbEIsQ0FBbEIsRUFBc0Ms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QUErQixDQUFuQyxFQUFzQztBQUNwQ3lHLFlBQU0sR0FBRzVHLFNBQVQ7QUFDRDtBQUNGOztBQUVELE1BQUlILE1BQU0sQ0FBQ29ILFFBQVAsSUFBbUJ2SCxTQUF2QixFQUFrQztBQUNoQyxVQUFNNUMsR0FBRyxHQUFHb0ssR0FBRyxDQUFDQyxPQUFKLENBQVksS0FBWixDQUFaOztBQUNBLFFBQUlDLE9BQU8sR0FBR0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLGVBQVosSUFDUi9ELHlCQUF5QixDQUFDZ0UsUUFEaEM7O0FBR0EsUUFBSVYsU0FBSixFQUFlO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQU1XLGFBQWEsR0FBRzNLLEdBQUcsQ0FBQ3NDLEtBQUosQ0FBVWdJLE9BQVYsQ0FBdEI7O0FBQ0EsVUFBSUssYUFBYSxDQUFDQyxRQUFkLEtBQTJCLFdBQS9CLEVBQTRDO0FBQzFDRCxxQkFBYSxDQUFDQyxRQUFkLEdBQXlCLFVBQXpCO0FBQ0EsZUFBT0QsYUFBYSxDQUFDRSxJQUFyQjtBQUNEOztBQUNEUCxhQUFPLEdBQUd0SyxHQUFHLENBQUM4SyxNQUFKLENBQVdILGFBQVgsQ0FBVjtBQUNEOztBQUVEWixzQkFBa0IscUJBQ2JBLGtCQURhO0FBRWhCO0FBQ0E7QUFDQU87QUFKZ0IsTUFBbEI7QUFNRDs7QUFFRCxTQUFPUyxHQUFHLENBQUNDLGFBQUosQ0FDTGpJLE1BQU0sQ0FBQ0MsV0FBUCxrQkFBNkIvQixXQUE3QixHQUE0QzhJLGtCQUE1QyxDQURLLEVBRUwvSCxLQUZLLEVBR0w4SCxNQUhLLENBQVA7QUFJRCxDQXpERCxDOzs7Ozs7Ozs7OztBQ0ZBO0FBRUFtQixLQUFLLEdBQUc1SyxLQUFSLEMiLCJmaWxlIjoiL3BhY2thZ2VzL29hdXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuXG5PQXV0aCA9IHt9O1xuT0F1dGhUZXN0ID0ge307XG5cblJvdXRlUG9saWN5LmRlY2xhcmUoJy9fb2F1dGgvJywgJ25ldHdvcmsnKTtcblxuY29uc3QgcmVnaXN0ZXJlZFNlcnZpY2VzID0ge307XG5cbi8vIEludGVybmFsOiBNYXBzIGZyb20gc2VydmljZSB2ZXJzaW9uIHRvIGhhbmRsZXIgZnVuY3Rpb24uIFRoZVxuLy8gJ29hdXRoMScgYW5kICdvYXV0aDInIHBhY2thZ2VzIG1hbmlwdWxhdGUgdGhpcyBkaXJlY3RseSB0byByZWdpc3RlclxuLy8gZm9yIGNhbGxiYWNrcy5cbk9BdXRoLl9yZXF1ZXN0SGFuZGxlcnMgPSB7fTtcblxuXG4vLyBSZWdpc3RlciBhIGhhbmRsZXIgZm9yIGFuIE9BdXRoIHNlcnZpY2UuIFRoZSBoYW5kbGVyIHdpbGwgYmUgY2FsbGVkXG4vLyB3aGVuIHdlIGdldCBhbiBpbmNvbWluZyBodHRwIHJlcXVlc3Qgb24gL19vYXV0aC97c2VydmljZU5hbWV9LiBUaGlzXG4vLyBoYW5kbGVyIHNob3VsZCB1c2UgdGhhdCBpbmZvcm1hdGlvbiB0byBmZXRjaCBkYXRhIGFib3V0IHRoZSB1c2VyXG4vLyBsb2dnaW5nIGluLlxuLy9cbi8vIEBwYXJhbSBuYW1lIHtTdHJpbmd9IGUuZy4gXCJnb29nbGVcIiwgXCJmYWNlYm9va1wiXG4vLyBAcGFyYW0gdmVyc2lvbiB7TnVtYmVyfSBPQXV0aCB2ZXJzaW9uICgxIG9yIDIpXG4vLyBAcGFyYW0gdXJscyAgIEZvciBPQXV0aDEgb25seSwgc3BlY2lmeSB0aGUgc2VydmljZSdzIHVybHNcbi8vIEBwYXJhbSBoYW5kbGVPYXV0aFJlcXVlc3Qge0Z1bmN0aW9uKG9hdXRoQmluZGluZ3xxdWVyeSl9XG4vLyAgIC0gKEZvciBPQXV0aDEgb25seSkgb2F1dGhCaW5kaW5nIHtPQXV0aDFCaW5kaW5nfSBib3VuZCB0byB0aGUgYXBwcm9wcmlhdGUgcHJvdmlkZXJcbi8vICAgLSAoRm9yIE9BdXRoMiBvbmx5KSBxdWVyeSB7T2JqZWN0fSBwYXJhbWV0ZXJzIHBhc3NlZCBpbiBxdWVyeSBzdHJpbmdcbi8vICAgLSByZXR1cm4gdmFsdWUgaXM6XG4vLyAgICAgLSB7c2VydmljZURhdGE6LCAob3B0aW9uYWwgb3B0aW9uczopfSB3aGVyZSBzZXJ2aWNlRGF0YSBzaG91bGQgZW5kXG4vLyAgICAgICB1cCBpbiB0aGUgdXNlcidzIHNlcnZpY2VzW25hbWVdIGZpZWxkXG4vLyAgICAgLSBgbnVsbGAgaWYgdGhlIHVzZXIgZGVjbGluZWQgdG8gZ2l2ZSBwZXJtaXNzaW9uc1xuLy9cbk9BdXRoLnJlZ2lzdGVyU2VydmljZSA9IChuYW1lLCB2ZXJzaW9uLCB1cmxzLCBoYW5kbGVPYXV0aFJlcXVlc3QpID0+IHtcbiAgaWYgKHJlZ2lzdGVyZWRTZXJ2aWNlc1tuYW1lXSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEFscmVhZHkgcmVnaXN0ZXJlZCB0aGUgJHtuYW1lfSBPQXV0aCBzZXJ2aWNlYCk7XG5cbiAgcmVnaXN0ZXJlZFNlcnZpY2VzW25hbWVdID0ge1xuICAgIHNlcnZpY2VOYW1lOiBuYW1lLFxuICAgIHZlcnNpb24sXG4gICAgdXJscyxcbiAgICBoYW5kbGVPYXV0aFJlcXVlc3QsXG4gIH07XG59O1xuXG4vLyBGb3IgdGVzdCBjbGVhbnVwLlxuT0F1dGhUZXN0LnVucmVnaXN0ZXJTZXJ2aWNlID0gbmFtZSA9PiB7XG4gIGRlbGV0ZSByZWdpc3RlcmVkU2VydmljZXNbbmFtZV07XG59O1xuXG5cbk9BdXRoLnJldHJpZXZlQ3JlZGVudGlhbCA9IChjcmVkZW50aWFsVG9rZW4sIGNyZWRlbnRpYWxTZWNyZXQpID0+XG4gIE9BdXRoLl9yZXRyaWV2ZVBlbmRpbmdDcmVkZW50aWFsKGNyZWRlbnRpYWxUb2tlbiwgY3JlZGVudGlhbFNlY3JldCk7XG5cblxuLy8gVGhlIHN0YXRlIHBhcmFtZXRlciBpcyBub3JtYWxseSBnZW5lcmF0ZWQgb24gdGhlIGNsaWVudCB1c2luZ1xuLy8gYGJ0b2FgLCBidXQgZm9yIHRlc3RzIHdlIG5lZWQgYSB2ZXJzaW9uIHRoYXQgcnVucyBvbiB0aGUgc2VydmVyLlxuLy9cbk9BdXRoLl9nZW5lcmF0ZVN0YXRlID0gKGxvZ2luU3R5bGUsIGNyZWRlbnRpYWxUb2tlbiwgcmVkaXJlY3RVcmwpID0+IHtcbiAgcmV0dXJuIEJ1ZmZlci5mcm9tKEpTT04uc3RyaW5naWZ5KHtcbiAgICBsb2dpblN0eWxlOiBsb2dpblN0eWxlLFxuICAgIGNyZWRlbnRpYWxUb2tlbjogY3JlZGVudGlhbFRva2VuLFxuICAgIHJlZGlyZWN0VXJsOiByZWRpcmVjdFVybH0pKS50b1N0cmluZygnYmFzZTY0Jyk7XG59O1xuXG5PQXV0aC5fc3RhdGVGcm9tUXVlcnkgPSBxdWVyeSA9PiB7XG4gIGxldCBzdHJpbmc7XG4gIHRyeSB7XG4gICAgc3RyaW5nID0gQnVmZmVyLmZyb20ocXVlcnkuc3RhdGUsICdiYXNlNjQnKS50b1N0cmluZygnYmluYXJ5Jyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBMb2cud2FybihgVW5hYmxlIHRvIGJhc2U2NCBkZWNvZGUgc3RhdGUgZnJvbSBPQXV0aCBxdWVyeTogJHtxdWVyeS5zdGF0ZX1gKTtcbiAgICB0aHJvdyBlO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShzdHJpbmcpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgTG9nLndhcm4oYFVuYWJsZSB0byBwYXJzZSBzdGF0ZSBmcm9tIE9BdXRoIHF1ZXJ5OiAke3N0cmluZ31gKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuXG5PQXV0aC5fbG9naW5TdHlsZUZyb21RdWVyeSA9IHF1ZXJ5ID0+IHtcbiAgbGV0IHN0eWxlO1xuICAvLyBGb3IgYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIG9sZGVyIGNsaWVudHMsIGNhdGNoIGFueSBlcnJvcnNcbiAgLy8gdGhhdCByZXN1bHQgZnJvbSBwYXJzaW5nIHRoZSBzdGF0ZSBwYXJhbWV0ZXIuIElmIHdlIGNhbid0IHBhcnNlIGl0LFxuICAvLyBzZXQgbG9naW4gc3R5bGUgdG8gcG9wdXAgYnkgZGVmYXVsdC5cbiAgdHJ5IHtcbiAgICBzdHlsZSA9IE9BdXRoLl9zdGF0ZUZyb21RdWVyeShxdWVyeSkubG9naW5TdHlsZTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgc3R5bGUgPSBcInBvcHVwXCI7XG4gIH1cbiAgaWYgKHN0eWxlICE9PSBcInBvcHVwXCIgJiYgc3R5bGUgIT09IFwicmVkaXJlY3RcIikge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIGxvZ2luIHN0eWxlOiAke3N0eWxlfWApO1xuICB9XG4gIHJldHVybiBzdHlsZTtcbn07XG5cbk9BdXRoLl9jcmVkZW50aWFsVG9rZW5Gcm9tUXVlcnkgPSBxdWVyeSA9PiB7XG4gIGxldCBzdGF0ZTtcbiAgLy8gRm9yIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciBvbGRlciBjbGllbnRzLCBjYXRjaCBhbnkgZXJyb3JzXG4gIC8vIHRoYXQgcmVzdWx0IGZyb20gcGFyc2luZyB0aGUgc3RhdGUgcGFyYW1ldGVyLiBJZiB3ZSBjYW4ndCBwYXJzZSBpdCxcbiAgLy8gYXNzdW1lIHRoYXQgdGhlIHN0YXRlIHBhcmFtZXRlcidzIHZhbHVlIGlzIHRoZSBjcmVkZW50aWFsIHRva2VuLCBhc1xuICAvLyBpdCB1c2VkIHRvIGJlIGZvciBvbGRlciBjbGllbnRzLlxuICB0cnkge1xuICAgIHN0YXRlID0gT0F1dGguX3N0YXRlRnJvbVF1ZXJ5KHF1ZXJ5KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIHF1ZXJ5LnN0YXRlO1xuICB9XG4gIHJldHVybiBzdGF0ZS5jcmVkZW50aWFsVG9rZW47XG59O1xuXG5PQXV0aC5faXNDb3Jkb3ZhRnJvbVF1ZXJ5ID0gcXVlcnkgPT4ge1xuICB0cnkge1xuICAgIHJldHVybiAhISBPQXV0aC5fc3RhdGVGcm9tUXVlcnkocXVlcnkpLmlzQ29yZG92YTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gRm9yIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciBvbGRlciBjbGllbnRzLCBjYXRjaCBhbnkgZXJyb3JzXG4gICAgLy8gdGhhdCByZXN1bHQgZnJvbSBwYXJzaW5nIHRoZSBzdGF0ZSBwYXJhbWV0ZXIuIElmIHdlIGNhbid0IHBhcnNlXG4gICAgLy8gaXQsIGFzc3VtZSB0aGF0IHdlIGFyZSBub3Qgb24gQ29yZG92YSwgc2luY2Ugb2xkZXIgTWV0ZW9yIGRpZG4ndFxuICAgIC8vIGRvIENvcmRvdmEuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG4vLyBDaGVja3MgaWYgdGhlIGByZWRpcmVjdFVybGAgbWF0Y2hlcyB0aGUgYXBwIGhvc3QuXG4vLyBXZSBleHBvcnQgdGhpcyBmdW5jdGlvbiBzbyB0aGF0IGRldmVsb3BlcnMgY2FuIG92ZXJyaWRlIHRoaXNcbi8vIGJlaGF2aW9yIHRvIGFsbG93IGFwcHMgZnJvbSBleHRlcm5hbCBkb21haW5zIHRvIGxvZ2luIHVzaW5nIHRoZVxuLy8gcmVkaXJlY3QgT0F1dGggZmxvdy5cbk9BdXRoLl9jaGVja1JlZGlyZWN0VXJsT3JpZ2luID0gcmVkaXJlY3RVcmwgPT4ge1xuICBjb25zdCBhcHBIb3N0ID0gTWV0ZW9yLmFic29sdXRlVXJsKCk7XG4gIGNvbnN0IGFwcEhvc3RSZXBsYWNlZExvY2FsaG9zdCA9IE1ldGVvci5hYnNvbHV0ZVVybCh1bmRlZmluZWQsIHtcbiAgICByZXBsYWNlTG9jYWxob3N0OiB0cnVlXG4gIH0pO1xuICByZXR1cm4gKFxuICAgIHJlZGlyZWN0VXJsLnN1YnN0cigwLCBhcHBIb3N0Lmxlbmd0aCkgIT09IGFwcEhvc3QgJiZcbiAgICByZWRpcmVjdFVybC5zdWJzdHIoMCwgYXBwSG9zdFJlcGxhY2VkTG9jYWxob3N0Lmxlbmd0aCkgIT09IGFwcEhvc3RSZXBsYWNlZExvY2FsaG9zdFxuICApO1xufTtcblxuY29uc3QgbWlkZGxld2FyZSA9IChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAvLyBNYWtlIHN1cmUgdG8gY2F0Y2ggYW55IGV4Y2VwdGlvbnMgYmVjYXVzZSBvdGhlcndpc2Ugd2UnZCBjcmFzaFxuICAvLyB0aGUgcnVubmVyXG4gIHRyeSB7XG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBvYXV0aFNlcnZpY2VOYW1lKHJlcSk7XG4gICAgaWYgKCFzZXJ2aWNlTmFtZSkge1xuICAgICAgLy8gbm90IGFuIG9hdXRoIHJlcXVlc3QuIHBhc3MgdG8gbmV4dCBtaWRkbGV3YXJlLlxuICAgICAgbmV4dCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlcnZpY2UgPSByZWdpc3RlcmVkU2VydmljZXNbc2VydmljZU5hbWVdO1xuXG4gICAgLy8gU2tpcCBldmVyeXRoaW5nIGlmIHRoZXJlJ3Mgbm8gc2VydmljZSBzZXQgYnkgdGhlIG9hdXRoIG1pZGRsZXdhcmVcbiAgICBpZiAoIXNlcnZpY2UpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgT0F1dGggc2VydmljZSAke3NlcnZpY2VOYW1lfWApO1xuXG4gICAgLy8gTWFrZSBzdXJlIHdlJ3JlIGNvbmZpZ3VyZWRcbiAgICBlbnN1cmVDb25maWd1cmVkKHNlcnZpY2VOYW1lKTtcblxuICAgIGNvbnN0IGhhbmRsZXIgPSBPQXV0aC5fcmVxdWVzdEhhbmRsZXJzW3NlcnZpY2UudmVyc2lvbl07XG4gICAgaWYgKCFoYW5kbGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIE9BdXRoIHZlcnNpb24gJHtzZXJ2aWNlLnZlcnNpb259YCk7XG4gICAgaGFuZGxlcihzZXJ2aWNlLCByZXEucXVlcnksIHJlcyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIC8vIGlmIHdlIGdvdCB0aHJvd24gYW4gZXJyb3IsIHNhdmUgaXQgb2ZmLCBpdCB3aWxsIGdldCBwYXNzZWQgdG9cbiAgICAvLyB0aGUgYXBwcm9wcmlhdGUgbG9naW4gY2FsbCAoaWYgYW55KSBhbmQgcmVwb3J0ZWQgdGhlcmUuXG4gICAgLy9cbiAgICAvLyBUaGUgb3RoZXIgb3B0aW9uIHdvdWxkIGJlIHRvIGRpc3BsYXkgaXQgaW4gdGhlIHBvcHVwIHRhYiB0aGF0XG4gICAgLy8gaXMgc3RpbGwgb3BlbiBhdCB0aGlzIHBvaW50LCBpZ25vcmluZyB0aGUgJ2Nsb3NlJyBvciAncmVkaXJlY3QnXG4gICAgLy8gd2Ugd2VyZSBwYXNzZWQuIEJ1dCB0aGVuIHRoZSBkZXZlbG9wZXIgd291bGRuJ3QgYmUgYWJsZSB0b1xuICAgIC8vIHN0eWxlIHRoZSBlcnJvciBvciByZWFjdCB0byBpdCBpbiBhbnkgd2F5LlxuICAgIGlmIChyZXEucXVlcnkuc3RhdGUgJiYgZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRyeSB7IC8vIGNhdGNoIGFueSBleGNlcHRpb25zIHRvIGF2b2lkIGNyYXNoaW5nIHJ1bm5lclxuICAgICAgICBPQXV0aC5fc3RvcmVQZW5kaW5nQ3JlZGVudGlhbChPQXV0aC5fY3JlZGVudGlhbFRva2VuRnJvbVF1ZXJ5KHJlcS5xdWVyeSksIGVycik7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBlcnJvciBhbmQganVzdCBnaXZlIHVwLiBJZiB3ZSBmYWlsZWQgdG8gc3RvcmUgdGhlXG4gICAgICAgIC8vIGVycm9yLCB0aGVuIHRoZSBsb2dpbiB3aWxsIGp1c3QgZmFpbCB3aXRoIGEgZ2VuZXJpYyBlcnJvci5cbiAgICAgICAgTG9nLndhcm4oXCJFcnJvciBpbiBPQXV0aCBTZXJ2ZXIgd2hpbGUgc3RvcmluZyBwZW5kaW5nIGxvZ2luIHJlc3VsdC5cXG5cIiArXG4gICAgICAgICAgICAgICAgIGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2xvc2UgdGhlIHBvcHVwLiBiZWNhdXNlIG5vYm9keSBsaWtlcyB0aGVtIGp1c3QgaGFuZ2luZ1xuICAgIC8vIHRoZXJlLiAgd2hlbiBzb21lb25lIHNlZXMgdGhpcyBtdWx0aXBsZSB0aW1lcyB0aGV5IG1pZ2h0XG4gICAgLy8gdGhpbmsgdG8gY2hlY2sgc2VydmVyIGxvZ3MgKHdlIGhvcGU/KVxuICAgIC8vIENhdGNoIGVycm9ycyBiZWNhdXNlIGFueSBleGNlcHRpb24gaGVyZSB3aWxsIGNyYXNoIHRoZSBydW5uZXIuXG4gICAgdHJ5IHtcbiAgICAgIE9BdXRoLl9lbmRPZkxvZ2luUmVzcG9uc2UocmVzLCB7XG4gICAgICAgIHF1ZXJ5OiByZXEucXVlcnksXG4gICAgICAgIGxvZ2luU3R5bGU6IE9BdXRoLl9sb2dpblN0eWxlRnJvbVF1ZXJ5KHJlcS5xdWVyeSksXG4gICAgICAgIGVycm9yOiBlcnJcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgTG9nLndhcm4oXCJFcnJvciBnZW5lcmF0aW5nIGVuZCBvZiBsb2dpbiByZXNwb25zZVxcblwiICtcbiAgICAgICAgICAgICAgIChlcnIgJiYgKGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSkpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIExpc3RlbiB0byBpbmNvbWluZyBPQXV0aCBodHRwIHJlcXVlc3RzXG5XZWJBcHAuY29ubmVjdEhhbmRsZXJzLnVzZShtaWRkbGV3YXJlKTtcblxuT0F1dGhUZXN0Lm1pZGRsZXdhcmUgPSBtaWRkbGV3YXJlO1xuXG4vLyBIYW5kbGUgL19vYXV0aC8qIHBhdGhzIGFuZCBleHRyYWN0IHRoZSBzZXJ2aWNlIG5hbWUuXG4vL1xuLy8gQHJldHVybnMge1N0cmluZ3xudWxsfSBlLmcuIFwiZmFjZWJvb2tcIiwgb3IgbnVsbCBpZiB0aGlzIGlzbid0IGFuXG4vLyBvYXV0aCByZXF1ZXN0XG5jb25zdCBvYXV0aFNlcnZpY2VOYW1lID0gcmVxID0+IHtcbiAgLy8gcmVxLnVybCB3aWxsIGJlIFwiL19vYXV0aC88c2VydmljZSBuYW1lPlwiIHdpdGggYW4gb3B0aW9uYWwgXCI/Y2xvc2VcIi5cbiAgY29uc3QgaSA9IHJlcS51cmwuaW5kZXhPZignPycpO1xuICBsZXQgYmFyZVBhdGg7XG4gIGlmIChpID09PSAtMSlcbiAgICBiYXJlUGF0aCA9IHJlcS51cmw7XG4gIGVsc2VcbiAgICBiYXJlUGF0aCA9IHJlcS51cmwuc3Vic3RyaW5nKDAsIGkpO1xuICBjb25zdCBzcGxpdFBhdGggPSBiYXJlUGF0aC5zcGxpdCgnLycpO1xuXG4gIC8vIEFueSBub24tb2F1dGggcmVxdWVzdCB3aWxsIGNvbnRpbnVlIGRvd24gdGhlIGRlZmF1bHRcbiAgLy8gbWlkZGxld2FyZXMuXG4gIGlmIChzcGxpdFBhdGhbMV0gIT09ICdfb2F1dGgnKVxuICAgIHJldHVybiBudWxsO1xuXG4gIC8vIEZpbmQgc2VydmljZSBiYXNlZCBvbiB1cmxcbiAgY29uc3Qgc2VydmljZU5hbWUgPSBzcGxpdFBhdGhbMl07XG4gIHJldHVybiBzZXJ2aWNlTmFtZTtcbn07XG5cbi8vIE1ha2Ugc3VyZSB3ZSdyZSBjb25maWd1cmVkXG5jb25zdCBlbnN1cmVDb25maWd1cmVkID0gc2VydmljZU5hbWUgPT4ge1xuICBpZiAoIVNlcnZpY2VDb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb25zLmZpbmRPbmUoe3NlcnZpY2U6IHNlcnZpY2VOYW1lfSkpIHtcbiAgICB0aHJvdyBuZXcgU2VydmljZUNvbmZpZ3VyYXRpb24uQ29uZmlnRXJyb3IoKTtcbiAgfVxufTtcblxuY29uc3QgaXNTYWZlID0gdmFsdWUgPT4ge1xuICAvLyBUaGlzIG1hdGNoZXMgc3RyaW5ncyBnZW5lcmF0ZWQgYnkgYFJhbmRvbS5zZWNyZXRgIGFuZFxuICAvLyBgUmFuZG9tLmlkYC5cbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJlxuICAgIC9eW2EtekEtWjAtOVxcLV9dKyQvLnRlc3QodmFsdWUpO1xufTtcblxuLy8gSW50ZXJuYWw6IHVzZWQgYnkgdGhlIG9hdXRoMSBhbmQgb2F1dGgyIHBhY2thZ2VzXG5PQXV0aC5fcmVuZGVyT2F1dGhSZXN1bHRzID0gKHJlcywgcXVlcnksIGNyZWRlbnRpYWxTZWNyZXQpID0+IHtcbiAgLy8gRm9yIHRlc3RzLCB3ZSBzdXBwb3J0IHRoZSBgb25seV9jcmVkZW50aWFsX3NlY3JldF9mb3JfdGVzdGBcbiAgLy8gcGFyYW1ldGVyLCB3aGljaCBqdXN0IHJldHVybnMgdGhlIGNyZWRlbnRpYWwgc2VjcmV0IHdpdGhvdXQgYW55XG4gIC8vIHN1cnJvdW5kaW5nIEhUTUwuIChUaGUgdGVzdCBuZWVkcyB0byBiZSBhYmxlIHRvIGVhc2lseSBncmFiIHRoZVxuICAvLyBzZWNyZXQgYW5kIHVzZSBpdCB0byBsb2cgaW4uKVxuICAvL1xuICAvLyBYWFggb25seV9jcmVkZW50aWFsX3NlY3JldF9mb3JfdGVzdCBjb3VsZCBiZSB1c2VmdWwgZm9yIG90aGVyXG4gIC8vIHRoaW5ncyBiZXNpZGUgdGVzdHMsIGxpa2UgY29tbWFuZC1saW5lIGNsaWVudHMuIFdlIHNob3VsZCBnaXZlIGl0IGFcbiAgLy8gcmVhbCBuYW1lIGFuZCBzZXJ2ZSB0aGUgY3JlZGVudGlhbCBzZWNyZXQgaW4gSlNPTi5cblxuICBpZiAocXVlcnkub25seV9jcmVkZW50aWFsX3NlY3JldF9mb3JfdGVzdCkge1xuICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7J0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2h0bWwnfSk7XG4gICAgcmVzLmVuZChjcmVkZW50aWFsU2VjcmV0LCAndXRmLTgnKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBkZXRhaWxzID0ge1xuICAgICAgcXVlcnksXG4gICAgICBsb2dpblN0eWxlOiBPQXV0aC5fbG9naW5TdHlsZUZyb21RdWVyeShxdWVyeSlcbiAgICB9O1xuICAgIGlmIChxdWVyeS5lcnJvcikge1xuICAgICAgZGV0YWlscy5lcnJvciA9IHF1ZXJ5LmVycm9yO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0b2tlbiA9IE9BdXRoLl9jcmVkZW50aWFsVG9rZW5Gcm9tUXVlcnkocXVlcnkpO1xuICAgICAgY29uc3Qgc2VjcmV0ID0gY3JlZGVudGlhbFNlY3JldDtcbiAgICAgIGlmICh0b2tlbiAmJiBzZWNyZXQgJiZcbiAgICAgICAgICBpc1NhZmUodG9rZW4pICYmIGlzU2FmZShzZWNyZXQpKSB7XG4gICAgICAgIGRldGFpbHMuY3JlZGVudGlhbHMgPSB7IHRva2VuOiB0b2tlbiwgc2VjcmV0OiBzZWNyZXR9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGV0YWlscy5lcnJvciA9IFwiaW52YWxpZF9jcmVkZW50aWFsX3Rva2VuX29yX3NlY3JldFwiO1xuICAgICAgfVxuICAgIH1cblxuICAgIE9BdXRoLl9lbmRPZkxvZ2luUmVzcG9uc2UocmVzLCBkZXRhaWxzKTtcbiAgfVxufTtcblxuLy8gVGhpcyBcInRlbXBsYXRlXCIgKG5vdCBhIHJlYWwgU3BhY2ViYXJzIHRlbXBsYXRlLCBqdXN0IGFuIEhUTUwgZmlsZVxuLy8gd2l0aCBzb21lICMjUExBQ0VIT0xERVIjI3MpIGNvbW11bmljYXRlcyB0aGUgY3JlZGVudGlhbCBzZWNyZXQgYmFja1xuLy8gdG8gdGhlIG1haW4gd2luZG93IGFuZCB0aGVuIGNsb3NlcyB0aGUgcG9wdXAuXG5PQXV0aC5fZW5kT2ZQb3B1cFJlc3BvbnNlVGVtcGxhdGUgPSBBc3NldHMuZ2V0VGV4dChcbiAgXCJlbmRfb2ZfcG9wdXBfcmVzcG9uc2UuaHRtbFwiKTtcblxuT0F1dGguX2VuZE9mUmVkaXJlY3RSZXNwb25zZVRlbXBsYXRlID0gQXNzZXRzLmdldFRleHQoXG4gIFwiZW5kX29mX3JlZGlyZWN0X3Jlc3BvbnNlLmh0bWxcIik7XG5cbi8vIFJlbmRlcnMgdGhlIGVuZCBvZiBsb2dpbiByZXNwb25zZSB0ZW1wbGF0ZSBpbnRvIHNvbWUgSFRNTCBhbmQgSmF2YVNjcmlwdFxuLy8gdGhhdCBjbG9zZXMgdGhlIHBvcHVwIG9yIHJlZGlyZWN0cyBhdCB0aGUgZW5kIG9mIHRoZSBPQXV0aCBmbG93LlxuLy9cbi8vIG9wdGlvbnMgYXJlOlxuLy8gICAtIGxvZ2luU3R5bGUgKFwicG9wdXBcIiBvciBcInJlZGlyZWN0XCIpXG4vLyAgIC0gc2V0Q3JlZGVudGlhbFRva2VuIChib29sZWFuKVxuLy8gICAtIGNyZWRlbnRpYWxUb2tlblxuLy8gICAtIGNyZWRlbnRpYWxTZWNyZXRcbi8vICAgLSByZWRpcmVjdFVybFxuLy8gICAtIGlzQ29yZG92YSAoYm9vbGVhbilcbi8vXG5jb25zdCByZW5kZXJFbmRPZkxvZ2luUmVzcG9uc2UgPSBvcHRpb25zID0+IHtcbiAgLy8gSXQgd291bGQgYmUgbmljZSB0byB1c2UgQmxhemUgaGVyZSwgYnV0IGl0J3MgYSBsaXR0bGUgdHJpY2t5XG4gIC8vIGJlY2F1c2Ugb3VyIG11c3RhY2hlcyB3b3VsZCBiZSBpbnNpZGUgYSA8c2NyaXB0PiB0YWcsIGFuZCBCbGF6ZVxuICAvLyB3b3VsZCB0cmVhdCB0aGUgPHNjcmlwdD4gdGFnIGNvbnRlbnRzIGFzIHRleHQgKGUuZy4gZW5jb2RlICcmJyBhc1xuICAvLyAnJmFtcDsnKS4gU28gd2UganVzdCBkbyBhIHNpbXBsZSByZXBsYWNlLlxuXG4gIGNvbnN0IGVzY2FwZSA9IHMgPT4ge1xuICAgIGlmIChzKSB7XG4gICAgICByZXR1cm4gcy5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIikuXG4gICAgICAgIHJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLlxuICAgICAgICByZXBsYWNlKC8+L2csIFwiJmd0O1wiKS5cbiAgICAgICAgcmVwbGFjZSgvXFxcIi9nLCBcIiZxdW90O1wiKS5cbiAgICAgICAgcmVwbGFjZSgvXFwnL2csIFwiJiN4Mjc7XCIpLlxuICAgICAgICByZXBsYWNlKC9cXC8vZywgXCImI3gyRjtcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzO1xuICAgIH1cbiAgfTtcblxuICAvLyBFc2NhcGUgZXZlcnl0aGluZyBqdXN0IHRvIGJlIHNhZmUgKHdlJ3ZlIGFscmVhZHkgY2hlY2tlZCB0aGF0IHNvbWVcbiAgLy8gb2YgdGhpcyBkYXRhIC0tIHRoZSB0b2tlbiBhbmQgc2VjcmV0IC0tIGFyZSBzYWZlKS5cbiAgY29uc3QgY29uZmlnID0ge1xuICAgIHNldENyZWRlbnRpYWxUb2tlbjogISEgb3B0aW9ucy5zZXRDcmVkZW50aWFsVG9rZW4sXG4gICAgY3JlZGVudGlhbFRva2VuOiBlc2NhcGUob3B0aW9ucy5jcmVkZW50aWFsVG9rZW4pLFxuICAgIGNyZWRlbnRpYWxTZWNyZXQ6IGVzY2FwZShvcHRpb25zLmNyZWRlbnRpYWxTZWNyZXQpLFxuICAgIHN0b3JhZ2VQcmVmaXg6IGVzY2FwZShPQXV0aC5fc3RvcmFnZVRva2VuUHJlZml4KSxcbiAgICByZWRpcmVjdFVybDogZXNjYXBlKG9wdGlvbnMucmVkaXJlY3RVcmwpLFxuICAgIGlzQ29yZG92YTogISEgb3B0aW9ucy5pc0NvcmRvdmFcbiAgfTtcblxuICBsZXQgdGVtcGxhdGU7XG4gIGlmIChvcHRpb25zLmxvZ2luU3R5bGUgPT09ICdwb3B1cCcpIHtcbiAgICB0ZW1wbGF0ZSA9IE9BdXRoLl9lbmRPZlBvcHVwUmVzcG9uc2VUZW1wbGF0ZTtcbiAgfSBlbHNlIGlmIChvcHRpb25zLmxvZ2luU3R5bGUgPT09ICdyZWRpcmVjdCcpIHtcbiAgICB0ZW1wbGF0ZSA9IE9BdXRoLl9lbmRPZlJlZGlyZWN0UmVzcG9uc2VUZW1wbGF0ZTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgbG9naW5TdHlsZTogJHtvcHRpb25zLmxvZ2luU3R5bGV9YCk7XG4gIH1cblxuICBjb25zdCByZXN1bHQgPSB0ZW1wbGF0ZS5yZXBsYWNlKC8jI0NPTkZJRyMjLywgSlNPTi5zdHJpbmdpZnkoY29uZmlnKSlcbiAgICAucmVwbGFjZShcbiAgICAgIC8jI1JPT1RfVVJMX1BBVEhfUFJFRklYIyMvLCBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLlJPT1RfVVJMX1BBVEhfUFJFRklYXG4gICAgKTtcblxuICByZXR1cm4gYDwhRE9DVFlQRSBodG1sPlxcbiR7cmVzdWx0fWA7XG59O1xuXG4vLyBXcml0ZXMgYW4gSFRUUCByZXNwb25zZSB0byB0aGUgcG9wdXAgd2luZG93IGF0IHRoZSBlbmQgb2YgYW4gT0F1dGhcbi8vIGxvZ2luIGZsb3cuIEF0IHRoaXMgcG9pbnQsIGlmIHRoZSB1c2VyIGhhcyBzdWNjZXNzZnVsbHkgYXV0aGVudGljYXRlZFxuLy8gdG8gdGhlIE9BdXRoIHNlcnZlciBhbmQgYXV0aG9yaXplZCB0aGlzIGFwcCwgd2UgY29tbXVuaWNhdGUgdGhlXG4vLyBjcmVkZW50aWFsVG9rZW4gYW5kIGNyZWRlbnRpYWxTZWNyZXQgdG8gdGhlIG1haW4gd2luZG93LiBUaGUgbWFpblxuLy8gd2luZG93IG11c3QgcHJvdmlkZSBib3RoIHRoZXNlIHZhbHVlcyB0byB0aGUgRERQIGBsb2dpbmAgbWV0aG9kIHRvXG4vLyBhdXRoZW50aWNhdGUgaXRzIEREUCBjb25uZWN0aW9uLiBBZnRlciBjb21tdW5pY2F0aW5nIHRoZXNlIHZhdWVzIHRvXG4vLyB0aGUgbWFpbiB3aW5kb3csIHdlIGNsb3NlIHRoZSBwb3B1cC5cbi8vXG4vLyBXZSBleHBvcnQgdGhpcyBmdW5jdGlvbiBzbyB0aGF0IGRldmVsb3BlcnMgY2FuIG92ZXJyaWRlIHRoaXNcbi8vIGJlaGF2aW9yLCB3aGljaCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGluLCBmb3IgZXhhbXBsZSwgc29tZSBtb2JpbGVcbi8vIGVudmlyb25tZW50cyB3aGVyZSBwb3B1cHMgYW5kL29yIGB3aW5kb3cub3BlbmVyYCBkb24ndCB3b3JrLiBGb3Jcbi8vIGV4YW1wbGUsIGFuIGFwcCBjb3VsZCBvdmVycmlkZSBgT0F1dGguX2VuZE9mUG9wdXBSZXNwb25zZWAgdG8gcHV0IHRoZVxuLy8gY3JlZGVudGlhbCB0b2tlbiBhbmQgY3JlZGVudGlhbCBzZWNyZXQgaW4gdGhlIHBvcHVwIFVSTCBmb3IgdGhlIG1haW5cbi8vIHdpbmRvdyB0byByZWFkIHRoZW0gdGhlcmUgaW5zdGVhZCBvZiB1c2luZyBgd2luZG93Lm9wZW5lcmAuIElmIHlvdVxuLy8gb3ZlcnJpZGUgdGhpcyBmdW5jdGlvbiwgeW91IHRha2UgcmVzcG9uc2liaWxpdHkgZm9yIHdyaXRpbmcgdG8gdGhlXG4vLyByZXF1ZXN0IGFuZCBjYWxsaW5nIGByZXMuZW5kKClgIHRvIGNvbXBsZXRlIHRoZSByZXF1ZXN0LlxuLy9cbi8vIEFyZ3VtZW50czpcbi8vICAgLSByZXM6IHRoZSBIVFRQIHJlc3BvbnNlIG9iamVjdFxuLy8gICAtIGRldGFpbHM6XG4vLyAgICAgIC0gcXVlcnk6IHRoZSBxdWVyeSBzdHJpbmcgb24gdGhlIEhUVFAgcmVxdWVzdFxuLy8gICAgICAtIGNyZWRlbnRpYWxzOiB7IHRva2VuOiAqLCBzZWNyZXQ6ICogfS4gSWYgcHJlc2VudCwgdGhpcyBmaWVsZFxuLy8gICAgICAgIGluZGljYXRlcyB0aGF0IHRoZSBsb2dpbiB3YXMgc3VjY2Vzc2Z1bC4gUmV0dXJuIHRoZXNlIHZhbHVlc1xuLy8gICAgICAgIHRvIHRoZSBjbGllbnQsIHdobyBjYW4gdXNlIHRoZW0gdG8gbG9nIGluIG92ZXIgRERQLiBJZlxuLy8gICAgICAgIHByZXNlbnQsIHRoZSB2YWx1ZXMgaGF2ZSBiZWVuIGNoZWNrZWQgYWdhaW5zdCBhIGxpbWl0ZWRcbi8vICAgICAgICBjaGFyYWN0ZXIgc2V0IGFuZCBhcmUgc2FmZSB0byBpbmNsdWRlIGluIEhUTUwuXG4vLyAgICAgIC0gZXJyb3I6IGlmIHByZXNlbnQsIGEgc3RyaW5nIG9yIEVycm9yIGluZGljYXRpbmcgYW4gZXJyb3IgdGhhdFxuLy8gICAgICAgIG9jY3VycmVkIGR1cmluZyB0aGUgbG9naW4uIFRoaXMgY2FuIGNvbWUgZnJvbSB0aGUgY2xpZW50IGFuZFxuLy8gICAgICAgIHNvIHNob3VsZG4ndCBiZSB0cnVzdGVkIGZvciBzZWN1cml0eSBkZWNpc2lvbnMgb3IgaW5jbHVkZWQgaW5cbi8vICAgICAgICB0aGUgcmVzcG9uc2Ugd2l0aG91dCBzYW5pdGl6aW5nIGl0IGZpcnN0LiBPbmx5IG9uZSBvZiBgZXJyb3JgXG4vLyAgICAgICAgb3IgYGNyZWRlbnRpYWxzYCBzaG91bGQgYmUgc2V0LlxuT0F1dGguX2VuZE9mTG9naW5SZXNwb25zZSA9IChyZXMsIGRldGFpbHMpID0+IHtcbiAgcmVzLndyaXRlSGVhZCgyMDAsIHsnQ29udGVudC1UeXBlJzogJ3RleHQvaHRtbCd9KTtcblxuICBsZXQgcmVkaXJlY3RVcmw7XG4gIGlmIChkZXRhaWxzLmxvZ2luU3R5bGUgPT09ICdyZWRpcmVjdCcpIHtcbiAgICByZWRpcmVjdFVybCA9IE9BdXRoLl9zdGF0ZUZyb21RdWVyeShkZXRhaWxzLnF1ZXJ5KS5yZWRpcmVjdFVybDtcbiAgICBjb25zdCBhcHBIb3N0ID0gTWV0ZW9yLmFic29sdXRlVXJsKCk7XG4gICAgaWYgKE9BdXRoLl9jaGVja1JlZGlyZWN0VXJsT3JpZ2luKHJlZGlyZWN0VXJsKSkge1xuICAgICAgZGV0YWlscy5lcnJvciA9IGByZWRpcmVjdFVybCAoJHtyZWRpcmVjdFVybH1gICtcbiAgICAgICAgYCkgaXMgbm90IG9uIHRoZSBzYW1lIGhvc3QgYXMgdGhlIGFwcCAoJHthcHBIb3N0fSlgO1xuICAgICAgcmVkaXJlY3RVcmwgPSBhcHBIb3N0O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGlzQ29yZG92YSA9IE9BdXRoLl9pc0NvcmRvdmFGcm9tUXVlcnkoZGV0YWlscy5xdWVyeSk7XG5cbiAgaWYgKGRldGFpbHMuZXJyb3IpIHtcbiAgICBMb2cud2FybihcIkVycm9yIGluIE9BdXRoIFNlcnZlcjogXCIgK1xuICAgICAgICAgICAgIChkZXRhaWxzLmVycm9yIGluc3RhbmNlb2YgRXJyb3IgP1xuICAgICAgICAgICAgICBkZXRhaWxzLmVycm9yLm1lc3NhZ2UgOiBkZXRhaWxzLmVycm9yKSk7XG4gICAgcmVzLmVuZChyZW5kZXJFbmRPZkxvZ2luUmVzcG9uc2Uoe1xuICAgICAgbG9naW5TdHlsZTogZGV0YWlscy5sb2dpblN0eWxlLFxuICAgICAgc2V0Q3JlZGVudGlhbFRva2VuOiBmYWxzZSxcbiAgICAgIHJlZGlyZWN0VXJsLFxuICAgICAgaXNDb3Jkb3ZhLFxuICAgIH0pLCBcInV0Zi04XCIpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIElmIHdlIGhhdmUgYSBjcmVkZW50aWFsU2VjcmV0LCByZXBvcnQgaXQgYmFjayB0byB0aGUgcGFyZW50XG4gIC8vIHdpbmRvdywgd2l0aCB0aGUgY29ycmVzcG9uZGluZyBjcmVkZW50aWFsVG9rZW4uIFRoZSBwYXJlbnQgd2luZG93XG4gIC8vIHVzZXMgdGhlIGNyZWRlbnRpYWxUb2tlbiBhbmQgY3JlZGVudGlhbFNlY3JldCB0byBsb2cgaW4gb3ZlciBERFAuXG4gIHJlcy5lbmQocmVuZGVyRW5kT2ZMb2dpblJlc3BvbnNlKHtcbiAgICBsb2dpblN0eWxlOiBkZXRhaWxzLmxvZ2luU3R5bGUsXG4gICAgc2V0Q3JlZGVudGlhbFRva2VuOiB0cnVlLFxuICAgIGNyZWRlbnRpYWxUb2tlbjogZGV0YWlscy5jcmVkZW50aWFscy50b2tlbixcbiAgICBjcmVkZW50aWFsU2VjcmV0OiBkZXRhaWxzLmNyZWRlbnRpYWxzLnNlY3JldCxcbiAgICByZWRpcmVjdFVybCxcbiAgICBpc0NvcmRvdmEsXG4gIH0pLCBcInV0Zi04XCIpO1xufTtcblxuXG5jb25zdCBPQXV0aEVuY3J5cHRpb24gPSBQYWNrYWdlW1wib2F1dGgtZW5jcnlwdGlvblwiXSAmJiBQYWNrYWdlW1wib2F1dGgtZW5jcnlwdGlvblwiXS5PQXV0aEVuY3J5cHRpb247XG5cbmNvbnN0IHVzaW5nT0F1dGhFbmNyeXB0aW9uID0gKCkgPT5cbiAgT0F1dGhFbmNyeXB0aW9uICYmIE9BdXRoRW5jcnlwdGlvbi5rZXlJc0xvYWRlZCgpO1xuXG4vLyBFbmNyeXB0IHNlbnNpdGl2ZSBzZXJ2aWNlIGRhdGEgc3VjaCBhcyBhY2Nlc3MgdG9rZW5zIGlmIHRoZVxuLy8gXCJvYXV0aC1lbmNyeXB0aW9uXCIgcGFja2FnZSBpcyBsb2FkZWQgYW5kIHRoZSBvYXV0aCBzZWNyZXQga2V5IGhhc1xuLy8gYmVlbiBzcGVjaWZpZWQuICBSZXR1cm5zIHRoZSB1bmVuY3J5cHRlZCBwbGFpbnRleHQgb3RoZXJ3aXNlLlxuLy9cbi8vIFRoZSB1c2VyIGlkIGlzIG5vdCBzcGVjaWZpZWQgYmVjYXVzZSB0aGUgdXNlciBpc24ndCBrbm93biB5ZXQgYXRcbi8vIHRoaXMgcG9pbnQgaW4gdGhlIG9hdXRoIGF1dGhlbnRpY2F0aW9uIHByb2Nlc3MuICBBZnRlciB0aGUgb2F1dGhcbi8vIGF1dGhlbnRpY2F0aW9uIHByb2Nlc3MgY29tcGxldGVzIHRoZSBlbmNyeXB0ZWQgc2VydmljZSBkYXRhIGZpZWxkc1xuLy8gd2lsbCBiZSByZS1lbmNyeXB0ZWQgd2l0aCB0aGUgdXNlciBpZCBpbmNsdWRlZCBiZWZvcmUgaW5zZXJ0aW5nIHRoZVxuLy8gc2VydmljZSBkYXRhIGludG8gdGhlIHVzZXIgZG9jdW1lbnQuXG4vL1xuT0F1dGguc2VhbFNlY3JldCA9IHBsYWludGV4dCA9PiB7XG4gIGlmICh1c2luZ09BdXRoRW5jcnlwdGlvbigpKVxuICAgIHJldHVybiBPQXV0aEVuY3J5cHRpb24uc2VhbChwbGFpbnRleHQpO1xuICBlbHNlXG4gICAgcmV0dXJuIHBsYWludGV4dDtcbn07XG5cbi8vIFVuZW5jcnlwdCBhIHNlcnZpY2UgZGF0YSBmaWVsZCwgaWYgdGhlIFwib2F1dGgtZW5jcnlwdGlvblwiXG4vLyBwYWNrYWdlIGlzIGxvYWRlZCBhbmQgdGhlIGZpZWxkIGlzIGVuY3J5cHRlZC5cbi8vXG4vLyBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIFwib2F1dGgtZW5jcnlwdGlvblwiIHBhY2thZ2UgaXMgbG9hZGVkIGFuZCB0aGVcbi8vIGZpZWxkIGlzIGVuY3J5cHRlZCwgYnV0IHRoZSBvYXV0aCBzZWNyZXQga2V5IGhhc24ndCBiZWVuIHNwZWNpZmllZC5cbi8vXG5PQXV0aC5vcGVuU2VjcmV0ID0gKG1heWJlU2VjcmV0LCB1c2VySWQpID0+IHtcbiAgaWYgKCFQYWNrYWdlW1wib2F1dGgtZW5jcnlwdGlvblwiXSB8fCAhT0F1dGhFbmNyeXB0aW9uLmlzU2VhbGVkKG1heWJlU2VjcmV0KSlcbiAgICByZXR1cm4gbWF5YmVTZWNyZXQ7XG5cbiAgcmV0dXJuIE9BdXRoRW5jcnlwdGlvbi5vcGVuKG1heWJlU2VjcmV0LCB1c2VySWQpO1xufTtcblxuLy8gVW5lbmNyeXB0IGZpZWxkcyBpbiB0aGUgc2VydmljZSBkYXRhIG9iamVjdC5cbi8vXG5PQXV0aC5vcGVuU2VjcmV0cyA9IChzZXJ2aWNlRGF0YSwgdXNlcklkKSA9PiB7XG4gIGNvbnN0IHJlc3VsdCA9IHt9O1xuICBPYmplY3Qua2V5cyhzZXJ2aWNlRGF0YSkuZm9yRWFjaChrZXkgPT5cbiAgICByZXN1bHRba2V5XSA9IE9BdXRoLm9wZW5TZWNyZXQoc2VydmljZURhdGFba2V5XSwgdXNlcklkKVxuICApO1xuICByZXR1cm4gcmVzdWx0O1xufTtcbiIsIi8vXG4vLyBXaGVuIGFuIG9hdXRoIHJlcXVlc3QgaXMgbWFkZSwgTWV0ZW9yIHJlY2VpdmVzIG9hdXRoIGNyZWRlbnRpYWxzXG4vLyBpbiBvbmUgYnJvd3NlciB0YWIsIGFuZCB0ZW1wb3JhcmlseSBwZXJzaXN0cyB0aGVtIHdoaWxlIHRoYXRcbi8vIHRhYiBpcyBjbG9zZWQsIHRoZW4gcmV0cmlldmVzIHRoZW0gaW4gdGhlIGJyb3dzZXIgdGFiIHRoYXRcbi8vIGluaXRpYXRlZCB0aGUgY3JlZGVudGlhbCByZXF1ZXN0LlxuLy9cbi8vIF9wZW5kaW5nQ3JlZGVudGlhbHMgaXMgdGhlIHN0b3JhZ2UgbWVjaGFuaXNtIHVzZWQgdG8gc2hhcmUgdGhlXG4vLyBjcmVkZW50aWFsIGJldHdlZW4gdGhlIDIgdGFic1xuLy9cblxuXG4vLyBDb2xsZWN0aW9uIGNvbnRhaW5pbmcgcGVuZGluZyBjcmVkZW50aWFscyBvZiBvYXV0aCBjcmVkZW50aWFsIHJlcXVlc3RzXG4vLyBIYXMga2V5LCBjcmVkZW50aWFsLCBhbmQgY3JlYXRlZEF0IGZpZWxkcy5cbk9BdXRoLl9wZW5kaW5nQ3JlZGVudGlhbHMgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbihcbiAgXCJtZXRlb3Jfb2F1dGhfcGVuZGluZ0NyZWRlbnRpYWxzXCIsIHtcbiAgICBfcHJldmVudEF1dG9wdWJsaXNoOiB0cnVlXG4gIH0pO1xuXG5PQXV0aC5fcGVuZGluZ0NyZWRlbnRpYWxzLl9lbnN1cmVJbmRleCgna2V5Jywge3VuaXF1ZTogMX0pO1xuT0F1dGguX3BlbmRpbmdDcmVkZW50aWFscy5fZW5zdXJlSW5kZXgoJ2NyZWRlbnRpYWxTZWNyZXQnKTtcbk9BdXRoLl9wZW5kaW5nQ3JlZGVudGlhbHMuX2Vuc3VyZUluZGV4KCdjcmVhdGVkQXQnKTtcblxuXG5cbi8vIFBlcmlvZGljYWxseSBjbGVhciBvbGQgZW50cmllcyB0aGF0IHdlcmUgbmV2ZXIgcmV0cmlldmVkXG5jb25zdCBfY2xlYW5TdGFsZVJlc3VsdHMgPSAoKSA9PiB7XG4gIC8vIFJlbW92ZSBjcmVkZW50aWFscyBvbGRlciB0aGFuIDEgbWludXRlXG4gIGNvbnN0IHRpbWVDdXRvZmYgPSBuZXcgRGF0ZSgpO1xuICB0aW1lQ3V0b2ZmLnNldE1pbnV0ZXModGltZUN1dG9mZi5nZXRNaW51dGVzKCkgLSAxKTtcbiAgT0F1dGguX3BlbmRpbmdDcmVkZW50aWFscy5yZW1vdmUoeyBjcmVhdGVkQXQ6IHsgJGx0OiB0aW1lQ3V0b2ZmIH0gfSk7XG59O1xuY29uc3QgX2NsZWFudXBIYW5kbGUgPSBNZXRlb3Iuc2V0SW50ZXJ2YWwoX2NsZWFuU3RhbGVSZXN1bHRzLCA2MCAqIDEwMDApO1xuXG5cbi8vIFN0b3JlcyB0aGUga2V5IGFuZCBjcmVkZW50aWFsIGluIHRoZSBfcGVuZGluZ0NyZWRlbnRpYWxzIGNvbGxlY3Rpb24uXG4vLyBXaWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBga2V5YCBpcyBub3QgYSBzdHJpbmcuXG4vL1xuLy8gQHBhcmFtIGtleSB7c3RyaW5nfVxuLy8gQHBhcmFtIGNyZWRlbnRpYWwge09iamVjdH0gICBUaGUgY3JlZGVudGlhbCB0byBzdG9yZVxuLy8gQHBhcmFtIGNyZWRlbnRpYWxTZWNyZXQge3N0cmluZ30gQSBzZWNyZXQgdGhhdCBtdXN0IGJlIHByZXNlbnRlZCBpblxuLy8gICBhZGRpdGlvbiB0byB0aGUgYGtleWAgdG8gcmV0cmlldmUgdGhlIGNyZWRlbnRpYWxcbi8vXG5PQXV0aC5fc3RvcmVQZW5kaW5nQ3JlZGVudGlhbCA9IChrZXksIGNyZWRlbnRpYWwsIGNyZWRlbnRpYWxTZWNyZXQgPSBudWxsKSA9PiB7XG4gIGNoZWNrKGtleSwgU3RyaW5nKTtcbiAgY2hlY2soY3JlZGVudGlhbFNlY3JldCwgTWF0Y2guTWF5YmUoU3RyaW5nKSk7XG5cbiAgaWYgKGNyZWRlbnRpYWwgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIGNyZWRlbnRpYWwgPSBzdG9yYWJsZUVycm9yKGNyZWRlbnRpYWwpO1xuICB9IGVsc2Uge1xuICAgIGNyZWRlbnRpYWwgPSBPQXV0aC5zZWFsU2VjcmV0KGNyZWRlbnRpYWwpO1xuICB9XG5cbiAgLy8gV2UgZG8gYW4gdXBzZXJ0IGhlcmUgaW5zdGVhZCBvZiBhbiBpbnNlcnQgaW4gY2FzZSB0aGUgdXNlciBoYXBwZW5zXG4gIC8vIHRvIHNvbWVob3cgc2VuZCB0aGUgc2FtZSBgc3RhdGVgIHBhcmFtZXRlciB0d2ljZSBkdXJpbmcgYW4gT0F1dGhcbiAgLy8gbG9naW47IHdlIGRvbid0IHdhbnQgYSBkdXBsaWNhdGUga2V5IGVycm9yLlxuICBPQXV0aC5fcGVuZGluZ0NyZWRlbnRpYWxzLnVwc2VydCh7XG4gICAga2V5LFxuICB9LCB7XG4gICAga2V5LFxuICAgIGNyZWRlbnRpYWwsXG4gICAgY3JlZGVudGlhbFNlY3JldCxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKClcbiAgfSk7XG59O1xuXG5cbi8vIFJldHJpZXZlcyBhbmQgcmVtb3ZlcyBhIGNyZWRlbnRpYWwgZnJvbSB0aGUgX3BlbmRpbmdDcmVkZW50aWFscyBjb2xsZWN0aW9uXG4vL1xuLy8gQHBhcmFtIGtleSB7c3RyaW5nfVxuLy8gQHBhcmFtIGNyZWRlbnRpYWxTZWNyZXQge3N0cmluZ31cbi8vXG5PQXV0aC5fcmV0cmlldmVQZW5kaW5nQ3JlZGVudGlhbCA9IChrZXksIGNyZWRlbnRpYWxTZWNyZXQgPSBudWxsKSA9PiB7XG4gIGNoZWNrKGtleSwgU3RyaW5nKTtcblxuICBjb25zdCBwZW5kaW5nQ3JlZGVudGlhbCA9IE9BdXRoLl9wZW5kaW5nQ3JlZGVudGlhbHMuZmluZE9uZSh7XG4gICAga2V5LFxuICAgIGNyZWRlbnRpYWxTZWNyZXQsXG4gIH0pO1xuXG4gIGlmIChwZW5kaW5nQ3JlZGVudGlhbCkge1xuICAgIE9BdXRoLl9wZW5kaW5nQ3JlZGVudGlhbHMucmVtb3ZlKHsgX2lkOiBwZW5kaW5nQ3JlZGVudGlhbC5faWQgfSk7XG4gICAgaWYgKHBlbmRpbmdDcmVkZW50aWFsLmNyZWRlbnRpYWwuZXJyb3IpXG4gICAgICByZXR1cm4gcmVjcmVhdGVFcnJvcihwZW5kaW5nQ3JlZGVudGlhbC5jcmVkZW50aWFsLmVycm9yKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gT0F1dGgub3BlblNlY3JldChwZW5kaW5nQ3JlZGVudGlhbC5jcmVkZW50aWFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59O1xuXG5cbi8vIENvbnZlcnQgYW4gRXJyb3IgaW50byBhbiBvYmplY3QgdGhhdCBjYW4gYmUgc3RvcmVkIGluIG1vbmdvXG4vLyBOb3RlOiBBIE1ldGVvci5FcnJvciBpcyByZWNvbnN0cnVjdGVkIGFzIGEgTWV0ZW9yLkVycm9yXG4vLyBBbGwgb3RoZXIgZXJyb3IgY2xhc3NlcyBhcmUgcmVjb25zdHJ1Y3RlZCBhcyBhIHBsYWluIEVycm9yLlxuLy8gVE9ETzogQ2FuIHdlIGRvIHRoaXMgbW9yZSBzaW1wbHkgd2l0aCBFSlNPTj9cbmNvbnN0IHN0b3JhYmxlRXJyb3IgPSBlcnJvciA9PiB7XG4gIGNvbnN0IHBsYWluT2JqZWN0ID0ge307XG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGVycm9yKS5mb3JFYWNoKFxuICAgIGtleSA9PiBwbGFpbk9iamVjdFtrZXldID0gZXJyb3Jba2V5XVxuICApO1xuXG4gIC8vIEtlZXAgdHJhY2sgb2Ygd2hldGhlciBpdCdzIGEgTWV0ZW9yLkVycm9yXG4gIGlmKGVycm9yIGluc3RhbmNlb2YgTWV0ZW9yLkVycm9yKSB7XG4gICAgcGxhaW5PYmplY3RbJ21ldGVvckVycm9yJ10gPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHsgZXJyb3I6IHBsYWluT2JqZWN0IH07XG59O1xuXG4vLyBDcmVhdGUgYW4gZXJyb3IgZnJvbSB0aGUgZXJyb3IgZm9ybWF0IHN0b3JlZCBpbiBtb25nb1xuY29uc3QgcmVjcmVhdGVFcnJvciA9IGVycm9yRG9jID0+IHtcbiAgbGV0IGVycm9yO1xuXG4gIGlmIChlcnJvckRvYy5tZXRlb3JFcnJvcikge1xuICAgIGVycm9yID0gbmV3IE1ldGVvci5FcnJvcigpO1xuICAgIGRlbGV0ZSBlcnJvckRvYy5tZXRlb3JFcnJvcjtcbiAgfSBlbHNlIHtcbiAgICBlcnJvciA9IG5ldyBFcnJvcigpO1xuICB9XG5cbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZXJyb3JEb2MpLmZvckVhY2goa2V5ID0+XG4gICAgZXJyb3Jba2V5XSA9IGVycm9yRG9jW2tleV1cbiAgKTtcblxuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiT0F1dGguX3N0b3JhZ2VUb2tlblByZWZpeCA9IFwiTWV0ZW9yLm9hdXRoLmNyZWRlbnRpYWxTZWNyZXQtXCI7XG5cbk9BdXRoLl9yZWRpcmVjdFVyaSA9IChzZXJ2aWNlTmFtZSwgY29uZmlnLCBwYXJhbXMsIGFic29sdXRlVXJsT3B0aW9ucykgPT4ge1xuICAvLyBYWFggQ09NUEFUIFdJVEggMC45LjBcbiAgLy8gVGhlIHJlZGlyZWN0IFVSSSB1c2VkIHRvIGhhdmUgYSBcIj9jbG9zZVwiIHF1ZXJ5IGFyZ3VtZW50LiAgV2VcbiAgLy8gZGV0ZWN0IHdoZXRoZXIgd2UgbmVlZCB0byBiZSBiYWNrd2FyZHMgY29tcGF0aWJsZSBieSBjaGVja2luZyBmb3JcbiAgLy8gdGhlIGFic2VuY2Ugb2YgdGhlIGBsb2dpblN0eWxlYCBmaWVsZCwgd2hpY2ggd2Fzbid0IHVzZWQgaW4gdGhlXG4gIC8vIGNvZGUgd2hpY2ggaGFkIHRoZSBcIj9jbG9zZVwiIGFyZ3VtZW50LlxuICAvLyBUaGlzIGxvZ2ljIGlzIGR1cGxpY2F0ZWQgaW4gdGhlIHRvb2wgc28gdGhhdCB0aGUgdG9vbCBjYW4gZG8gT0F1dGhcbiAgLy8gZmxvdyB3aXRoIDw9IDAuOS4wIHNlcnZlcnMgKHRvb2xzL2F1dGguanMpLlxuICBjb25zdCBxdWVyeSA9IGNvbmZpZy5sb2dpblN0eWxlID8gbnVsbCA6IFwiY2xvc2VcIjtcblxuICAvLyBDbG9uZSBiZWNhdXNlIHdlJ3JlIGdvaW5nIHRvIG11dGF0ZSAncGFyYW1zJy4gVGhlICdjb3Jkb3ZhJyBhbmRcbiAgLy8gJ2FuZHJvaWQnIHBhcmFtZXRlcnMgYXJlIG9ubHkgdXNlZCBmb3IgcGlja2luZyB0aGUgaG9zdCBvZiB0aGVcbiAgLy8gcmVkaXJlY3QgVVJMLCBhbmQgbm90IGFjdHVhbGx5IGluY2x1ZGVkIGluIHRoZSByZWRpcmVjdCBVUkwgaXRzZWxmLlxuICBsZXQgaXNDb3Jkb3ZhID0gZmFsc2U7XG4gIGxldCBpc0FuZHJvaWQgPSBmYWxzZTtcbiAgaWYgKHBhcmFtcykge1xuICAgIHBhcmFtcyA9IHsgLi4ucGFyYW1zIH07XG4gICAgaXNDb3Jkb3ZhID0gcGFyYW1zLmNvcmRvdmE7XG4gICAgaXNBbmRyb2lkID0gcGFyYW1zLmFuZHJvaWQ7XG4gICAgZGVsZXRlIHBhcmFtcy5jb3Jkb3ZhO1xuICAgIGRlbGV0ZSBwYXJhbXMuYW5kcm9pZDtcbiAgICBpZiAoT2JqZWN0LmtleXMocGFyYW1zKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHBhcmFtcyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBpZiAoTWV0ZW9yLmlzU2VydmVyICYmIGlzQ29yZG92YSkge1xuICAgIGNvbnN0IHVybCA9IE5wbS5yZXF1aXJlKCd1cmwnKTtcbiAgICBsZXQgcm9vdFVybCA9IHByb2Nlc3MuZW52Lk1PQklMRV9ST09UX1VSTCB8fFxuICAgICAgICAgIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uUk9PVF9VUkw7XG5cbiAgICBpZiAoaXNBbmRyb2lkKSB7XG4gICAgICAvLyBNYXRjaCB0aGUgcmVwbGFjZSB0aGF0IHdlIGRvIGluIGNvcmRvdmEgYm9pbGVycGxhdGVcbiAgICAgIC8vIChib2lsZXJwbGF0ZS1nZW5lcmF0b3IgcGFja2FnZSkuXG4gICAgICAvLyBYWFggTWF5YmUgd2Ugc2hvdWxkIHB1dCB0aGlzIGluIGEgc2VwYXJhdGUgcGFja2FnZSBvciBzb21ldGhpbmdcbiAgICAgIC8vIHRoYXQgaXMgdXNlZCBoZXJlIGFuZCBieSBib2lsZXJwbGF0ZS1nZW5lcmF0b3I/IE9yIG1heWJlXG4gICAgICAvLyBgTWV0ZW9yLmFic29sdXRlVXJsYCBzaG91bGQga25vdyBob3cgdG8gZG8gdGhpcz9cbiAgICAgIGNvbnN0IHBhcnNlZFJvb3RVcmwgPSB1cmwucGFyc2Uocm9vdFVybCk7XG4gICAgICBpZiAocGFyc2VkUm9vdFVybC5ob3N0bmFtZSA9PT0gXCJsb2NhbGhvc3RcIikge1xuICAgICAgICBwYXJzZWRSb290VXJsLmhvc3RuYW1lID0gXCIxMC4wLjIuMlwiO1xuICAgICAgICBkZWxldGUgcGFyc2VkUm9vdFVybC5ob3N0O1xuICAgICAgfVxuICAgICAgcm9vdFVybCA9IHVybC5mb3JtYXQocGFyc2VkUm9vdFVybCk7XG4gICAgfVxuXG4gICAgYWJzb2x1dGVVcmxPcHRpb25zID0ge1xuICAgICAgLi4uYWJzb2x1dGVVcmxPcHRpb25zLFxuICAgICAgLy8gRm9yIENvcmRvdmEgY2xpZW50cywgcmVkaXJlY3QgdG8gdGhlIHNwZWNpYWwgQ29yZG92YSByb290IHVybFxuICAgICAgLy8gKGxpa2VseSBhIGxvY2FsIElQIGluIGRldmVsb3BtZW50IG1vZGUpLlxuICAgICAgcm9vdFVybCxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIFVSTC5fY29uc3RydWN0VXJsKFxuICAgIE1ldGVvci5hYnNvbHV0ZVVybChgX29hdXRoLyR7c2VydmljZU5hbWV9YCwgYWJzb2x1dGVVcmxPcHRpb25zKSxcbiAgICBxdWVyeSxcbiAgICBwYXJhbXMpO1xufTtcbiIsIi8vIFhYWCBDT01QQVQgV0lUSCAwLjguMFxuXG5PYXV0aCA9IE9BdXRoO1xuIl19
