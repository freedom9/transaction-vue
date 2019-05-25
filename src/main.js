import Vue from 'vue'
import App from '@/App'
import router from '@/router'
import store from '@/store'
import '@/element-ui'
import '@/icons'
import '@/assets/scss/index.scss'
import http from '@/utils/http'
import { hasPermission } from '@/utils'
import cloneDeep from 'lodash/cloneDeep'

Vue.config.productionTip = false

// 挂载全局
Vue.prototype.$http = http
Vue.prototype.$hasPermission = hasPermission

// 保存整站vuex本地储存初始状态
window.SITE_CONFIG['storeState'] = cloneDeep(store.state)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
