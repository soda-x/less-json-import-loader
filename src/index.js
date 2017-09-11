import { resolve, join, dirname, extname } from 'path';
import { readFileSync } from 'fs';

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';
import md5 from 'md5';

export default function jsonImportLoader(content) {
  if (this.cacheable) this.cacheable();
  const defaultOpts = {
    prefix: 'json-import',
    cssVariable: true,
    lessVariable: true,
    hash: false,
  }

  let options = loaderUtils.getOptions(this) || {};
  options = {
    ...defaultOpts,
    ...options,
  };
  validateOptions(require('../options'), options, 'JSON Import Loader'); //eslint-disable-line

  const prefix = options.prefix;
  const cssVariable = options.cssVariable;
  const lessVariable = options.lessVariable;
  const hash = options.hash;
  if (!(cssVariable || lessVariable)) {
    return content;
  }
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
      const cssContent = [];
      (function exploreJson(currentLevel, path, hashString) {
        for (const key in currentLevel) { //eslint-disable-line
          switch (typeof currentLevel[key]) {
            case 'object':
              exploreJson(currentLevel[key], path.concat(key), hashString);
              break;
            default:
              if (lessVariable) {
                lessContent.push('@');
                if (hash) {
                  lessContent.push(path.concat(key).join('-'), '-', hashString);
                } else {
                  lessContent.push(path.concat(key).join('-'));
                }               
                lessContent.push(': ');
                lessContent.push(currentLevel[key]);
                lessContent.push(';\n');
              }
              if (cssVariable) {
                cssContent.push('  --');
                if (hash) {
                  cssContent.push(path.concat(key).join('-'), '-', hashString);
                } else {
                  cssContent.push(path.concat(key).join('-'));
                }
                cssContent.push(': ');
                cssContent.push(currentLevel[key]);
                cssContent.push(';\n'); 
              }
          }
        }
      }(jsonContent, [], md5(jsonPath)));

      if (lessVariable) {
        newContent[i] = lessContent.join('');
      }
      if (cssVariable) {
        const cssVariableString = `:root {\n${cssContent.join('')}}\n`;
        newContent[i] = newContent[i] ? `${newContent[i]}${cssVariableString}` : cssVariableString;
      }
      if (match[2]) {
        newContent[i] = newContent[i] ? `${newContent[i]}${match[2]}` : '';
      }
      
    } else {
      newContent[i] = contents[i];
    }
  }

  return newContent.join('\n');
}
