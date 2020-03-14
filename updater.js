var path = require('path')
var fs = require('fs')
var childProcess = require('child_process')
var pkgUp = require('pkg-up')

var BrowserslistError = require('./error')

var PACKAGE_CANIUSE = 'caniuse-lite'

function updateDB () {
  var info = getMainInfo()
  var lockfileRaw = fs.readFileSync(info.lockfile).toString()

  var currentVersion = getCurrentVersion(lockfileRaw, info.packageManager)
  var packageInfo = getLastVersionInfo()

  console.log(
    'Current version: ' + currentVersion + '\n' +
    'New version: ' + packageInfo.version + '\n' +
    'Updating ' + PACKAGE_CANIUSE + '…'
  )

  fs.writeFileSync(
    info.lockfile,
    updateLockfile(lockfileRaw, packageInfo, info.packageManager)
  )
  childProcess.execSync(info.packageManager + ' install')

  console.log(PACKAGE_CANIUSE + ' has been successfully updated')
}

function getMainInfo () {
  var packagePath = pkgUp.sync()
  var rootDir = path.dirname(packagePath)

  var packageManager = ''
  var lockfile = ''

  var lockfileNpm = path.join(rootDir, 'package-lock.json')
  var lockfileYarn = path.join(rootDir, 'yarn.lock')
  var lockfilePnpm = path.join(rootDir, 'pnpm-lock.yaml')

  if (fs.existsSync(lockfileNpm)) {
    packageManager = 'npm'
    lockfile = lockfileNpm
  } else if (fs.existsSync(lockfileYarn)) {
    packageManager = 'yarn'
    lockfile = lockfileYarn
  } else if (fs.existsSync(lockfilePnpm)) {
    packageManager = 'pnpm'
    lockfile = lockfilePnpm
  } else {
    throw new BrowserslistError('Lockfile search error')
  }

  return {
    packageManager: packageManager,
    lockfile: lockfile
  }
}

function getCurrentVersion (lockfileRaw, packageManager) {
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

function getLastVersionInfo () {
  try {
    var raw = childProcess
      .execSync('npm show ' + PACKAGE_CANIUSE + ' --json')
      .toString()

    return JSON.parse(raw)
  } catch (e) {
    throw new BrowserslistError(
      'An error occurred getting information about the latest version of ' +
      PACKAGE_CANIUSE +
      '.\n' +
      'Check your Internet connection.'
    )
  }
}

function updateLockfile (lockfileRaw, info, packageManager) {
  var parsedLockfileLines = lockfileRaw.split('\n')
  var hasNecessaryDeps = false

  if (packageManager === 'npm') {
    for (var i = 0; i < parsedLockfileLines.length; i++) {
      if (
        !hasNecessaryDeps &&
        parsedLockfileLines[i].indexOf(PACKAGE_CANIUSE) > 0 &&
        /:\s*{/.test(parsedLockfileLines[i])
      ) {
        hasNecessaryDeps = true
      }

      if (!hasNecessaryDeps) {
        continue
      }

      if (parsedLockfileLines[i].indexOf('"version"') > 0) {
        parsedLockfileLines[i] = parsedLockfileLines[i]
          .replace(/:\s*"([^"]+)"/, ': "^' + info.version + '"')
      } else if (parsedLockfileLines[i].indexOf('"resolved"') > 0) {
        parsedLockfileLines[i] = parsedLockfileLines[i]
          .replace(/:\s*"([^"]+)"/, ': "' + info.dist.tarball + '"')
      } else if (parsedLockfileLines[i].indexOf('"integrity"') > 0) {
        parsedLockfileLines[i] = parsedLockfileLines[i]
          .replace(/:\s*"([^"]+)"/, ': "' + info.dist.integrity + '"')
      } else if (parsedLockfileLines[i].indexOf('}') > 0) {
        hasNecessaryDeps = false
      }
    }
  } else if (packageManager === 'yarn') {
    return cleanupYarnLock(lockfileRaw)
  } else if (packageManager === 'pnpm') {
    return cleanupPnpmLock(lockfileRaw)
  }

  return parsedLockfileLines.join('\n')
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
