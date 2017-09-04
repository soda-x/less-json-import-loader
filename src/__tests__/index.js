import test from 'ava';
import md5 from 'md5';

import { join } from 'path';

import jsonImportLoader from '../index';

const fixturesPath = join(__dirname, 'fixtures');

const run = function run(resourcePath, prefix, content) {
  const context = {
    ...prefix ? { query: `?prefix=${prefix}`, resourcePath } : { resourcePath },
  };

  const result = jsonImportLoader.call(context, content);

  return {
    result,
  };
};

test('run without options', (t) => {
  const jsonPath = join(fixturesPath, 'test.json');
  const { result } = run(join(fixturesPath, 'test.less'), false,'@json-import "test.json";background:#fff;'); // eslint-disable-line
  const expect =  `@a-${md5(jsonPath)}: a1;\n@b-${md5(jsonPath)}: b1;\n@c-c1-${md5(jsonPath)}: c1-1;\nbackground:#fff;`; // eslint-disable-line
  t.deepEqual(result, expect);
});

test('run with options', (t) => {
  const jsonPath = join(fixturesPath, 'test.json');
  const { result } = run(join(fixturesPath, 'test.less'), 'customPrefix','@customPrefix "test.json";background:#fff;'); // eslint-disable-line
  const expect =  `@a-${md5(jsonPath)}: a1;\n@b-${md5(jsonPath)}: b1;\n@c-c1-${md5(jsonPath)}: c1-1;\nbackground:#fff;`; // eslint-disable-line
  t.deepEqual(result, expect);
});

test('miss extension', (t) => {
  const jsonPath = join(fixturesPath, 'test.json');
  const { result } = run(join(fixturesPath, 'test.less'), 'customPrefix','@customPrefix "test";background:#fff;'); // eslint-disable-line
  const expect =  `@a-${md5(jsonPath)}: a1;\n@b-${md5(jsonPath)}: b1;\n@c-c1-${md5(jsonPath)}: c1-1;\nbackground:#fff;`; // eslint-disable-line
  t.deepEqual(result, expect);
});

test('not existed json file', (t) => {
  const error = t.throws(() => {
    run(join(fixturesPath, 'test.less'), false,'@json-import "notExistedFile.json";background:#fff;'); // eslint-disable-line
  });
  t.is(error.message, `less-json-import loader: can't load "${join(fixturesPath, 'notExistedFile.json')}"`);
});

test('miss extension', (t) => {
  const { result } = run(join(fixturesPath, 'test.less'), false,'background:#fff;'); // eslint-disable-line
  const expect =  'background:#fff;'; // eslint-disable-line
  t.deepEqual(result, expect);
});
