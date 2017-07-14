'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.callback = callback;

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var oauth2 = require('simple-oauth2').create(utils.CREDENTIALS);

function callback(req, res) {
  console.log("Callback Response(Assembla):", res);
  //we've got an auth code,
  //so now we can get a bearer token
  oauth2.authorizationCode.getToken({
    code: req.query.code,
    grant_type: 'authorization_code'
  }, function (error, result) {
    if (error) {
      console.log('Access Token Error: ', error);
      res.redirect('https://t.me/AssemblaBot');
      return;
    }
    var token = oauth2.accessToken.create(result);
    console.log("Token: ", token);
    res.redirect('https://t.me/AssemblaBot');

    // pullSpace(res, token)
  });
}