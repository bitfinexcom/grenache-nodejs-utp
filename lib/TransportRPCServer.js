'use strict'

const utp = require('./utp.js')

const Base = require('grenache-nodejs-base')
const { parse, format } = require('./msg-encode.js')

class TransportRPCServer extends Base.TransportRPCServer {
  constructor (client, conf) {
    super(client, conf)
    this.conf = conf

    this.init()
  }

  getSocket () {
    return utp
  }

  listen (port) {
    const socket = this.getSocket()

    socket.on('message', (msg, rinfo) => {
      this.handleRequest({
        reply: (rid, err, res) => {
          this.sendReply(socket, rid, err, res, rinfo)
        }
      }, this.parse(msg), null, rinfo)
    }).bind(port)

    this.socket = socket
    this.port = port

    return this
  }

  parse (msg) {
    return parse(msg)
  }

  format (msg) {
    return format(msg)
  }

  handleRequest (handler, data, cert, additions) {
    if (!data) {
      this.emit('request-error')
      return
    }

    const rid = data[0]
    const key = data[1]
    const payload = data[2]

    this.emit(
      'request', rid, key, payload,
      {
        reply: (err, res) => {
          handler.reply(rid, err, res)
        }
      },
      cert,
      additions
    )
  }

  unlisten () {
    if (!this.socket) return
    try {
      this.socket.close()
    } catch (e) {}

    this.socket = null
  }

  sendReply (socket, rid, err, res, rinfo) {
    const buf = this.format([rid, err ? err.message : null, res])

    const port = rinfo.port
    const address = rinfo.address
    socket.send(buf, 0, buf.length, port, address)
  }

  _stop () {
    super._stop()
    this.unlisten()
  }
}

module.exports = TransportRPCServer
