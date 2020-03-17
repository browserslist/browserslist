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

  if (currentVersion != null) {
    console.log('Current version: ' + currentVersion)
  }
  console.log(
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
  if (!packagePath) {
    throw new BrowserslistError(
      'Cannot find package.json. ' +
      'Is it a right project to run npx browserslist --update-db?'
    )
  }

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
  if (packageManager === 'npm') {
    var parsedFile = JSON.parse(lockfileRaw)
    if (
      parsedFile.dependencies !== undefined &&
      parsedFile.dependencies[PACKAGE_CANIUSE] !== undefined
    ) {
      return parsedFile.dependencies[PACKAGE_CANIUSE].version
    }
    return null
  }

  var lines = lockfileRaw.split('\n')
  if (packageManager === 'yarn') {
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf(PACKAGE_CANIUSE + '@') >= 0) {
        var rowVersion = /version "([^"]+)"/.exec(lines[i + 1])
        if (rowVersion.length > 1) {
          return rowVersion[1]
        }
        return null
      }
    }
  } else if (packageManager === 'pnpm') {
    for (var j = 0; j < lines.length; j++) {
      if (lines[j].indexOf('/' + PACKAGE_CANIUSE) >= 0) {
        var rule = /\/([\d.]+):/.exec(lines[j])
        if (rule.length > 1) {
          return rule[1]
        }
        return null
      }
    }
  }

  return null
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
  var countLines = parsedLockfileLines.length
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
          .replace(/:\s*"([^"]+)"/, ': "' + info.version + '"')
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
    for (var j = 0; j < countLines; j++) {
      if (parsedLockfileLines[j].indexOf(PACKAGE_CANIUSE + '@') >= 0) {
        parsedLockfileLines[j + 1] = parsedLockfileLines[j + 1]
          .replace(/version "[^"]+"/, 'version "' + info.version + '"')
        parsedLockfileLines[j + 2] = parsedLockfileLines[j + 2]
          .replace(/resolved "[^"]+"/, 'resolved "' + info.dist.tarball + '"')
        parsedLockfileLines[j + 3] = parsedLockfileLines[j + 3]
          .replace(/integrity .+/, 'integrity ' + info.dist.integrity)
        j += 4
      }
    }
  } else if (packageManager === 'pnpm') {
    for (var k = 0; k < countLines; k++) {
      if (parsedLockfileLines[k].indexOf(PACKAGE_CANIUSE + ':') >= 0) {
        parsedLockfileLines[k] = parsedLockfileLines[k]
          .replace(/:\s.*$/, ': ' + info.version)
        continue
      }

      if (parsedLockfileLines[k].indexOf('/' + PACKAGE_CANIUSE) >= 0) {
        hasNecessaryDeps = true
        parsedLockfileLines[k] = parsedLockfileLines[k]
          .replace(/\/([^/]+)\/[^:]+:/, function (_, packageName) {
            return '/' + packageName + '/' + info.version + ':'
          })
        continue
      }

      if (!hasNecessaryDeps) {
        continue
      }

      if (parsedLockfileLines[k].indexOf('integrity:') >= 0) {
        parsedLockfileLines[k] = parsedLockfileLines[k]
          .replace(/integrity: .*$/, 'integrity: ' + info.dist.integrity)
      } else if (hasNecessaryDeps && /\s\//.test(parsedLockfileLines[k])) {
        hasNecessaryDeps = false
      }
    }
  }

  return parsedLockfileLines.join('\n')
}

module.exports = updateDB
