'use strict'

const { URL } = require('url')

const CbQ = require('cbq')
const Base = require('grenache-nodejs-base')

const { parse, format } = require('./msg-encode.js')
const getSharedUtpSocket = require('./sharedSocket.js')

class TransportRPCClient extends Base.TransportRPCClient {
  constructor (client, conf) {
    super(client, conf)

    this.conf = conf

    this.init()
  }

  init () {
    super.init()
    this.cbq = new CbQ()

    this.utp = this.getSocket()
    this.socket = this.getSocket().socket
    this.hp = this.getSocket().hp

    this.registerSocket()
  }

  getSocket () {
    if (this.utp) return this.utp

    this.utp = getSharedUtpSocket(this.conf)
    this.socket = this.utp.socket
    this.hp = this.utp.hp

    return this.utp
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

  request (key, payload, opts, cb) {
    this.setLastRequestTime()

    this.cbq.push('req', (err) => {
      if (err) return cb(err)
      this._request(key, payload, opts, cb)
    })

    this.connect()
  }

  connect () {
    if (this.isConnected()) {
      return this.cbq.trigger('req')
    }

    if (this.isConnecting()) return

    this.disconnect()
    this.connecting()

    const u = new URL('http://' + this.conf.dest)
    u.host = this.conf.dest
    const { port, hostname: address } = u
    const target = {
      port: +port,
      address
    }

    const socket = this.socket
    this.registerSocket()

    const connection = this.connection = socket.connect(port, address)
    connection.on('connect', () => {
      this.connected()
      this.cbq.trigger('req')
    })

    connection.on('data', (data) => {
      data = this.parse(data)
      if (!data) return

      const [rid, _err, res] = data
      this.handleReply(rid, _err ? new Error(_err) : null, res)
    })

    connection.on('close', () => {
      this.disconnected()
      this.cbq.trigger('req', new Error('ERR_TRANSPORT_CLOSE'))
    })

    connection.on('error', (err) => {
      this.cbq.trigger('req', err)
    })
  }

  sendRequest (req) {
    const connection = this.connection

    connection.write(
      this.format([req.rid, req.key, req.payload])
    )
  }

  punch (target) {
    const hp = this.getSocket().hp

    this.registerSocket()
    hp.punch(target)
  }

  parse (data) {
    return parse(data)
  }

  format (data) {
    return format(data)
  }

  disconnect () {
    if (!this.connection) return
    try {
      this.connection.close()
    } catch (e) {}
    this.disconnected()
    this.connection = null
  }

  _stop () {
    super._stop()
    this.disconnect()
  }
}

module.exports = TransportRPCClient
