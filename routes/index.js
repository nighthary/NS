
const NS = global.NS
const render = require('../service/renderView.js')

let redirectURI = ''
if(NS.NODE_ENV === 'production') {
  redirectURI = ''
} else {
  redirectURI = 'http://127.0.0.1:8080'
}

NS.onGet('*', function(req, res, next) {
  console.log('接口请求', req.originalUrl)
  const nowPath = req.path;
  if(NS.Utils.isExPath(nowPath)) {
    next()
  } else {
    res.send(render('index'))
  }
})

NS.onGet('/', function(req, res) {
  res.send(render('index'))
})

NS.onGet('/ui*', function(req, res) {
  res.send(render('ui'))
})

// NS.onGet('/static/base-template/*', function(req, res) {
//   let url = req.originalUrl
//   res.redirect(`${redirectURI}${url}`)
// })
