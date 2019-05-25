<template>
  <div class="mod-sys__goods">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.name" placeholder="商品名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.typeId" clearable placeholder="商品类型" style="width:140px">
          <el-option
            v-for="item in typeList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
          <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      style="width: 100%;">
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号">
      </el-table-column>
      <el-table-column
        prop="goodsCode"
        header-align="center"
        align="center"
        width="160"
        label="商品编名">
      </el-table-column>
      <el-table-column
        prop="name"
        header-align="center"
        align="center"
        width="120"
        label="商品名">
        <template slot-scope="scope">
          <a @click="selectGoodsInfo(scope.row.id)">{{ scope.row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column
        prop="typeName"
        header-align="center"
        align="center"
        width="100"
        label="商品类型">
      </el-table-column>
      <el-table-column
        prop="originalPrice"
        header-align="center"
        align="center"
        width="80"
        label="商品原价">
      </el-table-column>
      <el-table-column
        prop="price"
        header-align="center"
        align="center"
        width="80"
        label="商品价格">
      </el-table-column>
      <el-table-column
        prop="number"
        header-align="center"
        align="center"
        width="80"
        label="商品数量">
      </el-table-column>
       <el-table-column
        header-align="center"
        align="center"
        label="商品图片">
        <template slot-scope="scope" v-if="scope.row.imageUrl !== null">
          <img :src="scope.row.imageUrl" width="40" height="40" class="head_pic"/>
        </template>
      </el-table-column>
      <el-table-column
        prop="degree"
        header-align="center"
        align="center"
        width="80"
        label="新旧程度">
      </el-table-column>
      <el-table-column
        prop="userName"
        header-align="center"
        align="center"
        label="用户名">
      </el-table-column>
      <el-table-column
        prop="releaseTime"
        header-align="center"
        align="center"
        width="160"
        label="发布时间">
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="160"
        label="操作">
        <template slot-scope="scope">
          <el-button v-if="$hasPermission('sys:goods:check')" type="primary" size="small" @click="checkGoods(scope.row.id, 1)">通过</el-button>
          <el-button v-if="$hasPermission('sys:goods:check')" type="primary" size="small" @click="checkGoods(scope.row.id, 2)">不通过</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 查看 -->
    <goods-info v-if="goodsInfoVisible" ref="goodsInfo" @refreshDataList="getDataList"></goods-info>
 </div>
</template>

<script>
import GoodsInfo from './goods-info'
export default {
  data () {
    return {
      dataForm: {
        name: '',
        typeId: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      goodsInfoVisible: false,
      typeList: []
    }
  },
  components: {
    GoodsInfo
  },
  activated () {
    this.getDataList()
    this.getTypeList()
  },
  methods: {
    // 获取类型列表
    getTypeList () {
      return this.$http.get(`${window.SITE_CONFIG['baseURL']}/api/goodstype`).then(({data}) => {
        if (data && data.code === 200) {
          this.typeList = data.data || []
        }
      })
    },
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http.get(
        `${window.SITE_CONFIG['baseURL']}/api/goodses`,
        {
          params: {
            'current': this.pageIndex,
            'pageSize': this.pageSize,
            'name': this.dataForm.name,
            'auditStatus': 0,
            'typeId': this.dataForm.typeId
          }
        }
      ).then(({data}) => {
        if (data && data.total > 0) {
          this.dataList = data.records
          this.totalPage = data.total
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })
    },
    // 每页数
    sizeChangeHandle (val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },
    // 当前页
    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    },
    // 查看详情
    selectGoodsInfo (id) {
      this.goodsInfoVisible = true
      this.$nextTick(() => {
        this.$refs.goodsInfo.dataForm.id = id
        this.$refs.goodsInfo.init()
      })
    },
    // 审核
    checkGoods (id, auditStatus) {
      this.$confirm(`确定[${auditStatus === 1 ? '通过' : '不通过'}]审批?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.get(
          `${window.SITE_CONFIG['baseURL']}/api/goodses/auditStatus`,
          {
            params: {
              'id': id,
              'auditStatus': auditStatus
            }
          }
        ).then(({data}) => {
          if (data && data.code === 200) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList()
              }
            })
          } else {
            this.$message.error(data.msg)
          }
        })
      }).catch(() => {})
    }
  }
}
</script>
