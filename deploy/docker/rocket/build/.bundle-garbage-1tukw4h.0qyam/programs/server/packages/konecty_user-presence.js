(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var UsersSessions, UserPresence, UserPresenceEvents, UserPresenceMonitor;

var require = meteorInstall({"node_modules":{"meteor":{"konecty:user-presence":{"common":{"common.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/konecty_user-presence/common/common.js                                                          //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
/* globals UsersSessions */

/* exported UsersSessions */
UsersSessions = new Meteor.Collection('usersSessions');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"server":{"server.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/konecty_user-presence/server/server.js                                                          //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
module.link("colors");

UsersSessions._ensureIndex({
  'connections.instanceId': 1
}, {
  sparse: 1,
  name: 'connections.instanceId'
});

UsersSessions._ensureIndex({
  'connections.id': 1
}, {
  sparse: 1,
  name: 'connections.id'
});

var allowedStatus = ['online', 'away', 'busy', 'offline'];
var logEnable = process.env.ENABLE_PRESENCE_LOGS === 'true';

var log = function (msg, color) {
  if (logEnable) {
    if (color) {
      console.log(msg[color]);
    } else {
      console.log(msg);
    }
  }
};

var logRed = function () {
  log(Array.prototype.slice.call(arguments).join(' '), 'red');
};

var logGrey = function () {
  log(Array.prototype.slice.call(arguments).join(' '), 'grey');
};

var logGreen = function () {
  log(Array.prototype.slice.call(arguments).join(' '), 'green');
};

var logYellow = function () {
  log(Array.prototype.slice.call(arguments).join(' '), 'yellow');
};

var checkUser = function (id, userId) {
  if (!id || !userId || id === userId) {
    return true;
  }

  var user = Meteor.users.findOne(id, {
    fields: {
      _id: 1
    }
  });

  if (user) {
    throw new Meteor.Error('cannot-change-other-users-status');
  }

  return true;
};

UserPresence = {
  activeLogs: function () {
    logEnable = true;
  },
  removeConnectionsByInstanceId: function (instanceId) {
    logRed('[user-presence] removeConnectionsByInstanceId', instanceId);
    var update = {
      $pull: {
        connections: {
          instanceId: instanceId
        }
      }
    };
    UsersSessions.update({}, update, {
      multi: true
    });
  },
  removeAllConnections: function () {
    logRed('[user-presence] removeAllConnections');
    UsersSessions.remove({});
  },
  createConnection: function (userId, connection, status, metadata) {
    // if connections is invalid, does not have an userId or is already closed, don't save it on db
    if (!userId || !connection.id || connection.closed) {
      return;
    }

    connection.UserPresenceUserId = userId;
    status = status || 'online';
    logGreen('[user-presence] createConnection', userId, connection.id, status, metadata);
    var query = {
      _id: userId
    };
    var now = new Date();
    var instanceId = undefined;

    if (Package['konecty:multiple-instances-status']) {
      instanceId = InstanceStatus.id();
    }

    var update = {
      $push: {
        connections: {
          id: connection.id,
          instanceId: instanceId,
          status: status,
          _createdAt: now,
          _updatedAt: now
        }
      }
    };

    if (metadata) {
      update.$set = {
        metadata: metadata
      };
      connection.metadata = metadata;
    } // make sure closed connections are being created


    if (!connection.closed) {
      UsersSessions.upsert(query, update);
    }
  },
  setConnection: function (userId, connection, status) {
    if (!userId) {
      return;
    }

    logGrey('[user-presence] setConnection', userId, connection.id, status);
    var query = {
      _id: userId,
      'connections.id': connection.id
    };
    var now = new Date();
    var update = {
      $set: {
        'connections.$.status': status,
        'connections.$._updatedAt': now
      }
    };

    if (connection.metadata) {
      update.$set.metadata = connection.metadata;
    }

    var count = UsersSessions.update(query, update);

    if (count === 0) {
      return UserPresence.createConnection(userId, connection, status, connection.metadata);
    }

    if (status === 'online') {
      Meteor.users.update({
        _id: userId,
        statusDefault: 'online',
        status: {
          $ne: 'online'
        }
      }, {
        $set: {
          status: 'online'
        }
      });
    } else if (status === 'away') {
      Meteor.users.update({
        _id: userId,
        statusDefault: 'online',
        status: {
          $ne: 'away'
        }
      }, {
        $set: {
          status: 'away'
        }
      });
    }
  },
  setDefaultStatus: function (userId, status) {
    if (!userId) {
      return;
    }

    if (allowedStatus.indexOf(status) === -1) {
      return;
    }

    logYellow('[user-presence] setDefaultStatus', userId, status);
    var update = Meteor.users.update({
      _id: userId,
      statusDefault: {
        $ne: status
      }
    }, {
      $set: {
        statusDefault: status
      }
    });

    if (update > 0) {
      UserPresenceMonitor.processUser(userId, {
        statusDefault: status
      });
    }
  },
  removeConnection: function (connectionId) {
    logRed('[user-presence] removeConnection', connectionId);
    var query = {
      'connections.id': connectionId
    };
    var update = {
      $pull: {
        connections: {
          id: connectionId
        }
      }
    };
    return UsersSessions.update(query, update);
  },
  start: function () {
    Meteor.onConnection(function (connection) {
      connection.onClose(function () {
        // mark connection as closed so if it drops in the middle of the process it doesn't even is created
        connection.closed = true;
        var result = UserPresence.removeConnection(connection.id);

        if (!result) {
          Meteor.setTimeout(function () {
            UserPresence.removeConnection(connection.id);
          }, 2000);
        }
      });
    });
    process.on('exit', Meteor.bindEnvironment(function () {
      if (Package['konecty:multiple-instances-status']) {
        UserPresence.removeConnectionsByInstanceId(InstanceStatus.id());
      } else {
        UserPresence.removeAllConnections();
      }
    }));

    if (Package['accounts-base']) {
      Accounts.onLogin(function (login) {
        UserPresence.createConnection(login.user._id, login.connection);
      });
      Accounts.onLogout(function (login) {
        UserPresence.removeConnection(login.connection.id);
      });
    }

    Meteor.publish(null, function () {
      if (this.userId == null && this.connection.UserPresenceUserId !== undefined && this.connection.UserPresenceUserId !== null) {
        UserPresence.removeConnection(this.connection.id);
        delete this.connection.UserPresenceUserId;
      }

      this.ready();
    });
    UserPresenceEvents.on('setStatus', function (userId, status) {
      var user = Meteor.users.findOne(userId);
      var statusConnection = status;

      if (!user) {
        return;
      }

      if (user.statusDefault != null && status !== 'offline' && user.statusDefault !== 'online') {
        status = user.statusDefault;
      }

      var query = {
        _id: userId,
        $or: [{
          status: {
            $ne: status
          }
        }, {
          statusConnection: {
            $ne: statusConnection
          }
        }]
      };
      var update = {
        $set: {
          status: status,
          statusConnection: statusConnection
        }
      };
      const result = Meteor.users.update(query, update); // if nothing updated, do not emit anything

      if (result) {
        UserPresenceEvents.emit('setUserStatus', user, status, statusConnection);
      }
    });
    Meteor.methods({
      'UserPresence:connect': function (id, metadata) {
        check(id, Match.Maybe(String));
        check(metadata, Match.Maybe(Object));
        this.unblock();
        checkUser(id, this.userId);
        UserPresence.createConnection(id || this.userId, this.connection, 'online', metadata);
      },
      'UserPresence:away': function (id) {
        check(id, Match.Maybe(String));
        this.unblock();
        checkUser(id, this.userId);
        UserPresence.setConnection(id || this.userId, this.connection, 'away');
      },
      'UserPresence:online': function (id) {
        check(id, Match.Maybe(String));
        this.unblock();
        checkUser(id, this.userId);
        UserPresence.setConnection(id || this.userId, this.connection, 'online');
      },
      'UserPresence:setDefaultStatus': function (id, status) {
        check(id, Match.Maybe(String));
        check(status, Match.Maybe(String));
        this.unblock(); // backward compatible (receives status as first argument)

        if (arguments.length === 1) {
          UserPresence.setDefaultStatus(this.userId, id);
          return;
        }

        checkUser(id, this.userId);
        UserPresence.setDefaultStatus(id || this.userId, status);
      }
    });
  }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"monitor.js":function module(require){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/konecty_user-presence/server/monitor.js                                                         //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
/* globals UserPresenceMonitor, UsersSessions, InstanceStatus */
var EventEmitter = Npm.require('events');

UserPresenceEvents = new EventEmitter();

function monitorUsersSessions() {
  UsersSessions.find({}).observe({
    added: function (record) {
      UserPresenceMonitor.processUserSession(record, 'added');
    },
    changed: function (record) {
      UserPresenceMonitor.processUserSession(record, 'changed');
    },
    removed: function (record) {
      UserPresenceMonitor.processUserSession(record, 'removed');
    }
  });
}

function monitorDeletedServers() {
  InstanceStatus.getCollection().find({}, {
    fields: {
      _id: 1
    }
  }).observeChanges({
    removed: function (id) {
      UserPresence.removeConnectionsByInstanceId(id);
    }
  });
}

function removeLostConnections() {
  if (!Package['konecty:multiple-instances-status']) {
    return UsersSessions.remove({});
  }

  var ids = InstanceStatus.getCollection().find({}, {
    fields: {
      _id: 1
    }
  }).fetch().map(function (id) {
    return id._id;
  });
  var update = {
    $pull: {
      connections: {
        instanceId: {
          $nin: ids
        }
      }
    }
  };
  UsersSessions.update({}, update, {
    multi: true
  });
}

UserPresenceMonitor = {
  /**
   * The callback will receive the following parameters: user, status, statusConnection
   */
  onSetUserStatus: function (callback) {
    UserPresenceEvents.on('setUserStatus', callback);
  },
  // following actions/observers will run only when presence monitor turned on
  start: function () {
    monitorUsersSessions();
    removeLostConnections();

    if (Package['konecty:multiple-instances-status']) {
      monitorDeletedServers();
    }
  },
  processUserSession: function (record, action) {
    if (action === 'removed' && (record.connections == null || record.connections.length === 0)) {
      return;
    }

    if (record.connections == null || record.connections.length === 0 || action === 'removed') {
      UserPresenceMonitor.setStatus(record._id, 'offline', record.metadata);

      if (action !== 'removed') {
        UsersSessions.remove({
          _id: record._id,
          'connections.0': {
            $exists: false
          }
        });
      }

      return;
    }

    var connectionStatus = 'offline';
    record.connections.forEach(function (connection) {
      if (connection.status === 'online') {
        connectionStatus = 'online';
      } else if (connection.status === 'away' && connectionStatus === 'offline') {
        connectionStatus = 'away';
      }
    });
    UserPresenceMonitor.setStatus(record._id, connectionStatus, record.metadata);
  },
  processUser: function (id, fields) {
    if (fields.statusDefault == null) {
      return;
    }

    var userSession = UsersSessions.findOne({
      _id: id
    });

    if (userSession) {
      UserPresenceMonitor.processUserSession(userSession, 'changed');
    }
  },
  setStatus: function (id, status, metadata) {
    UserPresenceEvents.emit('setStatus', id, status, metadata);
  }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"node_modules":{"colors":{"package.json":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// node_modules/meteor/konecty_user-presence/node_modules/colors/package.json                               //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
module.exports = {
  "name": "colors",
  "version": "1.3.2",
  "main": "lib/index.js"
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"index.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// node_modules/meteor/konecty_user-presence/node_modules/colors/lib/index.js                               //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/konecty:user-presence/common/common.js");
require("/node_modules/meteor/konecty:user-presence/server/server.js");
require("/node_modules/meteor/konecty:user-presence/server/monitor.js");

/* Exports */
Package._define("konecty:user-presence", {
  UserPresence: UserPresence,
  UsersSessions: UsersSessions,
  UserPresenceMonitor: UserPresenceMonitor,
  UserPresenceEvents: UserPresenceEvents
});

})();

//# sourceURL=meteor://💻app/packages/konecty_user-presence.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMva29uZWN0eTp1c2VyLXByZXNlbmNlL2NvbW1vbi9jb21tb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2tvbmVjdHk6dXNlci1wcmVzZW5jZS9zZXJ2ZXIvc2VydmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9rb25lY3R5OnVzZXItcHJlc2VuY2Uvc2VydmVyL21vbml0b3IuanMiXSwibmFtZXMiOlsiVXNlcnNTZXNzaW9ucyIsIk1ldGVvciIsIkNvbGxlY3Rpb24iLCJtb2R1bGUiLCJsaW5rIiwiX2Vuc3VyZUluZGV4Iiwic3BhcnNlIiwibmFtZSIsImFsbG93ZWRTdGF0dXMiLCJsb2dFbmFibGUiLCJwcm9jZXNzIiwiZW52IiwiRU5BQkxFX1BSRVNFTkNFX0xPR1MiLCJsb2ciLCJtc2ciLCJjb2xvciIsImNvbnNvbGUiLCJsb2dSZWQiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsImpvaW4iLCJsb2dHcmV5IiwibG9nR3JlZW4iLCJsb2dZZWxsb3ciLCJjaGVja1VzZXIiLCJpZCIsInVzZXJJZCIsInVzZXIiLCJ1c2VycyIsImZpbmRPbmUiLCJmaWVsZHMiLCJfaWQiLCJFcnJvciIsIlVzZXJQcmVzZW5jZSIsImFjdGl2ZUxvZ3MiLCJyZW1vdmVDb25uZWN0aW9uc0J5SW5zdGFuY2VJZCIsImluc3RhbmNlSWQiLCJ1cGRhdGUiLCIkcHVsbCIsImNvbm5lY3Rpb25zIiwibXVsdGkiLCJyZW1vdmVBbGxDb25uZWN0aW9ucyIsInJlbW92ZSIsImNyZWF0ZUNvbm5lY3Rpb24iLCJjb25uZWN0aW9uIiwic3RhdHVzIiwibWV0YWRhdGEiLCJjbG9zZWQiLCJVc2VyUHJlc2VuY2VVc2VySWQiLCJxdWVyeSIsIm5vdyIsIkRhdGUiLCJ1bmRlZmluZWQiLCJQYWNrYWdlIiwiSW5zdGFuY2VTdGF0dXMiLCIkcHVzaCIsIl9jcmVhdGVkQXQiLCJfdXBkYXRlZEF0IiwiJHNldCIsInVwc2VydCIsInNldENvbm5lY3Rpb24iLCJjb3VudCIsInN0YXR1c0RlZmF1bHQiLCIkbmUiLCJzZXREZWZhdWx0U3RhdHVzIiwiaW5kZXhPZiIsIlVzZXJQcmVzZW5jZU1vbml0b3IiLCJwcm9jZXNzVXNlciIsInJlbW92ZUNvbm5lY3Rpb24iLCJjb25uZWN0aW9uSWQiLCJzdGFydCIsIm9uQ29ubmVjdGlvbiIsIm9uQ2xvc2UiLCJyZXN1bHQiLCJzZXRUaW1lb3V0Iiwib24iLCJiaW5kRW52aXJvbm1lbnQiLCJBY2NvdW50cyIsIm9uTG9naW4iLCJsb2dpbiIsIm9uTG9nb3V0IiwicHVibGlzaCIsInJlYWR5IiwiVXNlclByZXNlbmNlRXZlbnRzIiwic3RhdHVzQ29ubmVjdGlvbiIsIiRvciIsImVtaXQiLCJtZXRob2RzIiwiY2hlY2siLCJNYXRjaCIsIk1heWJlIiwiU3RyaW5nIiwiT2JqZWN0IiwidW5ibG9jayIsImxlbmd0aCIsIkV2ZW50RW1pdHRlciIsIk5wbSIsInJlcXVpcmUiLCJtb25pdG9yVXNlcnNTZXNzaW9ucyIsImZpbmQiLCJvYnNlcnZlIiwiYWRkZWQiLCJyZWNvcmQiLCJwcm9jZXNzVXNlclNlc3Npb24iLCJjaGFuZ2VkIiwicmVtb3ZlZCIsIm1vbml0b3JEZWxldGVkU2VydmVycyIsImdldENvbGxlY3Rpb24iLCJvYnNlcnZlQ2hhbmdlcyIsInJlbW92ZUxvc3RDb25uZWN0aW9ucyIsImlkcyIsImZldGNoIiwibWFwIiwiJG5pbiIsIm9uU2V0VXNlclN0YXR1cyIsImNhbGxiYWNrIiwiYWN0aW9uIiwic2V0U3RhdHVzIiwiJGV4aXN0cyIsImNvbm5lY3Rpb25TdGF0dXMiLCJmb3JFYWNoIiwidXNlclNlc3Npb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTtBQUVBQSxhQUFhLEdBQUcsSUFBSUMsTUFBTSxDQUFDQyxVQUFYLENBQXNCLGVBQXRCLENBQWhCLEM7Ozs7Ozs7Ozs7O0FDSEFDLE1BQU0sQ0FB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QUFvRTtBQUMxRUEsd0JBQWdCLEdBQUcsTUFBbkI7QUFDQTtBQUNELEtBTkQ7QUFRQXJELHVCQUFtQixDQUFDbUQsU0FBcEIsQ0FBOEJmLE1BQU0sQ0FBQ3ZFLEdBQXJDLEVBQTBDd0YsZ0JBQTFDLEVBQTREakIsTUFBTSxDQUFDeEQsUUFBbkU7QUFDQSxHQTFDb0I7QUE0Q3JCcUIsYUFBVyxFQUFFLFVBQVMxQyxFQUFULEVBQWFLLE1BQWIsRUFBcUI7QUFDakMsUUFBSUEsTUFBTSxDQUFDZ0MsYUFBUCxJQUF3QixJQUE1QixFQUFrQztBQUNqQztBQUNBOztBQUVELFFBQUkyRCxXQUFXLEdBQUc1SCxhQUFhLENBQUNnQyxPQUFkLENBQXNCO0FBQUNFLFNBQUcsRUFBRU47QUFBTixLQUF0QixDQUFsQjs7QUFFQSxRQUFJZ0csV0FBSixFQUFpQjtBQUNoQnZELHlCQUFtQixDQUFDcUMsa0JBQXBCLENBQXVDa0IsV0FBdkMsRUFBb0QsU0FBcEQ7QUFDQTtBQUNELEdBdERvQjtBQXdEckJKLFdBQVMsRUFBRSxVQUFTNUYsRUFBVCxFQUFhb0IsTUFBYixFQUFxQkMsUUFBckIsRUFBK0I7QUFDekNxQyxzQkFBa0IsQ0FBQ0csSUFBbkIsQ0FBd0IsV0FBeEIsRUFBcUM3RCxFQUFyQyxFQUF5Q29CLE1BQXpDLEVBQWlEQyxRQUFqRDtBQUNBO0FBMURvQixDQUF0QixDIiwiZmlsZSI6Ii9wYWNrYWdlcy9rb25lY3R5X3VzZXItcHJlc2VuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWxzIFVzZXJzU2Vzc2lvbnMgKi9cbi8qIGV4cG9ydGVkIFVzZXJzU2Vzc2lvbnMgKi9cblxuVXNlcnNTZXNzaW9ucyA9IG5ldyBNZXRlb3IuQ29sbGVjdGlvbigndXNlcnNTZXNzaW9ucycpO1xuIiwiLyogZ2xvYmFscyBJbnN0YW5jZVN0YXR1cywgVXNlcnNTZXNzaW9ucywgVXNlclByZXNlbmNlTW9uaXRvciwgVXNlclByZXNlbmNlICovXG5pbXBvcnQgJ2NvbG9ycyc7XG5cblVzZXJzU2Vzc2lvbnMuX2Vuc3VyZUluZGV4KHsnY29ubmVjdGlvbnMuaW5zdGFuY2VJZCc6IDF9LCB7c3BhcnNlOiAxLCBuYW1lOiAnY29ubmVjdGlvbnMuaW5zdGFuY2VJZCd9KTtcblVzZXJzU2Vzc2lvbnMuX2Vuc3VyZUluZGV4KHsnY29ubmVjdGlvbnMuaWQnOiAxfSwge3NwYXJzZTogMSwgbmFtZTogJ2Nvbm5lY3Rpb25zLmlkJ30pO1xuXG52YXIgYWxsb3dlZFN0YXR1cyA9IFsnb25saW5lJywgJ2F3YXknLCAnYnVzeScsICdvZmZsaW5lJ107XG5cbnZhciBsb2dFbmFibGUgPSBwcm9jZXNzLmVudi5FTkFCTEVfUFJFU0VOQ0VfTE9HUyA9PT0gJ3RydWUnO1xuXG52YXIgbG9nID0gZnVuY3Rpb24obXNnLCBjb2xvcikge1xuXHRpZiAobG9nRW5hYmxlKSB7XG5cdFx0aWYgKGNvbG9yKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhtc2dbY29sb3JdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBsb2dSZWQgPSBmdW5jdGlvbigpIHtcblx0bG9nKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbignICcpLCAncmVkJyk7XG59O1xudmFyIGxvZ0dyZXkgPSBmdW5jdGlvbigpIHtcblx0bG9nKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbignICcpLCAnZ3JleScpO1xufTtcbnZhciBsb2dHcmVlbiA9IGZ1bmN0aW9uKCkge1xuXHRsb2coQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5qb2luKCcgJyksICdncmVlbicpO1xufTtcbnZhciBsb2dZZWxsb3cgPSBmdW5jdGlvbigpIHtcblx0bG9nKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbignICcpLCAneWVsbG93Jyk7XG59O1xuXG52YXIgY2hlY2tVc2VyID0gZnVuY3Rpb24oaWQsIHVzZXJJZCkge1xuXHRpZiAoIWlkIHx8ICF1c2VySWQgfHwgaWQgPT09IHVzZXJJZCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHZhciB1c2VyID0gTWV0ZW9yLnVzZXJzLmZpbmRPbmUoaWQsIHsgZmllbGRzOiB7IF9pZDogMSB9IH0pO1xuXHRpZiAodXNlcikge1xuXHRcdHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2Nhbm5vdC1jaGFuZ2Utb3RoZXItdXNlcnMtc3RhdHVzJyk7XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuVXNlclByZXNlbmNlID0ge1xuXHRhY3RpdmVMb2dzOiBmdW5jdGlvbigpIHtcblx0XHRsb2dFbmFibGUgPSB0cnVlO1xuXHR9LFxuXG5cdHJlbW92ZUNvbm5lY3Rpb25zQnlJbnN0YW5jZUlkOiBmdW5jdGlvbihpbnN0YW5jZUlkKSB7XG5cdFx0bG9nUmVkKCdbdXNlci1wcmVzZW5jZV0gcmVtb3ZlQ29ubmVjdGlvbnNCeUluc3RhbmNlSWQnLCBpbnN0YW5jZUlkKTtcblx0XHR2YXIgdXBkYXRlID0ge1xuXHRcdFx0JHB1bGw6IHtcblx0XHRcdFx0Y29ubmVjdGlvbnM6IHtcblx0XHRcdFx0XHRpbnN0YW5jZUlkOiBpbnN0YW5jZUlkXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0VXNlcnNTZXNzaW9ucy51cGRhdGUoe30sIHVwZGF0ZSwge211bHRpOiB0cnVlfSk7XG5cdH0sXG5cblx0cmVtb3ZlQWxsQ29ubmVjdGlvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdGxvZ1JlZCgnW3VzZXItcHJlc2VuY2VdIHJlbW92ZUFsbENvbm5lY3Rpb25zJyk7XG5cdFx0VXNlcnNTZXNzaW9ucy5yZW1vdmUoe30pO1xuXHR9LFxuXG5cdGNyZWF0ZUNvbm5lY3Rpb246IGZ1bmN0aW9uKHVzZXJJZCwgY29ubmVjdGlvbiwgc3RhdHVzLCBtZXRhZGF0YSkge1xuXHRcdC8vIGlmIGNvbm5lY3Rpb25zIGlzIGludmFsaWQsIGRvZXMgbm90IGhhdmUgYW4gdXNlcklkIG9yIGlzIGFscmVhZHkgY2xvc2VkLCBkb24ndCBzYXZlIGl0IG9uIGRiXG5cdFx0aWYgKCF1c2VySWQgfHwgIWNvbm5lY3Rpb24uaWQgfHwgY29ubmVjdGlvbi5jbG9zZWQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25uZWN0aW9uLlVzZXJQcmVzZW5jZVVzZXJJZCA9IHVzZXJJZDtcblxuXHRcdHN0YXR1cyA9IHN0YXR1cyB8fCAnb25saW5lJztcblxuXHRcdGxvZ0dyZWVuKCdbdXNlci1wcmVzZW5jZV0gY3JlYXRlQ29ubmVjdGlvbicsIHVzZXJJZCwgY29ubmVjdGlvbi5pZCwgc3RhdHVzLCBtZXRhZGF0YSk7XG5cblx0XHR2YXIgcXVlcnkgPSB7XG5cdFx0XHRfaWQ6IHVzZXJJZFxuXHRcdH07XG5cblx0XHR2YXIgbm93ID0gbmV3IERhdGUoKTtcblxuXHRcdHZhciBpbnN0YW5jZUlkID0gdW5kZWZpbmVkO1xuXHRcdGlmIChQYWNrYWdlWydrb25lY3R5Om11bHRpcGxlLWluc3RhbmNlcy1zdGF0dXMnXSkge1xuXHRcdFx0aW5zdGFuY2VJZCA9IEluc3RhbmNlU3RhdHVzLmlkKCk7XG5cdFx0fVxuXG5cdFx0dmFyIHVwZGF0ZSA9IHtcblx0XHRcdCRwdXNoOiB7XG5cdFx0XHRcdGNvbm5lY3Rpb25zOiB7XG5cdFx0XHRcdFx0aWQ6IGNvbm5lY3Rpb24uaWQsXG5cdFx0XHRcdFx0aW5zdGFuY2VJZDogaW5zdGFuY2VJZCxcblx0XHRcdFx0XHRzdGF0dXM6IHN0YXR1cyxcblx0XHRcdFx0XHRfY3JlYXRlZEF0OiBub3csXG5cdFx0XHRcdFx0X3VwZGF0ZWRBdDogbm93XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aWYgKG1ldGFkYXRhKSB7XG5cdFx0XHR1cGRhdGUuJHNldCA9IHtcblx0XHRcdFx0bWV0YWRhdGE6IG1ldGFkYXRhXG5cdFx0XHR9O1xuXHRcdFx0Y29ubmVjdGlvbi5tZXRhZGF0YSA9IG1ldGFkYXRhO1xuXHRcdH1cblxuXHRcdC8vIG1ha2Ugc3VyZSBjbG9zZWQgY29ubmVjdGlvbnMgYXJlIGJlaW5nIGNyZWF0ZWRcblx0XHRpZiAoIWNvbm5lY3Rpb24uY2xvc2VkKSB7XG5cdFx0XHRVc2Vyc1Nlc3Npb25zLnVwc2VydChxdWVyeSwgdXBkYXRlKTtcblx0XHR9XG5cdH0sXG5cblx0c2V0Q29ubmVjdGlvbjogZnVuY3Rpb24odXNlcklkLCBjb25uZWN0aW9uLCBzdGF0dXMpIHtcblx0XHRpZiAoIXVzZXJJZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxvZ0dyZXkoJ1t1c2VyLXByZXNlbmNlXSBzZXRDb25uZWN0aW9uJywgdXNlcklkLCBjb25uZWN0aW9uLmlkLCBzdGF0dXMpO1xuXG5cdFx0dmFyIHF1ZXJ5ID0ge1xuXHRcdFx0X2lkOiB1c2VySWQsXG5cdFx0XHQnY29ubmVjdGlvbnMuaWQnOiBjb25uZWN0aW9uLmlkXG5cdFx0fTtcblxuXHRcdHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuXG5cdFx0dmFyIHVwZGF0ZSA9IHtcblx0XHRcdCRzZXQ6IHtcblx0XHRcdFx0J2Nvbm5lY3Rpb25zLiQuc3RhdHVzJzogc3RhdHVzLFxuXHRcdFx0XHQnY29ubmVjdGlvbnMuJC5fdXBkYXRlZEF0Jzogbm93XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmIChjb25uZWN0aW9uLm1ldGFkYXRhKSB7XG5cdFx0XHR1cGRhdGUuJHNldC5tZXRhZGF0YSA9IGNvbm5lY3Rpb24ubWV0YWRhdGE7XG5cdFx0fVxuXG5cdFx0dmFyIGNvdW50ID0gVXNlcnNTZXNzaW9ucy51cGRhdGUocXVlcnksIHVwZGF0ZSk7XG5cblx0XHRpZiAoY291bnQgPT09IDApIHtcblx0XHRcdHJldHVybiBVc2VyUHJlc2VuY2UuY3JlYXRlQ29ubmVjdGlvbih1c2VySWQsIGNvbm5lY3Rpb24sIHN0YXR1cywgY29ubmVjdGlvbi5tZXRhZGF0YSk7XG5cdFx0fVxuXG5cdFx0aWYgKHN0YXR1cyA9PT0gJ29ubGluZScpIHtcblx0XHRcdE1ldGVvci51c2Vycy51cGRhdGUoe19pZDogdXNlcklkLCBzdGF0dXNEZWZhdWx0OiAnb25saW5lJywgc3RhdHVzOiB7JG5lOiAnb25saW5lJ319LCB7JHNldDoge3N0YXR1czogJ29ubGluZSd9fSk7XG5cdFx0fSBlbHNlIGlmIChzdGF0dXMgPT09ICdhd2F5Jykge1xuXHRcdFx0TWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VySWQsIHN0YXR1c0RlZmF1bHQ6ICdvbmxpbmUnLCBzdGF0dXM6IHskbmU6ICdhd2F5J319LCB7JHNldDoge3N0YXR1czogJ2F3YXknfX0pO1xuXHRcdH1cblx0fSxcblxuXHRzZXREZWZhdWx0U3RhdHVzOiBmdW5jdGlvbih1c2VySWQsIHN0YXR1cykge1xuXHRcdGlmICghdXNlcklkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKGFsbG93ZWRTdGF0dXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxvZ1llbGxvdygnW3VzZXItcHJlc2VuY2VdIHNldERlZmF1bHRTdGF0dXMnLCB1c2VySWQsIHN0YXR1cyk7XG5cblx0XHR2YXIgdXBkYXRlID0gTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VySWQsIHN0YXR1c0RlZmF1bHQ6IHskbmU6IHN0YXR1c319LCB7JHNldDoge3N0YXR1c0RlZmF1bHQ6IHN0YXR1c319KTtcblxuXHRcdGlmICh1cGRhdGUgPiAwKSB7XG5cdFx0XHRVc2VyUHJlc2VuY2VNb25pdG9yLnByb2Nlc3NVc2VyKHVzZXJJZCwgeyBzdGF0dXNEZWZhdWx0OiBzdGF0dXMgfSk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlbW92ZUNvbm5lY3Rpb246IGZ1bmN0aW9uKGNvbm5lY3Rpb25JZCkge1xuXHRcdGxvZ1JlZCgnW3VzZXItcHJlc2VuY2VdIHJlbW92ZUNvbm5lY3Rpb24nLCBjb25uZWN0aW9uSWQpO1xuXG5cdFx0dmFyIHF1ZXJ5ID0ge1xuXHRcdFx0J2Nvbm5lY3Rpb25zLmlkJzogY29ubmVjdGlvbklkXG5cdFx0fTtcblxuXHRcdHZhciB1cGRhdGUgPSB7XG5cdFx0XHQkcHVsbDoge1xuXHRcdFx0XHRjb25uZWN0aW9uczoge1xuXHRcdFx0XHRcdGlkOiBjb25uZWN0aW9uSWRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4gVXNlcnNTZXNzaW9ucy51cGRhdGUocXVlcnksIHVwZGF0ZSk7XG5cdH0sXG5cblx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdE1ldGVvci5vbkNvbm5lY3Rpb24oZnVuY3Rpb24oY29ubmVjdGlvbikge1xuXHRcdFx0Y29ubmVjdGlvbi5vbkNsb3NlKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQvLyBtYXJrIGNvbm5lY3Rpb24gYXMgY2xvc2VkIHNvIGlmIGl0IGRyb3BzIGluIHRoZSBtaWRkbGUgb2YgdGhlIHByb2Nlc3MgaXQgZG9lc24ndCBldmVuIGlzIGNyZWF0ZWRcblx0XHRcdFx0Y29ubmVjdGlvbi5jbG9zZWQgPSB0cnVlO1xuXG5cdFx0XHRcdHZhciByZXN1bHQgPSBVc2VyUHJlc2VuY2UucmVtb3ZlQ29ubmVjdGlvbihjb25uZWN0aW9uLmlkKTtcblx0XHRcdFx0aWYgKCFyZXN1bHQpIHtcblx0XHRcdFx0XHRNZXRlb3Iuc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFVzZXJQcmVzZW5jZS5yZW1vdmVDb25uZWN0aW9uKGNvbm5lY3Rpb24uaWQpO1xuXHRcdFx0XHRcdH0sIDIwMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHByb2Nlc3Mub24oJ2V4aXQnLCBNZXRlb3IuYmluZEVudmlyb25tZW50KGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKFBhY2thZ2VbJ2tvbmVjdHk6bXVsdGlwbGUtaW5zdGFuY2VzLXN0YXR1cyddKSB7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZS5yZW1vdmVDb25uZWN0aW9uc0J5SW5zdGFuY2VJZChJbnN0YW5jZVN0YXR1cy5pZCgpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZS5yZW1vdmVBbGxDb25uZWN0aW9ucygpO1xuXHRcdFx0fVxuXHRcdH0pKTtcblxuXHRcdGlmIChQYWNrYWdlWydhY2NvdW50cy1iYXNlJ10pIHtcblx0XHRcdEFjY291bnRzLm9uTG9naW4oZnVuY3Rpb24obG9naW4pIHtcblx0XHRcdFx0VXNlclByZXNlbmNlLmNyZWF0ZUNvbm5lY3Rpb24obG9naW4udXNlci5faWQsIGxvZ2luLmNvbm5lY3Rpb24pO1xuXHRcdFx0fSk7XG5cblx0XHRcdEFjY291bnRzLm9uTG9nb3V0KGZ1bmN0aW9uKGxvZ2luKSB7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZS5yZW1vdmVDb25uZWN0aW9uKGxvZ2luLmNvbm5lY3Rpb24uaWQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0TWV0ZW9yLnB1Ymxpc2gobnVsbCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAodGhpcy51c2VySWQgPT0gbnVsbCAmJiB0aGlzLmNvbm5lY3Rpb24uVXNlclByZXNlbmNlVXNlcklkICE9PSB1bmRlZmluZWQgJiYgdGhpcy5jb25uZWN0aW9uLlVzZXJQcmVzZW5jZVVzZXJJZCAhPT0gbnVsbCkge1xuXHRcdFx0XHRVc2VyUHJlc2VuY2UucmVtb3ZlQ29ubmVjdGlvbih0aGlzLmNvbm5lY3Rpb24uaWQpO1xuXHRcdFx0XHRkZWxldGUgdGhpcy5jb25uZWN0aW9uLlVzZXJQcmVzZW5jZVVzZXJJZDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5yZWFkeSgpO1xuXHRcdH0pO1xuXG5cdFx0VXNlclByZXNlbmNlRXZlbnRzLm9uKCdzZXRTdGF0dXMnLCBmdW5jdGlvbih1c2VySWQsIHN0YXR1cykge1xuXHRcdFx0dmFyIHVzZXIgPSBNZXRlb3IudXNlcnMuZmluZE9uZSh1c2VySWQpO1xuXHRcdFx0dmFyIHN0YXR1c0Nvbm5lY3Rpb24gPSBzdGF0dXM7XG5cblx0XHRcdGlmICghdXNlcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmICh1c2VyLnN0YXR1c0RlZmF1bHQgIT0gbnVsbCAmJiBzdGF0dXMgIT09ICdvZmZsaW5lJyAmJiB1c2VyLnN0YXR1c0RlZmF1bHQgIT09ICdvbmxpbmUnKSB7XG5cdFx0XHRcdHN0YXR1cyA9IHVzZXIuc3RhdHVzRGVmYXVsdDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHF1ZXJ5ID0ge1xuXHRcdFx0XHRfaWQ6IHVzZXJJZCxcblx0XHRcdFx0JG9yOiBbXG5cdFx0XHRcdFx0e3N0YXR1czogeyRuZTogc3RhdHVzfX0sXG5cdFx0XHRcdFx0e3N0YXR1c0Nvbm5lY3Rpb246IHskbmU6IHN0YXR1c0Nvbm5lY3Rpb259fVxuXHRcdFx0XHRdXG5cdFx0XHR9O1xuXG5cdFx0XHR2YXIgdXBkYXRlID0ge1xuXHRcdFx0XHQkc2V0OiB7XG5cdFx0XHRcdFx0c3RhdHVzOiBzdGF0dXMsXG5cdFx0XHRcdFx0c3RhdHVzQ29ubmVjdGlvbjogc3RhdHVzQ29ubmVjdGlvblxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRjb25zdCByZXN1bHQgPSBNZXRlb3IudXNlcnMudXBkYXRlKHF1ZXJ5LCB1cGRhdGUpO1xuXG5cdFx0XHQvLyBpZiBub3RoaW5nIHVwZGF0ZWQsIGRvIG5vdCBlbWl0IGFueXRoaW5nXG5cdFx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZUV2ZW50cy5lbWl0KCdzZXRVc2VyU3RhdHVzJywgdXNlciwgc3RhdHVzLCBzdGF0dXNDb25uZWN0aW9uKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdE1ldGVvci5tZXRob2RzKHtcblx0XHRcdCdVc2VyUHJlc2VuY2U6Y29ubmVjdCc6IGZ1bmN0aW9uKGlkLCBtZXRhZGF0YSkge1xuXHRcdFx0XHRjaGVjayhpZCwgTWF0Y2guTWF5YmUoU3RyaW5nKSk7XG5cdFx0XHRcdGNoZWNrKG1ldGFkYXRhLCBNYXRjaC5NYXliZShPYmplY3QpKTtcblx0XHRcdFx0dGhpcy51bmJsb2NrKCk7XG5cdFx0XHRcdGNoZWNrVXNlcihpZCwgdGhpcy51c2VySWQpO1xuXHRcdFx0XHRVc2VyUHJlc2VuY2UuY3JlYXRlQ29ubmVjdGlvbihpZCB8fCB0aGlzLnVzZXJJZCwgdGhpcy5jb25uZWN0aW9uLCAnb25saW5lJywgbWV0YWRhdGEpO1xuXHRcdFx0fSxcblxuXHRcdFx0J1VzZXJQcmVzZW5jZTphd2F5JzogZnVuY3Rpb24oaWQpIHtcblx0XHRcdFx0Y2hlY2soaWQsIE1hdGNoLk1heWJlKFN0cmluZykpO1xuXHRcdFx0XHR0aGlzLnVuYmxvY2soKTtcblx0XHRcdFx0Y2hlY2tVc2VyKGlkLCB0aGlzLnVzZXJJZCk7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZS5zZXRDb25uZWN0aW9uKGlkIHx8IHRoaXMudXNlcklkLCB0aGlzLmNvbm5lY3Rpb24sICdhd2F5Jyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQnVXNlclByZXNlbmNlOm9ubGluZSc6IGZ1bmN0aW9uKGlkKSB7XG5cdFx0XHRcdGNoZWNrKGlkLCBNYXRjaC5NYXliZShTdHJpbmcpKTtcblx0XHRcdFx0dGhpcy51bmJsb2NrKCk7XG5cdFx0XHRcdGNoZWNrVXNlcihpZCwgdGhpcy51c2VySWQpO1xuXHRcdFx0XHRVc2VyUHJlc2VuY2Uuc2V0Q29ubmVjdGlvbihpZCB8fCB0aGlzLnVzZXJJZCwgdGhpcy5jb25uZWN0aW9uLCAnb25saW5lJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQnVXNlclByZXNlbmNlOnNldERlZmF1bHRTdGF0dXMnOiBmdW5jdGlvbihpZCwgc3RhdHVzKSB7XG5cdFx0XHRcdGNoZWNrKGlkLCBNYXRjaC5NYXliZShTdHJpbmcpKTtcblx0XHRcdFx0Y2hlY2soc3RhdHVzLCBNYXRjaC5NYXliZShTdHJpbmcpKTtcblx0XHRcdFx0dGhpcy51bmJsb2NrKCk7XG5cblx0XHRcdFx0Ly8gYmFja3dhcmQgY29tcGF0aWJsZSAocmVjZWl2ZXMgc3RhdHVzIGFzIGZpcnN0IGFyZ3VtZW50KVxuXHRcdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRcdFVzZXJQcmVzZW5jZS5zZXREZWZhdWx0U3RhdHVzKHRoaXMudXNlcklkLCBpZCk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNoZWNrVXNlcihpZCwgdGhpcy51c2VySWQpO1xuXHRcdFx0XHRVc2VyUHJlc2VuY2Uuc2V0RGVmYXVsdFN0YXR1cyhpZCB8fCB0aGlzLnVzZXJJZCwgc3RhdHVzKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufTtcbiIsIi8qIGdsb2JhbHMgVXNlclByZXNlbmNlTW9uaXRvciwgVXNlcnNTZXNzaW9ucywgSW5zdGFuY2VTdGF0dXMgKi9cbnZhciBFdmVudEVtaXR0ZXIgPSBOcG0ucmVxdWlyZSgnZXZlbnRzJyk7XG5cblVzZXJQcmVzZW5jZUV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuZnVuY3Rpb24gbW9uaXRvclVzZXJzU2Vzc2lvbnMoKSB7XG5cdFVzZXJzU2Vzc2lvbnMuZmluZCh7fSkub2JzZXJ2ZSh7XG5cdFx0YWRkZWQ6IGZ1bmN0aW9uKHJlY29yZCkge1xuXHRcdFx0VXNlclByZXNlbmNlTW9uaXRvci5wcm9jZXNzVXNlclNlc3Npb24ocmVjb3JkLCAnYWRkZWQnKTtcblx0XHR9LFxuXHRcdGNoYW5nZWQ6IGZ1bmN0aW9uKHJlY29yZCkge1xuXHRcdFx0VXNlclByZXNlbmNlTW9uaXRvci5wcm9jZXNzVXNlclNlc3Npb24ocmVjb3JkLCAnY2hhbmdlZCcpO1xuXHRcdH0sXG5cdFx0cmVtb3ZlZDogZnVuY3Rpb24ocmVjb3JkKSB7XG5cdFx0XHRVc2VyUHJlc2VuY2VNb25pdG9yLnByb2Nlc3NVc2VyU2Vzc2lvbihyZWNvcmQsICdyZW1vdmVkJyk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gbW9uaXRvckRlbGV0ZWRTZXJ2ZXJzKCkge1xuXHRJbnN0YW5jZVN0YXR1cy5nZXRDb2xsZWN0aW9uKCkuZmluZCh7fSwge2ZpZWxkczoge19pZDogMX19KS5vYnNlcnZlQ2hhbmdlcyh7XG5cdFx0cmVtb3ZlZDogZnVuY3Rpb24oaWQpIHtcblx0XHRcdFVzZXJQcmVzZW5jZS5yZW1vdmVDb25uZWN0aW9uc0J5SW5zdGFuY2VJZChpZCk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlTG9zdENvbm5lY3Rpb25zKCkge1xuXHRpZiAoIVBhY2thZ2VbJ2tvbmVjdHk6bXVsdGlwbGUtaW5zdGFuY2VzLXN0YXR1cyddKSB7XG5cdFx0cmV0dXJuIFVzZXJzU2Vzc2lvbnMucmVtb3ZlKHt9KTtcblx0fVxuXG5cdHZhciBpZHMgPSBJbnN0YW5jZVN0YXR1cy5nZXRDb2xsZWN0aW9uKCkuZmluZCh7fSwge2ZpZWxkczoge19pZDogMX19KS5mZXRjaCgpLm1hcChmdW5jdGlvbihpZCkge1xuXHRcdHJldHVybiBpZC5faWQ7XG5cdH0pO1xuXG5cdHZhciB1cGRhdGUgPSB7XG5cdFx0JHB1bGw6IHtcblx0XHRcdGNvbm5lY3Rpb25zOiB7XG5cdFx0XHRcdGluc3RhbmNlSWQ6IHtcblx0XHRcdFx0XHQkbmluOiBpZHNcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0VXNlcnNTZXNzaW9ucy51cGRhdGUoe30sIHVwZGF0ZSwge211bHRpOiB0cnVlfSk7XG59XG5cblVzZXJQcmVzZW5jZU1vbml0b3IgPSB7XG5cdC8qKlxuXHQgKiBUaGUgY2FsbGJhY2sgd2lsbCByZWNlaXZlIHRoZSBmb2xsb3dpbmcgcGFyYW1ldGVyczogdXNlciwgc3RhdHVzLCBzdGF0dXNDb25uZWN0aW9uXG5cdCAqL1xuXHRvblNldFVzZXJTdGF0dXM6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0VXNlclByZXNlbmNlRXZlbnRzLm9uKCdzZXRVc2VyU3RhdHVzJywgY2FsbGJhY2spO1xuXHR9LFxuXG5cdC8vIGZvbGxvd2luZyBhY3Rpb25zL29ic2VydmVycyB3aWxsIHJ1biBvbmx5IHdoZW4gcHJlc2VuY2UgbW9uaXRvciB0dXJuZWQgb25cblx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdG1vbml0b3JVc2Vyc1Nlc3Npb25zKCk7XG5cdFx0cmVtb3ZlTG9zdENvbm5lY3Rpb25zKCk7XG5cblx0XHRpZiAoUGFja2FnZVsna29uZWN0eTptdWx0aXBsZS1pbnN0YW5jZXMtc3RhdHVzJ10pIHtcblx0XHRcdG1vbml0b3JEZWxldGVkU2VydmVycygpO1xuXHRcdH1cblx0fSxcblxuXHRwcm9jZXNzVXNlclNlc3Npb246IGZ1bmN0aW9uKHJlY29yZCwgYWN0aW9uKSB7XG5cdFx0aWYgKGFjdGlvbiA9PT0gJ3JlbW92ZWQnICYmIChyZWNvcmQuY29ubmVjdGlvbnMgPT0gbnVsbCB8fCByZWNvcmQuY29ubmVjdGlvbnMubGVuZ3RoID09PSAwKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmIChyZWNvcmQuY29ubmVjdGlvbnMgPT0gbnVsbCB8fCByZWNvcmQuY29ubmVjdGlvbnMubGVuZ3RoID09PSAwIHx8IGFjdGlvbiA9PT0gJ3JlbW92ZWQnKSB7XG5cdFx0XHRVc2VyUHJlc2VuY2VNb25pdG9yLnNldFN0YXR1cyhyZWNvcmQuX2lkLCAnb2ZmbGluZScsIHJlY29yZC5tZXRhZGF0YSk7XG5cblx0XHRcdGlmIChhY3Rpb24gIT09ICdyZW1vdmVkJykge1xuXHRcdFx0XHRVc2Vyc1Nlc3Npb25zLnJlbW92ZSh7X2lkOiByZWNvcmQuX2lkLCAnY29ubmVjdGlvbnMuMCc6IHskZXhpc3RzOiBmYWxzZX0gfSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIGNvbm5lY3Rpb25TdGF0dXMgPSAnb2ZmbGluZSc7XG5cdFx0cmVjb3JkLmNvbm5lY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oY29ubmVjdGlvbikge1xuXHRcdFx0aWYgKGNvbm5lY3Rpb24uc3RhdHVzID09PSAnb25saW5lJykge1xuXHRcdFx0XHRjb25uZWN0aW9uU3RhdHVzID0gJ29ubGluZSc7XG5cdFx0XHR9IGVsc2UgaWYgKGNvbm5lY3Rpb24uc3RhdHVzID09PSAnYXdheScgJiYgY29ubmVjdGlvblN0YXR1cyA9PT0gJ29mZmxpbmUnKSB7XG5cdFx0XHRcdGNvbm5lY3Rpb25TdGF0dXMgPSAnYXdheSc7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRVc2VyUHJlc2VuY2VNb25pdG9yLnNldFN0YXR1cyhyZWNvcmQuX2lkLCBjb25uZWN0aW9uU3RhdHVzLCByZWNvcmQubWV0YWRhdGEpO1xuXHR9LFxuXG5cdHByb2Nlc3NVc2VyOiBmdW5jdGlvbihpZCwgZmllbGRzKSB7XG5cdFx0aWYgKGZpZWxkcy5zdGF0dXNEZWZhdWx0ID09IG51bGwpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgdXNlclNlc3Npb24gPSBVc2Vyc1Nlc3Npb25zLmZpbmRPbmUoe19pZDogaWR9KTtcblxuXHRcdGlmICh1c2VyU2Vzc2lvbikge1xuXHRcdFx0VXNlclByZXNlbmNlTW9uaXRvci5wcm9jZXNzVXNlclNlc3Npb24odXNlclNlc3Npb24sICdjaGFuZ2VkJyk7XG5cdFx0fVxuXHR9LFxuXG5cdHNldFN0YXR1czogZnVuY3Rpb24oaWQsIHN0YXR1cywgbWV0YWRhdGEpIHtcblx0XHRVc2VyUHJlc2VuY2VFdmVudHMuZW1pdCgnc2V0U3RhdHVzJywgaWQsIHN0YXR1cywgbWV0YWRhdGEpO1xuXHR9XG59O1xuIl19
