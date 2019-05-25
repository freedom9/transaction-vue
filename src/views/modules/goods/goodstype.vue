<template>
  <div class="mod-sys__goodstype">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
          <el-button v-if="$hasPermission('sys:goodstype:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
      </el-form-item>
      <el-form-item>
          <el-button v-if="$hasPermission('sys:goodstype:update')" type="primary" @click="addOrUpdateHandle(dataListSelections[0].id)" :disabled="dataListSelections.length === 0">修改</el-button>
      </el-form-item>
      <el-form-item>
          <el-button v-if="$hasPermission('sys:goodstype:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
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
        prop="name"
        header-align="center"
        align="center"
        width="200"
        label="商品类型名称">
      </el-table-column>
      <el-table-column
        prop="description"
        header-align="center"
        align="center"
        :show-overflow-tooltip="true"
        label="描述">
      </el-table-column>
    </el-table>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from './goodstype-add-or-update'
export default {
  data () {
    return {
      dataList: [],
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false
    }
  },
  components: {
    AddOrUpdate
  },
  activated () {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http.get(
        `${window.SITE_CONFIG['baseURL']}/api/goodstype`
      ).then(({data}) => {
        if (data && data.code === 200) {
          this.dataList = data.data
        } else {
          this.dataList = []
        }
        this.dataListLoading = false
      })
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
    // 删除
    deleteHandle (id) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })
      var names = name ? [name] : this.dataListSelections.map(item => {
        return item.name
      })
      this.$confirm(`确定对[${names.join(',')}]进行[${ids.length === 1 ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.post(
          `${window.SITE_CONFIG['baseURL']}/api/goodstype/delete`,
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
