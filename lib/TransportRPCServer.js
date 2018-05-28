'use strict'

const Base = require('grenache-nodejs-base')
const { parse, format } = require('./msg-encode.js')
const getSharedUtpSocket = require('./sharedSocket.js')

class TransportRPCServer extends Base.TransportRPCServer {
  constructor (client, conf) {
    super(client, conf)
    this.conf = conf

    this.init()
  }

  init () {
    super.init()

    this.utp = this.getSocket()
    this.socket = this.getSocket().socket
    this.hp = this.getSocket().hp
  }

  getSocket () {
    if (this.utp) return this.utp

    this.utp = getSharedUtpSocket(this.conf)
    this.socket = this.utp.socket
    this.hp = this.utp.hp

    return this.utp
  }

  listen (port) {
    if (port) throw new Error('manual port selection not supported')
    const socket = this.getSocket().socket

    this.registerSocket()

    socket.on('connection', (connection) => {
      connection.on('data', (data) => {
        const msg = this.parse(data)
        const rinfo = {
          address: connection.remoteAddress,
          port: connection.remotePort
        }

        this.handleRequest({
          reply: (rid, err, res) => {
            this.sendReply(connection, rid, err, res)
          }
        }, msg, null, rinfo)
      })

      connection.on('error', (err) => {
        // this.emit('error', err)
      })
    })

    this.socket = socket
    this.port = +this.hp.whoami().port

    return this
  }

  registerSocket () {
    if (!this.hp) {
      this.hp = this.getSocket().hp
    }

    if (this.hp.reg) {
      return
    }

    this.hp.reg = true
    this.hp.on('punched', (other) => {
      this.emit('punch', other)
    })

    this.hp.on('error', (err) => {
      console.error(err)
      console.trace()
    })

    this.socket.on('error', (err) => {
      console.error(err)
      console.trace()
    })
  }

  punch (target) {
    const hp = this.getSocket().hp

    this.registerSocket()

    hp.punch(target)
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
    socket.write(buf)
  }

  _stop () {
    super._stop()
    this.unlisten()
  }
}

module.exports = TransportRPCServer
