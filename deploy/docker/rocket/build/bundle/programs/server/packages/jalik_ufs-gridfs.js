(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var _ = Package.underscore._;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var options;

var require = meteorInstall({"node_modules":{"meteor":{"jalik:ufs-gridfs":{"ufs-gridfs.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// packages/jalik_ufs-gridfs/ufs-gridfs.js                                            //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////
                                                                                      //
module.export({
  GridFSStore: () => GridFSStore
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

class GridFSStore extends UploadFS.Store {
  constructor(options) {
    // Default options
    options = _.extend({
      chunkSize: 1024 * 255,
      collectionName: 'uploadfs'
    }, options); // Check options

    if (typeof options.chunkSize !== "number") {
      throw new TypeError("GridFSStore: chunkSize is not a number");
    }

    if (typeof options.collectionName !== "string") {
      throw new TypeError("GridFSStore: collectionName is not a string");
    }

    super(options);
    this.chunkSize = options.chunkSize;
    this.collectionName = options.collectionName;

    if (Meteor.isServer) {
      let mongo = Package.mongo.MongoInternals.NpmModule;
      let db = Package.mongo.MongoInternals.defaultRemoteCollectionDriver().mongo.db;
      let mongoStore = new mongo.GridFSBucket(db, {
        bucketName: options.collectionName,
        chunkSizeBytes: options.chunkSize
      });
      /**
       * Removes the file
       * @param fileId
       * @param callback
       */

      this.delete = function (fileId, callback) {
        if (typeof callback !== 'function') {
          callback = function (err) {
            if (err) {
              console.error(err);
            }
          };
        }

        return mongoStore.delete(fileId, callback);
      };
      /**
       * Returns the file read stream
       * @param fileId
       * @param file
       * @param options
       * @return {*}
       */


      this.getReadStream = function (fileId, file, options) {
        options = _.extend({}, options);
        return mongoStore.openDownloadStream(fileId, {
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
        let writeStream = mongoStore.openUploadStreamWithId(fileId, fileId, {
          chunkSizeBytes: this.chunkSize,
          contentType: file.type
        });
        writeStream.on('close', function () {
          writeStream.emit('finish');
        });
        return writeStream;
      };
    }
  }

}

// Add store to UFS namespace
UploadFS.store.GridFS = GridFSStore;
////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/jalik:ufs-gridfs/ufs-gridfs.js");

/* Exports */
Package._define("jalik:ufs-gridfs", exports);

})();

//# sourceURL=meteor://💻app/packages/jalik_ufs-gridfs.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzLWdyaWRmcy91ZnMtZ3JpZGZzLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsIkdyaWRGU1N0b3JlIiwiXyIsImxpbmsiLCJ2IiwiY2hlY2siLCJNZXRlb3IiLCJVcGxvYWRGUyIsIlN0b3JlIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZXh0ZW5kIiwiY2h1bmtTaXplIiwiY29sbGVjdGlvbk5hbWUiLCJUeXBlRXJyb3IiLCJpc1NlcnZlciIsIm1vbmdvIiwiUGFja2FnZSIsIk1vbmdvSW50ZXJuYWxzIiwiTnBtTW9kdWxlIiwiZGIiLCJkZWZhdWx0UmVtb3RlQ29sbGVjdGlvbkRyaXZlciIsIm1vbmdvU3RvcmUiLCJHcmlkRlNCdWNrZXQiLCJidWNrZXROYW1lIiwiY2h1bmtTaXplQnl0ZXMiLCJkZWxldGUiLCJmaWxlSWQiLCJjYWxsYmFjayIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImdldFJlYWRTdHJlYW0iLCJmaWxlIiwib3BlbkRvd25sb2FkU3RyZWFtIiwic3RhcnQiLCJlbmQiLCJnZXRXcml0ZVN0cmVhbSIsIndyaXRlU3RyZWFtIiwib3BlblVwbG9hZFN0cmVhbVdpdGhJZCIsImNvbnRlbnRUeXBlIiwidHlwZSIsIm9uIiwiZW1pdCIsInN0b3JlIiwiR3JpZEZTIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFBQ0MsYUFBVyxFQUFDLE1BQUlBO0FBQWpCLENBQWQ7O0FBQTZDLElBQUlDLENBQUo7O0FBQU1ILE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLG1CQUFaLEVBQWdDO0FBQUNELEdBQUMsQ0FBQ0UsQ0FBRCxFQUFHO0FBQUNGLEtBQUMsR0FBQ0UsQ0FBRjtBQUFJOztBQUFWLENBQWhDLEVBQTRDLENBQTVDO0FBQStDLElBQUlDLEtBQUo7QUFBVU4sTUFBTSxDQUFDSSxJQUFQLENBQVksY0FB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QnZCLE9BQXhCLEVBQWlDO0FBQ25ELFlBQUk0QixXQUFXLEdBQUdoQixVQUFVLENBQUNpQixzQkFBWCxDQUFrQ1osTUFBbEMsRUFBMENBLE1BQTFDLEVBQWtEO0FBQ2hFRix3QkFBYyxFQUFFLEtBQUtiLFNBRDJDO0FBRWhFNEIscUJBQVcsRUFBRVAsSUFBSSxDQUFDUTtBQUY4QyxTQUFsRCxDQUFsQjtBQUlBSCxtQkFBVyxDQUFDSSxFQUFaLENBQWUsT0FBZixFQUF3QixZQUFZO0FBQ2hDSixxQkFBVyxDQUFDSyxJQUFaLENBQWlCLFFBQWpCO0FBQ0gsU0FGRDtBQUdBLGVBQU9MLFdBQVA7QUFDSCxPQVREO0FBVUg7QUFDSjs7QUEvRTJDOztBQWtGaEQ7QUFDQS9CLFFBQVEsQ0FBQ3FDLEtBQVQsQ0FBZUMsTUFBZixHQUF3QjVDLFdBQXhCLEMiLCJmaWxlIjoiL3BhY2thZ2VzL2phbGlrX3Vmcy1ncmlkZnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbiAqIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuaW1wb3J0IHtffSBmcm9tIFwibWV0ZW9yL3VuZGVyc2NvcmVcIjtcclxuaW1wb3J0IHtjaGVja30gZnJvbSBcIm1ldGVvci9jaGVja1wiO1xyXG5pbXBvcnQge01ldGVvcn0gZnJvbSBcIm1ldGVvci9tZXRlb3JcIjtcclxuaW1wb3J0IHtVcGxvYWRGU30gZnJvbSBcIm1ldGVvci9qYWxpazp1ZnNcIjtcclxuXHJcblxyXG4vKipcclxuICogR3JpZEZTIHN0b3JlXHJcbiAqIEBwYXJhbSBvcHRpb25zXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEdyaWRGU1N0b3JlIGV4dGVuZHMgVXBsb2FkRlMuU3RvcmUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgICAvLyBEZWZhdWx0IG9wdGlvbnNcclxuICAgICAgICBvcHRpb25zID0gXy5leHRlbmQoe1xyXG4gICAgICAgICAgICBjaHVua1NpemU6IDEwMjQgKiAyNTUsXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25OYW1lOiAndXBsb2FkZnMnXHJcbiAgICAgICAgfSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIG9wdGlvbnNcclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuY2h1bmtTaXplICE9PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHcmlkRlNTdG9yZTogY2h1bmtTaXplIGlzIG5vdCBhIG51bWJlclwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmNvbGxlY3Rpb25OYW1lICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHcmlkRlNTdG9yZTogY29sbGVjdGlvbk5hbWUgaXMgbm90IGEgc3RyaW5nXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XHJcblxyXG4gICAgICAgIHRoaXMuY2h1bmtTaXplID0gb3B0aW9ucy5jaHVua1NpemU7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uTmFtZSA9IG9wdGlvbnMuY29sbGVjdGlvbk5hbWU7XHJcblxyXG4gICAgICAgIGlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcclxuICAgICAgICAgICAgbGV0IG1vbmdvID0gUGFja2FnZS5tb25nby5Nb25nb0ludGVybmFscy5OcG1Nb2R1bGU7XHJcbiAgICAgICAgICAgIGxldCBkYiA9IFBhY2thZ2UubW9uZ28uTW9uZ29JbnRlcm5hbHMuZGVmYXVsdFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIoKS5tb25nby5kYjtcclxuICAgICAgICAgICAgbGV0IG1vbmdvU3RvcmUgPSBuZXcgbW9uZ28uR3JpZEZTQnVja2V0KGRiLCB7XHJcbiAgICAgICAgICAgICAgICBidWNrZXROYW1lOiBvcHRpb25zLmNvbGxlY3Rpb25OYW1lLFxyXG4gICAgICAgICAgICAgICAgY2h1bmtTaXplQnl0ZXM6IG9wdGlvbnMuY2h1bmtTaXplXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIFJlbW92ZXMgdGhlIGZpbGVcclxuICAgICAgICAgICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlID0gZnVuY3Rpb24gKGZpbGVJZCwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vbmdvU3RvcmUuZGVsZXRlKGZpbGVJZCwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIFJldHVybnMgdGhlIGZpbGUgcmVhZCBzdHJlYW1cclxuICAgICAgICAgICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gb3B0aW9uc1xyXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHsqfVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgdGhpcy5nZXRSZWFkU3RyZWFtID0gZnVuY3Rpb24gKGZpbGVJZCwgZmlsZSwgb3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtb25nb1N0b3JlLm9wZW5Eb3dubG9hZFN0cmVhbShmaWxlSWQsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogb3B0aW9ucy5zdGFydCxcclxuICAgICAgICAgICAgICAgICAgICBlbmQ6IG9wdGlvbnMuZW5kXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBSZXR1cm5zIHRoZSBmaWxlIHdyaXRlIHN0cmVhbVxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBvcHRpb25zXHJcbiAgICAgICAgICAgICAqIEByZXR1cm4geyp9XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB0aGlzLmdldFdyaXRlU3RyZWFtID0gZnVuY3Rpb24gKGZpbGVJZCwgZmlsZSwgb3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHdyaXRlU3RyZWFtID0gbW9uZ29TdG9yZS5vcGVuVXBsb2FkU3RyZWFtV2l0aElkKGZpbGVJZCwgZmlsZUlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtTaXplQnl0ZXM6IHRoaXMuY2h1bmtTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBmaWxlLnR5cGVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgd3JpdGVTdHJlYW0ub24oJ2Nsb3NlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdyaXRlU3RyZWFtLmVtaXQoJ2ZpbmlzaCcpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd3JpdGVTdHJlYW07XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBBZGQgc3RvcmUgdG8gVUZTIG5hbWVzcGFjZVxyXG5VcGxvYWRGUy5zdG9yZS5HcmlkRlMgPSBHcmlkRlNTdG9yZTtcclxuIl19
