let { remove, copy, readFile, ensureDir } = require('fs-extra')
let { execSync } = require('child_process')
let { nanoid } = require('nanoid/non-secure')
let { tmpdir } = require('os')
let { join } = require('path')

let updateDd = require('../update-db')

const NODE_8 = process.version.startsWith('v8.')

jest.setTimeout(10000)

let testdir
afterEach(async () => {
  process.chdir(join(__dirname, '..'))
  await remove(testdir)
})

async function chdir (fixture, ...files) {
  testdir = join(tmpdir(), `browserslist-${ fixture }-${ nanoid() }`)
  await ensureDir(testdir)

  let from = join(__dirname, 'fixtures', fixture)
  await Promise.all(files.map(async i => {
    await copy(join(from, i), join(testdir, i))
  }))

  process.chdir(testdir)
  return testdir
}

function runUpdate () {
  let out = ''
  updateDd(str => {
    out += str
  })
  return out
}

function isInstalled (cmd) {
  return execSync(`whereis ${ cmd }`).toString().trim() !== `${ cmd }:`
}

let caniuse = JSON.parse(execSync('npm show caniuse-lite --json').toString())

it('throws on missing package.json', async () => {
  await chdir('update-missing')
  expect(runUpdate).toThrow(
    'Cannot find package.json. ' +
    'Is it a right project to run npx browserslist --update-db?'
  )
})

it('throws on missing lockfile', async () => {
  await chdir('update-missing', 'package.json')
  expect(runUpdate).toThrow(
    'No lockfile found. Run "npm install", "yarn install" or "pnpm install"'
  )
})

it('updates caniuse-lite for npm', async () => {
  let dir = await chdir('update-npm', 'package.json', 'package-lock.json')

  expect(runUpdate()).toContain(
    'Current version: 1.0.30001030\n' +
    `New version: ${ caniuse.version }\n` +
    'Removing old caniuse-lite from lock file\n' +
    'Installing new caniuse-lite version\n' +
    '$ npm install caniuse-lite\n' +
    'Cleaning package.json dependencies from caniuse-lite\n' +
    '$ npm uninstall caniuse-lite\n' +
    'caniuse-lite has been successfully updated\n'
  )

  let lock = JSON.parse(await readFile(join(dir, 'package-lock.json')))
  expect(lock.dependencies['caniuse-lite'].version).toEqual(caniuse.version)
})

it('updates caniuse-lite without previous version', async () => {
  let dir = await chdir('update-missing', 'package.json', 'package-lock.json')

  expect(runUpdate()).toContain(
    `New version: ${ caniuse.version }\n` +
    'Removing old caniuse-lite from lock file\n' +
    'Installing new caniuse-lite version\n' +
    '$ npm install caniuse-lite\n' +
    'Cleaning package.json dependencies from caniuse-lite\n' +
    '$ npm uninstall caniuse-lite\n' +
    'caniuse-lite has been successfully updated\n'
  )

  let lock = JSON.parse(await readFile(join(dir, 'package-lock.json')))
  expect(lock.dependencies['caniuse-lite']).toBeUndefined()
})

it('updates caniuse-lite for yarn', async () => {
  let dir = await chdir('update-yarn', 'package.json', 'yarn.lock')

  expect(runUpdate()).toContain(
    'Current version: 1.0.30001035\n' +
    `New version: ${ caniuse.version }\n` +
    'Removing old caniuse-lite from lock file\n' +
    'Installing new caniuse-lite version\n' +
    '$ yarn add caniuse-lite\n' +
    'Cleaning package.json dependencies from caniuse-lite\n' +
    '$ yarn remove caniuse-lite\n' +
    'caniuse-lite has been successfully updated\n'
  )

  let lock = (await readFile(join(dir, 'yarn.lock'))).toString()
  expect(lock).toContain(
    'caniuse-lite@^1.0.30001030:\n' +
    `  version "${ caniuse.version }"`
  )
})

if (!NODE_8 && (isInstalled('pnpm') || process.env.CI)) {
  it('updates caniuse-lite for pnpm', async () => {
    let dir = await chdir('update-pnpm', 'package.json', 'pnpm-lock.yaml')

    expect(runUpdate()).toContain(
      'Current version: 1.0.30001035\n' +
      `New version: ${ caniuse.version }\n` +
      'Removing old caniuse-lite from lock file\n' +
      'Installing new caniuse-lite version\n' +
      '$ pnpm install caniuse-lite\n' +
      'Cleaning package.json dependencies from caniuse-lite\n' +
      '$ pnpm uninstall caniuse-lite\n' +
      'caniuse-lite has been successfully updated\n'
    )

    let lock = (await readFile(join(dir, 'pnpm-lock.yaml'))).toString()
    expect(lock).toContain(`/caniuse-lite/${ caniuse.version }:`)
  })
}

it('shows target browser changes', async () => {
  let dir = await chdir('browserslist-diff',
    'package.json', 'package-lock.json')

  expect(runUpdate()).toEqual(
    'Current version: 1.0.30001030\n' +
    `New version: ${ caniuse.version }\n` +
    'Removing old caniuse-lite from lock file\n' +
    'Installing new caniuse-lite version\n' +
    '$ npm install caniuse-lite\n' +
    'Cleaning package.json dependencies from caniuse-lite\n' +
    '$ npm uninstall caniuse-lite\n' +
    'caniuse-lite has been successfully updated\n' +
    '\n' +
    'Target browser changes:\n' +
    '- chrome 83\n' +
    '+ chrome 86\n' +
    '- edge 84\n' +
    '+ edge 86\n' +
    '- firefox 80\n' +
    '- firefox 79\n' +
    '- firefox 78\n' +
    '+ firefox 82\n' +
    '+ firefox 81\n' +
    '+ firefox 68\n' +
    '- ios_saf 14.0\n' +
    '- ios_saf 13.0-13.1\n' +
    '- ios_saf 12.0-12.1\n' +
    '+ ios_saf 14\n' +
    '- opera 70\n' +
    '- opera 69\n' +
    '+ opera 72\n' +
    '+ opera 71\n'
  )

  let lock = JSON.parse(await readFile(join(dir, 'package-lock.json')))
  expect(lock.dependencies['caniuse-lite'].version).toEqual(caniuse.version)
})

it('shows error when browsers list can\'t be retrieved', async () => {
  let dir = await chdir('browserslist-diff-error',
    'package.json', 'package-lock.json')

  expect(runUpdate())
    .toContain(
      'Problem with browsers list retrieval. ' +
      'Target browser changes won\'t be shown.\n'
    )

  let lock = JSON.parse(await readFile(join(dir, 'package-lock.json')))
  expect(lock.dependencies['caniuse-lite'].version).toEqual(caniuse.version)
})
