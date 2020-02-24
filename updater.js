var path = require('path')
var fs = require('fs')
var childProcess = require('child_process')
var pkgUp = require('pkg-up')

var BrowserslistError = require('./error')

var PACKAGE_CANIUSE = 'caniuse-lite'

var packageManager = ''

function updateDB () {
  var lockfile = getLockfile()

  fs.readFile(lockfile, 'utf8', function (readError, lockfileRaw) {
    if (readError) {
      throw readError
    }

    var currentVersion = getCurrentVersion(lockfileRaw)
    var lastVersion = getLastVersion()

    if (currentVersion === lastVersion) {
      console.log(
        'You have the latest version of ' + PACKAGE_CANIUSE + ' installed'
      )
      return
    }

    console.log(
      'Current version: ' + currentVersion + '\n' +
      'New version: ' + lastVersion + '\n' +
      'Updating ' + PACKAGE_CANIUSE + '...'
    )

    fs.writeFile(lockfile, updateLockfile(lockfileRaw), function (writeError) {
      if (writeError) {
        throw writeError
      }

      var command = getPackageManager(lockfile) + ' install'
      childProcess.exec(command, function (commandError) {
        if (commandError) {
          throw commandError
        }

        console.log(PACKAGE_CANIUSE + ' has been successfully updated')
      })
    })
  })
}

function getLockfile () {
  var packagePath = pkgUp.sync()
  var rootDir = path.dirname(packagePath)

  var lockfileNpm = path.join(rootDir, 'package-lock.json')
  var lockfileYarn = path.join(rootDir, 'yarn.lock')
  var lockfilePnpm = path.join(rootDir, 'pnpm-lock.yaml')

  if (fs.existsSync(lockfileNpm)) {
    packageManager = 'npm'
    return lockfileNpm
  }

  if (fs.existsSync(lockfileYarn)) {
    packageManager = 'yarn'
    return lockfileYarn
  }

  if (fs.existsSync(lockfilePnpm)) {
    packageManager = 'pnpm'
    return lockfilePnpm
  }

  throw new BrowserslistError('Lockfile search error')
}

function getPackageManager () {
  if (packageManager === 'yarn') {
    return 'yarn'
  }

  if (packageManager === 'pnpm') {
    return 'pnpm'
  }

  return 'npm'
}

function getCurrentVersion (lockfileRaw) {
  if (packageManager === 'yarn') {
    return getYarnCaniuseVersion(lockfileRaw)
  }

  if (packageManager === 'pnpm') {
    return getPnpmCaniuseVersion(lockfileRaw)
  }

  return getNpmCaniuseVersion(lockfileRaw)
}

function getNpmCaniuseVersion (lockfileRaw) {
  var parsedFile = JSON.parse(lockfileRaw)

  if (
    parsedFile.dependencies !== undefined &&
    parsedFile.dependencies[PACKAGE_CANIUSE] !== undefined &&
    parsedFile.dependencies[PACKAGE_CANIUSE].version !== undefined
  ) {
    return parsedFile.dependencies[PACKAGE_CANIUSE].version
  }

  return 'unknown'
}

function getYarnCaniuseVersion (lockfileRaw) {
  var parsedFile = lockfileRaw.split('\n')
  var foundCaniuse = false

  for (var i = 0; i < parsedFile.length; i++) {
    var line = parsedFile[i]

    if (line.indexOf(PACKAGE_CANIUSE) === 0) {
      foundCaniuse = true
      continue
    }

    if (foundCaniuse && /version/.test(line)) {
      var rule = /version "([^"]+)"/.exec(line)

      if (rule.length > 1) {
        return rule[1]
      }

      return 'unknown'
    }

    if (foundCaniuse && line === '') {
      foundCaniuse = false
    }
  }

  return 'unknown'
}

function getPnpmCaniuseVersion (lockfileRaw) {
  var parsedFile = lockfileRaw.split('\n')

  for (var i = 0; i < parsedFile.length; i++) {
    var line = parsedFile[i]

    if (line.indexOf('/' + PACKAGE_CANIUSE) >= 0) {
      var rule = /\/([\d.]+):/.exec(line)

      if (rule.length > 1) {
        return rule[1]
      }

      return 'unknown'
    }
  }

  return 'unknown'
}

function getLastVersion () {
  var versions = childProcess
    .execSync('npm show ' + PACKAGE_CANIUSE + ' version')
    .toString()
    .split('\n')

  if (versions.length === 0) {
    throw new BrowserslistError(
      'Error getting the latest version of ' + PACKAGE_CANIUSE
    )
  }

  return versions[0]
}

function updateLockfile (lockfileRaw) {
  if (packageManager === 'yarn') {
    return cleanupYarnLock(lockfileRaw)
  }

  if (packageManager === 'pnpm') {
    return cleanupPnpmLock(lockfileRaw)
  }

  var parsedNpmData = JSON.parse(lockfileRaw)
  delete parsedNpmData.dependencies[PACKAGE_CANIUSE]
  return JSON.stringify(parsedNpmData)
}

function cleanupYarnLock (lockfileRaw) {
  var parsedFile = lockfileRaw.split('\n')
  var newData = []
  var foundCaniuse = false

  for (var i = 0; i < parsedFile.length; i++) {
    var line = parsedFile[i]

    if (line.indexOf(PACKAGE_CANIUSE) === 0) {
      foundCaniuse = true
      continue
    }

    if (foundCaniuse && line !== '') {
      continue
    }

    if (foundCaniuse) {
      foundCaniuse = false
      continue
    }

    newData.push(line)
  }

  return newData.join('\n')
}

function cleanupPnpmLock (lockfileRaw) {
  var parsedFile = lockfileRaw.split('\n')
  var newData = []
  var foundCaniuse = false

  for (var i = 0; i < parsedFile.length; i++) {
    var line = parsedFile[i]

    if (line.indexOf('/' + PACKAGE_CANIUSE) >= 0) {
      foundCaniuse = true
      continue
    }

    if (foundCaniuse && !/^\s+\/|\t\//.test(line)) {
      continue
    }

    if (foundCaniuse) {
      foundCaniuse = false
    }

    newData.push(line)
  }

  return newData.join('\n')
}

module.exports = updateDB
