'use strict'

const { PeerRPCServer, PeerRPCClient } = require('./../../')
const Link = require('grenache-nodejs-link')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peerSrv = new PeerRPCServer(link, {
  timeout: 300000
})
peerSrv.init()

const service = peerSrv.transport('server')
service.listen()
console.log('listening on', service.port)

const link2 = new Link({
  grape: 'http://127.0.0.1:30001'
})
link2.start()

const peer = new PeerRPCClient(link2, {})
peer.init()

setInterval(function () {
  link.announce('fibonacci_consumer', service.port, {})
}, 1000)

service.on('punch', (other) => {
  console.log('punch from', other)
  console.log('punching back...')
  service.punch(other)

  // establish connection and calculate data
  peer.request(other, { length: 10 }, { timeout: 10000 }, (err, data) => {
    if (err) return console.error(err)

    console.log('got data reply, sequence is:')
    console.log(data)
  })
})
