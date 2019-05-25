<template>
  <el-dialog
    width="500px"
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="类型名称" prop="name">
      <el-input v-model="dataForm.name" placeholder="类型名称"></el-input>
    </el-form-item>
    <el-form-item label="描述" prop="description">
      <el-input v-model="dataForm.description" type="textarea" :rows="2" placeholder="描述"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      visible: false,
      dataForm: {
        id: 0,
        name: '',
        description: ''
      },
      dataRule: {
        name: [
          { required: true, message: '商品类型名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init () {
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.getInfo()
        }
      })
    },
    // 获取信息
    getInfo () {
      this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/goodstype/${this.dataForm.id}`).then(({data}) => {
        if (data && data.code === 200) {
          this.dataForm.name = data.data.name
          this.dataForm.description = data.data.description
        }
      })
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dataForm.id === 0) {
            this.$http.post(
              `${window.SITE_CONFIG['baseURL']}/api/goodstype`,
              {
                'id': this.dataForm.id,
                'name': this.dataForm.name,
                'description': this.dataForm.description
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
              `${window.SITE_CONFIG['baseURL']}/api/goodstype/${this.dataForm.id}`,
              {
                'id': this.dataForm.id,
                'name': this.dataForm.name,
                'description': this.dataForm.description
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
