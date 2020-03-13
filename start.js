var NS = require('./bin/index');
var packageInfo = require('./package.json')

NS.init({
  appDir: __dirname,
  appName: packageInfo.name,
  staticPath: packageInfo.buildInfo.outPath
}).catch(e => {
  console.error(e);
})
