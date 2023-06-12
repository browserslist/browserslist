#!/usr/bin/env node

let { join } = require('path')

let browserslist = require('../..')

let cases = [
  {
    exists: true,
    file: join(__dirname, 'one/app/css/hello.css'),
    n: 5000
  },
  {
    exists: true,
    file: join(__dirname, 'two/app/js/hello.js'),
    n: 5000
  },
  {
    exists: false,
    file: join(__dirname, 'three/app/js/hello.js'),
    n: 5000
  }
]

for (let { exists, file, n } of cases) {
  for (let i = 0; i < n; i++) {
    let result = browserslist.findConfig(file)
    if (!!result !== exists) {
      throw new Error('expected config to exist but it did not')
    }
  }
}
