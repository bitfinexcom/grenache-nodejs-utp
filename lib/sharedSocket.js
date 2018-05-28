'use strict'

const UtpSocket = require('./UtpSocket.js')

let socket = null
function sharedSocket (opts) {
  if (socket) return socket

  socket = new UtpSocket(opts)
  socket
    .bind()
    .listen()

  return socket
}

module.exports = sharedSocket
