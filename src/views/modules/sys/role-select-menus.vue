<template>
  <el-dialog
    width="450px"
    title="已有菜单"
    :close-on-click-modal="true"
    :visible.sync="visible">
    <el-form label-width="80px">
      <el-row>
        <el-col :span="12">
          <el-form-item size="mini">
            <el-tree
              :data="menuList"
              :props="menuListTreeProps"
              node-key="id"
              ref="menuListTree"
              default-expand-all="true">
            </el-tree>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script>
import { treeDataTranslate } from '@/utils'
export default {
  data () {
    return {
      visible: false,
      menuList: [],
      menuListTreeProps: {
        label: 'name',
        children: 'children'
      },
      dataForm: {}
    }
  },
  methods: {
    init () {
      Promise.all([
        this.getMenuList()
      ]).then(() => {
        this.visible = true
        this.$nextTick(() => {
          this.$refs.menuListTree.setCheckedKeys([])
        })
      })
    },
    // 获取菜单列表
    getMenuList () {
      return this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/sys/menus/roleId/${this.dataForm.id}`).then(({data}) => {
        this.menuList = treeDataTranslate(data || [], 'id')
      })
    }
  }
}
</script>
