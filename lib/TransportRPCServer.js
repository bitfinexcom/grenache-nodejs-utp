'use strict'

const utp = require('./utp.js')

const Base = require('grenache-nodejs-base')
const { parse, format } = require('./msg-encode.js')

const CONTROL_HANDSHAKE = Buffer('ÿ')

class TransportRPCServer extends Base.TransportRPCServer {
  constructor (client, conf) {
    super(client, conf)
    this.conf = conf

    this.init()
  }

  getSocket () {
    if (this.socket) return this.socket

    return utp
  }

  getBoundSocket(port) {
    const socket = this.getSocket()

    if (!socket.bound) socket.bind(port)
    socket.bound = true

    return socket
  }

  listen (port) {
    const socket = this.socket = this.getBoundSocket(port)

    socket.on('message', (msg, rinfo) => {
      if (msg.equals(CONTROL_HANDSHAKE)) {
        console.log("received control char ÿ for punching from", rinfo)
        socket.emit('punch', rinfo)
        return
      }

      this.handleRequest({
        reply: (rid, err, res) => {
          this.sendReply(socket, rid, err, res, rinfo)
        }
      }, this.parse(msg), null, rinfo)
    })

    this.socket = socket
    this.port = +socket.address().port

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

    console.log(`sending reply! socket.send(${buf}, 0, ${buf.length}, ${port}, ${address})`)
    socket.send(buf, 0, buf.length, port, address)
  }

  _stop () {
    super._stop()
    this.unlisten()
  }
}

module.exports = TransportRPCServer
