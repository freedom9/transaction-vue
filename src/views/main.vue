<template>
  <div
    class="site-wrapper"
    :class="{ 'site-sidebar--fold': $store.state.sidebarFold }"
    v-loading.fullscreen.lock="loading"
    element-loading-text="拼命加载中">
    <template v-if="!loading">
      <main-navbar />
      <main-sidebar />
      <div class="site-content__wrapper">
        <main-content />
      </div>
    </template>
  </div>
</template>

<script>
import MainNavbar from './main-navbar'
import MainSidebar from './main-sidebar'
import MainContent from './main-content'
import debounce from 'lodash/debounce'
export default {
  data () {
    return {
      loading: true
    }
  },
  components: {
    MainNavbar,
    MainSidebar,
    MainContent
  },
  created () {
    Promise.all([
      this.getUserInfo(),
      this.getPermissions()
    ]).then(() => {
      this.loading = false
    })
  },
  mounted () {
    // 窗口resize实现媒体查询
    this.$store.state.sidebarFold = document.documentElement['clientWidth'] <= 992 || false
    window.addEventListener('resize', debounce(() => {
      this.$store.state.sidebarFold = document.documentElement['clientWidth'] <= 992 || false
    }, 150))
  },
  methods: {
    // 获取当前管理员信息
    getUserInfo () {
      let userId = localStorage.getItem('userId')
      return this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/sys/users/` + userId).then(({data}) => {
        if (data && data.code === 200) {
          this.$store.state.user.id = data.data.userId
          this.$store.state.user.name = data.data.username
        }
      })
    },
    // 获取权限
    getPermissions () {
      return this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/sys/menus/permissions`).then(({data}) => {
        window.SITE_CONFIG['permissions'] = data && data.code === 200 ? data.data : []
      })
    }
  }
}
</script>
