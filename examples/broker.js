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

const port = 10000
const service = peer.transport('server')
service.listen(port)

setInterval(function () {
  link.announce('etoro_broker', service.port, {})
}, 1000)

const services = {}
service.on('request', (rid, key, payload, handler, cert, additional) => {

  console.log(`got reply from to ${additional.address}:${additional.port}`)

  if (!services[payload.service]) services[payload.service] = {}

  payload.address = additional.address
  payload.port = additional.port
  services[payload.service][payload.address + payload.port] = payload

  console.log("#services", services)

  handler.reply(null, services)
})
