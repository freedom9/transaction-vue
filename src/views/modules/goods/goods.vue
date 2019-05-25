<template>
  <div class="mod-sys__goods">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.name" placeholder="商品名" clearable ></el-input>
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
        <el-select v-model="dataForm.undercarriage" clearable placeholder="下架状态" style="width:140px">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
          <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
      <el-form-item>
          <el-button v-if="$hasPermission('sys:goods:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
      </el-form-item>
      <el-form-item>
          <el-button v-if="$hasPermission('sys:goods:update')" type="primary" @click="addOrUpdateHandle(dataListSelections[0].id)" :disabled="dataListSelections.length !== 1">修改</el-button>
      </el-form-item>
      <el-form-item>
          <el-button v-if="$hasPermission('sys:goods:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量下架</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;">
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50">
      </el-table-column>
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
        prop="undercarriage"
        header-align="center"
        align="center"
        label="是否下架">
        <template slot-scope="scope">
          <span v-if="scope.row.undercarriage === 0">未下架</span>
          <span v-else-if="scope.row.undercarriage === 1">被动下架</span>
          <span v-else-if="scope.row.undercarriage === 2">主动下架</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="userName"
        header-align="center"
        align="center"
        label="发布人">
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
        width="100"
        label="操作">
        <template slot-scope="scope">
          <el-button v-if="$hasPermission('sys:goods:info')" type="info" size="small" @click="selectGoodsInfo(scope.row.id)">查看详情</el-button>
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
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
    <!-- 弹窗, 查看 -->
    <goods-info v-if="goodsInfoVisible" ref="goodsInfo" @refreshDataList="getDataList"></goods-info>
  </div>
</template>

<script>
import AddOrUpdate from './goods-add-or-update'
import GoodsInfo from './goods-info'
export default {
  data () {
    return {
      dataForm: {
        name: '',
        undercarriage: '',
        typeId: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      goodsInfoVisible: false,
      typeList: [],
      options: [{
        value: 0,
        label: '未下架'
      }, {
        value: 1,
        label: '被动下架'
      }, {
        value: 2,
        label: '主动下架'
      }]
    }
  },
  components: {
    AddOrUpdate,
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
            'undercarriage': this.dataForm.undercarriage,
            'typeId': this.dataForm.typeId,
            'auditStatus': 1
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
    // 多选
    selectionChangeHandle (val) {
      this.dataListSelections = val
    },
    // 新增 / 修改
    addOrUpdateHandle (id) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.dataForm.id = id || 0
        this.$refs.addOrUpdate.init()
      })
    },
    // 查看详情
    selectGoodsInfo (id) {
      this.goodsInfoVisible = true
      this.$nextTick(() => {
        this.$refs.goodsInfo.dataForm.id = id
        this.$refs.goodsInfo.init()
      })
    },
    // 下架
    deleteHandle (id) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })
      var names = name ? [name] : this.dataListSelections.map(item => {
        return item.name
      })
      this.$confirm(`确定对[${names.join(',')}]进行[${ids.length === 1 ? '商品下架' : '批量商品下架'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.post(
          `${window.SITE_CONFIG['baseURL']}/api/goodses/delete`,
          ids
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
