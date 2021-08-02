const NS = global.NS

// 错误采集
NS.onPost('/api/error/handler', function(req, res) {
  const error = req.body
  if(error) {
    console.error('查询订单文件-异常', JSON.stringify(error))
  }
  res.send({
    success: true,
    message: '错误上送成功'
  })
})
