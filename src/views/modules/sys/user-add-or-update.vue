<template>
  <el-dialog
    width="500px"
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="dataForm.username" placeholder="登录帐号"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.password" type="password" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="comfirmPassword" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.comfirmPassword" type="password" placeholder="确认密码"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dataForm.email" placeholder="邮箱"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="dataForm.mobile" placeholder="手机号"></el-input>
      </el-form-item>
       <el-form-item label="学校" prop="school">
        <el-input v-model="dataForm.school" placeholder="学校"></el-input>
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="dataForm.address" placeholder="地址"></el-input>
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
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { isEmail, isMobile } from '@/utils/validate'
export default {
  data () {
    var validatePassword = (rule, value, callback) => {
      if (!this.dataForm.id && !/\S/.test(value)) {
        callback(new Error('必填项不能为空'))
      } else {
        callback()
      }
    }
    var validateComfirmPassword = (rule, value, callback) => {
      if (!this.dataForm.id && !/\S/.test(value)) {
        callback(new Error('必填项不能为空'))
      } else if (this.dataForm.password !== value) {
        callback(new Error('确认密码与密码输入不一致'))
      } else {
        callback()
      }
    }
    var validateEmail = (rule, value, callback) => {
      if (!isEmail(value)) {
        callback(new Error('邮箱格式错误'))
      } else {
        callback()
      }
    }
    var validateMobile = (rule, value, callback) => {
      if (!isMobile(value)) {
        callback(new Error('手机号格式错误'))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      roleList: [],
      dataForm: {
        id: 0,
        username: '',
        password: '',
        comfirmPassword: '',
        salt: '',
        email: '',
        mobile: '',
        school: '',
        address: '',
        roleIds: [],
        sex: 0,
        status: 0
      },
      dataRule: {
        username: [
          { required: true, message: '必填项不能为空', trigger: 'blur' }
        ],
        password: [
          { validator: validatePassword, trigger: 'blur' }
        ],
        comfirmPassword: [
          { validator: validateComfirmPassword, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '必填项不能为空', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '必填项不能为空', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
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
          this.dataForm.comfirmPassword = data.data.password
          this.dataForm.email = data.data.email
          this.dataForm.mobile = data.data.mobile
          this.dataForm.school = data.data.school
          this.dataForm.address = data.data.address
          this.dataForm.roleIds = data.data.roleIds
          this.dataForm.sex = data.data.sex
          this.dataForm.status = data.data.status
        }
      })
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dataForm.id === 0) {
            this.$http.post(
              `${window.SITE_CONFIG['baseURL']}/api/sys/users`,
              {
                'id': this.dataForm.id,
                'username': this.dataForm.username,
                'password': this.dataForm.password,
                'salt': this.dataForm.salt,
                'email': this.dataForm.email,
                'mobile': this.dataForm.mobile,
                'school': this.dataForm.school,
                'address': this.dataForm.address,
                'sex': this.dataForm.sex,
                'status': this.dataForm.status,
                'roleIds': this.dataForm.roleIds
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
              `${window.SITE_CONFIG['baseURL']}/api/sys/users/${this.dataForm.id}`,
              {
                'id': this.dataForm.id,
                'username': this.dataForm.username,
                'password': this.dataForm.password,
                'salt': this.dataForm.salt,
                'email': this.dataForm.email,
                'mobile': this.dataForm.mobile,
                'school': this.dataForm.school,
                'address': this.dataForm.address,
                'sex': this.dataForm.sex,
                'status': this.dataForm.status,
                'roleIds': this.dataForm.roleIds
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
