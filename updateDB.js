var path = require('path')
var fs = require('fs')
var childProcess = require('child_process')
var exec = childProcess.exec
var execSync = childProcess.execSync

function updateDB () {
  var lockfile = path.resolve(process.cwd(), 'package-lock.json')

  console.log('Installing caniuse-lite ' + getLastVersion())

  fs.readFile(lockfile, 'utf8', function (readError, data) {
    if (readError) {
      throw new Error(errors.readError)
    }

    var parsedData = JSON.parse(data)
    delete parsedData.dependencies['caniuse-lite']
    var newData = JSON.stringify(parsedData)

    fs.writeFile('package-lock.json', newData, function (writeError) {
      if (writeError) {
        throw new Error(errors.writeError)
      }

      exec('npm install', function (installError) {
        if (installError) {
          throw new Error(errors.installError)
        }

        console.log('caniuse-lite has been successfully updated')
      })
    })
  })
}

function getLastVersion () {
  var output = execSync('npm show caniuse-lite version').toString()
  var lastVersion = output.split('\n')[0]
  return lastVersion
}

var errors = {
  readError: 'An error occurred while reading package-lock.json, ' +
              'check that the file exists and is correct',
  writeError: 'An error occurred while writing package-lock.json',
  installError: 'An error occurred while install dependencies'
}

module.exports = updateDB
