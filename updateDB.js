var pkgUp = require('pkg-up')

function updateDB () {
  var pkgJson = pkgUp.sync()
  console.log(pkgJson)
}

module.exports = updateDB
