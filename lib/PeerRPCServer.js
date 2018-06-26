'use strict'

const Base = require('grenache-nodejs-base')
const TransportRPCServer = require('./TransportRPCServer')
const { URL } = require('url')

class PeerRPCServer extends Base.PeerRPCServer {
  getTransportClass () {
    return TransportRPCServer
  }

  getTarget (key, opts, cb) {
    this.link.lookup(
      key, {},
      (err, dests) => {
        if (err) return cb(err)

        const dest = this.dest(dests, key, opts)

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

  punch (key, opts = {}, cb = () => {}) {
    this.getTarget(key, opts, (err, res) => {
      if (err) return cb(err)

      const cls = this.transport(res.dest, opts)

      cls.punch(res.target)
      cb(null)
    })
  }
}

module.exports = PeerRPCServer
