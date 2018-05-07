'use strict'

exports.parse = parse
function parse (buf) {
  let data = buf.toString()

  try {
    data = JSON.parse(data)
  } catch (e) {
    console.error(`ERR_REQUEST_PARSE: ${data}`)
    data = null
  }

  return data
}

exports.format = format
function format (data) {
  const msg = JSON.stringify(data)
  return Buffer.from(msg)
}
