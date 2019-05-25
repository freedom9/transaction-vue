<template>
  <div class="mod-sys__user">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="onSearch()">
      <el-form-item>
        <el-input v-model="dataForm.username" placeholder="用户名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="onSearch()">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-if="$hasPermission('sys:user:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-if="$hasPermission('sys:user:update')" type="primary" @click="addOrUpdateHandle(dataListSelections[0].id)" :disabled="dataListSelections.length !== 1">修改</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-if="$hasPermission('sys:user:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
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
        prop="username"
        header-align="center"
        align="center"
        width="150"
        label="用户名">
      </el-table-column>
      <el-table-column
        :formatter="rolesformatter"
        prop="roles"
        header-align="center"
        align="center"
        width="150"
        :show-overflow-tooltip="true"
        label="已有角色">
      </el-table-column>
      <el-table-column
        prop="sex"
        header-align="center"
        align="center"
        width="60"
        label="性别">
        <template slot-scope="scope">
          <span v-if="scope.row.sex === 0">女</span>
          <span v-else-if="scope.row.sex === 1">男</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="email"
        header-align="center"
        align="center"
        width="170"
        label="邮箱">
      </el-table-column>
      <el-table-column
        prop="mobile"
        header-align="center"
        align="center"
        width="120"
        label="手机号">
      </el-table-column>
      <el-table-column
        prop="school"
        header-align="center"
        align="center"
        width="120"
        :show-overflow-tooltip="true"
        label="学校">
      </el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="updateStatusHandle(scope.row)"
            :disabled="!$hasPermission('sys:user:update')">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column
        prop="address"
        header-align="center"
        align="center"
        width="120"
        :show-overflow-tooltip="true"
        label="地址">
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        width="160"
        label="创建时间">
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="100"
        label="操作">
        <template slot-scope="scope">
          <el-button v-if="$hasPermission('sys:user:info')" type="info" size="small" @click="selectUserInfo(scope.row.id)">查看详情</el-button>
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
    <user-info v-if="selectUserInfoVisible" ref="userInfo" @refreshDataList="getDataList"></user-info>
  </div>
</template>

<script>
import AddOrUpdate from './user-add-or-update'
import UserInfo from './user-info'
export default {
  data () {
    return {
      dataForm: {
        username: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      selectUserInfoVisible: false
    }
  },
  components: {
    AddOrUpdate,
    UserInfo
  },
  activated () {
    this.getDataList()
  },
  methods: {
    rolesformatter (row, column) {
      let arr = []
      if (row.id === 1) {
        arr.push('超级管理员')
      }
      row.roles.forEach(element => {
        arr.push(element.name)
      })
      return arr.join(';')
    },
    onSearch () {
      this.pageIndex = 1
      this.getDataList()
    },
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http.get(
        `${window.SITE_CONFIG['baseURL']}/api/sys/users`,
        {
          params: {
            'current': this.pageIndex,
            'pageSize': this.pageSize,
            'username': this.dataForm.username
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
    selectUserInfo (id) {
      this.selectUserInfoVisible = true
      this.$nextTick(() => {
        this.$refs.userInfo.dataForm.id = id
        this.$refs.userInfo.init()
      })
    },
    // 删除
    deleteHandle (id) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })
      var names = name ? [name] : this.dataListSelections.map(item => {
        return item.username
      })
      this.$confirm(`确定对[${names.join(',')}]进行[${ids.length === 1 ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.post(
          `${window.SITE_CONFIG['baseURL']}/api/sys/users/delete`,
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
    },
    // 修改状态
    updateStatusHandle (row) {
      this.$confirm(`确定对[${row.username}]的状态进行[${row.status ? '禁用' : '开启'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.post(
          `${window.SITE_CONFIG['baseURL']}/api/sys/users/status`,
          {
            'id': row.id,
            'status': row.status
          },
          {
            headers: { 'content-type': 'application/x-www-form-urlencoded' }
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
            row.status = Number(!row.status)
            this.$message.error(data.msg)
          }
        })
      }).catch(() => {
        row.status = Number(!row.status)
      })
    }
  }
}
</script>
