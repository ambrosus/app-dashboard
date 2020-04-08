var replace = require('replace-in-file');

var url = process.env.HERMES_URL || '';
try {
  let changedFiles = replace.sync({
    files: 'src/environments/environment.prod.ts',
    from: /{HERMES_URL}/g,
    to: url,
    allowEmptyPaths: false,
  });
  console.log('Update HERMES_URL: ' + url);
} catch (error) {
  console.error('Error occurred:', error);
}
