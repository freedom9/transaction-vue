<template>
  <div class="mod-sys__message">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="onSearch()">
      <el-form-item>
        <el-input v-model="dataForm.sendUserName" placeholder="发送人" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.receiveUserName" placeholder="发送人" clearable></el-input>
      </el-form-item>
      <el-form-item>
          <el-button @click="onSearch()">查询</el-button>
      </el-form-item>
      <el-form-item>
          <el-button v-if="$hasPermission('sys:message:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
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
        prop="sendUserName"
        header-align="center"
        align="center"
        width="150"
        label="发送人">
      </el-table-column>
      <el-table-column
        prop="receiveUserName"
        header-align="center"
        align="center"
        width="150"
        label="接收人">
      </el-table-column>
      <el-table-column
        prop="content"
        header-align="center"
        align="center"
        :show-overflow-tooltip="true"
        label="消息内容">
      </el-table-column>
      <el-table-column
        prop="readStatus"
        header-align="center"
        align="center"
        width="80"
        label="阅读状态">
        <template slot-scope="scope">
          <span v-if="scope.row.readStatus === 0">未读</span>
          <span v-else-if="scope.row.readStatus === 1">已读</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="sendTime"
        header-align="center"
        align="center"
        width="160"
        label="发送时间">
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
 </div>
</template>

<script>
export default {
  data () {
    return {
      dataForm: {
        sendUserName: '',
        receiveUserName: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: []
    }
  },
  activated () {
    this.getDataList()
  },
  methods: {
    onSearch () {
      this.pageIndex = 1
      this.getDataList()
    },
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http.get(
        `${window.SITE_CONFIG['baseURL']}/api/messages`,
        {
          params: {
            'current': this.pageIndex,
            'pageSize': this.pageSize,
            'sendUserName': this.dataForm.sendUserName,
            'receiveUserName': this.dataForm.receiveUserName
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
    // 删除
    deleteHandle (id) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })
      this.$confirm(`确定对[id=${ids.join(',')}]进行[${ids.length === 1 ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.post(
          `${window.SITE_CONFIG['baseURL']}/api/messages/delete`,
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
