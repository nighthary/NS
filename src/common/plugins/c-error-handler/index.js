import { sendError } from '@/api/error'
export default {
  install (Vue) {
    if (window.dlydInfo.isOpenErrorCapture) {
      Vue.config.errorHandler = (error, vm, mes) => {
        let info = {
          error: error,
          vm: vm,
          mes: mes
        }
        console.log(info)
        // 错误上报到收集报错的平台：error.message
        // 此处代码错误可以收集存储
        let date = new Date();
        let time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
        sendError({
          time: time,
          message: error.message,
          stack: error.stack
        }).then(() => {
          console.log('错误采集成功...')
        })
      }
    }
  }
}
