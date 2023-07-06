const client = {
  client_id: 'oauth-client-id-admin',
  client_secret: 'oauth-client-secret-admin',
  redirect_uris: ['http://localhost:9000/callback'],
  scope: 'openid profile email phone address',
}

// authorization server information
const authServer = {
  authorizationEndpoint: 'http://localhost:3000/auth/authorize',
  tokenEndpoint: 'http://localhost:3000/auth/token',
}

module.exports = {
  client,
  authServer,
}
