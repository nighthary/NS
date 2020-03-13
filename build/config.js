var ip = require('ip');
const path = require('path')
const packageInfo = require('../package.json')
const utils = require('./utils.js')

var env = utils.getEnv();
var packName = utils.getPackName();
var staticLibURI;
switch(env) {
  case 'production':
    staticLibURI = ``
    break
  case 'local':
    staticLibURI = `//${ip.address()}:8080`
    break
  default:
    staticLibURI = `//${ip.address()}:8080`
    break
}

var config = {
  common: {
    resourcePath: path.join(__dirname, '../src'),
    assetsPublicPath: staticLibURI + `/${packName}/static/${packageInfo.name}/`,
    assetsSubDirectory: '',
    outputDir: path.join(__dirname, `../${packageInfo.buildInfo.outPath}/${packName}/static/${packageInfo.name}/`)
  }
}

/**
 * 获取项目配置
 * @param env 环境变量
 * @returns {*}
 */
module.exports.getConfig = function (env) {
  return Object.assign(config.common, config[env])
}
