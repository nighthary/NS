'use strict';
/**
 * 网络请求工具方法
 * 入参说明
 * @param url 请求地址
 * @param method 请求类型 get/post
 * @param header 自定义的header
 * @param isSign 是否需要签名，默认为true
 * @param data 接口请求参数
 * @param form 是否以form表单请求接口，默认为false
 * @param file 是否为下载文件，默认为false
 * @param noPackUrl 是否需要拼接url，默认为false
 */
var request = require('request');

const { doSign, getRandom } = require('./index');
const dayjs = require('dayjs');

function packURI(url) {
  // 封装request请求 post get
  return NS.config.baseURI + url;
}
function prepareData(options) {
  options = Object.assign(options, {
    method: 'POST',
    isSign: true
  })

  let { url, data, isSign, header } = options

  header = Object.assign({
    'content-type': 'application/json'
  }, header)

  const defaultHead = {
    applyId: '123', // 默认任意值即可，不能为空
    appId: '123', // 默认任意值即可，不能为空
    dateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    version: 'string',
    productAppId: NS.config.APP_ID
  }
  data.head = {
    ...defaultHead,
    ...data.head,
    isId: (data.head && data.head.applyId) || ''
  }

  data.body = Object.assign({
    random: getRandom(128)
  }, data.body)
  data = convertData(data)
  if(isSign) {
    let sign = doSign(data.body)
    data.head.sign_msg = sign
  }
  if(!options.noPackUrl) {
    url = packURI(url);
  }
  console.log(url, ':', JSON.stringify(data))
  return {
    ...options,
    header,
    data,
    url
  }
}

// 将null/undefined转换为空字符串
function convertData(data) {
  for(var key in data) {
    if(typeof data[key] === 'object' && data[key] !== null) {
      data[key] = convertData(data[key])
    } else {
      if(data[key] === null || data[key] === undefined) {
        data[key] = ''
      }
    }
  }
  return data
}

function httpRequest(options) {
  if(options.file) {
    return requestFile(packURI(options.url));
  }
  options = prepareData(options);
  let { url, data, method, header } = options;
  method = method.toUpperCase();
  // form-data格式
  if(options.form) {
    return requestForm(Object.assign(options, {
      url,
      headers: header
    }));
  }
  return new Promise((resolve, reject) => {
    if (method === 'GET') {
      try {
        request({
          rejectUnauthorized: false,
          url: url,
          method: 'GET',
          headers: header,
          data
        }, function (error, response, body) {
          if(error) {
            return reject(error)
          }
          var data = JSON.parse(body)
          resolve(data)
        })
      } catch (err) {
        console.error('response data error', err);
        reject(err)
      }
    } else if (method === 'POST') {
      try {
        request({
          rejectUnauthorized: false,
          url: url,
          method: 'POST',
          headers: header,
          body: JSON.stringify(data)
        }, function (error, response, body) {
          if(error) {
            return reject(error)
          }
          var data = JSON.parse(body)
          resolve(data)
        });
      } catch (err) {
        console.error('response data error', err);
      }
    }
  })
}

/**
 * 表单请求
 * @param {} option 
 */
function requestForm(option) {
  return new Promise((resolve, reject) => {
    request({
      url: option.url,
      formData: option.data,
      method: 'POST',
      headers: option.headers
    }, function(err, response, body) {
      if(err) {
        return reject(err)
      }
      var data = JSON.parse(body)
      resolve(data)
    })
  })
}

/**
 * 直接下载文件并输出至前端
 */
function requestFile(url) {
  console.info('文件访问请求', url)
  return new Promise((resolve, reject) => {
    request.get({ 
      uri: url, 
      encoding: null 
    }, (err, res) => {
      if(err) {
        reject(err);
      } else {
        resolve(res.body);
      }
    });
  });
}

module.exports = httpRequest
