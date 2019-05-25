<template>
  <el-dialog
    width="500px"
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="dataForm.type">
          <el-radio :disabled="dataForm.id?true:false" v-for="(type, index) in dataForm.typeList" :label="index" :key="index">{{ type }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="dataForm.typeList[dataForm.type] + '名称'" prop="name">
        <el-input v-model="dataForm.name" :placeholder="dataForm.typeList[dataForm.type] + '名称'"></el-input>
      </el-form-item>
      <el-form-item label="上级菜单" prop="parentName" >
        <el-popover
          ref="menuListPopover"
          placement="bottom-start"
          trigger="click">
          <el-tree
            :data="menuList"
            :props="menuListTreeProps"
            node-key="id"
            ref="menuListTree"
            @current-change="menuListTreeCurrentChangeHandle"
            :highlight-current="true"
            :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:menuListPopover placeholder="点击选择上级菜单" class="menu-list__input" :clearable="true"></el-input>
      </el-form-item>
      <el-form-item v-if="dataForm.type === 1" label="菜单路由" prop="menuUrl" :class="{ 'is-required': dataForm.type === 1 }">
        <el-input v-model="dataForm.menuUrl" placeholder="菜单路由"></el-input>
      </el-form-item>
      <el-form-item v-if="dataForm.type !== 0" label="授权标识" prop="perms">
        <el-input v-model="dataForm.perms" placeholder="多个用逗号分隔, 如: user:list,user:create"></el-input>
      </el-form-item>
      <el-form-item v-if="dataForm.type !== 2" label="排序号" prop="sort">
        <el-input-number v-model="dataForm.sort" controls-position="right" :min="0" label="排序号"></el-input-number>
      </el-form-item>
      <el-form-item v-if="dataForm.type !== 2" label="菜单图标" prop="icon">
        <el-popover
          ref="iconListPopover"
          placement="bottom-start"
          trigger="click"
          popper-class="mod-sys__menu-icon-popover">
          <div class="mod-sys__menu-icon-list">
            <el-button
              v-for="(item, index) in dataForm.iconList"
              :key="index"
              @click="dataForm.icon = item"
              :class="{ 'is-active': dataForm.icon === item }">
              <icon-svg :name="item"></icon-svg>
            </el-button>
          </div>
        </el-popover>
        <el-input v-model="dataForm.icon" v-popover:iconListPopover placeholder="菜单图标名称" class="icon-list__input" :clearable="true"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { treeDataTranslate } from '@/utils'
import Icon from '@/icons'
export default {
  data () {
    var validateUrl = (rule, value, callback) => {
      if (this.dataForm.type === 1 && (!value || !/\S/.test(value))) {
        callback(new Error('菜单路由不能为空'))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      menuList: [],
      menuListTreeProps: {
        label: 'name',
        children: 'children'
      },
      dataForm: {
        id: 0,
        type: 1,
        typeList: ['目录', '菜单', '按钮'],
        name: '',
        parentId: 0,
        parentName: '',
        menuUrl: '',
        perms: '',
        sort: 0,
        icon: '',
        iconList: []
      },
      dataRule: {
        name: [
          { required: true, message: '必填项不能为空', trigger: 'blur' }
        ],
        menuUrl: [
          { validator: validateUrl, trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    'dataForm.type' (val) {
      this.$refs['dataForm'].clearValidate()
    }
  },
  methods: {
    init () {
      this.dataForm.iconList = Icon.getNameList()
      this.getMenuList().then(() => {
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.getMenuInfo()
          }
        })
      })
    },
    // 获取菜单列表
    getMenuList () {
      return this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/sys/menus/select`).then(({data}) => {
        if (data) {
          this.menuList = treeDataTranslate(data || [], 'id')
        }
      })
    },
    // 获取菜单信息
    getMenuInfo () {
      this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/sys/menus/${this.dataForm.id}`).then(({data}) => {
        if (data && data.code === 200) {
          this.dataForm.id = data.data.id
          this.dataForm.type = data.data.type
          this.dataForm.name = data.data.name
          this.dataForm.parentId = data.data.parentId
          this.dataForm.menuUrl = data.data.menuUrl
          this.dataForm.perms = data.data.perms
          this.dataForm.sort = data.data.sort
          this.dataForm.icon = data.data.icon
          // 菜单树设置当前选中节点
          this.$refs.menuListTree.setCurrentKey(this.dataForm.parentId)
          this.dataForm.parentName = this.dataForm.parentId === this.$refs.menuListTree.getCurrentKey()
            ? this.$refs.menuListTree.getCurrentNode()['name']
            : ''
        }
      })
    },
    // 菜单树选中
    menuListTreeCurrentChangeHandle (data, node) {
      this.dataForm.parentId = data.id
      this.dataForm.parentName = data.name
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dataForm.id !== 0) {
            this.$http.patch(
              `${window.SITE_CONFIG['baseURL']}/api/sys/menus/${this.dataForm.id}`,
              {
                'id': this.dataForm.id,
                'type': this.dataForm.type,
                'name': this.dataForm.name,
                'parentId': this.dataForm.parentName !== '' ? this.dataForm.parentId : 0,
                'menuUrl': this.dataForm.menuUrl,
                'perms': this.dataForm.perms,
                'sort': this.dataForm.sort,
                'icon': this.dataForm.icon
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
            this.$http.post(
              `${window.SITE_CONFIG['baseURL']}/api/sys/menus`,
              {
                'id': this.dataForm.id,
                'type': this.dataForm.type,
                'name': this.dataForm.name,
                'parentId': this.dataForm.parentName !== '' ? this.dataForm.parentId : 0,
                'menuUrl': this.dataForm.menuUrl,
                'perms': this.dataForm.perms,
                'sort': this.dataForm.sort,
                'icon': this.dataForm.icon
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

<style lang="scss">
  .mod-sys__menu {
    .menu-list__input,
    .icon-list__input {
       > .el-input__inner {
        cursor: pointer;
      }
    }
    &-icon-popover {
      max-width: 370px;
    }
    &-icon-list {
      padding: 0;
      margin: -8px 0 0 -8px;
      > .el-button {
        padding: 8px;
        margin: 8px 0 0 8px;
        > span {
          display: inline-block;
          vertical-align: middle;
          width: 18px;
          height: 18px;
          font-size: 18px;
        }
      }
    }
  }
</style>
