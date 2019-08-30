#!/usr/bin/env node

let { join } = require('path')

let browserslist = require('../..')

let cases = [
  {
    file: join(__dirname, 'one/app/css/hello.css'),
    n: 5000,
    exists: true
  },
  {
    file: join(__dirname, 'two/app/js/hello.js'),
    n: 5000,
    exists: true
  },
  {
    file: join(__dirname, 'three/app/js/hello.js'),
    n: 5000,
    exists: false
  }
]

for (let { n, file, exists } of cases) {
  for (let i = 0; i < n; i++) {
    let result = browserslist.findConfig(file)
    if (!!result !== exists) {
      throw new Error('expected config to exist but it did not')
    }
  }
}
