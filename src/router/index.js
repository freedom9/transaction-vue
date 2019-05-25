import Vue from 'vue'
import Router from 'vue-router'
import Cookies from 'js-cookie'
import http from '@/utils/http'
import { isURL } from '@/utils/validate'
import { clearLoginInfo } from '@/utils'

Vue.use(Router)

// 全局路由(无需嵌套上左右整体布局)
const globalRoutes = [
  { path: '/404', component: () => import('@/views/common/404'), name: '404', meta: { title: '404未找到' } },
  { path: '/login', component: () => import('@/views/common/login'), name: 'login', meta: { title: '登录' } }
]

// 主入口路由(需嵌套上左右整体布局)
const mainRoutes = {
  path: '/',
  component: () => import('@/views/main'),
  name: 'main',
  redirect: { name: 'home' },
  meta: { title: '主入口整体布局' },
  children: [
    // 通过meta对象设置路由展示方式
    // meta: {
    //   isTab: false, // 是否通过tab展示内容. false: 否(默认), true: 是
    //   iframeUrl: '' // 是否通过iframe嵌套展示内容. '': 否(默认), '以http[s]://开头': 是
    // }
    // 提示: 如需要通过iframe嵌套展示内容, 但不通过tab打开, 请创建组件使用iframe处理!
    { path: '/home', component: () => import('@/views/modules/home'), name: 'home', meta: { title: '首页' } }
  ],
  beforeEnter (to, from, next) {
    if (!Cookies.get('token')) {
      clearLoginInfo()
      next({ name: 'login', replace: true })
    } else {
      next()
    }
  }
}
const router = new Router({
  mode: 'hash',
  scrollBehavior: () => ({ y: 0 }),
  routes: globalRoutes.concat(mainRoutes)
})

router.beforeEach((to, from, next) => {
  // 添加动态(菜单)路由
  // 如果, 已经添加或者当前路由为全局路由, 可直接访问
  // 否则, 获取菜单列表, 添加并全局变量保存
  if (window.SITE_CONFIG['dynamicMenuRoutesHasAdded'] || fnCurrentRouteIsGlobalRoute(to, globalRoutes)) {
    next()
  } else {
    http.get(`${window.SITE_CONFIG['baseURL']}/api/sys/menus/nav`).then(({data}) => {
      if (data && data.code === 200) {
        window.SITE_CONFIG['menuList'] = data.data
        fnAddDynamicMenuRoutes(window.SITE_CONFIG['menuList'])
        next({ ...to, replace: true })
      } else {
        window.SITE_CONFIG['menuList'] = []
        next()
      }
    })
  }
})

/**
 * 判断当前路由是否为全局路由
 * @param {*} route 当前路由
 * @param {*} globalRoutes 全局路由
 */
function fnCurrentRouteIsGlobalRoute (route, globalRoutes = []) {
  var temp = []
  for (var i = 0; i < globalRoutes.length; i++) {
    if (globalRoutes[i].children && globalRoutes[i].children.length >= 1) {
      temp = temp.concat(globalRoutes[i].children)
    } else if (route.path === globalRoutes[i].path) {
      return true
    }
  }
  return temp.length >= 1 ? fnCurrentRouteIsGlobalRoute(route, temp) : false
}

/**
 * 添加动态(菜单)路由
 * @param {*} menuList 菜单列表
 * @param {*} routes 递归创建的动态(菜单)路由
 */
function fnAddDynamicMenuRoutes (menuList = [], routes = []) {
  var temp = []
  for (var i = 0; i < menuList.length; i++) {
    if (menuList[i].children && menuList[i].children.length >= 1) {
      temp = temp.concat(menuList[i].children)
    } else if (menuList[i].menuUrl && /\S/.test(menuList[i].menuUrl)) {
      var route = {
        path: '',
        component: null,
        name: '',
        meta: {
          menuId: menuList[i].id,
          title: menuList[i].name,
          isDynamic: true,
          isTab: true,
          iframeUrl: ''
        }
      }
      if (isURL(menuList[i].menuUrl)) {
        // 通过iframe展示, url以http[s]://开头
        route['path'] = `i-${menuList[i].id}`
        route['name'] = `i-${menuList[i].id}`
        route['meta']['iframeUrl'] = menuList[i].menuUrl
      } else {
        // 通过component展示
        menuList[i].menuUrl = menuList[i].menuUrl.replace(/^\//, '').replace(/_/g, '-')
        route['path'] = menuList[i].menuUrl.replace('/', '-')
        route['name'] = menuList[i].menuUrl.replace('/', '-')
        try {
          ((i) => {
            route['component'] = () => import(`@/views/modules/${menuList[i].menuUrl}`)
          })(i)
        } catch (e) {}
      }
      routes.push(route)
    }
  }
  if (temp.length >= 1) {
    fnAddDynamicMenuRoutes(temp, routes)
  } else {
    mainRoutes.name = 'main-dynamic'
    mainRoutes.children = routes
    router.addRoutes([
      mainRoutes,
      { path: '*', redirect: { name: '404' } }
    ])
    window.SITE_CONFIG['dynamicMenuRoutes'] = mainRoutes.children
    window.SITE_CONFIG['dynamicMenuRoutesHasAdded'] = true
  }
}

export default router
