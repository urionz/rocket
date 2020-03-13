(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var CollectionHooks = Package['matb33:collection-hooks'].CollectionHooks;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var extension, options, path;

var require = meteorInstall({"node_modules":{"meteor":{"jalik:ufs":{"ufs.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs.js                                                                                         //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
!function (module1) {
  module1.export({
    UploadFS: () => UploadFS
  });

  let _;

  module1.link("meteor/underscore", {
    _(v) {
      _ = v;
    }

  }, 0);
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }

  }, 1);
  let Mongo;
  module1.link("meteor/mongo", {
    Mongo(v) {
      Mongo = v;
    }

  }, 2);
  let MIME;
  module1.link("./ufs-mime", {
    MIME(v) {
      MIME = v;
    }

  }, 3);
  let Random;
  module1.link("meteor/random", {
    Random(v) {
      Random = v;
    }

  }, 4);
  let Tokens;
  module1.link("./ufs-tokens", {
    Tokens(v) {
      Tokens = v;
    }

  }, 5);
  let Config;
  module1.link("./ufs-config", {
    Config(v) {
      Config = v;
    }

  }, 6);
  let Filter;
  module1.link("./ufs-filter", {
    Filter(v) {
      Filter = v;
    }

  }, 7);
  let Store;
  module1.link("./ufs-store", {
    Store(v) {
      Store = v;
    }

  }, 8);
  let StorePermissions;
  module1.link("./ufs-store-permissions", {
    StorePermissions(v) {
      StorePermissions = v;
    }

  }, 9);
  let Uploader;
  module1.link("./ufs-uploader", {
    Uploader(v) {
      Uploader = v;
    }

  }, 10);
  let stores = {};
  const UploadFS = {
    /**
     * Contains all stores
     */
    store: {},

    /**
     * Collection of tokens
     */
    tokens: Tokens,

    /**
     * Adds the "etag" attribute to files
     * @param where
     */
    addETagAttributeToFiles(where) {
      _.each(this.getStores(), store => {
        const files = store.getCollection(); // By default update only files with no path set

        files.find(where || {
          etag: null
        }, {
          fields: {
            _id: 1
          }
        }).forEach(file => {
          files.direct.update(file._id, {
            $set: {
              etag: this.generateEtag()
            }
          });
        });
      });
    },

    /**
     * Adds the MIME type for an extension
     * @param extension
     * @param mime
     */
    addMimeType(extension, mime) {
      MIME[extension.toLowerCase()] = mime;
    },

    /**
     * Adds the "path" attribute to files
     * @param where
     */
    addPathAttributeToFiles(where) {
      _.each(this.getStores(), store => {
        const files = store.getCollection(); // By default update only files with no path set

        files.find(where || {
          path: null
        }, {
          fields: {
            _id: 1
          }
        }).forEach(file => {
          files.direct.update(file._id, {
            $set: {
              path: store.getFileRelativeURL(file._id)
            }
          });
        });
      });
    },

    /**
     * Registers the store
     * @param store
     */
    addStore(store) {
      if (!(store instanceof Store)) {
        throw new TypeError("ufs: store is not an instance of UploadFS.Store.");
      }

      stores[store.getName()] = store;
    },

    /**
     * Generates a unique ETag
     * @return {string}
     */
    generateEtag() {
      return Random.id();
    },

    /**
     * Returns the MIME type of the extension
     * @param extension
     * @returns {*}
     */
    getMimeType(extension) {
      extension = extension.toLowerCase();
      return MIME[extension];
    },

    /**
     * Returns all MIME types
     */
    getMimeTypes() {
      return MIME;
    },

    /**
     * Returns the store by its name
     * @param name
     * @return {UploadFS.Store}
     */
    getStore(name) {
      return stores[name];
    },

    /**
     * Returns all stores
     * @return {object}
     */
    getStores() {
      return stores;
    },

    /**
     * Returns the temporary file path
     * @param fileId
     * @return {string}
     */
    getTempFilePath(fileId) {
      return "".concat(this.config.tmpDir, "/").concat(fileId);
    },

    /**
     * Imports a file from a URL
     * @param url
     * @param file
     * @param store
     * @param callback
     */
    importFromURL(url, file, store, callback) {
      if (typeof store === 'string') {
        Meteor.call('ufsImportURL', url, file, store, callback);
      } else if (typeof store === 'object') {
        store.importFromURL(url, file, callback);
      }
    },

    /**
     * Returns file and data as ArrayBuffer for each files in the event
     * @deprecated
     * @param event
     * @param callback
     */
    readAsArrayBuffer(event, callback) {
      console.error('UploadFS.readAsArrayBuffer is deprecated, see https://github.com/jalik/jalik-ufs#uploading-from-a-file');
    },

    /**
     * Opens a dialog to select a single file
     * @param callback
     */
    selectFile(callback) {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = false;

      input.onchange = ev => {
        let files = ev.target.files;
        callback.call(UploadFS, files[0]);
      }; // Fix for iOS/Safari


      const div = document.createElement('div');
      div.className = 'ufs-file-selector';
      div.style = 'display:none; height:0; width:0; overflow: hidden;';
      div.appendChild(input);
      document.body.appendChild(div); // Trigger file selection

      input.click();
    },

    /**
     * Opens a dialog to select multiple files
     * @param callback
     */
    selectFiles(callback) {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;

      input.onchange = ev => {
        const files = ev.target.files;

        for (let i = 0; i < files.length; i += 1) {
          callback.call(UploadFS, files[i]);
        }
      }; // Fix for iOS/Safari


      const div = document.createElement('div');
      div.className = 'ufs-file-selector';
      div.style = 'display:none; height:0; width:0; overflow: hidden;';
      div.appendChild(input);
      document.body.appendChild(div); // Trigger file selection

      input.click();
    }

  };

  if (Meteor.isClient) {
    require('./ufs-template-helpers');
  }

  if (Meteor.isServer) {
    require('./ufs-methods');

    require('./ufs-server');
  }
  /**
   * UploadFS Configuration
   * @type {Config}
   */


  UploadFS.config = new Config(); // Add classes to global namespace

  UploadFS.Config = Config;
  UploadFS.Filter = Filter;
  UploadFS.Store = Store;
  UploadFS.StorePermissions = StorePermissions;
  UploadFS.Uploader = Uploader;

  if (Meteor.isServer) {
    // Expose the module globally
    if (typeof global !== 'undefined') {
      global['UploadFS'] = UploadFS;
    }
  } else if (Meteor.isClient) {
    // Expose the module globally
    if (typeof window !== 'undefined') {
      window.UploadFS = UploadFS;
    }
  }
}.call(this, module);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-config.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-config.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  Config: () => Config
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let StorePermissions;
module.link("./ufs-store-permissions", {
  StorePermissions(v) {
    StorePermissions = v;
  }

}, 2);

class Config {
  constructor(options) {
    // Default options
    options = _.extend({
      defaultStorePermissions: null,
      https: false,
      simulateReadDelay: 0,
      simulateUploadSpeed: 0,
      simulateWriteDelay: 0,
      storesPath: 'ufs',
      tmpDir: '/tmp/ufs',
      tmpDirPermissions: '0700'
    }, options); // Check options

    if (options.defaultStorePermissions && !(options.defaultStorePermissions instanceof StorePermissions)) {
      throw new TypeError('Config: defaultStorePermissions is not an instance of StorePermissions');
    }

    if (typeof options.https !== 'boolean') {
      throw new TypeError('Config: https is not a function');
    }

    if (typeof options.simulateReadDelay !== 'number') {
      throw new TypeError('Config: simulateReadDelay is not a number');
    }

    if (typeof options.simulateUploadSpeed !== 'number') {
      throw new TypeError('Config: simulateUploadSpeed is not a number');
    }

    if (typeof options.simulateWriteDelay !== 'number') {
      throw new TypeError('Config: simulateWriteDelay is not a number');
    }

    if (typeof options.storesPath !== 'string') {
      throw new TypeError('Config: storesPath is not a string');
    }

    if (typeof options.tmpDir !== 'string') {
      throw new TypeError('Config: tmpDir is not a string');
    }

    if (typeof options.tmpDirPermissions !== 'string') {
      throw new TypeError('Config: tmpDirPermissions is not a string');
    }
    /**
     * Default store permissions
     * @type {UploadFS.StorePermissions}
     */


    this.defaultStorePermissions = options.defaultStorePermissions;
    /**
     * Use or not secured protocol in URLS
     * @type {boolean}
     */

    this.https = options.https;
    /**
     * The simulation read delay
     * @type {Number}
     */

    this.simulateReadDelay = parseInt(options.simulateReadDelay);
    /**
     * The simulation upload speed
     * @type {Number}
     */

    this.simulateUploadSpeed = parseInt(options.simulateUploadSpeed);
    /**
     * The simulation write delay
     * @type {Number}
     */

    this.simulateWriteDelay = parseInt(options.simulateWriteDelay);
    /**
     * The URL root path of stores
     * @type {string}
     */

    this.storesPath = options.storesPath;
    /**
     * The temporary directory of uploading files
     * @type {string}
     */

    this.tmpDir = options.tmpDir;
    /**
     * The permissions of the temporary directory
     * @type {string}
     */

    this.tmpDirPermissions = options.tmpDirPermissions;
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-filter.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-filter.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  Filter: () => Filter
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);

class Filter {
  constructor(options) {
    const self = this; // Default options

    options = _.extend({
      contentTypes: null,
      extensions: null,
      minSize: 1,
      maxSize: 0,
      onCheck: this.onCheck
    }, options); // Check options

    if (options.contentTypes && !(options.contentTypes instanceof Array)) {
      throw new TypeError("Filter: contentTypes is not an Array");
    }

    if (options.extensions && !(options.extensions instanceof Array)) {
      throw new TypeError("Filter: extensions is not an Array");
    }

    if (typeof options.minSize !== "number") {
      throw new TypeError("Filter: minSize is not a number");
    }

    if (typeof options.maxSize !== "number") {
      throw new TypeError("Filter: maxSize is not a number");
    }

    if (options.onCheck && typeof options.onCheck !== "function") {
      throw new TypeError("Filter: onCheck is not a function");
    } // Public attributes


    self.options = options;

    _.each(['onCheck'], method => {
      if (typeof options[method] === 'function') {
        self[method] = options[method];
      }
    });
  }
  /**
   * Checks the file
   * @param file
   */


  check(file) {
    if (typeof file !== "object" || !file) {
      throw new Meteor.Error('invalid-file', "File is not valid");
    } // Check size


    if (file.size <= 0 || file.size < this.getMinSize()) {
      throw new Meteor.Error('file-too-small', "File size is too small (min = ".concat(this.getMinSize(), ")"));
    }

    if (this.getMaxSize() > 0 && file.size > this.getMaxSize()) {
      throw new Meteor.Error('file-too-large', "File size is too large (max = ".concat(this.getMaxSize(), ")"));
    } // Check extension


    if (this.getExtensions() && !_.contains(this.getExtensions(), file.extension)) {
      throw new Meteor.Error('invalid-file-extension', "File extension \"".concat(file.extension, "\" is not accepted"));
    } // Check content type


    if (this.getContentTypes() && !this.isContentTypeInList(file.type, this.getContentTypes())) {
      throw new Meteor.Error('invalid-file-type', "File type \"".concat(file.type, "\" is not accepted"));
    } // Apply custom check


    if (typeof this.onCheck === 'function' && !this.onCheck(file)) {
      throw new Meteor.Error('invalid-file', "File does not match filter");
    }
  }
  /**
   * Returns the allowed content types
   * @return {Array}
   */


  getContentTypes() {
    return this.options.contentTypes;
  }
  /**
   * Returns the allowed extensions
   * @return {Array}
   */


  getExtensions() {
    return this.options.extensions;
  }
  /**
   * Returns the maximum file size
   * @return {Number}
   */


  getMaxSize() {
    return this.options.maxSize;
  }
  /**
   * Returns the minimum file size
   * @return {Number}
   */


  getMinSize() {
    return this.options.minSize;
  }
  /**
   * Checks if content type is in the given list
   * @param type
   * @param list
   * @return {boolean}
   */


  isContentTypeInList(type, list) {
    if (typeof type === 'string' && list instanceof Array) {
      if (_.contains(list, type)) {
        return true;
      } else {
        let wildCardGlob = '/*';

        let wildcards = _.filter(list, item => {
          return item.indexOf(wildCardGlob) > 0;
        });

        if (_.contains(wildcards, type.replace(/(\/.*)$/, wildCardGlob))) {
          return true;
        }
      }
    }

    return false;
  }
  /**
   * Checks if the file matches filter
   * @param file
   * @return {boolean}
   */


  isValid(file) {
    let result = true;

    try {
      this.check(file);
    } catch (err) {
      result = false;
    }

    return result;
  }
  /**
   * Executes custom checks
   * @param file
   * @return {boolean}
   */


  onCheck(file) {
    return true;
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-methods.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-methods.js                                                                                 //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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
module.link("./ufs", {
  UploadFS(v) {
    UploadFS = v;
  }

}, 3);
let Filter;
module.link("./ufs-filter", {
  Filter(v) {
    Filter = v;
  }

}, 4);
let Tokens;
module.link("./ufs-tokens", {
  Tokens(v) {
    Tokens = v;
  }

}, 5);

const fs = Npm.require('fs');

const http = Npm.require('http');

const https = Npm.require('https');

const Future = Npm.require('fibers/future');

if (Meteor.isServer) {
  Meteor.methods({
    /**
     * Completes the file transfer
     * @param fileId
     * @param storeName
     * @param token
     */
    ufsComplete(fileId, storeName, token) {
      check(fileId, String);
      check(storeName, String);
      check(token, String); // Get store

      let store = UploadFS.getStore(storeName);

      if (!store) {
        throw new Meteor.Error('invalid-store', "Store not found");
      } // Check token


      if (!store.checkToken(token, fileId)) {
        throw new Meteor.Error('invalid-token', "Token is not valid");
      }

      let fut = new Future();
      let tmpFile = UploadFS.getTempFilePath(fileId);

      const removeTempFile = function () {
        fs.unlink(tmpFile, function (err) {
          err && console.error("ufs: cannot delete temp file \"".concat(tmpFile, "\" (").concat(err.message, ")"));
        });
      };

      try {
        // todo check if temp file exists
        // Get file
        let file = store.getCollection().findOne({
          _id: fileId
        }); // Validate file before moving to the store

        store.validate(file); // Get the temp file

        let rs = fs.createReadStream(tmpFile, {
          flags: 'r',
          encoding: null,
          autoClose: true
        }); // Clean upload if error occurs

        rs.on('error', Meteor.bindEnvironment(function (err) {
          console.error(err);
          store.getCollection().remove({
            _id: fileId
          });
          fut.throw(err);
        })); // Save file in the store

        store.write(rs, fileId, Meteor.bindEnvironment(function (err, file) {
          removeTempFile();

          if (err) {
            fut.throw(err);
          } else {
            // File has been fully uploaded
            // so we don't need to keep the token anymore.
            // Also this ensure that the file cannot be modified with extra chunks later.
            Tokens.remove({
              fileId: fileId
            });
            fut.return(file);
          }
        }));
      } catch (err) {
        // If write failed, remove the file
        store.getCollection().remove({
          _id: fileId
        }); // removeTempFile(); // todo remove temp file on error or try again ?

        fut.throw(err);
      }

      return fut.wait();
    },

    /**
     * Creates the file and returns the file upload token
     * @param file
     * @return {{fileId: string, token: *, url: *}}
     */
    ufsCreate(file) {
      check(file, Object);

      if (typeof file.name !== 'string' || !file.name.length) {
        throw new Meteor.Error('invalid-file-name', "file name is not valid");
      }

      if (typeof file.store !== 'string' || !file.store.length) {
        throw new Meteor.Error('invalid-store', "store is not valid");
      } // Get store


      let store = UploadFS.getStore(file.store);

      if (!store) {
        throw new Meteor.Error('invalid-store', "Store not found");
      } // Set default info


      file.complete = false;
      file.uploading = false;
      file.extension = file.name && file.name.substr((~-file.name.lastIndexOf('.') >>> 0) + 2).toLowerCase(); // Assign file MIME type based on the extension

      if (file.extension && !file.type) {
        file.type = UploadFS.getMimeType(file.extension) || 'application/octet-stream';
      }

      file.progress = 0;
      file.size = parseInt(file.size) || 0;
      file.userId = file.userId || this.userId; // Check if the file matches store filter

      let filter = store.getFilter();

      if (filter instanceof Filter) {
        filter.check(file);
      } // Create the file


      let fileId = store.create(file);
      let token = store.createToken(fileId);
      let uploadUrl = store.getURL("".concat(fileId, "?token=").concat(token));
      return {
        fileId: fileId,
        token: token,
        url: uploadUrl
      };
    },

    /**
     * Deletes a file
     * @param fileId
     * @param storeName
     * @param token
     * @returns {*}
     */
    ufsDelete(fileId, storeName, token) {
      check(fileId, String);
      check(storeName, String);
      check(token, String); // Check store

      let store = UploadFS.getStore(storeName);

      if (!store) {
        throw new Meteor.Error('invalid-store', "Store not found");
      } // Ignore files that does not exist


      if (store.getCollection().find({
        _id: fileId
      }).count() === 0) {
        return 1;
      } // Check token


      if (!store.checkToken(token, fileId)) {
        throw new Meteor.Error('invalid-token', "Token is not valid");
      }

      return store.getCollection().remove({
        _id: fileId
      });
    },

    /**
     * Imports a file from the URL
     * @param url
     * @param file
     * @param storeName
     * @return {*}
     */
    ufsImportURL(url, file, storeName) {
      check(url, String);
      check(file, Object);
      check(storeName, String); // Check URL

      if (typeof url !== 'string' || url.length <= 0) {
        throw new Meteor.Error('invalid-url', "The url is not valid");
      } // Check file


      if (typeof file !== 'object' || file === null) {
        throw new Meteor.Error('invalid-file', "The file is not valid");
      } // Check store


      const store = UploadFS.getStore(storeName);

      if (!store) {
        throw new Meteor.Error('invalid-store', 'The store does not exist');
      } // Extract file info


      if (!file.name) {
        file.name = url.replace(/\?.*$/, '').split('/').pop();
      }

      if (file.name && !file.extension) {
        file.extension = file.name && file.name.substr((~-file.name.lastIndexOf('.') >>> 0) + 2).toLowerCase();
      }

      if (file.extension && !file.type) {
        // Assign file MIME type based on the extension
        file.type = UploadFS.getMimeType(file.extension) || 'application/octet-stream';
      } // Check if file is valid


      if (store.getFilter() instanceof Filter) {
        store.getFilter().check(file);
      }

      if (file.originalUrl) {
        console.warn("ufs: The \"originalUrl\" attribute is automatically set when importing a file from a URL");
      } // Add original URL


      file.originalUrl = url; // Create the file

      file.complete = false;
      file.uploading = true;
      file.progress = 0;
      file._id = store.create(file);
      let fut = new Future();
      let proto; // Detect protocol to use

      if (/http:\/\//i.test(url)) {
        proto = http;
      } else if (/https:\/\//i.test(url)) {
        proto = https;
      }

      this.unblock(); // Download file

      proto.get(url, Meteor.bindEnvironment(function (res) {
        // Save the file in the store
        store.write(res, file._id, function (err, file) {
          if (err) {
            fut.throw(err);
          } else {
            fut.return(file);
          }
        });
      })).on('error', function (err) {
        fut.throw(err);
      });
      return fut.wait();
    },

    /**
     * Marks the file uploading as stopped
     * @param fileId
     * @param storeName
     * @param token
     * @returns {*}
     */
    ufsStop(fileId, storeName, token) {
      check(fileId, String);
      check(storeName, String);
      check(token, String); // Check store

      const store = UploadFS.getStore(storeName);

      if (!store) {
        throw new Meteor.Error('invalid-store', "Store not found");
      } // Check file


      const file = store.getCollection().find({
        _id: fileId
      }, {
        fields: {
          userId: 1
        }
      });

      if (!file) {
        throw new Meteor.Error('invalid-file', "File not found");
      } // Check token


      if (!store.checkToken(token, fileId)) {
        throw new Meteor.Error('invalid-token', "Token is not valid");
      }

      return store.getCollection().update({
        _id: fileId
      }, {
        $set: {
          uploading: false
        }
      });
    }

  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-mime.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-mime.js                                                                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  MIME: () => MIME
});
const MIME = {
  // application
  '7z': 'application/x-7z-compressed',
  'arc': 'application/octet-stream',
  'ai': 'application/postscript',
  'bin': 'application/octet-stream',
  'bz': 'application/x-bzip',
  'bz2': 'application/x-bzip2',
  'eps': 'application/postscript',
  'exe': 'application/octet-stream',
  'gz': 'application/x-gzip',
  'gzip': 'application/x-gzip',
  'js': 'application/javascript',
  'json': 'application/json',
  'ogx': 'application/ogg',
  'pdf': 'application/pdf',
  'ps': 'application/postscript',
  'psd': 'application/octet-stream',
  'rar': 'application/x-rar-compressed',
  'rev': 'application/x-rar-compressed',
  'swf': 'application/x-shockwave-flash',
  'tar': 'application/x-tar',
  'xhtml': 'application/xhtml+xml',
  'xml': 'application/xml',
  'zip': 'application/zip',
  // audio
  'aif': 'audio/aiff',
  'aifc': 'audio/aiff',
  'aiff': 'audio/aiff',
  'au': 'audio/basic',
  'flac': 'audio/flac',
  'midi': 'audio/midi',
  'mp2': 'audio/mpeg',
  'mp3': 'audio/mpeg',
  'mpa': 'audio/mpeg',
  'oga': 'audio/ogg',
  'ogg': 'audio/ogg',
  'opus': 'audio/ogg',
  'ra': 'audio/vnd.rn-realaudio',
  'spx': 'audio/ogg',
  'wav': 'audio/x-wav',
  'weba': 'audio/webm',
  'wma': 'audio/x-ms-wma',
  // image
  'avs': 'image/avs-video',
  'bmp': 'image/x-windows-bmp',
  'gif': 'image/gif',
  'ico': 'image/vnd.microsoft.icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpg',
  'mjpg': 'image/x-motion-jpeg',
  'pic': 'image/pic',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'tif': 'image/tiff',
  'tiff': 'image/tiff',
  // text
  'css': 'text/css',
  'csv': 'text/csv',
  'html': 'text/html',
  'txt': 'text/plain',
  // video
  'avi': 'video/avi',
  'dv': 'video/x-dv',
  'flv': 'video/x-flv',
  'mov': 'video/quicktime',
  'mp4': 'video/mp4',
  'mpeg': 'video/mpeg',
  'mpg': 'video/mpg',
  'ogv': 'video/ogg',
  'vdo': 'video/vdo',
  'webm': 'video/webm',
  'wmv': 'video/x-ms-wmv',
  // specific to vendors
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'odb': 'application/vnd.oasis.opendocument.database',
  'odc': 'application/vnd.oasis.opendocument.chart',
  'odf': 'application/vnd.oasis.opendocument.formula',
  'odg': 'application/vnd.oasis.opendocument.graphics',
  'odi': 'application/vnd.oasis.opendocument.image',
  'odm': 'application/vnd.oasis.opendocument.text-master',
  'odp': 'application/vnd.oasis.opendocument.presentation',
  'ods': 'application/vnd.oasis.opendocument.spreadsheet',
  'odt': 'application/vnd.oasis.opendocument.text',
  'otg': 'application/vnd.oasis.opendocument.graphics-template',
  'otp': 'application/vnd.oasis.opendocument.presentation-template',
  'ots': 'application/vnd.oasis.opendocument.spreadsheet-template',
  'ott': 'application/vnd.oasis.opendocument.text-template',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-server.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-server.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let WebApp;
module.link("meteor/webapp", {
  WebApp(v) {
    WebApp = v;
  }

}, 2);
let UploadFS;
module.link("./ufs", {
  UploadFS(v) {
    UploadFS = v;
  }

}, 3);

if (Meteor.isServer) {
  const domain = Npm.require('domain');

  const fs = Npm.require('fs');

  const http = Npm.require('http');

  const https = Npm.require('https');

  const mkdirp = Npm.require('mkdirp');

  const stream = Npm.require('stream');

  const URL = Npm.require('url');

  const zlib = Npm.require('zlib');

  Meteor.startup(() => {
    let path = UploadFS.config.tmpDir;
    let mode = UploadFS.config.tmpDirPermissions;
    fs.stat(path, err => {
      if (err) {
        // Create the temp directory
        mkdirp(path, {
          mode: mode
        }, err => {
          if (err) {
            console.error("ufs: cannot create temp directory at \"".concat(path, "\" (").concat(err.message, ")"));
          } else {
            console.log("ufs: temp directory created at \"".concat(path, "\""));
          }
        });
      } else {
        // Set directory permissions
        fs.chmod(path, mode, err => {
          err && console.error("ufs: cannot set temp directory permissions ".concat(mode, " (").concat(err.message, ")"));
        });
      }
    });
  }); // Create domain to handle errors
  // and possibly avoid server crashes.

  let d = domain.create();
  d.on('error', err => {
    console.error('ufs: ' + err.message);
  }); // Listen HTTP requests to serve files

  WebApp.connectHandlers.use((req, res, next) => {
    // Quick check to see if request should be catch
    if (req.url.indexOf(UploadFS.config.storesPath) === -1) {
      next();
      return;
    } // Remove store path


    let parsedUrl = URL.parse(req.url);
    let path = parsedUrl.pathname.substr(UploadFS.config.storesPath.length + 1);

    let allowCORS = () => {
      // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader("Access-Control-Allow-Methods", "POST");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    };

    if (req.method === "OPTIONS") {
      let regExp = new RegExp('^\/([^\/\?]+)\/([^\/\?]+)$');
      let match = regExp.exec(path); // Request is not valid

      if (match === null) {
        res.writeHead(400);
        res.end();
        return;
      } // Get store


      let store = UploadFS.getStore(match[1]);

      if (!store) {
        res.writeHead(404);
        res.end();
        return;
      } // If a store is found, go ahead and allow the origin


      allowCORS();
      next();
    } else if (req.method === 'POST') {
      // Get store
      let regExp = new RegExp('^\/([^\/\?]+)\/([^\/\?]+)$');
      let match = regExp.exec(path); // Request is not valid

      if (match === null) {
        res.writeHead(400);
        res.end();
        return;
      } // Get store


      let store = UploadFS.getStore(match[1]);

      if (!store) {
        res.writeHead(404);
        res.end();
        return;
      } // If a store is found, go ahead and allow the origin


      allowCORS(); // Get file

      let fileId = match[2];

      if (store.getCollection().find({
        _id: fileId
      }).count() === 0) {
        res.writeHead(404);
        res.end();
        return;
      } // Check upload token


      if (!store.checkToken(req.query.token, fileId)) {
        res.writeHead(403);
        res.end();
        return;
      }

      let tmpFile = UploadFS.getTempFilePath(fileId);
      let ws = fs.createWriteStream(tmpFile, {
        flags: 'a'
      });
      let fields = {
        uploading: true
      };
      let progress = parseFloat(req.query.progress);

      if (!isNaN(progress) && progress > 0) {
        fields.progress = Math.min(progress, 1);
      }

      req.on('data', chunk => {
        ws.write(chunk);
      });
      req.on('error', err => {
        res.writeHead(500);
        res.end();
      });
      req.on('end', Meteor.bindEnvironment(() => {
        // Update completed state without triggering hooks
        store.getCollection().direct.update({
          _id: fileId
        }, {
          $set: fields
        });
        ws.end();
      }));
      ws.on('error', err => {
        console.error("ufs: cannot write chunk of file \"".concat(fileId, "\" (").concat(err.message, ")"));
        fs.unlink(tmpFile, err => {
          err && console.error("ufs: cannot delete temp file \"".concat(tmpFile, "\" (").concat(err.message, ")"));
        });
        res.writeHead(500);
        res.end();
      });
      ws.on('finish', () => {
        res.writeHead(204, {
          "Content-Type": 'text/plain'
        });
        res.end();
      });
    } else if (req.method === 'GET') {
      // Get store, file Id and file name
      let regExp = new RegExp('^\/([^\/\?]+)\/([^\/\?]+)(?:\/([^\/\?]+))?$');
      let match = regExp.exec(path); // Avoid 504 Gateway timeout error
      // if file is not handled by UploadFS.

      if (match === null) {
        next();
        return;
      } // Get store


      const storeName = match[1];
      const store = UploadFS.getStore(storeName);

      if (!store) {
        res.writeHead(404);
        res.end();
        return;
      }

      if (store.onRead !== null && store.onRead !== undefined && typeof store.onRead !== 'function') {
        console.error("ufs: Store.onRead is not a function in store \"".concat(storeName, "\""));
        res.writeHead(500);
        res.end();
        return;
      } // Remove file extension from file Id


      let index = match[2].indexOf('.');
      let fileId = index !== -1 ? match[2].substr(0, index) : match[2]; // Get file from database

      const file = store.getCollection().findOne({
        _id: fileId
      });

      if (!file) {
        res.writeHead(404);
        res.end();
        return;
      } // Simulate read speed


      if (UploadFS.config.simulateReadDelay) {
        Meteor._sleepForMs(UploadFS.config.simulateReadDelay);
      }

      d.run(() => {
        // Check if the file can be accessed
        if (store.onRead.call(store, fileId, file, req, res) !== false) {
          let options = {};
          let status = 200; // Prepare response headers

          let headers = {
            'Content-Type': file.type,
            'Content-Length': file.size
          }; // Add ETag header

          if (typeof file.etag === 'string') {
            headers['ETag'] = file.etag;
          } // Add Last-Modified header


          if (file.modifiedAt instanceof Date) {
            headers['Last-Modified'] = file.modifiedAt.toUTCString();
          } else if (file.uploadedAt instanceof Date) {
            headers['Last-Modified'] = file.uploadedAt.toUTCString();
          } // Parse request headers


          if (typeof req.headers === 'object') {
            // Compare ETag
            if (req.headers['if-none-match']) {
              if (file.etag === req.headers['if-none-match']) {
                res.writeHead(304); // Not Modified

                res.end();
                return;
              }
            } // Compare file modification date


            if (req.headers['if-modified-since']) {
              const modifiedSince = new Date(req.headers['if-modified-since']);

              if (file.modifiedAt instanceof Date && file.modifiedAt > modifiedSince || file.uploadedAt instanceof Date && file.uploadedAt > modifiedSince) {
                res.writeHead(304); // Not Modified

                res.end();
                return;
              }
            } // Support range request


            if (typeof req.headers.range === 'string') {
              const range = req.headers.range; // Range is not valid

              if (!range) {
                res.writeHead(416);
                res.end();
                return;
              }

              const total = file.size;
              const unit = range.substr(0, range.indexOf("="));

              if (unit !== "bytes") {
                res.writeHead(416);
                res.end();
                return;
              }

              const ranges = range.substr(unit.length).replace(/[^0-9\-,]/, '').split(',');

              if (ranges.length > 1) {//todo: support multipart ranges: https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests
              } else {
                const r = ranges[0].split("-");
                const start = parseInt(r[0], 10);
                const end = r[1] ? parseInt(r[1], 10) : total - 1; // Range is not valid

                if (start < 0 || end >= total || start > end) {
                  res.writeHead(416);
                  res.end();
                  return;
                } // Update headers


                headers['Content-Range'] = "bytes ".concat(start, "-").concat(end, "/").concat(total);
                headers['Content-Length'] = end - start + 1;
                options.start = start;
                options.end = end;
              }

              status = 206; // partial content
            }
          } else {
            headers['Accept-Ranges'] = "bytes";
          } // Open the file stream


          const rs = store.getReadStream(fileId, file, options);
          const ws = new stream.PassThrough();
          rs.on('error', Meteor.bindEnvironment(err => {
            store.onReadError.call(store, err, fileId, file);
            res.end();
          }));
          ws.on('error', Meteor.bindEnvironment(err => {
            store.onReadError.call(store, err, fileId, file);
            res.end();
          }));
          ws.on('close', () => {
            // Close output stream at the end
            ws.emit('end');
          }); // Transform stream

          store.transformRead(rs, ws, fileId, file, req, headers); // Parse request headers

          if (typeof req.headers === 'object') {
            // Compress data using if needed (ignore audio/video as they are already compressed)
            if (typeof req.headers['accept-encoding'] === 'string' && !/^(audio|video)/.test(file.type)) {
              let accept = req.headers['accept-encoding']; // Compress with gzip

              if (accept.match(/\bgzip\b/)) {
                headers['Content-Encoding'] = 'gzip';
                delete headers['Content-Length'];
                res.writeHead(status, headers);
                ws.pipe(zlib.createGzip()).pipe(res);
                return;
              } // Compress with deflate
              else if (accept.match(/\bdeflate\b/)) {
                  headers['Content-Encoding'] = 'deflate';
                  delete headers['Content-Length'];
                  res.writeHead(status, headers);
                  ws.pipe(zlib.createDeflate()).pipe(res);
                  return;
                }
            }
          } // Send raw data


          if (!headers['Content-Encoding']) {
            res.writeHead(status, headers);
            ws.pipe(res);
          }
        } else {
          res.end();
        }
      });
    } else {
      next();
    }
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-store-permissions.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-store-permissions.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  StorePermissions: () => StorePermissions
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);

class StorePermissions {
  constructor(options) {
    // Default options
    options = _.extend({
      insert: null,
      remove: null,
      update: null
    }, options); // Check options

    if (options.insert && typeof options.insert !== 'function') {
      throw new TypeError("StorePermissions: insert is not a function");
    }

    if (options.remove && typeof options.remove !== 'function') {
      throw new TypeError("StorePermissions: remove is not a function");
    }

    if (options.update && typeof options.update !== 'function') {
      throw new TypeError("StorePermissions: update is not a function");
    } // Public attributes


    this.actions = {
      insert: options.insert,
      remove: options.remove,
      update: options.update
    };
  }
  /**
   * Checks the permission for the action
   * @param action
   * @param userId
   * @param file
   * @param fields
   * @param modifiers
   * @return {*}
   */


  check(action, userId, file, fields, modifiers) {
    if (typeof this.actions[action] === 'function') {
      return this.actions[action](userId, file, fields, modifiers);
    }

    return true; // by default allow all
  }
  /**
   * Checks the insert permission
   * @param userId
   * @param file
   * @returns {*}
   */


  checkInsert(userId, file) {
    return this.check('insert', userId, file);
  }
  /**
   * Checks the remove permission
   * @param userId
   * @param file
   * @returns {*}
   */


  checkRemove(userId, file) {
    return this.check('remove', userId, file);
  }
  /**
   * Checks the update permission
   * @param userId
   * @param file
   * @param fields
   * @param modifiers
   * @returns {*}
   */


  checkUpdate(userId, file, fields, modifiers) {
    return this.check('update', userId, file, fields, modifiers);
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-store.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-store.js                                                                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  Store: () => Store
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
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 3);
let UploadFS;
module.link("./ufs", {
  UploadFS(v) {
    UploadFS = v;
  }

}, 4);
let Filter;
module.link("./ufs-filter", {
  Filter(v) {
    Filter = v;
  }

}, 5);
let StorePermissions;
module.link("./ufs-store-permissions", {
  StorePermissions(v) {
    StorePermissions = v;
  }

}, 6);
let Tokens;
module.link("./ufs-tokens", {
  Tokens(v) {
    Tokens = v;
  }

}, 7);

class Store {
  constructor(options) {
    let self = this; // Default options

    options = _.extend({
      collection: null,
      filter: null,
      name: null,
      onCopyError: this.onCopyError,
      onFinishUpload: this.onFinishUpload,
      onRead: this.onRead,
      onReadError: this.onReadError,
      onValidate: this.onValidate,
      onWriteError: this.onWriteError,
      permissions: null,
      transformRead: null,
      transformWrite: null
    }, options); // Check options

    if (!(options.collection instanceof Mongo.Collection)) {
      throw new TypeError('Store: collection is not a Mongo.Collection');
    }

    if (options.filter && !(options.filter instanceof Filter)) {
      throw new TypeError('Store: filter is not a UploadFS.Filter');
    }

    if (typeof options.name !== 'string') {
      throw new TypeError('Store: name is not a string');
    }

    if (UploadFS.getStore(options.name)) {
      throw new TypeError('Store: name already exists');
    }

    if (options.onCopyError && typeof options.onCopyError !== 'function') {
      throw new TypeError('Store: onCopyError is not a function');
    }

    if (options.onFinishUpload && typeof options.onFinishUpload !== 'function') {
      throw new TypeError('Store: onFinishUpload is not a function');
    }

    if (options.onRead && typeof options.onRead !== 'function') {
      throw new TypeError('Store: onRead is not a function');
    }

    if (options.onReadError && typeof options.onReadError !== 'function') {
      throw new TypeError('Store: onReadError is not a function');
    }

    if (options.onWriteError && typeof options.onWriteError !== 'function') {
      throw new TypeError('Store: onWriteError is not a function');
    }

    if (options.permissions && !(options.permissions instanceof StorePermissions)) {
      throw new TypeError('Store: permissions is not a UploadFS.StorePermissions');
    }

    if (options.transformRead && typeof options.transformRead !== 'function') {
      throw new TypeError('Store: transformRead is not a function');
    }

    if (options.transformWrite && typeof options.transformWrite !== 'function') {
      throw new TypeError('Store: transformWrite is not a function');
    }

    if (options.onValidate && typeof options.onValidate !== 'function') {
      throw new TypeError('Store: onValidate is not a function');
    } // Public attributes


    self.options = options;
    self.permissions = options.permissions;

    _.each(['onCopyError', 'onFinishUpload', 'onRead', 'onReadError', 'onWriteError', 'onValidate'], method => {
      if (typeof options[method] === 'function') {
        self[method] = options[method];
      }
    }); // Add the store to the list


    UploadFS.addStore(self); // Set default permissions

    if (!(self.permissions instanceof StorePermissions)) {
      // Uses custom default permissions or UFS default permissions
      if (UploadFS.config.defaultStorePermissions instanceof StorePermissions) {
        self.permissions = UploadFS.config.defaultStorePermissions;
      } else {
        self.permissions = new StorePermissions();
        console.warn("ufs: permissions are not defined for store \"".concat(options.name, "\""));
      }
    }

    if (Meteor.isServer) {
      /**
       * Checks token validity
       * @param token
       * @param fileId
       * @returns {boolean}
       */
      self.checkToken = function (token, fileId) {
        check(token, String);
        check(fileId, String);
        return Tokens.find({
          value: token,
          fileId: fileId
        }).count() === 1;
      };
      /**
       * Copies the file to a store
       * @param fileId
       * @param store
       * @param callback
       */


      self.copy = function (fileId, store, callback) {
        check(fileId, String);

        if (!(store instanceof Store)) {
          throw new TypeError('store is not an instance of UploadFS.Store');
        } // Get original file


        let file = self.getCollection().findOne({
          _id: fileId
        });

        if (!file) {
          throw new Meteor.Error('file-not-found', 'File not found');
        } // Silently ignore the file if it does not match filter


        const filter = store.getFilter();

        if (filter instanceof Filter && !filter.isValid(file)) {
          return;
        } // Prepare copy


        let copy = _.omit(file, '_id', 'url');

        copy.originalStore = self.getName();
        copy.originalId = fileId; // Create the copy

        let copyId = store.create(copy); // Get original stream

        let rs = self.getReadStream(fileId, file); // Catch errors to avoid app crashing

        rs.on('error', Meteor.bindEnvironment(function (err) {
          callback.call(self, err, null);
        })); // Copy file data

        store.write(rs, copyId, Meteor.bindEnvironment(function (err) {
          if (err) {
            self.getCollection().remove({
              _id: copyId
            });
            self.onCopyError.call(self, err, fileId, file);
          }

          if (typeof callback === 'function') {
            callback.call(self, err, copyId, copy, store);
          }
        }));
      };
      /**
       * Creates the file in the collection
       * @param file
       * @param callback
       * @return {string}
       */


      self.create = function (file, callback) {
        check(file, Object);
        file.store = self.options.name; // assign store to file

        return self.getCollection().insert(file, callback);
      };
      /**
       * Creates a token for the file (only needed for client side upload)
       * @param fileId
       * @returns {*}
       */


      self.createToken = function (fileId) {
        let token = self.generateToken(); // Check if token exists

        if (Tokens.find({
          fileId: fileId
        }).count()) {
          Tokens.update({
            fileId: fileId
          }, {
            $set: {
              createdAt: new Date(),
              value: token
            }
          });
        } else {
          Tokens.insert({
            createdAt: new Date(),
            fileId: fileId,
            value: token
          });
        }

        return token;
      };
      /**
       * Writes the file to the store
       * @param rs
       * @param fileId
       * @param callback
       */


      self.write = function (rs, fileId, callback) {
        let file = self.getCollection().findOne({
          _id: fileId
        });
        let ws = self.getWriteStream(fileId, file);
        let errorHandler = Meteor.bindEnvironment(function (err) {
          self.getCollection().remove({
            _id: fileId
          });
          self.onWriteError.call(self, err, fileId, file);
          callback.call(self, err);
        });
        ws.on('error', errorHandler);
        ws.on('finish', Meteor.bindEnvironment(function () {
          let size = 0;
          let readStream = self.getReadStream(fileId, file);
          readStream.on('error', Meteor.bindEnvironment(function (error) {
            callback.call(self, error, null);
          }));
          readStream.on('data', Meteor.bindEnvironment(function (data) {
            size += data.length;
          }));
          readStream.on('end', Meteor.bindEnvironment(function () {
            // Set file attribute
            file.complete = true;
            file.etag = UploadFS.generateEtag();
            file.path = self.getFileRelativeURL(fileId);
            file.progress = 1;
            file.size = size;
            file.token = self.generateToken();
            file.uploading = false;
            file.uploadedAt = new Date();
            file.url = self.getFileURL(fileId); // Execute callback

            if (typeof self.onFinishUpload === 'function') {
              self.onFinishUpload.call(self, file);
            } // Sets the file URL when file transfer is complete,
            // this way, the image will loads entirely.


            self.getCollection().direct.update({
              _id: fileId
            }, {
              $set: {
                complete: file.complete,
                etag: file.etag,
                path: file.path,
                progress: file.progress,
                size: file.size,
                token: file.token,
                uploading: file.uploading,
                uploadedAt: file.uploadedAt,
                url: file.url
              }
            }); // Return file info

            callback.call(self, null, file); // Simulate write speed

            if (UploadFS.config.simulateWriteDelay) {
              Meteor._sleepForMs(UploadFS.config.simulateWriteDelay);
            } // Copy file to other stores


            if (self.options.copyTo instanceof Array) {
              for (let i = 0; i < self.options.copyTo.length; i += 1) {
                let store = self.options.copyTo[i];

                if (!store.getFilter() || store.getFilter().isValid(file)) {
                  self.copy(fileId, store);
                }
              }
            }
          }));
        })); // Execute transformation

        self.transformWrite(rs, ws, fileId, file);
      };
    }

    if (Meteor.isServer) {
      const fs = Npm.require('fs');

      const collection = self.getCollection(); // Code executed after removing file

      collection.after.remove(function (userId, file) {
        // Remove associated tokens
        Tokens.remove({
          fileId: file._id
        });

        if (self.options.copyTo instanceof Array) {
          for (let i = 0; i < self.options.copyTo.length; i += 1) {
            // Remove copies in stores
            self.options.copyTo[i].getCollection().remove({
              originalId: file._id
            });
          }
        }
      }); // Code executed before inserting file

      collection.before.insert(function (userId, file) {
        if (!self.permissions.checkInsert(userId, file)) {
          throw new Meteor.Error('forbidden', "Forbidden");
        }
      }); // Code executed before updating file

      collection.before.update(function (userId, file, fields, modifiers) {
        if (!self.permissions.checkUpdate(userId, file, fields, modifiers)) {
          throw new Meteor.Error('forbidden', "Forbidden");
        }
      }); // Code executed before removing file

      collection.before.remove(function (userId, file) {
        if (!self.permissions.checkRemove(userId, file)) {
          throw new Meteor.Error('forbidden', "Forbidden");
        } // Delete the physical file in the store


        self.delete(file._id);
        let tmpFile = UploadFS.getTempFilePath(file._id); // Delete the temp file

        fs.stat(tmpFile, function (err) {
          !err && fs.unlink(tmpFile, function (err) {
            err && console.error("ufs: cannot delete temp file at ".concat(tmpFile, " (").concat(err.message, ")"));
          });
        });
      });
    }
  }
  /**
   * Deletes a file async
   * @param fileId
   * @param callback
   */


  delete(fileId, callback) {
    throw new Error('delete is not implemented');
  }
  /**
   * Generates a random token
   * @param pattern
   * @return {string}
   */


  generateToken(pattern) {
    return (pattern || 'xyxyxyxyxy').replace(/[xy]/g, c => {
      let r = Math.random() * 16 | 0,
          v = c === 'x' ? r : r & 0x3 | 0x8;
      let s = v.toString(16);
      return Math.round(Math.random()) ? s.toUpperCase() : s;
    });
  }
  /**
   * Returns the collection
   * @return {Mongo.Collection}
   */


  getCollection() {
    return this.options.collection;
  }
  /**
   * Returns the file URL
   * @param fileId
   * @return {string|null}
   */


  getFileRelativeURL(fileId) {
    let file = this.getCollection().findOne(fileId, {
      fields: {
        name: 1
      }
    });
    return file ? this.getRelativeURL("".concat(fileId, "/").concat(file.name)) : null;
  }
  /**
   * Returns the file URL
   * @param fileId
   * @return {string|null}
   */


  getFileURL(fileId) {
    let file = this.getCollection().findOne(fileId, {
      fields: {
        name: 1
      }
    });
    return file ? this.getURL("".concat(fileId, "/").concat(file.name)) : null;
  }
  /**
   * Returns the file filter
   * @return {UploadFS.Filter}
   */


  getFilter() {
    return this.options.filter;
  }
  /**
   * Returns the store name
   * @return {string}
   */


  getName() {
    return this.options.name;
  }
  /**
   * Returns the file read stream
   * @param fileId
   * @param file
   */


  getReadStream(fileId, file) {
    throw new Error('Store.getReadStream is not implemented');
  }
  /**
   * Returns the store relative URL
   * @param path
   * @return {string}
   */


  getRelativeURL(path) {
    const rootUrl = Meteor.absoluteUrl().replace(/\/+$/, '');
    const rootPath = rootUrl.replace(/^[a-z]+:\/\/[^/]+\/*/gi, '');
    const storeName = this.getName();
    path = String(path).replace(/\/$/, '').trim();
    return encodeURI("".concat(rootPath, "/").concat(UploadFS.config.storesPath, "/").concat(storeName, "/").concat(path));
  }
  /**
   * Returns the store absolute URL
   * @param path
   * @return {string}
   */


  getURL(path) {
    const rootUrl = Meteor.absoluteUrl({
      secure: UploadFS.config.https
    }).replace(/\/+$/, '');
    const storeName = this.getName();
    path = String(path).replace(/\/$/, '').trim();
    return encodeURI("".concat(rootUrl, "/").concat(UploadFS.config.storesPath, "/").concat(storeName, "/").concat(path));
  }
  /**
   * Returns the file write stream
   * @param fileId
   * @param file
   */


  getWriteStream(fileId, file) {
    throw new Error('getWriteStream is not implemented');
  }
  /**
   * Completes the file upload
   * @param url
   * @param file
   * @param callback
   */


  importFromURL(url, file, callback) {
    Meteor.call('ufsImportURL', url, file, this.getName(), callback);
  }
  /**
   * Called when a copy error happened
   * @param err
   * @param fileId
   * @param file
   */


  onCopyError(err, fileId, file) {
    console.error("ufs: cannot copy file \"".concat(fileId, "\" (").concat(err.message, ")"), err);
  }
  /**
   * Called when a file has been uploaded
   * @param file
   */


  onFinishUpload(file) {}
  /**
   * Called when a file is read from the store
   * @param fileId
   * @param file
   * @param request
   * @param response
   * @return boolean
   */


  onRead(fileId, file, request, response) {
    return true;
  }
  /**
   * Called when a read error happened
   * @param err
   * @param fileId
   * @param file
   * @return boolean
   */


  onReadError(err, fileId, file) {
    console.error("ufs: cannot read file \"".concat(fileId, "\" (").concat(err.message, ")"), err);
  }
  /**
   * Called when file is being validated
   * @param file
   */


  onValidate(file) {}
  /**
   * Called when a write error happened
   * @param err
   * @param fileId
   * @param file
   * @return boolean
   */


  onWriteError(err, fileId, file) {
    console.error("ufs: cannot write file \"".concat(fileId, "\" (").concat(err.message, ")"), err);
  }
  /**
   * Sets the store permissions
   * @param permissions
   */


  setPermissions(permissions) {
    if (!(permissions instanceof StorePermissions)) {
      throw new TypeError("Permissions is not an instance of UploadFS.StorePermissions");
    }

    this.permissions = permissions;
  }
  /**
   * Transforms the file on reading
   * @param readStream
   * @param writeStream
   * @param fileId
   * @param file
   * @param request
   * @param headers
   */


  transformRead(readStream, writeStream, fileId, file, request, headers) {
    if (typeof this.options.transformRead === 'function') {
      this.options.transformRead.call(this, readStream, writeStream, fileId, file, request, headers);
    } else {
      readStream.pipe(writeStream);
    }
  }
  /**
   * Transforms the file on writing
   * @param readStream
   * @param writeStream
   * @param fileId
   * @param file
   */


  transformWrite(readStream, writeStream, fileId, file) {
    if (typeof this.options.transformWrite === 'function') {
      this.options.transformWrite.call(this, readStream, writeStream, fileId, file);
    } else {
      readStream.pipe(writeStream);
    }
  }
  /**
   * Validates the file
   * @param file
   */


  validate(file) {
    if (typeof this.onValidate === 'function') {
      this.onValidate(file);
    }
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-template-helpers.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-template-helpers.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let Template;
module.link("meteor/templating", {
  Template(v) {
    Template = v;
  }

}, 0);

let isMIME = function (type, mime) {
  return typeof type === 'string' && typeof mime === 'string' && mime.indexOf(type + '/') === 0;
};

Template.registerHelper('isApplication', function (type) {
  return isMIME('application', this.type || type);
});
Template.registerHelper('isAudio', function (type) {
  return isMIME('audio', this.type || type);
});
Template.registerHelper('isImage', function (type) {
  return isMIME('image', this.type || type);
});
Template.registerHelper('isText', function (type) {
  return isMIME('text', this.type || type);
});
Template.registerHelper('isVideo', function (type) {
  return isMIME('video', this.type || type);
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-tokens.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-tokens.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  Tokens: () => Tokens
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
const Tokens = new Mongo.Collection('ufsTokens');
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-uploader.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jalik_ufs/ufs-uploader.js                                                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  Uploader: () => Uploader
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Store;
module.link("./ufs-store", {
  Store(v) {
    Store = v;
  }

}, 2);

class Uploader {
  constructor(options) {
    let self = this; // Set default options

    options = _.extend({
      adaptive: true,
      capacity: 0.9,
      chunkSize: 16 * 1024,
      data: null,
      file: null,
      maxChunkSize: 4 * 1024 * 1000,
      maxTries: 5,
      onAbort: this.onAbort,
      onComplete: this.onComplete,
      onCreate: this.onCreate,
      onError: this.onError,
      onProgress: this.onProgress,
      onStart: this.onStart,
      onStop: this.onStop,
      retryDelay: 2000,
      store: null,
      transferDelay: 100
    }, options); // Check options

    if (typeof options.adaptive !== 'boolean') {
      throw new TypeError('adaptive is not a number');
    }

    if (typeof options.capacity !== 'number') {
      throw new TypeError('capacity is not a number');
    }

    if (options.capacity <= 0 || options.capacity > 1) {
      throw new RangeError('capacity must be a float between 0.1 and 1.0');
    }

    if (typeof options.chunkSize !== 'number') {
      throw new TypeError('chunkSize is not a number');
    }

    if (!(options.data instanceof Blob) && !(options.data instanceof File)) {
      throw new TypeError('data is not an Blob or File');
    }

    if (options.file === null || typeof options.file !== 'object') {
      throw new TypeError('file is not an object');
    }

    if (typeof options.maxChunkSize !== 'number') {
      throw new TypeError('maxChunkSize is not a number');
    }

    if (typeof options.maxTries !== 'number') {
      throw new TypeError('maxTries is not a number');
    }

    if (typeof options.retryDelay !== 'number') {
      throw new TypeError('retryDelay is not a number');
    }

    if (typeof options.transferDelay !== 'number') {
      throw new TypeError('transferDelay is not a number');
    }

    if (typeof options.onAbort !== 'function') {
      throw new TypeError('onAbort is not a function');
    }

    if (typeof options.onComplete !== 'function') {
      throw new TypeError('onComplete is not a function');
    }

    if (typeof options.onCreate !== 'function') {
      throw new TypeError('onCreate is not a function');
    }

    if (typeof options.onError !== 'function') {
      throw new TypeError('onError is not a function');
    }

    if (typeof options.onProgress !== 'function') {
      throw new TypeError('onProgress is not a function');
    }

    if (typeof options.onStart !== 'function') {
      throw new TypeError('onStart is not a function');
    }

    if (typeof options.onStop !== 'function') {
      throw new TypeError('onStop is not a function');
    }

    if (typeof options.store !== 'string' && !(options.store instanceof Store)) {
      throw new TypeError('store must be the name of the store or an instance of UploadFS.Store');
    } // Public attributes


    self.adaptive = options.adaptive;
    self.capacity = parseFloat(options.capacity);
    self.chunkSize = parseInt(options.chunkSize);
    self.maxChunkSize = parseInt(options.maxChunkSize);
    self.maxTries = parseInt(options.maxTries);
    self.retryDelay = parseInt(options.retryDelay);
    self.transferDelay = parseInt(options.transferDelay);
    self.onAbort = options.onAbort;
    self.onComplete = options.onComplete;
    self.onCreate = options.onCreate;
    self.onError = options.onError;
    self.onProgress = options.onProgress;
    self.onStart = options.onStart;
    self.onStop = options.onStop; // Private attributes

    let store = options.store;
    let data = options.data;
    let capacityMargin = 0.1;
    let file = options.file;
    let fileId = null;
    let offset = 0;
    let loaded = 0;
    let total = data.size;
    let tries = 0;
    let postUrl = null;
    let token = null;
    let complete = false;
    let uploading = false;
    let timeA = null;
    let timeB = null;
    let elapsedTime = 0;
    let startTime = 0; // Keep only the name of the store

    if (store instanceof Store) {
      store = store.getName();
    } // Assign file to store


    file.store = store;

    function finish() {
      // Finish the upload by telling the store the upload is complete
      Meteor.call('ufsComplete', fileId, store, token, function (err, uploadedFile) {
        if (err) {
          self.onError(err, file);
          self.abort();
        } else if (uploadedFile) {
          uploading = false;
          complete = true;
          file = uploadedFile;
          self.onComplete(uploadedFile);
        }
      });
    }
    /**
     * Aborts the current transfer
     */


    self.abort = function () {
      // Remove the file from database
      Meteor.call('ufsDelete', fileId, store, token, function (err, result) {
        if (err) {
          self.onError(err, file);
        }
      }); // Reset uploader status

      uploading = false;
      fileId = null;
      offset = 0;
      tries = 0;
      loaded = 0;
      complete = false;
      startTime = null;
      self.onAbort(file);
    };
    /**
     * Returns the average speed in bytes per second
     * @returns {number}
     */


    self.getAverageSpeed = function () {
      let seconds = self.getElapsedTime() / 1000;
      return self.getLoaded() / seconds;
    };
    /**
     * Returns the elapsed time in milliseconds
     * @returns {number}
     */


    self.getElapsedTime = function () {
      if (startTime && self.isUploading()) {
        return elapsedTime + (Date.now() - startTime);
      }

      return elapsedTime;
    };
    /**
     * Returns the file
     * @return {object}
     */


    self.getFile = function () {
      return file;
    };
    /**
     * Returns the loaded bytes
     * @return {number}
     */


    self.getLoaded = function () {
      return loaded;
    };
    /**
     * Returns current progress
     * @return {number}
     */


    self.getProgress = function () {
      return Math.min(loaded / total * 100 / 100, 1.0);
    };
    /**
     * Returns the remaining time in milliseconds
     * @returns {number}
     */


    self.getRemainingTime = function () {
      let averageSpeed = self.getAverageSpeed();
      let remainingBytes = total - self.getLoaded();
      return averageSpeed && remainingBytes ? Math.max(remainingBytes / averageSpeed, 0) : 0;
    };
    /**
     * Returns the upload speed in bytes per second
     * @returns {number}
     */


    self.getSpeed = function () {
      if (timeA && timeB && self.isUploading()) {
        let seconds = (timeB - timeA) / 1000;
        return self.chunkSize / seconds;
      }

      return 0;
    };
    /**
     * Returns the total bytes
     * @return {number}
     */


    self.getTotal = function () {
      return total;
    };
    /**
     * Checks if the transfer is complete
     * @return {boolean}
     */


    self.isComplete = function () {
      return complete;
    };
    /**
     * Checks if the transfer is active
     * @return {boolean}
     */


    self.isUploading = function () {
      return uploading;
    };
    /**
     * Reads a portion of file
     * @param start
     * @param length
     * @param callback
     * @returns {Blob}
     */


    self.readChunk = function (start, length, callback) {
      if (typeof callback != 'function') {
        throw new Error('readChunk is missing callback');
      }

      try {
        let end; // Calculate the chunk size

        if (length && start + length > total) {
          end = total;
        } else {
          end = start + length;
        } // Get chunk


        let chunk = data.slice(start, end); // Pass chunk to callback

        callback.call(self, null, chunk);
      } catch (err) {
        console.error('read error', err); // Retry to read chunk

        Meteor.setTimeout(function () {
          if (tries < self.maxTries) {
            tries += 1;
            self.readChunk(start, length, callback);
          }
        }, self.retryDelay);
      }
    };
    /**
     * Sends a file chunk to the store
     */


    self.sendChunk = function () {
      if (!complete && startTime !== null) {
        if (offset < total) {
          let chunkSize = self.chunkSize; // Use adaptive length

          if (self.adaptive && timeA && timeB && timeB > timeA) {
            let duration = (timeB - timeA) / 1000;
            let max = self.capacity * (1 + capacityMargin);
            let min = self.capacity * (1 - capacityMargin);

            if (duration >= max) {
              chunkSize = Math.abs(Math.round(chunkSize * (max - duration)));
            } else if (duration < min) {
              chunkSize = Math.round(chunkSize * (min / duration));
            } // Limit to max chunk size


            if (self.maxChunkSize > 0 && chunkSize > self.maxChunkSize) {
              chunkSize = self.maxChunkSize;
            }
          } // Limit to max chunk size


          if (self.maxChunkSize > 0 && chunkSize > self.maxChunkSize) {
            chunkSize = self.maxChunkSize;
          } // Reduce chunk size to fit total


          if (offset + chunkSize > total) {
            chunkSize = total - offset;
          } // Prepare the chunk


          self.readChunk(offset, chunkSize, function (err, chunk) {
            if (err) {
              self.onError(err, file);
              return;
            }

            let xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                if (_.contains([200, 201, 202, 204], xhr.status)) {
                  timeB = Date.now();
                  offset += chunkSize;
                  loaded += chunkSize; // Send next chunk

                  self.onProgress(file, self.getProgress()); // Finish upload

                  if (loaded >= total) {
                    elapsedTime = Date.now() - startTime;
                    finish();
                  } else {
                    Meteor.setTimeout(self.sendChunk, self.transferDelay);
                  }
                } else if (!_.contains([402, 403, 404, 500], xhr.status)) {
                  // Retry until max tries is reach
                  // But don't retry if these errors occur
                  if (tries <= self.maxTries) {
                    tries += 1; // Wait before retrying

                    Meteor.setTimeout(self.sendChunk, self.retryDelay);
                  } else {
                    self.abort();
                  }
                } else {
                  self.abort();
                }
              }
            }; // Calculate upload progress


            let progress = (offset + chunkSize) / total; // let formData = new FormData();
            // formData.append('progress', progress);
            // formData.append('chunk', chunk);

            let url = "".concat(postUrl, "&progress=").concat(progress);
            timeA = Date.now();
            timeB = null;
            uploading = true; // Send chunk to the store

            xhr.open('POST', url, true);
            xhr.send(chunk);
          });
        }
      }
    };
    /**
     * Starts or resumes the transfer
     */


    self.start = function () {
      if (!fileId) {
        // Create the file document and get the token
        // that allows the user to send chunks to the store.
        Meteor.call('ufsCreate', _.extend({}, file), function (err, result) {
          if (err) {
            self.onError(err, file);
          } else if (result) {
            token = result.token;
            postUrl = result.url;
            fileId = result.fileId;
            file._id = result.fileId;
            self.onCreate(file);
            tries = 0;
            startTime = Date.now();
            self.onStart(file);
            self.sendChunk();
          }
        });
      } else if (!uploading && !complete) {
        // Resume uploading
        tries = 0;
        startTime = Date.now();
        self.onStart(file);
        self.sendChunk();
      }
    };
    /**
     * Stops the transfer
     */


    self.stop = function () {
      if (uploading) {
        // Update elapsed time
        elapsedTime = Date.now() - startTime;
        startTime = null;
        uploading = false;
        self.onStop(file);
        Meteor.call('ufsStop', fileId, store, token, function (err, result) {
          if (err) {
            self.onError(err, file);
          }
        });
      }
    };
  }
  /**
   * Called when the file upload is aborted
   * @param file
   */


  onAbort(file) {}
  /**
   * Called when the file upload is complete
   * @param file
   */


  onComplete(file) {}
  /**
   * Called when the file is created in the collection
   * @param file
   */


  onCreate(file) {}
  /**
   * Called when an error occurs during file upload
   * @param err
   * @param file
   */


  onError(err, file) {
    console.error("ufs: ".concat(err.message));
  }
  /**
   * Called when a file chunk has been sent
   * @param file
   * @param progress is a float from 0.0 to 1.0
   */


  onProgress(file, progress) {}
  /**
   * Called when the file upload starts
   * @param file
   */


  onStart(file) {}
  /**
   * Called when the file upload stops
   * @param file
   */


  onStop(file) {}

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/jalik:ufs/ufs.js");

/* Exports */
Package._define("jalik:ufs", exports);

})();

//# sourceURL=meteor://💻app/packages/jalik_ufs.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzL3Vmcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzL3Vmcy1jb25maWcuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtZmlsdGVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9qYWxpazp1ZnMvdWZzLW1ldGhvZHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtbWltZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzL3Vmcy1zZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtc3RvcmUtcGVybWlzc2lvbnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtc3RvcmUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtdGVtcGxhdGUtaGVscGVycy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzL3Vmcy10b2tlbnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtdXBsb2FkZXIuanMiXSwibmFtZXMiOlsibW9kdWxlMSIsImV4cG9ydCIsIlVwbG9hZEZTIiwiXyIsImxpbmsiLCJ2IiwiTWV0ZW9yIiwiTW9uZ28iLCJNSU1FIiwiUmFuZG9tIiwiVG9rZW5zIiwiQ29uZmlnIiwiRmlsdGVyIiwiU3RvcmUiLCJTdG9yZVBlcm1pc3Npb25zIiwiVXBsb2FkZXIiLCJzdG9yZXMiLCJzdG9yZSIsInRva2VucyIsImFkZEVUYWdBdHRyaWJ1dGVUb0ZpbGVzIiwid2hlcmUiLCJlYWNoIiwiZ2V0U3RvcmVzIiwiZmlsZXMiLCJnZXRDb2xsZWN0aW9uIiwiZmluZCIsImV0YWciLCJmaWVsZHMiLCJfaWQiLCJmb3JFYWNoIiwiZmlsZSIsImRpcmVjdCIsInVwZGF0ZSIsIiRzZXQiLCJnZW5lcmF0ZUV0YWciLCJhZGRNaW1lVHlwZSIsImV4dGVuc2lvbiIsIm1pbWUiLCJ0b0xvd2VyQ2FzZSIsImFkZFBhdGhBdHRyaWJ1dGVUb0ZpbGVzIiwicGF0aCIsImdldEZpbGVSZWxhdGl2ZVVSTCIsImFkZFN0b3JlIiwiVHlwZUVycm9yIiwiZ2V0TmFtZSIsImlkIiwiZ2V0TWltZVR5cGUiLCJnZXRNaW1lVHlwZXMiLCJnZXRTdG9yZSIsIm5hbWUiLCJnZXRUZW1wRmlsZVBhdGgiLCJmaWxlSWQiLCJjb25maWciLCJ0bXBEaXIiLCJpbXBvcnRGcm9tVVJMIiwidXJsIiwiY2FsbGJhY2siLCJjYWxsIiwicmVhZEFzQXJyYXlCdWZmZXIiLCJldmVudCIsImNvbnNvbGUiLCJlcnJvciIsInNlbGVjdEZpbGUiLCJpbnB1dCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInR5cGUiLCJtdWx0aXBsZSIsIm9uY2hhbmdlIiwiZXYiLCJ0YXJnZXQiLCJkaXYiLCJjbGFzc05hbWUiLCJzdHlsZSIsImFwcGVuZENoaWxkIiwiYm9keSIsImNsaWNrIiwic2VsZWN0RmlsZXMiLCJpIiwibGVuZ3RoIiwiaXNDbGllbnQiLCJyZXF1aXJlIiwiaXNTZXJ2ZXIiLCJnbG9iYWwiLCJ3aW5kb3ciLCJtb2R1bGUiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJleHRlbmQiLCJkZWZhdWx0U3RvcmVQZXJtaXNzaW9ucyIsImh0dHBzIiwic2ltdWxhdGVSZWFkRGVsYXkiLCJzaW11bGF0ZVVwbG9hZFNwZWVkIiwic2ltdWxhdGVXcml0ZURlbGF5Iiwic3RvcmVzUGF0aCIsInRtcERpclBlcm1pc3Npb25zIiwicGFyc2VJbnQiLCJzZWxmIiwiY29udGVudFR5cGVzIiwiZXh0ZW5zaW9ucyIsIm1pblNpemUiLCJtYXhTaXplIiwib25DaGVjayIsIkFycmF5IiwibWV0aG9kIiwiY2hlY2siLCJFcnJvciIsInNpemUiLCJnZXRNaW5TaXplIiwiZ2V0TWF4U2l6ZSIsImdldEV4dGVuc2lvbnMiLCJjb250YWlucyIsImdldENvbnRlbnRUeXBlcyIsImlzQ29udGVudFR5cGVJbkxpc3QiLCJsaXN0Iiwid2lsZENhcmRHbG9iIiwid2lsZGNhcmRzIiwiZmlsdGVyIiwiaXRlbSIsImluZGV4T2YiLCJyZXBsYWNlIiwiaXNWYWxpZCIsInJlc3VsdCIsImVyciIsImZzIiwiTnBtIiwiaHR0cCIsIkZ1dHVyZSIsIm1ldGhvZHMiLCJ1ZnNDb21wbGV0ZSIsInN0b3JlTmFtZSIsInRva2VuIiwiU3RyaW5nIiwiY2hlY2tUb2tlbiIsImZ1dCIsInRtcEZpbGUiLCJyZW1vdmVUZW1wRmlsZSIsInVubGluayIsIm1lc3NhZ2UiLCJmaW5kT25lIiwidmFsaWRhdGUiLCJycyIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmbGFncyIsImVuY29kaW5nIiwiYXV0b0Nsb3NlIiwib24iLCJiaW5kRW52aXJvbm1lbnQiLCJyZW1vdmUiLCJ0aHJvdyIsIndyaXRlIiwicmV0dXJuIiwid2FpdCIsInVmc0NyZWF0ZSIsIk9iamVjdCIsImNvbXBsZXRlIiwidXBsb2FkaW5nIiwic3Vic3RyIiwibGFzdEluZGV4T2YiLCJwcm9ncmVzcyIsInVzZXJJZCIsImdldEZpbHRlciIsImNyZWF0ZSIsImNyZWF0ZVRva2VuIiwidXBsb2FkVXJsIiwiZ2V0VVJMIiwidWZzRGVsZXRlIiwiY291bnQiLCJ1ZnNJbXBvcnRVUkwiLCJzcGxpdCIsInBvcCIsIm9yaWdpbmFsVXJsIiwid2FybiIsInByb3RvIiwidGVzdCIsInVuYmxvY2siLCJnZXQiLCJyZXMiLCJ1ZnNTdG9wIiwiV2ViQXBwIiwiZG9tYWluIiwibWtkaXJwIiwic3RyZWFtIiwiVVJMIiwiemxpYiIsInN0YXJ0dXAiLCJtb2RlIiwic3RhdCIsImxvZyIsImNobW9kIiwiZCIsImNvbm5lY3RIYW5kbGVycyIsInVzZSIsInJlcSIsIm5leHQiLCJwYXJzZWRVcmwiLCJwYXJzZSIsInBhdGhuYW1lIiwiYWxsb3dDT1JTIiwic2V0SGVhZGVyIiwicmVnRXhwIiwiUmVnRXhwIiwibWF0Y2giLCJleGVjIiwid3JpdGVIZWFkIiwiZW5kIiwicXVlcnkiLCJ3cyIsImNyZWF0ZVdyaXRlU3RyZWFtIiwicGFyc2VGbG9hdCIsImlzTmFOIiwiTWF0aCIsIm1pbiIsImNodW5rIiwib25SZWFkIiwidW5kZWZpbmVkIiwiaW5kZXgiLCJfc2xlZXBGb3JNcyIsInJ1biIsInN0YXR1cyIsImhlYWRlcnMiLCJtb2RpZmllZEF0IiwiRGF0ZSIsInRvVVRDU3RyaW5nIiwidXBsb2FkZWRBdCIsIm1vZGlmaWVkU2luY2UiLCJyYW5nZSIsInRvdGFsIiwidW5pdCIsInJhbmdlcyIsInIiLCJzdGFydCIsImdldFJlYWRTdHJlYW0iLCJQYXNzVGhyb3VnaCIsIm9uUmVhZEVycm9yIiwiZW1pdCIsInRyYW5zZm9ybVJlYWQiLCJhY2NlcHQiLCJwaXBlIiwiY3JlYXRlR3ppcCIsImNyZWF0ZURlZmxhdGUiLCJpbnNlcnQiLCJhY3Rpb25zIiwiYWN0aW9uIiwibW9kaWZpZXJzIiwiY2hlY2tJbnNlcnQiLCJjaGVja1JlbW92ZSIsImNoZWNrVXBkYXRlIiwiY29sbGVjdGlvbiIsIm9uQ29weUVycm9yIiwib25GaW5pc2hVcGxvYWQiLCJvblZhbGlkYXRlIiwib25Xcml0ZUVycm9yIiwicGVybWlzc2lvbnMiLCJ0cmFuc2Zvcm1Xcml0ZSIsIkNvbGxlY3Rpb24iLCJ2YWx1ZSIsImNvcHkiLCJvbWl0Iiwib3JpZ2luYWxTdG9yZSIsIm9yaWdpbmFsSWQiLCJjb3B5SWQiLCJnZW5lcmF0ZVRva2VuIiwiY3JlYXRlZEF0IiwiZ2V0V3JpdGVTdHJlYW0iLCJlcnJvckhhbmRsZXIiLCJyZWFkU3RyZWFtIiwiZGF0YSIsImdldEZpbGVVUkwiLCJjb3B5VG8iLCJhZnRlciIsImJlZm9yZSIsImRlbGV0ZSIsInBhdHRlcm4iLCJjIiwicmFuZG9tIiwicyIsInRvU3RyaW5nIiwicm91bmQiLCJ0b1VwcGVyQ2FzZSIsImdldFJlbGF0aXZlVVJMIiwicm9vdFVybCIsImFic29sdXRlVXJsIiwicm9vdFBhdGgiLCJ0cmltIiwiZW5jb2RlVVJJIiwic2VjdXJlIiwicmVxdWVzdCIsInJlc3BvbnNlIiwic2V0UGVybWlzc2lvbnMiLCJ3cml0ZVN0cmVhbSIsIlRlbXBsYXRlIiwiaXNNSU1FIiwicmVnaXN0ZXJIZWxwZXIiLCJhZGFwdGl2ZSIsImNhcGFjaXR5IiwiY2h1bmtTaXplIiwibWF4Q2h1bmtTaXplIiwibWF4VHJpZXMiLCJvbkFib3J0Iiwib25Db21wbGV0ZSIsIm9uQ3JlYXRlIiwib25FcnJvciIsIm9uUHJvZ3Jlc3MiLCJvblN0YXJ0Iiwib25TdG9wIiwicmV0cnlEZWxheSIsInRyYW5zZmVyRGVsYXkiLCJSYW5nZUVycm9yIiwiQmxvYiIsIkZpbGUiLCJjYXBhY2l0eU1hcmdpbiIsIm9mZnNldCIsImxvYWRlZCIsInRyaWVzIiwicG9zdFVybCIsInRpbWVBIiwidGltZUIiLCJlbGFwc2VkVGltZSIsInN0YXJ0VGltZSIsImZpbmlzaCIsInVwbG9hZGVkRmlsZSIsImFib3J0IiwiZ2V0QXZlcmFnZVNwZWVkIiwic2Vjb25kcyIsImdldEVsYXBzZWRUaW1lIiwiZ2V0TG9hZGVkIiwiaXNVcGxvYWRpbmciLCJub3ciLCJnZXRGaWxlIiwiZ2V0UHJvZ3Jlc3MiLCJnZXRSZW1haW5pbmdUaW1lIiwiYXZlcmFnZVNwZWVkIiwicmVtYWluaW5nQnl0ZXMiLCJtYXgiLCJnZXRTcGVlZCIsImdldFRvdGFsIiwiaXNDb21wbGV0ZSIsInJlYWRDaHVuayIsInNsaWNlIiwic2V0VGltZW91dCIsInNlbmRDaHVuayIsImR1cmF0aW9uIiwiYWJzIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwib3BlbiIsInNlbmQiLCJzdG9wIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLFNBQU8sQ0FBQ0MsTUFBUixDQUFlO0FBQUNDLFlBQVEsRUFBQyxNQUFJQTtBQUFkLEdBQWY7O0FBQXdDLE1BQUlDLENBQUo7O0FB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QW5LLGlCQUFTLEdBQUcsS0FBWjtBQUNBM0QsWUFBSSxDQUFDZ04sTUFBTCxDQUFZblIsSUFBWjtBQUVBeEIsY0FBTSxDQUFDbUQsSUFBUCxDQUFZLFNBQVosRUFBdUJOLE1BQXZCLEVBQStCbEMsS0FBL0IsRUFBc0NrSCxLQUF0QyxFQUE2QyxVQUFVUixHQUFWLEVBQWVELE1BQWYsRUFBdUI7QUFDaEUsY0FBSUMsR0FBSixFQUFTO0FBQ0wxQixnQkFBSSxDQUFDNk0sT0FBTCxDQUFhbkwsR0FBYixFQUFrQjdGLElBQWxCO0FBQ0g7QUFDSixTQUpEO0FBS0g7QUFDSixLQWREO0FBZUg7QUFFRDs7Ozs7O0FBSUE2USxTQUFPLENBQUM3USxJQUFELEVBQU8sQ0FDYjtBQUVEOzs7Ozs7QUFJQThRLFlBQVUsQ0FBQzlRLElBQUQsRUFBTyxDQUNoQjtBQUVEOzs7Ozs7QUFJQStRLFVBQVEsQ0FBQy9RLElBQUQsRUFBTyxDQUNkO0FBRUQ7Ozs7Ozs7QUFLQWdSLFNBQU8sQ0FBQ25MLEdBQUQsRUFBTTdGLElBQU4sRUFBWTtBQUNmOEIsV0FBTyxDQUFDQyxLQUFSLGdCQUFzQjhELEdBQUcsQ0FBQ2UsT0FBMUI7QUFDSDtBQUVEOzs7Ozs7O0FBS0FxSyxZQUFVLENBQUNqUixJQUFELEVBQU9pSSxRQUFQLEVBQWlCLENBQzFCO0FBRUQ7Ozs7OztBQUlBaUosU0FBTyxDQUFDbFIsSUFBRCxFQUFPLENBQ2I7QUFFRDs7Ozs7O0FBSUFtUixRQUFNLENBQUNuUixJQUFELEVBQU8sQ0FDWjs7QUEzZWlCLEMiLCJmaWxlIjoiL3BhY2thZ2VzL2phbGlrX3Vmcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5pbXBvcnQge199IGZyb20gXCJtZXRlb3IvdW5kZXJzY29yZVwiO1xyXG5pbXBvcnQge01ldGVvcn0gZnJvbSBcIm1ldGVvci9tZXRlb3JcIjtcclxuaW1wb3J0IHtNb25nb30gZnJvbSBcIm1ldGVvci9tb25nb1wiO1xyXG5pbXBvcnQge01JTUV9IGZyb20gXCIuL3Vmcy1taW1lXCI7XHJcbmltcG9ydCB7UmFuZG9tfSBmcm9tIFwibWV0ZW9yL3JhbmRvbVwiO1xyXG5pbXBvcnQge1Rva2Vuc30gZnJvbSBcIi4vdWZzLXRva2Vuc1wiO1xyXG5pbXBvcnQge0NvbmZpZ30gZnJvbSBcIi4vdWZzLWNvbmZpZ1wiO1xyXG5pbXBvcnQge0ZpbHRlcn0gZnJvbSBcIi4vdWZzLWZpbHRlclwiO1xyXG5pbXBvcnQge1N0b3JlfSBmcm9tIFwiLi91ZnMtc3RvcmVcIjtcclxuaW1wb3J0IHtTdG9yZVBlcm1pc3Npb25zfSBmcm9tIFwiLi91ZnMtc3RvcmUtcGVybWlzc2lvbnNcIjtcclxuaW1wb3J0IHtVcGxvYWRlcn0gZnJvbSBcIi4vdWZzLXVwbG9hZGVyXCI7XHJcblxyXG5cclxubGV0IHN0b3JlcyA9IHt9O1xyXG5cclxuZXhwb3J0IGNvbnN0IFVwbG9hZEZTID0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udGFpbnMgYWxsIHN0b3Jlc1xyXG4gICAgICovXHJcbiAgICBzdG9yZToge30sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb2xsZWN0aW9uIG9mIHRva2Vuc1xyXG4gICAgICovXHJcbiAgICB0b2tlbnM6IFRva2VucyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIFwiZXRhZ1wiIGF0dHJpYnV0ZSB0byBmaWxlc1xyXG4gICAgICogQHBhcmFtIHdoZXJlXHJcbiAgICAgKi9cclxuICAgIGFkZEVUYWdBdHRyaWJ1dGVUb0ZpbGVzKHdoZXJlKSB7XHJcbiAgICAgICAgXy5lYWNoKHRoaXMuZ2V0U3RvcmVzKCksIChzdG9yZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlcyA9IHN0b3JlLmdldENvbGxlY3Rpb24oKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEJ5IGRlZmF1bHQgdXBkYXRlIG9ubHkgZmlsZXMgd2l0aCBubyBwYXRoIHNldFxyXG4gICAgICAgICAgICBmaWxlcy5maW5kKHdoZXJlIHx8IHtldGFnOiBudWxsfSwge2ZpZWxkczoge19pZDogMX19KS5mb3JFYWNoKChmaWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBmaWxlcy5kaXJlY3QudXBkYXRlKGZpbGUuX2lkLCB7JHNldDoge2V0YWc6IHRoaXMuZ2VuZXJhdGVFdGFnKCl9fSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIE1JTUUgdHlwZSBmb3IgYW4gZXh0ZW5zaW9uXHJcbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9uXHJcbiAgICAgKiBAcGFyYW0gbWltZVxyXG4gICAgICovXHJcbiAgICBhZGRNaW1lVHlwZShleHRlbnNpb24sIG1pbWUpIHtcclxuICAgICAgICBNSU1FW2V4dGVuc2lvbi50b0xvd2VyQ2FzZSgpXSA9IG1pbWU7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgXCJwYXRoXCIgYXR0cmlidXRlIHRvIGZpbGVzXHJcbiAgICAgKiBAcGFyYW0gd2hlcmVcclxuICAgICAqL1xyXG4gICAgYWRkUGF0aEF0dHJpYnV0ZVRvRmlsZXMod2hlcmUpIHtcclxuICAgICAgICBfLmVhY2godGhpcy5nZXRTdG9yZXMoKSwgKHN0b3JlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzID0gc3RvcmUuZ2V0Q29sbGVjdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgLy8gQnkgZGVmYXVsdCB1cGRhdGUgb25seSBmaWxlcyB3aXRoIG5vIHBhdGggc2V0XHJcbiAgICAgICAgICAgIGZpbGVzLmZpbmQod2hlcmUgfHwge3BhdGg6IG51bGx9LCB7ZmllbGRzOiB7X2lkOiAxfX0pLmZvckVhY2goKGZpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGZpbGVzLmRpcmVjdC51cGRhdGUoZmlsZS5faWQsIHskc2V0OiB7cGF0aDogc3RvcmUuZ2V0RmlsZVJlbGF0aXZlVVJMKGZpbGUuX2lkKX19KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVnaXN0ZXJzIHRoZSBzdG9yZVxyXG4gICAgICogQHBhcmFtIHN0b3JlXHJcbiAgICAgKi9cclxuICAgIGFkZFN0b3JlKHN0b3JlKSB7XHJcbiAgICAgICAgaWYgKCEoc3RvcmUgaW5zdGFuY2VvZiBTdG9yZSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdWZzOiBzdG9yZSBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgVXBsb2FkRlMuU3RvcmUuYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0b3Jlc1tzdG9yZS5nZXROYW1lKCldID0gc3RvcmU7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGVzIGEgdW5pcXVlIEVUYWdcclxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgZ2VuZXJhdGVFdGFnKCkge1xyXG4gICAgICAgIHJldHVybiBSYW5kb20uaWQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBNSU1FIHR5cGUgb2YgdGhlIGV4dGVuc2lvblxyXG4gICAgICogQHBhcmFtIGV4dGVuc2lvblxyXG4gICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgKi9cclxuICAgIGdldE1pbWVUeXBlKGV4dGVuc2lvbikge1xyXG4gICAgICAgIGV4dGVuc2lvbiA9IGV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIHJldHVybiBNSU1FW2V4dGVuc2lvbl07XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbGwgTUlNRSB0eXBlc1xyXG4gICAgICovXHJcbiAgICBnZXRNaW1lVHlwZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1JTUU7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3RvcmUgYnkgaXRzIG5hbWVcclxuICAgICAqIEBwYXJhbSBuYW1lXHJcbiAgICAgKiBAcmV0dXJuIHtVcGxvYWRGUy5TdG9yZX1cclxuICAgICAqL1xyXG4gICAgZ2V0U3RvcmUobmFtZSkge1xyXG4gICAgICAgIHJldHVybiBzdG9yZXNbbmFtZV07XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbGwgc3RvcmVzXHJcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9XHJcbiAgICAgKi9cclxuICAgIGdldFN0b3JlcygpIHtcclxuICAgICAgICByZXR1cm4gc3RvcmVzO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHRlbXBvcmFyeSBmaWxlIHBhdGhcclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgZ2V0VGVtcEZpbGVQYXRoKGZpbGVJZCkge1xyXG4gICAgICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZy50bXBEaXJ9LyR7ZmlsZUlkfWA7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW1wb3J0cyBhIGZpbGUgZnJvbSBhIFVSTFxyXG4gICAgICogQHBhcmFtIHVybFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqIEBwYXJhbSBzdG9yZVxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXHJcbiAgICAgKi9cclxuICAgIGltcG9ydEZyb21VUkwodXJsLCBmaWxlLCBzdG9yZSwgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAodHlwZW9mIHN0b3JlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBNZXRlb3IuY2FsbCgndWZzSW1wb3J0VVJMJywgdXJsLCBmaWxlLCBzdG9yZSwgY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2Ygc3RvcmUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHN0b3JlLmltcG9ydEZyb21VUkwodXJsLCBmaWxlLCBjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgZmlsZSBhbmQgZGF0YSBhcyBBcnJheUJ1ZmZlciBmb3IgZWFjaCBmaWxlcyBpbiB0aGUgZXZlbnRcclxuICAgICAqIEBkZXByZWNhdGVkXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICByZWFkQXNBcnJheUJ1ZmZlciAoZXZlbnQsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignVXBsb2FkRlMucmVhZEFzQXJyYXlCdWZmZXIgaXMgZGVwcmVjYXRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYWxpay9qYWxpay11ZnMjdXBsb2FkaW5nLWZyb20tYS1maWxlJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3BlbnMgYSBkaWFsb2cgdG8gc2VsZWN0IGEgc2luZ2xlIGZpbGVcclxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICBzZWxlY3RGaWxlKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgIGlucHV0LnR5cGUgPSAnZmlsZSc7XHJcbiAgICAgICAgaW5wdXQubXVsdGlwbGUgPSBmYWxzZTtcclxuICAgICAgICBpbnB1dC5vbmNoYW5nZSA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZmlsZXMgPSBldi50YXJnZXQuZmlsZXM7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoVXBsb2FkRlMsIGZpbGVzWzBdKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIEZpeCBmb3IgaU9TL1NhZmFyaVxyXG4gICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGRpdi5jbGFzc05hbWUgPSAndWZzLWZpbGUtc2VsZWN0b3InO1xyXG4gICAgICAgIGRpdi5zdHlsZSA9ICdkaXNwbGF5Om5vbmU7IGhlaWdodDowOyB3aWR0aDowOyBvdmVyZmxvdzogaGlkZGVuOyc7XHJcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGlucHV0KTtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XHJcbiAgICAgICAgLy8gVHJpZ2dlciBmaWxlIHNlbGVjdGlvblxyXG4gICAgICAgIGlucHV0LmNsaWNrKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3BlbnMgYSBkaWFsb2cgdG8gc2VsZWN0IG11bHRpcGxlIGZpbGVzXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgc2VsZWN0RmlsZXMoY2FsbGJhY2spIHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgaW5wdXQudHlwZSA9ICdmaWxlJztcclxuICAgICAgICBpbnB1dC5tdWx0aXBsZSA9IHRydWU7XHJcbiAgICAgICAgaW5wdXQub25jaGFuZ2UgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBldi50YXJnZXQuZmlsZXM7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKFVwbG9hZEZTLCBmaWxlc1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIEZpeCBmb3IgaU9TL1NhZmFyaVxyXG4gICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGRpdi5jbGFzc05hbWUgPSAndWZzLWZpbGUtc2VsZWN0b3InO1xyXG4gICAgICAgIGRpdi5zdHlsZSA9ICdkaXNwbGF5Om5vbmU7IGhlaWdodDowOyB3aWR0aDowOyBvdmVyZmxvdzogaGlkZGVuOyc7XHJcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGlucHV0KTtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XHJcbiAgICAgICAgLy8gVHJpZ2dlciBmaWxlIHNlbGVjdGlvblxyXG4gICAgICAgIGlucHV0LmNsaWNrKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuaWYgKE1ldGVvci5pc0NsaWVudCkge1xyXG4gICAgcmVxdWlyZSgnLi91ZnMtdGVtcGxhdGUtaGVscGVycycpO1xyXG59XHJcbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcclxuICAgIHJlcXVpcmUoJy4vdWZzLW1ldGhvZHMnKTtcclxuICAgIHJlcXVpcmUoJy4vdWZzLXNlcnZlcicpO1xyXG59XHJcblxyXG4vKipcclxuICogVXBsb2FkRlMgQ29uZmlndXJhdGlvblxyXG4gKiBAdHlwZSB7Q29uZmlnfVxyXG4gKi9cclxuVXBsb2FkRlMuY29uZmlnID0gbmV3IENvbmZpZygpO1xyXG5cclxuLy8gQWRkIGNsYXNzZXMgdG8gZ2xvYmFsIG5hbWVzcGFjZVxyXG5VcGxvYWRGUy5Db25maWcgPSBDb25maWc7XHJcblVwbG9hZEZTLkZpbHRlciA9IEZpbHRlcjtcclxuVXBsb2FkRlMuU3RvcmUgPSBTdG9yZTtcclxuVXBsb2FkRlMuU3RvcmVQZXJtaXNzaW9ucyA9IFN0b3JlUGVybWlzc2lvbnM7XHJcblVwbG9hZEZTLlVwbG9hZGVyID0gVXBsb2FkZXI7XHJcblxyXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XHJcbiAgICAvLyBFeHBvc2UgdGhlIG1vZHVsZSBnbG9iYWxseVxyXG4gICAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgZ2xvYmFsWydVcGxvYWRGUyddID0gVXBsb2FkRlM7XHJcbiAgICB9XHJcbn1cclxuZWxzZSBpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XHJcbiAgICAvLyBFeHBvc2UgdGhlIG1vZHVsZSBnbG9iYWxseVxyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgd2luZG93LlVwbG9hZEZTID0gVXBsb2FkRlM7XHJcbiAgICB9XHJcbn1cclxuIiwiLypcclxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNyBLYXJsIFNURUlOXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxyXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxyXG4gKiBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcblxyXG5pbXBvcnQge199IGZyb20gJ21ldGVvci91bmRlcnNjb3JlJztcclxuaW1wb3J0IHtNZXRlb3J9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQge1N0b3JlUGVybWlzc2lvbnN9IGZyb20gJy4vdWZzLXN0b3JlLXBlcm1pc3Npb25zJztcclxuXHJcblxyXG4vKipcclxuICogVXBsb2FkRlMgY29uZmlndXJhdGlvblxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENvbmZpZyB7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIC8vIERlZmF1bHQgb3B0aW9uc1xyXG4gICAgICAgIG9wdGlvbnMgPSBfLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIGRlZmF1bHRTdG9yZVBlcm1pc3Npb25zOiBudWxsLFxyXG4gICAgICAgICAgICBodHRwczogZmFsc2UsXHJcbiAgICAgICAgICAgIHNpbXVsYXRlUmVhZERlbGF5OiAwLFxyXG4gICAgICAgICAgICBzaW11bGF0ZVVwbG9hZFNwZWVkOiAwLFxyXG4gICAgICAgICAgICBzaW11bGF0ZVdyaXRlRGVsYXk6IDAsXHJcbiAgICAgICAgICAgIHN0b3Jlc1BhdGg6ICd1ZnMnLFxyXG4gICAgICAgICAgICB0bXBEaXI6ICcvdG1wL3VmcycsXHJcbiAgICAgICAgICAgIHRtcERpclBlcm1pc3Npb25zOiAnMDcwMCdcclxuICAgICAgICB9LCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgb3B0aW9uc1xyXG4gICAgICAgIGlmIChvcHRpb25zLmRlZmF1bHRTdG9yZVBlcm1pc3Npb25zICYmICEob3B0aW9ucy5kZWZhdWx0U3RvcmVQZXJtaXNzaW9ucyBpbnN0YW5jZW9mIFN0b3JlUGVybWlzc2lvbnMpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NvbmZpZzogZGVmYXVsdFN0b3JlUGVybWlzc2lvbnMgaXMgbm90IGFuIGluc3RhbmNlIG9mIFN0b3JlUGVybWlzc2lvbnMnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmh0dHBzICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ29uZmlnOiBodHRwcyBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuc2ltdWxhdGVSZWFkRGVsYXkgIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NvbmZpZzogc2ltdWxhdGVSZWFkRGVsYXkgaXMgbm90IGEgbnVtYmVyJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5zaW11bGF0ZVVwbG9hZFNwZWVkICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDb25maWc6IHNpbXVsYXRlVXBsb2FkU3BlZWQgaXMgbm90IGEgbnVtYmVyJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5zaW11bGF0ZVdyaXRlRGVsYXkgIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NvbmZpZzogc2ltdWxhdGVXcml0ZURlbGF5IGlzIG5vdCBhIG51bWJlcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuc3RvcmVzUGF0aCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ29uZmlnOiBzdG9yZXNQYXRoIGlzIG5vdCBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMudG1wRGlyICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDb25maWc6IHRtcERpciBpcyBub3QgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnRtcERpclBlcm1pc3Npb25zICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDb25maWc6IHRtcERpclBlcm1pc3Npb25zIGlzIG5vdCBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVmYXVsdCBzdG9yZSBwZXJtaXNzaW9uc1xyXG4gICAgICAgICAqIEB0eXBlIHtVcGxvYWRGUy5TdG9yZVBlcm1pc3Npb25zfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdFN0b3JlUGVybWlzc2lvbnMgPSBvcHRpb25zLmRlZmF1bHRTdG9yZVBlcm1pc3Npb25zO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVzZSBvciBub3Qgc2VjdXJlZCBwcm90b2NvbCBpbiBVUkxTXHJcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5odHRwcyA9IG9wdGlvbnMuaHR0cHM7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIHNpbXVsYXRpb24gcmVhZCBkZWxheVxyXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zaW11bGF0ZVJlYWREZWxheSA9IHBhcnNlSW50KG9wdGlvbnMuc2ltdWxhdGVSZWFkRGVsYXkpO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBzaW11bGF0aW9uIHVwbG9hZCBzcGVlZFxyXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zaW11bGF0ZVVwbG9hZFNwZWVkID0gcGFyc2VJbnQob3B0aW9ucy5zaW11bGF0ZVVwbG9hZFNwZWVkKTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgc2ltdWxhdGlvbiB3cml0ZSBkZWxheVxyXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zaW11bGF0ZVdyaXRlRGVsYXkgPSBwYXJzZUludChvcHRpb25zLnNpbXVsYXRlV3JpdGVEZWxheSk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIFVSTCByb290IHBhdGggb2Ygc3RvcmVzXHJcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnN0b3Jlc1BhdGggPSBvcHRpb25zLnN0b3Jlc1BhdGg7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIHRlbXBvcmFyeSBkaXJlY3Rvcnkgb2YgdXBsb2FkaW5nIGZpbGVzXHJcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnRtcERpciA9IG9wdGlvbnMudG1wRGlyO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBwZXJtaXNzaW9ucyBvZiB0aGUgdGVtcG9yYXJ5IGRpcmVjdG9yeVxyXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy50bXBEaXJQZXJtaXNzaW9ucyA9IG9wdGlvbnMudG1wRGlyUGVybWlzc2lvbnM7XHJcbiAgICB9XHJcbn1cclxuIiwiLypcclxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNyBLYXJsIFNURUlOXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxyXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxyXG4gKiBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcbmltcG9ydCB7X30gZnJvbSBcIm1ldGVvci91bmRlcnNjb3JlXCI7XHJcbmltcG9ydCB7TWV0ZW9yfSBmcm9tIFwibWV0ZW9yL21ldGVvclwiO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBGaWxlIGZpbHRlclxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEZpbHRlciB7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAvLyBEZWZhdWx0IG9wdGlvbnNcclxuICAgICAgICBvcHRpb25zID0gXy5leHRlbmQoe1xyXG4gICAgICAgICAgICBjb250ZW50VHlwZXM6IG51bGwsXHJcbiAgICAgICAgICAgIGV4dGVuc2lvbnM6IG51bGwsXHJcbiAgICAgICAgICAgIG1pblNpemU6IDEsXHJcbiAgICAgICAgICAgIG1heFNpemU6IDAsXHJcbiAgICAgICAgICAgIG9uQ2hlY2s6IHRoaXMub25DaGVja1xyXG4gICAgICAgIH0sIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBvcHRpb25zXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuY29udGVudFR5cGVzICYmICEob3B0aW9ucy5jb250ZW50VHlwZXMgaW5zdGFuY2VvZiBBcnJheSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZpbHRlcjogY29udGVudFR5cGVzIGlzIG5vdCBhbiBBcnJheVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhKG9wdGlvbnMuZXh0ZW5zaW9ucyBpbnN0YW5jZW9mIEFycmF5KSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmlsdGVyOiBleHRlbnNpb25zIGlzIG5vdCBhbiBBcnJheVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm1pblNpemUgIT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZpbHRlcjogbWluU2l6ZSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5tYXhTaXplICE9PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGaWx0ZXI6IG1heFNpemUgaXMgbm90IGEgbnVtYmVyXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5vbkNoZWNrICYmIHR5cGVvZiBvcHRpb25zLm9uQ2hlY2sgIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmlsdGVyOiBvbkNoZWNrIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUHVibGljIGF0dHJpYnV0ZXNcclxuICAgICAgICBzZWxmLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIF8uZWFjaChbXHJcbiAgICAgICAgICAgICdvbkNoZWNrJ1xyXG4gICAgICAgIF0sIChtZXRob2QpID0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zW21ldGhvZF0gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIHNlbGZbbWV0aG9kXSA9IG9wdGlvbnNbbWV0aG9kXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIHRoZSBmaWxlXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICovXHJcbiAgICBjaGVjayhmaWxlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBmaWxlICE9PSBcIm9iamVjdFwiIHx8ICFmaWxlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtZmlsZScsIFwiRmlsZSBpcyBub3QgdmFsaWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIENoZWNrIHNpemVcclxuICAgICAgICBpZiAoZmlsZS5zaXplIDw9IDAgfHwgZmlsZS5zaXplIDwgdGhpcy5nZXRNaW5TaXplKCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignZmlsZS10b28tc21hbGwnLCBgRmlsZSBzaXplIGlzIHRvbyBzbWFsbCAobWluID0gJHt0aGlzLmdldE1pblNpemUoKX0pYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmdldE1heFNpemUoKSA+IDAgJiYgZmlsZS5zaXplID4gdGhpcy5nZXRNYXhTaXplKCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignZmlsZS10b28tbGFyZ2UnLCBgRmlsZSBzaXplIGlzIHRvbyBsYXJnZSAobWF4ID0gJHt0aGlzLmdldE1heFNpemUoKX0pYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIENoZWNrIGV4dGVuc2lvblxyXG4gICAgICAgIGlmICh0aGlzLmdldEV4dGVuc2lvbnMoKSAmJiAhXy5jb250YWlucyh0aGlzLmdldEV4dGVuc2lvbnMoKSwgZmlsZS5leHRlbnNpb24pKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtZmlsZS1leHRlbnNpb24nLCBgRmlsZSBleHRlbnNpb24gXCIke2ZpbGUuZXh0ZW5zaW9ufVwiIGlzIG5vdCBhY2NlcHRlZGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBDaGVjayBjb250ZW50IHR5cGVcclxuICAgICAgICBpZiAodGhpcy5nZXRDb250ZW50VHlwZXMoKSAmJiAhdGhpcy5pc0NvbnRlbnRUeXBlSW5MaXN0KGZpbGUudHlwZSwgdGhpcy5nZXRDb250ZW50VHlwZXMoKSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1maWxlLXR5cGUnLCBgRmlsZSB0eXBlIFwiJHtmaWxlLnR5cGV9XCIgaXMgbm90IGFjY2VwdGVkYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEFwcGx5IGN1c3RvbSBjaGVja1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vbkNoZWNrID09PSAnZnVuY3Rpb24nICYmICF0aGlzLm9uQ2hlY2soZmlsZSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1maWxlJywgXCJGaWxlIGRvZXMgbm90IG1hdGNoIGZpbHRlclwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhbGxvd2VkIGNvbnRlbnQgdHlwZXNcclxuICAgICAqIEByZXR1cm4ge0FycmF5fVxyXG4gICAgICovXHJcbiAgICBnZXRDb250ZW50VHlwZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5jb250ZW50VHlwZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhbGxvd2VkIGV4dGVuc2lvbnNcclxuICAgICAqIEByZXR1cm4ge0FycmF5fVxyXG4gICAgICovXHJcbiAgICBnZXRFeHRlbnNpb25zKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG1heGltdW0gZmlsZSBzaXplXHJcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldE1heFNpemUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5tYXhTaXplO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgbWluaW11bSBmaWxlIHNpemVcclxuICAgICAqIEByZXR1cm4ge051bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0TWluU2l6ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLm1pblNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgY29udGVudCB0eXBlIGlzIGluIHRoZSBnaXZlbiBsaXN0XHJcbiAgICAgKiBAcGFyYW0gdHlwZVxyXG4gICAgICogQHBhcmFtIGxpc3RcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzQ29udGVudFR5cGVJbkxpc3QodHlwZSwgbGlzdCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiYgbGlzdCBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIGlmIChfLmNvbnRhaW5zKGxpc3QsIHR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCB3aWxkQ2FyZEdsb2IgPSAnLyonO1xyXG4gICAgICAgICAgICAgICAgbGV0IHdpbGRjYXJkcyA9IF8uZmlsdGVyKGxpc3QsIChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uaW5kZXhPZih3aWxkQ2FyZEdsb2IpID4gMDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChfLmNvbnRhaW5zKHdpbGRjYXJkcywgdHlwZS5yZXBsYWNlKC8oXFwvLiopJC8sIHdpbGRDYXJkR2xvYikpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSBmaWxlIG1hdGNoZXMgZmlsdGVyXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgaXNWYWxpZChmaWxlKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5jaGVjayhmaWxlKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFeGVjdXRlcyBjdXN0b20gY2hlY2tzXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgb25DaGVjayhmaWxlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuIiwiLypcclxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNyBLYXJsIFNURUlOXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxyXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxyXG4gKiBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcblxyXG5pbXBvcnQge199IGZyb20gJ21ldGVvci91bmRlcnNjb3JlJztcclxuaW1wb3J0IHtjaGVja30gZnJvbSAnbWV0ZW9yL2NoZWNrJztcclxuaW1wb3J0IHtNZXRlb3J9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQge1VwbG9hZEZTfSBmcm9tICcuL3Vmcyc7XHJcbmltcG9ydCB7RmlsdGVyfSBmcm9tICcuL3Vmcy1maWx0ZXInO1xyXG5pbXBvcnQge1Rva2Vuc30gZnJvbSAnLi91ZnMtdG9rZW5zJztcclxuXHJcbmNvbnN0IGZzID0gTnBtLnJlcXVpcmUoJ2ZzJyk7XHJcbmNvbnN0IGh0dHAgPSBOcG0ucmVxdWlyZSgnaHR0cCcpO1xyXG5jb25zdCBodHRwcyA9IE5wbS5yZXF1aXJlKCdodHRwcycpO1xyXG5jb25zdCBGdXR1cmUgPSBOcG0ucmVxdWlyZSgnZmliZXJzL2Z1dHVyZScpO1xyXG5cclxuXHJcbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcclxuICAgIE1ldGVvci5tZXRob2RzKHtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29tcGxldGVzIHRoZSBmaWxlIHRyYW5zZmVyXHJcbiAgICAgICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICAgICAqIEBwYXJhbSBzdG9yZU5hbWVcclxuICAgICAgICAgKiBAcGFyYW0gdG9rZW5cclxuICAgICAgICAgKi9cclxuICAgICAgICB1ZnNDb21wbGV0ZShmaWxlSWQsIHN0b3JlTmFtZSwgdG9rZW4pIHtcclxuICAgICAgICAgICAgY2hlY2soZmlsZUlkLCBTdHJpbmcpO1xyXG4gICAgICAgICAgICBjaGVjayhzdG9yZU5hbWUsIFN0cmluZyk7XHJcbiAgICAgICAgICAgIGNoZWNrKHRva2VuLCBTdHJpbmcpO1xyXG5cclxuICAgICAgICAgICAgLy8gR2V0IHN0b3JlXHJcbiAgICAgICAgICAgIGxldCBzdG9yZSA9IFVwbG9hZEZTLmdldFN0b3JlKHN0b3JlTmFtZSk7XHJcbiAgICAgICAgICAgIGlmICghc3RvcmUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtc3RvcmUnLCBcIlN0b3JlIG5vdCBmb3VuZFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBDaGVjayB0b2tlblxyXG4gICAgICAgICAgICBpZiAoIXN0b3JlLmNoZWNrVG9rZW4odG9rZW4sIGZpbGVJZCkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtdG9rZW4nLCBcIlRva2VuIGlzIG5vdCB2YWxpZFwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGZ1dCA9IG5ldyBGdXR1cmUoKTtcclxuICAgICAgICAgICAgbGV0IHRtcEZpbGUgPSBVcGxvYWRGUy5nZXRUZW1wRmlsZVBhdGgoZmlsZUlkKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHJlbW92ZVRlbXBGaWxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZnMudW5saW5rKHRtcEZpbGUsIGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnIgJiYgY29uc29sZS5lcnJvcihgdWZzOiBjYW5ub3QgZGVsZXRlIHRlbXAgZmlsZSBcIiR7dG1wRmlsZX1cIiAoJHtlcnIubWVzc2FnZX0pYCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAvLyB0b2RvIGNoZWNrIGlmIHRlbXAgZmlsZSBleGlzdHNcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgZmlsZVxyXG4gICAgICAgICAgICAgICAgbGV0IGZpbGUgPSBzdG9yZS5nZXRDb2xsZWN0aW9uKCkuZmluZE9uZSh7X2lkOiBmaWxlSWR9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBWYWxpZGF0ZSBmaWxlIGJlZm9yZSBtb3ZpbmcgdG8gdGhlIHN0b3JlXHJcbiAgICAgICAgICAgICAgICBzdG9yZS52YWxpZGF0ZShmaWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIHRlbXAgZmlsZVxyXG4gICAgICAgICAgICAgICAgbGV0IHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0bXBGaWxlLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmxhZ3M6ICdyJyxcclxuICAgICAgICAgICAgICAgICAgICBlbmNvZGluZzogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBhdXRvQ2xvc2U6IHRydWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENsZWFuIHVwbG9hZCBpZiBlcnJvciBvY2N1cnNcclxuICAgICAgICAgICAgICAgIHJzLm9uKCdlcnJvcicsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICBzdG9yZS5nZXRDb2xsZWN0aW9uKCkucmVtb3ZlKHtfaWQ6IGZpbGVJZH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGZ1dC50aHJvdyhlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNhdmUgZmlsZSBpbiB0aGUgc3RvcmVcclxuICAgICAgICAgICAgICAgIHN0b3JlLndyaXRlKHJzLCBmaWxlSWQsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGVyciwgZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZVRlbXBGaWxlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnV0LnRocm93KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlsZSBoYXMgYmVlbiBmdWxseSB1cGxvYWRlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyB3ZSBkb24ndCBuZWVkIHRvIGtlZXAgdGhlIHRva2VuIGFueW1vcmUuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsc28gdGhpcyBlbnN1cmUgdGhhdCB0aGUgZmlsZSBjYW5ub3QgYmUgbW9kaWZpZWQgd2l0aCBleHRyYSBjaHVua3MgbGF0ZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRva2Vucy5yZW1vdmUoe2ZpbGVJZDogZmlsZUlkfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1dC5yZXR1cm4oZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHdyaXRlIGZhaWxlZCwgcmVtb3ZlIHRoZSBmaWxlXHJcbiAgICAgICAgICAgICAgICBzdG9yZS5nZXRDb2xsZWN0aW9uKCkucmVtb3ZlKHtfaWQ6IGZpbGVJZH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlVGVtcEZpbGUoKTsgLy8gdG9kbyByZW1vdmUgdGVtcCBmaWxlIG9uIGVycm9yIG9yIHRyeSBhZ2FpbiA/XHJcbiAgICAgICAgICAgICAgICBmdXQudGhyb3coZXJyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZnV0LndhaXQoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGVzIHRoZSBmaWxlIGFuZCByZXR1cm5zIHRoZSBmaWxlIHVwbG9hZCB0b2tlblxyXG4gICAgICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgICAgICogQHJldHVybiB7e2ZpbGVJZDogc3RyaW5nLCB0b2tlbjogKiwgdXJsOiAqfX1cclxuICAgICAgICAgKi9cclxuICAgICAgICB1ZnNDcmVhdGUoZmlsZSkge1xyXG4gICAgICAgICAgICBjaGVjayhmaWxlLCBPYmplY3QpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWxlLm5hbWUgIT09ICdzdHJpbmcnIHx8ICFmaWxlLm5hbWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLWZpbGUtbmFtZScsIFwiZmlsZSBuYW1lIGlzIG5vdCB2YWxpZFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGZpbGUuc3RvcmUgIT09ICdzdHJpbmcnIHx8ICFmaWxlLnN0b3JlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1zdG9yZScsIFwic3RvcmUgaXMgbm90IHZhbGlkXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEdldCBzdG9yZVxyXG4gICAgICAgICAgICBsZXQgc3RvcmUgPSBVcGxvYWRGUy5nZXRTdG9yZShmaWxlLnN0b3JlKTtcclxuICAgICAgICAgICAgaWYgKCFzdG9yZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1zdG9yZScsIFwiU3RvcmUgbm90IGZvdW5kXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBTZXQgZGVmYXVsdCBpbmZvXHJcbiAgICAgICAgICAgIGZpbGUuY29tcGxldGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgZmlsZS51cGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZmlsZS5leHRlbnNpb24gPSBmaWxlLm5hbWUgJiYgZmlsZS5uYW1lLnN1YnN0cigofi1maWxlLm5hbWUubGFzdEluZGV4T2YoJy4nKSA+Pj4gMCkgKyAyKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAvLyBBc3NpZ24gZmlsZSBNSU1FIHR5cGUgYmFzZWQgb24gdGhlIGV4dGVuc2lvblxyXG4gICAgICAgICAgICBpZiAoZmlsZS5leHRlbnNpb24gJiYgIWZpbGUudHlwZSkge1xyXG4gICAgICAgICAgICAgICAgZmlsZS50eXBlID0gVXBsb2FkRlMuZ2V0TWltZVR5cGUoZmlsZS5leHRlbnNpb24pIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZpbGUucHJvZ3Jlc3MgPSAwO1xyXG4gICAgICAgICAgICBmaWxlLnNpemUgPSBwYXJzZUludChmaWxlLnNpemUpIHx8IDA7XHJcbiAgICAgICAgICAgIGZpbGUudXNlcklkID0gZmlsZS51c2VySWQgfHwgdGhpcy51c2VySWQ7XHJcblxyXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgZmlsZSBtYXRjaGVzIHN0b3JlIGZpbHRlclxyXG4gICAgICAgICAgICBsZXQgZmlsdGVyID0gc3RvcmUuZ2V0RmlsdGVyKCk7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgaW5zdGFuY2VvZiBGaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIGZpbHRlci5jaGVjayhmaWxlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBmaWxlXHJcbiAgICAgICAgICAgIGxldCBmaWxlSWQgPSBzdG9yZS5jcmVhdGUoZmlsZSk7XHJcbiAgICAgICAgICAgIGxldCB0b2tlbiA9IHN0b3JlLmNyZWF0ZVRva2VuKGZpbGVJZCk7XHJcbiAgICAgICAgICAgIGxldCB1cGxvYWRVcmwgPSBzdG9yZS5nZXRVUkwoYCR7ZmlsZUlkfT90b2tlbj0ke3Rva2VufWApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZDogZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgdG9rZW46IHRva2VuLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB1cGxvYWRVcmxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWxldGVzIGEgZmlsZVxyXG4gICAgICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAgICAgKiBAcGFyYW0gc3RvcmVOYW1lXHJcbiAgICAgICAgICogQHBhcmFtIHRva2VuXHJcbiAgICAgICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdWZzRGVsZXRlKGZpbGVJZCwgc3RvcmVOYW1lLCB0b2tlbikge1xyXG4gICAgICAgICAgICBjaGVjayhmaWxlSWQsIFN0cmluZyk7XHJcbiAgICAgICAgICAgIGNoZWNrKHN0b3JlTmFtZSwgU3RyaW5nKTtcclxuICAgICAgICAgICAgY2hlY2sodG9rZW4sIFN0cmluZyk7XHJcblxyXG4gICAgICAgICAgICAvLyBDaGVjayBzdG9yZVxyXG4gICAgICAgICAgICBsZXQgc3RvcmUgPSBVcGxvYWRGUy5nZXRTdG9yZShzdG9yZU5hbWUpO1xyXG4gICAgICAgICAgICBpZiAoIXN0b3JlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLXN0b3JlJywgXCJTdG9yZSBub3QgZm91bmRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gSWdub3JlIGZpbGVzIHRoYXQgZG9lcyBub3QgZXhpc3RcclxuICAgICAgICAgICAgaWYgKHN0b3JlLmdldENvbGxlY3Rpb24oKS5maW5kKHtfaWQ6IGZpbGVJZH0pLmNvdW50KCkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIENoZWNrIHRva2VuXHJcbiAgICAgICAgICAgIGlmICghc3RvcmUuY2hlY2tUb2tlbih0b2tlbiwgZmlsZUlkKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC10b2tlbicsIFwiVG9rZW4gaXMgbm90IHZhbGlkXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdG9yZS5nZXRDb2xsZWN0aW9uKCkucmVtb3ZlKHtfaWQ6IGZpbGVJZH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEltcG9ydHMgYSBmaWxlIGZyb20gdGhlIFVSTFxyXG4gICAgICAgICAqIEBwYXJhbSB1cmxcclxuICAgICAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICAgICAqIEBwYXJhbSBzdG9yZU5hbWVcclxuICAgICAgICAgKiBAcmV0dXJuIHsqfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHVmc0ltcG9ydFVSTCh1cmwsIGZpbGUsIHN0b3JlTmFtZSkge1xyXG4gICAgICAgICAgICBjaGVjayh1cmwsIFN0cmluZyk7XHJcbiAgICAgICAgICAgIGNoZWNrKGZpbGUsIE9iamVjdCk7XHJcbiAgICAgICAgICAgIGNoZWNrKHN0b3JlTmFtZSwgU3RyaW5nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIFVSTFxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycgfHwgdXJsLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLXVybCcsIFwiVGhlIHVybCBpcyBub3QgdmFsaWRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQ2hlY2sgZmlsZVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGZpbGUgIT09ICdvYmplY3QnIHx8IGZpbGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtZmlsZScsIFwiVGhlIGZpbGUgaXMgbm90IHZhbGlkXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIENoZWNrIHN0b3JlXHJcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlID0gVXBsb2FkRlMuZ2V0U3RvcmUoc3RvcmVOYW1lKTtcclxuICAgICAgICAgICAgaWYgKCFzdG9yZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1zdG9yZScsICdUaGUgc3RvcmUgZG9lcyBub3QgZXhpc3QnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRXh0cmFjdCBmaWxlIGluZm9cclxuICAgICAgICAgICAgaWYgKCFmaWxlLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGZpbGUubmFtZSA9IHVybC5yZXBsYWNlKC9cXD8uKiQvLCAnJykuc3BsaXQoJy8nKS5wb3AoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZmlsZS5uYW1lICYmICFmaWxlLmV4dGVuc2lvbikge1xyXG4gICAgICAgICAgICAgICAgZmlsZS5leHRlbnNpb24gPSBmaWxlLm5hbWUgJiYgZmlsZS5uYW1lLnN1YnN0cigofi1maWxlLm5hbWUubGFzdEluZGV4T2YoJy4nKSA+Pj4gMCkgKyAyKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChmaWxlLmV4dGVuc2lvbiAmJiAhZmlsZS50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBBc3NpZ24gZmlsZSBNSU1FIHR5cGUgYmFzZWQgb24gdGhlIGV4dGVuc2lvblxyXG4gICAgICAgICAgICAgICAgZmlsZS50eXBlID0gVXBsb2FkRlMuZ2V0TWltZVR5cGUoZmlsZS5leHRlbnNpb24pIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGZpbGUgaXMgdmFsaWRcclxuICAgICAgICAgICAgaWYgKHN0b3JlLmdldEZpbHRlcigpIGluc3RhbmNlb2YgRmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBzdG9yZS5nZXRGaWx0ZXIoKS5jaGVjayhmaWxlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGZpbGUub3JpZ2luYWxVcmwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgdWZzOiBUaGUgXCJvcmlnaW5hbFVybFwiIGF0dHJpYnV0ZSBpcyBhdXRvbWF0aWNhbGx5IHNldCB3aGVuIGltcG9ydGluZyBhIGZpbGUgZnJvbSBhIFVSTGApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgb3JpZ2luYWwgVVJMXHJcbiAgICAgICAgICAgIGZpbGUub3JpZ2luYWxVcmwgPSB1cmw7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIGZpbGVcclxuICAgICAgICAgICAgZmlsZS5jb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBmaWxlLnVwbG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIGZpbGUucHJvZ3Jlc3MgPSAwO1xyXG4gICAgICAgICAgICBmaWxlLl9pZCA9IHN0b3JlLmNyZWF0ZShmaWxlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBmdXQgPSBuZXcgRnV0dXJlKCk7XHJcbiAgICAgICAgICAgIGxldCBwcm90bztcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVjdCBwcm90b2NvbCB0byB1c2VcclxuICAgICAgICAgICAgaWYgKC9odHRwOlxcL1xcLy9pLnRlc3QodXJsKSkge1xyXG4gICAgICAgICAgICAgICAgcHJvdG8gPSBodHRwO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKC9odHRwczpcXC9cXC8vaS50ZXN0KHVybCkpIHtcclxuICAgICAgICAgICAgICAgIHByb3RvID0gaHR0cHM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudW5ibG9jaygpO1xyXG5cclxuICAgICAgICAgICAgLy8gRG93bmxvYWQgZmlsZVxyXG4gICAgICAgICAgICBwcm90by5nZXQodXJsLCBNZXRlb3IuYmluZEVudmlyb25tZW50KGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIGZpbGUgaW4gdGhlIHN0b3JlXHJcbiAgICAgICAgICAgICAgICBzdG9yZS53cml0ZShyZXMsIGZpbGUuX2lkLCBmdW5jdGlvbiAoZXJyLCBmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdXQudGhyb3coZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdXQucmV0dXJuKGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KSkub24oJ2Vycm9yJywgZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgZnV0LnRocm93KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZnV0LndhaXQoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBNYXJrcyB0aGUgZmlsZSB1cGxvYWRpbmcgYXMgc3RvcHBlZFxyXG4gICAgICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAgICAgKiBAcGFyYW0gc3RvcmVOYW1lXHJcbiAgICAgICAgICogQHBhcmFtIHRva2VuXHJcbiAgICAgICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdWZzU3RvcChmaWxlSWQsIHN0b3JlTmFtZSwgdG9rZW4pIHtcclxuICAgICAgICAgICAgY2hlY2soZmlsZUlkLCBTdHJpbmcpO1xyXG4gICAgICAgICAgICBjaGVjayhzdG9yZU5hbWUsIFN0cmluZyk7XHJcbiAgICAgICAgICAgIGNoZWNrKHRva2VuLCBTdHJpbmcpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgc3RvcmVcclxuICAgICAgICAgICAgY29uc3Qgc3RvcmUgPSBVcGxvYWRGUy5nZXRTdG9yZShzdG9yZU5hbWUpO1xyXG4gICAgICAgICAgICBpZiAoIXN0b3JlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLXN0b3JlJywgXCJTdG9yZSBub3QgZm91bmRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQ2hlY2sgZmlsZVxyXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gc3RvcmUuZ2V0Q29sbGVjdGlvbigpLmZpbmQoe19pZDogZmlsZUlkfSwge2ZpZWxkczoge3VzZXJJZDogMX19KTtcclxuICAgICAgICAgICAgaWYgKCFmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLWZpbGUnLCBcIkZpbGUgbm90IGZvdW5kXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIENoZWNrIHRva2VuXHJcbiAgICAgICAgICAgIGlmICghc3RvcmUuY2hlY2tUb2tlbih0b2tlbiwgZmlsZUlkKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC10b2tlbicsIFwiVG9rZW4gaXMgbm90IHZhbGlkXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RvcmUuZ2V0Q29sbGVjdGlvbigpLnVwZGF0ZSh7X2lkOiBmaWxlSWR9LCB7XHJcbiAgICAgICAgICAgICAgICAkc2V0OiB7dXBsb2FkaW5nOiBmYWxzZX1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuIiwiLypcclxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNyBLYXJsIFNURUlOXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxyXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxyXG4gKiBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcblxyXG4vKipcclxuICogTUlNRSB0eXBlcyBhbmQgZXh0ZW5zaW9uc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IE1JTUUgPSB7XHJcblxyXG4gICAgLy8gYXBwbGljYXRpb25cclxuICAgICc3eic6ICdhcHBsaWNhdGlvbi94LTd6LWNvbXByZXNzZWQnLFxyXG4gICAgJ2FyYyc6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nLFxyXG4gICAgJ2FpJzogJ2FwcGxpY2F0aW9uL3Bvc3RzY3JpcHQnLFxyXG4gICAgJ2Jpbic6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nLFxyXG4gICAgJ2J6JzogJ2FwcGxpY2F0aW9uL3gtYnppcCcsXHJcbiAgICAnYnoyJzogJ2FwcGxpY2F0aW9uL3gtYnppcDInLFxyXG4gICAgJ2Vwcyc6ICdhcHBsaWNhdGlvbi9wb3N0c2NyaXB0JyxcclxuICAgICdleGUnOiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyxcclxuICAgICdneic6ICdhcHBsaWNhdGlvbi94LWd6aXAnLFxyXG4gICAgJ2d6aXAnOiAnYXBwbGljYXRpb24veC1nemlwJyxcclxuICAgICdqcyc6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0JyxcclxuICAgICdqc29uJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgJ29neCc6ICdhcHBsaWNhdGlvbi9vZ2cnLFxyXG4gICAgJ3BkZic6ICdhcHBsaWNhdGlvbi9wZGYnLFxyXG4gICAgJ3BzJzogJ2FwcGxpY2F0aW9uL3Bvc3RzY3JpcHQnLFxyXG4gICAgJ3BzZCc6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nLFxyXG4gICAgJ3Jhcic6ICdhcHBsaWNhdGlvbi94LXJhci1jb21wcmVzc2VkJyxcclxuICAgICdyZXYnOiAnYXBwbGljYXRpb24veC1yYXItY29tcHJlc3NlZCcsXHJcbiAgICAnc3dmJzogJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJyxcclxuICAgICd0YXInOiAnYXBwbGljYXRpb24veC10YXInLFxyXG4gICAgJ3hodG1sJzogJ2FwcGxpY2F0aW9uL3hodG1sK3htbCcsXHJcbiAgICAneG1sJzogJ2FwcGxpY2F0aW9uL3htbCcsXHJcbiAgICAnemlwJzogJ2FwcGxpY2F0aW9uL3ppcCcsXHJcblxyXG4gICAgLy8gYXVkaW9cclxuICAgICdhaWYnOiAnYXVkaW8vYWlmZicsXHJcbiAgICAnYWlmYyc6ICdhdWRpby9haWZmJyxcclxuICAgICdhaWZmJzogJ2F1ZGlvL2FpZmYnLFxyXG4gICAgJ2F1JzogJ2F1ZGlvL2Jhc2ljJyxcclxuICAgICdmbGFjJzogJ2F1ZGlvL2ZsYWMnLFxyXG4gICAgJ21pZGknOiAnYXVkaW8vbWlkaScsXHJcbiAgICAnbXAyJzogJ2F1ZGlvL21wZWcnLFxyXG4gICAgJ21wMyc6ICdhdWRpby9tcGVnJyxcclxuICAgICdtcGEnOiAnYXVkaW8vbXBlZycsXHJcbiAgICAnb2dhJzogJ2F1ZGlvL29nZycsXHJcbiAgICAnb2dnJzogJ2F1ZGlvL29nZycsXHJcbiAgICAnb3B1cyc6ICdhdWRpby9vZ2cnLFxyXG4gICAgJ3JhJzogJ2F1ZGlvL3ZuZC5ybi1yZWFsYXVkaW8nLFxyXG4gICAgJ3NweCc6ICdhdWRpby9vZ2cnLFxyXG4gICAgJ3dhdic6ICdhdWRpby94LXdhdicsXHJcbiAgICAnd2ViYSc6ICdhdWRpby93ZWJtJyxcclxuICAgICd3bWEnOiAnYXVkaW8veC1tcy13bWEnLFxyXG5cclxuICAgIC8vIGltYWdlXHJcbiAgICAnYXZzJzogJ2ltYWdlL2F2cy12aWRlbycsXHJcbiAgICAnYm1wJzogJ2ltYWdlL3gtd2luZG93cy1ibXAnLFxyXG4gICAgJ2dpZic6ICdpbWFnZS9naWYnLFxyXG4gICAgJ2ljbyc6ICdpbWFnZS92bmQubWljcm9zb2Z0Lmljb24nLFxyXG4gICAgJ2pwZWcnOiAnaW1hZ2UvanBlZycsXHJcbiAgICAnanBnJzogJ2ltYWdlL2pwZycsXHJcbiAgICAnbWpwZyc6ICdpbWFnZS94LW1vdGlvbi1qcGVnJyxcclxuICAgICdwaWMnOiAnaW1hZ2UvcGljJyxcclxuICAgICdwbmcnOiAnaW1hZ2UvcG5nJyxcclxuICAgICdzdmcnOiAnaW1hZ2Uvc3ZnK3htbCcsXHJcbiAgICAndGlmJzogJ2ltYWdlL3RpZmYnLFxyXG4gICAgJ3RpZmYnOiAnaW1hZ2UvdGlmZicsXHJcblxyXG4gICAgLy8gdGV4dFxyXG4gICAgJ2Nzcyc6ICd0ZXh0L2NzcycsXHJcbiAgICAnY3N2JzogJ3RleHQvY3N2JyxcclxuICAgICdodG1sJzogJ3RleHQvaHRtbCcsXHJcbiAgICAndHh0JzogJ3RleHQvcGxhaW4nLFxyXG5cclxuICAgIC8vIHZpZGVvXHJcbiAgICAnYXZpJzogJ3ZpZGVvL2F2aScsXHJcbiAgICAnZHYnOiAndmlkZW8veC1kdicsXHJcbiAgICAnZmx2JzogJ3ZpZGVvL3gtZmx2JyxcclxuICAgICdtb3YnOiAndmlkZW8vcXVpY2t0aW1lJyxcclxuICAgICdtcDQnOiAndmlkZW8vbXA0JyxcclxuICAgICdtcGVnJzogJ3ZpZGVvL21wZWcnLFxyXG4gICAgJ21wZyc6ICd2aWRlby9tcGcnLFxyXG4gICAgJ29ndic6ICd2aWRlby9vZ2cnLFxyXG4gICAgJ3Zkbyc6ICd2aWRlby92ZG8nLFxyXG4gICAgJ3dlYm0nOiAndmlkZW8vd2VibScsXHJcbiAgICAnd212JzogJ3ZpZGVvL3gtbXMtd212JyxcclxuXHJcbiAgICAvLyBzcGVjaWZpYyB0byB2ZW5kb3JzXHJcbiAgICAnZG9jJzogJ2FwcGxpY2F0aW9uL21zd29yZCcsXHJcbiAgICAnZG9jeCc6ICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC5kb2N1bWVudCcsXHJcbiAgICAnb2RiJzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZGF0YWJhc2UnLFxyXG4gICAgJ29kYyc6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmNoYXJ0JyxcclxuICAgICdvZGYnOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5mb3JtdWxhJyxcclxuICAgICdvZGcnOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5ncmFwaGljcycsXHJcbiAgICAnb2RpJzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuaW1hZ2UnLFxyXG4gICAgJ29kbSc6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtbWFzdGVyJyxcclxuICAgICdvZHAnOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5wcmVzZW50YXRpb24nLFxyXG4gICAgJ29kcyc6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnNwcmVhZHNoZWV0JyxcclxuICAgICdvZHQnOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0JyxcclxuICAgICdvdGcnOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5ncmFwaGljcy10ZW1wbGF0ZScsXHJcbiAgICAnb3RwJzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQucHJlc2VudGF0aW9uLXRlbXBsYXRlJyxcclxuICAgICdvdHMnOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5zcHJlYWRzaGVldC10ZW1wbGF0ZScsXHJcbiAgICAnb3R0JzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dC10ZW1wbGF0ZScsXHJcbiAgICAncHB0JzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50JyxcclxuICAgICdwcHR4JzogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5wcmVzZW50YXRpb24nLFxyXG4gICAgJ3hscyc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxyXG4gICAgJ3hsc3gnOiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXQnXHJcbn07XHJcbiIsIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5pbXBvcnQge199IGZyb20gXCJtZXRlb3IvdW5kZXJzY29yZVwiO1xyXG5pbXBvcnQge01ldGVvcn0gZnJvbSBcIm1ldGVvci9tZXRlb3JcIjtcclxuaW1wb3J0IHtXZWJBcHB9IGZyb20gXCJtZXRlb3Ivd2ViYXBwXCI7XHJcbmltcG9ydCB7VXBsb2FkRlN9IGZyb20gXCIuL3Vmc1wiO1xyXG5cclxuXHJcbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcclxuXHJcbiAgICBjb25zdCBkb21haW4gPSBOcG0ucmVxdWlyZSgnZG9tYWluJyk7XHJcbiAgICBjb25zdCBmcyA9IE5wbS5yZXF1aXJlKCdmcycpO1xyXG4gICAgY29uc3QgaHR0cCA9IE5wbS5yZXF1aXJlKCdodHRwJyk7XHJcbiAgICBjb25zdCBodHRwcyA9IE5wbS5yZXF1aXJlKCdodHRwcycpO1xyXG4gICAgY29uc3QgbWtkaXJwID0gTnBtLnJlcXVpcmUoJ21rZGlycCcpO1xyXG4gICAgY29uc3Qgc3RyZWFtID0gTnBtLnJlcXVpcmUoJ3N0cmVhbScpO1xyXG4gICAgY29uc3QgVVJMID0gTnBtLnJlcXVpcmUoJ3VybCcpO1xyXG4gICAgY29uc3QgemxpYiA9IE5wbS5yZXF1aXJlKCd6bGliJyk7XHJcblxyXG5cclxuICAgIE1ldGVvci5zdGFydHVwKCgpID0+IHtcclxuICAgICAgICBsZXQgcGF0aCA9IFVwbG9hZEZTLmNvbmZpZy50bXBEaXI7XHJcbiAgICAgICAgbGV0IG1vZGUgPSBVcGxvYWRGUy5jb25maWcudG1wRGlyUGVybWlzc2lvbnM7XHJcblxyXG4gICAgICAgIGZzLnN0YXQocGF0aCwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIHRlbXAgZGlyZWN0b3J5XHJcbiAgICAgICAgICAgICAgICBta2RpcnAocGF0aCwge21vZGU6IG1vZGV9LCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGB1ZnM6IGNhbm5vdCBjcmVhdGUgdGVtcCBkaXJlY3RvcnkgYXQgXCIke3BhdGh9XCIgKCR7ZXJyLm1lc3NhZ2V9KWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGB1ZnM6IHRlbXAgZGlyZWN0b3J5IGNyZWF0ZWQgYXQgXCIke3BhdGh9XCJgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFNldCBkaXJlY3RvcnkgcGVybWlzc2lvbnNcclxuICAgICAgICAgICAgICAgIGZzLmNobW9kKHBhdGgsIG1vZGUsIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlcnIgJiYgY29uc29sZS5lcnJvcihgdWZzOiBjYW5ub3Qgc2V0IHRlbXAgZGlyZWN0b3J5IHBlcm1pc3Npb25zICR7bW9kZX0gKCR7ZXJyLm1lc3NhZ2V9KWApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkb21haW4gdG8gaGFuZGxlIGVycm9yc1xyXG4gICAgLy8gYW5kIHBvc3NpYmx5IGF2b2lkIHNlcnZlciBjcmFzaGVzLlxyXG4gICAgbGV0IGQgPSBkb21haW4uY3JlYXRlKCk7XHJcblxyXG4gICAgZC5vbignZXJyb3InLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcigndWZzOiAnICsgZXJyLm1lc3NhZ2UpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTGlzdGVuIEhUVFAgcmVxdWVzdHMgdG8gc2VydmUgZmlsZXNcclxuICAgIFdlYkFwcC5jb25uZWN0SGFuZGxlcnMudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG4gICAgICAgIC8vIFF1aWNrIGNoZWNrIHRvIHNlZSBpZiByZXF1ZXN0IHNob3VsZCBiZSBjYXRjaFxyXG4gICAgICAgIGlmIChyZXEudXJsLmluZGV4T2YoVXBsb2FkRlMuY29uZmlnLnN0b3Jlc1BhdGgpID09PSAtMSkge1xyXG4gICAgICAgICAgICBuZXh0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBzdG9yZSBwYXRoXHJcbiAgICAgICAgbGV0IHBhcnNlZFVybCA9IFVSTC5wYXJzZShyZXEudXJsKTtcclxuICAgICAgICBsZXQgcGF0aCA9IHBhcnNlZFVybC5wYXRobmFtZS5zdWJzdHIoVXBsb2FkRlMuY29uZmlnLnN0b3Jlc1BhdGgubGVuZ3RoICsgMSk7XHJcblxyXG4gICAgICAgIGxldCBhbGxvd0NPUlMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIHJlcS5oZWFkZXJzLm9yaWdpbik7XHJcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCIsIFwiUE9TVFwiKTtcclxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiLCBcIipcIik7XHJcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCIsIFwiQ29udGVudC1UeXBlXCIpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSBcIk9QVElPTlNcIikge1xyXG4gICAgICAgICAgICBsZXQgcmVnRXhwID0gbmV3IFJlZ0V4cCgnXlxcLyhbXlxcL1xcP10rKVxcLyhbXlxcL1xcP10rKSQnKTtcclxuICAgICAgICAgICAgbGV0IG1hdGNoID0gcmVnRXhwLmV4ZWMocGF0aCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXF1ZXN0IGlzIG5vdCB2YWxpZFxyXG4gICAgICAgICAgICBpZiAobWF0Y2ggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gR2V0IHN0b3JlXHJcbiAgICAgICAgICAgIGxldCBzdG9yZSA9IFVwbG9hZEZTLmdldFN0b3JlKG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgaWYgKCFzdG9yZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBhIHN0b3JlIGlzIGZvdW5kLCBnbyBhaGVhZCBhbmQgYWxsb3cgdGhlIG9yaWdpblxyXG4gICAgICAgICAgICBhbGxvd0NPUlMoKTtcclxuXHJcbiAgICAgICAgICAgIG5leHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnKSB7XHJcbiAgICAgICAgICAgIC8vIEdldCBzdG9yZVxyXG4gICAgICAgICAgICBsZXQgcmVnRXhwID0gbmV3IFJlZ0V4cCgnXlxcLyhbXlxcL1xcP10rKVxcLyhbXlxcL1xcP10rKSQnKTtcclxuICAgICAgICAgICAgbGV0IG1hdGNoID0gcmVnRXhwLmV4ZWMocGF0aCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXF1ZXN0IGlzIG5vdCB2YWxpZFxyXG4gICAgICAgICAgICBpZiAobWF0Y2ggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDAwKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gR2V0IHN0b3JlXHJcbiAgICAgICAgICAgIGxldCBzdG9yZSA9IFVwbG9hZEZTLmdldFN0b3JlKG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgaWYgKCFzdG9yZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBhIHN0b3JlIGlzIGZvdW5kLCBnbyBhaGVhZCBhbmQgYWxsb3cgdGhlIG9yaWdpblxyXG4gICAgICAgICAgICBhbGxvd0NPUlMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEdldCBmaWxlXHJcbiAgICAgICAgICAgIGxldCBmaWxlSWQgPSBtYXRjaFsyXTtcclxuICAgICAgICAgICAgaWYgKHN0b3JlLmdldENvbGxlY3Rpb24oKS5maW5kKHtfaWQ6IGZpbGVJZH0pLmNvdW50KCkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDA0KTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgdXBsb2FkIHRva2VuXHJcbiAgICAgICAgICAgIGlmICghc3RvcmUuY2hlY2tUb2tlbihyZXEucXVlcnkudG9rZW4sIGZpbGVJZCkpIHtcclxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDAzKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHRtcEZpbGUgPSBVcGxvYWRGUy5nZXRUZW1wRmlsZVBhdGgoZmlsZUlkKTtcclxuICAgICAgICAgICAgbGV0IHdzID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0odG1wRmlsZSwge2ZsYWdzOiAnYSd9KTtcclxuICAgICAgICAgICAgbGV0IGZpZWxkcyA9IHt1cGxvYWRpbmc6IHRydWV9O1xyXG4gICAgICAgICAgICBsZXQgcHJvZ3Jlc3MgPSBwYXJzZUZsb2F0KHJlcS5xdWVyeS5wcm9ncmVzcyk7XHJcbiAgICAgICAgICAgIGlmICghaXNOYU4ocHJvZ3Jlc3MpICYmIHByb2dyZXNzID4gMCkge1xyXG4gICAgICAgICAgICAgICAgZmllbGRzLnByb2dyZXNzID0gTWF0aC5taW4ocHJvZ3Jlc3MsIDEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXEub24oJ2RhdGEnLCAoY2h1bmspID0+IHtcclxuICAgICAgICAgICAgICAgIHdzLndyaXRlKGNodW5rKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJlcS5vbignZXJyb3InLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXEub24oJ2VuZCcsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGNvbXBsZXRlZCBzdGF0ZSB3aXRob3V0IHRyaWdnZXJpbmcgaG9va3NcclxuICAgICAgICAgICAgICAgIHN0b3JlLmdldENvbGxlY3Rpb24oKS5kaXJlY3QudXBkYXRlKHtfaWQ6IGZpbGVJZH0sIHskc2V0OiBmaWVsZHN9KTtcclxuICAgICAgICAgICAgICAgIHdzLmVuZCgpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIHdzLm9uKCdlcnJvcicsIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHVmczogY2Fubm90IHdyaXRlIGNodW5rIG9mIGZpbGUgXCIke2ZpbGVJZH1cIiAoJHtlcnIubWVzc2FnZX0pYCk7XHJcbiAgICAgICAgICAgICAgICBmcy51bmxpbmsodG1wRmlsZSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGVyciAmJiBjb25zb2xlLmVycm9yKGB1ZnM6IGNhbm5vdCBkZWxldGUgdGVtcCBmaWxlIFwiJHt0bXBGaWxlfVwiICgke2Vyci5tZXNzYWdlfSlgKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgd3Mub24oJ2ZpbmlzaCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoMjA0LCB7XCJDb250ZW50LVR5cGVcIjogJ3RleHQvcGxhaW4nfSk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChyZXEubWV0aG9kID09PSAnR0VUJykge1xyXG4gICAgICAgICAgICAvLyBHZXQgc3RvcmUsIGZpbGUgSWQgYW5kIGZpbGUgbmFtZVxyXG4gICAgICAgICAgICBsZXQgcmVnRXhwID0gbmV3IFJlZ0V4cCgnXlxcLyhbXlxcL1xcP10rKVxcLyhbXlxcL1xcP10rKSg/OlxcLyhbXlxcL1xcP10rKSk/JCcpO1xyXG4gICAgICAgICAgICBsZXQgbWF0Y2ggPSByZWdFeHAuZXhlYyhwYXRoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEF2b2lkIDUwNCBHYXRld2F5IHRpbWVvdXQgZXJyb3JcclxuICAgICAgICAgICAgLy8gaWYgZmlsZSBpcyBub3QgaGFuZGxlZCBieSBVcGxvYWRGUy5cclxuICAgICAgICAgICAgaWYgKG1hdGNoID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBuZXh0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEdldCBzdG9yZVxyXG4gICAgICAgICAgICBjb25zdCBzdG9yZU5hbWUgPSBtYXRjaFsxXTtcclxuICAgICAgICAgICAgY29uc3Qgc3RvcmUgPSBVcGxvYWRGUy5nZXRTdG9yZShzdG9yZU5hbWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzdG9yZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc3RvcmUub25SZWFkICE9PSBudWxsICYmIHN0b3JlLm9uUmVhZCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBzdG9yZS5vblJlYWQgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHVmczogU3RvcmUub25SZWFkIGlzIG5vdCBhIGZ1bmN0aW9uIGluIHN0b3JlIFwiJHtzdG9yZU5hbWV9XCJgKTtcclxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGZpbGUgZXh0ZW5zaW9uIGZyb20gZmlsZSBJZFxyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBtYXRjaFsyXS5pbmRleE9mKCcuJyk7XHJcbiAgICAgICAgICAgIGxldCBmaWxlSWQgPSBpbmRleCAhPT0gLTEgPyBtYXRjaFsyXS5zdWJzdHIoMCwgaW5kZXgpIDogbWF0Y2hbMl07XHJcblxyXG4gICAgICAgICAgICAvLyBHZXQgZmlsZSBmcm9tIGRhdGFiYXNlXHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBzdG9yZS5nZXRDb2xsZWN0aW9uKCkuZmluZE9uZSh7X2lkOiBmaWxlSWR9KTtcclxuICAgICAgICAgICAgaWYgKCFmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFNpbXVsYXRlIHJlYWQgc3BlZWRcclxuICAgICAgICAgICAgaWYgKFVwbG9hZEZTLmNvbmZpZy5zaW11bGF0ZVJlYWREZWxheSkge1xyXG4gICAgICAgICAgICAgICAgTWV0ZW9yLl9zbGVlcEZvck1zKFVwbG9hZEZTLmNvbmZpZy5zaW11bGF0ZVJlYWREZWxheSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGQucnVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBmaWxlIGNhbiBiZSBhY2Nlc3NlZFxyXG4gICAgICAgICAgICAgICAgaWYgKHN0b3JlLm9uUmVhZC5jYWxsKHN0b3JlLCBmaWxlSWQsIGZpbGUsIHJlcSwgcmVzKSAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdGF0dXMgPSAyMDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFByZXBhcmUgcmVzcG9uc2UgaGVhZGVyc1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBoZWFkZXJzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogZmlsZS50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBmaWxlLnNpemVcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgRVRhZyBoZWFkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGZpbGUuZXRhZyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snRVRhZyddID0gZmlsZS5ldGFnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIExhc3QtTW9kaWZpZWQgaGVhZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUubW9kaWZpZWRBdCBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snTGFzdC1Nb2RpZmllZCddID0gZmlsZS5tb2RpZmllZEF0LnRvVVRDU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZpbGUudXBsb2FkZWRBdCBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snTGFzdC1Nb2RpZmllZCddID0gZmlsZS51cGxvYWRlZEF0LnRvVVRDU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBQYXJzZSByZXF1ZXN0IGhlYWRlcnNcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcS5oZWFkZXJzID09PSAnb2JqZWN0Jykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBFVGFnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXEuaGVhZGVyc1snaWYtbm9uZS1tYXRjaCddKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZS5ldGFnID09PSByZXEuaGVhZGVyc1snaWYtbm9uZS1tYXRjaCddKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCgzMDQpOyAvLyBOb3QgTW9kaWZpZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21wYXJlIGZpbGUgbW9kaWZpY2F0aW9uIGRhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcS5oZWFkZXJzWydpZi1tb2RpZmllZC1zaW5jZSddKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb2RpZmllZFNpbmNlID0gbmV3IERhdGUocmVxLmhlYWRlcnNbJ2lmLW1vZGlmaWVkLXNpbmNlJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgoZmlsZS5tb2RpZmllZEF0IGluc3RhbmNlb2YgRGF0ZSAmJiBmaWxlLm1vZGlmaWVkQXQgPiBtb2RpZmllZFNpbmNlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IGZpbGUudXBsb2FkZWRBdCBpbnN0YW5jZW9mIERhdGUgJiYgZmlsZS51cGxvYWRlZEF0ID4gbW9kaWZpZWRTaW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoMzA0KTsgLy8gTm90IE1vZGlmaWVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3VwcG9ydCByYW5nZSByZXF1ZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVxLmhlYWRlcnMucmFuZ2UgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByYW5nZSA9IHJlcS5oZWFkZXJzLnJhbmdlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJhbmdlIGlzIG5vdCB2YWxpZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDE2KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvdGFsID0gZmlsZS5zaXplO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5pdCA9IHJhbmdlLnN1YnN0cigwLCByYW5nZS5pbmRleE9mKFwiPVwiKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVuaXQgIT09IFwiYnl0ZXNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDE2KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhbmdlcyA9IHJhbmdlLnN1YnN0cih1bml0Lmxlbmd0aCkucmVwbGFjZSgvW14wLTlcXC0sXS8sICcnKS5zcGxpdCgnLCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyYW5nZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdG9kbzogc3VwcG9ydCBtdWx0aXBhcnQgcmFuZ2VzOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVFRQL1JhbmdlX3JlcXVlc3RzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHIgPSByYW5nZXNbMF0uc3BsaXQoXCItXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gcGFyc2VJbnQoclswXSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHJbMV0gPyBwYXJzZUludChyWzFdLCAxMCkgOiB0b3RhbCAtIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJhbmdlIGlzIG5vdCB2YWxpZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGFydCA8IDAgfHwgZW5kID49IHRvdGFsIHx8IHN0YXJ0ID4gZW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDE2KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgaGVhZGVyc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtUmFuZ2UnXSA9IGBieXRlcyAke3N0YXJ0fS0ke2VuZH0vJHt0b3RhbH1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtTGVuZ3RoJ10gPSBlbmQgLSBzdGFydCArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5zdGFydCA9IHN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZW5kID0gZW5kO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gMjA2OyAvLyBwYXJ0aWFsIGNvbnRlbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0FjY2VwdC1SYW5nZXMnXSA9IFwiYnl0ZXNcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9wZW4gdGhlIGZpbGUgc3RyZWFtXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcnMgPSBzdG9yZS5nZXRSZWFkU3RyZWFtKGZpbGVJZCwgZmlsZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd3MgPSBuZXcgc3RyZWFtLlBhc3NUaHJvdWdoKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJzLm9uKCdlcnJvcicsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9yZS5vblJlYWRFcnJvci5jYWxsKHN0b3JlLCBlcnIsIGZpbGVJZCwgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgd3Mub24oJ2Vycm9yJywgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlLm9uUmVhZEVycm9yLmNhbGwoc3RvcmUsIGVyciwgZmlsZUlkLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgICAgICB3cy5vbignY2xvc2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsb3NlIG91dHB1dCBzdHJlYW0gYXQgdGhlIGVuZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3cy5lbWl0KCdlbmQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJhbnNmb3JtIHN0cmVhbVxyXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlLnRyYW5zZm9ybVJlYWQocnMsIHdzLCBmaWxlSWQsIGZpbGUsIHJlcSwgaGVhZGVycyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFBhcnNlIHJlcXVlc3QgaGVhZGVyc1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVxLmhlYWRlcnMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbXByZXNzIGRhdGEgdXNpbmcgaWYgbmVlZGVkIChpZ25vcmUgYXVkaW8vdmlkZW8gYXMgdGhleSBhcmUgYWxyZWFkeSBjb21wcmVzc2VkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcS5oZWFkZXJzWydhY2NlcHQtZW5jb2RpbmcnXSA9PT0gJ3N0cmluZycgJiYgIS9eKGF1ZGlvfHZpZGVvKS8udGVzdChmaWxlLnR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYWNjZXB0ID0gcmVxLmhlYWRlcnNbJ2FjY2VwdC1lbmNvZGluZyddO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbXByZXNzIHdpdGggZ3ppcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFjY2VwdC5tYXRjaCgvXFxiZ3ppcFxcYi8pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snQ29udGVudC1FbmNvZGluZyddID0gJ2d6aXAnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBoZWFkZXJzWydDb250ZW50LUxlbmd0aCddO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoc3RhdHVzLCBoZWFkZXJzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cy5waXBlKHpsaWIuY3JlYXRlR3ppcCgpKS5waXBlKHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tcHJlc3Mgd2l0aCBkZWZsYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhY2NlcHQubWF0Y2goL1xcYmRlZmxhdGVcXGIvKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtRW5jb2RpbmcnXSA9ICdkZWZsYXRlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgaGVhZGVyc1snQ29udGVudC1MZW5ndGgnXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHN0YXR1cywgaGVhZGVycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3MucGlwZSh6bGliLmNyZWF0ZURlZmxhdGUoKSkucGlwZShyZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2VuZCByYXcgZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaGVhZGVyc1snQ29udGVudC1FbmNvZGluZyddKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoc3RhdHVzLCBoZWFkZXJzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd3MucGlwZShyZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbmV4dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcbiIsIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5pbXBvcnQge199IGZyb20gXCJtZXRlb3IvdW5kZXJzY29yZVwiO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBTdG9yZSBwZXJtaXNzaW9uc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFN0b3JlUGVybWlzc2lvbnMge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgICAvLyBEZWZhdWx0IG9wdGlvbnNcclxuICAgICAgICBvcHRpb25zID0gXy5leHRlbmQoe1xyXG4gICAgICAgICAgICBpbnNlcnQ6IG51bGwsXHJcbiAgICAgICAgICAgIHJlbW92ZTogbnVsbCxcclxuICAgICAgICAgICAgdXBkYXRlOiBudWxsXHJcbiAgICAgICAgfSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIG9wdGlvbnNcclxuICAgICAgICBpZiAob3B0aW9ucy5pbnNlcnQgJiYgdHlwZW9mIG9wdGlvbnMuaW5zZXJ0ICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdG9yZVBlcm1pc3Npb25zOiBpbnNlcnQgaXMgbm90IGEgZnVuY3Rpb25cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLnJlbW92ZSAmJiB0eXBlb2Ygb3B0aW9ucy5yZW1vdmUgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN0b3JlUGVybWlzc2lvbnM6IHJlbW92ZSBpcyBub3QgYSBmdW5jdGlvblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMudXBkYXRlICYmIHR5cGVvZiBvcHRpb25zLnVwZGF0ZSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3RvcmVQZXJtaXNzaW9uczogdXBkYXRlIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUHVibGljIGF0dHJpYnV0ZXNcclxuICAgICAgICB0aGlzLmFjdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGluc2VydDogb3B0aW9ucy5pbnNlcnQsXHJcbiAgICAgICAgICAgIHJlbW92ZTogb3B0aW9ucy5yZW1vdmUsXHJcbiAgICAgICAgICAgIHVwZGF0ZTogb3B0aW9ucy51cGRhdGUsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB0aGUgcGVybWlzc2lvbiBmb3IgdGhlIGFjdGlvblxyXG4gICAgICogQHBhcmFtIGFjdGlvblxyXG4gICAgICogQHBhcmFtIHVzZXJJZFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqIEBwYXJhbSBmaWVsZHNcclxuICAgICAqIEBwYXJhbSBtb2RpZmllcnNcclxuICAgICAqIEByZXR1cm4geyp9XHJcbiAgICAgKi9cclxuICAgIGNoZWNrKGFjdGlvbiwgdXNlcklkLCBmaWxlLCBmaWVsZHMsIG1vZGlmaWVycykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5hY3Rpb25zW2FjdGlvbl0gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0aW9uc1thY3Rpb25dKHVzZXJJZCwgZmlsZSwgZmllbGRzLCBtb2RpZmllcnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gYnkgZGVmYXVsdCBhbGxvdyBhbGxcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB0aGUgaW5zZXJ0IHBlcm1pc3Npb25cclxuICAgICAqIEBwYXJhbSB1c2VySWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKiBAcmV0dXJucyB7Kn1cclxuICAgICAqL1xyXG4gICAgY2hlY2tJbnNlcnQodXNlcklkLCBmaWxlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soJ2luc2VydCcsIHVzZXJJZCwgZmlsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgdGhlIHJlbW92ZSBwZXJtaXNzaW9uXHJcbiAgICAgKiBAcGFyYW0gdXNlcklkXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgKi9cclxuICAgIGNoZWNrUmVtb3ZlKHVzZXJJZCwgZmlsZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNoZWNrKCdyZW1vdmUnLCB1c2VySWQsIGZpbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIHRoZSB1cGRhdGUgcGVybWlzc2lvblxyXG4gICAgICogQHBhcmFtIHVzZXJJZFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqIEBwYXJhbSBmaWVsZHNcclxuICAgICAqIEBwYXJhbSBtb2RpZmllcnNcclxuICAgICAqIEByZXR1cm5zIHsqfVxyXG4gICAgICovXHJcbiAgICBjaGVja1VwZGF0ZSh1c2VySWQsIGZpbGUsIGZpZWxkcywgbW9kaWZpZXJzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soJ3VwZGF0ZScsIHVzZXJJZCwgZmlsZSwgZmllbGRzLCBtb2RpZmllcnMpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5pbXBvcnQge199IGZyb20gXCJtZXRlb3IvdW5kZXJzY29yZVwiO1xyXG5pbXBvcnQge2NoZWNrfSBmcm9tIFwibWV0ZW9yL2NoZWNrXCI7XHJcbmltcG9ydCB7TWV0ZW9yfSBmcm9tIFwibWV0ZW9yL21ldGVvclwiO1xyXG5pbXBvcnQge01vbmdvfSBmcm9tIFwibWV0ZW9yL21vbmdvXCI7XHJcbmltcG9ydCB7VXBsb2FkRlN9IGZyb20gXCIuL3Vmc1wiO1xyXG5pbXBvcnQge0ZpbHRlcn0gZnJvbSBcIi4vdWZzLWZpbHRlclwiO1xyXG5pbXBvcnQge1N0b3JlUGVybWlzc2lvbnN9IGZyb20gXCIuL3Vmcy1zdG9yZS1wZXJtaXNzaW9uc1wiO1xyXG5pbXBvcnQge1Rva2Vuc30gZnJvbSBcIi4vdWZzLXRva2Vuc1wiO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBGaWxlIHN0b3JlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU3RvcmUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vIERlZmF1bHQgb3B0aW9uc1xyXG4gICAgICAgIG9wdGlvbnMgPSBfLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IG51bGwsXHJcbiAgICAgICAgICAgIGZpbHRlcjogbnVsbCxcclxuICAgICAgICAgICAgbmFtZTogbnVsbCxcclxuICAgICAgICAgICAgb25Db3B5RXJyb3I6IHRoaXMub25Db3B5RXJyb3IsXHJcbiAgICAgICAgICAgIG9uRmluaXNoVXBsb2FkOiB0aGlzLm9uRmluaXNoVXBsb2FkLFxyXG4gICAgICAgICAgICBvblJlYWQ6IHRoaXMub25SZWFkLFxyXG4gICAgICAgICAgICBvblJlYWRFcnJvcjogdGhpcy5vblJlYWRFcnJvcixcclxuICAgICAgICAgICAgb25WYWxpZGF0ZTogdGhpcy5vblZhbGlkYXRlLFxyXG4gICAgICAgICAgICBvbldyaXRlRXJyb3I6IHRoaXMub25Xcml0ZUVycm9yLFxyXG4gICAgICAgICAgICBwZXJtaXNzaW9uczogbnVsbCxcclxuICAgICAgICAgICAgdHJhbnNmb3JtUmVhZDogbnVsbCxcclxuICAgICAgICAgICAgdHJhbnNmb3JtV3JpdGU6IG51bGxcclxuICAgICAgICB9LCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgb3B0aW9uc1xyXG4gICAgICAgIGlmICghKG9wdGlvbnMuY29sbGVjdGlvbiBpbnN0YW5jZW9mIE1vbmdvLkNvbGxlY3Rpb24pKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiBjb2xsZWN0aW9uIGlzIG5vdCBhIE1vbmdvLkNvbGxlY3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuZmlsdGVyICYmICEob3B0aW9ucy5maWx0ZXIgaW5zdGFuY2VvZiBGaWx0ZXIpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiBmaWx0ZXIgaXMgbm90IGEgVXBsb2FkRlMuRmlsdGVyJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5uYW1lICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdG9yZTogbmFtZSBpcyBub3QgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFVwbG9hZEZTLmdldFN0b3JlKG9wdGlvbnMubmFtZSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IG5hbWUgYWxyZWFkeSBleGlzdHMnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMub25Db3B5RXJyb3IgJiYgdHlwZW9mIG9wdGlvbnMub25Db3B5RXJyb3IgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IG9uQ29weUVycm9yIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLm9uRmluaXNoVXBsb2FkICYmIHR5cGVvZiBvcHRpb25zLm9uRmluaXNoVXBsb2FkICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiBvbkZpbmlzaFVwbG9hZCBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5vblJlYWQgJiYgdHlwZW9mIG9wdGlvbnMub25SZWFkICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiBvblJlYWQgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMub25SZWFkRXJyb3IgJiYgdHlwZW9mIG9wdGlvbnMub25SZWFkRXJyb3IgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IG9uUmVhZEVycm9yIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLm9uV3JpdGVFcnJvciAmJiB0eXBlb2Ygb3B0aW9ucy5vbldyaXRlRXJyb3IgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IG9uV3JpdGVFcnJvciBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5wZXJtaXNzaW9ucyAmJiAhKG9wdGlvbnMucGVybWlzc2lvbnMgaW5zdGFuY2VvZiBTdG9yZVBlcm1pc3Npb25zKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdG9yZTogcGVybWlzc2lvbnMgaXMgbm90IGEgVXBsb2FkRlMuU3RvcmVQZXJtaXNzaW9ucycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy50cmFuc2Zvcm1SZWFkICYmIHR5cGVvZiBvcHRpb25zLnRyYW5zZm9ybVJlYWQgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IHRyYW5zZm9ybVJlYWQgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMudHJhbnNmb3JtV3JpdGUgJiYgdHlwZW9mIG9wdGlvbnMudHJhbnNmb3JtV3JpdGUgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IHRyYW5zZm9ybVdyaXRlIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLm9uVmFsaWRhdGUgJiYgdHlwZW9mIG9wdGlvbnMub25WYWxpZGF0ZSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdG9yZTogb25WYWxpZGF0ZSBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUHVibGljIGF0dHJpYnV0ZXNcclxuICAgICAgICBzZWxmLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIHNlbGYucGVybWlzc2lvbnMgPSBvcHRpb25zLnBlcm1pc3Npb25zO1xyXG4gICAgICAgIF8uZWFjaChbXHJcbiAgICAgICAgICAgICdvbkNvcHlFcnJvcicsXHJcbiAgICAgICAgICAgICdvbkZpbmlzaFVwbG9hZCcsXHJcbiAgICAgICAgICAgICdvblJlYWQnLFxyXG4gICAgICAgICAgICAnb25SZWFkRXJyb3InLFxyXG4gICAgICAgICAgICAnb25Xcml0ZUVycm9yJyxcclxuICAgICAgICAgICAgJ29uVmFsaWRhdGUnXHJcbiAgICAgICAgXSwgKG1ldGhvZCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnNbbWV0aG9kXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgc2VsZlttZXRob2RdID0gb3B0aW9uc1ttZXRob2RdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgc3RvcmUgdG8gdGhlIGxpc3RcclxuICAgICAgICBVcGxvYWRGUy5hZGRTdG9yZShzZWxmKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IGRlZmF1bHQgcGVybWlzc2lvbnNcclxuICAgICAgICBpZiAoIShzZWxmLnBlcm1pc3Npb25zIGluc3RhbmNlb2YgU3RvcmVQZXJtaXNzaW9ucykpIHtcclxuICAgICAgICAgICAgLy8gVXNlcyBjdXN0b20gZGVmYXVsdCBwZXJtaXNzaW9ucyBvciBVRlMgZGVmYXVsdCBwZXJtaXNzaW9uc1xyXG4gICAgICAgICAgICBpZiAoVXBsb2FkRlMuY29uZmlnLmRlZmF1bHRTdG9yZVBlcm1pc3Npb25zIGluc3RhbmNlb2YgU3RvcmVQZXJtaXNzaW9ucykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5wZXJtaXNzaW9ucyA9IFVwbG9hZEZTLmNvbmZpZy5kZWZhdWx0U3RvcmVQZXJtaXNzaW9ucztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYucGVybWlzc2lvbnMgPSBuZXcgU3RvcmVQZXJtaXNzaW9ucygpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGB1ZnM6IHBlcm1pc3Npb25zIGFyZSBub3QgZGVmaW5lZCBmb3Igc3RvcmUgXCIke29wdGlvbnMubmFtZX1cImApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoTWV0ZW9yLmlzU2VydmVyKSB7XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogQ2hlY2tzIHRva2VuIHZhbGlkaXR5XHJcbiAgICAgICAgICAgICAqIEBwYXJhbSB0b2tlblxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgc2VsZi5jaGVja1Rva2VuID0gZnVuY3Rpb24gKHRva2VuLCBmaWxlSWQpIHtcclxuICAgICAgICAgICAgICAgIGNoZWNrKHRva2VuLCBTdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgY2hlY2soZmlsZUlkLCBTdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRva2Vucy5maW5kKHt2YWx1ZTogdG9rZW4sIGZpbGVJZDogZmlsZUlkfSkuY291bnQoKSA9PT0gMTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBDb3BpZXMgdGhlIGZpbGUgdG8gYSBzdG9yZVxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBzdG9yZVxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHNlbGYuY29weSA9IGZ1bmN0aW9uIChmaWxlSWQsIHN0b3JlLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgY2hlY2soZmlsZUlkLCBTdHJpbmcpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghKHN0b3JlIGluc3RhbmNlb2YgU3RvcmUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc3RvcmUgaXMgbm90IGFuIGluc3RhbmNlIG9mIFVwbG9hZEZTLlN0b3JlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgb3JpZ2luYWwgZmlsZVxyXG4gICAgICAgICAgICAgICAgbGV0IGZpbGUgPSBzZWxmLmdldENvbGxlY3Rpb24oKS5maW5kT25lKHtfaWQ6IGZpbGVJZH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignZmlsZS1ub3QtZm91bmQnLCAnRmlsZSBub3QgZm91bmQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFNpbGVudGx5IGlnbm9yZSB0aGUgZmlsZSBpZiBpdCBkb2VzIG5vdCBtYXRjaCBmaWx0ZXJcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbHRlciA9IHN0b3JlLmdldEZpbHRlcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlciBpbnN0YW5jZW9mIEZpbHRlciAmJiAhZmlsdGVyLmlzVmFsaWQoZmlsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUHJlcGFyZSBjb3B5XHJcbiAgICAgICAgICAgICAgICBsZXQgY29weSA9IF8ub21pdChmaWxlLCAnX2lkJywgJ3VybCcpO1xyXG4gICAgICAgICAgICAgICAgY29weS5vcmlnaW5hbFN0b3JlID0gc2VsZi5nZXROYW1lKCk7XHJcbiAgICAgICAgICAgICAgICBjb3B5Lm9yaWdpbmFsSWQgPSBmaWxlSWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBjb3B5XHJcbiAgICAgICAgICAgICAgICBsZXQgY29weUlkID0gc3RvcmUuY3JlYXRlKGNvcHkpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdldCBvcmlnaW5hbCBzdHJlYW1cclxuICAgICAgICAgICAgICAgIGxldCBycyA9IHNlbGYuZ2V0UmVhZFN0cmVhbShmaWxlSWQsIGZpbGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENhdGNoIGVycm9ycyB0byBhdm9pZCBhcHAgY3Jhc2hpbmdcclxuICAgICAgICAgICAgICAgIHJzLm9uKCdlcnJvcicsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgZXJyLCBudWxsKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDb3B5IGZpbGUgZGF0YVxyXG4gICAgICAgICAgICAgICAgc3RvcmUud3JpdGUocnMsIGNvcHlJZCwgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmdldENvbGxlY3Rpb24oKS5yZW1vdmUoe19pZDogY29weUlkfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub25Db3B5RXJyb3IuY2FsbChzZWxmLCBlcnIsIGZpbGVJZCwgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmLCBlcnIsIGNvcHlJZCwgY29weSwgc3RvcmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBDcmVhdGVzIHRoZSBmaWxlIGluIHRoZSBjb2xsZWN0aW9uXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBzZWxmLmNyZWF0ZSA9IGZ1bmN0aW9uIChmaWxlLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgY2hlY2soZmlsZSwgT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIGZpbGUuc3RvcmUgPSBzZWxmLm9wdGlvbnMubmFtZTsgLy8gYXNzaWduIHN0b3JlIHRvIGZpbGVcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldENvbGxlY3Rpb24oKS5pbnNlcnQoZmlsZSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIENyZWF0ZXMgYSB0b2tlbiBmb3IgdGhlIGZpbGUgKG9ubHkgbmVlZGVkIGZvciBjbGllbnQgc2lkZSB1cGxvYWQpXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAgICAgICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBzZWxmLmNyZWF0ZVRva2VuID0gZnVuY3Rpb24gKGZpbGVJZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRva2VuID0gc2VsZi5nZW5lcmF0ZVRva2VuKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdG9rZW4gZXhpc3RzXHJcbiAgICAgICAgICAgICAgICBpZiAoVG9rZW5zLmZpbmQoe2ZpbGVJZDogZmlsZUlkfSkuY291bnQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIFRva2Vucy51cGRhdGUoe2ZpbGVJZDogZmlsZUlkfSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2V0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdG9rZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBUb2tlbnMuaW5zZXJ0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogV3JpdGVzIHRoZSBmaWxlIHRvIHRoZSBzdG9yZVxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gcnNcclxuICAgICAgICAgICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHNlbGYud3JpdGUgPSBmdW5jdGlvbiAocnMsIGZpbGVJZCwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGxldCBmaWxlID0gc2VsZi5nZXRDb2xsZWN0aW9uKCkuZmluZE9uZSh7X2lkOiBmaWxlSWR9KTtcclxuICAgICAgICAgICAgICAgIGxldCB3cyA9IHNlbGYuZ2V0V3JpdGVTdHJlYW0oZmlsZUlkLCBmaWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgZXJyb3JIYW5kbGVyID0gTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRDb2xsZWN0aW9uKCkucmVtb3ZlKHtfaWQ6IGZpbGVJZH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25Xcml0ZUVycm9yLmNhbGwoc2VsZiwgZXJyLCBmaWxlSWQsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgZXJyKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHdzLm9uKCdlcnJvcicsIGVycm9ySGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgICB3cy5vbignZmluaXNoJywgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNpemUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZWFkU3RyZWFtID0gc2VsZi5nZXRSZWFkU3RyZWFtKGZpbGVJZCwgZmlsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWRTdHJlYW0ub24oJ2Vycm9yJywgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmLCBlcnJvciwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlYWRTdHJlYW0ub24oJ2RhdGEnLCBNZXRlb3IuYmluZEVudmlyb25tZW50KGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemUgKz0gZGF0YS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlYWRTdHJlYW0ub24oJ2VuZCcsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTZXQgZmlsZSBhdHRyaWJ1dGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5jb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuZXRhZyA9IFVwbG9hZEZTLmdlbmVyYXRlRXRhZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnBhdGggPSBzZWxmLmdldEZpbGVSZWxhdGl2ZVVSTChmaWxlSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5zaXplID0gc2l6ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS50b2tlbiA9IHNlbGYuZ2VuZXJhdGVUb2tlbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnVwbG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnVwbG9hZGVkQXQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnVybCA9IHNlbGYuZ2V0RmlsZVVSTChmaWxlSWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXhlY3V0ZSBjYWxsYmFja1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNlbGYub25GaW5pc2hVcGxvYWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub25GaW5pc2hVcGxvYWQuY2FsbChzZWxmLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2V0cyB0aGUgZmlsZSBVUkwgd2hlbiBmaWxlIHRyYW5zZmVyIGlzIGNvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHdheSwgdGhlIGltYWdlIHdpbGwgbG9hZHMgZW50aXJlbHkuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0Q29sbGVjdGlvbigpLmRpcmVjdC51cGRhdGUoe19pZDogZmlsZUlkfSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmaWxlLmNvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV0YWc6IGZpbGUuZXRhZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBmaWxlLnBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IGZpbGUucHJvZ3Jlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogZmlsZS5zaXplLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiBmaWxlLnRva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwbG9hZGluZzogZmlsZS51cGxvYWRpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBsb2FkZWRBdDogZmlsZS51cGxvYWRlZEF0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogZmlsZS51cmxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXR1cm4gZmlsZSBpbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgbnVsbCwgZmlsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTaW11bGF0ZSB3cml0ZSBzcGVlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoVXBsb2FkRlMuY29uZmlnLnNpbXVsYXRlV3JpdGVEZWxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWV0ZW9yLl9zbGVlcEZvck1zKFVwbG9hZEZTLmNvbmZpZy5zaW11bGF0ZVdyaXRlRGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IGZpbGUgdG8gb3RoZXIgc3RvcmVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm9wdGlvbnMuY29weVRvIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZi5vcHRpb25zLmNvcHlUby5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdG9yZSA9IHNlbGYub3B0aW9ucy5jb3B5VG9baV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc3RvcmUuZ2V0RmlsdGVyKCkgfHwgc3RvcmUuZ2V0RmlsdGVyKCkuaXNWYWxpZChmaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNvcHkoZmlsZUlkLCBzdG9yZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEV4ZWN1dGUgdHJhbnNmb3JtYXRpb25cclxuICAgICAgICAgICAgICAgIHNlbGYudHJhbnNmb3JtV3JpdGUocnMsIHdzLCBmaWxlSWQsIGZpbGUpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKE1ldGVvci5pc1NlcnZlcikge1xyXG4gICAgICAgICAgICBjb25zdCBmcyA9IE5wbS5yZXF1aXJlKCdmcycpO1xyXG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gc2VsZi5nZXRDb2xsZWN0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBDb2RlIGV4ZWN1dGVkIGFmdGVyIHJlbW92aW5nIGZpbGVcclxuICAgICAgICAgICAgY29sbGVjdGlvbi5hZnRlci5yZW1vdmUoZnVuY3Rpb24gKHVzZXJJZCwgZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGFzc29jaWF0ZWQgdG9rZW5zXHJcbiAgICAgICAgICAgICAgICBUb2tlbnMucmVtb3ZlKHtmaWxlSWQ6IGZpbGUuX2lkfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5jb3B5VG8gaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZi5vcHRpb25zLmNvcHlUby5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgY29waWVzIGluIHN0b3Jlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9wdGlvbnMuY29weVRvW2ldLmdldENvbGxlY3Rpb24oKS5yZW1vdmUoe29yaWdpbmFsSWQ6IGZpbGUuX2lkfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIENvZGUgZXhlY3V0ZWQgYmVmb3JlIGluc2VydGluZyBmaWxlXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uYmVmb3JlLmluc2VydChmdW5jdGlvbiAodXNlcklkLCBmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXNlbGYucGVybWlzc2lvbnMuY2hlY2tJbnNlcnQodXNlcklkLCBmaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ZvcmJpZGRlbicsIFwiRm9yYmlkZGVuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIENvZGUgZXhlY3V0ZWQgYmVmb3JlIHVwZGF0aW5nIGZpbGVcclxuICAgICAgICAgICAgY29sbGVjdGlvbi5iZWZvcmUudXBkYXRlKGZ1bmN0aW9uICh1c2VySWQsIGZpbGUsIGZpZWxkcywgbW9kaWZpZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXNlbGYucGVybWlzc2lvbnMuY2hlY2tVcGRhdGUodXNlcklkLCBmaWxlLCBmaWVsZHMsIG1vZGlmaWVycykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdmb3JiaWRkZW4nLCBcIkZvcmJpZGRlblwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBDb2RlIGV4ZWN1dGVkIGJlZm9yZSByZW1vdmluZyBmaWxlXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uYmVmb3JlLnJlbW92ZShmdW5jdGlvbiAodXNlcklkLCBmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXNlbGYucGVybWlzc2lvbnMuY2hlY2tSZW1vdmUodXNlcklkLCBmaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ZvcmJpZGRlbicsIFwiRm9yYmlkZGVuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIERlbGV0ZSB0aGUgcGh5c2ljYWwgZmlsZSBpbiB0aGUgc3RvcmVcclxuICAgICAgICAgICAgICAgIHNlbGYuZGVsZXRlKGZpbGUuX2lkKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdG1wRmlsZSA9IFVwbG9hZEZTLmdldFRlbXBGaWxlUGF0aChmaWxlLl9pZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRGVsZXRlIHRoZSB0ZW1wIGZpbGVcclxuICAgICAgICAgICAgICAgIGZzLnN0YXQodG1wRmlsZSwgZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICFlcnIgJiYgZnMudW5saW5rKHRtcEZpbGUsIGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyICYmIGNvbnNvbGUuZXJyb3IoYHVmczogY2Fubm90IGRlbGV0ZSB0ZW1wIGZpbGUgYXQgJHt0bXBGaWxlfSAoJHtlcnIubWVzc2FnZX0pYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVsZXRlcyBhIGZpbGUgYXN5bmNcclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICBkZWxldGUoZmlsZUlkLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZGVsZXRlIGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGVzIGEgcmFuZG9tIHRva2VuXHJcbiAgICAgKiBAcGFyYW0gcGF0dGVyblxyXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBnZW5lcmF0ZVRva2VuKHBhdHRlcm4pIHtcclxuICAgICAgICByZXR1cm4gKHBhdHRlcm4gfHwgJ3h5eHl4eXh5eHknKS5yZXBsYWNlKC9beHldL2csIChjKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMCwgdiA9IGMgPT09ICd4JyA/IHIgOiAociAmIDB4MyB8IDB4OCk7XHJcbiAgICAgICAgICAgIGxldCBzID0gdi50b1N0cmluZygxNik7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpID8gcy50b1VwcGVyQ2FzZSgpIDogcztcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGNvbGxlY3Rpb25cclxuICAgICAqIEByZXR1cm4ge01vbmdvLkNvbGxlY3Rpb259XHJcbiAgICAgKi9cclxuICAgIGdldENvbGxlY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5jb2xsZWN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZmlsZSBVUkxcclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEByZXR1cm4ge3N0cmluZ3xudWxsfVxyXG4gICAgICovXHJcbiAgICBnZXRGaWxlUmVsYXRpdmVVUkwoZmlsZUlkKSB7XHJcbiAgICAgICAgbGV0IGZpbGUgPSB0aGlzLmdldENvbGxlY3Rpb24oKS5maW5kT25lKGZpbGVJZCwge2ZpZWxkczoge25hbWU6IDF9fSk7XHJcbiAgICAgICAgcmV0dXJuIGZpbGUgPyB0aGlzLmdldFJlbGF0aXZlVVJMKGAke2ZpbGVJZH0vJHtmaWxlLm5hbWV9YCkgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZmlsZSBVUkxcclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEByZXR1cm4ge3N0cmluZ3xudWxsfVxyXG4gICAgICovXHJcbiAgICBnZXRGaWxlVVJMKGZpbGVJZCkge1xyXG4gICAgICAgIGxldCBmaWxlID0gdGhpcy5nZXRDb2xsZWN0aW9uKCkuZmluZE9uZShmaWxlSWQsIHtmaWVsZHM6IHtuYW1lOiAxfX0pO1xyXG4gICAgICAgIHJldHVybiBmaWxlID8gdGhpcy5nZXRVUkwoYCR7ZmlsZUlkfS8ke2ZpbGUubmFtZX1gKSA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBmaWxlIGZpbHRlclxyXG4gICAgICogQHJldHVybiB7VXBsb2FkRlMuRmlsdGVyfVxyXG4gICAgICovXHJcbiAgICBnZXRGaWx0ZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5maWx0ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzdG9yZSBuYW1lXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIGdldE5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5uYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZmlsZSByZWFkIHN0cmVhbVxyXG4gICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqL1xyXG4gICAgZ2V0UmVhZFN0cmVhbShmaWxlSWQsIGZpbGUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0b3JlLmdldFJlYWRTdHJlYW0gaXMgbm90IGltcGxlbWVudGVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzdG9yZSByZWxhdGl2ZSBVUkxcclxuICAgICAqIEBwYXJhbSBwYXRoXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIGdldFJlbGF0aXZlVVJMKHBhdGgpIHtcclxuICAgICAgICBjb25zdCByb290VXJsID0gTWV0ZW9yLmFic29sdXRlVXJsKCkucmVwbGFjZSgvXFwvKyQvLCAnJyk7XHJcbiAgICAgICAgY29uc3Qgcm9vdFBhdGggPSByb290VXJsLnJlcGxhY2UoL15bYS16XSs6XFwvXFwvW14vXStcXC8qL2dpLCAnJyk7XHJcbiAgICAgICAgY29uc3Qgc3RvcmVOYW1lID0gdGhpcy5nZXROYW1lKCk7XHJcbiAgICAgICAgcGF0aCA9IFN0cmluZyhwYXRoKS5yZXBsYWNlKC9cXC8kLywgJycpLnRyaW0oKTtcclxuICAgICAgICByZXR1cm4gZW5jb2RlVVJJKGAke3Jvb3RQYXRofS8ke1VwbG9hZEZTLmNvbmZpZy5zdG9yZXNQYXRofS8ke3N0b3JlTmFtZX0vJHtwYXRofWApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3RvcmUgYWJzb2x1dGUgVVJMXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBnZXRVUkwocGF0aCkge1xyXG4gICAgICAgIGNvbnN0IHJvb3RVcmwgPSBNZXRlb3IuYWJzb2x1dGVVcmwoe3NlY3VyZTogVXBsb2FkRlMuY29uZmlnLmh0dHBzfSkucmVwbGFjZSgvXFwvKyQvLCAnJyk7XHJcbiAgICAgICAgY29uc3Qgc3RvcmVOYW1lID0gdGhpcy5nZXROYW1lKCk7XHJcbiAgICAgICAgcGF0aCA9IFN0cmluZyhwYXRoKS5yZXBsYWNlKC9cXC8kLywgJycpLnRyaW0oKTtcclxuICAgICAgICByZXR1cm4gZW5jb2RlVVJJKGAke3Jvb3RVcmx9LyR7VXBsb2FkRlMuY29uZmlnLnN0b3Jlc1BhdGh9LyR7c3RvcmVOYW1lfS8ke3BhdGh9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBmaWxlIHdyaXRlIHN0cmVhbVxyXG4gICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqL1xyXG4gICAgZ2V0V3JpdGVTdHJlYW0oZmlsZUlkLCBmaWxlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdnZXRXcml0ZVN0cmVhbSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbXBsZXRlcyB0aGUgZmlsZSB1cGxvYWRcclxuICAgICAqIEBwYXJhbSB1cmxcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgaW1wb3J0RnJvbVVSTCh1cmwsIGZpbGUsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgTWV0ZW9yLmNhbGwoJ3Vmc0ltcG9ydFVSTCcsIHVybCwgZmlsZSwgdGhpcy5nZXROYW1lKCksIGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCB3aGVuIGEgY29weSBlcnJvciBoYXBwZW5lZFxyXG4gICAgICogQHBhcmFtIGVyclxyXG4gICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqL1xyXG4gICAgb25Db3B5RXJyb3IoZXJyLCBmaWxlSWQsIGZpbGUpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGB1ZnM6IGNhbm5vdCBjb3B5IGZpbGUgXCIke2ZpbGVJZH1cIiAoJHtlcnIubWVzc2FnZX0pYCwgZXJyKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCB3aGVuIGEgZmlsZSBoYXMgYmVlbiB1cGxvYWRlZFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqL1xyXG4gICAgb25GaW5pc2hVcGxvYWQoZmlsZSkge1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbGVkIHdoZW4gYSBmaWxlIGlzIHJlYWQgZnJvbSB0aGUgc3RvcmVcclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKiBAcGFyYW0gcmVxdWVzdFxyXG4gICAgICogQHBhcmFtIHJlc3BvbnNlXHJcbiAgICAgKiBAcmV0dXJuIGJvb2xlYW5cclxuICAgICAqL1xyXG4gICAgb25SZWFkKGZpbGVJZCwgZmlsZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCB3aGVuIGEgcmVhZCBlcnJvciBoYXBwZW5lZFxyXG4gICAgICogQHBhcmFtIGVyclxyXG4gICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqIEByZXR1cm4gYm9vbGVhblxyXG4gICAgICovXHJcbiAgICBvblJlYWRFcnJvcihlcnIsIGZpbGVJZCwgZmlsZSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHVmczogY2Fubm90IHJlYWQgZmlsZSBcIiR7ZmlsZUlkfVwiICgke2Vyci5tZXNzYWdlfSlgLCBlcnIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbGVkIHdoZW4gZmlsZSBpcyBiZWluZyB2YWxpZGF0ZWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKi9cclxuICAgIG9uVmFsaWRhdGUoZmlsZSkge1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbGVkIHdoZW4gYSB3cml0ZSBlcnJvciBoYXBwZW5lZFxyXG4gICAgICogQHBhcmFtIGVyclxyXG4gICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqIEByZXR1cm4gYm9vbGVhblxyXG4gICAgICovXHJcbiAgICBvbldyaXRlRXJyb3IoZXJyLCBmaWxlSWQsIGZpbGUpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGB1ZnM6IGNhbm5vdCB3cml0ZSBmaWxlIFwiJHtmaWxlSWR9XCIgKCR7ZXJyLm1lc3NhZ2V9KWAsIGVycik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBzdG9yZSBwZXJtaXNzaW9uc1xyXG4gICAgICogQHBhcmFtIHBlcm1pc3Npb25zXHJcbiAgICAgKi9cclxuICAgIHNldFBlcm1pc3Npb25zKHBlcm1pc3Npb25zKSB7XHJcbiAgICAgICAgaWYgKCEocGVybWlzc2lvbnMgaW5zdGFuY2VvZiBTdG9yZVBlcm1pc3Npb25zKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUGVybWlzc2lvbnMgaXMgbm90IGFuIGluc3RhbmNlIG9mIFVwbG9hZEZTLlN0b3JlUGVybWlzc2lvbnNcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGVybWlzc2lvbnMgPSBwZXJtaXNzaW9ucztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYW5zZm9ybXMgdGhlIGZpbGUgb24gcmVhZGluZ1xyXG4gICAgICogQHBhcmFtIHJlYWRTdHJlYW1cclxuICAgICAqIEBwYXJhbSB3cml0ZVN0cmVhbVxyXG4gICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqIEBwYXJhbSByZXF1ZXN0XHJcbiAgICAgKiBAcGFyYW0gaGVhZGVyc1xyXG4gICAgICovXHJcbiAgICB0cmFuc2Zvcm1SZWFkKHJlYWRTdHJlYW0sIHdyaXRlU3RyZWFtLCBmaWxlSWQsIGZpbGUsIHJlcXVlc3QsIGhlYWRlcnMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy50cmFuc2Zvcm1SZWFkID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50cmFuc2Zvcm1SZWFkLmNhbGwodGhpcywgcmVhZFN0cmVhbSwgd3JpdGVTdHJlYW0sIGZpbGVJZCwgZmlsZSwgcmVxdWVzdCwgaGVhZGVycyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVhZFN0cmVhbS5waXBlKHdyaXRlU3RyZWFtKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2Zvcm1zIHRoZSBmaWxlIG9uIHdyaXRpbmdcclxuICAgICAqIEBwYXJhbSByZWFkU3RyZWFtXHJcbiAgICAgKiBAcGFyYW0gd3JpdGVTdHJlYW1cclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKi9cclxuICAgIHRyYW5zZm9ybVdyaXRlKHJlYWRTdHJlYW0sIHdyaXRlU3RyZWFtLCBmaWxlSWQsIGZpbGUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy50cmFuc2Zvcm1Xcml0ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudHJhbnNmb3JtV3JpdGUuY2FsbCh0aGlzLCByZWFkU3RyZWFtLCB3cml0ZVN0cmVhbSwgZmlsZUlkLCBmaWxlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZWFkU3RyZWFtLnBpcGUod3JpdGVTdHJlYW0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFZhbGlkYXRlcyB0aGUgZmlsZVxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqL1xyXG4gICAgdmFsaWRhdGUoZmlsZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vblZhbGlkYXRlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25WYWxpZGF0ZShmaWxlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLypcclxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNyBLYXJsIFNURUlOXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxyXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxyXG4gKiBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcblxyXG5pbXBvcnQge1RlbXBsYXRlfSBmcm9tICdtZXRlb3IvdGVtcGxhdGluZyc7XHJcblxyXG5cclxubGV0IGlzTUlNRSA9IGZ1bmN0aW9uICh0eXBlLCBtaW1lKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnXHJcbiAgICAgICAgJiYgdHlwZW9mIG1pbWUgPT09ICdzdHJpbmcnXHJcbiAgICAgICAgJiYgbWltZS5pbmRleE9mKHR5cGUgKyAnLycpID09PSAwO1xyXG59O1xyXG5cclxuVGVtcGxhdGUucmVnaXN0ZXJIZWxwZXIoJ2lzQXBwbGljYXRpb24nLCBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgcmV0dXJuIGlzTUlNRSgnYXBwbGljYXRpb24nLCB0aGlzLnR5cGUgfHwgdHlwZSk7XHJcbn0pO1xyXG5cclxuVGVtcGxhdGUucmVnaXN0ZXJIZWxwZXIoJ2lzQXVkaW8nLCBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgcmV0dXJuIGlzTUlNRSgnYXVkaW8nLCB0aGlzLnR5cGUgfHwgdHlwZSk7XHJcbn0pO1xyXG5cclxuVGVtcGxhdGUucmVnaXN0ZXJIZWxwZXIoJ2lzSW1hZ2UnLCBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgcmV0dXJuIGlzTUlNRSgnaW1hZ2UnLCB0aGlzLnR5cGUgfHwgdHlwZSk7XHJcbn0pO1xyXG5cclxuVGVtcGxhdGUucmVnaXN0ZXJIZWxwZXIoJ2lzVGV4dCcsIGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICByZXR1cm4gaXNNSU1FKCd0ZXh0JywgdGhpcy50eXBlIHx8IHR5cGUpO1xyXG59KTtcclxuXHJcblRlbXBsYXRlLnJlZ2lzdGVySGVscGVyKCdpc1ZpZGVvJywgZnVuY3Rpb24gKHR5cGUpIHtcclxuICAgIHJldHVybiBpc01JTUUoJ3ZpZGVvJywgdGhpcy50eXBlIHx8IHR5cGUpO1xyXG59KTtcclxuIiwiLypcclxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNyBLYXJsIFNURUlOXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxyXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxyXG4gKiBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcblxyXG5pbXBvcnQge01vbmdvfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xyXG5cclxuLyoqXHJcbiAqIENvbGxlY3Rpb24gb2YgdXBsb2FkIHRva2Vuc1xyXG4gKiBAdHlwZSB7TW9uZ28uQ29sbGVjdGlvbn1cclxuICovXHJcbmV4cG9ydCBjb25zdCBUb2tlbnMgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbigndWZzVG9rZW5zJyk7XHJcbiIsIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtffSBmcm9tICdtZXRlb3IvdW5kZXJzY29yZSc7XHJcbmltcG9ydCB7TWV0ZW9yfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuaW1wb3J0IHtTdG9yZX0gZnJvbSAnLi91ZnMtc3RvcmUnO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBGaWxlIHVwbG9hZGVyXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVXBsb2FkZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vIFNldCBkZWZhdWx0IG9wdGlvbnNcclxuICAgICAgICBvcHRpb25zID0gXy5leHRlbmQoe1xyXG4gICAgICAgICAgICBhZGFwdGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgY2FwYWNpdHk6IDAuOSxcclxuICAgICAgICAgICAgY2h1bmtTaXplOiAxNiAqIDEwMjQsXHJcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXHJcbiAgICAgICAgICAgIGZpbGU6IG51bGwsXHJcbiAgICAgICAgICAgIG1heENodW5rU2l6ZTogNCAqIDEwMjQgKiAxMDAwLFxyXG4gICAgICAgICAgICBtYXhUcmllczogNSxcclxuICAgICAgICAgICAgb25BYm9ydDogdGhpcy5vbkFib3J0LFxyXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiB0aGlzLm9uQ29tcGxldGUsXHJcbiAgICAgICAgICAgIG9uQ3JlYXRlOiB0aGlzLm9uQ3JlYXRlLFxyXG4gICAgICAgICAgICBvbkVycm9yOiB0aGlzLm9uRXJyb3IsXHJcbiAgICAgICAgICAgIG9uUHJvZ3Jlc3M6IHRoaXMub25Qcm9ncmVzcyxcclxuICAgICAgICAgICAgb25TdGFydDogdGhpcy5vblN0YXJ0LFxyXG4gICAgICAgICAgICBvblN0b3A6IHRoaXMub25TdG9wLFxyXG4gICAgICAgICAgICByZXRyeURlbGF5OiAyMDAwLFxyXG4gICAgICAgICAgICBzdG9yZTogbnVsbCxcclxuICAgICAgICAgICAgdHJhbnNmZXJEZWxheTogMTAwXHJcbiAgICAgICAgfSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIG9wdGlvbnNcclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuYWRhcHRpdmUgIT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhZGFwdGl2ZSBpcyBub3QgYSBudW1iZXInKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmNhcGFjaXR5ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYXBhY2l0eSBpcyBub3QgYSBudW1iZXInKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuY2FwYWNpdHkgPD0gMCB8fCBvcHRpb25zLmNhcGFjaXR5ID4gMSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignY2FwYWNpdHkgbXVzdCBiZSBhIGZsb2F0IGJldHdlZW4gMC4xIGFuZCAxLjAnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmNodW5rU2l6ZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2h1bmtTaXplIGlzIG5vdCBhIG51bWJlcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIShvcHRpb25zLmRhdGEgaW5zdGFuY2VvZiBCbG9iKSAmJiAhKG9wdGlvbnMuZGF0YSBpbnN0YW5jZW9mIEZpbGUpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2RhdGEgaXMgbm90IGFuIEJsb2Igb3IgRmlsZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5maWxlID09PSBudWxsIHx8IHR5cGVvZiBvcHRpb25zLmZpbGUgIT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2ZpbGUgaXMgbm90IGFuIG9iamVjdCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMubWF4Q2h1bmtTaXplICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtYXhDaHVua1NpemUgaXMgbm90IGEgbnVtYmVyJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5tYXhUcmllcyAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWF4VHJpZXMgaXMgbm90IGEgbnVtYmVyJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5yZXRyeURlbGF5ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdyZXRyeURlbGF5IGlzIG5vdCBhIG51bWJlcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMudHJhbnNmZXJEZWxheSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndHJhbnNmZXJEZWxheSBpcyBub3QgYSBudW1iZXInKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm9uQWJvcnQgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb25BYm9ydCBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMub25Db21wbGV0ZSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvbkNvbXBsZXRlIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vbkNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvbkNyZWF0ZSBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMub25FcnJvciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvbkVycm9yIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vblByb2dyZXNzICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29uUHJvZ3Jlc3MgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm9uU3RhcnQgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb25TdGFydCBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMub25TdG9wICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29uU3RvcCBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuc3RvcmUgIT09ICdzdHJpbmcnICYmICEob3B0aW9ucy5zdG9yZSBpbnN0YW5jZW9mIFN0b3JlKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzdG9yZSBtdXN0IGJlIHRoZSBuYW1lIG9mIHRoZSBzdG9yZSBvciBhbiBpbnN0YW5jZSBvZiBVcGxvYWRGUy5TdG9yZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUHVibGljIGF0dHJpYnV0ZXNcclxuICAgICAgICBzZWxmLmFkYXB0aXZlID0gb3B0aW9ucy5hZGFwdGl2ZTtcclxuICAgICAgICBzZWxmLmNhcGFjaXR5ID0gcGFyc2VGbG9hdChvcHRpb25zLmNhcGFjaXR5KTtcclxuICAgICAgICBzZWxmLmNodW5rU2l6ZSA9IHBhcnNlSW50KG9wdGlvbnMuY2h1bmtTaXplKTtcclxuICAgICAgICBzZWxmLm1heENodW5rU2l6ZSA9IHBhcnNlSW50KG9wdGlvbnMubWF4Q2h1bmtTaXplKTtcclxuICAgICAgICBzZWxmLm1heFRyaWVzID0gcGFyc2VJbnQob3B0aW9ucy5tYXhUcmllcyk7XHJcbiAgICAgICAgc2VsZi5yZXRyeURlbGF5ID0gcGFyc2VJbnQob3B0aW9ucy5yZXRyeURlbGF5KTtcclxuICAgICAgICBzZWxmLnRyYW5zZmVyRGVsYXkgPSBwYXJzZUludChvcHRpb25zLnRyYW5zZmVyRGVsYXkpO1xyXG4gICAgICAgIHNlbGYub25BYm9ydCA9IG9wdGlvbnMub25BYm9ydDtcclxuICAgICAgICBzZWxmLm9uQ29tcGxldGUgPSBvcHRpb25zLm9uQ29tcGxldGU7XHJcbiAgICAgICAgc2VsZi5vbkNyZWF0ZSA9IG9wdGlvbnMub25DcmVhdGU7XHJcbiAgICAgICAgc2VsZi5vbkVycm9yID0gb3B0aW9ucy5vbkVycm9yO1xyXG4gICAgICAgIHNlbGYub25Qcm9ncmVzcyA9IG9wdGlvbnMub25Qcm9ncmVzcztcclxuICAgICAgICBzZWxmLm9uU3RhcnQgPSBvcHRpb25zLm9uU3RhcnQ7XHJcbiAgICAgICAgc2VsZi5vblN0b3AgPSBvcHRpb25zLm9uU3RvcDtcclxuXHJcbiAgICAgICAgLy8gUHJpdmF0ZSBhdHRyaWJ1dGVzXHJcbiAgICAgICAgbGV0IHN0b3JlID0gb3B0aW9ucy5zdG9yZTtcclxuICAgICAgICBsZXQgZGF0YSA9IG9wdGlvbnMuZGF0YTtcclxuICAgICAgICBsZXQgY2FwYWNpdHlNYXJnaW4gPSAwLjE7XHJcbiAgICAgICAgbGV0IGZpbGUgPSBvcHRpb25zLmZpbGU7XHJcbiAgICAgICAgbGV0IGZpbGVJZCA9IG51bGw7XHJcbiAgICAgICAgbGV0IG9mZnNldCA9IDA7XHJcbiAgICAgICAgbGV0IGxvYWRlZCA9IDA7XHJcbiAgICAgICAgbGV0IHRvdGFsID0gZGF0YS5zaXplO1xyXG4gICAgICAgIGxldCB0cmllcyA9IDA7XHJcbiAgICAgICAgbGV0IHBvc3RVcmwgPSBudWxsO1xyXG4gICAgICAgIGxldCB0b2tlbiA9IG51bGw7XHJcbiAgICAgICAgbGV0IGNvbXBsZXRlID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IHVwbG9hZGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgdGltZUEgPSBudWxsO1xyXG4gICAgICAgIGxldCB0aW1lQiA9IG51bGw7XHJcblxyXG4gICAgICAgIGxldCBlbGFwc2VkVGltZSA9IDA7XHJcbiAgICAgICAgbGV0IHN0YXJ0VGltZSA9IDA7XHJcblxyXG4gICAgICAgIC8vIEtlZXAgb25seSB0aGUgbmFtZSBvZiB0aGUgc3RvcmVcclxuICAgICAgICBpZiAoc3RvcmUgaW5zdGFuY2VvZiBTdG9yZSkge1xyXG4gICAgICAgICAgICBzdG9yZSA9IHN0b3JlLmdldE5hbWUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFzc2lnbiBmaWxlIHRvIHN0b3JlXHJcbiAgICAgICAgZmlsZS5zdG9yZSA9IHN0b3JlO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBmaW5pc2goKSB7XHJcbiAgICAgICAgICAgIC8vIEZpbmlzaCB0aGUgdXBsb2FkIGJ5IHRlbGxpbmcgdGhlIHN0b3JlIHRoZSB1cGxvYWQgaXMgY29tcGxldGVcclxuICAgICAgICAgICAgTWV0ZW9yLmNhbGwoJ3Vmc0NvbXBsZXRlJywgZmlsZUlkLCBzdG9yZSwgdG9rZW4sIGZ1bmN0aW9uIChlcnIsIHVwbG9hZGVkRmlsZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25FcnJvcihlcnIsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWJvcnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHVwbG9hZGVkRmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlID0gdXBsb2FkZWRGaWxlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25Db21wbGV0ZSh1cGxvYWRlZEZpbGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFib3J0cyB0aGUgY3VycmVudCB0cmFuc2ZlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYuYWJvcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgZmlsZSBmcm9tIGRhdGFiYXNlXHJcbiAgICAgICAgICAgIE1ldGVvci5jYWxsKCd1ZnNEZWxldGUnLCBmaWxlSWQsIHN0b3JlLCB0b2tlbiwgZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vbkVycm9yKGVyciwgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVzZXQgdXBsb2FkZXIgc3RhdHVzXHJcbiAgICAgICAgICAgIHVwbG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBmaWxlSWQgPSBudWxsO1xyXG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICB0cmllcyA9IDA7XHJcbiAgICAgICAgICAgIGxvYWRlZCA9IDA7XHJcbiAgICAgICAgICAgIGNvbXBsZXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHNlbGYub25BYm9ydChmaWxlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBhdmVyYWdlIHNwZWVkIGluIGJ5dGVzIHBlciBzZWNvbmRcclxuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYuZ2V0QXZlcmFnZVNwZWVkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBsZXQgc2Vjb25kcyA9IHNlbGYuZ2V0RWxhcHNlZFRpbWUoKSAvIDEwMDA7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmdldExvYWRlZCgpIC8gc2Vjb25kcztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBlbGFwc2VkIHRpbWUgaW4gbWlsbGlzZWNvbmRzXHJcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLmdldEVsYXBzZWRUaW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoc3RhcnRUaW1lICYmIHNlbGYuaXNVcGxvYWRpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsYXBzZWRUaW1lICsgKERhdGUubm93KCkgLSBzdGFydFRpbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlbGFwc2VkVGltZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBmaWxlXHJcbiAgICAgICAgICogQHJldHVybiB7b2JqZWN0fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYuZ2V0RmlsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZpbGU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbG9hZGVkIGJ5dGVzXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYuZ2V0TG9hZGVkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbG9hZGVkO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgY3VycmVudCBwcm9ncmVzc1xyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLmdldFByb2dyZXNzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5taW4oKGxvYWRlZCAvIHRvdGFsKSAqIDEwMCAvIDEwMCwgMS4wKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSByZW1haW5pbmcgdGltZSBpbiBtaWxsaXNlY29uZHNcclxuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYuZ2V0UmVtYWluaW5nVGltZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGF2ZXJhZ2VTcGVlZCA9IHNlbGYuZ2V0QXZlcmFnZVNwZWVkKCk7XHJcbiAgICAgICAgICAgIGxldCByZW1haW5pbmdCeXRlcyA9IHRvdGFsIC0gc2VsZi5nZXRMb2FkZWQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGF2ZXJhZ2VTcGVlZCAmJiByZW1haW5pbmdCeXRlcyA/IE1hdGgubWF4KHJlbWFpbmluZ0J5dGVzIC8gYXZlcmFnZVNwZWVkLCAwKSA6IDA7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgdXBsb2FkIHNwZWVkIGluIGJ5dGVzIHBlciBzZWNvbmRcclxuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYuZ2V0U3BlZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aW1lQSAmJiB0aW1lQiAmJiBzZWxmLmlzVXBsb2FkaW5nKCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWNvbmRzID0gKHRpbWVCIC0gdGltZUEpIC8gMTAwMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNodW5rU2l6ZSAvIHNlY29uZHM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgdG90YWwgYnl0ZXNcclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2VsZi5nZXRUb3RhbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRvdGFsO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrcyBpZiB0aGUgdHJhbnNmZXIgaXMgY29tcGxldGVcclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYuaXNDb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbXBsZXRlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrcyBpZiB0aGUgdHJhbnNmZXIgaXMgYWN0aXZlXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLmlzVXBsb2FkaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdXBsb2FkaW5nO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlYWRzIGEgcG9ydGlvbiBvZiBmaWxlXHJcbiAgICAgICAgICogQHBhcmFtIHN0YXJ0XHJcbiAgICAgICAgICogQHBhcmFtIGxlbmd0aFxyXG4gICAgICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICAgICAqIEByZXR1cm5zIHtCbG9ifVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYucmVhZENodW5rID0gZnVuY3Rpb24gKHN0YXJ0LCBsZW5ndGgsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZWFkQ2h1bmsgaXMgbWlzc2luZyBjYWxsYmFjaycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZW5kO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY2h1bmsgc2l6ZVxyXG4gICAgICAgICAgICAgICAgaWYgKGxlbmd0aCAmJiBzdGFydCArIGxlbmd0aCA+IHRvdGFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gdG90YWw7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHN0YXJ0ICsgbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gR2V0IGNodW5rXHJcbiAgICAgICAgICAgICAgICBsZXQgY2h1bmsgPSBkYXRhLnNsaWNlKHN0YXJ0LCBlbmQpO1xyXG4gICAgICAgICAgICAgICAgLy8gUGFzcyBjaHVuayB0byBjYWxsYmFja1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmLCBudWxsLCBjaHVuayk7XHJcblxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3JlYWQgZXJyb3InLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgLy8gUmV0cnkgdG8gcmVhZCBjaHVua1xyXG4gICAgICAgICAgICAgICAgTWV0ZW9yLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmllcyA8IHNlbGYubWF4VHJpZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZXMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWFkQ2h1bmsoc3RhcnQsIGxlbmd0aCwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHNlbGYucmV0cnlEZWxheSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZW5kcyBhIGZpbGUgY2h1bmsgdG8gdGhlIHN0b3JlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2VsZi5zZW5kQ2h1bmsgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghY29tcGxldGUgJiYgc3RhcnRUaW1lICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0IDwgdG90YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2h1bmtTaXplID0gc2VsZi5jaHVua1NpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSBhZGFwdGl2ZSBsZW5ndGhcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5hZGFwdGl2ZSAmJiB0aW1lQSAmJiB0aW1lQiAmJiB0aW1lQiA+IHRpbWVBKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkdXJhdGlvbiA9ICh0aW1lQiAtIHRpbWVBKSAvIDEwMDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXggPSBzZWxmLmNhcGFjaXR5ICogKDEgKyBjYXBhY2l0eU1hcmdpbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtaW4gPSBzZWxmLmNhcGFjaXR5ICogKDEgLSBjYXBhY2l0eU1hcmdpbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHVyYXRpb24gPj0gbWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVua1NpemUgPSBNYXRoLmFicyhNYXRoLnJvdW5kKGNodW5rU2l6ZSAqIChtYXggLSBkdXJhdGlvbikpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZHVyYXRpb24gPCBtaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rU2l6ZSA9IE1hdGgucm91bmQoY2h1bmtTaXplICogKG1pbiAvIGR1cmF0aW9uKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGltaXQgdG8gbWF4IGNodW5rIHNpemVcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYubWF4Q2h1bmtTaXplID4gMCAmJiBjaHVua1NpemUgPiBzZWxmLm1heENodW5rU2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtTaXplID0gc2VsZi5tYXhDaHVua1NpemU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIExpbWl0IHRvIG1heCBjaHVuayBzaXplXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYubWF4Q2h1bmtTaXplID4gMCAmJiBjaHVua1NpemUgPiBzZWxmLm1heENodW5rU2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua1NpemUgPSBzZWxmLm1heENodW5rU2l6ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlZHVjZSBjaHVuayBzaXplIHRvIGZpdCB0b3RhbFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvZmZzZXQgKyBjaHVua1NpemUgPiB0b3RhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua1NpemUgPSB0b3RhbCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFByZXBhcmUgdGhlIGNodW5rXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWFkQ2h1bmsob2Zmc2V0LCBjaHVua1NpemUsIGZ1bmN0aW9uIChlcnIsIGNodW5rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub25FcnJvcihlcnIsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5jb250YWlucyhbMjAwLCAyMDEsIDIwMiwgMjA0XSwgeGhyLnN0YXR1cykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZUIgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQgKz0gY2h1bmtTaXplO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZWQgKz0gY2h1bmtTaXplO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VuZCBuZXh0IGNodW5rXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub25Qcm9ncmVzcyhmaWxlLCBzZWxmLmdldFByb2dyZXNzKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmluaXNoIHVwbG9hZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9hZGVkID49IHRvdGFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGFwc2VkVGltZSA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5pc2goKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1ldGVvci5zZXRUaW1lb3V0KHNlbGYuc2VuZENodW5rLCBzZWxmLnRyYW5zZmVyRGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFfLmNvbnRhaW5zKFs0MDIsIDQwMywgNDA0LCA1MDBdLCB4aHIuc3RhdHVzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXRyeSB1bnRpbCBtYXggdHJpZXMgaXMgcmVhY2hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnV0IGRvbid0IHJldHJ5IGlmIHRoZXNlIGVycm9ycyBvY2N1clxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJpZXMgPD0gc2VsZi5tYXhUcmllcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpZXMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdhaXQgYmVmb3JlIHJldHJ5aW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNZXRlb3Iuc2V0VGltZW91dChzZWxmLnNlbmRDaHVuaywgc2VsZi5yZXRyeURlbGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWJvcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hYm9ydCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSB1cGxvYWQgcHJvZ3Jlc3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHByb2dyZXNzID0gKG9mZnNldCArIGNodW5rU2l6ZSkgLyB0b3RhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGV0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvcm1EYXRhLmFwcGVuZCgncHJvZ3Jlc3MnLCBwcm9ncmVzcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvcm1EYXRhLmFwcGVuZCgnY2h1bmsnLCBjaHVuayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1cmwgPSBgJHtwb3N0VXJsfSZwcm9ncmVzcz0ke3Byb2dyZXNzfWA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lQSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVCID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBsb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlbmQgY2h1bmsgdG8gdGhlIHN0b3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgdXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoY2h1bmspO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RhcnRzIG9yIHJlc3VtZXMgdGhlIHRyYW5zZmVyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2VsZi5zdGFydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCFmaWxlSWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgZmlsZSBkb2N1bWVudCBhbmQgZ2V0IHRoZSB0b2tlblxyXG4gICAgICAgICAgICAgICAgLy8gdGhhdCBhbGxvd3MgdGhlIHVzZXIgdG8gc2VuZCBjaHVua3MgdG8gdGhlIHN0b3JlLlxyXG4gICAgICAgICAgICAgICAgTWV0ZW9yLmNhbGwoJ3Vmc0NyZWF0ZScsIF8uZXh0ZW5kKHt9LCBmaWxlKSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9uRXJyb3IoZXJyLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IHJlc3VsdC50b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFVybCA9IHJlc3VsdC51cmw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVJZCA9IHJlc3VsdC5maWxlSWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuX2lkID0gcmVzdWx0LmZpbGVJZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5vbkNyZWF0ZShmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZXMgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9uU3RhcnQoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2VuZENodW5rKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXVwbG9hZGluZyAmJiAhY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIFJlc3VtZSB1cGxvYWRpbmdcclxuICAgICAgICAgICAgICAgIHRyaWVzID0gMDtcclxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9uU3RhcnQoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNlbmRDaHVuaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RvcHMgdGhlIHRyYW5zZmVyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2VsZi5zdG9wID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodXBsb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZWxhcHNlZCB0aW1lXHJcbiAgICAgICAgICAgICAgICBlbGFwc2VkVGltZSA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdXBsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9uU3RvcChmaWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBNZXRlb3IuY2FsbCgndWZzU3RvcCcsIGZpbGVJZCwgc3RvcmUsIHRva2VuLCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub25FcnJvcihlcnIsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCB3aGVuIHRoZSBmaWxlIHVwbG9hZCBpcyBhYm9ydGVkXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICovXHJcbiAgICBvbkFib3J0KGZpbGUpIHtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCB3aGVuIHRoZSBmaWxlIHVwbG9hZCBpcyBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqL1xyXG4gICAgb25Db21wbGV0ZShmaWxlKSB7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgZmlsZSBpcyBjcmVhdGVkIGluIHRoZSBjb2xsZWN0aW9uXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICovXHJcbiAgICBvbkNyZWF0ZShmaWxlKSB7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiBhbiBlcnJvciBvY2N1cnMgZHVyaW5nIGZpbGUgdXBsb2FkXHJcbiAgICAgKiBAcGFyYW0gZXJyXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICovXHJcbiAgICBvbkVycm9yKGVyciwgZmlsZSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHVmczogJHtlcnIubWVzc2FnZX1gKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCB3aGVuIGEgZmlsZSBjaHVuayBoYXMgYmVlbiBzZW50XHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICogQHBhcmFtIHByb2dyZXNzIGlzIGEgZmxvYXQgZnJvbSAwLjAgdG8gMS4wXHJcbiAgICAgKi9cclxuICAgIG9uUHJvZ3Jlc3MoZmlsZSwgcHJvZ3Jlc3MpIHtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCB3aGVuIHRoZSBmaWxlIHVwbG9hZCBzdGFydHNcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKi9cclxuICAgIG9uU3RhcnQoZmlsZSkge1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIGZpbGUgdXBsb2FkIHN0b3BzXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICovXHJcbiAgICBvblN0b3AoZmlsZSkge1xyXG4gICAgfVxyXG59XHJcbiJdfQ==
