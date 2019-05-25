<template>
  <el-dialog
    width="500px"
    title="查看用户详情"
    :close-on-click-modal="true"
    :visible.sync="visible">
    <el-form :model="dataForm"  ref="dataForm" label-width="80px" disabled>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="dataForm.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="dataForm.password" type="password"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dataForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="dataForm.mobile"></el-input>
      </el-form-item>
       <el-form-item label="学校" prop="school">
        <el-input v-model="dataForm.school"></el-input>
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="dataForm.address"></el-input>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-input v-model="dataForm.createTime"></el-input>
      </el-form-item>
      <el-form-item label="角色" size="mini" prop="roleIds">
        <el-select size="small" v-model="dataForm.roleIds" filterable clearable placeholder="请选择" multiple>
          <el-option
            v-for="role in roleList"
            :key="role.id"
            :label="role.name"
            :value="role.id">
          </el-option>
        </el-select>
      </el-form-item>
       <el-form-item label="性别" size="mini" prop="sex">
        <el-radio-group v-model="dataForm.sex">
          <el-radio :label="0">女</el-radio>
          <el-radio :label="1">男</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="状态" size="mini" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :label="0">正常</el-radio>
          <el-radio :label="1">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      visible: false,
      roleList: [],
      dataForm: {
        id: 0,
        username: '',
        password: '',
        salt: '',
        email: '',
        mobile: '',
        school: '',
        address: '',
        roleIds: [],
        sex: 0,
        status: 0,
        createTime: ''
      }
    }
  },
  methods: {
    init () {
      Promise.all([
        this.getRoleList()
      ]).then(() => {
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.getUserInfo()
          }
        })
      })
    },
    // 获取角色列表
    getRoleList () {
      return this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/sys/roles/select`).then(({data}) => {
        if (data && data.code === 200) {
          this.roleList = data.data || []
        }
      })
    },
    // 获取用户信息
    getUserInfo () {
      this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/sys/users/${this.dataForm.id}`).then(({data}) => {
        if (data && data.code === 200) {
          this.dataForm.username = data.data.username
          this.dataForm.password = data.data.password
          this.dataForm.email = data.data.email
          this.dataForm.mobile = data.data.mobile
          this.dataForm.school = data.data.school
          this.dataForm.address = data.data.address
          this.dataForm.roleIds = data.data.roleIds
          this.dataForm.sex = data.data.sex
          this.dataForm.status = data.data.status
          this.dataForm.createTime = data.data.createTime
        }
      })
    }
  }
}
</script>
