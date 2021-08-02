
import axios from '@/request/index.js'

export function sendError (data) {
  return axios({
    url: '/error/handler',
    method: 'post',
    data: data
  })
}
