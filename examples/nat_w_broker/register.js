'use strict'

exports.register = register
function register (peer, isServer, cb) {
  peer.request('etoro_broker', {
    service: 'etoro_cris',
    server: isServer
  }, { timeout: 10000 }, (err, data) => {
    if (err) return cb(err)

    const pool = Object.keys(data['etoro_cris'])

    const clients = pool.filter((el) => {
      const tmp = data['etoro_cris'][el]

      const isClient = !isServer
      if (isClient) {
        return tmp.server
      }

      return !tmp.server
    })

    const res = clients.map((el) => {
      return data['etoro_cris'][el]
    })

    cb(null, res)
  })
}
