var electronReleasesLite = require('electron-releases/lite')
var fs = require('fs')

var converted = JSON.stringify(convertElectronReleaseData(
  electronReleasesLite))
fs.writeFileSync('e2cn.json', converted)

function getMajor (version) {
  return version.split('.')[0]
}

function convertElectronReleaseData (rawData) {
  var byVersion = {}
  var released = []
  var releasedMajor = []
  var versionsByMajor = {}
  var lastMajor = Number.MAX_SAFE_INTEGER

  for (var i = 0; i < rawData.length; ++i) {
    var entry = rawData[i]
    var version = entry.version
    var isReleased = entry.prerelease === false
    var isSupported = version.indexOf('-unsupported') < 0
    var isValid = !!entry.deps

    if (isValid && isReleased && isSupported) {
      var major = '' + getMajor(version)
      var chrome = '' + getMajor(entry.deps.chrome)
      var node = entry.deps.node

      var item = {
        electron: entry.version,
        chrome: chrome,
        node: node
      }
      byVersion[item.electron] = item
      released.unshift(item.electron)

      if (major !== lastMajor) {
        releasedMajor.unshift(major)
        versionsByMajor[major] = [version]
      } else {
        versionsByMajor[major].unshift(version)
      }

      lastMajor = major
    }
  }
  return {
    byVersion: byVersion, // items by version
    released: released, // versions chronological
    releasedMajor: releasedMajor, // major versions chronological
    versionsByMajor: versionsByMajor // version[] chronological by major
  }
}
