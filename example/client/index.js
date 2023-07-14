const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const express = require('express')
const bodyParser = require('body-parser')
const cons = require('consolidate')
const url = require('url')
const request = require('sync-request')
const qs = require('qs')
const fs = require('fs')
const querystring = require('querystring')
const path = require('path')
const { client, authServer } = require('./info')

const publicKey = fs.readFileSync(
  path.join(__dirname, '../../.public.key'),
)

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.engine('html', cons.underscore)
app.set('view engine', 'html')
app.set('views', 'files')

app.use('/', express.static('files'))

app.get('/', (req, res) => {
  res.render('index', {})
})

function buildUrl(base, options, hash) {
  const newUrl = url.parse(base, true)
  delete newUrl.search
  if (!newUrl.query) {
    newUrl.query = {}
  }
  Object.entries(options).forEach(([key, value]) => {
    newUrl.query[key] = value
  })
  if (hash) {
    newUrl.hash = hash
  }

  return url.format(newUrl)
}

function encodeClientCredentials(clientId, clientSecret) {
  return Buffer.from(`${querystring.escape(clientId)}:${querystring.escape(clientSecret)}`).toString('base64')
}

let state

app.get('/authorize', (req, res) => {
  state = crypto.randomBytes(16).toString('hex')

  const authorizeUrl = buildUrl(authServer.authorizationEndpoint, {
    response_type: 'code',
    client_id: client.client_id,
    redirect_uri: client.redirect_uris[0],
    state,
  })

  res.redirect(authorizeUrl)
})

app.get('/callback', (req, res) => {
  if (req.query.error) {
    // it's an error response, act accordingly
    res.render('error', { error: req.query.error })
    return
  }

  // const resState = req.query.state
  // if (resState === state) {
  //   console.log('State value matches: expected %s got %s', state, resState)
  // } else {
  //   console.log('State DOES NOT MATCH: expected %s got %s', state, resState)
  //   res.render('error', { error: 'State value did not match' })
  //   return
  // }

  const { code } = req.query
  const form_data = qs.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: client.redirect_uris[0],
  })
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${encodeClientCredentials(client.client_id, client.client_secret)}`,
  }

  const tokRes = request(
    'POST',
    authServer.tokenEndpoint,
    {
      body: form_data,
      headers,
    },
  )
  console.log('Requesting access token for code %s', code)

  if (tokRes.statusCode >= 200 && tokRes.statusCode < 300) {
    const body = JSON.parse(tokRes.getBody())
    console.log('id_token', body.id_token)

    const payload = jwt.verify(body.id_token, publicKey)
    console.log('payload', payload)

    res.render('userinfo', { id_token: body.id_token, payload })
  } else {
    res.render('error', { error: `Unable to fetch access token, server response: ${tokRes.statusCode} ${tokRes.body.toString()}` })
  }
})

const server = app.listen(9000, 'localhost', () => {
  const { address, port } = server.address()
  console.log('OAuth Client is listening at http://%s:%s', address, port)
})
