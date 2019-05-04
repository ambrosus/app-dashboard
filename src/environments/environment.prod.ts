/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

let core: any = '';
let test = false;
let prod = true;
let dev = false;
let ambrosus = false;

try {
  core = location.hostname.split('.');
  core.shift();

  if (['ambrosus', 'ambrosus-dev', 'ambrosus-test'].indexOf(core[core.length - 2]) > -1) {
    ambrosus = true;
  }

  core = core.join('.');
  core = `https://${core}`;

  if (core.indexOf('-dev') > -1) {
    dev = true;
    prod = false;
  }
  if (core.indexOf('-test') > -1) {
    test = true;
    prod = false;
  }
} catch (error) { }

if (location.hostname === 'localhost' || location.hostname === 'herokuapp') {
  core = 'https://hermes.ambrosus-dev.com';
  dev = true;
  prod = false;
  ambrosus = true;
}

export const environment = {
  production: true,
  api: {
    core,
    extended: `${core}/extended`,
  },
  test,
  prod,
  dev,
  ambrosus,
};
