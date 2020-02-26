(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Email = Package.email.Email;
var EmailInternals = Package.email.EmailInternals;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"rocketchat:mongo-config":{"server":{"index.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////
//                                                                                       //
// packages/rocketchat_mongo-config/server/index.js                                      //
//                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////
                                                                                         //
let tls;
module.link("tls", {
  default(v) {
    tls = v;
  }

}, 0);
let PassThrough;
module.link("stream", {
  PassThrough(v) {
    PassThrough = v;
  }

}, 1);
let EmailTest;
module.link("meteor/email", {
  EmailTest(v) {
    EmailTest = v;
  }

}, 2);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 3);
// FIX For TLS error see more here https://github.com/RocketChat/Rocket.Chat/issues/9316
// TODO: Remove after NodeJS fix it, more information
// https://github.com/nodejs/node/issues/16196
// https://github.com/nodejs/node/pull/16853
// This is fixed in Node 10, but this supports LTS versions
tls.DEFAULT_ECDH_CURVE = 'auto';
const mongoOptionStr = process.env.MONGO_OPTIONS;

if (typeof mongoOptionStr !== 'undefined') {
  const mongoOptions = JSON.parse(mongoOptionStr);
  Mongo.setConnectionOptions(mongoOptions);
}

process.env.HTTP_FORWARDED_COUNT = process.env.HTTP_FORWARDED_COUNT || '1'; // Send emails to a "fake" stream instead of print them in console

if (process.env.NODE_ENV !== 'development' || process.env.TEST_MODE) {
  const stream = new PassThrough();
  EmailTest.overrideOutputStream(stream);
  stream.on('data', () => {});
  stream.on('end', () => {});
}
///////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/rocketchat:mongo-config/server/index.js");

/* Exports */
Package._define("rocketchat:mongo-config", exports);

})();

//# sourceURL=meteor://💻app/packages/rocketchat_mongo-config.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdDptb25nby1jb25maWcvc2VydmVyL2luZGV4LmpzIl0sIm5hbWVzIjpbInRscyIsIm1vZHVsZSIsImxpbmsiLCJkZWZhdWx0IiwidiIsIlBhc3NUaHJvdWdoIiwiRW1haWxUZXN0IiwiTW9uZ28iLCJERUZBVUxUX0VDREhfQ1VSVkUiLCJtb25nb09wdGlvblN0ciIsInByb2Nlc3MiLCJlbnYiLCJNT05HT19PUFRJT05TIiwibW9uZ29PcHRpb25zIiwiSlNPTiIsInBhcnNlIiwic2V0Q29ubmVjdGlvbk9wdGlvbnMiLCJIVFRQX0ZPUldBUkRFRF9DT1VOVCIsIk5PREVfRU5WIiwiVEVTVF9NT0RFIiwic3RyZWFtIiwib3ZlcnJpZGVPdXRwdXRTdHJlYW0iLCJvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUlBLEdBQUo7QUFBUUMsTUFBTSxDQUFDQyxJQUFQLENBQVksS0FBWixFQUFrQjtBQUFDQyxTQUFPLENBQUNDLENBQUQsRUFBRztBQUFDSixPQUFHLEdBQUNJLENBQUo7QUFBTTs7QUFBbEIsQ0FBbEIsRUFBc0MsQ0FBdEM7QUFBeUMsSUFBSUMsV0FBSjtBQUFnQkosTUFBTSxDQUFDQyxJQUFQLENBQVksUUFBWixFQUFxQjtBQUFDRyxhQUFXLENBQUNELENBQUQsRUFBRztBQUFDQyxlQUFXLEdBQUNELENBQVo7QUFBYzs7QUFBOUIsQ0FBckIsRUFBcUQsQ0FBckQ7QUFBd0QsSUFBSUUsU0FBSjtBQUFjTCxNQUFNLENBQUNDLElBQVAsQ0FBWSxjQUFaLEVBQTJCO0FBQUNJLFdBQVMsQ0FBQ0YsQ0FBRCxFQUFHO0FBQUNFLGFBQVMsR0FBQ0YsQ0FBVjtBQUFZOztBQUExQixDQUEzQixFQUF1RCxDQUF2RDtBQUEwRCxJQUFJRyxLQUFKO0FBQVVOLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLGNBQVosRUFBMkI7QUFBQ0ssT0FBSyxDQUFDSCxDQUFELEVBQUc7QUFBQ0csU0FBSyxHQUFDSCxDQUFOO0FBQVE7O0FBQWxCLENBQTNCLEVBQStDLENBQS9DO0FBTTNNO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUosR0FBRyxDQUFDUSxrQkFBSixHQUF5QixNQUF6QjtBQUVBLE1BQU1DLGNBQWMsR0FBR0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLGFBQW5DOztBQUNBLElBQUksT0FBT0gsY0FBUCxLQUEwQixXQUE5QixFQUEyQztBQUMxQyxRQUFNSSxZQUFZLEdBQUdDLElBQUksQ0FBQ0MsS0FBTCxDQUFXTixjQUFYLENBQXJCO0FBRUFGLE9BQUssQ0FBQ1Msb0JBQU4sQ0FBMkJILFlBQTNCO0FBQ0E7O0FBRURILE9BQU8sQ0FBQ0MsR0FBUixDQUFZTSxvQkFBWixHQUFtQ1AsT0FBTyxDQUFDQyxHQUFSLENBQVlNLG9CQUFaLElBQW9DLEdBQXZFLEMsQ0FFQTs7QUFDQSxJQUFJUCxPQUFPLENBQUNDLEdBQVIsQ0FBWU8sUUFBWixLQUF5QixhQUF6QixJQUEwQ1IsT0FBTyxDQUFDQyxHQUFSLENBQVlRLFNBQTFELEVBQXFFO0FBQ3BFLFFBQU1DLE1BQU0sR0FBRyxJQUFJZixXQUFKLEVBQWY7QUFDQUMsV0FBUyxDQUFDZSxvQkFBVixDQUErQkQsTUFBL0I7QUFDQUEsUUFBTSxDQUFDRSxFQUFQLENBQVUsTUFBVixFQUFrQixNQUFNLENBQUUsQ0FBMUI7QUFDQUYsUUFBTSxDQUFDRSxFQUFQLENBQVUsS0FBVixFQUFpQixNQUFNLENBQUUsQ0FBekI7QUFDQSxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9yb2NrZXRjaGF0X21vbmdvLWNvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0bHMgZnJvbSAndGxzJztcbmltcG9ydCB7IFBhc3NUaHJvdWdoIH0gZnJvbSAnc3RyZWFtJztcblxuaW1wb3J0IHsgRW1haWxUZXN0IH0gZnJvbSAnbWV0ZW9yL2VtYWlsJztcbmltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJztcblxuLy8gRklYIEZvciBUTFMgZXJyb3Igc2VlIG1vcmUgaGVyZSBodHRwczovL2dpdGh1Yi5jb20vUm9ja2V0Q2hhdC9Sb2NrZXQuQ2hhdC9pc3N1ZXMvOTMxNlxuLy8gVE9ETzogUmVtb3ZlIGFmdGVyIE5vZGVKUyBmaXggaXQsIG1vcmUgaW5mb3JtYXRpb25cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9pc3N1ZXMvMTYxOTZcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9wdWxsLzE2ODUzXG4vLyBUaGlzIGlzIGZpeGVkIGluIE5vZGUgMTAsIGJ1dCB0aGlzIHN1cHBvcnRzIExUUyB2ZXJzaW9uc1xudGxzLkRFRkFVTFRfRUNESF9DVVJWRSA9ICdhdXRvJztcblxuY29uc3QgbW9uZ29PcHRpb25TdHIgPSBwcm9jZXNzLmVudi5NT05HT19PUFRJT05TO1xuaWYgKHR5cGVvZiBtb25nb09wdGlvblN0ciAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0Y29uc3QgbW9uZ29PcHRpb25zID0gSlNPTi5wYXJzZShtb25nb09wdGlvblN0cik7XG5cblx0TW9uZ28uc2V0Q29ubmVjdGlvbk9wdGlvbnMobW9uZ29PcHRpb25zKTtcbn1cblxucHJvY2Vzcy5lbnYuSFRUUF9GT1JXQVJERURfQ09VTlQgPSBwcm9jZXNzLmVudi5IVFRQX0ZPUldBUkRFRF9DT1VOVCB8fCAnMSc7XG5cbi8vIFNlbmQgZW1haWxzIHRvIGEgXCJmYWtlXCIgc3RyZWFtIGluc3RlYWQgb2YgcHJpbnQgdGhlbSBpbiBjb25zb2xlXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdkZXZlbG9wbWVudCcgfHwgcHJvY2Vzcy5lbnYuVEVTVF9NT0RFKSB7XG5cdGNvbnN0IHN0cmVhbSA9IG5ldyBQYXNzVGhyb3VnaCgpO1xuXHRFbWFpbFRlc3Qub3ZlcnJpZGVPdXRwdXRTdHJlYW0oc3RyZWFtKTtcblx0c3RyZWFtLm9uKCdkYXRhJywgKCkgPT4ge30pO1xuXHRzdHJlYW0ub24oJ2VuZCcsICgpID0+IHt9KTtcbn1cbiJdfQ==
