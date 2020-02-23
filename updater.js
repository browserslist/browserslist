var path = require('path')
var fs = require('fs')
var childProcess = require('child_process')
var Spinner = require('cli-spinner').Spinner

var BrowserslistError = require('./error')

var LOCKFILES = {
  npm: path.join(process.cwd(), 'package-lock.json'),
  yarn: path.join(process.cwd(), 'yarn.lock'),
  pnpm: path.join(process.cwd(), 'pnpm-lock.yaml')
}

var PM = {
  isNpm: false,
  isYarn: false,
  isPnpm: false
}

var UNKNOWN_VERSION = 'unknown version'

function updateDB () {
  checkPM()

  var lockfile = getLockfile()
  fs.readFile(lockfile, 'utf8', function (error, data) {
    if (error) {
      throw new BrowserslistError('A reading Lockfile error occurred')
    }

    var currentVersion = getCurrentVersion(data)
    var lastVersion = getLastVersion()

    if (currentVersion === lastVersion) {
      console.log('You have the latest version of caniuse-lite installed')
      return
    }

    console.log(
      'Current version: ' + currentVersion + '\n' +
      'New version: ' + lastVersion
    )

    var spinner = new Spinner('%s Updating caniuse-lite')
    spinner.start()

    fs.writeFile(lockfile, cleanupLockfile(data), function (writeError) {
      if (writeError) {
        throw new BrowserslistError('A writing Lockfile error occurred')
      }

      var command = getPackageManager(lockfile) + ' install'
      childProcess.exec(command, function (commandError) {
        spinner.stop(true)

        if (commandError) {
          throw new BrowserslistError(
            'An starting Package Manager error occurred'
          )
        }

        console.log('caniuse-lite has been successfully updated')
      })
    })
  })
}

function getLockfile () {
  if (PM.isYarn) {
    return LOCKFILES.yarn
  }

  if (PM.isPnpm) {
    return LOCKFILES.pnpm
  }

  return LOCKFILES.npm
}

function getPackageManager () {
  if (PM.isYarn) {
    return 'yarn'
  }

  if (PM.isPnpm) {
    return 'pnpm'
  }

  return 'npm'
}

function getCurrentVersion (data) {
  if (PM.isYarn) {
    return getYarnCaniuseVersion(data)
  }

  if (PM.isPnpm) {
    return getPnpmCaniuseVersion(data)
  }

  return getNpmCaniuseVersion(data)
}

function getNpmCaniuseVersion (data) {
  var parsedFile = JSON.parse(data)

  if (
    parsedFile.dependencies !== undefined &&
    parsedFile.dependencies['caniuse-lite'] !== undefined &&
    parsedFile.dependencies['caniuse-lite'].version !== undefined
  ) {
    return parsedFile.dependencies['caniuse-lite'].version
  }

  return UNKNOWN_VERSION
}

function getYarnCaniuseVersion (data) {
  var parsedFile = data.split('\n')
  var foundCaniuse = false

  for (var i = 0; i < parsedFile.length; i++) {
    var line = parsedFile[i]

    if (/^caniuse-lite/.test(line)) {
      foundCaniuse = true
      continue
    }

    if (foundCaniuse && /version/.test(line)) {
      var rule = /version "([^"]+)"/.exec(line)

      if (rule.length > 1) {
        return rule[1]
      }

      return UNKNOWN_VERSION
    }

    if (foundCaniuse && line === '') {
      foundCaniuse = false
    }
  }

  return UNKNOWN_VERSION
}

function getPnpmCaniuseVersion (data) {
  var parsedFile = data.split('\n')

  for (var i = 0; i < parsedFile.length; i++) {
    var line = parsedFile[i]

    if (/\/caniuse-lite/.test(line)) {
      var rule = /\/caniuse-lite\/([^:]+)/.exec(line)

      if (rule.length > 1) {
        return rule[1]
      }

      return UNKNOWN_VERSION
    }
  }

  return UNKNOWN_VERSION
}

function getLastVersion () {
  var versions = childProcess
    .execSync('npm show caniuse-lite version')
    .toString()
    .split('\n')

  if (versions.length === 0) {
    throw new BrowserslistError(
      'Error getting the latest version of caniuse-lite'
    )
  }

  return versions[0]
}

function cleanupLockfile (data) {
  if (PM.isYarn) {
    return cleanupYarnLock(data)
  }

  if (PM.isPnpm) {
    return cleanupPnpmLock(data)
  }

  var parsedNpmData = JSON.parse(data)
  delete parsedNpmData.dependencies['caniuse-lite']
  return JSON.stringify(parsedNpmData)
}

function cleanupYarnLock (data) {
  var parsedFile = data.split('\n')
  var newData = []
  var foundCaniuse = false

  for (var i = 0; i < parsedFile.length; i++) {
    var line = parsedFile[i]

    if (/^caniuse-lite/.test(line)) {
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

function cleanupPnpmLock (data) {
  var parsedFile = data.split('\n')
  var newData = []
  var foundCaniuse = false

  for (var i = 0; i < parsedFile.length; i++) {
    var line = parsedFile[i]

    if (/\/caniuse-lite/.test(line)) {
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

function checkPM () {
  if (fs.existsSync(LOCKFILES.npm)) {
    PM.isNpm = true
    return
  }

  if (fs.existsSync(LOCKFILES.yarn)) {
    PM.isYarn = true
    return
  }

  if (fs.existsSync(LOCKFILES.pnpm)) {
    PM.isPnpm = true
    return
  }

  throw new BrowserslistError('Lockfile search error')
}

module.exports = updateDB
