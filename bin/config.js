const config = {
  common: {
    port: 3000,
    logPath: '/data/nodeserver',
    // 是否开启错误日志采集
    isOpenErrorCapture: true
  },
  dev: {
    baseURI: 'http://127.0.0.1/aa'
  },
  test: {
    baseURI: 'http://127.0.0.1/aa'
  },
  sandbox: {
    port: 14120, // 沙箱环境端口不同
    baseURI: 'http://127.0.0.1/aa'
  },
  production: {
    baseURI: 'http://127.0.0.1/aa'
  }
}

/**
 * 获取项目配置
 * @param env 环境变量
 * @returns {*}
 */
module.exports.getConfig = function (env) {
  console.log('=====', env)
  return Object.assign(config.common, config[env])
}
