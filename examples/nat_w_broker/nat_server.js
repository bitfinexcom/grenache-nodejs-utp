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
  link.announce('fibonacci_worker', service.port, {})

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
  console.log('received request, calculating & replying...')
  const result = fibonacci(payload.length)
  handler.reply(null, result)
})

service.on('punch', (other) => {
  console.log('punch from', other)
})

function fibonacci (length) {
  const res = []

  function _fibonacci (n) {
    if (n <= 1) {
      return 1
    }
    return _fibonacci(n - 1) + _fibonacci(n - 2)
  }

  for (let i = 0; i < length; i++) {
    res.push(_fibonacci(i))
  }

  return res
}
