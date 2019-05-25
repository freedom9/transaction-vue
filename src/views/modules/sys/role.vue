<template>
  <div class="mod-sys__role">
    <el-form :inline="true" :model="dataForm">
      <el-form-item>
        <el-button v-if="$hasPermission('sys:role:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-if="$hasPermission('sys:role:update')" type="primary" @click="addOrUpdateHandle(dataListSelections[0].id)" :disabled="dataListSelections.length !== 1">修改</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-if="$hasPermission('sys:role:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
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
        label="角色名">
      </el-table-column>
      <el-table-column
        prop="description"
        header-align="center"
        align="center"
        :show-overflow-tooltip="true"
        label="描述">
      </el-table-column>
       <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="120"
        label="操作">
        <template slot-scope="scope">
          <el-button v-if="$hasPermission('sys:menu:list')" type="info" size="small" @click="selectMenus(scope.row.id)">查看菜单</el-button>
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
    <!-- 弹窗, 查看菜单 -->
    <select-menus v-if="selectMenusVisible" ref="selectMenus"></select-menus>
  </div>
</template>

<script>
import AddOrUpdate from './role-add-or-update'
import SelectMenus from './role-select-menus'
export default {
  data () {
    return {
      dataForm: {
        name: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      selectMenusVisible: false
    }
  },
  components: {
    AddOrUpdate,
    SelectMenus
  },
  activated () {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http.get(
        `${window.SITE_CONFIG['baseURL']}/api/sys/roles`,
        {
          params: {
            'current': this.pageIndex,
            'pageSize': this.pageSize,
            'name': this.dataForm.name
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
    // 查看菜单
    selectMenus (id) {
      this.selectMenusVisible = true
      this.$nextTick(() => {
        this.$refs.selectMenus.dataForm.id = id
        this.$refs.selectMenus.init()
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
          `${window.SITE_CONFIG['baseURL']}/api/sys/roles/delete`,
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
