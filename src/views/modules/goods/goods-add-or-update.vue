<template>
  <el-dialog
    width="500px"
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px" :disabled="dataForm.userId !== localItem && dataForm.id !== 0">
    <el-form-item label="商品编号" prop="goodsCode" v-if="dataForm.id">
      <el-input v-model="dataForm.goodsCode" placeholder="商品编号" disabled></el-input>
    </el-form-item>
    <el-form-item label="商品名称" prop="name">
      <el-input v-model="dataForm.name" placeholder="商品名称"></el-input>
    </el-form-item>
    <el-form-item label="商品类型" prop="typeId">
      <el-select size="small" v-model="dataForm.typeId" filterable clearable placeholder="请选择">
          <el-option
            v-for="index in typeList"
            :key="index.id"
            :label="index.name"
            :value="index.id">
          </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="商品价格" prop="price">
      <el-input-number v-model="dataForm.price" controls-position="right" :min="0"></el-input-number>
    </el-form-item>
    <el-form-item label="商品原价" prop="originalPrice">
      <el-input-number v-model="dataForm.originalPrice" controls-position="right" :min="0"></el-input-number>
    </el-form-item>
    <el-form-item label="商品数量" prop="number">
      <el-input-number v-model="dataForm.number" controls-position="right" :min="1"></el-input-number>
    </el-form-item>
    <el-form-item label="商品图片" prop="imageUrl">
      <el-upload
        class="avatar-uploader"
        action=""
        :http-request="uploadImage"
        :on-preview="handlePreview"
        :on-remove="handleRemove">
        <img v-if="dataForm.imageUrl" :src="dataForm.imageUrl" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dataForm.imageUrl" alt="">
      </el-dialog>
    </el-form-item>
    <el-form-item label="新旧程度" prop="degree">
      <el-select v-model="dataForm.degree" filterable allow-create default-first-option placeholder="请选择新旧程度">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-if="this.dataForm.id" label="是否下架" prop="undercarriage">
      <el-radio-group v-model="dataForm.undercarriage">
          <el-radio :label="0">否</el-radio>
          <el-radio :label="1">是</el-radio>
        </el-radio-group>
    </el-form-item>
    <el-form-item label="商品描述" prop="description">
      <el-input v-model="dataForm.description" type="textarea" placeholder="商品描述"></el-input>
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
      fileList: [],
      typeList: [],
      dialogVisible: false,
      localItem: Number(localStorage.getItem('userId')),
      dataForm: {
        id: 0,
        goodsCode: '',
        name: '',
        originalPrice: '',
        price: '',
        number: '',
        imageName: '',
        imageUrl: '',
        degree: '',
        undercarriage: '',
        description: '',
        userId: '',
        typeId: ''
      },
      options: [{
        value: '全新',
        label: '全新'
      }, {
        value: '九成新',
        label: '九成新'
      }, {
        value: '八成新',
        label: '八成新'
      }, {
        value: '七成新',
        label: '七成新'
      }, {
        value: '六成新',
        label: '六成新'
      }, {
        value: '五成新',
        label: '五成新'
      }],
      dataRule: {
        name: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        number: [
          { required: true, message: '商品数量不能为空', trigger: 'blur' }
        ],
        typeId: [
          { required: true, message: '商品类型不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init () {
      Promise.all([
        this.getTypeList()
      ]).then(() => {
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.getInfo()
          }
        })
      })
    },
    // 上传图片
    uploadImage (param) {
      // FormData 对象
      var form = new FormData()
      // 文件对象
      form.append('file', param.file)
      this.$http.post(
        `${window.SITE_CONFIG['baseURL']}/api/image/upload`,
        form
      ).then(({data}) => {
        if (data && data.code === 200) {
          this.dataForm.imageUrl = data.data.imageUrl
          this.dataForm.imageName = data.data.name
          this.$message({
            message: '上传成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: '上传失败',
            type: 'error'
          })
        }
      })
    },
    handleRemove (file, fileList) {
      console.log(file, fileList)
      this.dataForm.imageUrl = ''
      this.dataForm.imageName = ''
    },
    // 查看上传了的图片
    handlePreview (file) {
      console.log(file)
      this.dataForm.imageUrl = file.imageUrl
      this.dialogVisible = true
    },
    // 获取类型列表
    getTypeList () {
      return this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/goodstype`).then(({data}) => {
        if (data && data.code === 200) {
          this.typeList = data.data || []
        }
      })
    },
    // 获取信息
    getInfo () {
      this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/goodses/${this.dataForm.id}`).then(({data}) => {
        if (data && data.code === 200) {
          this.dataForm.goodsCode = data.data.goodsCode
          this.dataForm.name = data.data.name
          this.dataForm.originalPrice = data.data.originalPrice
          this.dataForm.price = data.data.price
          this.dataForm.number = data.data.number
          this.dataForm.imageUrl = data.data.imageUrl
          this.dataForm.imageName = data.data.imageName
          this.dataForm.degree = data.data.degree
          this.dataForm.undercarriage = data.data.undercarriage
          this.dataForm.description = data.data.description
          this.dataForm.userId = data.data.userId
          this.dataForm.typeId = data.data.typeId
        }
      })
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dataForm.id === 0) {
            this.$http.post(
              `${window.SITE_CONFIG['baseURL']}/api/goodses/`,
              {
                'id': this.dataForm.id,
                'name': this.dataForm.name,
                'originalPrice': this.dataForm.originalPrice,
                'price': this.dataForm.price,
                'number': this.dataForm.number,
                'imageName': this.dataForm.imageName,
                'degree': this.dataForm.degree,
                'undercarriage': 0,
                'auditStatus': 1,
                'description': this.dataForm.description,
                'typeId': this.dataForm.typeId
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
              `${window.SITE_CONFIG['baseURL']}/api/goodses/${this.dataForm.id}`,
              {
                'id': this.dataForm.id,
                'goodsCode': this.dataForm.goodsCode,
                'name': this.dataForm.name,
                'originalPrice': this.dataForm.originalPrice,
                'price': this.dataForm.price,
                'number': this.dataForm.number,
                'imageName': this.dataForm.imageName,
                'degree': this.dataForm.degree,
                'undercarriage': this.dataForm.undercarriage,
                'description': this.dataForm.description,
                'typeId': this.dataForm.typeId
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
