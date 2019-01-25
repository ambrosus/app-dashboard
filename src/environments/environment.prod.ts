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
    // Fix for now, for dev working against -test
    core = 'https://hermes.ambrosus-test.com';
  }
  if (core.indexOf('-test') > -1) {
    test = true;
    prod = false;
  }
} catch (error) { }

if (location.hostname === 'localhost' || location.hostname === 'herokuapp') {
  core = 'https://hermes.ambrosus-test.com';
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
