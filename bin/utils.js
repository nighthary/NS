'use strict';
/**
 * 获取运行env
 */
const getEnv = () => {
  // 获取当前环境变量
  return process.env.NODE_ENV ? process.env.NODE_ENV : 'dev'
}

/**
 * 获取当前运行环境需要的包名
 * @param {String} env 当前运行环境
 */
const getPackName = (env) => {
  env = env || 'common'
  const packInfo =require('../package.json')
  return packInfo.buildInfo.projectName[env] || packInfo.buildInfo.projectName['common']
}

/**
 * 获得本机ip
 */
const getIps = () => {
  var ip = require('ip');
  var myip = ip.address();  // 本机IP
  return [myip, '127.0.0.1']
}
module.exports = {
  getEnv,
  getPackName,
  getIps
}
