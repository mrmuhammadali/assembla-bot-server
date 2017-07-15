import { CREDENTIALS } from '../utils'

const router = require('express').Router()
const oauth2 = require('simple-oauth2').create(CREDENTIALS)

export default router.get('', (req, res) => {
  const { code, state } = req.query
  //we've got an auth code,
  //so now we can get a bearer token
  oauth2.authorizationCode.getToken({
    code,
    grant_type: 'authorization_code'
  }, (error, result) => {
    if (error) {
      console.log('Access Token Error: ', error);
      res.redirect('https://t.me/AssemblaBot');
      return;
    }
    const token = oauth2.accessToken.create(result);

    console.log("Token: ", token)
    console.log("ChatId: ", state)
    res.redirect('https://t.me/AssemblaBot');

    // pullSpace(res, token)
  })
})