<template>
  <aside class="site-sidebar" :class="`site-sidebar--${$store.state.sidebarLayoutSkin}`">
    <div class="site-sidebar__inner">
      <el-menu
        :default-active="$store.state.menuActiveName"
        :collapse="$store.state.sidebarFold"
        :collapseTransition="false"
        class="site-sidebar__menu">
        <el-menu-item index="home" @click="$router.push({ name: 'home' })">
          <icon-svg name="shouye" class="site-sidebar__menu-icon"></icon-svg>
          <span slot="title">首页</span>
        </el-menu-item>
        <sub-menu
          v-for="menu in menuList"
          :key="menu.id"
          :menu="menu"
          :dynamicMenuRoutes="dynamicMenuRoutes">
        </sub-menu>
      </el-menu>
    </div>
  </aside>
</template>

<script>
import SubMenu from './main-sidebar-sub-menu'
import { isURL } from '@/utils/validate'
export default {
  data () {
    return {
      menuList: [],
      dynamicMenuRoutes: []
    }
  },
  components: {
    SubMenu
  },
  watch: {
    $route: 'routeHandle'
  },
  created () {
    this.menuList = window.SITE_CONFIG['menuList'] || []
    this.dynamicMenuRoutes = window.SITE_CONFIG['dynamicMenuRoutes'] || []
    this.routeHandle(this.$route)
  },
  methods: {
    // 路由操作
    routeHandle (route) {
      if (route.meta.isTab) {
        // tab选中, 不存在先添加
        var tab = this.$store.state.mainTabs.filter(item => item.name === route.name)[0]
        if (!tab) {
          if (route.meta.isDynamic) {
            route = this.dynamicMenuRoutes.filter(item => item.name === route.name)[0]
            if (!route) {
              return console.error('未能找到可用标签页!')
            }
          }
          tab = {
            menuId: route.meta.menuId || route.name,
            name: route.name,
            title: route.meta.title,
            type: isURL(route.meta.iframeUrl) ? 'iframe' : 'module',
            iframeUrl: route.meta.iframeUrl || ''
          }
          this.$store.state.mainTabs = this.$store.state.mainTabs.concat(tab)
        }
        this.$store.state.menuActiveName = tab.menuId + ''
        this.$store.state.mainTabsActiveName = tab.name
      }
    }
  }
}
</script>
