'use strict'

const { PeerRPCClient } = require('./../../')
const Link = require('grenache-nodejs-link')

const { register } = require('./register.js')
const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

const service = peer.transport('client', {})
service.on('punch', (other) => {
  console.log('received punch back from', other, 'requesting data...')

  peer.request(other, { msg: 'hello' }, { timeout: 10000 }, (err, data) => {
    if (err) console.error(err)

    console.log(data)
  })
})

service.on('error', () => {
  console.log(err)
  console.trace()
})

function kick () {
  // register with broker
  // broker returns port and address of nat_services and clients
  register(peer, false, (err, res) => {
    if (err) {
      console.error(err)
      return
    }
  })
}

kick()
