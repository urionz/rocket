(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Github;

var require = meteorInstall({"node_modules":{"meteor":{"github-oauth":{"github_server.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/github-oauth/github_server.js                                                                    //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
Github = {};
OAuth.registerService('github', 2, null, query => {
  const accessToken = getAccessToken(query);
  const identity = getIdentity(accessToken);
  const emails = getEmails(accessToken);
  const primaryEmail = emails.find(email => email.primary);
  return {
    serviceData: {
      id: identity.id,
      accessToken: OAuth.sealSecret(accessToken),
      email: identity.email || primaryEmail && primaryEmail.email || '',
      username: identity.login,
      emails
    },
    options: {
      profile: {
        name: identity.name
      }
    }
  };
}); // http://developer.github.com/v3/#user-agent-required

let userAgent = "Meteor";
if (Meteor.release) userAgent += "/".concat(Meteor.release);

const getAccessToken = query => {
  const config = ServiceConfiguration.configurations.findOne({
    service: 'github'
  });
  if (!config) throw new ServiceConfiguration.ConfigError();
  let response;

  try {
    response = HTTP.post("https://github.com/login/oauth/access_token", {
      headers: {
        Accept: 'application/json',
        "User-Agent": userAgent
      },
      params: {
        code: query.code,
        client_id: config.clientId,
        client_secret: OAuth.openSecret(config.secret),
        redirect_uri: OAuth._redirectUri('github', config),
        state: query.state
      }
    });
  } catch (err) {
    throw Object.assign(new Error("Failed to complete OAuth handshake with Github. ".concat(err.message)), {
      response: err.response
    });
  }

  if (response.data.error) {
    // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with GitHub. ".concat(response.data.error));
  } else {
    return response.data.access_token;
  }
};

const getIdentity = accessToken => {
  try {
    return HTTP.get("https://api.github.com/user", {
      headers: {
        "User-Agent": userAgent
      },
      // http://developer.github.com/v3/#user-agent-required
      params: {
        access_token: accessToken
      }
    }).data;
  } catch (err) {
    throw Object.assign(new Error("Failed to fetch identity from Github. ".concat(err.message)), {
      response: err.response
    });
  }
};

const getEmails = accessToken => {
  try {
    return HTTP.get("https://api.github.com/user/emails", {
      headers: {
        "User-Agent": userAgent
      },
      // http://developer.github.com/v3/#user-agent-required
      params: {
        access_token: accessToken
      }
    }).data;
  } catch (err) {
    return [];
  }
};

Github.retrieveCredential = (credentialToken, credentialSecret) => OAuth.retrieveCredential(credentialToken, credentialSecret);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/github-oauth/github_server.js");

/* Exports */
Package._define("github-oauth", {
  Github: Github
});

})();

//# sourceURL=meteor://💻app/packages/github-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZ2l0aHViLW9hdXRoL2dpdGh1Yl9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiR2l0aHViIiwiT0F1dGgiLCJyZWdpc3RlclNlcnZpY2UiLCJxdWVyeSIsImFjY2Vzc1Rva2VuIiwiZ2V0QWNjZXNzVG9rZW4iLCJpZGVudGl0eSIsImdldElkZW50aXR5IiwiZW1haWxzIiwiZ2V0RW1haWxzIiwicHJpbWFyeUVtYWlsIiwiZmluZCIsImVtYWlsIiwicHJpbWFyeSIsInNlcnZpY2VEYXRhIiwiaWQiLCJzZWFsU2VjcmV0IiwidXNlcm5hbWUiLCJsb2dpbiIsIm9wdGlvbnMiLCJwcm9maWxlIiwibmFtZSIsInVzZXJBZ2VudCIsIk1ldGVvciIsInJlbGVhc2UiLCJjb25maWciLCJTZXJ2aWNlQ29uZmlndXJhdGlvbiIsImNvbmZpZ3VyYXRpb25zIiwiZmluZE9uZSIsInNlcnZpY2UiLCJDb25maWdFcnJvciIsInJlc3BvbnNlIiwiSFRUUCIsInBvc3QiLCJoZWFkZXJzIiwiQWNjZXB0IiwicGFyYW1zIiwiY29kZSIsImNsaWVudF9pZCIsImNsaWVudElkIiwiY2xpZW50X3NlY3JldCIsIm9wZW5TZWNyZXQiLCJzZWNyZXQiLCJyZWRpcmVjdF91cmkiLCJfcmVkaXJlY3RVcmkiLCJzdGF0ZSIsImVyciIsIk9iamVjdCIsImFzc2lnbiIsIkVycm9yIiwibWVzc2FnZSIsImRhdGEiLCJlcnJvciIsImFjY2Vzc190b2tlbiIsImdldCIsInJldHJpZXZlQ3JlZGVudGlhbCIsImNyZWRlbnRpYWxUb2tlbiIsImNyZWRlbnRpYWxTZWNyZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLE1BQU0sR0FBRyxFQUFUO0FBRUFDLEtBQUssQ0FBQ0MsZUFBTixDQUFzQixRQUF0QixFQUFnQyxDQUFoQyxFQUFtQyxJQUFuQyxFQUF5Q0MsS0FBSyxJQUFJO0FBRWhELFFBQU1DLFdBQVcsR0FBR0MsY0FB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WTtBQUNaLFVBQU1DLE1BQU0sQ0FBQ0MsTUFBUCxDQUNKLElBQUlDLEtBQUosaURBQW1ESCxHQUFHLENBQUNJLE9BQXZELEVBREksRUFFSjtBQUFFbkIsY0FBUSxFQUFFZSxHQUFHLENBQUNmO0FBQWhCLEtBRkksQ0FBTjtBQUlEO0FBQ0YsQ0FiRDs7QUFlQSxNQUFNdEIsU0FBUyxHQUFHTCxXQUFXLElBQUk7QUFDL0IsTUFBSTtBQUNGLFdBQU80QixJQUFJLENBQUNzQixHQUFMLENBQ0wsb0NBREssRUFDaUM7QUFDcENwQixhQUFPLEVBQUU7QUFBQyxzQkFBY1o7QUFBZixPQUQyQjtBQUNBO0FBQ3BDYyxZQUFNLEVBQUU7QUFBQ2lCLG9CQUFZLEVBQUVqRDtBQUFmO0FBRjRCLEtBRGpDLEVBSUYrQyxJQUpMO0FBS0QsR0FORCxDQU1FLE9BQU9MLEdBQVAsRUFBWTtBQUNaLFdBQU8sRUFBUDtBQUNEO0FBQ0YsQ0FWRDs7QUFZQTlDLE1BQU0sQ0FBQ3VELGtCQUFQLEdBQTRCLENBQUNDLGVBQUQsRUFBa0JDLGdCQUFsQixLQUMxQnhELEtBQUssQ0FBQ3NELGtCQUFOLENBQXlCQyxlQUF6QixFQUEwQ0MsZ0JBQTFDLENBREYsQyIsImZpbGUiOiIvcGFja2FnZXMvZ2l0aHViLW9hdXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiR2l0aHViID0ge307XG5cbk9BdXRoLnJlZ2lzdGVyU2VydmljZSgnZ2l0aHViJywgMiwgbnVsbCwgcXVlcnkgPT4ge1xuXG4gIGNvbnN0IGFjY2Vzc1Rva2VuID0gZ2V0QWNjZXNzVG9rZW4ocXVlcnkpO1xuICBjb25zdCBpZGVudGl0eSA9IGdldElkZW50aXR5KGFjY2Vzc1Rva2VuKTtcbiAgY29uc3QgZW1haWxzID0gZ2V0RW1haWxzKGFjY2Vzc1Rva2VuKTtcbiAgY29uc3QgcHJpbWFyeUVtYWlsID0gZW1haWxzLmZpbmQoZW1haWwgPT4gZW1haWwucHJpbWFyeSk7XG5cbiAgcmV0dXJuIHtcbiAgICBzZXJ2aWNlRGF0YToge1xuICAgICAgaWQ6IGlkZW50aXR5LmlkLFxuICAgICAgYWNjZXNzVG9rZW46IE9BdXRoLnNlYWxTZWNyZXQoYWNjZXNzVG9rZW4pLFxuICAgICAgZW1haWw6IGlkZW50aXR5LmVtYWlsIHx8IChwcmltYXJ5RW1haWwgJiYgcHJpbWFyeUVtYWlsLmVtYWlsKSB8fCAnJyxcbiAgICAgIHVzZXJuYW1lOiBpZGVudGl0eS5sb2dpbixcbiAgICAgIGVtYWlscyxcbiAgICB9LFxuICAgIG9wdGlvbnM6IHtwcm9maWxlOiB7bmFtZTogaWRlbnRpdHkubmFtZX19XG4gIH07XG59KTtcblxuLy8gaHR0cDovL2RldmVsb3Blci5naXRodWIuY29tL3YzLyN1c2VyLWFnZW50LXJlcXVpcmVkXG5sZXQgdXNlckFnZW50ID0gXCJNZXRlb3JcIjtcbmlmIChNZXRlb3IucmVsZWFzZSlcbiAgdXNlckFnZW50ICs9IGAvJHtNZXRlb3IucmVsZWFzZX1gO1xuXG5jb25zdCBnZXRBY2Nlc3NUb2tlbiA9IHF1ZXJ5ID0+IHtcbiAgY29uc3QgY29uZmlnID0gU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuZmluZE9uZSh7c2VydmljZTogJ2dpdGh1Yid9KTtcbiAgaWYgKCFjb25maWcpXG4gICAgdGhyb3cgbmV3IFNlcnZpY2VDb25maWd1cmF0aW9uLkNvbmZpZ0Vycm9yKCk7XG5cbiAgbGV0IHJlc3BvbnNlO1xuICB0cnkge1xuICAgIHJlc3BvbnNlID0gSFRUUC5wb3N0KFxuICAgICAgXCJodHRwczovL2dpdGh1Yi5jb20vbG9naW4vb2F1dGgvYWNjZXNzX3Rva2VuXCIsIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIFwiVXNlci1BZ2VudFwiOiB1c2VyQWdlbnRcbiAgICAgICAgfSxcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgY29kZTogcXVlcnkuY29kZSxcbiAgICAgICAgICBjbGllbnRfaWQ6IGNvbmZpZy5jbGllbnRJZCxcbiAgICAgICAgICBjbGllbnRfc2VjcmV0OiBPQXV0aC5vcGVuU2VjcmV0KGNvbmZpZy5zZWNyZXQpLFxuICAgICAgICAgIHJlZGlyZWN0X3VyaTogT0F1dGguX3JlZGlyZWN0VXJpKCdnaXRodWInLCBjb25maWcpLFxuICAgICAgICAgIHN0YXRlOiBxdWVyeS5zdGF0ZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhyb3cgT2JqZWN0LmFzc2lnbihcbiAgICAgIG5ldyBFcnJvcihgRmFpbGVkIHRvIGNvbXBsZXRlIE9BdXRoIGhhbmRzaGFrZSB3aXRoIEdpdGh1Yi4gJHtlcnIubWVzc2FnZX1gKSxcbiAgICAgIHsgcmVzcG9uc2U6IGVyci5yZXNwb25zZSB9LFxuICAgICk7XG4gIH1cbiAgaWYgKHJlc3BvbnNlLmRhdGEuZXJyb3IpIHsgLy8gaWYgdGhlIGh0dHAgcmVzcG9uc2Ugd2FzIGEganNvbiBvYmplY3Qgd2l0aCBhbiBlcnJvciBhdHRyaWJ1dGVcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBjb21wbGV0ZSBPQXV0aCBoYW5kc2hha2Ugd2l0aCBHaXRIdWIuICR7cmVzcG9uc2UuZGF0YS5lcnJvcn1gKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5hY2Nlc3NfdG9rZW47XG4gIH1cbn07XG5cbmNvbnN0IGdldElkZW50aXR5ID0gYWNjZXNzVG9rZW4gPT4ge1xuICB0cnkge1xuICAgIHJldHVybiBIVFRQLmdldChcbiAgICAgIFwiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2VyXCIsIHtcbiAgICAgICAgaGVhZGVyczoge1wiVXNlci1BZ2VudFwiOiB1c2VyQWdlbnR9LCAvLyBodHRwOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvI3VzZXItYWdlbnQtcmVxdWlyZWRcbiAgICAgICAgcGFyYW1zOiB7YWNjZXNzX3Rva2VuOiBhY2Nlc3NUb2tlbn1cbiAgICAgIH0pLmRhdGE7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IE9iamVjdC5hc3NpZ24oXG4gICAgICBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBpZGVudGl0eSBmcm9tIEdpdGh1Yi4gJHtlcnIubWVzc2FnZX1gKSxcbiAgICAgIHsgcmVzcG9uc2U6IGVyci5yZXNwb25zZSB9LFxuICAgICk7XG4gIH1cbn07XG5cbmNvbnN0IGdldEVtYWlscyA9IGFjY2Vzc1Rva2VuID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSFRUUC5nZXQoXG4gICAgICBcImh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vdXNlci9lbWFpbHNcIiwge1xuICAgICAgICBoZWFkZXJzOiB7XCJVc2VyLUFnZW50XCI6IHVzZXJBZ2VudH0sIC8vIGh0dHA6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My8jdXNlci1hZ2VudC1yZXF1aXJlZFxuICAgICAgICBwYXJhbXM6IHthY2Nlc3NfdG9rZW46IGFjY2Vzc1Rva2VufVxuICAgICAgfSkuZGF0YTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59O1xuXG5HaXRodWIucmV0cmlldmVDcmVkZW50aWFsID0gKGNyZWRlbnRpYWxUb2tlbiwgY3JlZGVudGlhbFNlY3JldCkgPT5cbiAgT0F1dGgucmV0cmlldmVDcmVkZW50aWFsKGNyZWRlbnRpYWxUb2tlbiwgY3JlZGVudGlhbFNlY3JldCk7XG4iXX0=
