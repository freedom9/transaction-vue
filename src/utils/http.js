import axios from 'axios'
import Cookies from 'js-cookie'
import router from '@/router'
import qs from 'qs'
import isPlainObject from 'lodash/isPlainObject'
import { clearLoginInfo } from '@/utils'

const http = axios.create({
  timeout: 1000 * 30,
  withCredentials: true
})

/**
 * 请求拦截
 */
http.interceptors.request.use(config => {
  // token
  config.headers['token'] = Cookies.get('token')
  if (config.method === 'get') {
    if (isPlainObject(config.params)) {
      config.params = {
        ...config.params
      }
    }
  } else if (config.method === 'post') {
    if (isPlainObject(config.data)) {
      config.data = {
        ...config.data
      }
    }
    if (/^application\/x-www-form-urlencoded/.test(config.headers['content-type'])) {
      config.data = qs.stringify(config.data)
    }
  }
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 响应拦截
 */
http.interceptors.response.use(response => {
  if (response.data && response.data.code === 401) { // 401, token失效
    clearLoginInfo()
    router.replace({ name: 'login' })
  }
  return response
}, error => {
  return Promise.reject(error)
})

export default http
