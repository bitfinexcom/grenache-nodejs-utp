'use strict'

const { PeerRPCServer, PeerRPCClient } = require('./../../')
const Link = require('grenache-nodejs-link')

const { register } = require('./register.js')

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

const peerClient = new PeerRPCClient(link, {})
peerClient.init()

console.log('listening on', service.port)

setInterval(function () {
  link.announce('etoro_cris', service.port, {})

  register(peerClient, true, (err, res) => {
    if (err) {
      console.error(err)
      return
    }

    connect(peerClient, res)
  })
}, 2000)

function connect (peer, clients) {
  if (!clients) return

  const target = clients.pop()

  if (!target) return

  console.log(`handshaking with ${target.address}:${target.port} ...`)

  service.punch(target)

  connect(clients)
}

service.on('request', (rid, key, payload, handler, cert, additional) => {
  handler.reply(null, 'strategy is everything')
})

service.on('punch', (other) => {
  console.log('punch from', other)
})
