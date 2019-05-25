<template>
  <el-dialog
    width="500px"
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="角色名称"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="dataForm.description" type="textarea" :rows="2" placeholder="描述"></el-input>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item size="mini" label="菜单授权">
            <el-tree
              :data="menuList"
              :props="menuListTreeProps"
              node-key="id"
              ref="menuListTree"
              show-checkbox>
            </el-tree>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
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
      dataForm: {
        id: 0,
        name: '',
        description: ''
      },
      dataRule: {
        name: [
          { required: true, message: '必填项不能为空', trigger: 'blur' }
        ]
      },
      tempKey: -666666 // 临时key, 用于解决tree半选中状态项不能传给后台接口问题.
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
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.getRoleInfo()
          }
        })
      })
    },
    // 获取菜单列表
    getMenuList () {
      return this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/sys/menus`).then(({data}) => {
        this.menuList = treeDataTranslate(data || [], 'id')
      })
    },
    // 获取角色信息
    getRoleInfo () {
      this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/sys/roles/${this.dataForm.id}`).then(({data}) => {
        if (data && data.code === 200) {
          this.dataForm.name = data.data.name
          this.dataForm.description = data.data.description
          // 功能授权
          this.$refs.menuListTree.setCheckedKeys(this.removeTreeTempKeyHandle(data.data.menuIdList))
        }
      })
    },
    // 移除tree临时key和半选中状态项
    removeTreeTempKeyHandle (list) {
      var idx = list.indexOf(this.tempKey)
      if (idx !== -1) {
        list.splice(idx, list.length - idx)
      }
      return list
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dataForm.id === 0) {
            this.$http.post(
              `${window.SITE_CONFIG['baseURL']}/api/sys/roles`,
              {
                'id': this.dataForm.id,
                'name': this.dataForm.name,
                'description': this.dataForm.description,
                'menuIdList': [
                  ...this.$refs.menuListTree.getCheckedKeys(),
                  ...[this.tempKey],
                  ...this.$refs.menuListTree.getHalfCheckedKeys()
                ]
              }
            ).then(({data}) => {
              if (data && data.code === 201) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          } else {
            this.$http.patch(
              `${window.SITE_CONFIG['baseURL']}/api/sys/roles/${this.dataForm.id}`,
              {
                'id': this.dataForm.id,
                'name': this.dataForm.name,
                'description': this.dataForm.description,
                'menuIdList': [
                  ...this.$refs.menuListTree.getCheckedKeys(),
                  ...[this.tempKey],
                  ...this.$refs.menuListTree.getHalfCheckedKeys()
                ]
              }
            ).then(({data}) => {
              if (data && data.code === 201) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        }
      })
    }
  }
}
</script>
