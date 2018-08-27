<template>
  <div class="Feedback">
    <!-- 搜索条件开始 -->
    <el-container style="margin-bottom:10px;">
      <el-input placeholder="包含所有关键词(以空格区分)" v-model="searchParam.titleMust" size="small" clearable class="ml20 noMl"></el-input>
      <el-input placeholder="包含任意关键词(以空格区分)" v-model="searchParam.titleCan" size="small" clearable class="ml20"></el-input>
      <el-input placeholder="不包含任意关键词(以空格区分)" v-model="searchParam.titleNot" size="small" clearable class="ml20"></el-input>
      <el-select multiple collapse-tags clearable size="small" v-model="searchParam.stock_code" placeholder="公司代码、简称、拼音" filterable class="ml20">
        <el-option v-for='item in topData.companyCode' :key="item.Company_Name+'('+item.Company_Code+')'" :label="item.Company_Name+'('+item.Company_Code+')'" :value="item.Company_Code"></el-option>
      </el-select>
    </el-container>
    <el-container style="margin-bottom:10px;">
      <el-select collapse-tags clearable size="small" placeholder="所属板块" v-model="searchParam.template" filterable class="ml20 noMl">
        <el-option v-for='item in topData.bankuai' :key="item.Value" :label="item.Text" :value="item.Value"></el-option>
      </el-select>
      <el-select collapse-tags clearable size="small" v-model="searchParam.reply_status" placeholder="回复状态" filterable class="ml20">
        <el-option v-for='item in topData.replyStatus' :key="item.code" :label="item.status" :value="item.code"></el-option>
      </el-select>
      <el-date-picker type="daterange" v-model="searchParam.time" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="ml20"></el-date-picker>
      <div class="ml20">
        <el-button type="primary" icon="el-icon-search" size="small" @click="getList(1)">搜索</el-button>
        <el-button type="warning" size="small" @click="clearParam">清空搜索</el-button>
      </div>
    </el-container>
    <!-- 搜索条件结束 -->

    <!-- 表格数据开始 -->
    <el-table v-loading="zLoading" element-loading-text="拼命加载中" :height="dataHeight" :data="tableData" stripe style="width: 100%;" empty-text=" " row-key="id">
      <el-table-column type="index" fixed="left" label="序号" width="70" :index="typeIndex">序号</el-table-column>
      <el-table-column fixed="left" prop="Company_Code" label="证券代码" width="150"></el-table-column>
      <el-table-column prop="Company_Name" label="证券简称" width="150"></el-table-column>
      <el-table-column prop="Letter_TypeValue" label="问询类型" width="150"></el-table-column>
      <el-table-column prop="Letter_ContentName" label="函件内容">
        <template slot-scope="scope">
          <span style="color: #0d308c; cursor: pointer; font" @click="showWord(scope.row.Letter_Content)">{{ scope.row.Letter_ContentName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="Company_ReplyName" label="公司回复">
        <template slot-scope="scope">
          <span style="color: #0d308c; cursor: pointer; font" @click="showPDF(scope.row.Company_Reply)">{{ scope.row.Company_ReplyName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="SendDate" width="150" label="发函日期"></el-table-column>
    </el-table>
    <!-- 表格数据结束 -->

    <!--分页开始-->
    <div style="margin-top: 10px;height: 32px; line-height: 32px; text-align: center;">
      <span style="float: left; text-align: right; color: #606266; font-size: 14px; padding-top: 3px;">共 {{ zPager.total }} 条</span>
      <el-pagination layout="prev, pager, next" :page-size="zPager.size" :pager-count="zPager.count" :current-page.sync="zPager.currentPage" :total="zPager.total" @current-change="pagerChange">
      </el-pagination>
    </div>
    <!--分页结束-->

    <!--dialog开始-->
    <el-dialog :visible.sync="zDialog" fullscreen :before-close="beforeClose">
      <div class="dialog-box" v-loading="zLoadings" style="margin:0 auto;">
        <iframe v-if="showWordUrl" :src="showWordUrl" width="80%" :height="dataHeight" frameborder="0" style="margin-left:10%;"></iframe>
        <iframe  v-if="pdfUrl" :src="pdfUrl" frameborder="0" :height="dataHeight"  style="width:100%;margin-top:10px;"></iframe>
        <!-- <pdf v-if="pdfUrl" :src="pdfUrl" v-for="i in numPages" @loaded="pdfLoaded"  :key="i"  :page="i"  style="display: inline-block; width: 40%;margin-left:30%;"></pdf> -->
      </div>
    </el-dialog>
    <!--dialog结束-->
  </div>
</template>
<script>
import pdf from 'vue-pdf'
var loadingTask = pdf.createLoadingTask('https://cdn.mozilla.net/pdfjs/tracemonkey.pdf')
export default {
  name: 'Feedback',
  data () {
    return {
      dataHeight: document.documentElement.clientHeight - 135,
      zDialog: false,
      zLoading: false,
      zLoadings: false,
      showWordUrl: '',
      pdfUrl: loadingTask,
      numPages: undefined,
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
        bankuai: [],
        replyStatus: [{ 'status': '全部', 'code': 0 }, { 'status': '已回复', 'code': 1 }, { 'status': '未回复', 'code': 2 }],
        companyCode: []
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
  components: {
    pdf
  },
  methods: {
    closeModel () {
      this.zLoading = false
      this.zDialog = false
    },
    typeIndex (index) {
      return index + (this.zPager.currentPage - 1) * this.zPager.size + 1
    },
    clearParam () {
      for (var key in this.searchParam) {
        this.searchParam[key] = ''
      }
      this.searchParam.stock_code = []
      this.getList()
    },
    getList (flag) {
      this.zLoading = true
      var that = this
      var apiPath = ''
      if (flag) {
        that.getSearchParam()
        apiPath = that.apiPath + 'Regulatory_Letters/Pager/' + (this.searchParam.titleMust || '[]') + '/' + (this.searchParam.titleCan || '[]') + '/' + (this.searchParam.titleNot || '[]') + '/' + (this.searchParam.spliteStockCode || '[]') + '/' + (this.searchParam.send_unit || '[]') + '/' + (this.searchParam.reply_status || 0) + '/' + (this.searchParam.template || '[]') + '/' + (this.searchParam.processDateStart || '[]') + '/' + (this.searchParam.processDateEnd || '[]') + '/' + this.zPager.currentPage + '/' + this.zPager.size
      } else {
        apiPath = that.apiPath + 'Regulatory_Letters/Pager/' + that.zPager.currentPage + '/30'
      }
      that.$ajax.get(apiPath)
        .then(function (response) {
          that.zLoading = false
          var data = response.data.Result
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
    showPDF (urls) { // 展示pdf
      this.pdfUrl = urls
      this.zDialog = true
    },
    showWord (urls) { // 展示word
      this.showWordUrl = 'https://view.officeapps.live.com/op/view.aspx?src=' + urls
      this.zDialog = true
    },
    pdfLoaded () { // pdf加载完后清除loading
      this.zLoadings = false
    },
    beforeClose () { // 弹窗关闭之前清除数据
      this.pdfUrl = ''
      this.showWordUrl = ''
      this.zDialog = false
    },
    getTopData () {
      var that = this
      that.$ajax.get(that.apiPath + 'StockPlate')
        .then(function (response) {
          var data = response.data.Result.Data
          that.topData.bankuai = data
        })

      that.$ajax.get(that.apiPath + 'Regulatory_Letters_Company')
        .then(function (response) {
          var data = response.data.Result.Data
          that.topData.companyCode = data
        })
    },
    pagerChange () {
      this.getList(1)
    }
  },
  created () {
    this.getTopData()
    this.getList()
  },
  mounted () {
    const that = this
    window.onresize = () => {
      return (() => {
        that.dataHeight = document.documentElement.clientHeight - 135
      })()
    }
    if (this.pdfUrl) {
      this.pdfUrl.then(pdf => {
        this.numPages = pdf.numPages
      })
    }
  }

}
</script>
<style>
.dialog-box .el-loading-mask{
  width:40% !important;
  margin-left:30%;
  background-color:rgba(0,0,0,0);
  z-index:99999;
}
.noMl.ml20 {
  margin-left: 0px;
}
.ml20 {
  margin-left: 20px;
  width: 350px;
}
.Feedback .el-dialog {
  background-color: rgba(0, 0, 0, 0.3);
}
.Feedback .el-dialog__header {
  position: fixed;
  right: 10px;
}
.Feedback .el-dialog__headerbtn .el-dialog__close {
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
.Feedback .el-range__icon.el-icon-date {
  line-height: 0px;
}
.Feedback .el-range-separator {
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
#pop canvas {
  width: 100%;
  float: left;
}
.SupervisionType {
  width: 100%;
  padding: 0px;
  margin: 0px;
  overflow-x: hidden;
}
.SupervisionType,
.SupervisionType > section {
  height: 100%;
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
