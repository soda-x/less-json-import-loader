import { resolve, join, dirname, extname } from 'path';
import { readFileSync } from 'fs';

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';
import md5 from 'md5';

export default function jsonImportLoader(content) {
  if (this.cacheable) this.cacheable();

  const options = loaderUtils.getOptions(this) || {};

  validateOptions(require('./options'), options, 'JSON Import Loader'); //eslint-disable-line

  const prefix = options.prefix || 'json-import';
  const importMatcher = new RegExp(`^\\s*@${prefix} "(.*?)";(.*)`);

  const contents = content.split('\n');
  const lessPath = this.resourcePath;
  const fileDir = dirname(lessPath);
  const newContent = [];
  for (let i = 0; i < contents.length; i += 1) {
    const match = importMatcher.exec(contents[i]);
    if (match) {
      // TODO: support resolve node_modules
      let jsonPath = resolve(join(fileDir, match[1]));
      if (extname(jsonPath) !== '.json') {
        jsonPath += '.json';
      }

      let jsonContent = {};
      try {
        jsonContent = JSON.parse(readFileSync(jsonPath, { encoding: 'utf-8', flat: 'rs' }));
      } catch (e) {
        throw new Error(`less-json-import loader: can't load "${jsonPath}"`);
      }

      const lessContent = [];
      (function exploreJson(currentLevel, path, hash) {
        for (const key in currentLevel) { //eslint-disable-line
          switch (typeof currentLevel[key]) {
            case 'object':
              exploreJson(currentLevel[key], path.concat(key), hash);
              break;
            default:
              lessContent.push('@');
              lessContent.push(path.concat(key).join('-'), '-', hash);
              lessContent.push(': ');
              lessContent.push(currentLevel[key]);
              lessContent.push(';\n');
          }
        }
      }(jsonContent, [], md5(jsonPath)));
      if (match[2]) {
        lessContent.push(match[2]);
      }
      newContent[i] = lessContent.join('');
    } else {
      newContent[i] = contents[i];
    }
  }

  return newContent.join('\n');
}
