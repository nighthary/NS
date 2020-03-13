function getRandom(e) {
  e = e || 32;
  var t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  var a = t.length
  var n = ''
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}

const { digestDataBySM3WithSM2, sortData, verifyDataBySM3WithSM2 } = require('./lib/pki-base-node');
function doSign(data) {
  data = sortData(data)
  const dataStr = JSON.stringify(data);
  return digestDataBySM3WithSM2(dataStr, NS.config.PRI_KEY)
}

// const priKey = '22f59a57292c7ba441d5567b391834618a4ce6dd652b1d1d89fe3b2245031e89'
// const pubKey = '20ff6c4f84ce3d8c1b55579fdbb4394c0580460ab37bb4c800d5a04d99f7b35265b600cde9fec8c1d73f92957c5fec92a980acfbf5c322d823d691e57b0731f9'
// function cusSign(str) {
//   let sign = digestDataBySM3WithSM2(str, priKey)
//   console.log('sign  ', sign)
//   return sign
// }
// function verify(str, sign) {
//   let verifyRet = verifyDataBySM3WithSM2(str, sign, pubKey)
//   console.log('verify  ', verifyRet)
// }
// let obj = '{"orderPersonId":"1207556438012985344","random":"a1asd541891265365213"}'
// console.log(stringToBytes(obj))
// let signStr = cusSign(obj)
// // const objStr = JSON.stringify(obj)
// // console.log(objStr)
// verify(obj, signStr)

module.exports = {
  getRandom,
  doSign
}
