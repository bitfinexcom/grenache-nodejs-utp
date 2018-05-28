'use strict'

const { PeerRPCClient } = require('./../../')
const Link = require('grenache-nodejs-link')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

const client = peer.transport('client', {})
client.on('punch', (other) => {
  console.log('received punch back from', other, 'requesting data...')

  peer.request('etoro_cris', 'hello', { timeout: 10000 }, (err, data) => {
    console.log('got data reply')
    if (err) console.error(err)

    console.log(data)
  })
})

// convenience method to start a punching process with a grenache service
// assuming the rpc_server is not behind a nat
peer.punch('etoro_cris', (err) => {
  if (err) throw err
})
