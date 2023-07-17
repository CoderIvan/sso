const express = require('express')
const fs = require('fs')
const path = require('path')

const jwt = require('jsonwebtoken')

const app = express()

const publicKey = fs.readFileSync(
  path.join(__dirname, '.public.key'),
)

const resource = {
  name: 'Protected Resource',
  description: 'This data has been protected by OAuth 2.0',
}

function getAccessToken(req, res, next) {
  // check the auth header first
  const auth = req.headers.authorization
  let inToken = null
  if (auth && auth.toLowerCase().indexOf('bearer') === 0) {
    inToken = auth.slice('bearer '.length)
  } else if (req.body && req.body.access_token) {
    // not in the header, check in the form body
    inToken = req.body.access_token
  } else if (req.query && req.query.access_token) {
    inToken = req.query.access_token
  }

  console.log('Incoming token: %s', inToken)

  const payload = jwt.verify(inToken, publicKey)
  console.log('Payload', payload)
  if (payload.iss === 'http://localhost:3000/') {
    console.log('issuer OK')
    if (
      Array.isArray(payload.aud)
        ? payload.aud.indexOf('http://localhost:9002/') > -1
        : payload.aud === 'http://localhost:9002/'
    ) {
      console.log('Audience OK')

      const now = Math.floor(Date.now() / 1000)

      if (payload.iat <= now) {
        console.log('issued-at OK')
        if (payload.exp >= now) {
          console.log('expiration OK')

          console.log('Token valid!')

          req.access_token = payload
        }
      }
    }
  }

  next()
}

app.post('/resource', getAccessToken, (req, res) => {
  if (req.access_token) {
    res.json(resource)
  } else {
    res.status(401).end()
  }
})

const server = app.listen(9002, 'localhost', () => {
  const { address, port } = server.address()
  // eslint-disable-next-line no-console
  console.log('OAuth Resource Server is listening at http://%s:%s', address, port)
})
