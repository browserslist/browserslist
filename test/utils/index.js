const { test } = require('uvu');

const MAX_TIMEOUT = 10000

let testWithTimeout = (name, cb, ms) => test(name, async (...args) => {
  let timer
  try {
    await Promise.race([
      cb(...args),
      new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), ms || MAX_TIMEOUT)
      })
    ])
  } finally {
    clearTimeout(timer)
  }
})

let spyOn = (obj, methodName, impl) => {
  let origin = impl || obj[methodName]
  let fn = (...args) => {
    fn.called = true
    fn.calledTimes += 1
    fn.callArgs = args

    return origin.call(obj, ...args)
  }

  fn.called = false
  fn.calledTimes = 0
  fn.callArgs = []

  obj[methodName] = fn

  return fn
}

exports.testWithTimeout = testWithTimeout
exports.spyOn = spyOn
