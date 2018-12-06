var electronReleasesLite = require('electron-releases/lite')
var fs = require('fs')

var packed = JSON.stringify(pack(electronReleasesLite))
fs.writeFileSync('e2cn.json', packed)

function getMajor (version) {
  return version.split('.')[0]
}

function pack (rawData) {
  var data = rawData.filter(function (entry) {
    var version = entry.version
    var isReleased = entry.prerelease === false
    var isSupported = version.indexOf('-unsupported') < 0
    var isValid = !!entry.deps

    return isValid && isReleased && isSupported
  })

  var result = []

  for (var i = 0; i < data.length; ++i) {
    var entry = data[i]
    var version = entry.version
    var chrome = '' + getMajor(entry.deps.chrome)
    var node = entry.deps.node

    result.push(version)
    result.push(chrome)
    result.push(node)
  }

  return result
}
