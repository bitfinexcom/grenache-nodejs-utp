'use strict'

const Base = require('grenache-nodejs-base')
const TransportRPCClient = require('./TransportRPCClient')
const { URL } = require('url')

class PeerRPCClient extends Base.PeerRPCClient {
  getTransportClass () {
    return TransportRPCClient
  }

  getTarget (key, opts, cb) {
    this.link.lookup(
      key, {},
      (err, dests) => {
        if (err) return cb(err)

        const dest = this.dest(dests, key, this.getDestOpts(opts))

        const u = new URL('http://' + dest)

        const { port, hostname: address } = u
        const target = {
          port: +port,
          address
        }

        cb(null, { target, dest })
      }
    )
  }

  request (key, payload, opts = {}, cb) {
    if (typeof key === 'string') {
      super.request.apply(this, arguments)
      return
    }

    const dest = key.address + ':' + key.port

    this.transport(dest, this.getTransportOpts(opts))
      .request(dest, payload, this.getRequestOpts(opts), cb)
  }

  punch (key, opts = {}, cb = () => {}) {
    this.getTarget(key, opts, (err, res) => {
      if (err) return cb(err)

      const cls = this.transport(res.dest, this.getTransportOpts(opts))

      cls.punch(res.target)
      cb(null)
    })
  }
}

module.exports = PeerRPCClient

