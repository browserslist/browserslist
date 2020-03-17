let path = require('path')
let fs = require('fs')
let os = require('os')
let childProcess = require('child_process')
let fsify = require('fsify')({
  cwd: os.tmpdir(),
  persistent: false,
  force: true
})

let updateDB = require('../update-db')
let lastPackageInfo = getLastVersionInfo()

let rootDirectory = process.cwd()

afterEach(() => {
  process.chdir(rootDirectory)
})

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => true)
})

it('missing package.json', async () => {
  let tree = await fsify([
    {
      type: fsify.DIRECTORY,
      name: 'update-missing-package',
      contents: []
    }
  ])

  let directory = tree[0].name
  process.chdir(directory)

  let message = 'Cannot find package.json. ' +
    'Is it a right project to run npx browserslist --update-db?'

  expect(() => updateDB()).toThrow(message)
})

it('missing lockfile', async () => {
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

  let message =
    'No lockfile found. Run "npm install", "yarn install" or "pnpm install"'

  expect(() => updateDB()).toThrow(message)
})

it('get latest version', async () => {
  let spy = jest.spyOn(childProcess, 'execSync')
    .mockImplementation(() => { throw new Error('') })

  let npmProject = await createNpmProject()
  process.chdir(npmProject)

  let message = 'An error occurred getting information ' +
    'about the latest version of caniuse-lite.\n' +
    'Check your Internet connection.'

  expect(() => updateDB()).toThrow(message)
  spy.mockRestore()
})

it('prints the latest version', async () => {
  let npmProject = await createNpmProject()
  process.chdir(npmProject)

  let message1 = 'Current version: 1.0.30001030'
  let message2 = 'New version: ' + lastPackageInfo.version + '\n' +
    'Updating caniuse-lite…'
  let message3 = 'caniuse-lite has been successfully updated'

  updateDB()

  expect(console.log).toHaveBeenNthCalledWith(1, message1)
  expect(console.log).toHaveBeenNthCalledWith(2, message2)
  expect(console.log).toHaveBeenNthCalledWith(3, message3)
})

it('updates caniuse-lite if the user uses Npm', async () => {
  let npmProject = await createNpmProject()
  process.chdir(npmProject)

  updateDB()

  let newPackageLock = fs.readFileSync(
    path.resolve(npmProject, 'package-lock.json')
  )
  let content = JSON.parse(newPackageLock)
  let newVersion = content.dependencies['caniuse-lite'].version

  expect(newVersion).toEqual(lastPackageInfo.version)
})

it('missing caniuse-lite if the user uses Npm', async () => {
  let packageJson = fs.readFileSync(
    path.resolve(rootDirectory, 'test/fixtures/update-npm-missing/package.json')
  )
  let lockFile = fs.readFileSync(
    path.resolve(
      rootDirectory,
      'test/fixtures/update-npm-missing/package-lock.json'
    )
  )

  let tree = await fsify([
    {
      type: fsify.DIRECTORY,
      name: 'update-npm-missing',
      contents: [
        {
          type: fsify.FILE,
          name: 'package.json',
          contents: packageJson
        },
        {
          type: fsify.FILE,
          name: 'package-lock.json',
          contents: lockFile
        }
      ]
    }
  ])

  let directory = tree[0].name
  process.chdir(directory)

  updateDB()

  let newPackageLock = fs.readFileSync(
    path.resolve(directory, 'package-lock.json')
  )
  let content = JSON.parse(newPackageLock)
  let packageInfo = content.dependencies['caniuse-lite']

  expect(packageInfo).toBeUndefined()
})

it('updates caniuse-lite if the user uses Yarn', async () => {
  let packageJson = fs.readFileSync(
    path.resolve(rootDirectory, 'test/fixtures/update-yarn/package.json')
  )
  let lockFile = fs.readFileSync(
    path.resolve(rootDirectory, 'test/fixtures/update-yarn/yarn.lock')
  )

  let tree = await fsify([
    {
      type: fsify.DIRECTORY,
      name: 'update-yarn',
      contents: [
        {
          type: fsify.FILE,
          name: 'package.json',
          contents: packageJson
        },
        {
          type: fsify.FILE,
          name: 'yarn.lock',
          contents: lockFile
        }
      ]
    }
  ])

  let directory = tree[0].name
  process.chdir(directory)

  updateDB()

  let newLockFile = fs.readFileSync(path.resolve(directory, 'yarn.lock'))
  let raw = newLockFile.toString().split('\n').join('')
  let version = /caniuse-lite@[^:]+:\s+version\s+"([^"]+)"/.exec(raw)

  expect(version[1]).toEqual(lastPackageInfo.version)
})

it('updates caniuse-lite if the user uses Pnpm', async () => {
  let packageJson = fs.readFileSync(
    path.resolve(rootDirectory, 'test/fixtures/update-pnpm/package.json')
  )
  let lockFile = fs.readFileSync(
    path.resolve(rootDirectory, 'test/fixtures/update-pnpm/pnpm-lock.yaml')
  )

  let tree = await fsify([
    {
      type: fsify.DIRECTORY,
      name: 'update-pnpm',
      contents: [
        {
          type: fsify.FILE,
          name: 'package.json',
          contents: packageJson
        },
        {
          type: fsify.FILE,
          name: 'pnpm-lock.yaml',
          contents: lockFile
        }
      ]
    }
  ])

  let directory = tree[0].name
  process.chdir(directory)

  updateDB()

  let newLockFile = fs.readFileSync(path.resolve(directory, 'pnpm-lock.yaml'))
  let raw = newLockFile.toString().split('\n').join('')
  let version = /\/caniuse-lite\/([^:]+):/.exec(raw)

  expect(version[1]).toEqual(lastPackageInfo.version)
})

function getLastVersionInfo () {
  let raw = childProcess
    .execSync('npm show caniuse-lite --json')
    .toString()

  return JSON.parse(raw)
}

async function createNpmProject () {
  let packageJson = fs.readFileSync(
    path.resolve(rootDirectory, 'test/fixtures/update-npm/package.json')
  )
  let lockFile = fs.readFileSync(
    path.resolve(rootDirectory, 'test/fixtures/update-npm/package-lock.json')
  )

  let tree = await fsify([
    {
      type: fsify.DIRECTORY,
      name: 'update-npm',
      contents: [
        {
          type: fsify.FILE,
          name: 'package.json',
          contents: packageJson
        },
        {
          type: fsify.FILE,
          name: 'package-lock.json',
          contents: lockFile
        }
      ]
    }
  ])

  return tree[0].name
}
