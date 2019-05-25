<template>
  <main class="site-content" :class="{ 'site-content--tabs': $route.meta.isTab }">
    <!-- 主入口标签页 s -->
    <el-dropdown v-if="$route.meta.isTab" class="site-content--tabs-tools" :show-timeout="0">
      <i class="el-icon-arrow-down el-icon--right"></i>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item @click.native="tabsCloseCurrentHandle">关闭当前标签页</el-dropdown-item>
        <el-dropdown-item @click.native="tabsCloseOtherHandle">关闭其它标签页</el-dropdown-item>
        <el-dropdown-item @click.native="tabsCloseAllHandle">关闭全部标签页</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-tabs
      v-if="$route.meta.isTab"
      v-model="$store.state.mainTabsActiveName"
      @tab-click="selectedTabHandle"
      @tab-remove="removeTabHandle">
      <el-tab-pane
        v-for="item in $store.state.mainTabs"
        :closable="true"
        :key="item.name"
        :label="item.title"
        :name="item.name"
        :class="{ 'is-iframe': item.type === 'iframe' }">
        <el-card shadow="never">
          <iframe
            v-if="item.type === 'iframe'"
            :src="item.iframeUrl"
            width="100%" height="100%" frameborder="0" scrolling="yes">
          </iframe>
          <keep-alive v-else>
            <router-view v-if="item.name === $store.state.mainTabsActiveName" />
          </keep-alive>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    <!-- 主入口标签页 e -->
    <el-card v-else shadow="never">
      <keep-alive>
        <router-view />
      </keep-alive>
    </el-card>
  </main>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  methods: {
    // tabs, 选中tab
    selectedTabHandle (tab) {
      tab = this.$store.state.mainTabs.filter(item => item.name === tab.name)
      if (tab.length >= 1) {
        this.$router.push({ name: tab[0].name })
      }
    },
    // tabs, 删除tab
    removeTabHandle (tabName) {
      this.$store.state.mainTabs = this.$store.state.mainTabs.filter(item => item.name !== tabName)
      if (this.$store.state.mainTabs.length >= 1) {
        // 当前选中tab被删除
        if (tabName === this.$store.state.mainTabsActiveName) {
          this.$router.push({ name: this.$store.state.mainTabs[this.$store.state.mainTabs.length - 1].name }, () => {
            this.$store.state.mainTabsActiveName = this.$route.name
          })
        }
      } else {
        this.$store.state.menuActiveName = 'home'
        this.$router.push({ name: 'home' })
      }
    },
    // tabs, 关闭当前
    tabsCloseCurrentHandle () {
      this.removeTabHandle(this.$store.state.mainTabsActiveName)
    },
    // tabs, 关闭其它
    tabsCloseOtherHandle () {
      this.$store.state.mainTabs = this.$store.state.mainTabs.filter(item => item.name === this.$store.state.mainTabsActiveName)
    },
    // tabs, 关闭全部
    tabsCloseAllHandle () {
      this.$store.state.mainTabs = []
      this.$store.state.menuActiveName = 'home'
      this.$router.push({ name: 'home' })
    }
  }
}
</script>
