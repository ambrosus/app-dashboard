let core: any = '';
try {
  core = location.hostname.split('.');
  core.shift();
  core = core.join('.');
  core = `https://${core}`;
} catch (e) { }

export const environment = {
  production: true,
  api: {
    core,
    extended: '${core}/extended',
  },
};
