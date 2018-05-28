'use strict'

const { PeerRPCServer } = require('./../../')
const Link = require('grenache-nodejs-link')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCServer(link, {
  timeout: 300000
})
peer.init()

const service = peer.transport('server')
service.listen()

console.log('port:', service.port)
setInterval(function () {
  link.announce('rpc_test', service.port, {})
}, 1000)

service.on('request', (rid, key, payload, handler) => {
  console.log('example request handler:', rid, key, payload)
  handler.reply(null, 'world')
  // handler.reply(new Error('something went wrong'), 'world')
})
