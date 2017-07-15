'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('../utils');

var router = require('express').Router();
var oauth2 = require('simple-oauth2').create(_utils.CREDENTIALS);

exports.default = router.get('', function (req, res) {
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
});