// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
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
} catch (e) { }

if (location.hostname === 'localhost' || location.hostname === 'herokuapp') {
  core = 'https://hermes.ambrosus-test.com';
  dev = true;
  prod = false;
}

export const environment = {
  production: false,
  api: {
    core,
    extended: `${core}/extended`,
  },
  test,
  prod,
  dev,
  ambrosus,
};


/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
