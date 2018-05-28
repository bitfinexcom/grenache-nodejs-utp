'use strict'

const Grenache = require('./../../')
const Link = require('grenache-nodejs-link')
const { PeerRPCClient } = Grenache

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

peer.request('rpc_test', 'hello', { timeout: 5000 }, (err, data) => {
  if (err) throw err

  console.log('example client response handler:', data)
})
