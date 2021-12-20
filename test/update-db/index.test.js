process.env.NO_COLOR = '1'

let { test } = require('uvu')
let { equal, match, throws } = require('uvu/assert')
let { remove, copy, readFile, ensureDir } = require('fs-extra')
let { execSync } = require('child_process')
let { nanoid } = require('nanoid/non-secure')
let { tmpdir } = require('os')
let { join } = require('path')

let updateDb = require('../../update-db')

const NODE_8 = process.version.startsWith('v8.')
const NODE_10 = process.version.startsWith('v10.')

let testdir
test.after.each(async () => {
  process.chdir(join(__dirname, '..'))
  await remove(testdir)
})

async function chdir(fixture, ...files) {
  testdir = join(tmpdir(), `browserslist-${fixture}-${nanoid()}`)
  await ensureDir(testdir)

  let from = join(__dirname, '..', 'fixtures', fixture)
  await Promise.all(
    files.map(async i => {
      await copy(join(from, i), join(testdir, i))
    })
  )

  process.chdir(testdir)
  return testdir
}

function runUpdate() {
  let out = ''
  updateDb(str => {
    out += str
  })
  return out
}

function isInstalled(cmd) {
  return execSync(`whereis ${cmd}`).toString().trim() !== `${cmd}:`
}

function checkRunUpdateContents(installedVersions, system) {
  let addCmd = system + (system === 'yarn' ? ' add -W' : ' install')
  let rmCmd = system + (system === 'yarn' ? ' remove -W' : ' uninstall')

  match(
    runUpdate(),
    `Latest version:     ${caniuse.version}\n` +
      'Installed version' +
      (installedVersions.indexOf(',') !== -1 ? 's:' : ': ') +
      ` ${installedVersions}\n` +
      'Removing old caniuse-lite from lock file\n' +
      'Installing new caniuse-lite version\n' +
      `$ ${addCmd} caniuse-lite\n` +
      'Cleaning package.json dependencies from caniuse-lite\n' +
      `$ ${rmCmd} caniuse-lite\n` +
      'caniuse-lite has been successfully updated\n'
  )
}

function checkRunUpdateNoChanges() {
  match(
    runUpdate(),
    `Latest version:     ${caniuse.version}\n` +
      `Installed version:  ${caniuse.version}\n` +
      'caniuse-lite is up to date\n'
  )
}

const yarnLockfile1Versions =
  'caniuse-lite@^1.0.30000981, ' +
  'caniuse-lite@^1.0.30001020, caniuse-lite@^1.0.30001030:'

const yarnLockfile2Versions =
  '"caniuse-lite@npm:^1.0.30000981, ' +
  'caniuse-lite@npm:^1.0.30001020, caniuse-lite@npm:^1.0.30001030":'

async function checkYarnLockfile(dir, version) {
  let yarnLockfileVersions = yarnLockfile1Versions
  let versionSyntax = `  version "${caniuse.version}"`

  if (version === 2) {
    yarnLockfileVersions = yarnLockfile2Versions
    versionSyntax = `  version: ${caniuse.version}`
  }

  let contents = (await readFile(join(dir, 'yarn.lock'))).toString()
  match(contents, `${yarnLockfileVersions}\n`)
  match(contents, `${yarnLockfileVersions}\n` + versionSyntax)
}

let caniuse = JSON.parse(execSync('npm show caniuse-lite --json').toString())

test('throws on missing package.json', async () => {
  await chdir('update-missing')
  throws(
    runUpdate,
    'Cannot find package.json. ' +
      'Is this the right directory to run `npx browserslist --update-db` in?'
  )
})

test('throws on missing lockfile', async () => {
  await chdir('update-missing', 'package.json')
  throws(
    runUpdate,
    'No lockfile found. Run "npm install", "yarn install" or "pnpm install"'
  )
})

test('shows target browser changes', async () => {
  let dir = await chdir(
    'browserslist-diff',
    'package.json',
    'package-lock.json'
  )

  match(
    runUpdate(),
    /(Target browser changes:\n([+-] \w+ [\d.-]+\n)+)|(No target browser changes)/
  )

  let lock = JSON.parse(await readFile(join(dir, 'package-lock.json')))
  equal(lock.dependencies['caniuse-lite'].version, caniuse.version)
})

test("shows an error when browsers list can't be retrieved", async () => {
  let dir = await chdir(
    'browserslist-diff-error',
    'package.json',
    'package-lock.json'
  )

  match(
    runUpdate(),
    'Problem with browser list retrieval.\n' +
      'Target browser changes won’t be shown.\n'
  )

  let lock = JSON.parse(await readFile(join(dir, 'package-lock.json')))
  equal(lock.dependencies['caniuse-lite'].version, caniuse.version)
})

test('updates caniuse-lite without previous version', async () => {
  let dir = await chdir('update-missing', 'package.json', 'package-lock.json')
  checkRunUpdateContents('none', 'npm')

  let lock = JSON.parse(await readFile(join(dir, 'package-lock.json')))
  equal(lock.dependencies['caniuse-lite'], undefined)
})

test('updates caniuse-lite for npm', async () => {
  let dir = await chdir('update-npm', 'package.json', 'package-lock.json')
  checkRunUpdateContents('1.0.30001030', 'npm')

  let lock = JSON.parse(await readFile(join(dir, 'package-lock.json')))
  equal(lock.dependencies['caniuse-lite'].version, caniuse.version)
})

test('skips the npm update if caniuse-lite is up to date', async () => {
  let dir = await chdir('update-npm', 'package.json', 'package-lock.json')
  checkRunUpdateContents('1.0.30001030', 'npm')

  let lock = JSON.parse(await readFile(join(dir, 'package-lock.json')))
  equal(lock.dependencies['caniuse-lite'].version, caniuse.version)

  checkRunUpdateNoChanges()
  lock = JSON.parse(await readFile(join(dir, 'package-lock.json')))
  equal(lock.dependencies['caniuse-lite'].version, caniuse.version)
})

test('updates caniuse-lite for npm-shrinkwrap', async () => {
  let dir = await chdir(
    'update-npm-shrinkwrap',
    'package.json',
    'npm-shrinkwrap.json'
  )
  checkRunUpdateContents('1.0.30001030', 'npm')

  let lock = JSON.parse(await readFile(join(dir, 'npm-shrinkwrap.json')))
  equal(lock.dependencies['caniuse-lite'].version, caniuse.version)
})

test('skips the npm-shrinkwrap update if caniuse-lite is up to date', async () => {
  let dir = await chdir(
    'update-npm-shrinkwrap',
    'package.json',
    'npm-shrinkwrap.json'
  )
  checkRunUpdateContents('1.0.30001030', 'npm')
  let lock = JSON.parse(await readFile(join(dir, 'npm-shrinkwrap.json')))
  equal(lock.dependencies['caniuse-lite'].version, caniuse.version)

  checkRunUpdateNoChanges()
  lock = JSON.parse(await readFile(join(dir, 'npm-shrinkwrap.json')))
  equal(lock.dependencies['caniuse-lite'].version, caniuse.version)
})

test('updates caniuse-lite for yarn', async () => {
  let dir = await chdir('update-yarn', 'package.json', 'yarn.lock')
  checkRunUpdateContents('1.0.30001035', 'yarn')
  checkYarnLockfile(dir)
})

test('updates caniuse-lite for yarn without integrity', async () => {
  let dir = await chdir(
    'update-yarn-without-integrity',
    'package.json',
    'yarn.lock'
  )
  checkRunUpdateContents('1.0.30001035', 'yarn')
  checkYarnLockfile(dir)
})

test('skips the yarn update if caniuse-lite is up to date', async () => {
  let dir = await chdir('update-yarn', 'package.json', 'yarn.lock')
  checkRunUpdateContents('1.0.30001035', 'yarn')
  checkYarnLockfile(dir)
  checkRunUpdateNoChanges()
  checkYarnLockfile(dir)
})

test('updates caniuse-lite for yarn with workspaces', async () => {
  let dir = await chdir('update-yarn-workspaces', 'package.json', 'yarn.lock')
  checkRunUpdateContents('1.0.30001156', 'yarn')
  checkYarnLockfile(dir)
})

if (!NODE_8 && !NODE_10) {
  test('updates caniuse-lite for yarn v2', async () => {
    let dir = await chdir('update-yarn-v2', 'package.json', 'yarn.lock')
    execSync('yarn set version berry')
    match(
      runUpdate(),
      `Latest version:     ${caniuse.version}\n` +
        'Updating caniuse-lite version\n' +
        '$ yarn up -R caniuse-lite\n' +
        'caniuse-lite has been successfully updated\n'
    )
    checkYarnLockfile(dir, 2)
    execSync('yarn set version classic')
  })
}

if (!NODE_8 && !NODE_10 && isInstalled('pnpm')) {
  test('updates caniuse-lite for pnpm', async () => {
    let dir = await chdir('update-pnpm', 'package.json', 'pnpm-lock.yaml')
    match(
      runUpdate(),
      `Latest version:     ${caniuse.version}\n` +
        'Updating caniuse-lite version\n' +
        '$ pnpm up caniuse-lite\n' +
        'caniuse-lite has been successfully updated\n'
    )

    let lock = (await readFile(join(dir, 'pnpm-lock.yaml'))).toString()
    match(lock, `/caniuse-lite/${caniuse.version}:`)
  })
}

test.run()
