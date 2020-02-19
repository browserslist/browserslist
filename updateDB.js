var path = require('path')
var fs = require('fs')
var childProcess = require('child_process')
var exec = childProcess.exec
var execSync = childProcess.execSync

var packageManager = 'npm'

function updateDB () {
  var lockfile = getLockfile()

  console.log('Installing caniuse-lite ' + getLastVersion())

  fs.readFile(lockfile, 'utf8', function (readError, data) {
    if (readError) {
      throw readError
    }

    var newData = updateLockfile(data)

    fs.writeFile(path.basename(lockfile), newData, function (writeError) {
      if (writeError) {
        throw writeError
      }

      exec(packageManager + ' install', function (installError) {
        if (installError) {
          throw installError
        }

        console.log('caniuse-lite has been successfully updated')
      })
    })
  })
}

function getLockfile () {
  var packageLock = path.resolve(process.cwd(), 'package-lock.json')
  var yarnLock = path.resolve(process.cwd(), 'yarn.lock')
  var file = packageLock

  if (fs.existsSync(yarnLock)) {
    file = yarnLock
    packageManager = 'yarn'
  }

  return file
}

function getLastVersion () {
  var output = execSync('npm show caniuse-lite version').toString()
  var lastVersion = output.split('\n')[0]

  return lastVersion
}

function updateLockfile (data) {
  var parsedData, newData

  try {
    parsedData = JSON.parse(data)
    delete parsedData.dependencies['caniuse-lite']
    newData = JSON.stringify(parsedData)
  } catch (error) {
    parsedData = data.split('\n')
    var filteredData = parsedData.filter(function (line) {
      return !/^caniuse-lite/.test(line)
    })
    newData = filteredData.join('\n')
  }

  return newData
}

module.exports = updateDB
