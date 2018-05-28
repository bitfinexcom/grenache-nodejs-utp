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

console.log('listening on', service.port)

setInterval(function () {
  link.announce('etoro_cris', service.port, {})
}, 1000)

service.on('request', (rid, key, payload, handler, cert, additional) => {
  console.log('received request, replying...')
  handler.reply(null, 'strategy is everything')
})

service.on('punch', (other) => {
  console.log('punch from', other)
  console.log('punching back...')
  service.punch(other)
})
