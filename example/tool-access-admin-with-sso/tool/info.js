const client = {
  client_id: 'oauth-client-id-tool',
  client_secret: 'oauth-client-secret-tool',
  redirect_uris: ['http://localhost:9000/callback'],
}

// authorization server information
const authServer = {
  authorizationEndpoint: 'http://localhost:3000/auth/authorize',
  tokenEndpoint: 'http://localhost:3000/auth/token',
}

const protectedResource = 'http://localhost:9002/resource'

module.exports = {
  client,
  authServer,
  protectedResource,
}
