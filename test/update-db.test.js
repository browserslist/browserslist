let { promisify } = require('util')
let { execSync } = require('child_process')
let createFsify = require('fsify')
let { tmpdir } = require('os')
let { join } = require('path')
let fs = require('fs')

let updateDd = require('../update-db')

let readFile = promisify(fs.readFile)
let fsify = createFsify({
  cwd: tmpdir(),
  persistent: false,
  force: true
})

async function createProject (name, lockfile) {
  let fixture = join(__dirname, 'fixtures', name)
  let pkgContent = await readFile(join(fixture, 'package.json'))
  let lockfileContent = await readFile(join(fixture, lockfile))

  let tree = await fsify([
    {
      type: fsify.DIRECTORY,
      name,
      contents: [
        {
          type: fsify.FILE,
          name: 'package.json',
          contents: pkgContent
        },
        {
          type: fsify.FILE,
          name: lockfile,
          contents: lockfileContent
        }
      ]
    }
  ])

  let fakedir = tree[0].name
  process.chdir(fakedir)
  return fakedir
}

function runUpdate () {
  let out = ''
  updateDd(str => {
    out += str
  })
  return out
}

let caniuse = JSON.parse(execSync('npm show caniuse-lite --json').toString())

afterEach(() => {
  process.chdir(join(__dirname, '..'))
})

it('throws on missing package.json', async () => {
  let tree = await fsify([
    {
      type: fsify.DIRECTORY,
      name: 'update-missing-package',
      contents: []
    }
  ])

  let directory = tree[0].name
  process.chdir(directory)

  expect(runUpdate).toThrow(
    'Cannot find package.json. ' +
    'Is it a right project to run npx browserslist --update-db?'
  )
})

it('throws on missing lockfile', async () => {
  let tree = await fsify([
    {
      type: fsify.DIRECTORY,
      name: 'update-missing-lockfile',
      contents: [
        {
          type: fsify.FILE,
          name: 'package.json',
          contents: '{}'
        }
      ]
    }
  ])

  let directory = tree[0].name
  process.chdir(directory)

  expect(runUpdate).toThrow(
    'No lockfile found. Run "npm install", "yarn install" or "pnpm install"'
  )
})

it('updates caniuse-lite if the user uses npm', async () => {
  let dir = await createProject('update-npm', 'package-lock.json')

  expect(runUpdate()).toEqual(
    'Current version: 1.0.30001030\n' +
    `New version: ${ caniuse.version }\n` +
    'Updating caniuse-lite…\n' +
    'caniuse-lite has been successfully updated'
  )

  let lock = JSON.parse(await readFile(join(dir, 'package-lock.json')))
  expect(lock.dependencies['caniuse-lite'].version).toEqual(caniuse.version)
})

it('missing caniuse-lite if the user uses npm', async () => {
  let dir = await createProject('update-npm-missing', 'package-lock.json')

  expect(runUpdate()).toEqual(
    `New version: ${ caniuse.version }\n` +
    'Updating caniuse-lite…\n' +
    'caniuse-lite has been successfully updated'
  )

  let lock = JSON.parse(await readFile(join(dir, 'package-lock.json')))
  expect(lock.dependencies['caniuse-lite']).toBeUndefined()
})

it('updates caniuse-lite if the user uses yarn', async () => {
  let dir = await createProject('update-yarn', 'yarn.lock')

  expect(runUpdate()).toEqual(
    'Current version: 1.0.30001035\n' +
    `New version: ${ caniuse.version }\n` +
    'Updating caniuse-lite…\n' +
    'caniuse-lite has been successfully updated'
  )

  let lock = (await readFile(join(dir, 'yarn.lock'))).toString()
  expect(lock).toContain(
    'caniuse-lite@^1.0.30001030:\n' +
    `  version "${ caniuse.version }"`
  )
})

it('updates caniuse-lite if the user uses pnpm', async () => {
  let dir = await createProject('update-pnpm', 'pnpm-lock.yaml')

  expect(runUpdate()).toEqual(
    'Current version: 1.0.30001035\n' +
    `New version: ${ caniuse.version }\n` +
    'Updating caniuse-lite…\n' +
    'caniuse-lite has been successfully updated'
  )

  let lock = (await readFile(join(dir, 'pnpm-lock.yaml'))).toString()
  expect(lock).toContain(`/caniuse-lite/${ caniuse.version }:`)
})
