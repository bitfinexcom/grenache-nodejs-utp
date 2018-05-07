'use strict'

const utp = require('./utp.js')
const { URL } = require('url')
const CbQ = require('cbq')

const Base = require('grenache-nodejs-base')
const { parse, format } = require('./msg-encode.js')

class TransportRPCClient extends Base.TransportRPCClient {
  init () {
    super.init()

    this.cbq = new CbQ()
  }

  getSocket () {
    return utp
  }

  request (key, payload, opts, cb) {
    this._request(key, payload, opts, cb)
    return this
  }

  sendRequest (req) {
    const socket = this.socket = this.getSocket()
    const buf = this.format([req.rid, req.key, req.payload])

    const u = new URL('http://' + this.conf.dest)
    u.host = this.conf.dest
    const { port, hostname } = u

    socket.bind(0, () => {
      socket.send(buf, 0, buf.length, +port, hostname)
    })

    socket.on('message', (message) => {
      const data = this.parse(message)

      const [rid, _err, res] = data
      this.handleReply(rid, _err ? new Error(_err) : null, res)
    })
  }

  parse (data) {
    return parse(data)
  }

  format (data) {
    return format(data)
  }

  disconnect () {
    if (!this.socket) return
    try {
      this.socket.close()
    } catch (e) {}
    this.disconnected()
    this.socket = null
  }

  _stop () {
    super._stop()
    this.disconnect()
  }
}

module.exports = TransportRPCClient
