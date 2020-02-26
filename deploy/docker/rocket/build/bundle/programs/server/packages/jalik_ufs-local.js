(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var _ = Package.underscore._;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var options, file;

var require = meteorInstall({"node_modules":{"meteor":{"jalik:ufs-local":{"ufs-local.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/jalik_ufs-local/ufs-local.js                                                                        //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
module.export({
  LocalStore: () => LocalStore
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 2);
let UploadFS;
module.link("meteor/jalik:ufs", {
  UploadFS(v) {
    UploadFS = v;
  }

}, 3);

class LocalStore extends UploadFS.Store {
  constructor(options) {
    // Default options
    options = _.extend({
      mode: '0744',
      path: 'ufs/uploads',
      writeMode: '0744'
    }, options); // Check options

    if (typeof options.mode !== "string") {
      throw new TypeError("LocalStore: mode is not a string");
    }

    if (typeof options.path !== "string") {
      throw new TypeError("LocalStore: path is not a string");
    }

    if (typeof options.writeMode !== "string") {
      throw new TypeError("LocalStore: writeMode is not a string");
    }

    super(options);
    let self = this; // Private attributes

    let mode = options.mode;
    let path = options.path;
    let writeMode = options.writeMode;

    if (Meteor.isServer) {
      const fs = Npm.require('fs');

      fs.stat(path, function (err) {
        if (err) {
          const mkdirp = Npm.require('mkdirp'); // Create the directory


          mkdirp(path, {
            mode: mode
          }, function (err) {
            if (err) {
              console.error("LocalStore: cannot create store at ".concat(path, " (").concat(err.message, ")"));
            } else {
              console.info("LocalStore: store created at ".concat(path));
            }
          });
        } else {
          // Set directory permissions
          fs.chmod(path, mode, function (err) {
            err && console.error("LocalStore: cannot set store permissions ".concat(mode, " (").concat(err.message, ")"));
          });
        }
      });
    }
    /**
     * Returns the path or sub path
     * @param file
     * @return {string}
     */


    this.getPath = function (file) {
      return path + (file ? "/".concat(file) : '');
    };

    if (Meteor.isServer) {
      /**
       * Removes the file
       * @param fileId
       * @param callback
       */
      this.delete = function (fileId, callback) {
        let path = this.getFilePath(fileId);

        if (typeof callback !== 'function') {
          callback = function (err) {
            err && console.error("LocalStore: cannot delete file \"".concat(fileId, "\" at ").concat(path, " (").concat(err.message, ")"));
          };
        }

        const fs = Npm.require('fs');

        fs.stat(path, Meteor.bindEnvironment(function (err, stat) {
          if (!err && stat && stat.isFile()) {
            fs.unlink(path, Meteor.bindEnvironment(function () {
              self.getCollection().remove(fileId);
              callback.call(self);
            }));
          }
        }));
      };
      /**
       * Returns the file read stream
       * @param fileId
       * @param file
       * @param options
       * @return {*}
       */


      this.getReadStream = function (fileId, file, options) {
        const fs = Npm.require('fs');

        options = _.extend({}, options);
        return fs.createReadStream(self.getFilePath(fileId, file), {
          flags: 'r',
          encoding: null,
          autoClose: true,
          start: options.start,
          end: options.end
        });
      };
      /**
       * Returns the file write stream
       * @param fileId
       * @param file
       * @param options
       * @return {*}
       */


      this.getWriteStream = function (fileId, file, options) {
        const fs = Npm.require('fs');

        options = _.extend({}, options);
        return fs.createWriteStream(self.getFilePath(fileId, file), {
          flags: 'a',
          encoding: null,
          mode: writeMode,
          start: options.start
        });
      };
    }
  }
  /**
   * Returns the file path
   * @param fileId
   * @param file
   * @return {string}
   */


  getFilePath(fileId, file) {
    file = file || this.getCollection().findOne(fileId, {
      fields: {
        extension: 1
      }
    });
    return file && this.getPath(fileId + (file.extension ? ".".concat(file.extension) : ''));
  }

}

// Add store to UFS namespace
UploadFS.store.Local = LocalStore;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/jalik:ufs-local/ufs-local.js");

/* Exports */
Package._define("jalik:ufs-local", exports);

})();

//# sourceURL=meteor://💻app/packages/jalik_ufs-local.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzLWxvY2FsL3Vmcy1sb2NhbC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJMb2NhbFN0b3JlIiwiXyIsImxpbmsiLCJ2IiwiY2hlY2siLCJNZXRlb3IiLCJVcGxvYWRGUyIsIlN0b3JlIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZXh0ZW5kIiwibW9kZSIsInBhdGgiLCJ3cml0ZU1vZGUiLCJUeXBlRXJyb3IiLCJzZWxmIiwiaXNTZXJ2ZXIiLCJmcyIsIk5wbSIsInJlcXVpcmUiLCJzdGF0IiwiZXJyIiwibWtkaXJwIiwiY29uc29sZSIsImVycm9yIiwibWVzc2FnZSIsImluZm8iLCJjaG1vZCIsImdldFBhdGgiLCJmaWxlIiwiZGVsZXRlIiwiZmlsZUlkIiwiY2FsbGJhY2siLCJnZXRGaWxlUGF0aCIsImJpbmRFbnZpcm9ubWVudCIsImlzRmlsZSIsInVubGluayIsImdldENvbGxlY3Rpb24iLCJyZW1vdmUiLCJjYWxsIiwiZ2V0UmVhZFN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmbGFncyIsImVuY29kaW5nIiwiYXV0b0Nsb3NlIiwic3RhcnQiLCJlbmQiLCJnZXRXcml0ZVN0cmVhbSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiZmluZE9uZSIsImZpZWxkcyIsImV4dGVuc2lvbiIsInN0b3JlIiwiTG9jYWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBQSxNQUFNLENBQUNDLE1BQVAsQ0FBYztBQUFDQyxZQUFVLEVBQUMsTUFBSUE7QUFBaEIsQ0FBZDs7QUFBMkMsSUFBSUMsQ0FBSjs7QUFBTUgsTUFBTSxDQUFDSSxJQUFQLENBQVksbUJBQVosRUFBZ0M7QUFBQ0QsR0FBQyxDQUFDRSxDQUFELEVBQUc7QUFBQ0YsS0FBQyxHQUFDRSxDQUFGO0FBQUk7O0FBQVYsQ0FBaEMsRUFBNEMsQ0FBNUM7QUFBK0MsSUFBSUMsS0FBSjtBQUFVTixNQUFN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LGlCQUFTLEVBQUU7QUFBWjtBQUFULEtBQXJDLENBQWY7QUFDQSxXQUFPdEIsSUFBSSxJQUFJLEtBQUtELE9BQUwsQ0FBYUcsTUFBTSxJQUFJRixJQUFJLENBQUNzQixTQUFMLGNBQXFCdEIsSUFBSSxDQUFDc0IsU0FBMUIsSUFBeUMsRUFBN0MsQ0FBbkIsQ0FBZjtBQUNIOztBQXhJMEM7O0FBMkkvQztBQUNBN0MsUUFBUSxDQUFDOEMsS0FBVCxDQUFlQyxLQUFmLEdBQXVCckQsVUFBdkIsQyIsImZpbGUiOiIvcGFja2FnZXMvamFsaWtfdWZzLWxvY2FsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNyBLYXJsIFNURUlOXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqXG4gKi9cblxuaW1wb3J0IHtffSBmcm9tICdtZXRlb3IvdW5kZXJzY29yZSc7XG5pbXBvcnQge2NoZWNrfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHtNZXRlb3J9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHtVcGxvYWRGU30gZnJvbSAnbWV0ZW9yL2phbGlrOnVmcyc7XG5cblxuLyoqXG4gKiBGaWxlIHN5c3RlbSBzdG9yZVxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgY2xhc3MgTG9jYWxTdG9yZSBleHRlbmRzIFVwbG9hZEZTLlN0b3JlIHtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgLy8gRGVmYXVsdCBvcHRpb25zXG4gICAgICAgIG9wdGlvbnMgPSBfLmV4dGVuZCh7XG4gICAgICAgICAgICBtb2RlOiAnMDc0NCcsXG4gICAgICAgICAgICBwYXRoOiAndWZzL3VwbG9hZHMnLFxuICAgICAgICAgICAgd3JpdGVNb2RlOiAnMDc0NCdcbiAgICAgICAgfSwgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gQ2hlY2sgb3B0aW9uc1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMubW9kZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkxvY2FsU3RvcmU6IG1vZGUgaXMgbm90IGEgc3RyaW5nXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5wYXRoICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiTG9jYWxTdG9yZTogcGF0aCBpcyBub3QgYSBzdHJpbmdcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLndyaXRlTW9kZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkxvY2FsU3RvcmU6IHdyaXRlTW9kZSBpcyBub3QgYSBzdHJpbmdcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzdXBlcihvcHRpb25zKTtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIC8vIFByaXZhdGUgYXR0cmlidXRlc1xuICAgICAgICBsZXQgbW9kZSA9IG9wdGlvbnMubW9kZTtcbiAgICAgICAgbGV0IHBhdGggPSBvcHRpb25zLnBhdGg7XG4gICAgICAgIGxldCB3cml0ZU1vZGUgPSBvcHRpb25zLndyaXRlTW9kZTtcblxuICAgICAgICBpZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgICAgICAgICBjb25zdCBmcyA9IE5wbS5yZXF1aXJlKCdmcycpO1xuXG4gICAgICAgICAgICBmcy5zdGF0KHBhdGgsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1rZGlycCA9IE5wbS5yZXF1aXJlKCdta2RpcnAnKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIGRpcmVjdG9yeVxuICAgICAgICAgICAgICAgICAgICBta2RpcnAocGF0aCwge21vZGU6IG1vZGV9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgTG9jYWxTdG9yZTogY2Fubm90IGNyZWF0ZSBzdG9yZSBhdCAke3BhdGh9ICgke2Vyci5tZXNzYWdlfSlgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBMb2NhbFN0b3JlOiBzdG9yZSBjcmVhdGVkIGF0ICR7cGF0aH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGRpcmVjdG9yeSBwZXJtaXNzaW9uc1xuICAgICAgICAgICAgICAgICAgICBmcy5jaG1vZChwYXRoLCBtb2RlLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIgJiYgY29uc29sZS5lcnJvcihgTG9jYWxTdG9yZTogY2Fubm90IHNldCBzdG9yZSBwZXJtaXNzaW9ucyAke21vZGV9ICgke2Vyci5tZXNzYWdlfSlgKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyB0aGUgcGF0aCBvciBzdWIgcGF0aFxuICAgICAgICAgKiBAcGFyYW0gZmlsZVxuICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFBhdGggPSBmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGggKyAoZmlsZSA/IGAvJHtmaWxlfWAgOiAnJyk7XG4gICAgICAgIH07XG5cblxuICAgICAgICBpZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFJlbW92ZXMgdGhlIGZpbGVcbiAgICAgICAgICAgICAqIEBwYXJhbSBmaWxlSWRcbiAgICAgICAgICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uIChmaWxlSWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHBhdGggPSB0aGlzLmdldEZpbGVQYXRoKGZpbGVJZCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyICYmIGNvbnNvbGUuZXJyb3IoYExvY2FsU3RvcmU6IGNhbm5vdCBkZWxldGUgZmlsZSBcIiR7ZmlsZUlkfVwiIGF0ICR7cGF0aH0gKCR7ZXJyLm1lc3NhZ2V9KWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGZzID0gTnBtLnJlcXVpcmUoJ2ZzJyk7XG4gICAgICAgICAgICAgICAgZnMuc3RhdChwYXRoLCBNZXRlb3IuYmluZEVudmlyb25tZW50KGZ1bmN0aW9uIChlcnIsIHN0YXQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlcnIgJiYgc3RhdCAmJiBzdGF0LmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcy51bmxpbmsocGF0aCwgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRDb2xsZWN0aW9uKCkucmVtb3ZlKGZpbGVJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUmV0dXJucyB0aGUgZmlsZSByZWFkIHN0cmVhbVxuICAgICAgICAgICAgICogQHBhcmFtIGZpbGVJZFxuICAgICAgICAgICAgICogQHBhcmFtIGZpbGVcbiAgICAgICAgICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmdldFJlYWRTdHJlYW0gPSBmdW5jdGlvbiAoZmlsZUlkLCBmaWxlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZnMgPSBOcG0ucmVxdWlyZSgnZnMnKTtcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gXy5leHRlbmQoe30sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmcy5jcmVhdGVSZWFkU3RyZWFtKHNlbGYuZ2V0RmlsZVBhdGgoZmlsZUlkLCBmaWxlKSwge1xuICAgICAgICAgICAgICAgICAgICBmbGFnczogJ3InLFxuICAgICAgICAgICAgICAgICAgICBlbmNvZGluZzogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0Nsb3NlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogb3B0aW9ucy5zdGFydCxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiBvcHRpb25zLmVuZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZXR1cm5zIHRoZSBmaWxlIHdyaXRlIHN0cmVhbVxuICAgICAgICAgICAgICogQHBhcmFtIGZpbGVJZFxuICAgICAgICAgICAgICogQHBhcmFtIGZpbGVcbiAgICAgICAgICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmdldFdyaXRlU3RyZWFtID0gZnVuY3Rpb24gKGZpbGVJZCwgZmlsZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZzID0gTnBtLnJlcXVpcmUoJ2ZzJyk7XG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnMuY3JlYXRlV3JpdGVTdHJlYW0oc2VsZi5nZXRGaWxlUGF0aChmaWxlSWQsIGZpbGUpLCB7XG4gICAgICAgICAgICAgICAgICAgIGZsYWdzOiAnYScsXG4gICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBtb2RlOiB3cml0ZU1vZGUsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBvcHRpb25zLnN0YXJ0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIGZpbGVJZFxuICAgICAqIEBwYXJhbSBmaWxlXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEZpbGVQYXRoKGZpbGVJZCwgZmlsZSkge1xuICAgICAgICBmaWxlID0gZmlsZSB8fCB0aGlzLmdldENvbGxlY3Rpb24oKS5maW5kT25lKGZpbGVJZCwge2ZpZWxkczoge2V4dGVuc2lvbjogMX19KTtcbiAgICAgICAgcmV0dXJuIGZpbGUgJiYgdGhpcy5nZXRQYXRoKGZpbGVJZCArIChmaWxlLmV4dGVuc2lvbiA/IGAuJHtmaWxlLmV4dGVuc2lvbiB9YCA6ICcnKSk7XG4gICAgfVxufVxuXG4vLyBBZGQgc3RvcmUgdG8gVUZTIG5hbWVzcGFjZVxuVXBsb2FkRlMuc3RvcmUuTG9jYWwgPSBMb2NhbFN0b3JlO1xuIl19
