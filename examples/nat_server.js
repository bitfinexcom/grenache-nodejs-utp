'use strict'

const Grenache = require('./../')
const Link = require('grenache-nodejs-link')
const Peer = Grenache.PeerRPCServer

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {
  timeout: 300000
})
peer.init()

const port = 13378
const service = peer.transport('server')
service.listen(port)

setInterval(function () {
  link.announce('etoro_cris', service.port, {})

  // establish a mapping for port 13378
  service.socket.send(Buffer('hello'), 0, 5, port, 'no-reply.bitfinex.com')
}, 1000)

service.on('request', (rid, key, payload, handler, cert, additional) => {
  handler.reply(null, 'strategy is everything')

  // console.log(`got reply from to ${payload.address}:${additional.port}`)
  // console.log(`now connecting through NAT to ${payload.address}:${payload.httpPort}`)
})
