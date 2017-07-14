import * as utils from '../utils'

const router = require('express').Router()
const oauth2 = require('simple-oauth2').create(utils.CREDENTIALS)

export default router.get('', (req, res) => {
  console.log("Callback Response(Assembla):", res)
  //we've got an auth code,
  //so now we can get a bearer token
  oauth2.authorizationCode.getToken({
    code: req.query.code,
    grant_type: 'authorization_code'
  }, (error, result) => {
    if (error) {
      console.log('Access Token Error: ', error);
      res.redirect('https://t.me/AssemblaBot');
      return;
    }
    const token = oauth2.accessToken.create(result);
    console.log("Token: ", token)
    res.redirect('https://t.me/AssemblaBot');

    // pullSpace(res, token)
  })
})