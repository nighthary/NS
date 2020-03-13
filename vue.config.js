const webpack = require('webpack')
const path = require('path')
const utils = require('./build/utils.js')
const packageInfo = require('./package.json')

const isProduction = process.env.NODE_ENV === 'production'
const env = utils.getEnv()
const packName = utils.getPackName();
const getConfig = require('./build/config').getConfig
let config = getConfig(env)

// 拼接路径
const resolve = dir => require('path').join(__dirname, dir)
module.exports = {
  publicPath: config.assetsPublicPath,
  assetsDir: config.assetsSubDirectory,
  outputDir: config.outputDir,
  // publicPath: baseUrl,
  // outputDir: process.env.outputDir,
  productionSourceMap: !isProduction,
  configureWebpack: config => {
    if (isProduction) {
      // 生产环境删除console.log
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log']
    }

    // TODO:打包时忽略moment.js中的语言包（如果需要使用moment.js最好启动此配置）
    config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment/))
    config.plugins.push(new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'windows.jQuery': 'jquery'
    }))

    config.plugins.push(new webpack.DefinePlugin({
      'process.env.PROJECT_NAME': JSON.stringify(`${packName}`)
    }))

    config.plugins.push(function () {
      // 数据处理 用于生成 webpackMap
      this.plugin('done', function (map) {
        var webpackMap = {}
        // 调用 webpack map toJson 生成 jsonMap
        map = map.toJson()

        const entrypoints = map.entrypoints
        Object.keys(map.entrypoints).forEach(pageName => {
          if(!entrypoints[pageName].chunks.length) return
          const pageInfo = entrypoints[pageName]
          webpackMap[pageName] = {}
          webpackMap[pageName].js = []
          webpackMap[pageName].css = []
          ;[].concat(pageInfo.assets.forEach(mapAsset))
          /**
           * 根据资源类型，将其映射(map)到对应的数组中
           * @param assetsPath  资源路径
           */
          function mapAsset (assetsPath) {
            if (path.extname(assetsPath) === '.js') {
              // 绝对路径 = publicPath +  assetsPath
              webpackMap[pageName].js.push(map.publicPath + assetsPath)
            } else if (path.extname(assetsPath) === '.css') {
              webpackMap[pageName].css.push(map.publicPath + assetsPath)
            }
          }
        })
        const jsonPath = path.resolve(__dirname, `./${packageInfo.buildInfo.outPath}/ns-resource-map`)
        utils.mkdirsSync(jsonPath)
        require('fs').writeFileSync(path.resolve(jsonPath, 'resource-map.json'),
          JSON.stringify(webpackMap))
      })
    })
  },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    disableHostCheck: true,
    port: 8080
    // proxy: {
    //   // 配置跨域
    //   '/api': {
    //     target: process.env.VUE_APP_BASE_API,
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/api': ''
    //     }
    //   }
    // }
  },
  chainWebpack: config => {
    // 重新设置 alias
    config.resolve.alias
      .set('@', resolve('src/'))
      .set('assets', resolve('src/assets'))
      .set('views', resolve('src/views'))
      .set('components', resolve('src/components'))
      .set('utils', resolve('src/utils'))

    config.plugins.delete('html')
    // 移除 prefetch 插件
    config.plugins.delete('prefetch-index')
    // 移除 preload 插件
    config.plugins.delete('preload-index');
  },
  pages: {
    index: {
      entry: 'src/pages/index/index.js',
      filename: 'index.html',
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    ui: {
      entry: 'src/pages/ui/index.js',
      filename: 'index.html',
      chunks: ['chunk-vendors', 'chunk-common', 'ui']
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, './src/assets/css/app.less')]
    }
  }
}
