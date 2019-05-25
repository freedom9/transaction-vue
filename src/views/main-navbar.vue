<template>
<div>
  <nav class="site-navbar" :class="`site-navbar--${$store.state.navbarLayoutType}`">
    <div class="site-navbar__header">
      <h1 class="site-navbar__brand" @click="$router.push({ name: 'home' })">
        <a class="site-navbar__brand-lg" href="javascript:;">夕拾交易平台</a>
        <a class="site-navbar__brand-mini" href="javascript:;">夕拾</a>
      </h1>
    </div>
    <div class="site-navbar__body">
      <el-menu class="site-navbar__menu mr-auto" mode="horizontal">
        <el-menu-item class="site-navbar__switch" index="0" @click="$store.state.sidebarFold = !$store.state.sidebarFold">
          <icon-svg name="zhedie"></icon-svg>
        </el-menu-item>
      </el-menu>
      <el-menu class="site-navbar__menu" mode="horizontal">
        <el-menu-item class="site-navbar__avatar" index="2">
          <el-dropdown :show-timeout="0" placement="bottom">
            <span class="el-dropdown-link">
              <img src="~@/assets/img/head.jpg" :alt="$store.state.user.name">
              <span>{{ $store.state.user.name }}</span>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="updateUserHandle()">修改个人信息</el-dropdown-item>
              <el-dropdown-item @click.native="logoutHandle()">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-menu-item>
      </el-menu>
    </div>
  </nav>
  <!-- 弹窗, 修改用户信息 -->
  <update-user v-if="updateUserVisible" ref="updateUser"></update-user>
</div>
</template>

<script>
import UpdateUser from './main-navbar-update-user'
import { clearLoginInfo } from '@/utils'
export default {
  data () {
    return {
      updateUserVisible: false
    }
  },
  components: {
    UpdateUser
  },
  methods: {
    // 修改个人信息
    updateUserHandle () {
      this.updateUserVisible = true
      this.$nextTick(() => {
        this.$refs.updateUser.dataForm.id = localStorage.getItem('userId')
        this.$refs.updateUser.init()
      })
    },
    // 退出
    logoutHandle () {
      this.$confirm(`确定进行[退出]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.post(`${window.SITE_CONFIG['baseURL']}/api/sys/logout`).then(({data}) => {
          if (data && data.code === 200) {
            clearLoginInfo()
            this.$message.success(data.msg)
            this.$router.push({ name: 'login' })
          }
        })
      }).catch(() => {})
    }
  }
}
</script>
