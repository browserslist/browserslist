const path = require('path')
const fs = require('fs')
const os = require('os')
const fsify = require('fsify')({
  cwd: os.tmpdir(),
  persistent: false,
  force: true
})
const execSync = require('child_process').execSync

const updateDB = require('../updateDB')
const BrowserslistError = require('../error')

const root = process.cwd()
const lastVersion = getLastVersion()

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => true)
})

afterEach(() => {
  process.chdir(root)
})

describe('updateDB function', () => {
  it('throws an error if the package.json does not exist', async () => {
    let structure = [
      {
        type: fsify.DIRECTORY,
        name: 'withoutPackageJson',
        contents: []
      }
    ]

    let tree = await fsify(structure)
    let withoutPackageJson = tree[0].name
    let message = 'Cannot find package.json'

    process.chdir(withoutPackageJson)

    expect(() => {
      updateDB()
    }).toThrow(new BrowserslistError(message))
  })

  it('throws an error if the lockfile does not exist', async () => {
    let structure = [
      {
        type: fsify.DIRECTORY,
        name: 'withoutLockfile',
        contents: [
          {
            type: fsify.FILE,
            name: 'package.json',
            contents: '{}'
          }
        ]
      }
    ]

    let tree = await fsify(structure)
    let withoutLockfile = tree[0].name
    let message = 'No lockfile found. Run "yarn install" or "npm install"'

    process.chdir(withoutLockfile)

    expect(() => {
      updateDB()
    }).toThrow(new BrowserslistError(message))
  })

  it('prints the latest version of caniuse-lite', async () => {
    let npmPackage = await createNpmPackage()
    let message = 'Fetching caniuse-lite ' + lastVersion + '...'

    process.chdir(npmPackage)

    updateDB()

    expect(console.log).toHaveBeenCalledWith(message)
  })

  it('updates caniuse-lite if user uses yarn', async () => {
    let packageJson = fs.readFileSync(
      path.resolve(root, 'test/fixtures/packageYarn/package.json'),
      'utf8'
    )
    let yarnLock = fs.readFileSync(
      path.resolve(root, 'test/fixtures/packageYarn/yarn.lock'),
      'utf8'
    )

    let structure = [
      {
        type: fsify.DIRECTORY,
        name: 'yarnPackage',
        contents: [
          {
            type: fsify.FILE,
            name: 'package.json',
            contents: packageJson
          },
          {
            type: fsify.FILE,
            name: 'yarn.lock',
            contents: yarnLock
          }
        ]
      }
    ]

    let tree = await fsify(structure)
    let yarnPackage = tree[0].name

    process.chdir(yarnPackage)

    updateDB()

    let newYarnLock = fs.readFileSync(
      path.resolve(yarnPackage, 'yarn.lock'),
      'utf8'
    )

    let content = newYarnLock.split('\n').join('')

    // eslint-disable-next-line
    let regExp = new RegExp(`caniuse-lite@.*  version "${ lastVersion }"`)

    expect(yarnLock).not.toEqual(newYarnLock)
    expect(regExp.test(content)).toEqual(true)
  })

  it('updates caniuse-lite if user uses npm', async () => {
    let packageLock = fs.readFileSync(
      path.resolve(root, 'test/fixtures/packageNpm/package-lock.json'),
      'utf8'
    )

    let packageNpm = await createNpmPackage()

    process.chdir(packageNpm)

    updateDB()

    let newPackageLock = fs.readFileSync(
      path.resolve(packageNpm, 'package-lock.json'),
      'utf8'
    )
    let content = JSON.parse(newPackageLock)
    let newVersion = content.dependencies['caniuse-lite'].version

    expect(packageLock).not.toEqual(newPackageLock)
    expect(newVersion).toEqual(lastVersion)
  })
})

function getLastVersion () {
  let output = execSync('npm show caniuse-lite version').toString()
  let version = output.split('\n')[0]

  return version
}

async function createNpmPackage () {
  let packageJson = fs.readFileSync(
    path.resolve(root, 'test/fixtures/packageNpm/package.json'),
    'utf8'
  )
  let packageLock = fs.readFileSync(
    path.resolve(root, 'test/fixtures/packageNpm/package-lock.json'),
    'utf8'
  )

  let structure = [
    {
      type: fsify.DIRECTORY,
      name: 'packageNpm',
      contents: [
        {
          type: fsify.FILE,
          name: 'package.json',
          contents: packageJson
        },
        {
          type: fsify.FILE,
          name: 'package-lock.json',
          contents: packageLock
        }
      ]
    }
  ]

  let tree = await fsify(structure)
  let packageNpm = tree[0].name

  return packageNpm
}
