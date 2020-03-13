[TOC]

# H5-Nodejs版本

### 访问

访问地址：

```
<BASEURI>/<projectName>
```

**BASEURI**

>本地：http://localhost:3000
>

**projectName**

>配置在```package.json```中的```projectName```，此字段对应运维部署时定义的项目名（一般不区分环境）
>
>>node-server
>
>由于不同环境使用的项目名称可能不一致，因此在```package.json```中新增了不同环境时```projectName```不同的名称
>
>* 前端打包区分环境
>
>在```package.json```中定义脚本命令时，定义不同环境的打包脚本，并将对应环境变量放到参数```第五位```
>
>>"build:sandbox": "vue-cli-service build --mode production sandbox"
>>
>>sandbox：沙箱
>>
>>common：当不传入时的默认值
>
>* nodejs启动时区分环境
>
>启动命令中带入环境参数，nodej在启动项目和设置静态文件目录时，从```package.json```中动态获取对应值
>
>>pm2 start ns.json --env sandbox
>
>* 构建脚本
>
>因为项目打包启动时前端自定义脚本，所以不同环境的脚本注意修改对应环境的打包命令和启动命令
>
>>www：测试环境
>>
>>www-sandbox：沙箱环境
>>
>>wwww-prod：正式环境
>>
>>www-localize：本地化部署脚本

**访问示例**

>http://localhost:3000/node-server

## 项目说明

### 整体思路

1、前端打包生成静态资源目录在```ns-release```目录下，同时生成各个模块依赖静态资源映射表```resource-map.json```

2、nodejs启动服务，设置```ns-release```目录为静态文件目录

3、前端访问路由时，nodejs通过路由拦截区分视图访问还是接口访问（```api```开头），详见```bin/routes-utils.js```

4、读取ns-release目录下的resource-map.json输出前端页面（详见```service/renderView.js```）

#### ```history```模式

1、**vue-router初始化时配置mode为history模式，并配置base路径为项目路径**

```js
export default new Router({
  mode: 'history',
  base: `/${projectName}`,
  routes: []
})
```

**当前端为多入口时，需要在对应入口的```base```的中配置完整基础路径**

```
base: `/${projectname}/ui`
```

2、nodejs 对路由进行拦截处理（区分接口和界面）

```js
NS.onGet('*', function(req, res, next) {
  const nowPath = req.path;
  if(NS.Utils.isExPath(nowPath)) {
    next()
  } else {
    res.send(render('index'))
  }
})
```

**nodejs对public下的文件及路径处理**

>1.针对静态资源文件的路径进行重定向操作，根据不同环境设置不同地址
>
>2.并将静态资源文件添加到ExPath中（避免默认渲染到index视图）

```js
// routes/index.js
let redirectURI = ''
if(NS.NODE_ENV === 'production') {
  redirectURI = ''
} else {
  redirectURI = 'http://127.0.0.1:8080'
}
NS.onGet('/static/base-template/*', function(req, res) {
  let url = req.originalUrl
  res.redirect(`${redirectURI}${url}`)
})
```

```js
// bin/nsproxy.js line139 (mountRoutesUtil)
this._routesUtil.addExPath('static');
```

**nodejs 针对前端多入口的路由处理**

>1.配置路由渲染
>
>2.添加ExPath（避免默认渲染到index视图）

```js
// routes/index.js
NS.onGet('/ui*', function(req, res) {
  res.send(render('ui'))
})
```

```js
// bin/nsproxy.js line139 (mountRoutesUtil)
this._routesUtil.addExPath('ui');
```

3、视图渲染，renderView方法读取```resource-map.json```中的静态资源添加到界面中输出至前端加载界面

### 打包说明

#### 前端打包

1、打包时配置了静态资源路径（详情见代码配置）

2、打包完成之后在webpack中生成了各个模块所需要的js配置文件

```ns-release/resource-map.json```描述如下

**开发模式**

>资源地址为webpack-dev-server启动的文件热加载服务

```json
{
  "index": {
    "js": [
      "//192.168.7.192:8080/epact-h5-node/static/epactH5/index.js"
    ],
    "css": []
  }
}
```

**生产模式**

>生产模式则为相对路径--用于nodejs设置静态目录访问

```json
{
  "index": {
    "js": [
      "/epact-h5-node/static/epactH5/js/chunk-vendors.47df6356.js",
      "/epact-h5-node/static/epactH5/js/index.f82015a3.js"
    ],
    "css": [
      "/epact-h5-node/static/epactH5/css/chunk-vendors.8770b559.css",
      "/epact-h5-node/static/epactH5/css/index.cc3d2ab7.css"
    ]
  }
}
```

### 开发说明

1、所有的接口请求都定义在```src/api```目录下（接口请求根路径在```src/request/request.js```中添加）

2、package.json中```buildPath```、```projectName```、```name```必不可少

buildPath：决定前端代码输出目录及前端代码映射目录

projectName：项目访问时基础路径

name：前端资源&日志打印路径标记

3、nodejs所有的路由请求都放在```routes```目录下，只需要定义即可，bin下的框架代码会自动挂载并注册到```express```的路由对象中

4、nodejs配置文件，```bin/config.js```，通过启动时传入运行环境中的```env```进行区分

pm2启动：env配置在```ns.json```中，新增环境记得在ns.json中配置

node启动：直接在命令结尾添加```--env  test```即可

**ns.json**

```json
"env": {
  "NODE_ENV": "production"
},
"env_test": {
  "NODE_ENV": "test"
}
```

**config.js**

```js
const config = {
  common: {
    port: 3000,
    logPath: '/data/mcs-epact-h5'
  },
  dev: {
    baseURI: 'http://192.168.7.240:8081/m-epact'
  },
  test: {
    baseURI: 'http://192.168.100.211:80/epactcomm'
  }
}
```

**启动命令**

```shell
pm2 start ns.json --env test
pm2 start ns.json --env production
```

5、<u>**前端多入口时**</u>

* 在路由中的```base```配置为对应路由(```/projectName/entryName```)
* 在nodejs配置视图渲染拦截（```routes/index.js```）
* 将该视图添加到非默认渲染视图中(即添加至```ExPath```，```nxproxy-line139```)

### 目录结构说明

```
bin - nodejs层框架代码（主要用于启动服务，加载配置文件，自动挂载路由）
build - 前端代码打包时使用到的工具类
public - 部分无法通过nodejs输出的静态资源文件
routes - nodejs路由定义文件
service - nodes渲染输出前端页面
src - 前端代码根目录
	api - 接口请求定义
	assets - 前端静态资源
	common - 前端公共定义和工具类
		constants - 全局变量定义
		directives - vue指令
		filters - 全局filters
		plugins - vue插件（直接this.调用）
		utils - 全局工具类
	components - 前端公共组件
	mixins - vue mixins
	pages - 前端所有界面视图（分模块）
	request - 网络请求工具类
	store - vuex
utils - nodejs调用的工具类
gulpfile.js - 本地化部署时的打包文件
ns.json - pm2启动nodejs时调用的json
start.js - nodejs启动入口
vue.config.js - vue打包相关配置
www-* - 非本地部署时执行的脚本定义
```

### 本地化部署

1.执行```sh www-localize```脚本，将前后端代码打包至```ns-release-dist```

* 1.1 编译前端代码（```npm run build```）
* 1.2 拷贝```nodejs代码```、```package.json```、```打包脚本```（```gulp```）

2.拷贝```ns-release-dist```目录至目标机器，执行```sh www```即可