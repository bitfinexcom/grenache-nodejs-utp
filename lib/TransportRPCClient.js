'use strict'

const utp = require('./utp.js')
const { URL } = require('url')
const CbQ = require('cbq')

const Base = require('grenache-nodejs-base')
const { parse, format } = require('./msg-encode.js')

const CONTROL_HANDSHAKE = Buffer('ÿ')

class TransportRPCClient extends Base.TransportRPCClient {
  init () {
    super.init()

    this.cbq = new CbQ()
  }

  getSocket () {
    if (this.socket) return this.socket

    return utp
  }

  request (key, payload, opts, cb) {
    if (key !== 'etoro_broker') {
      console.log("this._request")
    }
    this._request(key, payload, opts, cb)
    return this
  }

  getBoundSocket (port) {
    const socket = this.getSocket()

    if (!socket.bound) socket.bind(port)
    socket.bound = true

    if (socket.clientListens) {
      return socket
    }

    socket.on('message', (msg, rinfo) => {
      if (msg.equals(CONTROL_HANDSHAKE)) {
        console.log("received control char ÿ for punching from", rinfo)
        socket.emit('punch', rinfo)
        return
      }

      const data = this.parse(msg)

      const [rid, _err, res] = data

      console.log(rid, _err, res)
      this.handleReply(rid, _err ? new Error(_err) : null, res)
    })

    socket.clientListens = true
    return socket
  }

  sendRequest (req) {
    const socket = this.socket = this.getBoundSocket(0)

    const buf = this.format([req.rid, req.key, req.payload])

    const u = new URL('http://' + this.conf.dest)
    u.host = this.conf.dest
    const { port, hostname } = u

    socket.send(buf, 0, buf.length, +port, hostname)
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
