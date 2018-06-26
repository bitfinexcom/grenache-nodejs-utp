'use strict'

exports.register = register
function register (peer, isServer, cb) {
  peer.request('fibo_broker', {
    service: 'fibonacci_worker',
    server: isServer
  }, { timeout: 10000 }, (err, data) => {
    if (err) return cb(err)

    const pool = Object.keys(data['fibonacci_worker'])

    const clients = pool.filter((el) => {
      const tmp = data['fibonacci_worker'][el]

      const isClient = !isServer
      if (isClient) {
        return tmp.server
      }

      return !tmp.server
    })

    const res = clients.map((el) => {
      return data['fibonacci_worker'][el]
    })

    cb(null, res)
  })
}
