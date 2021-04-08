{
  "name": "browserslist",
  "version": "4.16.3",
  "description": "Share target browsers between different front-end tools, like Autoprefixer, Stylelint and babel-env-preset",
  "keywords": [
    "caniuse",
    "browsers",
    "target"
  ],
  "funding": {
    "type": "opencollective",
    "url": "https://opencollective.com/browserslist"
  },
  "author": "Andrey Sitnik <andrey@sitnik.ru>",
  "license": "MIT",
  "repository": "browserslist/browserslist",
  "scripts": {
    "test": "jest --coverage && eslint . && check-dts && size-limit && yaspeller *.md"
  },
  "dependencies": {
    "caniuse-lite": "^1.0.30001207",
    "colorette": "^1.2.2",
    "electron-to-chromium": "^1.3.710",
    "escalade": "^3.1.1",
    "node-releases": "^1.1.71"
  },
  "engines": {
    "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
  },
  "bin": {
    "browserslist": "cli.js"
  },
  "types": "./index.d.ts",
  "devDependencies": {
    "@logux/eslint-config": "^35.0.4",
    "@logux/sharec-config": "^0.5.7",
    "@size-limit/preset-small-lib": "^4.10.2",
    "@types/cross-spawn": "^6.0.2",
    "@types/fs-extra": "^9.0.10",
    "@types/jest": "^26.0.22",
    "check-dts": "^0.4.4",
    "clean-publish": "^2.1.1",
    "cross-spawn": "^7.0.3",
    "eslint": "^6.8.0",
    "eslint-config-standard": "^14.1.1",
    "eslint-plugin-es5": "^1.5.0",
    "eslint-plugin-import": "^2.22.1",
    "eslint-plugin-jest": "^23.18.0",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-prefer-let": "^1.1.0",
    "eslint-plugin-promise": "^4.2.1",
    "eslint-plugin-security": "^1.4.0",
    "eslint-plugin-standard": "^4.0.2",
    "eslint-plugin-unicorn": "^16.1.1",
    "fs-extra": "^8.1.0",
    "jest": "^25.5.4",
    "lint-staged": "^10.5.4",
    "nanoid": "^3.1.22",
    "simple-git-hooks": "^2.3.1",
    "size-limit": "^4.10.2",
    "ts-jest": "^25.5.1",
    "typescript": "^3.9.4",
    "yaspeller": "^7.0.0"
  },
  "browser": {
    "./node.js": "./browser.js",
    "path": false
  },
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "statements": 100
      }
    },
    "modulePathIgnorePatterns": [
      "<rootDir>/test/fixtures"
    ]
  },
  "size-limit": [
    {
      "path": "index.js",
      "limit": "14 KB"
    }
  ],
  "lint-staged": {
    "*.md": "yaspeller",
    "*.js": "eslint"
  },
  "eslintConfig": {
    "extends": "@logux/eslint-config/browser",
    "rules": {
      "security/detect-unsafe-regex": "off",
      "global-require": "off"
    }
  },
  "eslintIgnore": [
    "test/fixtures"
  ],
  "yaspeller": {
    "lang": "en",
    "ignoreCapitalization": true,
    "ignoreText": [
      " \\(by [^)]+\\)."
    ],
    "dictionary": [
      "albiventris",
      "algirus",
      "amurensis",
      "Atelerix",
      "Autoprefixer",
      "Baidu",
      "Browserify",
      "Browserslist",
      "Browserslist’s",
      "BrowserStack",
      "CLI",
      "compat",
      "configs",
      "Configs",
      "DynJS",
      "env",
      "Erinaceus",
      "eslint",
      "ESR",
      "frontalis",
      "GitHub",
      "iOS",
      "JS",
      "js",
      "JSDoc",
      "jspm",
      "KaiOS",
      "npm",
      "postcss",
      "QQ",
      "RegExp",
      "sclateri",
      "stylelint",
      "symlink",
      "Tidelift",
      "TP",
      "UC",
      "unreleased",
      "useragent",
      "Versioning",
      "webpack",
      "WebView",
      "browserslist",
      "PhantomJS",
      "maintainers",
      "ES",
      "deduplication",
      "pnpm",
      "VS"
    ]
  },
  "sharec": {
    "config": "@logux/sharec-config",
    "version": "0.5.7"
  }
}
