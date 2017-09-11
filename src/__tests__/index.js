import test from 'ava';
import md5 from 'md5';

import { join } from 'path';

import jsonImportLoader from '../index';

const fixturesPath = join(__dirname, 'fixtures');

const run = function run(resourcePath, prefix, lessVariable, cssVariable, hash, content) {
  let queryString = [ '?' ];
  if (prefix) {
    queryString.push(`prefix=${prefix}`);
  }
  if (lessVariable) {
    queryString.push(`+lessVariable`);
  } else {
    queryString.push(`-lessVariable`);
  }
  if (cssVariable) {
    queryString.push(`+cssVariable`);
  } else {
    queryString.push(`-cssVariable`);
  }
  if (hash) {
    queryString.push(`+hash`);
  } else {
    queryString.push(`-hash`);
  }
  const context = {
    query: queryString.join(','),
    resourcePath,
  };

  const result = jsonImportLoader.call(context, content);

  return {
    result,
  };
};

test('run without options', (t) => {
  const jsonPath = join(fixturesPath, 'test.json');
  const { result } = run(join(fixturesPath, 'test.less'), false, true, true, false, '@json-import "test.json";background:#fff;'); // eslint-disable-line
  const expect =  `@a: a1;\n@b: b1;\n@c-c1: c1-1;\n:root {\n  --a: a1;\n  --b: b1;\n  --c-c1: c1-1;\n}\nbackground:#fff;`; // eslint-disable-line
  t.deepEqual(result, expect);
});

test('run with options all false', (t) => {
  const jsonPath = join(fixturesPath, 'test.json');
  const { result } = run(join(fixturesPath, 'test.less'), false, false, false, false, '@json-import "test.json";background:#fff;'); // eslint-disable-line
  const expect =  '@json-import "test.json";background:#fff;'; // eslint-disable-line
  t.deepEqual(result, expect);
});

test('run with options prefix is customPrefix', (t) => {
  const jsonPath = join(fixturesPath, 'test.json');
  const { result } = run(join(fixturesPath, 'test.less'), 'customPrefix', true, true, false, '@customPrefix "test.json";background:#fff;'); // eslint-disable-line
  const expect =  `@a: a1;\n@b: b1;\n@c-c1: c1-1;\n:root {\n  --a: a1;\n  --b: b1;\n  --c-c1: c1-1;\n}\nbackground:#fff;`; // eslint-disable-line
  t.deepEqual(result, expect);
});

test('run with options cssVariable false', (t) => {
  const jsonPath = join(fixturesPath, 'test.json');
  const { result } = run(join(fixturesPath, 'test.less'), 'customPrefix', true, false, false, '@customPrefix "test.json";background:#fff;'); // eslint-disable-line
  const expect =  `@a: a1;\n@b: b1;\n@c-c1: c1-1;\nbackground:#fff;`; // eslint-disable-line
  t.deepEqual(result, expect);
});

test('run with options lessVariable false', (t) => {
  const jsonPath = join(fixturesPath, 'test.json');
  const { result } = run(join(fixturesPath, 'test.less'), 'customPrefix', false, true, false, '@customPrefix "test.json";background:#fff;'); // eslint-disable-line
  const expect =  `:root {\n  --a: a1;\n  --b: b1;\n  --c-c1: c1-1;\n}\nbackground:#fff;`; // eslint-disable-line
  t.deepEqual(result, expect);
});

test('run with options hash true', (t) => {
  const jsonPath = join(fixturesPath, 'test.json');
  const { result } = run(join(fixturesPath, 'test.less'), 'customPrefix', true, true, true, '@customPrefix "test";background:#fff;'); // eslint-disable-line
  const expect =  `@a-${md5(jsonPath)}: a1;\n@b-${md5(jsonPath)}: b1;\n@c-c1-${md5(jsonPath)}: c1-1;\n:root {\n  --a-${md5(jsonPath)}: a1;\n  --b-${md5(jsonPath)}: b1;\n  --c-c1-${md5(jsonPath)}: c1-1;\n}\nbackground:#fff;`; // eslint-disable-line
  t.deepEqual(result, expect);
});

test('miss extension', (t) => {
  const jsonPath = join(fixturesPath, 'test.json');
  const { result } = run(join(fixturesPath, 'test.less'), 'customPrefix', true, false, true, '@customPrefix "test";background:#fff;'); // eslint-disable-line
  const expect =  `@a-${md5(jsonPath)}: a1;\n@b-${md5(jsonPath)}: b1;\n@c-c1-${md5(jsonPath)}: c1-1;\nbackground:#fff;`; // eslint-disable-line
  t.deepEqual(result, expect);
});

test('not existed json file', (t) => {
  const error = t.throws(() => {
    run(join(fixturesPath, 'test.less'), false, true, true, false, '@json-import "notExistedFile.json";background:#fff;'); // eslint-disable-line
  });
  t.is(error.message, `less-json-import loader: can't load "${join(fixturesPath, 'notExistedFile.json')}"`);
});

test('without json-import', (t) => {
  const { result } = run(join(fixturesPath, 'test.less'), false, true, true, false, 'background:#fff;'); // eslint-disable-line
  const expect =  'background:#fff;'; // eslint-disable-line
  t.deepEqual(result, expect);
});
