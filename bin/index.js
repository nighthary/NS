
var NSProxy = require('./nsproxy');
var routes = require('./routes');
var utils = require('./utils');

// 获取当前运行环境
const env = utils.getEnv();
const packName = utils.getPackName(env)
var NS = {
  NODE_ENV: env,
  projectName: packName
};

var nsProxy = new NSProxy();
NS.init = nsProxy.init.bind(nsProxy);
// 挂载路由
routes.mountRoutes(NS, nsProxy, NS.projectName);

global.NS = NS;

module.exports = NS
