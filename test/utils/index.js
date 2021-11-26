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

exports.spyOn = spyOn
