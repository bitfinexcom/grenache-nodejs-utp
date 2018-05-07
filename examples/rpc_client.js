'use strict'

const Grenache = require('./../')
const Link = require('grenache-nodejs-link')
const Peer = Grenache.PeerRPCClient

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {})
peer.init()

peer.request('etoro_cris', 'hello', { timeout: 10000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(-1)
  }
  console.log(data)
  peer.stop()
})
