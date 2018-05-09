'use strict'

const Grenache = require('./../')
const Link = require('grenache-nodejs-link')
const Peer = Grenache.PeerRPCClient

const { register } = require('./connect.js')
const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {})
peer.init()
const transport = peer.transport('client')
const socket = transport.getSocket()

let gotPeers = false

function kick () {
  if (gotPeers) {
    connect(res)
  }

  register(peer, false, (err, res) => {
    //if (!connected) {
      connect(res)
    //}

    gotPeers = true

    setTimeout(kick, 5000)
  })
}

kick()


//const peer = new Peer(link, {})
// peer.init()
function connect (servers) {
  if (!servers) return

  const el = servers.pop()

  if (!el) return

  console.log(`connecting to ${el.address}:${el.port} ...`)

  const { port, address } = el

  const buf = Buffer('ÿ')
  console.log(`socket.send(${buf}, 0, ${buf.length}, ${+port}, ${address})`)


  socket.once('punch', () => {
    connected = true
    console.log("PUNCH!!!")

    peer.request('etoro_cris', {
      strategy: 'rsi_long'
    }, { timeout: 20000 }, (err, data) => {
      //if (err) return console.error(err)

      console.log("--------------------")
      console.log("received data:", data)
      console.log("--------------------")
    })
  })

  socket.send(buf, 0, buf.length, port, address)
}
