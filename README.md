

[![Build Status](https://travis-ci.org/pigcan/less-json-import-loader.svg?branch=master)](https://travis-ci.org/pigcan/less-json-import-loader) [![Build status](https://ci.appveyor.com/api/projects/status/sk8hs3985idxm721/branch/master?svg=true)](https://ci.appveyor.com/project/pigcan/less-json-import-loader/branch/master) [![Coverage Status](https://coveralls.io/repos/github/pigcan/less-json-import-loader/badge.svg?branch=master)](https://coveralls.io/github/pigcan/less-json-import-loader?branch=master)

<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>less json import loader</h1>
  <p>load less variables or css variables from json sources to Less files</p>
</div>


<h2 align="center">Install</h2>

```bash
npm install --save-dev less-json-import-loader
```

<h2 align="center">Options</h2>

- `prefix`: `string`, defualt `json-import`

- `lessVariable`: `boolean`, defualt `true`

- `cssVariable`: `boolean`, defualt `true`

- `hash`: `boolean`, defualt `false`

<h2 align="center">Usage</h2>

```js
// webpack.config.js
{
  module: {
    rules: [
      { test: /\.less$/, use: [ "less-loader", "less-json-import-loader" ] }
    ]
  }
}
```

before:

```less
// a.less
@json-import "./test.json";
background: #222;
```

```json
// test.json
{
  "a": "#123456"
}
```

after

```less
@a-md5: 1;
:root {
  --a-md5: 1;
}
background: #222;
```

`md5`: it is the value of md5('path/to/test.json')
