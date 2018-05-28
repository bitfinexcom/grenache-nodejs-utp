'use strict'

const Events = require('events')

const utp = require('utp-native')
const Holepuncher = require('boxgloves')

const SERVER_PREFIX = 'ò'
const CLIENT_PREFIX = 'í'

const SERVER_PREFIX_BUF = Buffer.from('ò')
const CLIENT_PREFIX_BUF = Buffer.from('í')

function getNewBoundSocket (port) {
  const u = utp()
  u.listen(port)
  return u
}

class UtpSocket extends Events {
  constructor (conf) {
    super()

    this.conf = conf
    this.listening = false
  }

  bind () {
    if (this.socket) throw new Error('socket already bound')
    this.socket = this._getNewSocket(this.conf)
    return this
  }

  _getNewSocket (opts) {
    const socket = getNewBoundSocket(0)
    this.hp = new Holepuncher(socket, opts).register()
    this.socket = socket

    return socket
  }

  listen () {
    if (this.listening) return

    this.hp.on('msg',  (msg) => {
      this.emit('msg', msg)
    })

    this.hp.on('punched', (other) => {
      this.emit('punched', other)
    })

    this.hp.on('handshake', (other) => {
      this.emit('handshake', other)
    })

    this.hp.on('error', (err) => {
      console.log(err)
      console.trace()
      // this.emit('error', err)
    })

    this.listening = true

    return this
  }

  punch (target) {
    this.hp.punch(target)
  }

  whoami () {
    return this.hp.whoami()
  }

  send (buf, target) {
    this.hp.send(buf, target)
  }

  close () {
    if (!this.socket) return

    try {
      this.socket.close()
    } catch (e) {}

    this.socket = null
  }
}

module.exports = UtpSocket
