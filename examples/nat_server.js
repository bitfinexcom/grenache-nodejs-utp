'use strict'

const Grenache = require('./../')
const Link = require('grenache-nodejs-link')
const { URL } = require('url')
const { register } = require('./connect.js')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new Grenache.PeerRPCClient(link, {
  maxActiveKeyDests: 3
})
peer.init()

const peerSrv = new Grenache.PeerRPCServer(link, {
  timeout: 600000
})

const port = 0
const service = peerSrv.transport('server')
service.listen(port)

setInterval(function () {
  link.announce('etoro_cris', service.port, {})
  console.log("announce", service.port)

  register(peer, true, (err, res) => {
    if (err && err.message === 'ERR_TIMEOUT') return
    else if (err) throw err

    connect(peer, res)
  })
}, 1000)

function connect (peer, clients) {
  if (!clients) return

  const el = clients.pop()

  if (!el) return

  console.log(`connecting to ${el.address}:${el.port} ...`)

  const { port, address } = el

  const buf = Buffer('ÿ')
  console.log(`socket.send(${buf}, 0, ${buf.length}, ${+port}, ${address})`)

  const socket = peer.transport('client').getSocket()
  socket.send(buf, 0, buf.length, port, address)

  connect(clients)
}

service.on('request', (rid, key, payload, handler, cert, additional) => {
  // because of shared socket, all responses arrive here
  if (payload.etoro_cris) return

  console.log(payload)
  if (!payload.strategy) return

  handler.reply(null, 'strategy is everything')
})
