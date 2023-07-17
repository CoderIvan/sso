const crypto = require('crypto')
const url = require('url')
const fs = require('fs')
const querystring = require('querystring')
const path = require('path')

const jwt = require('jsonwebtoken')
const express = require('express')
const bodyParser = require('body-parser')
const cons = require('consolidate')
const axios = require('axios')

const { client, authServer } = require('./info')

const publicKey = fs.readFileSync(
  path.join(__dirname, '.public.key'),
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
    scope: client.scope,
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

  const resState = req.query.state
  if (resState !== state) {
    res.render('error', { error: 'State value did not match' })
    return
  }

  const { code } = req.query

  axios.post(authServer.tokenEndpoint, {
    grant_type: 'authorization_code',
    code,
    redirect_uri: client.redirect_uris[0],
  }, {
    headers: {
      Authorization: `Basic ${encodeClientCredentials(client.client_id, client.client_secret)}`,
    },
  }).then(({ data }) => {
    if (!data.id_token) {
      res.render('error', { error: 'required id_token' })
      return
    }

    const payload = jwt.verify(data.id_token, publicKey)

    res.render('userinfo', { id_token: data.id_token, payload })
  }).catch((error) => {
    const { response: { data, status } } = error
    res.render('error', { error: `Unable to fetch access token, server response: ${status} ${JSON.stringify(data)}` })
  })
})

const server = app.listen(9000, 'localhost', () => {
  const { address, port } = server.address()
  // eslint-disable-next-line no-console
  console.log('OAuth Client is listening at http://%s:%s', address, port)
})
