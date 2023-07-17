const axios = require('axios')
const querystring = require('querystring')

const { client, authServer, protectedResource } = require('./info')

function encodeClientCredentials(clientId, clientSecret) {
  return Buffer.from(`${querystring.escape(clientId)}:${querystring.escape(clientSecret)}`).toString('base64')
}

async function main() {
  let access_token = null
  try {
    const tokenRes = await axios.post(authServer.tokenEndpoint, {
      grant_type: 'client_credentials',
    }, {
      headers: {
        Authorization: `Basic ${encodeClientCredentials(client.client_id, client.client_secret)}`,
      },
    })
    console.log(tokenRes.data)
    access_token = tokenRes.data.access_token
  } catch (err) {
    if (err.response && err.response.data) {
      console.error(err.response.data)
      return
    }
    console.error(err)
  }

  if (!access_token) {
    return
  }

  try {
    const resourceRes = await axios.post(protectedResource, {}, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
    console.log(resourceRes.data)
  } catch (err) {
    if (err.response && err.response.data) {
      console.error(err.response.data)
      return
    }
    console.error(err)
  }
}

main()
