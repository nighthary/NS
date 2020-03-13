var path = require('path')
var glob = require('glob')
var fs = require('fs')

/**
 * 获取入口表
 * @param globPath
 * @returns {{}}
 */
function getEntry (globPath) {
  var entries = {}
  var basename
  var tmp
  var pathname

  glob.sync(globPath).forEach(function (entry) {
    basename = path.basename(entry, path.extname(entry))
    tmp = entry.split('/').splice(-3)
    pathname = tmp.splice(-2, 1) + '/' + basename // 正确输出js和html的路径
    entries[pathname] = entry
  })
  console.log(`\n => ${globPath} base-entrys \n`)
  console.log(JSON.stringify(entries, null, '  '))
  return entries
}
/**
 * 递归创建目录
 * @param {String} dirname 路径
 */
function mkdirsSync (dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

/**
 * 获取环境标识 env , 默认是 `production`
 * @returns {string}
 * --mode env other
 */
function getEnv () {
  var argv = process.argv.slice(3);
  // 获取当前环境变量
  return argv[0] === '--mode' ? argv[1] : `production`;
}

/**
 * 根据打包时命令后面的环境名称 获取对应环境的包名
 * 默认值为common值对应的包名
 */
function getPackName() {
  const packageInfo = require('../package.json')
  var argv = process.argv.slice(3);
  // 获取当前环境变量
  const packName = argv[2] ? argv[2] : `common`;
  return packageInfo.buildInfo.projectName[packName] || packageInfo.buildInfo.projectName['common']
}

module.exports = {
  mkdirsSync: mkdirsSync,
  getEntry,
  getEnv,
  getPackName
}
