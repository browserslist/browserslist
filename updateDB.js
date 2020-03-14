var path = require('path')
var fs = require('fs')
var findUp = require('find-up')
var execSync = require('child_process').execSync

var BrowserslistError = require('./error')

function updateDB () {
  function getLastVersion () {
    var output = execSync('npm show caniuse-lite version').toString()
    var lastVersion = output.split('\n')[0]

    return lastVersion
  }

  function startsWithTwoSpaces (line) {
    return /^ {2}/.test(line)
  }

  var lockfile, packageManager

  var packageJson = findUp.sync('package.json')
  if (!packageJson) {
    throw new BrowserslistError('Cannot find package.json')
  }

  var npmLockfile = path.join(packageJson, '/../package-lock.json')
  var yarnLockfile = path.join(packageJson, '/../yarn.lock')

  if (fs.existsSync(npmLockfile)) {
    lockfile = npmLockfile
    packageManager = 'npm'
  } else if (fs.existsSync(yarnLockfile)) {
    lockfile = yarnLockfile
    packageManager = 'yarn'
  } else {
    throw new BrowserslistError(
      'No lockfile found. Run "yarn install" or "npm install"'
    )
  }

  console.log('Fetching caniuse-lite ' + getLastVersion() + '...')

  var parsedContent, newContent
  var content = fs.readFileSync(lockfile, 'utf8')

  if (packageManager === 'npm') {
    parsedContent = JSON.parse(content)

    if (parsedContent && parsedContent.dependencies) {
      delete parsedContent.dependencies['caniuse-lite']
    }

    newContent = JSON.stringify(parsedContent)
  } else if (packageManager === 'yarn') {
    parsedContent = content.split('\n')

    var line
    var isPkgDeleting = false
    var filteredContent = []

    for (var i = 0; i < parsedContent.length; i++) {
      line = parsedContent[i]

      if (/^caniuse-lite/.test(line)) {
        isPkgDeleting = true
        continue
      } else if (isPkgDeleting && startsWithTwoSpaces(line)) {
        if (!startsWithTwoSpaces(parsedContent[i + 1])) {
          isPkgDeleting = false
        }
        continue
      }

      filteredContent.push(line)
    }

    newContent = filteredContent.join('\n')
  }

  fs.writeFileSync(path.basename(lockfile), newContent)

  execSync(packageManager + ' install')

  console.log('Successfully updated caniuse-lite.')
}

module.exports = updateDB
