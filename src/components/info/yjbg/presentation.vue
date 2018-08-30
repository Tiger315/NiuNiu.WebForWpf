<template>
  <div class="Presentation">
    <!-- 搜索条件开始 -->
    <el-container style="margin-bottom:10px;padding:0 20% 0 0;">
      <el-input placeholder="包含所有关键词(以空格区分)" v-model="searchParam.titleMust" size="small" clearable class="ml20 noMl"></el-input>
      <el-input placeholder="包含任意关键词(以空格区分)" v-model="searchParam.titleCan" size="small" clearable class="ml20"></el-input>
      <el-input placeholder="不包含任意关键词(以空格区分)" v-model="searchParam.titleNot" size="small" clearable class="ml20"></el-input>
    </el-container>
    <el-container style="margin-bottom:10px;padding:0 20% 0 0;">
      <el-select multiple collapse-tags clearable size="small" v-model="searchParam.stock_code" placeholder="公司代码、简称、拼音" filterable class="ml20 noMl">
        <el-option v-for='item in topData.companyCode' :key="item.Company_Name+'('+item.Company_Code+')'" :label="item.Company_Name+'('+item.Company_Code+')'" :value="item.Company_Code"></el-option>
      </el-select>
       <el-select collapse-tags clearable size="small" placeholder="研究机构" v-model="searchParam.template" filterable class="ml20">
        <el-option v-for='item in topData.yjjg' :key="item" :label="item" :value="item"></el-option>
      </el-select>
      <el-input placeholder="研报作者" v-model="searchParam.author" size="small" clearable class="ml20"></el-input>
    </el-container>
    <el-container style="margin-bottom:10px;padding:0 20% 0 0;">
      <el-date-picker style="width:400px;" type="daterange" v-model="searchParam.time" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="ml20 noMl"></el-date-picker>
      <el-select collapse-tags clearable size="small" v-model="searchParam.reply_status" placeholder="所有评级" filterable class="ml20">
        <el-option v-for='item in topData.replyStatus' :key="item.code" :label="item.status" :value="item.code"></el-option>
      </el-select>
      <div class="ml20">
        <el-button type="primary" icon="el-icon-search" size="small" @click="getList">搜索</el-button>
        <el-button type="warning" size="small" @click="clearParam">清空搜索</el-button>
      </div>
    </el-container>
    <!-- 搜索条件结束 -->
    <!-- 表格数据开始 -->
    <el-table v-loading.loading="loadingData.loading" element-loading-text="拼命加载中" :height="dataHeight" :data="tableData" stripe style="width: 100%;" empty-text=" " row-key="id">
      <el-table-column type="index" fixed="left" label="序号" width="70" :index="typeIndex">序号</el-table-column>
      <el-table-column fixed="left" prop="Title" label="研报标题" min-width="200" fit show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="Rate" label="股票评级" min-width="60" fit show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="Org" label="研究机构" width="150"></el-table-column>
      <el-table-column prop="Author" label="研报作者" width="150"></el-table-column>
      <el-table-column prop="ReportTime" label="发布日期" width="150"></el-table-column>
      <el-table-column prop="SendDate" width="150" label="操作">
        <template slot-scope="scope">
          <a style="color: #0d308c; cursor: pointer; text-decoration:none;" :href="scope.row.FileUrl" download>下载</a>
        </template>
      </el-table-column>
    </el-table>
    <!-- 表格数据结束 -->
    <!--分页开始-->
    <div style="margin-top: 10px;height: 32px; line-height: 32px; text-align: center;">
      <span style="float: left; text-align: right; color: #606266; font-size: 14px; padding-top: 3px;">共 {{ zPager.total }} 条</span>
      <el-pagination layout="prev, pager, next" :page-size="zPager.size" :pager-count="zPager.count" :current-page.sync="zPager.currentPage" :total="zPager.total" @current-change="pagerChange">
      </el-pagination>
    </div>
    <!--分页结束-->

  </div>
</template>
<script>
export default {
  name: 'Presentation',
  data () {
    return {
      dataHeight: document.documentElement.clientHeight - 177,
      loadingData: {
        loading: false
      },
      searchParam: {
        time: '',
        titleMust: '', // 必含关键词
        titleCan: '', // 可含关键词
        titleNot: '', // 不含关键词
        stock_code: [], // 公司代码
        spliteStockCode: '',
        send_unit: '', // 发文单位
        reply_status: '', // 回复状态
        template: '', // 所属板块
        processDateStart: '', // 起始时间
        processDateEnd: '' // 结束时间
      },
      topData: {
        yjjg: [
          '安信证券',
          '财富证券',
          '东北证券',
          '东方财富证券',
          '东方证券',
          '东海证券',
          '东莞证券',
          '富盛投顾',
          '广发证券',
          '广证恒生',
          '国金证券',
          '国信证券',
          '恒泰证券',
          '宏信证券',
          '华创证券',
          '华泰证券',
          '联储证券',
          '莫尼塔投资',
          '平安证券',
          '山西证券',
          '上海证券',
          '西南证券',
          '信达证券',
          '兴业证券',
          '招商证券',
          '中泰证券',
          '中投证券',
          '中银国际证券',
          '中原证券'
        ]
      },
      tableData: [],
      zPager: {
        total: 0,
        size: 30,
        count: 11,
        currentPage: 1
      }
    }
  },
  methods: {
    typeIndex (index) {
      return index + (this.zPager.currentPage - 1) * this.zPager.size + 1
    },
    clearParam () {
      for (let key in this.searchParam) {
        this.searchParam[key] = ''
      }
      this.searchParam.stock_code = []
      this.getList()
    },
    getList () {
      this.loadingData.loading = true
      let that = this
      that.getSearchParam()
      let apiPath = ''
      // apiPath = that.apiPath + 'Regulatory_Letters/Pager/' + (this.searchParam.titleMust || '[]') + '/' + (this.searchParam.titleCan || '[]') + '/' + (this.searchParam.titleNot || '[]') + '/' + (this.searchParam.spliteStockCode || '[]') + '/' + (this.searchParam.send_unit || '[]') + '/' + (this.searchParam.reply_status || 0) + '/' + (this.searchParam.template || '[]') + '/' + (this.searchParam.processDateStart || '[]') + '/' + (this.searchParam.processDateEnd || '[]') + '/' + this.zPager.currentPage + '/' + this.zPager.size
      let titleMust = (this.searchParam.titleMust && encodeURI(this.searchParam.titleMust)) || '[]'// 包含所有关键字
      let titleCan = (this.searchParam.titleCan && encodeURI(this.searchParam.titleCan)) || '[]'// 可以包含关键字
      let titleNot = (this.searchParam.titleNot && encodeURI(this.searchParam.titleNot)) || '[]' // 不包含任意关键字
      apiPath = that.apiPath + 'Yjbg/' + titleMust + '/' + titleCan + '/' + titleNot + '/' + this.zPager.currentPage + '/' + this.zPager.size
      that.$ajax.get(apiPath)
        .then(function (response) {
          that.loadingData.loading = false
          let data = response.data.Result
          that.tableData = data.Data
          that.zPager.total = data.Total
        })
    },
    getSearchParam () {
      // 获取查询的参数
      // 处理开始结束时间
      this.searchParam.processDateStart = this.searchParam.time && this.dealDate(this.searchParam.time[0]) // 开始时间
      this.searchParam.processDateEnd = this.searchParam.time && this.dealDate(this.searchParam.time[1]) // 结束时间
      // 处理公司代码
      if (this.searchParam && this.searchParam.stock_code) {
        this.searchParam.stock_code.length > 1 ? this.searchParam.spliteStockCode = this.searchParam.stock_code.join(',') : this.searchParam.spliteStockCode = this.searchParam.stock_code[0]
      } else {
        this.searchParam.spliteStockCode = ''
      }
    },
    getTopData () {
      let that = this
      that.$ajax.get(that.apiPath + 'StockPlate')
        .then(function (response) {
          let data = response.data.Result.Data
          that.topData.bankuai = data
        })

      that.$ajax.get(that.apiPath + 'Regulatory_Letters_Company')
        .then(function (response) {
          let data = response.data.Result.Data
          that.topData.companyCode = data
        })
    },
    pagerChange () {
      this.getList()
    }
  },
  created () {
    this.getTopData()
    this.getList()
  },
  mounted () {
    let that = this
    window.onresize = () => {
      return (() => {
        that.dataHeight = document.documentElement.clientHeight - 177
      })()
    }
  }

}
</script>
<style>
.dialog-box .el-loadingData.loading-mask {
  width: 40% !important;
  margin-left: 30%;
  background-color: rgba(0, 0, 0, 0);
  z-index: 99999;
}
.noMl.ml20 {
  margin-left: 0px;
}
.ml20 {
  margin-left: 20px;
  width: 400px;
}
.Presentation .el-dialog {
  background-color: rgba(0, 0, 0, 0.3);
}
.Presentation .el-dialog__header {
  position: fixed;
  right: 10px;
}
.Presentation .el-dialog__headerbtn .el-dialog__close {
  color: #fff !important;
  font-size: 18px;
}
.el-input__inner {
  height: 32px;
  line-height: 32px;
}
.el-input__icon {
  line-height: 32px;
}
.el-aside.left {
  border-right: 1px solid #f2f4f7;
  box-sizing: border-box;
}
.Presentation .el-range__icon.el-icon-date {
  line-height: 0px;
}
.Presentation .el-range-separator {
  line-height: 25px !important;
}
</style>

<style scoped>
.downLoad {
  position: fixed;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: block;
  left: 10px;
  top: 10px;
  text-decoration: none;
}
.downLoad > p {
  margin: 0px;
  font-size: 12px;
}
.showPDF {
  justify-content: center !important;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title {
  margin-left: 8px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
  line-height: 36px;
  font-weight: 700;
}
.el-container {
  justify-content: left;
}
</style>
