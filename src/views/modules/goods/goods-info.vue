<template>
  <el-dialog
    width="500px"
    title="查看商品详情"
    :visible.sync="visible">
    <el-form :model="dataForm" ref="dataForm" label-width="80px" disabled>
    <el-form-item label="商品编号" prop="goodsCode">
      <el-input v-model="dataForm.goodsCode" placeholder="商品编号"></el-input>
    </el-form-item>
    <el-form-item label="商品名称" prop="name">
      <el-input v-model="dataForm.name" placeholder="商品名称"></el-input>
    </el-form-item>
    <el-form-item label="商品类型" prop="typeId">
      <el-select size="small" v-model="dataForm.typeId" filterable clearable placeholder="请选择">
          <el-option
            v-for="type in typeList"
            :key="type.id"
            :label="type.name"
            :value="type.id">
          </el-option>
        </el-select>
    </el-form-item>
     <el-form-item label="商品原价" prop="originalPrice">
      <el-input v-model="dataForm.originalPrice" placeholder="商品原价"></el-input>
    </el-form-item>
    <el-form-item label="商品价格" prop="price">
      <el-input v-model="dataForm.price" placeholder="商品价格"></el-input>
    </el-form-item>
    <el-form-item label="商品数量" prop="number">
      <el-input v-model="dataForm.number" placeholder="商品数量"></el-input>
    </el-form-item>
    <el-form-item label="商品图片" prop="imageUrl">
      <el-upload
        class="avatar-uploader"
        action=""
        :show-file-list="false"
        :http-request="uploadImage"
        :on-preview="handlePreview"
        :on-remove="handleRemove">
        <img v-if="dataForm.imageUrl" :src="dataForm.imageUrl" class="avatar">
      </el-upload>
    </el-form-item>
    <el-form-item label="新旧程度" prop="degree">
      <el-select v-model="dataForm.degree" filterable allow-create default-first-option placeholder="请选择新旧程度">
      </el-select>
    </el-form-item>
    <el-form-item label="发布人" prop="userName">
      <el-input v-model="dataForm.userName" placeholder="发布人"></el-input>
    </el-form-item>
    <el-form-item label="发布时间" prop="releaseTime">
      <el-input v-model="dataForm.releaseTime" placeholder="发布时间"></el-input>
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
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      visible: false,
      fileList: [],
      typeList: [],
      dataForm: {
        id: 0,
        goodsCode: '',
        name: '',
        originalPrice: '',
        price: '',
        number: '',
        imageUrl: '',
        degree: '',
        undercarriage: '',
        releaseTime: '',
        description: '',
        userId: '',
        typeId: '',
        userName: ''
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
    handleRemove (file, fileList) {
      console.log(file, fileList)
    },
    handlePreview (file) {
      console.log(file)
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
          this.dataForm.releaseTime = data.data.releaseTime
          this.dataForm.description = data.data.description
          this.dataForm.userId = data.data.userId
          this.dataForm.typeId = data.data.typeId
          this.dataForm.userName = data.data.userName
        }
      })
    }
  }
}
</script>
