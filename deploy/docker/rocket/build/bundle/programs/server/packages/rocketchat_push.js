(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var EventState = Package['raix:eventstate'].EventState;
var check = Package.check.check;
var Match = Package.check.Match;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;
var Random = Package.random.Random;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Push, checkClientSecurity, _matchToken, _replaceToken, _removeToken, initPushUpdates;

var require = meteorInstall({"node_modules":{"meteor":{"rocketchat:push":{"lib":{"common":{"main.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/rocketchat_push/lib/common/main.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// The push object is an event emitter
Push = new EventState(); // Client-side security warnings, used to check options

checkClientSecurity = function (options) {
  // Warn if certificates or keys are added here on client. We dont allow the
  // user to do this for security reasons.
  if (options.apn && options.apn.certData) {
    throw new Error('Push.init: Dont add your APN certificate in client code!');
  }

  if (options.apn && options.apn.keyData) {
    throw new Error('Push.init: Dont add your APN key in client code!');
  }

  if (options.apn && options.apn.passphrase) {
    throw new Error('Push.init: Dont add your APN passphrase in client code!');
  }

  if (options.gcm && options.gcm.apiKey) {
    throw new Error('Push.init: Dont add your GCM api key in client code!');
  }
}; // DEPRECATED


Push.init = function () {
  console.warn('Push.init have been deprecated in favor of "config.push.json" please migrate');
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"notifications.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/rocketchat_push/lib/common/notifications.js                                                              //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// This is the match pattern for tokens
_matchToken = Match.OneOf({
  apn: String
}, {
  gcm: String
}); // Notifications collection

Push.notifications = new Mongo.Collection('_raix_push_notifications'); // This is a general function to validate that the data added to notifications
// is in the correct format. If not this function will throw errors

var _validateDocument = function (notification) {
  // Check the general notification
  check(notification, {
    from: String,
    title: String,
    text: String,
    sent: Match.Optional(Boolean),
    sending: Match.Optional(Match.Integer),
    badge: Match.Optional(Match.Integer),
    sound: Match.Optional(String),
    notId: Match.Optional(Match.Integer),
    contentAvailable: Match.Optional(Match.Integer),
    apn: Match.Optional({
      from: Match.Optional(String),
      title: Match.Optional(String),
      text: Match.Optional(String),
      badge: Match.Optional(Match.Integer),
      sound: Match.Optional(String),
      notId: Match.Optional(Match.Integer),
      category: Match.Optional(String)
    }),
    gcm: Match.Optional({
      from: Match.Optional(String),
      title: Match.Optional(String),
      text: Match.Optional(String),
      image: Match.Optional(String),
      style: Match.Optional(String),
      summaryText: Match.Optional(String),
      picture: Match.Optional(String),
      badge: Match.Optional(Match.Integer),
      sound: Match.Optional(String),
      notId: Match.Optional(Match.Integer)
    }),
    query: Match.Optional(String),
    token: Match.Optional(_matchToken),
    tokens: Match.Optional([_matchToken]),
    payload: Match.Optional(Object),
    delayUntil: Match.Optional(Date),
    createdAt: Date,
    createdBy: Match.OneOf(String, null)
  }); // Make sure a token selector or query have been set

  if (!notification.token && !notification.tokens && !notification.query) {
    throw new Error('No token selector or query found');
  } // If tokens array is set it should not be empty


  if (notification.tokens && !notification.tokens.length) {
    throw new Error('No tokens in array');
  }
};

Push.send = function (options) {
  // If on the client we set the user id - on the server we need an option
  // set or we default to "<SERVER>" as the creator of the notification
  // If current user not set see if we can set it to the logged in user
  // this will only run on the client if Meteor.userId is available
  var currentUser = Meteor.isClient && Meteor.userId && Meteor.userId() || Meteor.isServer && (options.createdBy || '<SERVER>') || null; // Rig the notification object

  var notification = _.extend({
    createdAt: new Date(),
    createdBy: currentUser
  }, _.pick(options, 'from', 'title', 'text')); // Add extra


  _.extend(notification, _.pick(options, 'payload', 'badge', 'sound', 'notId', 'delayUntil'));

  if (Match.test(options.apn, Object)) {
    notification.apn = _.pick(options.apn, 'from', 'title', 'text', 'badge', 'sound', 'notId', 'category');
  }

  if (Match.test(options.gcm, Object)) {
    notification.gcm = _.pick(options.gcm, 'image', 'style', 'summaryText', 'picture', 'from', 'title', 'text', 'badge', 'sound', 'notId');
  } // Set one token selector, this can be token, array of tokens or query


  if (options.query) {
    // Set query to the json string version fixing #43 and #39
    notification.query = JSON.stringify(options.query);
  } else if (options.token) {
    // Set token
    notification.token = options.token;
  } else if (options.tokens) {
    // Set tokens
    notification.tokens = options.tokens;
  } //console.log(options);


  if (typeof options.contentAvailable !== 'undefined') {
    notification.contentAvailable = options.contentAvailable;
  }

  notification.sent = false;
  notification.sending = 0; // Validate the notification

  _validateDocument(notification); // Try to add the notification to send, we return an id to keep track


  return Push.notifications.insert(notification);
};

Push.allow = function (rules) {
  if (rules.send) {
    Push.notifications.allow({
      'insert': function (userId, notification) {
        // Validate the notification
        _validateDocument(notification); // Set the user defined "send" rules


        return rules.send.apply(this, [userId, notification]);
      }
    });
  }
};

Push.deny = function (rules) {
  if (rules.send) {
    Push.notifications.deny({
      'insert': function (userId, notification) {
        // Validate the notification
        _validateDocument(notification); // Set the user defined "send" rules


        return rules.send.apply(this, [userId, notification]);
      }
    });
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"server":{"push.api.js":function module(require){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/rocketchat_push/lib/server/push.api.js                                                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/*
  A general purpose user CordovaPush
  ios, android, mail, twitter?, facebook?, sms?, snailMail? :)

  Phonegap generic :
  https://github.com/phonegap-build/PushPlugin
 */
// getText / getBinary
Push.setBadge = function ()
/* id, count */
{// throw new Error('Push.setBadge not implemented on the server');
};

var isConfigured = false;

var sendWorker = function (task, interval) {
  if (typeof Push.Log === 'function') {
    Push.Log('Push: Send worker started, using interval:', interval);
  }

  if (Push.debug) {
    console.log('Push: Send worker started, using interval: ' + interval);
  }

  return Meteor.setInterval(function () {
    // xxx: add exponential backoff on error
    try {
      task();
    } catch (error) {
      if (typeof Push.Log === 'function') {
        Push.Log('Push: Error while sending:', error.message);
      }

      if (Push.debug) {
        console.log('Push: Error while sending: ' + error.message);
      }
    }
  }, interval);
};

Push.Configure = function (options) {
  var self = this;
  options = _.extend({
    sendTimeout: 60000 // Timeout period for notification send

  }, options); // https://npmjs.org/package/apn
  // After requesting the certificate from Apple, export your private key as
  // a .p12 file anddownload the .cer file from the iOS Provisioning Portal.
  // gateway.push.apple.com, port 2195
  // gateway.sandbox.push.apple.com, port 2195
  // Now, in the directory containing cert.cer and key.p12 execute the
  // following commands to generate your .pem files:
  // $ openssl x509 -in cert.cer -inform DER -outform PEM -out cert.pem
  // $ openssl pkcs12 -in key.p12 -out key.pem -nodes
  // Block multiple calls

  if (isConfigured) {
    throw new Error('Push.Configure should not be called more than once!');
  }

  isConfigured = true; // Add debug info

  if (Push.debug) {
    console.log('Push.Configure', options);
  } // This function is called when a token is replaced on a device - normally
  // this should not happen, but if it does we should take action on it


  _replaceToken = function (currentToken, newToken) {
    // console.log('Replace token: ' + currentToken + ' -- ' + newToken);
    // If the server gets a token event its passing in the current token and
    // the new value - if new value is undefined this empty the token
    self.emitState('token', currentToken, newToken);
  }; // Rig the removeToken callback


  _removeToken = function (token) {
    // console.log('Remove token: ' + token);
    // Invalidate the token
    self.emitState('token', token, null);
  };

  if (options.apn) {
    if (Push.debug) {
      console.log('Push: APN configured');
    } // Allow production to be a general option for push notifications


    if (options.production === Boolean(options.production)) {
      options.apn.production = options.production;
    } // Give the user warnings about development settings


    if (options.apn.development) {
      // This flag is normally set by the configuration file
      console.warn('WARNING: Push APN is using development key and certificate');
    } else {
      // We check the apn gateway i the options, we could risk shipping
      // server into production while using the production configuration.
      // On the other hand we could be in development but using the production
      // configuration. And finally we could have configured an unknown apn
      // gateway (this could change in the future - but a warning about typos
      // can save hours of debugging)
      //
      // Warn about gateway configurations - it's more a guide
      if (options.apn.gateway) {
        if (options.apn.gateway === 'gateway.sandbox.push.apple.com') {
          // Using the development sandbox
          console.warn('WARNING: Push APN is in development mode');
        } else if (options.apn.gateway === 'gateway.push.apple.com') {
          // In production - but warn if we are running on localhost
          if (/http:\/\/localhost/.test(Meteor.absoluteUrl())) {
            console.warn('WARNING: Push APN is configured to production mode - but server is running' + ' from localhost');
          }
        } else {
          // Warn about gateways we dont know about
          console.warn('WARNING: Push APN unkown gateway "' + options.apn.gateway + '"');
        }
      } else {
        if (options.apn.production) {
          if (/http:\/\/localhost/.test(Meteor.absoluteUrl())) {
            console.warn('WARNING: Push APN is configured to production mode - but server is running' + ' from localhost');
          }
        } else {
          console.warn('WARNING: Push APN is in development mode');
        }
      }
    } // Check certificate data


    if (!options.apn.certData || !options.apn.certData.length) {
      console.error('ERROR: Push server could not find certData');
    } // Check key data


    if (!options.apn.keyData || !options.apn.keyData.length) {
      console.error('ERROR: Push server could not find keyData');
    } // Rig apn connection


    var apn = Npm.require('apn');

    var apnConnection = new apn.Connection(options.apn); // Listen to transmission errors - should handle the same way as feedback.

    apnConnection.on('transmissionError', Meteor.bindEnvironment(function (errCode, notification, recipient) {
      if (Push.debug) {
        console.log('Got error code %d for token %s', errCode, notification.token);
      }

      if ([2, 5, 8].indexOf(errCode) >= 0) {
        // Invalid token errors...
        _removeToken({
          apn: notification.token
        });
      }
    })); // XXX: should we do a test of the connection? It would be nice to know
    // That the server/certificates/network are correct configured
    // apnConnection.connect().then(function() {
    //     console.info('CHECK: Push APN connection OK');
    // }, function(err) {
    //     console.warn('CHECK: Push APN connection FAILURE');
    // });
    // Note: the above code spoils the connection - investigate how to
    // shutdown/close it.

    self.sendAPN = function (userToken, notification) {
      if (Match.test(notification.apn, Object)) {
        notification = _.extend({}, notification, notification.apn);
      } // console.log('sendAPN', notification.from, userToken, notification.title, notification.text,
      // notification.badge, notification.priority);


      var priority = notification.priority || notification.priority === 0 ? notification.priority : 10;
      var myDevice = new apn.Device(userToken);
      var note = new apn.Notification();
      note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.

      if (typeof notification.badge !== 'undefined') {
        note.badge = notification.badge;
      }

      if (typeof notification.sound !== 'undefined') {
        note.sound = notification.sound;
      } //console.log(notification.contentAvailable);
      //console.log("lala2");
      //console.log(notification);


      if (typeof notification.contentAvailable !== 'undefined') {
        //console.log("lala");
        note.setContentAvailable(notification.contentAvailable); //console.log(note);
      } // adds category support for iOS8 custom actions as described here:
      // https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/
      // RemoteNotificationsPG/Chapters/IPhoneOSClientImp.html#//apple_ref/doc/uid/TP40008194-CH103-SW36


      if (typeof notification.category !== 'undefined') {
        note.category = notification.category;
      }

      note.alert = {
        body: notification.text
      };

      if (typeof notification.title !== 'undefined') {
        note.alert.title = notification.title;
      } // Allow the user to set payload data


      note.payload = notification.payload ? {
        ejson: EJSON.stringify(notification.payload)
      } : {};
      note.payload.messageFrom = notification.from;
      note.priority = priority; // Store the token on the note so we can reference it if there was an error

      note.token = userToken; // console.log('I:Send message to: ' + userToken + ' count=' + count);

      apnConnection.pushNotification(note, myDevice);
    };

    var initFeedback = function () {
      var apn = Npm.require('apn'); // console.log('Init feedback');


      var feedbackOptions = {
        'batchFeedback': true,
        // Time in SECONDS
        'interval': 5,
        production: !options.apn.development,
        cert: options.certData,
        key: options.keyData,
        passphrase: options.passphrase
      };
      var feedback = new apn.Feedback(feedbackOptions);
      feedback.on('feedback', function (devices) {
        devices.forEach(function (item) {
          // Do something with item.device and item.time;
          // console.log('A:PUSH FEEDBACK ' + item.device + ' - ' + item.time);
          // The app is most likely removed from the device, we should
          // remove the token
          _removeToken({
            apn: item.device
          });
        });
      });
      feedback.start();
    }; // Init feedback from apn server
    // This will help keep the appCollection up-to-date, it will help update
    // and remove token from appCollection.


    initFeedback();
  } // EO ios notification


  if (options.gcm && options.gcm.apiKey) {
    if (Push.debug) {
      console.log('GCM configured');
    } //self.sendGCM = function(options.from, userTokens, options.title, options.text, options.badge, options.priority) {


    self.sendGCM = function (userTokens, notification) {
      if (Match.test(notification.gcm, Object)) {
        notification = _.extend({}, notification, notification.gcm);
      } // Make sure userTokens are an array of strings


      if (userTokens === '' + userTokens) {
        userTokens = [userTokens];
      } // Check if any tokens in there to send


      if (!userTokens.length) {
        if (Push.debug) {
          console.log('sendGCM no push tokens found');
        }

        return;
      }

      if (Push.debug) {
        console.log('sendGCM', userTokens, notification);
      }

      var gcm = Npm.require('node-gcm');

      var Fiber = Npm.require('fibers'); // Allow user to set payload


      var data = notification.payload ? {
        ejson: EJSON.stringify(notification.payload)
      } : {};
      data.title = notification.title;
      data.message = notification.text; // Set image

      if (typeof notification.image !== 'undefined') {
        data.image = notification.image;
      } // Set extra details


      if (typeof notification.badge !== 'undefined') {
        data.msgcnt = notification.badge;
      }

      if (typeof notification.sound !== 'undefined') {
        data.soundname = notification.sound;
      }

      if (typeof notification.notId !== 'undefined') {
        data.notId = notification.notId;
      }

      if (typeof notification.style !== 'undefined') {
        data.style = notification.style;
      }

      if (typeof notification.summaryText !== 'undefined') {
        data.summaryText = notification.summaryText;
      }

      if (typeof notification.picture !== 'undefined') {
        data.picture = notification.picture;
      } //var message = new gcm.Message();


      var message = new gcm.Message({
        collapseKey: notification.from,
        //    delayWhileIdle: true,
        //    timeToLive: 4,
        //    restricted_package_name: 'dk.gi2.app'
        data: data
      });

      if (Push.debug) {
        console.log('Create GCM Sender using "' + options.gcm.apiKey + '"');
      }

      var sender = new gcm.Sender(options.gcm.apiKey);

      _.each(userTokens, function (value
      /*, key */
      ) {
        if (Push.debug) {
          console.log('A:Send message to: ' + value);
        }
      });
      /*message.addData('title', title);
      message.addData('message', text);
      message.addData('msgcnt', '1');
      message.collapseKey = 'sitDrift';
      message.delayWhileIdle = true;
      message.timeToLive = 3;*/
      // /**
      //  * Parameters: message-literal, userTokens-array, No. of retries, callback-function
      //  */


      var userToken = userTokens.length === 1 ? userTokens[0] : null;
      sender.send(message, userTokens, 5, function (err, result) {
        if (err) {
          if (Push.debug) {
            console.log('ANDROID ERROR: result of sender: ' + result);
          }
        } else {
          if (result === null) {
            if (Push.debug) {
              console.log('ANDROID: Result of sender is null');
            }

            return;
          }

          if (Push.debug) {
            console.log('ANDROID: Result of sender: ' + JSON.stringify(result));
          }

          if (result.canonical_ids === 1 && userToken) {
            // jshint ignore:line
            // This is an old device, token is replaced
            Fiber(function (self) {
              // Run in fiber
              try {
                self.callback(self.oldToken, self.newToken);
              } catch (err) {}
            }).run({
              oldToken: {
                gcm: userToken
              },
              newToken: {
                gcm: result.results[0].registration_id
              },
              // jshint ignore:line
              callback: _replaceToken
            }); //_replaceToken({ gcm: userToken }, { gcm: result.results[0].registration_id });
          } // We cant send to that token - might not be registred
          // ask the user to remove the token from the list


          if (result.failure !== 0 && userToken) {
            // This is an old device, token is replaced
            Fiber(function (self) {
              // Run in fiber
              try {
                self.callback(self.token);
              } catch (err) {}
            }).run({
              token: {
                gcm: userToken
              },
              callback: _removeToken
            }); //_replaceToken({ gcm: userToken }, { gcm: result.results[0].registration_id });
          }
        }
      }); // /** Use the following line if you want to send the message without retries
      // sender.sendNoRetry(message, userTokens, function (result) {
      //     console.log('ANDROID: ' + JSON.stringify(result));
      // });
      // **/
    }; // EO sendAndroid

  } // EO Android
  // Universal send function


  var _querySend = function (query, options) {
    var countApn = [];
    var countGcm = [];
    Push.appCollection.find(query).forEach(function (app) {
      if (Push.debug) {
        console.log('send to token', app.token);
      }

      if (app.token.apn) {
        countApn.push(app._id); // Send to APN

        if (self.sendAPN) {
          self.sendAPN(app.token.apn, options);
        }
      } else if (app.token.gcm) {
        countGcm.push(app._id); // Send to GCM
        // We do support multiple here - so we should construct an array
        // and send it bulk - Investigate limit count of id's

        if (self.sendGCM) {
          self.sendGCM(app.token.gcm, options);
        }
      } else {
        throw new Error('Push.send got a faulty query');
      }
    });

    if (Push.debug) {
      console.log('Push: Sent message "' + options.title + '" to ' + countApn.length + ' ios apps ' + countGcm.length + ' android apps'); // Add some verbosity about the send result, making sure the developer
      // understands what just happened.

      if (!countApn.length && !countGcm.length) {
        if (Push.appCollection.find().count() === 0) {
          console.log('Push, GUIDE: The "Push.appCollection" is empty -' + ' No clients have registred on the server yet...');
        }
      } else if (!countApn.length) {
        if (Push.appCollection.find({
          'token.apn': {
            $exists: true
          }
        }).count() === 0) {
          console.log('Push, GUIDE: The "Push.appCollection" - No APN clients have registred on the server yet...');
        }
      } else if (!countGcm.length) {
        if (Push.appCollection.find({
          'token.gcm': {
            $exists: true
          }
        }).count() === 0) {
          console.log('Push, GUIDE: The "Push.appCollection" - No GCM clients have registred on the server yet...');
        }
      }
    }

    return {
      apn: countApn,
      gcm: countGcm
    };
  };

  self.serverSend = function (options) {
    options = options || {
      badge: 0
    };
    var query; // Check basic options

    if (options.from !== '' + options.from) {
      throw new Error('Push.send: option "from" not a string');
    }

    if (options.title !== '' + options.title) {
      throw new Error('Push.send: option "title" not a string');
    }

    if (options.text !== '' + options.text) {
      throw new Error('Push.send: option "text" not a string');
    }

    if (options.token || options.tokens) {
      // The user set one token or array of tokens
      var tokenList = options.token ? [options.token] : options.tokens;

      if (Push.debug) {
        console.log('Push: Send message "' + options.title + '" via token(s)', tokenList);
      }

      query = {
        $or: [// XXX: Test this query: can we hand in a list of push tokens?
        {
          $and: [{
            token: {
              $in: tokenList
            }
          }, // And is not disabled
          {
            enabled: {
              $ne: false
            }
          }]
        }, // XXX: Test this query: does this work on app id?
        {
          $and: [{
            _id: {
              $in: tokenList
            }
          }, // one of the app ids
          {
            $or: [{
              'token.apn': {
                $exists: true
              }
            }, // got apn token
            {
              'token.gcm': {
                $exists: true
              }
            } // got gcm token
            ]
          }, // And is not disabled
          {
            enabled: {
              $ne: false
            }
          }]
        }]
      };
    } else if (options.query) {
      if (Push.debug) {
        console.log('Push: Send message "' + options.title + '" via query', options.query);
      }

      query = {
        $and: [options.query, // query object
        {
          $or: [{
            'token.apn': {
              $exists: true
            }
          }, // got apn token
          {
            'token.gcm': {
              $exists: true
            }
          } // got gcm token
          ]
        }, // And is not disabled
        {
          enabled: {
            $ne: false
          }
        }]
      };
    }

    if (query) {
      // Convert to querySend and return status
      return _querySend(query, options);
    } else {
      throw new Error('Push.send: please set option "token"/"tokens" or "query"');
    }
  }; // This interval will allow only one notification to be sent at a time, it
  // will check for new notifications at every `options.sendInterval`
  // (default interval is 15000 ms)
  //
  // It looks in notifications collection to see if theres any pending
  // notifications, if so it will try to reserve the pending notification.
  // If successfully reserved the send is started.
  //
  // If notification.query is type string, it's assumed to be a json string
  // version of the query selector. Making it able to carry `$` properties in
  // the mongo collection.
  //
  // Pr. default notifications are removed from the collection after send have
  // completed. Setting `options.keepNotifications` will update and keep the
  // notification eg. if needed for historical reasons.
  //
  // After the send have completed a "send" event will be emitted with a
  // status object containing notification id and the send result object.
  //


  var isSendingNotification = false;

  if (options.sendInterval !== null) {
    // This will require index since we sort notifications by createdAt
    Push.notifications._ensureIndex({
      createdAt: 1
    });

    Push.notifications._ensureIndex({
      sent: 1
    });

    Push.notifications._ensureIndex({
      sending: 1
    });

    Push.notifications._ensureIndex({
      delayUntil: 1
    });

    var sendNotification = function (notification) {
      // Reserve notification
      var now = +new Date();
      var timeoutAt = now + options.sendTimeout;
      var reserved = Push.notifications.update({
        _id: notification._id,
        sent: false,
        // xxx: need to make sure this is set on create
        sending: {
          $lt: now
        }
      }, {
        $set: {
          sending: timeoutAt
        }
      }); // Make sure we only handle notifications reserved by this
      // instance

      if (reserved) {
        // Check if query is set and is type String
        if (notification.query && notification.query === '' + notification.query) {
          try {
            // The query is in string json format - we need to parse it
            notification.query = JSON.parse(notification.query);
          } catch (err) {
            // Did the user tamper with this??
            throw new Error('Push: Error while parsing query string, Error: ' + err.message);
          }
        } // Send the notification


        var result = Push.serverSend(notification);

        if (!options.keepNotifications) {
          // Pr. Default we will remove notifications
          Push.notifications.remove({
            _id: notification._id
          });
        } else {
          // Update the notification
          Push.notifications.update({
            _id: notification._id
          }, {
            $set: {
              // Mark as sent
              sent: true,
              // Set the sent date
              sentAt: new Date(),
              // Count
              count: result,
              // Not being sent anymore
              sending: 0
            }
          });
        } // Emit the send


        self.emit('send', {
          notification: notification._id,
          result: result
        });
      } // Else could not reserve

    }; // EO sendNotification


    sendWorker(function () {
      if (isSendingNotification) {
        return;
      }

      try {
        // Set send fence
        isSendingNotification = true; // var countSent = 0;

        var batchSize = options.sendBatchSize || 1;
        var now = +new Date(); // Find notifications that are not being or already sent

        var pendingNotifications = Push.notifications.find({
          $and: [// Message is not sent
          {
            sent: false
          }, // And not being sent by other instances
          {
            sending: {
              $lt: now
            }
          }, // And not queued for future
          {
            $or: [{
              delayUntil: {
                $exists: false
              }
            }, {
              delayUntil: {
                $lte: new Date()
              }
            }]
          }]
        }, {
          // Sort by created date
          sort: {
            createdAt: 1
          },
          limit: batchSize
        });
        pendingNotifications.forEach(function (notification) {
          try {
            sendNotification(notification);
          } catch (error) {
            if (typeof Push.Log === 'function') {
              Push.Log('Push: Could not send notification id: "' + notification._id + '", Error:', error.message);
            }

            if (Push.debug) {
              console.log('Push: Could not send notification id: "' + notification._id + '", Error: ' + error.message);
            }
          }
        }); // EO forEach
      } finally {
        // Remove the send fence
        isSendingNotification = false;
      }
    }, options.sendInterval || 15000); // Default every 15th sec
  } else {
    if (Push.debug) {
      console.log('Push: Send server is disabled');
    }
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"server.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/rocketchat_push/lib/server/server.js                                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Push.appCollection = new Mongo.Collection('_raix_push_app_tokens');

Push.appCollection._ensureIndex({
  userId: 1
});

Push.addListener('token', function (currentToken, value) {
  if (value) {
    // Update the token for app
    Push.appCollection.update({
      token: currentToken
    }, {
      $set: {
        token: value
      }
    }, {
      multi: true
    });
  } else if (value === null) {
    // Remove the token for app
    Push.appCollection.update({
      token: currentToken
    }, {
      $unset: {
        token: true
      }
    }, {
      multi: true
    });
  }
});
Meteor.methods({
  'raix:push-update': function (options) {
    if (Push.debug) {
      console.log('Push: Got push token from app:', options);
    }

    check(options, {
      id: Match.Optional(String),
      token: _matchToken,
      appName: String,
      userId: Match.OneOf(String, null),
      metadata: Match.Optional(Object)
    }); // The if user id is set then user id should match on client and connection

    if (options.userId && options.userId !== this.userId) {
      throw new Meteor.Error(403, 'Forbidden access');
    }

    var doc; // lookup app by id if one was included

    if (options.id) {
      doc = Push.appCollection.findOne({
        _id: options.id
      });
    } else if (options.userId) {
      doc = Push.appCollection.findOne({
        userId: options.userId
      });
    } // No doc was found - we check the database to see if
    // we can find a match for the app via token and appName


    if (!doc) {
      doc = Push.appCollection.findOne({
        $and: [{
          token: options.token
        }, // Match token
        {
          appName: options.appName
        }, // Match appName
        {
          token: {
            $exists: true
          }
        } // Make sure token exists
        ]
      });
    } // if we could not find the id or token then create it


    if (!doc) {
      // Rig default doc
      doc = {
        token: options.token,
        appName: options.appName,
        userId: options.userId,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }; // XXX: We might want to check the id - Why isnt there a match for id
      // in the Meteor check... Normal length 17 (could be larger), and
      // numbers+letters are used in Random.id() with exception of 0 and 1

      doc._id = options.id || Random.id(); // The user wanted us to use a specific id, we didn't find this while
      // searching. The client could depend on the id eg. as reference so
      // we respect this and try to create a document with the selected id;

      Push.appCollection._collection.insert(doc);
    } else {
      // We found the app so update the updatedAt and set the token
      Push.appCollection.update({
        _id: doc._id
      }, {
        $set: {
          updatedAt: new Date(),
          token: options.token
        }
      });
    }

    if (doc) {
      // xxx: Hack
      // Clean up mech making sure tokens are uniq - android sometimes generate
      // new tokens resulting in duplicates
      var removed = Push.appCollection.remove({
        $and: [{
          _id: {
            $ne: doc._id
          }
        }, {
          token: doc.token
        }, // Match token
        {
          appName: doc.appName
        }, // Match appName
        {
          token: {
            $exists: true
          }
        } // Make sure token exists
        ]
      });

      if (removed && Push.debug) {
        console.log('Push: Removed ' + removed + ' existing app items');
      }
    }

    if (doc && Push.debug) {
      console.log('Push: updated', doc);
    }

    if (!doc) {
      throw new Meteor.Error(500, 'setPushToken could not create record');
    } // Return the doc we want to use


    return doc;
  },
  'raix:push-setuser': function (id) {
    check(id, String);

    if (Push.debug) {
      console.log('Push: Settings userId "' + this.userId + '" for app:', id);
    } // We update the appCollection id setting the Meteor.userId


    var found = Push.appCollection.update({
      _id: id
    }, {
      $set: {
        userId: this.userId
      }
    }); // Note that the app id might not exist because no token is set yet.
    // We do create the new app id for the user since we might store additional
    // metadata for the app / user
    // If id not found then create it?
    // We dont, its better to wait until the user wants to
    // store metadata or token - We could end up with unused data in the
    // collection at every app re-install / update
    //
    // The user could store some metadata in appCollectin but only if they
    // have created the app and provided a token.
    // If not the metadata should be set via ground:db

    return !!found;
  },
  'raix:push-metadata': function (data) {
    check(data, {
      id: String,
      metadata: Object
    }); // Set the metadata

    var found = Push.appCollection.update({
      _id: data.id
    }, {
      $set: {
        metadata: data.metadata
      }
    });
    return !!found;
  },
  'raix:push-enable': function (data) {
    check(data, {
      id: String,
      enabled: Boolean
    });

    if (Push.debug) {
      console.log('Push: Setting enabled to "' + data.enabled + '" for app:', data.id);
    }

    var found = Push.appCollection.update({
      _id: data.id
    }, {
      $set: {
        enabled: data.enabled
      }
    });
    return !!found;
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/rocketchat:push/lib/common/main.js");
require("/node_modules/meteor/rocketchat:push/lib/common/notifications.js");
require("/node_modules/meteor/rocketchat:push/lib/server/push.api.js");
require("/node_modules/meteor/rocketchat:push/lib/server/server.js");

/* Exports */
Package._define("rocketchat:push", {
  Push: Push,
  _matchToken: _matchToken,
  checkClientSecurity: checkClientSecurity,
  initPushUpdates: initPushUpdates,
  _replaceToken: _replaceToken,
  _removeToken: _removeToken
});

})();

//# sourceURL=meteor://💻app/packages/rocketchat_push.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdDpwdXNoL2xpYi9jb21tb24vbWFpbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdDpwdXNoL2xpYi9jb21tb24vbm90aWZpY2F0aW9ucy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdDpwdXNoL2xpYi9zZXJ2ZXIvcHVzaC5hcGkuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3JvY2tldGNoYXQ6cHVzaC9saWIvc2VydmVyL3NlcnZlci5qcyJdLCJuYW1lcyI6WyJQdXNoIiwiRXZlbnRTdGF0ZSIsImNoZWNrQ2xpZW50U2VjdXJpdHkiLCJvcHRpb25zIiwiYXBuIiwiY2VydERhdGEiLCJFcnJvciIsImtleURhdGEiLCJwYXNzcGhyYXNlIiwiZ2NtIiwiYXBpS2V5IiwiaW5pdCIsImNvbnNvbGUiLCJ3YXJuIiwiX21hdGNoVG9rZW4iLCJNYXRjaCIsIk9uZU9mIiwiU3RyaW5nIiwibm90aWZpY2F0aW9ucyIsIk1vbmdvIiwiQ29sbGVjdGlvbiIsIl92YWxpZGF0ZURvY3VtZW50Iiwibm90aWZpY2F0aW9uIiwiY2hlY2siLCJmcm9tIiwidGl0bGUiLCJ0ZXh0Iiwic2VudCIsIk9wdGlvbmFsIiwiQm9vbGVhbiIsInNlbmRpbmciLCJJbnRlZ2VyIiwiYmFkZ2UiLCJzb3VuZCIsIm5vdElkIiwiY29udGVudEF2YWlsYWJsZSIsImNhdGVnb3J5IiwiaW1hZ2UiLCJzdHlsZSIsInN1bW1hcnlUZXh0IiwicGljdHVyZSIsInF1ZXJ5IiwidG9rZW4iLCJ0b2tlbnMiLCJwYXlsb2FkIiwiT2JqZWN0IiwiZGVsYXlVbnRpbCIsIkRhdGUiLCJjcmVhdGVkQXQiLCJjcmVhdGVkQnkiLCJsZW5ndGgiLCJzZW5kIiwiY3VycmVudFVzZXIiLCJNZXRlb3IiLCJpc0NsaWVudCIsInVzZXJJZCIsImlzU2VydmVyIiwiXyIsImV4dGVuZCIsInBpY2siLCJ0ZXN0IiwiSlNPTiIsInN0cmluZ2lmeSIsImluc2VydCIsImFsbG93IiwicnVsZXMiLCJhcHBseSIsImRlbnkiLCJzZXRCYWRnZSIsImlzQ29uZmlndXJlZCIsInNlbmRXb3JrZXIiLCJ0YXNrIiwiaW50ZXJ2YWwiLCJMb2ciLCJkZWJ1ZyIsImxvZyIsInNldEludGVydmFsIiwiZXJyb3IiLCJtZXNzYWdlIiwiQ29uZmlndXJlIiwic2VsZiIsInNlbmRUaW1lb3V0IiwiX3JlcGxhY2VUb2tlbiIsImN1cnJlbnRUb2tlbiIsIm5ld1Rva2VuIiwiZW1pdFN0YXRlIiwiX3JlbW92ZVRva2VuIiwicHJvZHVjdGlvbiIsImRldmVsb3BtZW50IiwiZ2F0ZXdheSIsImFic29sdXRlVXJsIiwiTnBtIiwicmVxdWlyZSIsImFwbkNvbm5lY3Rpb24iLCJDb25uZWN0aW9uIiwib24iLCJiaW5kRW52aXJvbm1lbnQiLCJlcnJDb2RlIiwicmVjaXBpZW50IiwiaW5kZXhPZiIsInNlbmRBUE4iLCJ1c2VyVG9rZW4iLCJwcmlvcml0eSIsIm15RGV2aWNlIiwiRGV2aWNlIiwibm90ZSIsIk5vdGlmaWNhdGlvbiIsImV4cGlyeSIsIk1hdGgiLCJmbG9vciIsIm5vdyIsInNldENvbnRlbnRBdmFpbGFibGUiLCJhbGVydCIsImJvZHkiLCJlanNvbiIsIkVKU09OIiwibWVzc2FnZUZyb20iLCJwdXNoTm90aWZpY2F0aW9uIiwiaW5pdEZlZWRiYWNrIiwiZmVlZGJhY2tPcHRpb25zIiwiY2VydCIsImtleSIsImZlZWRiYWNrIiwiRmVlZGJhY2siLCJkZXZpY2VzIiwiZm9yRWFjaCIsIml0ZW0iLCJkZXZpY2UiLCJzdGFydCIsInNlbmRHQ00iLCJ1c2VyVG9rZW5zIiwiRmliZXIiLCJkYXRhIiwibXNnY250Iiwic291bmRuYW1lIiwiTWVzc2FnZSIsImNvbGxhcHNlS2V5Iiwic2VuZGVyIiwiU2VuZGVyIiwiZWFjaCIsInZhbHVlIiwiZXJyIiwicmVzdWx0IiwiY2Fub25pY2FsX2lkcyIsImNhbGxiYWNrIiwib2xkVG9rZW4iLCJydW4iLCJyZXN1bHRzIiwicmVnaXN0cmF0aW9uX2lkIiwiZmFpbHVyZSIsIl9xdWVyeVNlbmQiLCJjb3VudEFwbiIsImNvdW50R2NtIiwiYXBwQ29sbGVjdGlvbiIsImZpbmQiLCJhcHAiLCJwdXNoIiwiX2lkIiwiY291bnQiLCIkZXhpc3RzIiwic2VydmVyU2VuZCIsInRva2VuTGlzdCIsIiRvciIsIiRhbmQiLCIkaW4iLCJlbmFibGVkIiwiJG5lIiwiaXNTZW5kaW5nTm90aWZpY2F0aW9uIiwic2VuZEludGVydmFsIiwiX2Vuc3VyZUluZGV4Iiwic2VuZE5vdGlmaWNhdGlvbiIsInRpbWVvdXRBdCIsInJlc2VydmVkIiwidXBkYXRlIiwiJGx0IiwiJHNldCIsInBhcnNlIiwia2VlcE5vdGlmaWNhdGlvbnMiLCJyZW1vdmUiLCJzZW50QXQiLCJlbWl0IiwiYmF0Y2hTaXplIiwic2VuZEJhdGNoU2l6ZSIsInBlbmRpbmdOb3RpZmljYXRpb25zIiwiJGx0ZSIsInNvcnQiLCJsaW1pdCIsImFkZExpc3RlbmVyIiwibXVsdGkiLCIkdW5zZXQiLCJtZXRob2RzIiwiaWQiLCJhcHBOYW1lIiwibWV0YWRhdGEiLCJkb2MiLCJmaW5kT25lIiwidXBkYXRlZEF0IiwiUmFuZG9tIiwiX2NvbGxlY3Rpb24iLCJyZW1vdmVkIiwiZm91bmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQUEsSUFBSSxHQUFHLElBQUlDLFVBQUosRUFBUCxDLENBR0E7O0FBQ0FDLG1CQUFtQixHQUFHLFVBQVNDLE9BQVQsRUFBa0I7QUFFdEM7QUFDQTtBQUNBLE1BQUlBLE9BQU8sQ0FBQ0MsR0FBUixJQUFlRCxPQUFPLENBQUNDLEdBQVIsQ0FBWUMsUUFBL0IsRUFBeUM7QUFDdkMsVUFBTSxJQUFJQyxLQUFKLENBQVUsMERBQVYsQ0FBTjtBQUNEOztBQUVELE1BQUlILE9BQU8sQ0FBQ0MsR0FBUixJQUFlRCxPQUFPLENBQUNDLEdBQVIsQ0FBWUcsT0FBL0IsRUFBd0M7QUFDdEMsVUFB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QUVoQixVQUFJLEVBQUU7QUFBRVYsZUFBTyxFQUFFakMsSUFBSSxDQUFDaUM7QUFBaEI7QUFBUixLQUE1QyxDQUFaO0FBRUEsV0FBTyxDQUFDLENBQUNtQyxLQUFUO0FBQ0Q7QUFsSlksQ0FBZixFIiwiZmlsZSI6Ii9wYWNrYWdlcy9yb2NrZXRjaGF0X3B1c2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgcHVzaCBvYmplY3QgaXMgYW4gZXZlbnQgZW1pdHRlclxuUHVzaCA9IG5ldyBFdmVudFN0YXRlKCk7XG5cblxuLy8gQ2xpZW50LXNpZGUgc2VjdXJpdHkgd2FybmluZ3MsIHVzZWQgdG8gY2hlY2sgb3B0aW9uc1xuY2hlY2tDbGllbnRTZWN1cml0eSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAvLyBXYXJuIGlmIGNlcnRpZmljYXRlcyBvciBrZXlzIGFyZSBhZGRlZCBoZXJlIG9uIGNsaWVudC4gV2UgZG9udCBhbGxvdyB0aGVcbiAgLy8gdXNlciB0byBkbyB0aGlzIGZvciBzZWN1cml0eSByZWFzb25zLlxuICBpZiAob3B0aW9ucy5hcG4gJiYgb3B0aW9ucy5hcG4uY2VydERhdGEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1B1c2guaW5pdDogRG9udCBhZGQgeW91ciBBUE4gY2VydGlmaWNhdGUgaW4gY2xpZW50IGNvZGUhJyk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5hcG4gJiYgb3B0aW9ucy5hcG4ua2V5RGF0YSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHVzaC5pbml0OiBEb250IGFkZCB5b3VyIEFQTiBrZXkgaW4gY2xpZW50IGNvZGUhJyk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5hcG4gJiYgb3B0aW9ucy5hcG4ucGFzc3BocmFzZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHVzaC5pbml0OiBEb250IGFkZCB5b3VyIEFQTiBwYXNzcGhyYXNlIGluIGNsaWVudCBjb2RlIScpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuZ2NtICYmIG9wdGlvbnMuZ2NtLmFwaUtleSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHVzaC5pbml0OiBEb250IGFkZCB5b3VyIEdDTSBhcGkga2V5IGluIGNsaWVudCBjb2RlIScpO1xuICB9XG59O1xuXG4vLyBERVBSRUNBVEVEXG5QdXNoLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS53YXJuKCdQdXNoLmluaXQgaGF2ZSBiZWVuIGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2YgXCJjb25maWcucHVzaC5qc29uXCIgcGxlYXNlIG1pZ3JhdGUnKTtcbn07XG4iLCIvLyBUaGlzIGlzIHRoZSBtYXRjaCBwYXR0ZXJuIGZvciB0b2tlbnNcbl9tYXRjaFRva2VuID0gTWF0Y2guT25lT2YoeyBhcG46IFN0cmluZyB9LCB7IGdjbTogU3RyaW5nIH0pO1xuXG4vLyBOb3RpZmljYXRpb25zIGNvbGxlY3Rpb25cblB1c2gubm90aWZpY2F0aW9ucyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdfcmFpeF9wdXNoX25vdGlmaWNhdGlvbnMnKTtcblxuLy8gVGhpcyBpcyBhIGdlbmVyYWwgZnVuY3Rpb24gdG8gdmFsaWRhdGUgdGhhdCB0aGUgZGF0YSBhZGRlZCB0byBub3RpZmljYXRpb25zXG4vLyBpcyBpbiB0aGUgY29ycmVjdCBmb3JtYXQuIElmIG5vdCB0aGlzIGZ1bmN0aW9uIHdpbGwgdGhyb3cgZXJyb3JzXG52YXIgX3ZhbGlkYXRlRG9jdW1lbnQgPSBmdW5jdGlvbihub3RpZmljYXRpb24pIHtcblxuICAvLyBDaGVjayB0aGUgZ2VuZXJhbCBub3RpZmljYXRpb25cbiAgY2hlY2sobm90aWZpY2F0aW9uLCB7XG4gICAgZnJvbTogU3RyaW5nLFxuICAgIHRpdGxlOiBTdHJpbmcsXG4gICAgdGV4dDogU3RyaW5nLFxuICAgIHNlbnQ6IE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pLFxuICAgIHNlbmRpbmc6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLkludGVnZXIpLFxuICAgIGJhZGdlOiBNYXRjaC5PcHRpb25hbChNYXRjaC5JbnRlZ2VyKSxcbiAgICBzb3VuZDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICBub3RJZDogTWF0Y2guT3B0aW9uYWwoTWF0Y2guSW50ZWdlciksXG4gICAgY29udGVudEF2YWlsYWJsZTogTWF0Y2guT3B0aW9uYWwoTWF0Y2guSW50ZWdlciksXG4gICAgYXBuOiBNYXRjaC5PcHRpb25hbCh7XG4gICAgICBmcm9tOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgdGl0bGU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICB0ZXh0OiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgYmFkZ2U6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLkludGVnZXIpLFxuICAgICAgc291bmQ6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICBub3RJZDogTWF0Y2guT3B0aW9uYWwoTWF0Y2guSW50ZWdlciksXG4gICAgICBjYXRlZ29yeTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKVxuICAgIH0pLFxuICAgIGdjbTogTWF0Y2guT3B0aW9uYWwoe1xuICAgICAgZnJvbTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgIHRpdGxlOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgdGV4dDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgIGltYWdlOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgc3R5bGU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICBzdW1tYXJ5VGV4dDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgIHBpY3R1cmU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICBiYWRnZTogTWF0Y2guT3B0aW9uYWwoTWF0Y2guSW50ZWdlciksXG4gICAgICBzb3VuZDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgIG5vdElkOiBNYXRjaC5PcHRpb25hbChNYXRjaC5JbnRlZ2VyKVxuICAgIH0pLFxuICAgIHF1ZXJ5OiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgIHRva2VuOiBNYXRjaC5PcHRpb25hbChfbWF0Y2hUb2tlbiksXG4gICAgdG9rZW5zOiBNYXRjaC5PcHRpb25hbChbX21hdGNoVG9rZW5dKSxcbiAgICBwYXlsb2FkOiBNYXRjaC5PcHRpb25hbChPYmplY3QpLFxuICAgIGRlbGF5VW50aWw6IE1hdGNoLk9wdGlvbmFsKERhdGUpLFxuICAgIGNyZWF0ZWRBdDogRGF0ZSxcbiAgICBjcmVhdGVkQnk6IE1hdGNoLk9uZU9mKFN0cmluZywgbnVsbClcbiAgfSk7XG5cbiAgLy8gTWFrZSBzdXJlIGEgdG9rZW4gc2VsZWN0b3Igb3IgcXVlcnkgaGF2ZSBiZWVuIHNldFxuICBpZiAoIW5vdGlmaWNhdGlvbi50b2tlbiAmJiAhbm90aWZpY2F0aW9uLnRva2VucyAmJiAhbm90aWZpY2F0aW9uLnF1ZXJ5KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyB0b2tlbiBzZWxlY3RvciBvciBxdWVyeSBmb3VuZCcpO1xuICB9XG5cbiAgLy8gSWYgdG9rZW5zIGFycmF5IGlzIHNldCBpdCBzaG91bGQgbm90IGJlIGVtcHR5XG4gIGlmIChub3RpZmljYXRpb24udG9rZW5zICYmICFub3RpZmljYXRpb24udG9rZW5zLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm8gdG9rZW5zIGluIGFycmF5Jyk7XG4gIH1cbn07XG5cblB1c2guc2VuZCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgLy8gSWYgb24gdGhlIGNsaWVudCB3ZSBzZXQgdGhlIHVzZXIgaWQgLSBvbiB0aGUgc2VydmVyIHdlIG5lZWQgYW4gb3B0aW9uXG4gIC8vIHNldCBvciB3ZSBkZWZhdWx0IHRvIFwiPFNFUlZFUj5cIiBhcyB0aGUgY3JlYXRvciBvZiB0aGUgbm90aWZpY2F0aW9uXG4gIC8vIElmIGN1cnJlbnQgdXNlciBub3Qgc2V0IHNlZSBpZiB3ZSBjYW4gc2V0IGl0IHRvIHRoZSBsb2dnZWQgaW4gdXNlclxuICAvLyB0aGlzIHdpbGwgb25seSBydW4gb24gdGhlIGNsaWVudCBpZiBNZXRlb3IudXNlcklkIGlzIGF2YWlsYWJsZVxuICB2YXIgY3VycmVudFVzZXIgPSBNZXRlb3IuaXNDbGllbnQgJiYgTWV0ZW9yLnVzZXJJZCAmJiBNZXRlb3IudXNlcklkKCkgfHxcbiAgICAgICAgICBNZXRlb3IuaXNTZXJ2ZXIgJiYgKG9wdGlvbnMuY3JlYXRlZEJ5IHx8ICc8U0VSVkVSPicpIHx8IG51bGw7XG5cbiAgLy8gUmlnIHRoZSBub3RpZmljYXRpb24gb2JqZWN0XG4gICB2YXIgbm90aWZpY2F0aW9uID0gXy5leHRlbmQoe1xuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICBjcmVhdGVkQnk6IGN1cnJlbnRVc2VyXG4gIH0sIF8ucGljayhvcHRpb25zLCAnZnJvbScsICd0aXRsZScsICd0ZXh0JykpO1xuXG4gICAvLyBBZGQgZXh0cmFcbiAgIF8uZXh0ZW5kKG5vdGlmaWNhdGlvbiwgXy5waWNrKG9wdGlvbnMsICdwYXlsb2FkJywgJ2JhZGdlJywgJ3NvdW5kJywgJ25vdElkJywgJ2RlbGF5VW50aWwnKSk7XG5cbiAgaWYgKE1hdGNoLnRlc3Qob3B0aW9ucy5hcG4sIE9iamVjdCkpIHtcbiAgICBub3RpZmljYXRpb24uYXBuID0gXy5waWNrKG9wdGlvbnMuYXBuLCAnZnJvbScsICd0aXRsZScsICd0ZXh0JywgJ2JhZGdlJywgJ3NvdW5kJywgJ25vdElkJywgJ2NhdGVnb3J5Jyk7XG4gIH1cblxuICBpZiAoTWF0Y2gudGVzdChvcHRpb25zLmdjbSwgT2JqZWN0KSkge1xuICAgIG5vdGlmaWNhdGlvbi5nY20gPSBfLnBpY2sob3B0aW9ucy5nY20sICdpbWFnZScsICdzdHlsZScsICdzdW1tYXJ5VGV4dCcsICdwaWN0dXJlJywgJ2Zyb20nLCAndGl0bGUnLCAndGV4dCcsICdiYWRnZScsICdzb3VuZCcsICdub3RJZCcpO1xuICB9XG5cbiAgLy8gU2V0IG9uZSB0b2tlbiBzZWxlY3RvciwgdGhpcyBjYW4gYmUgdG9rZW4sIGFycmF5IG9mIHRva2VucyBvciBxdWVyeVxuICBpZiAob3B0aW9ucy5xdWVyeSkge1xuICAgIC8vIFNldCBxdWVyeSB0byB0aGUganNvbiBzdHJpbmcgdmVyc2lvbiBmaXhpbmcgIzQzIGFuZCAjMzlcbiAgICBub3RpZmljYXRpb24ucXVlcnkgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLnF1ZXJ5KTtcbiAgfSBlbHNlIGlmIChvcHRpb25zLnRva2VuKSB7XG4gICAgLy8gU2V0IHRva2VuXG4gICAgbm90aWZpY2F0aW9uLnRva2VuID0gb3B0aW9ucy50b2tlbjtcbiAgfSBlbHNlIGlmIChvcHRpb25zLnRva2Vucykge1xuICAgIC8vIFNldCB0b2tlbnNcbiAgICBub3RpZmljYXRpb24udG9rZW5zID0gb3B0aW9ucy50b2tlbnM7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhvcHRpb25zKTtcbiAgaWYgKHR5cGVvZiBvcHRpb25zLmNvbnRlbnRBdmFpbGFibGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbm90aWZpY2F0aW9uLmNvbnRlbnRBdmFpbGFibGUgPSBvcHRpb25zLmNvbnRlbnRBdmFpbGFibGU7XG4gIH1cblxuICBub3RpZmljYXRpb24uc2VudCA9IGZhbHNlO1xuICBub3RpZmljYXRpb24uc2VuZGluZyA9IDA7XG5cbiAgLy8gVmFsaWRhdGUgdGhlIG5vdGlmaWNhdGlvblxuICBfdmFsaWRhdGVEb2N1bWVudChub3RpZmljYXRpb24pO1xuXG4gIC8vIFRyeSB0byBhZGQgdGhlIG5vdGlmaWNhdGlvbiB0byBzZW5kLCB3ZSByZXR1cm4gYW4gaWQgdG8ga2VlcCB0cmFja1xuICByZXR1cm4gUHVzaC5ub3RpZmljYXRpb25zLmluc2VydChub3RpZmljYXRpb24pO1xufTtcblxuUHVzaC5hbGxvdyA9IGZ1bmN0aW9uKHJ1bGVzKSB7XG4gIGlmIChydWxlcy5zZW5kKSB7XG4gICAgUHVzaC5ub3RpZmljYXRpb25zLmFsbG93KHtcbiAgICAgICdpbnNlcnQnOiBmdW5jdGlvbih1c2VySWQsIG5vdGlmaWNhdGlvbikge1xuICAgICAgICAvLyBWYWxpZGF0ZSB0aGUgbm90aWZpY2F0aW9uXG4gICAgICAgIF92YWxpZGF0ZURvY3VtZW50KG5vdGlmaWNhdGlvbik7XG4gICAgICAgIC8vIFNldCB0aGUgdXNlciBkZWZpbmVkIFwic2VuZFwiIHJ1bGVzXG4gICAgICAgIHJldHVybiBydWxlcy5zZW5kLmFwcGx5KHRoaXMsIFt1c2VySWQsIG5vdGlmaWNhdGlvbl0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5QdXNoLmRlbnkgPSBmdW5jdGlvbihydWxlcykge1xuICBpZiAocnVsZXMuc2VuZCkge1xuICAgIFB1c2gubm90aWZpY2F0aW9ucy5kZW55KHtcbiAgICAgICdpbnNlcnQnOiBmdW5jdGlvbih1c2VySWQsIG5vdGlmaWNhdGlvbikge1xuICAgICAgICAvLyBWYWxpZGF0ZSB0aGUgbm90aWZpY2F0aW9uXG4gICAgICAgIF92YWxpZGF0ZURvY3VtZW50KG5vdGlmaWNhdGlvbik7XG4gICAgICAgIC8vIFNldCB0aGUgdXNlciBkZWZpbmVkIFwic2VuZFwiIHJ1bGVzXG4gICAgICAgIHJldHVybiBydWxlcy5zZW5kLmFwcGx5KHRoaXMsIFt1c2VySWQsIG5vdGlmaWNhdGlvbl0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuIiwiLypcbiAgQSBnZW5lcmFsIHB1cnBvc2UgdXNlciBDb3Jkb3ZhUHVzaFxuICBpb3MsIGFuZHJvaWQsIG1haWwsIHR3aXR0ZXI/LCBmYWNlYm9vaz8sIHNtcz8sIHNuYWlsTWFpbD8gOilcblxuICBQaG9uZWdhcCBnZW5lcmljIDpcbiAgaHR0cHM6Ly9naXRodWIuY29tL3Bob25lZ2FwLWJ1aWxkL1B1c2hQbHVnaW5cbiAqL1xuXG4vLyBnZXRUZXh0IC8gZ2V0QmluYXJ5XG5cblB1c2guc2V0QmFkZ2UgPSBmdW5jdGlvbigvKiBpZCwgY291bnQgKi8pIHtcbiAgICAvLyB0aHJvdyBuZXcgRXJyb3IoJ1B1c2guc2V0QmFkZ2Ugbm90IGltcGxlbWVudGVkIG9uIHRoZSBzZXJ2ZXInKTtcbn07XG5cbnZhciBpc0NvbmZpZ3VyZWQgPSBmYWxzZTtcblxudmFyIHNlbmRXb3JrZXIgPSBmdW5jdGlvbih0YXNrLCBpbnRlcnZhbCkge1xuICBpZiAodHlwZW9mIFB1c2guTG9nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgUHVzaC5Mb2coJ1B1c2g6IFNlbmQgd29ya2VyIHN0YXJ0ZWQsIHVzaW5nIGludGVydmFsOicsIGludGVydmFsKTtcbiAgfVxuICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgIGNvbnNvbGUubG9nKCdQdXNoOiBTZW5kIHdvcmtlciBzdGFydGVkLCB1c2luZyBpbnRlcnZhbDogJyArIGludGVydmFsKTtcbiAgfVxuXG4gIHJldHVybiBNZXRlb3Iuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgLy8geHh4OiBhZGQgZXhwb25lbnRpYWwgYmFja29mZiBvbiBlcnJvclxuICAgIHRyeSB7XG4gICAgICB0YXNrKCk7XG4gICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgaWYgKHR5cGVvZiBQdXNoLkxvZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBQdXNoLkxvZygnUHVzaDogRXJyb3Igd2hpbGUgc2VuZGluZzonLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGlmIChQdXNoLmRlYnVnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQdXNoOiBFcnJvciB3aGlsZSBzZW5kaW5nOiAnICsgZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuICB9LCBpbnRlcnZhbCk7XG59O1xuXG5QdXNoLkNvbmZpZ3VyZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHtcbiAgICAgIHNlbmRUaW1lb3V0OiA2MDAwMCwgLy8gVGltZW91dCBwZXJpb2QgZm9yIG5vdGlmaWNhdGlvbiBzZW5kXG4gICAgfSwgb3B0aW9ucyk7XG4gICAgLy8gaHR0cHM6Ly9ucG1qcy5vcmcvcGFja2FnZS9hcG5cblxuICAgIC8vIEFmdGVyIHJlcXVlc3RpbmcgdGhlIGNlcnRpZmljYXRlIGZyb20gQXBwbGUsIGV4cG9ydCB5b3VyIHByaXZhdGUga2V5IGFzXG4gICAgLy8gYSAucDEyIGZpbGUgYW5kZG93bmxvYWQgdGhlIC5jZXIgZmlsZSBmcm9tIHRoZSBpT1MgUHJvdmlzaW9uaW5nIFBvcnRhbC5cblxuICAgIC8vIGdhdGV3YXkucHVzaC5hcHBsZS5jb20sIHBvcnQgMjE5NVxuICAgIC8vIGdhdGV3YXkuc2FuZGJveC5wdXNoLmFwcGxlLmNvbSwgcG9ydCAyMTk1XG5cbiAgICAvLyBOb3csIGluIHRoZSBkaXJlY3RvcnkgY29udGFpbmluZyBjZXJ0LmNlciBhbmQga2V5LnAxMiBleGVjdXRlIHRoZVxuICAgIC8vIGZvbGxvd2luZyBjb21tYW5kcyB0byBnZW5lcmF0ZSB5b3VyIC5wZW0gZmlsZXM6XG4gICAgLy8gJCBvcGVuc3NsIHg1MDkgLWluIGNlcnQuY2VyIC1pbmZvcm0gREVSIC1vdXRmb3JtIFBFTSAtb3V0IGNlcnQucGVtXG4gICAgLy8gJCBvcGVuc3NsIHBrY3MxMiAtaW4ga2V5LnAxMiAtb3V0IGtleS5wZW0gLW5vZGVzXG5cbiAgICAvLyBCbG9jayBtdWx0aXBsZSBjYWxsc1xuICAgIGlmIChpc0NvbmZpZ3VyZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUHVzaC5Db25maWd1cmUgc2hvdWxkIG5vdCBiZSBjYWxsZWQgbW9yZSB0aGFuIG9uY2UhJyk7XG4gICAgfVxuXG4gICAgaXNDb25maWd1cmVkID0gdHJ1ZTtcblxuICAgIC8vIEFkZCBkZWJ1ZyBpbmZvXG4gICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdQdXNoLkNvbmZpZ3VyZScsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHdoZW4gYSB0b2tlbiBpcyByZXBsYWNlZCBvbiBhIGRldmljZSAtIG5vcm1hbGx5XG4gICAgLy8gdGhpcyBzaG91bGQgbm90IGhhcHBlbiwgYnV0IGlmIGl0IGRvZXMgd2Ugc2hvdWxkIHRha2UgYWN0aW9uIG9uIGl0XG4gICAgX3JlcGxhY2VUb2tlbiA9IGZ1bmN0aW9uKGN1cnJlbnRUb2tlbiwgbmV3VG9rZW4pIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ1JlcGxhY2UgdG9rZW46ICcgKyBjdXJyZW50VG9rZW4gKyAnIC0tICcgKyBuZXdUb2tlbik7XG4gICAgICAgIC8vIElmIHRoZSBzZXJ2ZXIgZ2V0cyBhIHRva2VuIGV2ZW50IGl0cyBwYXNzaW5nIGluIHRoZSBjdXJyZW50IHRva2VuIGFuZFxuICAgICAgICAvLyB0aGUgbmV3IHZhbHVlIC0gaWYgbmV3IHZhbHVlIGlzIHVuZGVmaW5lZCB0aGlzIGVtcHR5IHRoZSB0b2tlblxuICAgICAgICBzZWxmLmVtaXRTdGF0ZSgndG9rZW4nLCBjdXJyZW50VG9rZW4sIG5ld1Rva2VuKTtcbiAgICB9O1xuXG4gICAgLy8gUmlnIHRoZSByZW1vdmVUb2tlbiBjYWxsYmFja1xuICAgIF9yZW1vdmVUb2tlbiA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdSZW1vdmUgdG9rZW46ICcgKyB0b2tlbik7XG4gICAgICAgIC8vIEludmFsaWRhdGUgdGhlIHRva2VuXG4gICAgICAgIHNlbGYuZW1pdFN0YXRlKCd0b2tlbicsIHRva2VuLCBudWxsKTtcbiAgICB9O1xuXG5cbiAgICBpZiAob3B0aW9ucy5hcG4pIHtcbiAgICAgICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnUHVzaDogQVBOIGNvbmZpZ3VyZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFsbG93IHByb2R1Y3Rpb24gdG8gYmUgYSBnZW5lcmFsIG9wdGlvbiBmb3IgcHVzaCBub3RpZmljYXRpb25zXG4gICAgICAgIGlmIChvcHRpb25zLnByb2R1Y3Rpb24gPT09IEJvb2xlYW4ob3B0aW9ucy5wcm9kdWN0aW9uKSkge1xuICAgICAgICAgIG9wdGlvbnMuYXBuLnByb2R1Y3Rpb24gPSBvcHRpb25zLnByb2R1Y3Rpb247XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHaXZlIHRoZSB1c2VyIHdhcm5pbmdzIGFib3V0IGRldmVsb3BtZW50IHNldHRpbmdzXG4gICAgICAgIGlmIChvcHRpb25zLmFwbi5kZXZlbG9wbWVudCkge1xuICAgICAgICAgIC8vIFRoaXMgZmxhZyBpcyBub3JtYWxseSBzZXQgYnkgdGhlIGNvbmZpZ3VyYXRpb24gZmlsZVxuICAgICAgICAgIGNvbnNvbGUud2FybignV0FSTklORzogUHVzaCBBUE4gaXMgdXNpbmcgZGV2ZWxvcG1lbnQga2V5IGFuZCBjZXJ0aWZpY2F0ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFdlIGNoZWNrIHRoZSBhcG4gZ2F0ZXdheSBpIHRoZSBvcHRpb25zLCB3ZSBjb3VsZCByaXNrIHNoaXBwaW5nXG4gICAgICAgICAgLy8gc2VydmVyIGludG8gcHJvZHVjdGlvbiB3aGlsZSB1c2luZyB0aGUgcHJvZHVjdGlvbiBjb25maWd1cmF0aW9uLlxuICAgICAgICAgIC8vIE9uIHRoZSBvdGhlciBoYW5kIHdlIGNvdWxkIGJlIGluIGRldmVsb3BtZW50IGJ1dCB1c2luZyB0aGUgcHJvZHVjdGlvblxuICAgICAgICAgIC8vIGNvbmZpZ3VyYXRpb24uIEFuZCBmaW5hbGx5IHdlIGNvdWxkIGhhdmUgY29uZmlndXJlZCBhbiB1bmtub3duIGFwblxuICAgICAgICAgIC8vIGdhdGV3YXkgKHRoaXMgY291bGQgY2hhbmdlIGluIHRoZSBmdXR1cmUgLSBidXQgYSB3YXJuaW5nIGFib3V0IHR5cG9zXG4gICAgICAgICAgLy8gY2FuIHNhdmUgaG91cnMgb2YgZGVidWdnaW5nKVxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gV2FybiBhYm91dCBnYXRld2F5IGNvbmZpZ3VyYXRpb25zIC0gaXQncyBtb3JlIGEgZ3VpZGVcbiAgICAgICAgICBpZiAob3B0aW9ucy5hcG4uZ2F0ZXdheSkge1xuXG4gICAgICAgICAgICAgIGlmIChvcHRpb25zLmFwbi5nYXRld2F5ID09PSAnZ2F0ZXdheS5zYW5kYm94LnB1c2guYXBwbGUuY29tJykge1xuICAgICAgICAgICAgICAgICAgLy8gVXNpbmcgdGhlIGRldmVsb3BtZW50IHNhbmRib3hcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV0FSTklORzogUHVzaCBBUE4gaXMgaW4gZGV2ZWxvcG1lbnQgbW9kZScpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuYXBuLmdhdGV3YXkgPT09ICdnYXRld2F5LnB1c2guYXBwbGUuY29tJykge1xuICAgICAgICAgICAgICAgICAgLy8gSW4gcHJvZHVjdGlvbiAtIGJ1dCB3YXJuIGlmIHdlIGFyZSBydW5uaW5nIG9uIGxvY2FsaG9zdFxuICAgICAgICAgICAgICAgICAgaWYgKC9odHRwOlxcL1xcL2xvY2FsaG9zdC8udGVzdChNZXRlb3IuYWJzb2x1dGVVcmwoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1dBUk5JTkc6IFB1c2ggQVBOIGlzIGNvbmZpZ3VyZWQgdG8gcHJvZHVjdGlvbiBtb2RlIC0gYnV0IHNlcnZlciBpcyBydW5uaW5nJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnIGZyb20gbG9jYWxob3N0Jyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBXYXJuIGFib3V0IGdhdGV3YXlzIHdlIGRvbnQga25vdyBhYm91dFxuICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdXQVJOSU5HOiBQdXNoIEFQTiB1bmtvd24gZ2F0ZXdheSBcIicgKyBvcHRpb25zLmFwbi5nYXRld2F5ICsgJ1wiJyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChvcHRpb25zLmFwbi5wcm9kdWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoL2h0dHA6XFwvXFwvbG9jYWxob3N0Ly50ZXN0KE1ldGVvci5hYnNvbHV0ZVVybCgpKSkge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV0FSTklORzogUHVzaCBBUE4gaXMgY29uZmlndXJlZCB0byBwcm9kdWN0aW9uIG1vZGUgLSBidXQgc2VydmVyIGlzIHJ1bm5pbmcnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcgZnJvbSBsb2NhbGhvc3QnKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV0FSTklORzogUHVzaCBBUE4gaXMgaW4gZGV2ZWxvcG1lbnQgbW9kZScpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBjZXJ0aWZpY2F0ZSBkYXRhXG4gICAgICAgIGlmICghb3B0aW9ucy5hcG4uY2VydERhdGEgfHwgIW9wdGlvbnMuYXBuLmNlcnREYXRhLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VSUk9SOiBQdXNoIHNlcnZlciBjb3VsZCBub3QgZmluZCBjZXJ0RGF0YScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sga2V5IGRhdGFcbiAgICAgICAgaWYgKCFvcHRpb25zLmFwbi5rZXlEYXRhIHx8ICFvcHRpb25zLmFwbi5rZXlEYXRhLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VSUk9SOiBQdXNoIHNlcnZlciBjb3VsZCBub3QgZmluZCBrZXlEYXRhJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSaWcgYXBuIGNvbm5lY3Rpb25cbiAgICAgICAgdmFyIGFwbiA9IE5wbS5yZXF1aXJlKCdhcG4nKTtcbiAgICAgICAgdmFyIGFwbkNvbm5lY3Rpb24gPSBuZXcgYXBuLkNvbm5lY3Rpb24oIG9wdGlvbnMuYXBuICk7XG5cbiAgICAgICAgLy8gTGlzdGVuIHRvIHRyYW5zbWlzc2lvbiBlcnJvcnMgLSBzaG91bGQgaGFuZGxlIHRoZSBzYW1lIHdheSBhcyBmZWVkYmFjay5cbiAgICAgICAgYXBuQ29ubmVjdGlvbi5vbigndHJhbnNtaXNzaW9uRXJyb3InLCBNZXRlb3IuYmluZEVudmlyb25tZW50KGZ1bmN0aW9uIChlcnJDb2RlLCBub3RpZmljYXRpb24sIHJlY2lwaWVudCkge1xuICAgICAgICAgIGlmIChQdXNoLmRlYnVnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnR290IGVycm9yIGNvZGUgJWQgZm9yIHRva2VuICVzJywgZXJyQ29kZSwgbm90aWZpY2F0aW9uLnRva2VuKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFsyLCA1LCA4XS5pbmRleE9mKGVyckNvZGUpID49IDApIHtcblxuXG4gICAgICAgICAgICAvLyBJbnZhbGlkIHRva2VuIGVycm9ycy4uLlxuICAgICAgICAgICAgX3JlbW92ZVRva2VuKHtcbiAgICAgICAgICAgICAgYXBuOiBub3RpZmljYXRpb24udG9rZW5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICAvLyBYWFg6IHNob3VsZCB3ZSBkbyBhIHRlc3Qgb2YgdGhlIGNvbm5lY3Rpb24/IEl0IHdvdWxkIGJlIG5pY2UgdG8ga25vd1xuICAgICAgICAvLyBUaGF0IHRoZSBzZXJ2ZXIvY2VydGlmaWNhdGVzL25ldHdvcmsgYXJlIGNvcnJlY3QgY29uZmlndXJlZFxuXG4gICAgICAgIC8vIGFwbkNvbm5lY3Rpb24uY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmluZm8oJ0NIRUNLOiBQdXNoIEFQTiBjb25uZWN0aW9uIE9LJyk7XG4gICAgICAgIC8vIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAvLyAgICAgY29uc29sZS53YXJuKCdDSEVDSzogUHVzaCBBUE4gY29ubmVjdGlvbiBGQUlMVVJFJyk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvLyBOb3RlOiB0aGUgYWJvdmUgY29kZSBzcG9pbHMgdGhlIGNvbm5lY3Rpb24gLSBpbnZlc3RpZ2F0ZSBob3cgdG9cbiAgICAgICAgLy8gc2h1dGRvd24vY2xvc2UgaXQuXG5cbiAgICAgICAgc2VsZi5zZW5kQVBOID0gZnVuY3Rpb24odXNlclRva2VuLCBub3RpZmljYXRpb24pIHtcbiAgICAgICAgICAgIGlmIChNYXRjaC50ZXN0KG5vdGlmaWNhdGlvbi5hcG4sIE9iamVjdCkpIHtcbiAgICAgICAgICAgICAgbm90aWZpY2F0aW9uID0gXy5leHRlbmQoe30sIG5vdGlmaWNhdGlvbiwgbm90aWZpY2F0aW9uLmFwbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdzZW5kQVBOJywgbm90aWZpY2F0aW9uLmZyb20sIHVzZXJUb2tlbiwgbm90aWZpY2F0aW9uLnRpdGxlLCBub3RpZmljYXRpb24udGV4dCxcbiAgICAgICAgICAgIC8vIG5vdGlmaWNhdGlvbi5iYWRnZSwgbm90aWZpY2F0aW9uLnByaW9yaXR5KTtcbiAgICAgICAgICAgIHZhciBwcmlvcml0eSA9IChub3RpZmljYXRpb24ucHJpb3JpdHkgfHwgbm90aWZpY2F0aW9uLnByaW9yaXR5ID09PSAwKT8gbm90aWZpY2F0aW9uLnByaW9yaXR5IDogMTA7XG5cbiAgICAgICAgICAgIHZhciBteURldmljZSA9IG5ldyBhcG4uRGV2aWNlKHVzZXJUb2tlbik7XG5cbiAgICAgICAgICAgIHZhciBub3RlID0gbmV3IGFwbi5Ob3RpZmljYXRpb24oKTtcblxuICAgICAgICAgICAgbm90ZS5leHBpcnkgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSArIDM2MDA7IC8vIEV4cGlyZXMgMSBob3VyIGZyb20gbm93LlxuICAgICAgICAgICAgaWYgKHR5cGVvZiBub3RpZmljYXRpb24uYmFkZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIG5vdGUuYmFkZ2UgPSBub3RpZmljYXRpb24uYmFkZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIG5vdGlmaWNhdGlvbi5zb3VuZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgbm90ZS5zb3VuZCA9IG5vdGlmaWNhdGlvbi5zb3VuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2cobm90aWZpY2F0aW9uLmNvbnRlbnRBdmFpbGFibGUpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImxhbGEyXCIpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhub3RpZmljYXRpb24pO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBub3RpZmljYXRpb24uY29udGVudEF2YWlsYWJsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImxhbGFcIik7XG4gICAgICAgICAgICAgIG5vdGUuc2V0Q29udGVudEF2YWlsYWJsZShub3RpZmljYXRpb24uY29udGVudEF2YWlsYWJsZSk7XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobm90ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBhZGRzIGNhdGVnb3J5IHN1cHBvcnQgZm9yIGlPUzggY3VzdG9tIGFjdGlvbnMgYXMgZGVzY3JpYmVkIGhlcmU6XG4gICAgICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5hcHBsZS5jb20vbGlicmFyeS9pb3MvZG9jdW1lbnRhdGlvbi9OZXR3b3JraW5nSW50ZXJuZXQvQ29uY2VwdHVhbC9cbiAgICAgICAgICAgIC8vIFJlbW90ZU5vdGlmaWNhdGlvbnNQRy9DaGFwdGVycy9JUGhvbmVPU0NsaWVudEltcC5odG1sIy8vYXBwbGVfcmVmL2RvYy91aWQvVFA0MDAwODE5NC1DSDEwMy1TVzM2XG4gICAgICAgICAgICBpZiAodHlwZW9mIG5vdGlmaWNhdGlvbi5jYXRlZ29yeSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgbm90ZS5jYXRlZ29yeSA9IG5vdGlmaWNhdGlvbi5jYXRlZ29yeTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbm90ZS5hbGVydCA9IHtcbiAgICAgICAgICAgICAgYm9keTogbm90aWZpY2F0aW9uLnRleHRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygbm90aWZpY2F0aW9uLnRpdGxlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBub3RlLmFsZXJ0LnRpdGxlID0gbm90aWZpY2F0aW9uLnRpdGxlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBbGxvdyB0aGUgdXNlciB0byBzZXQgcGF5bG9hZCBkYXRhXG4gICAgICAgICAgICBub3RlLnBheWxvYWQgPSAobm90aWZpY2F0aW9uLnBheWxvYWQpID8geyBlanNvbjogRUpTT04uc3RyaW5naWZ5KG5vdGlmaWNhdGlvbi5wYXlsb2FkKSB9IDoge307XG5cbiAgICAgICAgICAgIG5vdGUucGF5bG9hZC5tZXNzYWdlRnJvbSA9IG5vdGlmaWNhdGlvbi5mcm9tO1xuICAgICAgICAgICAgbm90ZS5wcmlvcml0eSA9IHByaW9yaXR5O1xuXG5cbiAgICAgICAgICAgIC8vIFN0b3JlIHRoZSB0b2tlbiBvbiB0aGUgbm90ZSBzbyB3ZSBjYW4gcmVmZXJlbmNlIGl0IGlmIHRoZXJlIHdhcyBhbiBlcnJvclxuICAgICAgICAgICAgbm90ZS50b2tlbiA9IHVzZXJUb2tlbjtcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0k6U2VuZCBtZXNzYWdlIHRvOiAnICsgdXNlclRva2VuICsgJyBjb3VudD0nICsgY291bnQpO1xuXG4gICAgICAgICAgICBhcG5Db25uZWN0aW9uLnB1c2hOb3RpZmljYXRpb24obm90ZSwgbXlEZXZpY2UpO1xuXG4gICAgICAgIH07XG5cblxuICAgICAgICB2YXIgaW5pdEZlZWRiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFwbiA9IE5wbS5yZXF1aXJlKCdhcG4nKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdJbml0IGZlZWRiYWNrJyk7XG4gICAgICAgICAgICB2YXIgZmVlZGJhY2tPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICdiYXRjaEZlZWRiYWNrJzogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIC8vIFRpbWUgaW4gU0VDT05EU1xuICAgICAgICAgICAgICAgICdpbnRlcnZhbCc6IDUsXG4gICAgICAgICAgICAgICAgcHJvZHVjdGlvbjogIW9wdGlvbnMuYXBuLmRldmVsb3BtZW50LFxuICAgICAgICAgICAgICAgIGNlcnQ6IG9wdGlvbnMuY2VydERhdGEsXG4gICAgICAgICAgICAgICAga2V5OiBvcHRpb25zLmtleURhdGEsXG4gICAgICAgICAgICAgICAgcGFzc3BocmFzZTogb3B0aW9ucy5wYXNzcGhyYXNlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgZmVlZGJhY2sgPSBuZXcgYXBuLkZlZWRiYWNrKGZlZWRiYWNrT3B0aW9ucyk7XG4gICAgICAgICAgICBmZWVkYmFjay5vbignZmVlZGJhY2snLCBmdW5jdGlvbiAoZGV2aWNlcykge1xuICAgICAgICAgICAgICAgIGRldmljZXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBEbyBzb21ldGhpbmcgd2l0aCBpdGVtLmRldmljZSBhbmQgaXRlbS50aW1lO1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnQTpQVVNIIEZFRURCQUNLICcgKyBpdGVtLmRldmljZSArICcgLSAnICsgaXRlbS50aW1lKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGFwcCBpcyBtb3N0IGxpa2VseSByZW1vdmVkIGZyb20gdGhlIGRldmljZSwgd2Ugc2hvdWxkXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgX3JlbW92ZVRva2VuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwbjogaXRlbS5kZXZpY2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZmVlZGJhY2suc3RhcnQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbml0IGZlZWRiYWNrIGZyb20gYXBuIHNlcnZlclxuICAgICAgICAvLyBUaGlzIHdpbGwgaGVscCBrZWVwIHRoZSBhcHBDb2xsZWN0aW9uIHVwLXRvLWRhdGUsIGl0IHdpbGwgaGVscCB1cGRhdGVcbiAgICAgICAgLy8gYW5kIHJlbW92ZSB0b2tlbiBmcm9tIGFwcENvbGxlY3Rpb24uXG4gICAgICAgIGluaXRGZWVkYmFjaygpO1xuXG4gICAgfSAvLyBFTyBpb3Mgbm90aWZpY2F0aW9uXG5cbiAgICBpZiAob3B0aW9ucy5nY20gJiYgb3B0aW9ucy5nY20uYXBpS2V5KSB7XG4gICAgICAgIGlmIChQdXNoLmRlYnVnKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0dDTSBjb25maWd1cmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy9zZWxmLnNlbmRHQ00gPSBmdW5jdGlvbihvcHRpb25zLmZyb20sIHVzZXJUb2tlbnMsIG9wdGlvbnMudGl0bGUsIG9wdGlvbnMudGV4dCwgb3B0aW9ucy5iYWRnZSwgb3B0aW9ucy5wcmlvcml0eSkge1xuICAgICAgICBzZWxmLnNlbmRHQ00gPSBmdW5jdGlvbih1c2VyVG9rZW5zLCBub3RpZmljYXRpb24pIHtcbiAgICAgICAgICAgIGlmIChNYXRjaC50ZXN0KG5vdGlmaWNhdGlvbi5nY20sIE9iamVjdCkpIHtcbiAgICAgICAgICAgICAgbm90aWZpY2F0aW9uID0gXy5leHRlbmQoe30sIG5vdGlmaWNhdGlvbiwgbm90aWZpY2F0aW9uLmdjbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB1c2VyVG9rZW5zIGFyZSBhbiBhcnJheSBvZiBzdHJpbmdzXG4gICAgICAgICAgICBpZiAodXNlclRva2VucyA9PT0gJycrdXNlclRva2Vucykge1xuICAgICAgICAgICAgICB1c2VyVG9rZW5zID0gW3VzZXJUb2tlbnNdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBhbnkgdG9rZW5zIGluIHRoZXJlIHRvIHNlbmRcbiAgICAgICAgICAgIGlmICghdXNlclRva2Vucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NlbmRHQ00gbm8gcHVzaCB0b2tlbnMgZm91bmQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2VuZEdDTScsIHVzZXJUb2tlbnMsIG5vdGlmaWNhdGlvbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBnY20gPSBOcG0ucmVxdWlyZSgnbm9kZS1nY20nKTtcbiAgICAgICAgICAgIHZhciBGaWJlciA9IE5wbS5yZXF1aXJlKCdmaWJlcnMnKTtcblxuICAgICAgICAgICAgLy8gQWxsb3cgdXNlciB0byBzZXQgcGF5bG9hZFxuICAgICAgICAgICAgdmFyIGRhdGEgPSAobm90aWZpY2F0aW9uLnBheWxvYWQpID8geyBlanNvbjogRUpTT04uc3RyaW5naWZ5KG5vdGlmaWNhdGlvbi5wYXlsb2FkKSB9IDoge307XG5cbiAgICAgICAgICAgIGRhdGEudGl0bGUgPSBub3RpZmljYXRpb24udGl0bGU7XG4gICAgICAgICAgICBkYXRhLm1lc3NhZ2UgPSBub3RpZmljYXRpb24udGV4dDtcblxuICAgICAgICAgICAgLy8gU2V0IGltYWdlXG4gICAgICAgICAgICBpZih0eXBlb2Ygbm90aWZpY2F0aW9uLmltYWdlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBkYXRhLmltYWdlID0gbm90aWZpY2F0aW9uLmltYWdlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZXQgZXh0cmEgZGV0YWlsc1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBub3RpZmljYXRpb24uYmFkZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIGRhdGEubXNnY250ID0gbm90aWZpY2F0aW9uLmJhZGdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBub3RpZmljYXRpb24uc291bmQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIGRhdGEuc291bmRuYW1lID0gbm90aWZpY2F0aW9uLnNvdW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBub3RpZmljYXRpb24ubm90SWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIGRhdGEubm90SWQgPSBub3RpZmljYXRpb24ubm90SWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih0eXBlb2Ygbm90aWZpY2F0aW9uLnN0eWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBkYXRhLnN0eWxlID0gbm90aWZpY2F0aW9uLnN0eWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYodHlwZW9mIG5vdGlmaWNhdGlvbi5zdW1tYXJ5VGV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgZGF0YS5zdW1tYXJ5VGV4dCA9IG5vdGlmaWNhdGlvbi5zdW1tYXJ5VGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHR5cGVvZiBub3RpZmljYXRpb24ucGljdHVyZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgZGF0YS5waWN0dXJlID0gbm90aWZpY2F0aW9uLnBpY3R1cmU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vdmFyIG1lc3NhZ2UgPSBuZXcgZ2NtLk1lc3NhZ2UoKTtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbmV3IGdjbS5NZXNzYWdlKHtcbiAgICAgICAgICAgICAgICBjb2xsYXBzZUtleTogbm90aWZpY2F0aW9uLmZyb20sXG4gICAgICAgICAgICAvLyAgICBkZWxheVdoaWxlSWRsZTogdHJ1ZSxcbiAgICAgICAgICAgIC8vICAgIHRpbWVUb0xpdmU6IDQsXG4gICAgICAgICAgICAvLyAgICByZXN0cmljdGVkX3BhY2thZ2VfbmFtZTogJ2RrLmdpMi5hcHAnXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChQdXNoLmRlYnVnKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDcmVhdGUgR0NNIFNlbmRlciB1c2luZyBcIicgKyBvcHRpb25zLmdjbS5hcGlLZXkgKyAnXCInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzZW5kZXIgPSBuZXcgZ2NtLlNlbmRlcihvcHRpb25zLmdjbS5hcGlLZXkpO1xuXG4gICAgICAgICAgICBfLmVhY2godXNlclRva2VucywgZnVuY3Rpb24odmFsdWUgLyosIGtleSAqLykge1xuICAgICAgICAgICAgICAgIGlmIChQdXNoLmRlYnVnKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQTpTZW5kIG1lc3NhZ2UgdG86ICcgKyB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qbWVzc2FnZS5hZGREYXRhKCd0aXRsZScsIHRpdGxlKTtcbiAgICAgICAgICAgIG1lc3NhZ2UuYWRkRGF0YSgnbWVzc2FnZScsIHRleHQpO1xuICAgICAgICAgICAgbWVzc2FnZS5hZGREYXRhKCdtc2djbnQnLCAnMScpO1xuICAgICAgICAgICAgbWVzc2FnZS5jb2xsYXBzZUtleSA9ICdzaXREcmlmdCc7XG4gICAgICAgICAgICBtZXNzYWdlLmRlbGF5V2hpbGVJZGxlID0gdHJ1ZTtcbiAgICAgICAgICAgIG1lc3NhZ2UudGltZVRvTGl2ZSA9IDM7Ki9cblxuICAgICAgICAgICAgLy8gLyoqXG4gICAgICAgICAgICAvLyAgKiBQYXJhbWV0ZXJzOiBtZXNzYWdlLWxpdGVyYWwsIHVzZXJUb2tlbnMtYXJyYXksIE5vLiBvZiByZXRyaWVzLCBjYWxsYmFjay1mdW5jdGlvblxuICAgICAgICAgICAgLy8gICovXG5cbiAgICAgICAgICAgIHZhciB1c2VyVG9rZW4gPSAodXNlclRva2Vucy5sZW5ndGggPT09IDEpP3VzZXJUb2tlbnNbMF06bnVsbDtcblxuICAgICAgICAgICAgc2VuZGVyLnNlbmQobWVzc2FnZSwgdXNlclRva2VucywgNSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBTkRST0lEIEVSUk9SOiByZXN1bHQgb2Ygc2VuZGVyOiAnICsgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0FORFJPSUQ6IFJlc3VsdCBvZiBzZW5kZXIgaXMgbnVsbCcpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQU5EUk9JRDogUmVzdWx0IG9mIHNlbmRlcjogJyArIEpTT04uc3RyaW5naWZ5KHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuY2Fub25pY2FsX2lkcyA9PT0gMSAmJiB1c2VyVG9rZW4pIHsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYW4gb2xkIGRldmljZSwgdG9rZW4gaXMgcmVwbGFjZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIEZpYmVyKGZ1bmN0aW9uKHNlbGYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSdW4gaW4gZmliZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNhbGxiYWNrKHNlbGYub2xkVG9rZW4sIHNlbGYubmV3VG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2goZXJyKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLnJ1bih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkVG9rZW46IHsgZ2NtOiB1c2VyVG9rZW4gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdUb2tlbjogeyBnY206IHJlc3VsdC5yZXN1bHRzWzBdLnJlZ2lzdHJhdGlvbl9pZCB9LCAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogX3JlcGxhY2VUb2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL19yZXBsYWNlVG9rZW4oeyBnY206IHVzZXJUb2tlbiB9LCB7IGdjbTogcmVzdWx0LnJlc3VsdHNbMF0ucmVnaXN0cmF0aW9uX2lkIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgY2FudCBzZW5kIHRvIHRoYXQgdG9rZW4gLSBtaWdodCBub3QgYmUgcmVnaXN0cmVkXG4gICAgICAgICAgICAgICAgICAgIC8vIGFzayB0aGUgdXNlciB0byByZW1vdmUgdGhlIHRva2VuIGZyb20gdGhlIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5mYWlsdXJlICE9PSAwICYmIHVzZXJUb2tlbikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGFuIG9sZCBkZXZpY2UsIHRva2VuIGlzIHJlcGxhY2VkXG4gICAgICAgICAgICAgICAgICAgICAgICBGaWJlcihmdW5jdGlvbihzZWxmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUnVuIGluIGZpYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayhzZWxmLnRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoKGVycikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5ydW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiB7IGdjbTogdXNlclRva2VuIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IF9yZW1vdmVUb2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL19yZXBsYWNlVG9rZW4oeyBnY206IHVzZXJUb2tlbiB9LCB7IGdjbTogcmVzdWx0LnJlc3VsdHNbMF0ucmVnaXN0cmF0aW9uX2lkIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gLyoqIFVzZSB0aGUgZm9sbG93aW5nIGxpbmUgaWYgeW91IHdhbnQgdG8gc2VuZCB0aGUgbWVzc2FnZSB3aXRob3V0IHJldHJpZXNcbiAgICAgICAgICAgIC8vIHNlbmRlci5zZW5kTm9SZXRyeShtZXNzYWdlLCB1c2VyVG9rZW5zLCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ0FORFJPSUQ6ICcgKyBKU09OLnN0cmluZ2lmeShyZXN1bHQpKTtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgLy8gKiovXG4gICAgICAgIH07IC8vIEVPIHNlbmRBbmRyb2lkXG5cbiAgICB9IC8vIEVPIEFuZHJvaWRcblxuICAgIC8vIFVuaXZlcnNhbCBzZW5kIGZ1bmN0aW9uXG4gICAgdmFyIF9xdWVyeVNlbmQgPSBmdW5jdGlvbihxdWVyeSwgb3B0aW9ucykge1xuXG4gICAgICB2YXIgY291bnRBcG4gPSBbXTtcbiAgICAgIHZhciBjb3VudEdjbSA9IFtdO1xuXG4gICAgICAgIFB1c2guYXBwQ29sbGVjdGlvbi5maW5kKHF1ZXJ5KS5mb3JFYWNoKGZ1bmN0aW9uKGFwcCkge1xuXG4gICAgICAgICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzZW5kIHRvIHRva2VuJywgYXBwLnRva2VuKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhcHAudG9rZW4uYXBuKSB7XG4gICAgICAgICAgICAgIGNvdW50QXBuLnB1c2goYXBwLl9pZCk7XG4gICAgICAgICAgICAgICAgLy8gU2VuZCB0byBBUE5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5zZW5kQVBOKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLnNlbmRBUE4oYXBwLnRva2VuLmFwbiwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFwcC50b2tlbi5nY20pIHtcbiAgICAgICAgICAgICAgY291bnRHY20ucHVzaChhcHAuX2lkKTtcblxuICAgICAgICAgICAgICAgIC8vIFNlbmQgdG8gR0NNXG4gICAgICAgICAgICAgICAgLy8gV2UgZG8gc3VwcG9ydCBtdWx0aXBsZSBoZXJlIC0gc28gd2Ugc2hvdWxkIGNvbnN0cnVjdCBhbiBhcnJheVxuICAgICAgICAgICAgICAgIC8vIGFuZCBzZW5kIGl0IGJ1bGsgLSBJbnZlc3RpZ2F0ZSBsaW1pdCBjb3VudCBvZiBpZCdzXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuc2VuZEdDTSkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5zZW5kR0NNKGFwcC50b2tlbi5nY20sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1B1c2guc2VuZCBnb3QgYSBmYXVsdHkgcXVlcnknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoUHVzaC5kZWJ1Zykge1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJ1B1c2g6IFNlbnQgbWVzc2FnZSBcIicgKyBvcHRpb25zLnRpdGxlICsgJ1wiIHRvICcgKyBjb3VudEFwbi5sZW5ndGggKyAnIGlvcyBhcHBzICcgK1xuICAgICAgICAgICAgY291bnRHY20ubGVuZ3RoICsgJyBhbmRyb2lkIGFwcHMnKTtcblxuICAgICAgICAgIC8vIEFkZCBzb21lIHZlcmJvc2l0eSBhYm91dCB0aGUgc2VuZCByZXN1bHQsIG1ha2luZyBzdXJlIHRoZSBkZXZlbG9wZXJcbiAgICAgICAgICAvLyB1bmRlcnN0YW5kcyB3aGF0IGp1c3QgaGFwcGVuZWQuXG4gICAgICAgICAgaWYgKCFjb3VudEFwbi5sZW5ndGggJiYgIWNvdW50R2NtLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKFB1c2guYXBwQ29sbGVjdGlvbi5maW5kKCkuY291bnQoKSA9PT0gMCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUHVzaCwgR1VJREU6IFRoZSBcIlB1c2guYXBwQ29sbGVjdGlvblwiIGlzIGVtcHR5IC0nICtcbiAgICAgICAgICAgICAgICAnIE5vIGNsaWVudHMgaGF2ZSByZWdpc3RyZWQgb24gdGhlIHNlcnZlciB5ZXQuLi4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKCFjb3VudEFwbi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChQdXNoLmFwcENvbGxlY3Rpb24uZmluZCh7ICd0b2tlbi5hcG4nOiB7ICRleGlzdHM6IHRydWUgfSB9KS5jb3VudCgpID09PSAwKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQdXNoLCBHVUlERTogVGhlIFwiUHVzaC5hcHBDb2xsZWN0aW9uXCIgLSBObyBBUE4gY2xpZW50cyBoYXZlIHJlZ2lzdHJlZCBvbiB0aGUgc2VydmVyIHlldC4uLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoIWNvdW50R2NtLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKFB1c2guYXBwQ29sbGVjdGlvbi5maW5kKHsgJ3Rva2VuLmdjbSc6IHsgJGV4aXN0czogdHJ1ZSB9IH0pLmNvdW50KCkgPT09IDApIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1B1c2gsIEdVSURFOiBUaGUgXCJQdXNoLmFwcENvbGxlY3Rpb25cIiAtIE5vIEdDTSBjbGllbnRzIGhhdmUgcmVnaXN0cmVkIG9uIHRoZSBzZXJ2ZXIgeWV0Li4uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGFwbjogY291bnRBcG4sXG4gICAgICAgICAgZ2NtOiBjb3VudEdjbVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBzZWxmLnNlcnZlclNlbmQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7IGJhZGdlOiAwIH07XG4gICAgICB2YXIgcXVlcnk7XG5cbiAgICAgIC8vIENoZWNrIGJhc2ljIG9wdGlvbnNcbiAgICAgIGlmIChvcHRpb25zLmZyb20gIT09ICcnK29wdGlvbnMuZnJvbSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1B1c2guc2VuZDogb3B0aW9uIFwiZnJvbVwiIG5vdCBhIHN0cmluZycpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy50aXRsZSAhPT0gJycrb3B0aW9ucy50aXRsZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1B1c2guc2VuZDogb3B0aW9uIFwidGl0bGVcIiBub3QgYSBzdHJpbmcnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMudGV4dCAhPT0gJycrb3B0aW9ucy50ZXh0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUHVzaC5zZW5kOiBvcHRpb24gXCJ0ZXh0XCIgbm90IGEgc3RyaW5nJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLnRva2VuIHx8IG9wdGlvbnMudG9rZW5zKSB7XG5cbiAgICAgICAgLy8gVGhlIHVzZXIgc2V0IG9uZSB0b2tlbiBvciBhcnJheSBvZiB0b2tlbnNcbiAgICAgICAgdmFyIHRva2VuTGlzdCA9IChvcHRpb25zLnRva2VuKT8gW29wdGlvbnMudG9rZW5dIDogb3B0aW9ucy50b2tlbnM7XG5cbiAgICAgICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnUHVzaDogU2VuZCBtZXNzYWdlIFwiJyArIG9wdGlvbnMudGl0bGUgKyAnXCIgdmlhIHRva2VuKHMpJywgdG9rZW5MaXN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHF1ZXJ5ID0ge1xuICAgICAgICAgICRvcjogW1xuICAgICAgICAgICAgICAvLyBYWFg6IFRlc3QgdGhpcyBxdWVyeTogY2FuIHdlIGhhbmQgaW4gYSBsaXN0IG9mIHB1c2ggdG9rZW5zP1xuICAgICAgICAgICAgICB7ICRhbmQ6IFtcbiAgICAgICAgICAgICAgICAgIHsgdG9rZW46IHsgJGluOiB0b2tlbkxpc3QgfSB9LFxuICAgICAgICAgICAgICAgICAgLy8gQW5kIGlzIG5vdCBkaXNhYmxlZFxuICAgICAgICAgICAgICAgICAgeyBlbmFibGVkOiB7ICRuZTogZmFsc2UgfX1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIC8vIFhYWDogVGVzdCB0aGlzIHF1ZXJ5OiBkb2VzIHRoaXMgd29yayBvbiBhcHAgaWQ/XG4gICAgICAgICAgICAgIHsgJGFuZDogW1xuICAgICAgICAgICAgICAgICAgeyBfaWQ6IHsgJGluOiB0b2tlbkxpc3QgfSB9LCAvLyBvbmUgb2YgdGhlIGFwcCBpZHNcbiAgICAgICAgICAgICAgICAgIHsgJG9yOiBbXG4gICAgICAgICAgICAgICAgICAgICAgeyAndG9rZW4uYXBuJzogeyAkZXhpc3RzOiB0cnVlIH0gIH0sIC8vIGdvdCBhcG4gdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICB7ICd0b2tlbi5nY20nOiB7ICRleGlzdHM6IHRydWUgfSAgfSAgLy8gZ290IGdjbSB0b2tlblxuICAgICAgICAgICAgICAgICAgXX0sXG4gICAgICAgICAgICAgICAgICAvLyBBbmQgaXMgbm90IGRpc2FibGVkXG4gICAgICAgICAgICAgICAgICB7IGVuYWJsZWQ6IHsgJG5lOiBmYWxzZSB9fVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfTtcblxuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnF1ZXJ5KSB7XG5cbiAgICAgICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnUHVzaDogU2VuZCBtZXNzYWdlIFwiJyArIG9wdGlvbnMudGl0bGUgKyAnXCIgdmlhIHF1ZXJ5Jywgb3B0aW9ucy5xdWVyeSk7XG4gICAgICAgIH1cblxuICAgICAgICBxdWVyeSA9IHtcbiAgICAgICAgICAkYW5kOiBbXG4gICAgICAgICAgICAgIG9wdGlvbnMucXVlcnksIC8vIHF1ZXJ5IG9iamVjdFxuICAgICAgICAgICAgICB7ICRvcjogW1xuICAgICAgICAgICAgICAgICAgeyAndG9rZW4uYXBuJzogeyAkZXhpc3RzOiB0cnVlIH0gIH0sIC8vIGdvdCBhcG4gdG9rZW5cbiAgICAgICAgICAgICAgICAgIHsgJ3Rva2VuLmdjbSc6IHsgJGV4aXN0czogdHJ1ZSB9ICB9ICAvLyBnb3QgZ2NtIHRva2VuXG4gICAgICAgICAgICAgIF19LFxuICAgICAgICAgICAgICAvLyBBbmQgaXMgbm90IGRpc2FibGVkXG4gICAgICAgICAgICAgIHsgZW5hYmxlZDogeyAkbmU6IGZhbHNlIH19XG4gICAgICAgICAgXVxuICAgICAgICB9O1xuICAgICAgfVxuXG5cbiAgICAgIGlmIChxdWVyeSkge1xuXG4gICAgICAgIC8vIENvbnZlcnQgdG8gcXVlcnlTZW5kIGFuZCByZXR1cm4gc3RhdHVzXG4gICAgICAgIHJldHVybiBfcXVlcnlTZW5kKHF1ZXJ5LCBvcHRpb25zKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQdXNoLnNlbmQ6IHBsZWFzZSBzZXQgb3B0aW9uIFwidG9rZW5cIi9cInRva2Vuc1wiIG9yIFwicXVlcnlcIicpO1xuICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgLy8gVGhpcyBpbnRlcnZhbCB3aWxsIGFsbG93IG9ubHkgb25lIG5vdGlmaWNhdGlvbiB0byBiZSBzZW50IGF0IGEgdGltZSwgaXRcbiAgICAvLyB3aWxsIGNoZWNrIGZvciBuZXcgbm90aWZpY2F0aW9ucyBhdCBldmVyeSBgb3B0aW9ucy5zZW5kSW50ZXJ2YWxgXG4gICAgLy8gKGRlZmF1bHQgaW50ZXJ2YWwgaXMgMTUwMDAgbXMpXG4gICAgLy9cbiAgICAvLyBJdCBsb29rcyBpbiBub3RpZmljYXRpb25zIGNvbGxlY3Rpb24gdG8gc2VlIGlmIHRoZXJlcyBhbnkgcGVuZGluZ1xuICAgIC8vIG5vdGlmaWNhdGlvbnMsIGlmIHNvIGl0IHdpbGwgdHJ5IHRvIHJlc2VydmUgdGhlIHBlbmRpbmcgbm90aWZpY2F0aW9uLlxuICAgIC8vIElmIHN1Y2Nlc3NmdWxseSByZXNlcnZlZCB0aGUgc2VuZCBpcyBzdGFydGVkLlxuICAgIC8vXG4gICAgLy8gSWYgbm90aWZpY2F0aW9uLnF1ZXJ5IGlzIHR5cGUgc3RyaW5nLCBpdCdzIGFzc3VtZWQgdG8gYmUgYSBqc29uIHN0cmluZ1xuICAgIC8vIHZlcnNpb24gb2YgdGhlIHF1ZXJ5IHNlbGVjdG9yLiBNYWtpbmcgaXQgYWJsZSB0byBjYXJyeSBgJGAgcHJvcGVydGllcyBpblxuICAgIC8vIHRoZSBtb25nbyBjb2xsZWN0aW9uLlxuICAgIC8vXG4gICAgLy8gUHIuIGRlZmF1bHQgbm90aWZpY2F0aW9ucyBhcmUgcmVtb3ZlZCBmcm9tIHRoZSBjb2xsZWN0aW9uIGFmdGVyIHNlbmQgaGF2ZVxuICAgIC8vIGNvbXBsZXRlZC4gU2V0dGluZyBgb3B0aW9ucy5rZWVwTm90aWZpY2F0aW9uc2Agd2lsbCB1cGRhdGUgYW5kIGtlZXAgdGhlXG4gICAgLy8gbm90aWZpY2F0aW9uIGVnLiBpZiBuZWVkZWQgZm9yIGhpc3RvcmljYWwgcmVhc29ucy5cbiAgICAvL1xuICAgIC8vIEFmdGVyIHRoZSBzZW5kIGhhdmUgY29tcGxldGVkIGEgXCJzZW5kXCIgZXZlbnQgd2lsbCBiZSBlbWl0dGVkIHdpdGggYVxuICAgIC8vIHN0YXR1cyBvYmplY3QgY29udGFpbmluZyBub3RpZmljYXRpb24gaWQgYW5kIHRoZSBzZW5kIHJlc3VsdCBvYmplY3QuXG4gICAgLy9cbiAgICB2YXIgaXNTZW5kaW5nTm90aWZpY2F0aW9uID0gZmFsc2U7XG5cbiAgICBpZiAob3B0aW9ucy5zZW5kSW50ZXJ2YWwgIT09IG51bGwpIHtcblxuICAgICAgLy8gVGhpcyB3aWxsIHJlcXVpcmUgaW5kZXggc2luY2Ugd2Ugc29ydCBub3RpZmljYXRpb25zIGJ5IGNyZWF0ZWRBdFxuICAgICAgUHVzaC5ub3RpZmljYXRpb25zLl9lbnN1cmVJbmRleCh7IGNyZWF0ZWRBdDogMSB9KTtcbiAgICAgIFB1c2gubm90aWZpY2F0aW9ucy5fZW5zdXJlSW5kZXgoeyBzZW50OiAxIH0pO1xuICAgICAgUHVzaC5ub3RpZmljYXRpb25zLl9lbnN1cmVJbmRleCh7IHNlbmRpbmc6IDEgfSk7XG4gICAgICBQdXNoLm5vdGlmaWNhdGlvbnMuX2Vuc3VyZUluZGV4KHsgZGVsYXlVbnRpbDogMSB9KTtcblxuICAgICAgdmFyIHNlbmROb3RpZmljYXRpb24gPSBmdW5jdGlvbihub3RpZmljYXRpb24pIHtcbiAgICAgICAgLy8gUmVzZXJ2ZSBub3RpZmljYXRpb25cbiAgICAgICAgdmFyIG5vdyA9ICtuZXcgRGF0ZSgpO1xuICAgICAgICB2YXIgdGltZW91dEF0ID0gbm93ICsgb3B0aW9ucy5zZW5kVGltZW91dDtcbiAgICAgICAgdmFyIHJlc2VydmVkID0gUHVzaC5ub3RpZmljYXRpb25zLnVwZGF0ZSh7XG4gICAgICAgICAgX2lkOiBub3RpZmljYXRpb24uX2lkLFxuICAgICAgICAgIHNlbnQ6IGZhbHNlLCAvLyB4eHg6IG5lZWQgdG8gbWFrZSBzdXJlIHRoaXMgaXMgc2V0IG9uIGNyZWF0ZVxuICAgICAgICAgIHNlbmRpbmc6IHsgJGx0OiBub3cgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICRzZXQ6IHtcbiAgICAgICAgICAgIHNlbmRpbmc6IHRpbWVvdXRBdCxcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBvbmx5IGhhbmRsZSBub3RpZmljYXRpb25zIHJlc2VydmVkIGJ5IHRoaXNcbiAgICAgICAgLy8gaW5zdGFuY2VcbiAgICAgICAgaWYgKHJlc2VydmVkKSB7XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiBxdWVyeSBpcyBzZXQgYW5kIGlzIHR5cGUgU3RyaW5nXG4gICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbi5xdWVyeSAmJiBub3RpZmljYXRpb24ucXVlcnkgPT09ICcnK25vdGlmaWNhdGlvbi5xdWVyeSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgLy8gVGhlIHF1ZXJ5IGlzIGluIHN0cmluZyBqc29uIGZvcm1hdCAtIHdlIG5lZWQgdG8gcGFyc2UgaXRcbiAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLnF1ZXJ5ID0gSlNPTi5wYXJzZShub3RpZmljYXRpb24ucXVlcnkpO1xuICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcbiAgICAgICAgICAgICAgLy8gRGlkIHRoZSB1c2VyIHRhbXBlciB3aXRoIHRoaXM/P1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1B1c2g6IEVycm9yIHdoaWxlIHBhcnNpbmcgcXVlcnkgc3RyaW5nLCBFcnJvcjogJyArIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBTZW5kIHRoZSBub3RpZmljYXRpb25cbiAgICAgICAgICB2YXIgcmVzdWx0ID0gUHVzaC5zZXJ2ZXJTZW5kKG5vdGlmaWNhdGlvbik7XG5cbiAgICAgICAgICBpZiAoIW9wdGlvbnMua2VlcE5vdGlmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgICAgLy8gUHIuIERlZmF1bHQgd2Ugd2lsbCByZW1vdmUgbm90aWZpY2F0aW9uc1xuICAgICAgICAgICAgICBQdXNoLm5vdGlmaWNhdGlvbnMucmVtb3ZlKHsgX2lkOiBub3RpZmljYXRpb24uX2lkIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBub3RpZmljYXRpb25cbiAgICAgICAgICAgICAgUHVzaC5ub3RpZmljYXRpb25zLnVwZGF0ZSh7IF9pZDogbm90aWZpY2F0aW9uLl9pZCB9LCB7XG4gICAgICAgICAgICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE1hcmsgYXMgc2VudFxuICAgICAgICAgICAgICAgICAgICBzZW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIHNlbnQgZGF0ZVxuICAgICAgICAgICAgICAgICAgICBzZW50QXQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgIC8vIENvdW50XG4gICAgICAgICAgICAgICAgICAgIGNvdW50OiByZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdCBiZWluZyBzZW50IGFueW1vcmVcbiAgICAgICAgICAgICAgICAgICAgc2VuZGluZzogMFxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEVtaXQgdGhlIHNlbmRcbiAgICAgICAgICBzZWxmLmVtaXQoJ3NlbmQnLCB7IG5vdGlmaWNhdGlvbjogbm90aWZpY2F0aW9uLl9pZCwgcmVzdWx0OiByZXN1bHQgfSk7XG5cbiAgICAgICAgfSAvLyBFbHNlIGNvdWxkIG5vdCByZXNlcnZlXG4gICAgICB9OyAvLyBFTyBzZW5kTm90aWZpY2F0aW9uXG5cbiAgICAgIHNlbmRXb3JrZXIoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICBpZiAoaXNTZW5kaW5nTm90aWZpY2F0aW9uKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICAvLyBTZXQgc2VuZCBmZW5jZVxuICAgICAgICAgICAgaXNTZW5kaW5nTm90aWZpY2F0aW9uID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gdmFyIGNvdW50U2VudCA9IDA7XG4gICAgICAgICAgICB2YXIgYmF0Y2hTaXplID0gb3B0aW9ucy5zZW5kQmF0Y2hTaXplIHx8IDE7XG5cbiAgICAgICAgICAgIHZhciBub3cgPSArbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgLy8gRmluZCBub3RpZmljYXRpb25zIHRoYXQgYXJlIG5vdCBiZWluZyBvciBhbHJlYWR5IHNlbnRcbiAgICAgICAgICAgIHZhciBwZW5kaW5nTm90aWZpY2F0aW9ucyA9IFB1c2gubm90aWZpY2F0aW9ucy5maW5kKHsgJGFuZDogW1xuICAgICAgICAgICAgICAgICAgLy8gTWVzc2FnZSBpcyBub3Qgc2VudFxuICAgICAgICAgICAgICAgICAgeyBzZW50IDogZmFsc2UgfSxcbiAgICAgICAgICAgICAgICAgIC8vIEFuZCBub3QgYmVpbmcgc2VudCBieSBvdGhlciBpbnN0YW5jZXNcbiAgICAgICAgICAgICAgICAgIHsgc2VuZGluZzogeyAkbHQ6IG5vdyB9IH0sXG4gICAgICAgICAgICAgICAgICAvLyBBbmQgbm90IHF1ZXVlZCBmb3IgZnV0dXJlXG4gICAgICAgICAgICAgICAgICB7ICRvcjogW1xuICAgICAgICAgICAgICAgICAgICAgIHsgZGVsYXlVbnRpbDogeyAkZXhpc3RzOiBmYWxzZSB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgeyBkZWxheVVudGlsOiAgeyAkbHRlOiBuZXcgRGF0ZSgpIH0gfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF19LCB7XG4gICAgICAgICAgICAgICAgLy8gU29ydCBieSBjcmVhdGVkIGRhdGVcbiAgICAgICAgICAgICAgICBzb3J0OiB7IGNyZWF0ZWRBdDogMSB9LFxuICAgICAgICAgICAgICAgIGxpbWl0OiBiYXRjaFNpemVcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHBlbmRpbmdOb3RpZmljYXRpb25zLmZvckVhY2goZnVuY3Rpb24obm90aWZpY2F0aW9uKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc2VuZE5vdGlmaWNhdGlvbihub3RpZmljYXRpb24pO1xuICAgICAgICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBQdXNoLkxvZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgUHVzaC5Mb2coJ1B1c2g6IENvdWxkIG5vdCBzZW5kIG5vdGlmaWNhdGlvbiBpZDogXCInICsgbm90aWZpY2F0aW9uLl9pZCArICdcIiwgRXJyb3I6JywgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChQdXNoLmRlYnVnKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUHVzaDogQ291bGQgbm90IHNlbmQgbm90aWZpY2F0aW9uIGlkOiBcIicgKyBub3RpZmljYXRpb24uX2lkICsgJ1wiLCBFcnJvcjogJyArIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7IC8vIEVPIGZvckVhY2hcbiAgICAgICAgICB9IGZpbmFsbHkge1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIHNlbmQgZmVuY2VcbiAgICAgICAgICAgIGlzU2VuZGluZ05vdGlmaWNhdGlvbiA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgIH0sIG9wdGlvbnMuc2VuZEludGVydmFsIHx8IDE1MDAwKTsgLy8gRGVmYXVsdCBldmVyeSAxNXRoIHNlY1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChQdXNoLmRlYnVnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQdXNoOiBTZW5kIHNlcnZlciBpcyBkaXNhYmxlZCcpO1xuICAgICAgfVxuICAgIH1cblxufTtcbiIsIlB1c2guYXBwQ29sbGVjdGlvbiA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdfcmFpeF9wdXNoX2FwcF90b2tlbnMnKTtcblB1c2guYXBwQ29sbGVjdGlvbi5fZW5zdXJlSW5kZXgoeyB1c2VySWQ6IDEgfSk7XG5cblB1c2guYWRkTGlzdGVuZXIoJ3Rva2VuJywgZnVuY3Rpb24oY3VycmVudFRva2VuLCB2YWx1ZSkge1xuICBpZiAodmFsdWUpIHtcbiAgICAvLyBVcGRhdGUgdGhlIHRva2VuIGZvciBhcHBcbiAgICBQdXNoLmFwcENvbGxlY3Rpb24udXBkYXRlKHsgdG9rZW46IGN1cnJlbnRUb2tlbiB9LCB7ICRzZXQ6IHsgdG9rZW46IHZhbHVlIH0gfSwgeyBtdWx0aTogdHJ1ZSB9KTtcbiAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgIC8vIFJlbW92ZSB0aGUgdG9rZW4gZm9yIGFwcFxuICAgIFB1c2guYXBwQ29sbGVjdGlvbi51cGRhdGUoeyB0b2tlbjogY3VycmVudFRva2VuIH0sIHsgJHVuc2V0OiB7IHRva2VuOiB0cnVlIH0gfSwgeyBtdWx0aTogdHJ1ZSB9KTtcbiAgfVxufSk7XG5cbk1ldGVvci5tZXRob2RzKHtcbiAgJ3JhaXg6cHVzaC11cGRhdGUnOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdQdXNoOiBHb3QgcHVzaCB0b2tlbiBmcm9tIGFwcDonLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBjaGVjayhvcHRpb25zLCB7XG4gICAgICBpZDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgIHRva2VuOiBfbWF0Y2hUb2tlbixcbiAgICAgIGFwcE5hbWU6IFN0cmluZyxcbiAgICAgIHVzZXJJZDogTWF0Y2guT25lT2YoU3RyaW5nLCBudWxsKSxcbiAgICAgIG1ldGFkYXRhOiBNYXRjaC5PcHRpb25hbChPYmplY3QpXG4gICAgfSk7XG5cbiAgICAvLyBUaGUgaWYgdXNlciBpZCBpcyBzZXQgdGhlbiB1c2VyIGlkIHNob3VsZCBtYXRjaCBvbiBjbGllbnQgYW5kIGNvbm5lY3Rpb25cbiAgICBpZiAob3B0aW9ucy51c2VySWQgJiYgb3B0aW9ucy51c2VySWQgIT09IHRoaXMudXNlcklkKSB7XG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMywgJ0ZvcmJpZGRlbiBhY2Nlc3MnKTtcbiAgICB9XG5cbiAgICB2YXIgZG9jO1xuXG4gICAgLy8gbG9va3VwIGFwcCBieSBpZCBpZiBvbmUgd2FzIGluY2x1ZGVkXG4gICAgaWYgKG9wdGlvbnMuaWQpIHtcbiAgICAgIGRvYyA9IFB1c2guYXBwQ29sbGVjdGlvbi5maW5kT25lKHtfaWQ6IG9wdGlvbnMuaWR9KTtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMudXNlcklkKSB7XG4gICAgICBkb2MgPSBQdXNoLmFwcENvbGxlY3Rpb24uZmluZE9uZSh7dXNlcklkOiBvcHRpb25zLnVzZXJJZH0pO1xuICAgIH1cblxuICAgIC8vIE5vIGRvYyB3YXMgZm91bmQgLSB3ZSBjaGVjayB0aGUgZGF0YWJhc2UgdG8gc2VlIGlmXG4gICAgLy8gd2UgY2FuIGZpbmQgYSBtYXRjaCBmb3IgdGhlIGFwcCB2aWEgdG9rZW4gYW5kIGFwcE5hbWVcbiAgICBpZiAoIWRvYykge1xuICAgICAgZG9jID0gUHVzaC5hcHBDb2xsZWN0aW9uLmZpbmRPbmUoe1xuICAgICAgICAkYW5kOiBbXG4gICAgICAgICAgeyB0b2tlbjogb3B0aW9ucy50b2tlbiB9LCAgICAgLy8gTWF0Y2ggdG9rZW5cbiAgICAgICAgICB7IGFwcE5hbWU6IG9wdGlvbnMuYXBwTmFtZSB9LCAvLyBNYXRjaCBhcHBOYW1lXG4gICAgICAgICAgeyB0b2tlbjogeyAkZXhpc3RzOiB0cnVlIH0gfSAgLy8gTWFrZSBzdXJlIHRva2VuIGV4aXN0c1xuICAgICAgICBdXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBpZiB3ZSBjb3VsZCBub3QgZmluZCB0aGUgaWQgb3IgdG9rZW4gdGhlbiBjcmVhdGUgaXRcbiAgICBpZiAoIWRvYykge1xuICAgICAgLy8gUmlnIGRlZmF1bHQgZG9jXG4gICAgICBkb2MgPSB7XG4gICAgICAgIHRva2VuOiBvcHRpb25zLnRva2VuLFxuICAgICAgICBhcHBOYW1lOiBvcHRpb25zLmFwcE5hbWUsXG4gICAgICAgIHVzZXJJZDogb3B0aW9ucy51c2VySWQsXG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpXG4gICAgICB9O1xuXG4gICAgICAvLyBYWFg6IFdlIG1pZ2h0IHdhbnQgdG8gY2hlY2sgdGhlIGlkIC0gV2h5IGlzbnQgdGhlcmUgYSBtYXRjaCBmb3IgaWRcbiAgICAgIC8vIGluIHRoZSBNZXRlb3IgY2hlY2suLi4gTm9ybWFsIGxlbmd0aCAxNyAoY291bGQgYmUgbGFyZ2VyKSwgYW5kXG4gICAgICAvLyBudW1iZXJzK2xldHRlcnMgYXJlIHVzZWQgaW4gUmFuZG9tLmlkKCkgd2l0aCBleGNlcHRpb24gb2YgMCBhbmQgMVxuICAgICAgZG9jLl9pZCA9IG9wdGlvbnMuaWQgfHwgUmFuZG9tLmlkKCk7XG4gICAgICAvLyBUaGUgdXNlciB3YW50ZWQgdXMgdG8gdXNlIGEgc3BlY2lmaWMgaWQsIHdlIGRpZG4ndCBmaW5kIHRoaXMgd2hpbGVcbiAgICAgIC8vIHNlYXJjaGluZy4gVGhlIGNsaWVudCBjb3VsZCBkZXBlbmQgb24gdGhlIGlkIGVnLiBhcyByZWZlcmVuY2Ugc29cbiAgICAgIC8vIHdlIHJlc3BlY3QgdGhpcyBhbmQgdHJ5IHRvIGNyZWF0ZSBhIGRvY3VtZW50IHdpdGggdGhlIHNlbGVjdGVkIGlkO1xuICAgICAgUHVzaC5hcHBDb2xsZWN0aW9uLl9jb2xsZWN0aW9uLmluc2VydChkb2MpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXZSBmb3VuZCB0aGUgYXBwIHNvIHVwZGF0ZSB0aGUgdXBkYXRlZEF0IGFuZCBzZXQgdGhlIHRva2VuXG4gICAgICBQdXNoLmFwcENvbGxlY3Rpb24udXBkYXRlKHsgX2lkOiBkb2MuX2lkIH0sIHtcbiAgICAgICAgJHNldDoge1xuICAgICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgICAgICB0b2tlbjogb3B0aW9ucy50b2tlblxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZG9jKSB7XG4gICAgICAvLyB4eHg6IEhhY2tcbiAgICAgIC8vIENsZWFuIHVwIG1lY2ggbWFraW5nIHN1cmUgdG9rZW5zIGFyZSB1bmlxIC0gYW5kcm9pZCBzb21ldGltZXMgZ2VuZXJhdGVcbiAgICAgIC8vIG5ldyB0b2tlbnMgcmVzdWx0aW5nIGluIGR1cGxpY2F0ZXNcbiAgICAgIHZhciByZW1vdmVkID0gUHVzaC5hcHBDb2xsZWN0aW9uLnJlbW92ZSh7XG4gICAgICAgICRhbmQ6IFtcbiAgICAgICAgICB7IF9pZDogeyAkbmU6IGRvYy5faWQgfSB9LFxuICAgICAgICAgIHsgdG9rZW46IGRvYy50b2tlbiB9LCAgICAgLy8gTWF0Y2ggdG9rZW5cbiAgICAgICAgICB7IGFwcE5hbWU6IGRvYy5hcHBOYW1lIH0sIC8vIE1hdGNoIGFwcE5hbWVcbiAgICAgICAgICB7IHRva2VuOiB7ICRleGlzdHM6IHRydWUgfSB9ICAvLyBNYWtlIHN1cmUgdG9rZW4gZXhpc3RzXG4gICAgICAgIF1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVtb3ZlZCAmJiBQdXNoLmRlYnVnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQdXNoOiBSZW1vdmVkICcgKyByZW1vdmVkICsgJyBleGlzdGluZyBhcHAgaXRlbXMnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZG9jICYmIFB1c2guZGVidWcpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdQdXNoOiB1cGRhdGVkJywgZG9jKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvYykge1xuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig1MDAsICdzZXRQdXNoVG9rZW4gY291bGQgbm90IGNyZWF0ZSByZWNvcmQnKTtcbiAgICB9XG4gICAgLy8gUmV0dXJuIHRoZSBkb2Mgd2Ugd2FudCB0byB1c2VcbiAgICByZXR1cm4gZG9jO1xuICB9LFxuICAncmFpeDpwdXNoLXNldHVzZXInOiBmdW5jdGlvbihpZCkge1xuICAgIGNoZWNrKGlkLCBTdHJpbmcpO1xuXG4gICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdQdXNoOiBTZXR0aW5ncyB1c2VySWQgXCInICsgdGhpcy51c2VySWQgKyAnXCIgZm9yIGFwcDonLCBpZCk7XG4gICAgfVxuICAgIC8vIFdlIHVwZGF0ZSB0aGUgYXBwQ29sbGVjdGlvbiBpZCBzZXR0aW5nIHRoZSBNZXRlb3IudXNlcklkXG4gICAgdmFyIGZvdW5kID0gUHVzaC5hcHBDb2xsZWN0aW9uLnVwZGF0ZSh7IF9pZDogaWQgfSwgeyAkc2V0OiB7IHVzZXJJZDogdGhpcy51c2VySWQgfSB9KTtcblxuICAgIC8vIE5vdGUgdGhhdCB0aGUgYXBwIGlkIG1pZ2h0IG5vdCBleGlzdCBiZWNhdXNlIG5vIHRva2VuIGlzIHNldCB5ZXQuXG4gICAgLy8gV2UgZG8gY3JlYXRlIHRoZSBuZXcgYXBwIGlkIGZvciB0aGUgdXNlciBzaW5jZSB3ZSBtaWdodCBzdG9yZSBhZGRpdGlvbmFsXG4gICAgLy8gbWV0YWRhdGEgZm9yIHRoZSBhcHAgLyB1c2VyXG5cbiAgICAvLyBJZiBpZCBub3QgZm91bmQgdGhlbiBjcmVhdGUgaXQ/XG4gICAgLy8gV2UgZG9udCwgaXRzIGJldHRlciB0byB3YWl0IHVudGlsIHRoZSB1c2VyIHdhbnRzIHRvXG4gICAgLy8gc3RvcmUgbWV0YWRhdGEgb3IgdG9rZW4gLSBXZSBjb3VsZCBlbmQgdXAgd2l0aCB1bnVzZWQgZGF0YSBpbiB0aGVcbiAgICAvLyBjb2xsZWN0aW9uIGF0IGV2ZXJ5IGFwcCByZS1pbnN0YWxsIC8gdXBkYXRlXG4gICAgLy9cbiAgICAvLyBUaGUgdXNlciBjb3VsZCBzdG9yZSBzb21lIG1ldGFkYXRhIGluIGFwcENvbGxlY3RpbiBidXQgb25seSBpZiB0aGV5XG4gICAgLy8gaGF2ZSBjcmVhdGVkIHRoZSBhcHAgYW5kIHByb3ZpZGVkIGEgdG9rZW4uXG4gICAgLy8gSWYgbm90IHRoZSBtZXRhZGF0YSBzaG91bGQgYmUgc2V0IHZpYSBncm91bmQ6ZGJcblxuICAgIHJldHVybiAhIWZvdW5kO1xuICB9LFxuICAncmFpeDpwdXNoLW1ldGFkYXRhJzogZnVuY3Rpb24oZGF0YSkge1xuICAgIGNoZWNrKGRhdGEsIHtcbiAgICAgIGlkOiBTdHJpbmcsXG4gICAgICBtZXRhZGF0YTogT2JqZWN0XG4gICAgfSk7XG5cbiAgICAvLyBTZXQgdGhlIG1ldGFkYXRhXG4gICAgdmFyIGZvdW5kID0gUHVzaC5hcHBDb2xsZWN0aW9uLnVwZGF0ZSh7IF9pZDogZGF0YS5pZCB9LCB7ICRzZXQ6IHsgbWV0YWRhdGE6IGRhdGEubWV0YWRhdGEgfSB9KTtcblxuICAgIHJldHVybiAhIWZvdW5kO1xuICB9LFxuICAncmFpeDpwdXNoLWVuYWJsZSc6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBjaGVjayhkYXRhLCB7XG4gICAgICBpZDogU3RyaW5nLFxuICAgICAgZW5hYmxlZDogQm9vbGVhblxuICAgIH0pO1xuXG4gICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdQdXNoOiBTZXR0aW5nIGVuYWJsZWQgdG8gXCInICsgZGF0YS5lbmFibGVkICsgJ1wiIGZvciBhcHA6JywgZGF0YS5pZCk7XG4gICAgfVxuXG4gICAgdmFyIGZvdW5kID0gUHVzaC5hcHBDb2xsZWN0aW9uLnVwZGF0ZSh7IF9pZDogZGF0YS5pZCB9LCB7ICRzZXQ6IHsgZW5hYmxlZDogZGF0YS5lbmFibGVkIH0gfSk7XG5cbiAgICByZXR1cm4gISFmb3VuZDtcbiAgfVxufSk7XG5cbiJdfQ==
