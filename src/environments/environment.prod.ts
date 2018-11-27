let core: any = '';
try {
  core = location.hostname.split('.');
  core.shift();
  core = core.join('.');
  core = `https://${core}`;
} catch (e) { }

if (location.hostname === 'localhost') { core = 'https://hermes.ambrosus-dev.com'; }

export const environment = {
  production: true,
  api: {
    core,
    extended: `${core}/extended`,
  },
};
